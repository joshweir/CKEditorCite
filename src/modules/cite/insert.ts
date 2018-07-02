import { compose, contains, join, map, prop, reduce, reverse, toPairs } from 'ramda';
import buildFootnote from './build-footnote';
import { footnotesHeaderEls, footnotesPrefix,
  footnotesTitle } from '../ck-functional';
import { bookmarkSelector, cursorAfterWidgetHtml, cursorTouchingInlineCitation,
  moveCursorAfterFocusedWidget, moveCursorToCursorBookmark,
  setCursorBookmark } from './cursor';
import reorderCitations from './reorder-citations';
import store from '../store/store';
import { removeOuterBrackets, replaceDivWithSpan,
  replaceQuotesWithPlaceholder, revertQuotesPlaceholder } from './utils';

declare var CKEDITOR: any;
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

const removeDuplicatedDataInlineCitAttributes = ($contents) => {
  let cnt = 1;
  while (true) {
    const $inlineCit = $contents.find(`[data-inline-cit=${cnt}]`);
    if ($inlineCit.length <= 0) break;
    let inlineCitCnt = 0;
    $inlineCit.each((_, el) => {
      if (inlineCitCnt > 0) $(el).removeAttr('data-inline-cit');
      inlineCitCnt += 1;
    });
    cnt += 1;
  }
};

const updateInlineCitationDataAttrs =
$contents => (footnote, inlineCitation) => {
  removeDuplicatedDataInlineCitAttributes($contents);
  // $contents = $(_editor.editable().$);
  $contents.find('.sup[data-footnote-id]:contains(X)')
    .attr('data-citation', footnote)
    .attr('data-citation-modified', footnote);
  if (inlineCitation) {
    $contents.find('.sup[data-footnote-id]:contains(X)')
    .attr('data-inline-citation', inlineCitation);
  }
};

const insertInlineCitationWithinAdjacentGroup =
$contents =>
(footnoteMarker, inlineCitation, adjacentInlineCitationRef,
 inlineCitAttr = 'data-inline-cit') => {
  const inlineCitationsOrdered = [];
  let newCitationAdded = false;
  const $newFootnote = $(footnoteMarker);
  let inlineCitationText = null;
  if (inlineCitAttr === 'data-inline-cit') {
    inlineCitationText = $(`<div>${inlineCitation}</div>`).text();
  }
  $contents.find(`[${inlineCitAttr}=${adjacentInlineCitationRef}` +
  '] .sup[data-footnote-id]').each((_, el) => {
    if (inlineCitAttr === 'data-inline-cit') {
      const existingInlineCitationText =
      $(`<div>${$(el).attr('data-inline-citation')}</div>`).text();
      if (!newCitationAdded && inlineCitationText &&
        inlineCitationText < existingInlineCitationText) {
        inlineCitationsOrdered.push($newFootnote[0]);
        newCitationAdded = true;
      }
    }
    inlineCitationsOrdered.push(el);
  });
  if (!newCitationAdded) inlineCitationsOrdered.push($newFootnote[0]);
  const $inlineCit = $contents.find(`[${inlineCitAttr}=${adjacentInlineCitationRef}]`);
  const [openBracket, closeBracket] = inlineCitAttr === 'data-inline-cit' ?
    ['(', ')'] : ['[', ']'];
  $inlineCit.first()
  .html(
    `${openBracket}` +
    `${inlineCitationsOrdered.map(d => d.outerHTML).join(', ')}` +
    `${closeBracket}`);
};

const insertInlineCitationAndFormat =
(editor, $contents) =>
(footnote, footnoteMarker, adjacentInlineCitationRef,
 adjacentInlineCitationAutonumRef, inlineCitation) => {
  if (adjacentInlineCitationRef) {
    insertInlineCitationWithinAdjacentGroup($contents)(
      footnoteMarker, inlineCitation, adjacentInlineCitationRef,
      'data-inline-cit');
  } else if (adjacentInlineCitationAutonumRef) {
    insertInlineCitationWithinAdjacentGroup($contents)(
      footnoteMarker, inlineCitation, adjacentInlineCitationRef,
      'data-inline-cit-autonum');
  } else {
    $contents.find(bookmarkSelector).each((_, el) => {
      const $this = $(el);
      $this.replaceWith(footnoteMarker +
        getHtmlWithoutWidgetMarkup($this[0].outerHTML, editor));
      return false;
    });
    moveCursorToCursorBookmark(editor);
  }
  $contents.find('.sup[data-footnote-id]').each((_, el) => {
    if (!$(el).parent('.cke_widget_wrapper').length) {
      editor.widgets.initOn(
        new CKEDITOR.dom.element(el),
        'footnotemarker');
    }
  });
  updateInlineCitationDataAttrs($contents)(footnote, inlineCitation);
};

const getNextDataInlineCitNum = attr => ($contents) => {
  let inlineCitNum = 0;
  $contents.find(attr).each((_, el) => {
    const tmpInlineCitNum = parseInt($(el).attr(attr), 10);
    inlineCitNum = tmpInlineCitNum > inlineCitNum ?
      tmpInlineCitNum : inlineCitNum;
  });
  return inlineCitNum + 1;
};

const generateInlineCitationHtml = $contents =>
({ footnoteId, footnote, externalId, adjacentInlineCitationRef,
  adjacentInlineCitationAutonumRef, inlineCitation }) => (
  // _footnoteMarker =
  (inlineCitation && !adjacentInlineCitationRef ?
    '<span data-inline-cit="' +
    getNextDataInlineCitNum('[data-inline-cit]')($contents) + '">' : '') +
  (!inlineCitation && !adjacentInlineCitationAutonumRef ?
    '<span data-inline-cit-autonum="' +
    getNextDataInlineCitNum('[data-inline-cit-autonum]')($contents) + '">'
    : '') +
  (inlineCitation && !adjacentInlineCitationRef ? '(' : '') +
  (!inlineCitation && !adjacentInlineCitationAutonumRef ? '[' : '') +
  '<span class="sup" data-citation="' + footnote +
  '" data-footnote-id="' + footnoteId + '"' +
  ' data-citation-modified="' + footnote + '"' +
  (inlineCitation ? ' data-inline-citation="' + inlineCitation + '"' : '') +
  (externalId && externalId.toString().length ?
    ' data-ext-id="' + externalId + '"' : '') + '>X</span>' +
  (inlineCitation && !adjacentInlineCitationRef ? ')' : '') +
  (!inlineCitation && !adjacentInlineCitationAutonumRef ? ']' : '') +
  (inlineCitation && !adjacentInlineCitationRef ? '</span>' : '') +
  (!inlineCitation && !adjacentInlineCitationAutonumRef ? '</span>' : '')
);

const addFootnote = (editor, $contents) => (footnote, replace = false) => {
  const $footnotes = $contents.find('.footnotes');
  if ($footnotes.length <= 0) {
    const headerTitle =
    revertQuotesPlaceholder(
      $contents
      .find('.sup[data-footnotes-heading]')
      .attr('data-footnotes-heading')
      || footnotesTitle(editor));
    const [headerElO, headerElC] = footnotesHeaderEls(editor);
    const container = '<section class="footnotes"><header>' +
      headerElO + headerTitle + headerElC +
      '</header><ol>' + footnote + '</ol></section>';
    // Move cursor to end of content
    $contents.append(container);
    $contents.find('section.footnotes').each((_, el) => {
      if (!$(el).parent('.cke_widget_wrapper').length) {
        editor.widgets.initOn(
          new CKEDITOR.dom.element(el),
          'footnotes');
      }
    });
  } else {
    const $footnotesOl = $footnotes.find('ol');
    if (replace) $footnotesOl.html(footnote);
    else $footnotesOl.append(footnote);
  }
};

const generateFootnoteId = () => {
  const footnoteIds = store.get('footnoteIds');
  let id;
  do {
    id = String(Math.random().toString(36).substr(2, 5));
  } while (!contains(id, footnoteIds));
  footnoteIds.push(id);
  return id;
};

const createFootnoteIfDoesntExistFactory = (editor, $contents, prefix) =>
({ footnoteId, footnote, inlineCitation, externalId }) => {
  if (!footnoteId) {
    editor.fire('lockSnapshot');
    addFootnote(editor, $contents)(
      buildFootnote(
        prefix, generateFootnoteId(), footnote, inlineCitation, externalId));
    editor.fire('unlockSnapshot');
  }
};

const isFootnote = footnote => (acc, [k, v]) => (
  acc || (v === replaceQuotesWithPlaceholder(footnote) && k)
);

const findFootnote = (editor, footnote) => {
  if (!editor.footnotesStore) return null;
  return reduce(isFootnote(footnote), null, toPairs(editor.footnotesStore));
};

const initInlineCitationAndFootnoteDataFactory = (editor, $contents) =>
(footnote, inlineCitation, externalId, bookmarkSel) => {
  const footnoteCleansed =
  replaceQuotesWithPlaceholder(replaceDivWithSpan(footnote));
  const footnoteId = findFootnote(editor, footnoteCleansed);
  const inlineCitationCleansed = inlineCitation ?
    compose(
      removeOuterBrackets,
      replaceQuotesWithPlaceholder,
      replaceDivWithSpan)(inlineCitation) : null;
  const cursorTouchingInlineCit =
  cursorTouchingInlineCitation(bookmarkSel)($contents);
  const adjacentInlineCitationRef = cursorTouchingInlineCit('data-inline-cit');
  let adjacentInlineCitationAutonumRef;
  if (!adjacentInlineCitationRef) {
    adjacentInlineCitationAutonumRef =
    cursorTouchingInlineCit('data-inline-cit-autonum');
  }
  return { footnoteId, externalId, adjacentInlineCitationRef,
    adjacentInlineCitationAutonumRef, footnote: footnoteCleansed,
    inlineCitation: inlineCitationCleansed };
};

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
  const initInlineCitationAndFootnoteData =
  initInlineCitationAndFootnoteDataFactory(editor, $contents);
  const createFootnoteIfDoesntExist =
  createFootnoteIfDoesntExistFactory(editor, $contents, footnotesPrefix(editor));
  const footnoteData = initInlineCitationAndFootnoteData(
    footnote, inlineCitation, externalId, bookmarkSelector);
  const { adjacentInlineCitationRef, adjacentInlineCitationAutonumRef,
    inlineCitation: inlineCitationCleansed,
    footnote: footnoteCleansed } = footnoteData;
  createFootnoteIfDoesntExist(footnoteData);
  const footnoteMarker = generateInlineCitationHtml($contents)(footnoteData);
  insertInlineCitationAndFormat(editor, $contents)(
    footnoteCleansed, footnoteMarker, adjacentInlineCitationRef,
    adjacentInlineCitationAutonumRef, inlineCitationCleansed);

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
