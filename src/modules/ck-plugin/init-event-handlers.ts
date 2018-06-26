import store from '../store/store';

declare var CKEDITOR: any;
declare var $: any;

const retrieveContentsAndReorderMarkersOnInstanceReady =
function (editor : any) {
  // Force a reorder on startup to make sure all vars are set
  // (e.g. footnotes store):
  let self = this;
  editor.on('instanceReady', function (evt) {
    _$contents = $(_editor.editable().$);
    self.reorderMarkers('startup');
    _$contents = $(_editor.editable().$);
  });
};

moveCursorAfterFocusedWidgetOnEditorBlur: function() {
  // unselect any focused sup widgets if user clicks away from the editor,
  // as if they then going to insert a citation external to ckeditor,
  // we dont want to overwrite any existing citation markers
  _editor.on('blur', function() {
    if (_editor.widgets.focused) {
      $(_cursorAfterWidgetHtml)
      .insertAfter($(_editor.widgets.focused.element.$).parent());
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

export default () => {
  const editor = store.get('editor');
  retrieveContentsAndReorderMarkersOnInstanceReady();
  moveCursorAfterFocusedWidgetOnEditorBlur();
  reorderMarkersOnEditorChange();
  updateMarkersWithCurrentCitationValuesOnEditorChange();
  invokeIntextCiteDialogOnDoubleClick();
  initMenuOnInstanceReady();
};
