import { compose, join, map, prop, reduce, reverse } from 'ramda';
import { cursorAfterWidgetHtml, moveCursorAfterFocusedWidget,
  setCursorBookmark } from './cursor';
import reorderCitations from './reorder-citations';
import store from '../store/store';

declare var $: any;

const cloneJqueryObject = $obj => $('<div/>').html($obj[0].outerHTML).contents();

const getHtmlWithoutWidgetMarkup = (theHtml, editor) => (
  editor.dataProcessor.toDataFormat(theHtml, { context: 'p' })
);

const childNodesOf = content => (content && content.contents()) || [];
const childNodesOfReverse = content => childNodesOf(content).reverse();

const getChildNodesOf = $contents => (
  childNodesOf($contents).map((_, val) => $(val))
);

const reduceChildNodesUpToFootnoteMarkerOr = bracketPattern => (acc, val) => {
  if (!acc['fin']) {
    if (val.find('[data-widget=footnotemarker]').length) {
      acc['fin'] = true;
    } else {
      acc.acc.push(val);
      if (val.text().match(bracketPattern)) acc['fin'] = true;
    }
  }
  return acc;
};

const getChildNodesUpToBracket =
opts => ($contentsChildren: any[] = [], bracketChar: string) => {
  const bracketPattern = new RegExp(`\\${bracketChar}`, 'g');
  const reducer = opts['reverse'] ?
  compose(
    reverse,
    prop('acc'),
    reduce(reduceChildNodesUpToFootnoteMarkerOr(bracketPattern), { acc: [] }),
    reverse) :
  compose(
    prop('acc'),
    reduce(reduceChildNodesUpToFootnoteMarkerOr(bracketPattern), { acc: [] }));
  return reducer($contentsChildren);
};

const getChildNodesBefore1stWidgetUpToOpenBracket =
($contentsChildren = [], bracketChar) => (
  getChildNodesUpToBracket({})($contentsChildren, bracketChar)
);

const getChildNodesAfterLastWidgetUpToCloseBracket =
($contentsChildren = [], bracketChar) => (
  getChildNodesUpToBracket({ reverse: true })($contentsChildren, bracketChar)
);

const getNodeContent = el => el[0].nodeType === 3 ? el[0].data : el[0].outerHTML;
const joinNodesToHtmlString = compose(join(''), map(getNodeContent));

const contentExistsBefore1stWidget = content => content.trim() !== '(';
const contentExistsAfterLastWidget = content => content.trim() !== ')';
const contentExistsBefore1stAutonumWidget = content => content.trim() !== '[';
const contentExistsAfterLastAutonumWidget = content => content.trim() !== ']';

const removeContentsUpToAndReplaceWith =
replaceWith => toIndex => (i, el) => {
  if (i >= toIndex) {
    $(el).replaceWith(replaceWith);
    return false;
  }
  $(el).remove();
};

const removeChildNodesBeforeBracket =
bracketChar => ($contents, $nodesToRemove) => {
  childNodesOf($contents)
  .each(removeContentsUpToAndReplaceWith(bracketChar)($nodesToRemove.length - 1));
};

const removeChildNodesAfterBracket =
bracketChar => ($contents, $nodesToRemove) => {
  childNodesOfReverse($contents)
  .each(removeContentsUpToAndReplaceWith(bracketChar)($nodesToRemove.length - 1));
};

const moveTextOutsideBracketsOutOfDataInlineCitEls = (editor, $contents) => {
  $contents.find('[data-inline-cit]').each(function () {
    const $this = $(this);
    const $thisModified = cloneJqueryObject($this);
    const $thisModifiedChildren = getChildNodesOf($thisModified);
    const $moveToBefore =
    getChildNodesBefore1stWidgetUpToOpenBracket($thisModifiedChildren, '(');
    let moveToBeforeContent = joinNodesToHtmlString($moveToBefore);
    const $moveToAfter =
    getChildNodesAfterLastWidgetUpToCloseBracket($thisModifiedChildren, ')');
    let moveToAfterContent = joinNodesToHtmlString($moveToAfter);
    contentExistsBefore1stWidget(moveToBeforeContent) ?
      removeChildNodesBeforeBracket('(')($thisModified, $moveToBefore) :
      moveToBeforeContent = '';
    contentExistsAfterLastWidget(moveToAfterContent) ?
      removeChildNodesAfterBracket(')')($thisModified, $moveToAfter) :
      moveToAfterContent = '';
    if (moveToBeforeContent.length || moveToAfterContent.length) {
      $this.replaceWith(
        moveToBeforeContent
        .replace(/\([\s\u0000\u0007\u0008\u001A\u001B\u007F\u200B-\u200F\uFEFF]*$/g, '') +
        getHtmlWithoutWidgetMarkup($thisModified[0].outerHTML, editor) +
        moveToAfterContent
        .replace(/^[\s\u0000\u0007\u0008\u001A\u001B\u007F\u200B-\u200F\uFEFF]*\)/g, ''));
    }
  });
};

const moveTextOutsideBracketsOutOfDataInlineCitAutonumEls = (editor, $contents) => {
  $contents.find('[data-inline-cit-autonum]').each(function () {
    const $this = $(this);
    const $thisModified = cloneJqueryObject($this);
    const $thisModifiedChildren = getChildNodesOf($thisModified);
    const $moveToBefore =
    getChildNodesBefore1stWidgetUpToOpenBracket($thisModifiedChildren, '[');
    let moveToBeforeContent = joinNodesToHtmlString($moveToBefore);
    const $moveToAfter =
    getChildNodesAfterLastWidgetUpToCloseBracket($thisModifiedChildren, ']');
    let moveToAfterContent = joinNodesToHtmlString($moveToAfter);
    contentExistsBefore1stAutonumWidget(moveToBeforeContent) ?
      removeChildNodesBeforeBracket('[')($thisModified, $moveToBefore) :
      moveToBeforeContent = '';
    contentExistsAfterLastAutonumWidget(moveToAfterContent) ?
      removeChildNodesBeforeBracket(']')($thisModified, $moveToAfter) :
      moveToAfterContent = '';
    if (moveToBeforeContent.length || moveToAfterContent.length) {
      $this.replaceWith(
        moveToBeforeContent
        .replace(/\[[\s\u0000\u0007\u0008\u001A\u001B\u007F\u200B-\u200F\uFEFF]*$/g, '') +
        getHtmlWithoutWidgetMarkup($thisModified[0].outerHTML, editor) +
        moveToAfterContent
        .replace(/^[\s\u0000\u0007\u0008\u001A\u001B\u007F\u200B-\u200F\uFEFF]*\]/g, ''));
    }
  });
};

const removeDataInlineCitElsThatArentMarkers = ($contents) => {
  $contents.find('[data-inline-cit]').each(function () {
    const $this = $(this);
    if (!$this.find('.sup[data-footnote-id]').length) {
      $this.replaceWith($this.html());
    }
  });
};

createFootnoteIfDoesntExist: function() {
    if (!_footnoteId) {
        _footnoteId = this.generateFootnoteId();
        _editor.fire('lockSnapshot');
        this.addFootnote(
            this.buildFootnote(
                _footnoteId, _footnote, _inlineCitation, _externalId));
        _editor.fire('unlockSnapshot');
    }
},

generateInlineCitationHtml: function() {
    _footnoteMarker = (_inlineCitation &&
        !_adjacentInlineCitationRef ?
            '<span data-inline-cit="' +
            this.getNextDataInlineCitNum() + '">' : '') +
        (!_inlineCitation &&
        !_adjacentInlineCitationAutonumRef ?
            '<span data-inline-cit-autonum="' +
            this.getNextDataInlineCitAutonumNum() + '">' : '') +
        (_inlineCitation &&
        !_adjacentInlineCitationRef ? '(' : '') +
        (!_inlineCitation &&
        !_adjacentInlineCitationAutonumRef ? '[' : '') +
        '<span class="sup" data-citation="'+_footnote+
        '" data-footnote-id="' + _footnoteId +
        '"'+
        ' data-citation-modified="'+_footnote+'"' +
        (_inlineCitation ?
            ' data-inline-citation="'+_inlineCitation+'"' :
            '') +
        (_externalId && _externalId.toString().length ?
            ' data-ext-id="'+_externalId+'"' :
            '') + '>X</span>' +
        (_inlineCitation && !_adjacentInlineCitationRef ? ')' : '') +
        (!_inlineCitation && !_adjacentInlineCitationAutonumRef ? ']' : '') +
        (_inlineCitation && !_adjacentInlineCitationRef ? '</span>' : '') +
        (!_inlineCitation && !_adjacentInlineCitationAutonumRef ? '</span>' : '');
},

getNextDataInlineCitNum: function() {
    var inlineCitNum = 0;
    //var $contents  = $(this.editor.editable().$);
    _$contents.find('[data-inline-cit]').each(function(){
        var tmpInlineCitNum = parseInt($(this).attr('data-inline-cit'));
        inlineCitNum = (tmpInlineCitNum > inlineCitNum ?
            tmpInlineCitNum : inlineCitNum);
    });
    return inlineCitNum + 1;
},

getNextDataInlineCitAutonumNum: function() {
    var inlineCitNum = 0;
    //var $contents  = $(this.editor.editable().$);
    _$contents.find('[data-inline-cit-autonum]').each(function(){
        var tmpInlineCitNum = parseInt($(this).attr('data-inline-cit-autonum'));
        inlineCitNum = (tmpInlineCitNum > inlineCitNum ?
            tmpInlineCitNum : inlineCitNum);
    });
    return inlineCitNum + 1;
},

insertInlineCitationAndFormat: function() {
    if (_adjacentInlineCitationRef)
        this.insertInlineCitationWithinAdjacentGroup();
    else if (_adjacentInlineCitationAutonumRef)
        this.insertInlineCitationAutonumWithinAdjacentGroup();
    else {
        var self = this;
        _$contents.find(_bookmarkSelector).each(function(){
            var $this = $(this);
            $this.replaceWith(
                _footnoteMarker +
                self.getHtmlWithoutWidgetMarkup(
                    $this[0].outerHTML)
            );
            return false;
        });
        this.moveCursorToCursorBookmark();
    }
    _$contents.find(".sup[data-footnote-id]").each(function(){
        if (!$(this).parent('.cke_widget_wrapper').length)
            _editor.widgets.initOn(
                new CKEDITOR.dom.element(this),
                'footnotemarker' );
    });
    this.updateInlineCitationDataAttrs();
},

insertInlineCitationWithinAdjacentGroup: function() {
    var inlineCitationsOrdered = [],
        newCitationAdded = false,
        $newFootnote = $(_footnoteMarker),
        inlineCitationText =
            $('<div>' + _inlineCitation + '</div>').text();
    _$contents
        .find('[data-inline-cit='+_adjacentInlineCitationRef+
            '] .sup[data-footnote-id]')
        .each(function() {
            var existingInlineCitationText =
                $('<div>' + $(this).attr('data-inline-citation') + '</div>').text();
            if (!newCitationAdded && inlineCitationText &&
                inlineCitationText < existingInlineCitationText) {
                inlineCitationsOrdered.push($newFootnote[0]);
                newCitationAdded = true;
            }
            inlineCitationsOrdered.push(this);
        });
    if (!newCitationAdded)
        inlineCitationsOrdered.push($newFootnote[0]);
    var $inlineCit = _$contents
        .find('[data-inline-cit='+_adjacentInlineCitationRef+']');
    $inlineCit.first()
        .html('(' +
            inlineCitationsOrdered
                .map(function(d){return d.outerHTML;}).join(', ') + ')');
},

insertInlineCitationAutonumWithinAdjacentGroup: function() {
    var inlineCitationsOrdered = [],
        $newFootnote = $(_footnoteMarker);
    _$contents
        .find('[data-inline-cit-autonum='+_adjacentInlineCitationAutonumRef+
            '] .sup[data-footnote-id]')
        .each(function() {
            inlineCitationsOrdered.push(this);
        });
    //if (!newCitationAdded)
    inlineCitationsOrdered.push($newFootnote[0]);
    var $inlineCit = _$contents
        .find('[data-inline-cit-autonum='+_adjacentInlineCitationAutonumRef+']');
    $inlineCit.first()
        .html('[' +
            inlineCitationsOrdered
                .map(function(d){return d.outerHTML;}).join(', ') + ']');
},

removeDuplicatedDataInlineCitAttributes: function() {
    var cnt = 1;
    while (true) {
        var $inlineCit = _$contents
                .find('[data-inline-cit='+cnt+']'),
            inlineCitCnt = 0;
        if ($inlineCit.length <= 0)
            break;
        $inlineCit.each(function(){
            if (inlineCitCnt > 0)
                $(this).removeAttr('data-inline-cit');
            inlineCitCnt++;
        });
        cnt++;
    }
},

updateInlineCitationDataAttrs: function() {
    this.removeDuplicatedDataInlineCitAttributes();
    _$contents = $(_editor.editable().$);
    _$contents.find('.sup[data-footnote-id]:contains(X)')
        .attr('data-citation', _footnote)
        .attr('data-citation-modified', _footnote);
    if (_inlineCitation)
        _$contents.find('.sup[data-footnote-id]:contains(X)')
            .attr('data-inline-citation', _inlineCitation);
},

const initInlineCitationAndFootnoteData =
(footnote, inlineCitation, externalId) {
  const footnoteCleansed =
  replaceQuotesWithPlaceholder(replaceDivWithSpan(footnote));
  const footnoteId = findFootnote(footnoteCleansed);
  const inlineCitationCleansed = inlineCitation ?
    compose(
      removeOuterBrackets,
      replaceQuotesWithPlaceholder,
      replaceDivWithSpan)(inlineCitation) : null;
  const adjacentInlineCitationRef = cursorTouchingInlineCitation();
  if (!adjacentInlineCitationRef) {
    const adjacentInlineCitationAutonumRef = cursorTouchingInlineCitationAutonum();
  }
},

const insert = (footnote, inlineCitation, externalId) => {
  const editor = store.get('editor');
  const $contents = store.get('contents');
  setCursorBookmark(editor, $contents);
  // if any sup widgets are currently focused, then place the cursor after them
  // effectively unselecting the widget this prevents overwriting the existing
  // widget. Have to use a dummy span, select this span then remove it -
  // couldnt find another way.
  if (editor.widgets.focused) {
    $(cursorAfterWidgetHtml)
    .insertAfter($(editor.widgets.focused.element.$).parent());
    moveCursorAfterFocusedWidget(editor, $contents);
  }

  removeDataInlineCitElsThatArentMarkers($contents);
  moveTextOutsideBracketsOutOfDataInlineCitEls(editor, $contents);
  moveTextOutsideBracketsOutOfDataInlineCitAutonumEls(editor, $contents);
  initInlineCitationAndFootnoteData(footnote, inlineCitation, externalId);
  createFootnoteIfDoesntExist();
  generateInlineCitationHtml();
  insertInlineCitationAndFormat();

  // create a dummy span so that below we can place the cursor after the inserted marker
  // allowing the user to continue typing after insert
  $(cursorAfterWidgetHtml).insertAfter(
    $contents
    .find('.sup[data-footnote-id]:contains(X)')
    .closest('[data-inline-cit' + (inlineCitation ? '' : 'autonum') + ']'));
  reorderCitations(editor);
  // select after the inserted marker widget s
  moveCursorAfterFocusedWidget(editor, $contents);
  editor.focus();
};

export default insert;
