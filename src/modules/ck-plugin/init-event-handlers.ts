import { contentFrom } from '../ck-functional';
import { cursorAfterWidgetHtml,
  moveCursorAfterFocusedWidget } from '../cite/cursor';
import reorderCitations from '../cite/reorder-citations';
import { replaceQuotesWithPlaceholder } from '../cite/utils';
import store from '../store/store';

declare var CKEDITOR: any;
declare var $: any;

const retrieveContentsAndReorderMarkersOnInstanceReady = (editor : any) => {
  // Force a reorder on startup to make sure all vars are set
  // (e.g. footnotes store):
  editor.on('instanceReady', () => {
    store.set({ contents: $(contentFrom(editor)) });
    reorderCitations(editor);
    store.set({ contents: $(contentFrom(editor)) });
  });
};

const moveCursorAfterFocusedWidgetOnEditorBlur =
(editor : any) => {
  // unselect any focused sup widgets if user clicks away from the editor,
  // as if they then going to insert a citation external to ckeditor,
  // we dont want to overwrite any existing citation markers
  editor.on('blur', () => {
    const $contents = $(contentFrom(editor));
    if (editor.widgets.focused) {
      $(cursorAfterWidgetHtml)
      .insertAfter($(editor.widgets.focused.element.$).parent());
      moveCursorAfterFocusedWidget(editor, $contents);
    }
  });
};

const editingAFootnote = (evt) => {
  const footnoteSection =
  evt
  .editor
  .getSelection()
  .getStartElement()
  .getAscendant('section');
  return !!(footnoteSection &&
  footnoteSection.$.className.indexOf('footnotes') !== -1);
};

const reorderMarkersOnEditorChange = (editor : any) => {
  const reorderMarkersKey = 'reordering_markers';
  let tmout;
  editor.on('change', (evt) => {
    clearTimeout(tmout);
    tmout = setTimeout(
    () => {
      const now = (new Date()).getTime().toString();
      // set a locally stored timestamp to prevent an endless loop when
      // reordering markers
      if (!localStorage.getItem(reorderMarkersKey)) {
        localStorage.setItem(reorderMarkersKey, now);
      }
      // Prevent no selection errors:
      if (!evt.editor.getSelection() ||
          !evt.editor.getSelection().getStartElement()) return;
      if (editingAFootnote(evt)) return;

      if (localStorage.getItem(reorderMarkersKey) === now) {
        // SetTimeout seems to be necessary (it's used in the core but
        // can't be 100% sure why)
        setTimeout(() => reorderCitations(editor), 0);
      }
      // prevent an endless loop of reorderingMarkers on change
      setTimeout(() => localStorage.removeItem(reorderMarkersKey), 200);
    },
    1000);
  });
};

const updateMarkersWithCurrentCitationValuesOnEditorChange =
(editor : any) => {
  editor.on('change', () => {
    const $contents = $(contentFrom(editor));
    // store the current value of footnotes citations against
    // their inline citations as they may have been changed
    // by the user and will be needed when footnotes are rebuilt
    // get the current footnotes section header
    const $footnotesHeader = $contents.find('.footnotes header h2').html();
    $contents.find('.footnotes li .cite').each(function () {
      const $cite = $(this);
      const footnoteId = $cite.parent('li').attr('data-footnote-id');
      $contents.find(`.sup[data-footnote-id=${footnoteId}]`).each(function () {
        const $citeI = $(this);
        $citeI.attr(
          'data-citation-modified',
          replaceQuotesWithPlaceholder($cite.html()),
        );
        if ($footnotesHeader) {
          $citeI.attr(
            'data-footnotes-heading',
            replaceQuotesWithPlaceholder($footnotesHeader),
          );
        }
      });
    });
  });
};

const invokeIntextCiteDialogOnDoubleClick = (editor : any) => {
  editor.on('doubleclick', () => {
    const el = editor.getSelection().getStartElement();
    if (el.hasClass('cke_widget_focused') &&
        el.find('.sup[data-footnote-id]').$.length) {
      editor.execCommand('intext_cite');
    }
  });
};

const initMenuOnInstanceReady = (editor : any) => {
  // add the Edit In-Text Citation right click menu item when right clicking
  // in-text citations, remove the copy/cut/paste items.
  CKEDITOR.on('instanceReady', () => {
    if (!editor._.menuItems.editCiteCmd) {
      editor.addMenuGroup('cite');
      editor.contextMenu.addListener((element) => {
        // check element is sup[data-footnote-id]
        const ascendant = element.getAscendant(
          (el) => {
            try {
              return el.hasClass('cke_widget_focused') &&
                  el.find('.sup[data-footnote-id]').$.length;
            } catch (e) {
              return null;
            }
          },
          true);
        if (ascendant) {
          return {
            editCiteCmd : CKEDITOR.TRISTATE_ON,
          };
        }
      });
      editor.addMenuItems({
        editCiteCmd : {
          label : 'Edit In-text Citation',
          command : 'intext_cite',
          group : 'cite',
          order : 2,
        },
      });
      editor.removeMenuItem('paste');
      editor.removeMenuItem('copy');
      editor.removeMenuItem('cut');
    }
  });
};

export default () => {
  const editor = store.get('editor');
  retrieveContentsAndReorderMarkersOnInstanceReady(editor);
  moveCursorAfterFocusedWidgetOnEditorBlur(editor);
  reorderMarkersOnEditorChange(editor);
  updateMarkersWithCurrentCitationValuesOnEditorChange(editor);
  invokeIntextCiteDialogOnDoubleClick(editor);
  initMenuOnInstanceReady(editor);
};
