import { compose, curry } from 'ramda';
import './styles/plugin.css';
import { init, editor } from './modules/ck-plugin';

declare var CKEDITOR: any;
declare var jQuery: any;
declare var $: any;


  // functional string utilities
  var replace = function (to, from, str) { return str.replace(from, to); };
  var replaceC = curry(replace);

  //dom element utilities
  var renameDOMElementInStr = function (to, from, str) {
    var fromOpenRegexp = new RegExp('<' + from, 'g');
    var toOpen = '<' + to;
    var fromCloseRegexp = new RegExp('<\/' + from, 'g');
    var toClose = '</' + to;
    var replaceOpenTags = replaceC(toOpen)(fromOpenRegexp);
    var replaceCloseTags = replaceC(toClose)(fromCloseRegexp);
    return compose(replaceCloseTags, replaceOpenTags)(str);
  }

  var replaceDivWithSpan = function (text) {
    return renameDOMElementInStr('span', 'div', text);
  };

  var _editor, _$contents, _footnote, _inlineCitation,
      _adjacentInlineCitationRef, _adjacentInlineCitationAutonumRef,
      _footnoteId, _footnoteMarker, _externalId,
      _footnoteIds = [],
      _reorderMarkersTsKey = 'reordering_markers',
      _bookmarkAttr = 'data-selection-bookmark',
      _bookmarkSelector = '[' + _bookmarkAttr + ']',
      _cursorAfterWidgetClass = 'dummyF',
      _cursorAfterWidgetSelector = 'span.' + _cursorAfterWidgetClass,
      _cursorAfterWidgetHtml = '<span class="'+ _cursorAfterWidgetClass +
          '">&nbsp;</span>';

  jQuery.fn.reverse = [].reverse;

  CKEDITOR.plugins.add('cite', {

    requires: 'widget,contextmenu,wysiwygarea,dialogui,dialog,' +
              'basicstyles,menu,contextmenu,floatpanel,panel',
    icons: 'cite',

    // The plugin initialization logic goes inside this method.
    init: function(ed) {
      init(ed);
      console.log('check!!!!', editor.get());

      // Check for jQuery
      // @TODO - remove if/when JQ dep. is removed.
      if (typeof(jQuery) === 'undefined') {
        console.warn('jQuery required but undetected so quitting cite.');
        return false;
      }
      // Allow `cite` to be editable:
      CKEDITOR.dtd.$editable['span'] = 1;
      _editor = ed;
      _editor.addContentsCss(this.path + 'styles/plugin.css');
      this.initWidgets();
      this.setupEditorEventHandlers();
    },

    initWidgets: function() {
        this.registerWidgets();
        this.addWidgetCommandsButtonsAndDialogs();
    },

    registerWidgets: function() {
        // Register the footnotes widget.
        _editor.widgets.add('footnotes', {
            // Minimum HTML which is required by this widget to work.
            requiredContent: 'section(footnotes)',
            // Check the elements that need to be converted to widgets.
            upcast: function(element) {
                return element.name === 'section' &&
                    element.hasClass('footnotes');
            },
            editables: this.retrieveFootnotesWidgetEditableElements(
                $('<div>' + _editor.element.$.textContent + '</div>')),
            draggable: false
        });

        // Register the inline citation widget.
        _editor.widgets.add('footnotemarker', {
            // Minimum HTML which is required by this widget to work.
            requiredContent: 'span[data-citation]',
            // Check the elements that need to be converted to widgets.
            upcast: function(element) {
                return element.classes.indexOf('sup') > -1 &&
                    element.attributes['data-footnote-id'] != 'undefined';
            },
            draggable: false
        });
    },

    retrieveFootnotesWidgetEditableElements: function(contents) {
        var def = {
                header: {
                    selector: 'header > *',
                    allowedContent: 'span[*](*); strong em sub sup;div[*](sup)'
                }
            },
            i = 1,
            prefix = _editor.config.footnotesPrefix ?
                '-' + _editor.config.footnotesPrefix : '';
        contents.find('.footnotes li').each(function(){
            def['footnote_' + i] = {
                selector: '#footnote' + prefix + '-' +
                $(this).attr('data-footnote-id') + ' .cite',
                allowedContent: 'a[href]; cite[*](*); span[*](*); strong em br i'
            };
            i++;
        });
        return def;
    },

    addWidgetCommandsButtonsAndDialogs: function() {
        // Define editor commands that open our dialogs
        _editor.addCommand('cite', new CKEDITOR.dialogCommand('citeDialog', {
            allowedContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*];div[*](sup)',
            requiredContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*];div[*](sup)'
        }));

        _editor.addCommand('intext_cite', new CKEDITOR.dialogCommand('intextCiteDialog', {
            allowedContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*];div[*](sup)',
            requiredContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*];div[*](sup)'
        }));

        // Create a toolbar button that executes the above command.
        _editor.ui.addButton('Cite', {
            // The text part of the button (if available) and tooptip.
            label: 'Insert Citation',
            // The command to execute on click.
            command: 'cite',
            // The button placement in the toolbar (toolbar group name).
            toolbar: 'insert'
        });

        // Register dialogs
        CKEDITOR.dialog.add('citeDialog',
            this.path + 'dialogs/cite.js');
        CKEDITOR.dialog.add('intextCiteDialog',
            this.path + 'dialogs/intext_cite.js');
    },

    setupEditorEventHandlers: function() {
        this.retrieveContentsAndReorderMarkersOnInstanceReady();
        this.moveCursorAfterFocusedWidgetOnEditorBlur();
        this.reorderMarkersOnEditorChange();
        this.updateMarkersWithCurrentCitationValuesOnEditorChange();
        this.invokeIntextCiteDialogOnDoubleClick();
        this.initMenuOnInstanceReady();
    },

    retrieveContentsAndReorderMarkersOnInstanceReady: function() {
        // Force a reorder on startup to make sure all vars are set: (e.g. footnotes store):
        var self = this;
        _editor.on('instanceReady', function(evt) {
            _$contents = $(_editor.editable().$);
            self.reorderMarkers('startup');
            _$contents = $(_editor.editable().$);
        });
    },

    moveCursorAfterFocusedWidgetOnEditorBlur: function() {
        //unselect any focused sup widgets if user clicks away from the editor, as if they then
        //going to insert a citation external to ckeditor, we dont want to overwrite any existing citation markers
        _editor.on('blur', function() {
            if (_editor.widgets.focused) {
                $(_cursorAfterWidgetHtml)
                    .insertAfter(
                        $(_editor.widgets.focused.element.$)
                            .parent());
                this.moveCursorAfterFocusedWidget();
            }
        });
    },

    reorderMarkersOnEditorChange: function() {
        var self = this, wto;
        // Add the reorder change event:
        _editor.on('change', function(evt) {
            clearTimeout(wto);
            wto = setTimeout(function() {
                var now = (new Date()).getTime().toString();
                //set a locally stored timestamp to prevent an endless loop when reordering markers below..
                if(!localStorage.getItem(_reorderMarkersTsKey))
                    localStorage
                        .setItem(_reorderMarkersTsKey, now);

                // Prevent no selection errors:
                if (!evt.editor.getSelection() ||
                    !evt.editor.getSelection().getStartElement())
                    return;

                if (self.editingAFootnote(evt))
                    return;

                if(localStorage.getItem(_reorderMarkersTsKey) === now) {
                    // SetTimeout seems to be necessary (it's used in the core but can't be 100% sure why)
                    setTimeout(function(){
                        self.reorderMarkers('change');
                    }, 0);
                }
                //prevent an endless loop of reorderingMarkers on change
                setTimeout(function() {
                    localStorage.removeItem(_reorderMarkersTsKey);
                }, 200);
            }, 1000);
        });
    },

    editingAFootnote: function(evt) {
        var footnoteSection =
            evt.editor
                .getSelection()
                .getStartElement()
                .getAscendant('section');
        return !!(footnoteSection &&
        footnoteSection.$.className.indexOf('footnotes') !== -1);
    },

    updateMarkersWithCurrentCitationValuesOnEditorChange: function() {
        var self = this;
        _editor.on('change', function(evt) {
            //store the current value of footnotes citations against
            //their inline citations as they may have been changed
            //by the user and will be needed when footnotes are rebuilt
            //get the current footnotes section header
            var $footnotesHeader =
                _$contents.find('.footnotes header h2').html();
            _$contents.find('.footnotes li .cite').each(function(){
                var $cite = $(this);
                var footnoteId = $(this).parent('li').attr('data-footnote-id');
                _$contents.find('.sup[data-footnote-id='+ footnoteId +']').each(function(){
                    $(this).attr('data-citation-modified',
                        self.replaceQuotesWithPlaceholder($cite.html()));
                    if ($footnotesHeader)
                        $(this).attr('data-footnotes-heading',
                            self.replaceQuotesWithPlaceholder(
                                $footnotesHeader));
                });
            });
        });
    },

    invokeIntextCiteDialogOnDoubleClick: function() {
        _editor.on('doubleclick', function(ev) {
            var el = _editor.getSelection().getStartElement();
            if (el.hasClass('cke_widget_focused') &&
                el.find('.sup[data-footnote-id]').$.length) {
                _editor.execCommand('intext_cite');
            }
        });
    },

    initMenuOnInstanceReady: function() {
        //add the Edit In-Text Citation right click menu item when right clicking
        //in-text citations, remove the copy/cut/paste items.
        CKEDITOR.on('instanceReady', function(ev) {
            if (!_editor._.menuItems.editCiteCmd) {
                _editor.addMenuGroup('cite');
                var editCiteCmd = {
                    command : 'editCiteCmd',
                    group : 'cite'
                };
                _editor.contextMenu.addListener(function(element, selection ) {
                    //check element is sup[data-footnote-id]
                    var ascendant = element.getAscendant( function( el ) {
                        try {
                            return el.hasClass('cke_widget_focused') &&
                                el.find('.sup[data-footnote-id]').$.length;
                        }
                        catch(e) {
                            return null;
                        }
                    }, true);
                    if (ascendant) {
                        return {
                            editCiteCmd : CKEDITOR.TRISTATE_ON
                        };
                    }
                });
                _editor.addMenuItems({
                    editCiteCmd : {
                        label : 'Edit In-text Citation',
                        command : 'intext_cite',
                        group : 'cite',
                        order : 2
                    }
                });
                _editor.removeMenuItem('paste');
                _editor.removeMenuItem('copy');
                _editor.removeMenuItem('cut');
            }
        });
    },

    setCursorBookmark: function() {
        if(!_editor) return;
        if(!_$contents) return;
        this.removeExistingCursorBookmark();
        return this.createCursorBookmarkReturnContainingElement();
    },

    removeExistingCursorBookmark: function() {
        _$contents.find(_bookmarkSelector).remove();
        _$contents.find('span').filter(function() {
            return $(this).html() === "&nbsp;";
        }).remove();
    },

    createCursorBookmarkReturnContainingElement: function() {
        var slct = _editor.getSelection();
        var bookmark = slct.createBookmarks();
        if (bookmark[0])
            $(bookmark[0].startNode.$)
                .attr(_bookmarkAttr, '1');
        return slct.getRanges()[0];
    },

    isValidHtml: function(html) {
        /*
         html = html.replace(/&quot;/g,'"').replace(/<span>|<\/span>/g,'');
         var doc = document.createElement('div');
         doc.innerHTML = html;
         return ( doc.innerHTML === html );
         */
        return true;
    },

    updateCitationsByExternalId: function(citationUpdates) {
        if (!(citationUpdates instanceof Array))
            return;
        for (var i=0; i<citationUpdates.length; i++) {
            if (this.citationUpdateHasRequiredData(citationUpdates[i])) {
                this.updateFootnotesByExternalId(citationUpdates[i]);
                this.updateInlineCitationsByExternalId(citationUpdates[i]);
            }
        }
        if (citationUpdates.length)
            this.updateInlineCitationBrackets(citationUpdates);
        this.reorderMarkers('build');
        _editor.focus();
    },

    citationUpdateHasRequiredData: function(citationData) {
        return (citationData instanceof Object) &&
            citationData['externalId'] &&
            citationData['externalId'].length > 0 &&
            citationData['citation'] &&
            citationData['citation'].length > 0;
    },

    updateFootnotesByExternalId: function(citationData) {
        var self = this;
        _$contents.find('.footnotes li[data-footnote-id][data-ext-id='+
            citationData['externalId']+']').each(function(){
            var $this = $(this);
            citationData['inlineCitation'] &&
            citationData['inlineCitation'].length > 0 ?
                $this.attr('data-inline-citation',
                    self.removeOuterBrackets(
                        self.replaceQuotesWithPlaceholder(
                            replaceDivWithSpan(
                                citationData['inlineCitation'])))) :
                $this.removeAttr('data-inline-citation');
            $this.find('.cite').html(
                replaceDivWithSpan(citationData['citation']));
        });
    },

    updateInlineCitationsByExternalId: function(citationData) {
        var self = this;
        _$contents.find('.sup[data-footnote-id][data-ext-id='+
            citationData['externalId']+']').each(function(){
            var $this = $(this);
            var $anchor = $this.find('a');
            var dataCitation =
                self.replaceQuotesWithPlaceholder(
                    replaceDivWithSpan(citationData['citation']));
            $this.attr('data-citation', dataCitation)
                .attr('data-citation-modified', dataCitation);
            $anchor.attr('data-citation', dataCitation)
                .attr('data-citation-modified', dataCitation);
            if (citationData['inlineCitation'] &&
                citationData['inlineCitation'].length > 0) {
                var inlineCitation =
                    replaceDivWithSpan(
                        citationData['inlineCitation']);
                var dataInlineCitation =
                    self.removeOuterBrackets(
                        self.replaceQuotesWithPlaceholder(
                            inlineCitation));
                $this.attr('data-inline-citation', dataInlineCitation);
                $anchor.attr('data-inline-citation', dataInlineCitation);
                $anchor.html(inlineCitation);
            }
            else {
                $this.removeAttr('data-inline-citation');
                $anchor.removeAttr('data-inline-citation');
                $anchor.html('X');
            }
        });
    },

    updateInlineCitationBrackets: function(citationUpdates) {
        if (citationUpdates[0]['inlineCitation'].toString().length) {
            _$contents.find('[data-inline-cit-autonum]').each(function(){
                var $outer = $(this);
                $outer.contents().each(function(){
                    var $this = $(this);
                    if (!$this.is('[data-footnote-id]') &&
                        !$this.is('[data-widget]') &&
                        !$this.hasClass('cke_widget_wrapper')) {
                        $this[0].nodeType == 3 ?
                            $this[0].textContent =
                                $this[0].textContent
                                    .replace('[','(')
                                    .replace(']',')') :
                            $this.html(
                                $this.html()
                                    .replace('[','(')
                                    .replace(']',')'));
                    }
                });
                $outer.attr('data-inline-cit',
                    $outer.attr('data-inline-cit-autonum'));
                $outer.removeAttr('data-inline-cit-autonum');
            });
        }
        else {
            _$contents.find('[data-inline-cit]').each(function(){
                var $outer = $(this);
                $outer.contents().each(function(){
                    var $this = $(this);
                    if (!$this.is('[data-footnote-id]') &&
                        !$this.is('[data-widget]') &&
                        !$this.hasClass('cke_widget_wrapper')) {
                        $this[0].nodeType == 3 ?
                            $this[0].textContent =
                                $this[0].textContent
                                    .replace('(','[')
                                    .replace(')',']') :
                            $this.html(
                                $this.html()
                                    .replace('(','[')
                                    .replace(')',']'));
                    }
                });
                $outer.attr('data-inline-cit-autonum',
                    $outer.attr('data-inline-cit'));
                $outer.removeAttr('data-inline-cit');
            });
        }
    },

    getExternalIds: function() {
        return _$contents
            .find('.footnotes li[data-footnote-id][data-ext-id]')
            .map(function(){
                return $(this).attr('data-ext-id');
            }).toArray() || [];
    },

    insert: function(footnote, inlineCitation, externalId) {
        this.setCursorBookmark();
        //var $contents = $(editor.editable().$);
        //if any sup widgets are currently focused, then place the cursor after them effectively unselecting the widget
        //this prevents overwriting the existing widget.
        //have to use a dummy span, select this span then remove it - couldnt find another way.
        if (_editor.widgets.focused) {
            $(_cursorAfterWidgetHtml)
                .insertAfter($(_editor.widgets.focused.element.$).parent());
            this.moveCursorAfterFocusedWidget();
        }

        this.removeDataInlineCitElsThatArentMarkers();
        this.moveTextOutsideBracketsOutOfDataInlineCitEls();
        this.moveTextOutsideBracketsOutOfDataInlineCitAutonumEls();
        this.initInlineCitationAndFootnoteData(footnote,
            inlineCitation, externalId);
        this.createFootnoteIfDoesntExist();
        this.generateInlineCitationHtml();
        this.insertInlineCitationAndFormat();

        //create a dummy span so that below we can place the cursor after the inserted marker
        //allowing the user to continue typing after insert
        $(_cursorAfterWidgetHtml).insertAfter(
            _$contents
                .find('.sup[data-footnote-id]:contains(X)')
                .closest('[data-inline-cit'+
                    (inlineCitation ? '' : 'autonum')+']'));
        this.reorderMarkers('build');
        //select after the inserted marker widget s
        this.moveCursorAfterFocusedWidget();
        _editor.focus();
    },

    initInlineCitationAndFootnoteData: function(footnote, inlineCitation,
                                                externalId) {
        _footnote = this.replaceQuotesWithPlaceholder(
            replaceDivWithSpan(footnote));
        _footnoteId = this.findFootnote(_footnote);
        _inlineCitation = inlineCitation ?
            this.removeOuterBrackets(
                this.replaceQuotesWithPlaceholder(
                    replaceDivWithSpan(inlineCitation))) :
            null;
        _externalId = externalId;
        _adjacentInlineCitationRef = this.cursorTouchingInlineCitation();
        if (!_adjacentInlineCitationRef)
            _adjacentInlineCitationAutonumRef =
                this.cursorTouchingInlineCitationAutonum();
    },

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
            //this.moveCursorToCursorBookmark();
            //_editor.insertHtml(_footnoteMarker);
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

    cursorTouchingInlineCitation: function() {
        var citVal = this.cursorElementInsideCitationBlock('data-inline-cit');
        if (!citVal) {
            var siblings = this.getSiblingsEitherSideOfCursor('data-inline-cit');
            citVal = this.cursorElementAdjacentToCitationBlock(siblings);
            if (!citVal)
                citVal =
                    this.cursorAdjacentToCitationSeparatedByZeroSpaceText(
                        siblings, 'data-inline-cit');
        }
        return citVal;
    },

    cursorTouchingInlineCitationAutonum: function() {
        var citVal = this.cursorElementInsideCitationBlock('data-inline-cit-autonum');
        if (!citVal) {
            var siblings = this.getSiblingsEitherSideOfCursor('data-inline-cit-autonum');
            citVal = this.cursorElementAdjacentToCitationBlock(siblings);
            if (!citVal)
                citVal =
                    this.cursorAdjacentToCitationSeparatedByZeroSpaceText(
                        siblings, 'data-inline-cit-autonum');
        }
        return citVal;
    },

    cursorElementInsideCitationBlock: function(inlineCitAttr) {
        var $inside = null;
        _$contents.find('['+inlineCitAttr+']').each(function(){
            var bookmark =
                $(this).find(_bookmarkSelector);
            if (bookmark.length) {
                $inside = $(this);
                return false;
            }
        });
        return $inside && $inside.length ?
            $inside.attr(inlineCitAttr) : null;
    },

    getSiblingsEitherSideOfCursor: function(inlineCitAttr) {
        var siblings = {
          nextSibling: <any>null,
          prevSibling: <any>null,
          nextSiblingInlineCitAttr: <any>null,
          prevSiblingInlineCitAttr: <any>null
        };
        var $bookmark = _$contents.find(_bookmarkSelector);
        siblings.nextSibling = $bookmark[0] && $($bookmark[0].nextSibling);
        siblings.prevSibling = $bookmark[0] && $($bookmark[0].previousSibling);
        siblings.nextSiblingInlineCitAttr = siblings.nextSibling &&
            siblings.nextSibling.attr(inlineCitAttr);
        siblings.prevSiblingInlineCitAttr = siblings.prevSibling &&
            siblings.prevSibling.attr(inlineCitAttr);
        return siblings;
    },

    cursorElementAdjacentToCitationBlock: function(siblings) {
        return siblings.nextSiblingInlineCitAttr ||
            siblings.prevSiblingInlineCitAttr;
    },

    cursorAdjacentToCitationSeparatedByZeroSpaceText: function(siblings, inlineCitAttr) {
        var citVal = null,
            prevOrNextSibling = ['nextSibling','previousSibling'];
        for (var i=0; i<prevOrNextSibling.length; i++)
            if (citVal = this.iterateSiblingsUntilInlineCitOrNonZeroTextFound(
                    prevOrNextSibling[i],
                    siblings[prevOrNextSibling[i]] &&
                    siblings[prevOrNextSibling[i]][0],
                    inlineCitAttr))
                break;
        return citVal;
    },

    iterateSiblingsUntilInlineCitOrNonZeroTextFound: function(
        prevOrNext, currentSibling, inlineCitAttr) {
        var zeroLenStringRegexp = this.zeroLengthStringsRegexp(),
            citVal = null;
        while (true) {
            if (!currentSibling)
                break;
            var $currentSibling = $(currentSibling),
                currentSiblingCitAttr = $currentSibling.attr(inlineCitAttr);
            if (currentSiblingCitAttr) {
                citVal = currentSiblingCitAttr;
                break;
            }
            else if ($currentSibling.text()
                    .replace(zeroLenStringRegexp, '')
                    .length > 0)
                break;
            else
                currentSibling = currentSibling[prevOrNext];
        }
        return citVal;
    },

    zeroLengthStringsRegexp: function() {
        return new RegExp("[\u0000\u0007\u0008\u001A" +
            "\u001B\u007F\u200B-\u200F\uFEFF]", "g");
    },

    findFootnote: function(footnote) {
        if (!_editor.footnotesStore)
            return null;
        var footnoteId = null;
        for (var key in _editor.footnotesStore) {
            if (_editor.footnotesStore.hasOwnProperty(key)) {
                if (_editor.footnotesStore[key] ===
                    this.replaceQuotesWithPlaceholder(footnote)) {
                    footnoteId = key;
                    break;
                }
            }
        }
        return footnoteId;
    },

    buildFootnote: function(footnoteId, footnoteText, inlineCitation, externalId) {
        var prefix  = _editor.config.footnotesPrefix ? '-' +
            _editor.config.footnotesPrefix : '';
        return '<li id="footnote' + prefix + '-' + footnoteId +
            '" data-footnote-id="' + footnoteId + '"' +
            (inlineCitation ? ' data-inline-citation="' + inlineCitation + '"' : '') +
            (externalId && externalId.toString().length ? ' data-ext-id="' + externalId + '"' : '') + '>' +
            '<span class="cite">' +
            this.revertQuotesPlaceholder(footnoteText) + '</span></li>';
    },

    addFootnote: function(footnote, replace) {
        //var $contents  = $(_editor.editable().$);
        var $footnotes = _$contents.find('.footnotes');
        if ($footnotes.length == 0) {
            var headerTitle = _editor.config.footnotesTitle ?
                _editor.config.footnotesTitle : 'References';
            var dataHeaderTitle =
                _$contents.find('.sup[data-footnotes-heading]')
                    .attr('data-footnotes-heading');
            headerTitle =
                this.revertQuotesPlaceholder(
                    (dataHeaderTitle ? dataHeaderTitle : headerTitle));
            var headerEls = ['<h2>', '</h2>'];
            if (_editor.config.footnotesHeaderEls) {
                headerEls = _editor.config.footnotesHeaderEls;
            }
            var container =
                '<section class="footnotes"><header>' +
                headerEls[0] + headerTitle + headerEls[1] +
                '</header><ol>' + footnote + '</ol></section>';
            // Move cursor to end of content:
            /*
            var range = _editor.createRange();
            range.moveToElementEditEnd(range.root);
            _editor.getSelection().selectRanges([range]);
            _editor.insertHtml(container);
            */
            _$contents.append(container);
            _$contents.find("section.footnotes").each(function(){
                if (!$(this).parent('.cke_widget_wrapper').length)
                    _editor.widgets.initOn(
                        new CKEDITOR.dom.element(this),
                        'footnotes' );
            });
        } else {
            if (replace)
                $footnotes.find('ol').html(footnote);
            else
                $footnotes.find('ol').append(footnote);
        }
    },

    generateFootnoteId: function() {
        var id = Math.random().toString(36).substr(2, 5);
        while ($.inArray(id, _footnoteIds) != -1) {
            id = String(this.generateFootnoteId());
        }
        _footnoteIds.push(id);
        return id;
    },

    reorderMarkers: function(context) {
        _editor.fire('lockSnapshot');
        var prefix  = _editor.config.footnotesPrefix ?
            '-' + _editor.config.footnotesPrefix : '';
        //var _$contents = $(_editor.editable().$);
        var data = {
            order: [],
            occurrences: {},
            originalCitationText: [],
            inlineCitation: [],
            modifiedCitationText: [],
            externalIds: []
        };
        var self = this;
        // Find all the markers in the document:
        var $markers = _$contents.find('.sup[data-footnote-id]');
        // If there aren't any, remove the Footnotes container:
        if ($markers.length == 0) {
            _$contents.find('.footnotes').parent().remove();
            _editor.fire('unlockSnapshot');
            return;
        }
        // Otherwise reorder the markers:
        var j = 0;
        $markers.each(function(){
            j++;
            var $this = $(this),
                footnoteId = $this.attr('data-footnote-id'),
                citationText = $this.attr('data-citation'),
                citationTextModified = $this.attr('data-citation-modified'),
                inlineCitationText = $this.attr('data-inline-citation'),
                externalId = $this.attr('data-ext-id'),
                markerRef,
                n = data.order.indexOf(footnoteId);
            // If this is the markers first occurrence:
            if (n == -1) {
                // Store the id:
                data.order.push(footnoteId);
                data.originalCitationText.push(citationText);
                data.modifiedCitationText.push(citationTextModified);
                data.inlineCitation.push(inlineCitationText);
                data.externalIds.push(externalId);
                n = data.order.length;
                data.occurrences[footnoteId] = 1;
                markerRef = '1';
            } else {
                // Otherwise increment the number of occurrences:
                // (increment n due to zero-index array)
                n++;
                data.occurrences[footnoteId]++;
                markerRef = data.occurrences[footnoteId];
            }
            // Replace the marker contents:
            var marker = self.generateMarkerHtml(prefix, citationText,
                citationTextModified, n, markerRef, footnoteId,
                inlineCitationText, externalId);
            $(this).html(marker);
        });

        // Prepare the footnotesStore object:
        _editor.footnotesStore = {};

        // Then rebuild the Footnotes content to match marker order:
        var footnotes     = '',
            i = 0,
            l = data.order.length;
        for (i; i < l; i++) {
            footnotes +=
                this.buildFootnote(data.order[i], data.modifiedCitationText[i],
                    data.inlineCitation[i], data.externalIds[i]);
            // Store the footnotes for later use (post cut/paste):
            _editor.footnotesStore[data.order[i]] = data.originalCitationText[i];
        }
        // Insert the footnotes into the list:
        this.addFootnote(footnotes, true);

        // Next we need to reinstate the 'editable' properties of the footnotes.
        // (we have to do this individually due to Widgets 'fireOnce' for editable selectors)
        var footnoteWidget, footnoteId;
        // So first we need to find the right Widget instance:
        // (I hope there's a better way of doing this but I can't find one)
        for (<any>i in _editor.widgets.instances) {
            if (_editor.widgets.instances[i].name === 'footnotes') {
                footnoteWidget = _editor.widgets.instances[i];
                break;
            }
        }
        if (footnoteWidget) {
            // Then we `initEditable` each footnote, giving it a unique selector:
            i = 1;
            _$contents.find('.footnotes li').each(function(){
                footnoteId = $(this).attr('data-footnote-id');
                footnoteWidget.initEditable(
                    'footnote_' + i,
                    {selector: '#footnote' + prefix + '-' + footnoteId +' .cite',
                        allowedContent: 'a[href]; cite[*](*); span[*](*); em strong i'});
                i++;
            });
        }
        _editor.fire('unlockSnapshot');
    },

    removeDataInlineCitElsThatArentMarkers: function() {
        _$contents.find('[data-inline-cit]').each(function(){
            var $this = $(this);
            if (!$this.find('.sup[data-footnote-id]').length)
                $this.replaceWith($this.html());
        });
    },

    moveTextOutsideBracketsOutOfDataInlineCitEls: function() {
        var self = this;
        _$contents.find('[data-inline-cit]').each(function(){
            var $this = $(this),
                $thisModified = self.cloneJqueryObject($this),
                $thisModifiedChildren = self.getChildNodesOf($thisModified),
                $moveToBefore =
                    self.getChildNodesBefore1stWidgetUpToOpenBracket(
                            $thisModifiedChildren, "("),
                moveToBeforeContent =
                    self.joinNodesToHtmlString($moveToBefore),
                $moveToAfter =
                    self.getChildNodesAfterLastWidgetUpToCloseBracket(
                            $thisModifiedChildren, ")"),
                moveToAfterContent =
                    self.joinNodesToHtmlString($moveToAfter);
            self.contentExistsBefore1stWidget(moveToBeforeContent) ?
                self.removeChildNodesBeforeOpenBracket($thisModified, $moveToBefore) :
                moveToBeforeContent = '';
            self.contentExistsAfterLastWidget(moveToAfterContent) ?
                self.removeChildNodesAfterCloseBracket($thisModified, $moveToAfter) :
                moveToAfterContent = '';
            if (moveToBeforeContent.length > 0 ||
                moveToAfterContent.length > 0) {
                $this.replaceWith(
                    moveToBeforeContent.replace(/\([\s\u0000\u0007\u0008\u001A\u001B\u007F\u200B-\u200F\uFEFF]*$/g, "") +
                    self.getHtmlWithoutWidgetMarkup(
                        $thisModified[0].outerHTML) +
                    moveToAfterContent.replace(/^[\s\u0000\u0007\u0008\u001A\u001B\u007F\u200B-\u200F\uFEFF]*\)/g, ""));
            }
        });
    },

    getHtmlWithoutWidgetMarkup: function(theHtml) {
        return _editor.dataProcessor.toDataFormat(
            theHtml,  { context: 'p' });
    },

    moveTextOutsideBracketsOutOfDataInlineCitAutonumEls: function() {
        var self = this;
        _$contents.find('[data-inline-cit-autonum]').each(function(){
            var $this = $(this),
                $thisModified = self.cloneJqueryObject($this),
                $thisModifiedChildren = self.getChildNodesOf($thisModified),
                $moveToBefore =
                    self.getChildNodesBefore1stWidgetUpToOpenBracket(
                        $thisModifiedChildren, "["),
                moveToBeforeContent =
                    self.joinNodesToHtmlString($moveToBefore),
                $moveToAfter =
                    self.getChildNodesAfterLastWidgetUpToCloseBracket(
                        $thisModifiedChildren, "]"),
                moveToAfterContent =
                    self.joinNodesToHtmlString($moveToAfter);
            self.contentExistsBefore1stAutonumWidget(moveToBeforeContent) ?
                self.removeChildNodesBeforeOpenAutonumBracket($thisModified, $moveToBefore) :
                moveToBeforeContent = '';
            self.contentExistsAfterLastAutonumWidget(moveToAfterContent) ?
                self.removeChildNodesAfterCloseAutonumBracket($thisModified, $moveToAfter) :
                moveToAfterContent = '';
            if (moveToBeforeContent.length > 0 ||
                moveToAfterContent.length > 0) {
                $this.replaceWith(
                    moveToBeforeContent.replace(/\[[\s\u0000\u0007\u0008\u001A\u001B\u007F\u200B-\u200F\uFEFF]*$/g, "") +
                    self.getHtmlWithoutWidgetMarkup(
                        $thisModified[0].outerHTML) +
                    moveToAfterContent.replace(/^[\s\u0000\u0007\u0008\u001A\u001B\u007F\u200B-\u200F\uFEFF]*\]/g, ""));
            }
        });
    },

    cloneJqueryObject: function($obj) {
        return $('<div/>').html($obj[0].outerHTML).contents();
    },

    getChildNodesOf: function($contents) {
        var contentsChildren = [];
        if ($contents && $contents.length)
            $contents.contents().each(function(){
                contentsChildren.push($(this));
            });
        return contentsChildren;
    },

    getChildNodesBefore1stWidgetUpToOpenBracket: function(
                                $contentsChildren, bracketChar) {
        var nodesBefore = [];
        var bracketPattern = new RegExp("\\" + bracketChar, "g");
        for(var i=0; i<$contentsChildren.length; i++) {
            if ($contentsChildren[i]
                    .find('[data-widget=footnotemarker]').length)
                break;
            nodesBefore.push($contentsChildren[i]);
            if ($contentsChildren[i].text().match(bracketPattern))
                break;
        }
        return nodesBefore;
    },

    getChildNodesAfterLastWidgetUpToCloseBracket: function(
                                $contentsChildren, bracketChar) {
        var nodesAfter = [];
        var bracketPattern = new RegExp("\\" + bracketChar, "g");
        for(var i=$contentsChildren.length-1; i >= 0; i--) {
            //if ")" is found then break
            if ($contentsChildren[i]
                    .find('[data-widget=footnotemarker]').length)
                break;
            nodesAfter.push($contentsChildren[i]);
            if ($contentsChildren[i].text().match(bracketPattern))
                break;
        }
        return nodesAfter.reverse();
    },

    joinNodesToHtmlString: function(nodes) {
        return nodes
            .map(function(el){
                return el[0].nodeType == 3 ?
                    el[0].data : el[0].outerHTML;})
            .join('');
    },

    contentExistsBefore1stWidget: function(contentBefore1stWidget) {
        return contentBefore1stWidget.trim() !== "(";
    },

    contentExistsAfterLastWidget: function(contentAfterLastWidget) {
        return contentAfterLastWidget.trim() !== ")";
    },

    removeChildNodesBeforeOpenBracket: function($contents, $moveToBefore) {
        var i = 0;
        $contents.contents().each(function(){
            i++;
            if (i >= $moveToBefore.length) {
                $(this).replaceWith('(');
                return false;
            }
            else {
                $(this).remove();
            }
        });
    },

    removeChildNodesAfterCloseBracket: function($contents, $moveToAfter) {
        var i = 0;
        $contents.contents().reverse().each(function(){
            i++;
            if (i >= $moveToAfter.length) {
                $(this).replaceWith(')');
                return false;
            }
            else {
                $(this).remove();
            }
        });
    },

    contentExistsBefore1stAutonumWidget: function(contentBefore1stWidget) {
        return contentBefore1stWidget.trim() !== "[";
    },

    contentExistsAfterLastAutonumWidget: function(contentAfterLastWidget) {
        return contentAfterLastWidget.trim() !== "]";
    },

    removeChildNodesBeforeOpenAutonumBracket: function($contents, $moveToBefore) {
        var i = 0;
        $contents.contents().each(function(){
            i++;
            if (i >= $moveToBefore.length) {
                $(this).replaceWith('[');
                return false;
            }
            else {
                $(this).remove();
            }
        });
    },

    removeChildNodesAfterCloseAutonumBracket: function($contents, $moveToAfter) {
        var i = 0;
        $contents.contents().reverse().each(function(){
            i++;
            if (i >= $moveToAfter.length) {
                $(this).replaceWith(']');
                return false;
            }
            else {
                $(this).remove();
            }
        });
    },

    generateMarkerHtml: function(prefix, citationText, citationTextModified, n,
                                 markerRef, footnoteId, inlineCitation,
                                 externalId) {
        var theHtml = '';
        if (inlineCitation) {
            inlineCitation = this.removeOuterBrackets(inlineCitation);
            theHtml = '<span class="inline-citation-before-link"></span><span ' +
                'id="footnote-marker' + prefix + '-' + footnoteId + '-' + markerRef +
                '" data-citation="'+citationText+'"'+
                ' data-citation-modified="'+citationTextModified+'"' +
                ' data-inline-citation="'+
                inlineCitation+'" data-footnote-id="' +
                footnoteId + '"'+
                (externalId && externalId.toString().length ? ' data-ext-id="'+externalId+'"'  : '') +
                '>' +
                this.revertQuotesPlaceholder(inlineCitation) +
                '</span><span class="inline-citation-after-link"></span>';
        }
        else {
            theHtml = '<span id="footnote-marker' + prefix + '-' +
                footnoteId + '-' + markerRef +
                '" data-citation="'+citationText+'"'+
                ' data-citation-modified="'+citationTextModified+'"' +
                ' data-footnote-id="' + footnoteId + '"'+
                (externalId && externalId.toString().length ? ' data-ext-id="'+externalId+'"'  : '') +
                '>' + n + '</span>';
        }
        return theHtml;
    },

    moveCursorAfterFocusedWidget: function() {
        var range = _editor.createRange();
        var $dummySpan = _editor.document
            .find(_cursorAfterWidgetSelector).getItem(0);
        range.setStart($dummySpan, 0);
        range.setEnd($dummySpan, 0);
        _editor.getSelection().selectRanges([range]);
        _$contents.find(_cursorAfterWidgetSelector).each(function(){
            $(this).remove();
        });
    },

    moveCursorToCursorBookmark: function() {
        var range = _editor.createRange();
        var $dummySpan = _editor.document.find(_bookmarkSelector).getItem(0);
        if($dummySpan) {
            range.setStart($dummySpan, 0);
            range.setEnd($dummySpan, 0);
            _editor.getSelection().selectRanges([range]);
            /*_$contents.find(_bookmarkSelector).each(function(){
             $(this).remove();
             });*/
        }
    },

    replaceQuotesWithPlaceholder: function(text) {
        return text.replace(/"/g,'[!quot!]')
            .replace(/&quot;/g,'[!hquot!]');
    },

    revertQuotesPlaceholder: function(text) {
        return text.replace(/\[!hquot!\]/g,'&quot;')
            .replace(/\[!quot!\]/g,'"');
    },

    removeOuterBrackets: function(text) {
        return text.replace(/^\s*\({1}\s*/g, '')
            .replace(/\s*\){1}\s*$/g, '');
    }
  });
