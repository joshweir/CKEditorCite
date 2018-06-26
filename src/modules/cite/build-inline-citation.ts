import { removeOuterBrackets, revertQuotesPlaceholder } from './utils';

export default (prefix, citationText, citationTextModified, n,
                markerRef, footnoteId, inlineCitation, externalId) => {
    var theHtml = '';
    if (inlineCitation) {
        inlineCitation = removeOuterBrackets(inlineCitation);
        theHtml = '<span class="inline-citation-before-link"></span><span ' +
            'id="footnote-marker' + prefix + '-' + footnoteId + '-' + markerRef +
            '" data-citation="'+citationText+'"'+
            ' data-citation-modified="'+citationTextModified+'"' +
            ' data-inline-citation="'+
            inlineCitation+'" data-footnote-id="' +
            footnoteId + '"'+
            (externalId && externalId.toString().length ? ' data-ext-id="'+externalId+'"'  : '') +
            '>' +
            revertQuotesPlaceholder(inlineCitation) +
            '</span><span class="inline-citation-after-link"></span>';
    }
    else {
        theHtml = '<span id="footnote-marker' + prefix + '-' +
            footnoteId + '-' + markerRef +
            '" data-citation="'+citationText+'"'+
            ' data-citation-modified="'+citationTextModified+'"' +
            ' data-footnote-id="' + footnoteId + '"'+
            (externalId && externalId.toString().length ? ' data-ext-id="'+externalId+'"'  : '') +
            '>' + n + '</span>';
    }
    return theHtml;
};
