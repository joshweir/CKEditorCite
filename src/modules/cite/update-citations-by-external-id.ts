import { compose, map } from 'ramda';
import reorderCitations from './reorder-citations';
import { removeOuterBrackets, replaceDivWithSpan,
  replaceQuotesWithPlaceholder } from './utils';

declare var $: any;

const updateInlineCitationBrackets = $contents => (citationUpdates) => {
  if (citationUpdates[0]['inlineCitation'].toString().length) {
    $contents.find('[data-inline-cit-autonum]').each((_, el) => {
      const $outer = $(el);
      $outer.contents().each((_, el) => {
        const $this = $(el);
        if (!$this.is('[data-footnote-id]') &&
            !$this.is('[data-widget]') &&
            !$this.hasClass('cke_widget_wrapper')) {
          $this[0].nodeType === 3 ?
            $this[0].textContent =
            $this[0].textContent
            .replace('[', '(')
            .replace(']', ')')
            : $this.html($this.html()
                .replace('[', '(')
                .replace(']', ')'));
        }
      });
      $outer.attr('data-inline-cit', $outer.attr('data-inline-cit-autonum'));
      $outer.removeAttr('data-inline-cit-autonum');
    });
  } else {
    $contents.find('[data-inline-cit]').each((_, el) => {
      const $outer = $(el);
      $outer.contents().each((_, el) => {
        const $this = $(el);
        if (!$this.is('[data-footnote-id]') &&
            !$this.is('[data-widget]') &&
            !$this.hasClass('cke_widget_wrapper')) {
          $this[0].nodeType === 3 ?
            $this[0].textContent = $this[0].textContent
              .replace('(', '[')
              .replace(')', ']')
            : $this.html($this.html()
                .replace('(', '[')
                .replace(')', ']'));
        }
      });
      $outer.attr('data-inline-cit-autonum', $outer.attr('data-inline-cit'));
      $outer.removeAttr('data-inline-cit');
    });
  }
};

const updateInlineCitationsByExternalId = $contents => (citationData) => {
  $contents.find('.sup[data-footnote-id][data-ext-id=' +
  citationData['externalId'] + ']').each((_, el) => {
    const $this = $(el);
    const $anchor = $this.find('a');
    const dataCitation =
    replaceQuotesWithPlaceholder(replaceDivWithSpan(citationData['citation']));
    $this.attr('data-citation', dataCitation)
    .attr('data-citation-modified', dataCitation);
    $anchor.attr('data-citation', dataCitation)
    .attr('data-citation-modified', dataCitation);
    if (citationData['inlineCitation'] &&
      citationData['inlineCitation'].length > 0) {
      const inlineCitation = replaceDivWithSpan(citationData['inlineCitation']);
      const dataInlineCitation =
      removeOuterBrackets(replaceQuotesWithPlaceholder(inlineCitation));
      $this.attr('data-inline-citation', dataInlineCitation);
      $anchor.attr('data-inline-citation', dataInlineCitation);
      $anchor.html(inlineCitation);
    } else {
      $this.removeAttr('data-inline-citation');
      $anchor.removeAttr('data-inline-citation');
      $anchor.html('X');
    }
  });
};

const updateFootnotesByExternalId = $contents => (citationData) => {
  $contents.find('.footnotes li[data-footnote-id][data-ext-id=' +
  citationData['externalId'] + ']').each((_, el) => {
    const $this = $(el);
    citationData['inlineCitation'] &&
    citationData['inlineCitation'].length > 0 ?
      $this.attr(
        'data-inline-citation',
        compose(
          removeOuterBrackets,
          replaceQuotesWithPlaceholder,
          replaceDivWithSpan)(citationData['inlineCitation']))
      : $this.removeAttr('data-inline-citation');
    $this.find('.cite').html(replaceDivWithSpan(citationData['citation']));
  });
};

const citationUpdateHasRequiredData = citationData => (
  (citationData instanceof Object) &&
  citationData['externalId'] &&
  citationData['externalId'].length > 0 &&
  citationData['citation'] &&
  citationData['citation'].length > 0
);

const updateCitationsByExternalId = editor => (citationUpdates) => {
  if (!(citationUpdates instanceof Array)) return;
  map(
    (citationUpdate) => {
      if (citationUpdateHasRequiredData(citationUpdate)) {
        updateFootnotesByExternalId(citationUpdate);
        updateInlineCitationsByExternalId(citationUpdate);
      }
    },
    citationUpdates);
  if (citationUpdates.length) updateInlineCitationBrackets(citationUpdates);
  reorderCitations(editor);
  editor.focus();
};

export default updateCitationsByExternalId;
