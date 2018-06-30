import { reduce } from 'ramda';
import { zeroLengthStringsRegexp } from './utils';

declare var $: any;

const bookmarkAttr = 'data-selection-bookmark';
const bookmarkSelector = `[${bookmarkAttr}]`;
const cursorAfterWidgetClass = 'dummyF';
const cursorAfterWidgetHtml =
`<span class="${cursorAfterWidgetClass}">&nbsp;</span>`;
const cursorAfterWidgetSelector = `span.${cursorAfterWidgetClass}`;

const iterateSiblingsUntilInlineCitOrNonZeroTextFound =
(prevOrNext, currentSib, inlineCitAttr) => {
  let currentSibling = currentSib;
  let citVal = null;
  while (true) {
    if (!currentSibling) break;
    const $currentSibling = $(currentSibling);
    const currentSiblingCitAttr = $currentSibling.attr(inlineCitAttr);
    if (currentSiblingCitAttr) {
      citVal = currentSiblingCitAttr;
      break;
    } else if ($currentSibling.text()
      .replace(zeroLengthStringsRegexp(), '').length > 0) break;
    else currentSibling = currentSibling[prevOrNext];
  }
  return citVal;
};

const cursorAdjacentToCitationSeparatedByZeroSpaceText =
(siblings, inlineCitAttr) => (
  reduce(
    (acc, val) => (
      acc ||
      iterateSiblingsUntilInlineCitOrNonZeroTextFound(
        val,
        siblings[val] && siblings[val][0],
        inlineCitAttr)
    ),
    null,
    ['nextSibling', 'previousSibling'])
);

const cursorElementAdjacentToCitationBlock = siblings => (
  siblings.nextSiblingInlineCitAttr || siblings.prevSiblingInlineCitAttr
);

const getSiblingsEitherSideOfCursor =
bookmarkSelector => inlineCitAttr => ($contents) => {
  const siblings = {
    nextSibling: <any>null,
    prevSibling: <any>null,
    nextSiblingInlineCitAttr: <any>null,
    prevSiblingInlineCitAttr: <any>null,
  };
  const $bookmark = $contents.find(bookmarkSelector);
  siblings.nextSibling = $bookmark[0] && $($bookmark[0].nextSibling);
  siblings.prevSibling = $bookmark[0] && $($bookmark[0].previousSibling);
  siblings.nextSiblingInlineCitAttr = siblings.nextSibling &&
      siblings.nextSibling.attr(inlineCitAttr);
  siblings.prevSiblingInlineCitAttr = siblings.prevSibling &&
      siblings.prevSibling.attr(inlineCitAttr);
  return siblings;
};

const cursorElementInsideCitationBlock =
bookmarkSelector => inlineCitAttr => ($contents) => {
  let $inside = null;
  $contents.find(`[${inlineCitAttr}]`).each((_, el) => {
    const $el = $(el);
    if ($el.find(bookmarkSelector).length) {
      $inside = $el;
      return false;
    }
  });
  return $inside && $inside.length ?
    $inside.attr(inlineCitAttr) : null;
};

const cursorTouchingInlineCitation = bookmarkSelector => attr => ($contents) => {
  let citVal = cursorElementInsideCitationBlock(bookmarkSelector)(attr)($contents);
  if (!citVal) {
    const siblings = getSiblingsEitherSideOfCursor(bookmarkSelector)(attr)($contents);
    citVal = cursorElementAdjacentToCitationBlock(siblings) ||
      cursorAdjacentToCitationSeparatedByZeroSpaceText(
        siblings, attr);
  }
  return citVal;
};

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

export { bookmarkAttr, bookmarkSelector, cursorAfterWidgetClass,
  cursorAfterWidgetHtml, cursorAfterWidgetSelector,
  cursorTouchingInlineCitation, moveCursorAfterFocusedWidget,
  setCursorBookmark };
