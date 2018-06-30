import { revertQuotesPlaceholder } from './utils';

const buildFootnote =
(prefix, footnoteId, footnoteText, inlineCitation, externalId) => (
  '<li id="footnote' + prefix + '-' + footnoteId +
  '" data-footnote-id="' + footnoteId + '"' +
  (inlineCitation ? ' data-inline-citation="' + inlineCitation + '"' : '') +
  (externalId && externalId.toString().length ? ' data-ext-id="' + externalId + '"' : '') + '>' +
  '<span class="cite">' +
  revertQuotesPlaceholder(footnoteText) + '</span></li>'
);

export default buildFootnote;
