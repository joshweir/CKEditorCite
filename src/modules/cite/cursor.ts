declare var $: any;

const bookmarkAttr = 'data-selection-bookmark';
const bookmarkSelector = `[${bookmarkAttr}]`;
const cursorAfterWidgetClass = 'dummyF';
const cursorAfterWidgetHtml =
`<span class="${cursorAfterWidgetClass}">&nbsp;</span>`;
const cursorAfterWidgetSelector = `span.${cursorAfterWidgetClass}`;

const moveCursorAfterFocusedWidget = (editor : any, $contents : any) => {
  const range = editor.createRange();
  const $dummySpan =
  editor.document.find(cursorAfterWidgetSelector).getItem(0);
  range.setStart($dummySpan, 0);
  range.setEnd($dummySpan, 0);
  editor.getSelection().selectRanges([range]);
  $contents.find(cursorAfterWidgetSelector).each(function () {
    $(this).remove();
  });
};

const createCursorBookmarkReturnContainingElement = (editor) => {
  const slct = editor.getSelection();
  const bookmark = slct.createBookmarks();
  if (bookmark[0]) $(bookmark[0].startNode.$).attr(bookmarkAttr, '1');
  return slct.getRanges()[0];
};

const removeExistingCursorBookmark = ($contents) => {
  $contents.find(bookmarkSelector).remove();
  $contents.find('span').filter(function () {
    return $(this).html() === '&nbsp;';
  }).remove();
};

const setCursorBookmark = (editor, $contents) => {
  if (!editor) return;
  if (!$contents) return;

  removeExistingCursorBookmark($contents);
  return createCursorBookmarkReturnContainingElement(editor);
};

export { cursorAfterWidgetClass, cursorAfterWidgetHtml,
  cursorAfterWidgetSelector, moveCursorAfterFocusedWidget,
  setCursorBookmark };
