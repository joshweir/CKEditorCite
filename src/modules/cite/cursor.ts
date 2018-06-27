declare var $: any;

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

export { cursorAfterWidgetClass, cursorAfterWidgetHtml,
  cursorAfterWidgetSelector, moveCursorAfterFocusedWidget };
