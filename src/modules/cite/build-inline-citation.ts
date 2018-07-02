import { removeOuterBrackets, revertQuotesPlaceholder } from './utils';

const buildInlineCitation =
(prefix, citationText, citationTextModified, n, markerRef, footnoteId,
 inlineCitation, externalId) => {
  return inlineCitation ?
    '<span class="inline-citation-before-link"></span><span ' +
    'id="footnote-marker' + prefix + '-' + footnoteId + '-' + markerRef +
    '" data-citation="' + citationText + '"' +
    ' data-citation-modified="' + citationTextModified + '"' +
    ' data-inline-citation="' +
    removeOuterBrackets(inlineCitation) + '" data-footnote-id="' +
    footnoteId + '"' +
    (externalId && externalId.toString().length ?
      ' data-ext-id="' + externalId + '"' : '') +
    '>' + revertQuotesPlaceholder(inlineCitation) +
    '</span><span class="inline-citation-after-link"></span>'
    : '<span id="footnote-marker' + prefix + '-' +
    footnoteId + '-' + markerRef +
    '" data-citation="' + citationText + '"' +
    ' data-citation-modified="' + citationTextModified + '"' +
    ' data-footnote-id="' + footnoteId + '"' +
    (externalId && externalId.toString().length ?
      ' data-ext-id="' + externalId + '"' : '') +
    '>' + n + '</span>';
};

export default buildInlineCitation;
