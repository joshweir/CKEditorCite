import { cursorAfterWidgetHtml, moveCursorAfterFocusedWidget,
  setCursorBookmark } from './cursor';
import reorderCitations from './reorder-citations';
import store from '../store/store';

declare var $: any;

const insert = (footnote, inlineCitation, externalId) => {
  const editor = store.get('editor');
  const $contents = store.get('contents');
  setCursorBookmark();
  // if any sup widgets are currently focused, then place the cursor after them
  // effectively unselecting the widget this prevents overwriting the existing
  // widget. Have to use a dummy span, select this span then remove it -
  // couldnt find another way.
  if (editor.widgets.focused) {
    $(cursorAfterWidgetHtml)
    .insertAfter($(editor.widgets.focused.element.$).parent());
    moveCursorAfterFocusedWidget(editor, $contents);
  }

  this.removeDataInlineCitElsThatArentMarkers();
  this.moveTextOutsideBracketsOutOfDataInlineCitEls();
  this.moveTextOutsideBracketsOutOfDataInlineCitAutonumEls();
  this.initInlineCitationAndFootnoteData(footnote, inlineCitation, externalId);
  this.createFootnoteIfDoesntExist();
  this.generateInlineCitationHtml();
  this.insertInlineCitationAndFormat();

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
