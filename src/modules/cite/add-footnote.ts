import { footnotesHeaderEls, footnotesTitle } from '../ck-functional';
import { revertQuotesPlaceholder } from './utils';

declare var CKEDITOR: any;
declare var $: any;

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

export default addFootnote;
