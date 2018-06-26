import buildFootnote from './build-footnote';
import buildInlineCitation from './build-inline-citation';
import { find } from '../jquery-functional';
import { footnotesPrefix } from '../ck-functional';
import store from '../store/store';

declare var $: any;

const initialData = () => ({
  order: [],
  occurrences: {},
  originalCitationText: [],
  inlineCitation: [],
  modifiedCitationText: [],
  externalIds: [],
});

const addFootnote = (editor, $contents, footnote, forceReplace) => {
  //var $contents  = $(_editor.editable().$);
  var $footnotes = _$contents.find('.footnotes');
  if ($footnotes.length == 0) {
      var headerTitle = _editor.config.footnotesTitle ?
          _editor.config.footnotesTitle : 'References';
      var dataHeaderTitle =
          _$contents.find('.sup[data-footnotes-heading]')
              .attr('data-footnotes-heading');
      headerTitle =
          this.revertQuotesPlaceholder(
              (dataHeaderTitle ? dataHeaderTitle : headerTitle));
      var headerEls = ['<h2>', '</h2>'];
      if (_editor.config.footnotesHeaderEls) {
          headerEls = _editor.config.footnotesHeaderEls;
      }
      var container =
          '<section class="footnotes"><header>' +
          headerEls[0] + headerTitle + headerEls[1] +
          '</header><ol>' + footnote + '</ol></section>';
      // Move cursor to end of content:
      /*
      var range = _editor.createRange();
      range.moveToElementEditEnd(range.root);
      _editor.getSelection().selectRanges([range]);
      _editor.insertHtml(container);
      */
      _$contents.append(container);
      _$contents.find("section.footnotes").each(function(){
          if (!$(this).parent('.cke_widget_wrapper').length)
              _editor.widgets.initOn(
                  new CKEDITOR.dom.element(this),
                  'footnotes' );
      });
  } else {
      if (replace)
          $footnotes.find('ol').html(footnote);
      else
          $footnotes.find('ol').append(footnote);
  }
};

export default (editor) => {
  editor.fire('lockSnapshot');
  const prefix  = footnotesPrefix(editor);
  const data = initialData();
  const $contents = store.get('contents');
  const $markers = find('.sup[data-footnote-id]', $contents);
  // If there aren't any, remove the Footnotes container:
  if ($markers.length <= 0) {
    $contents.find('.footnotes').parent().remove();
    editor.fire('unlockSnapshot');
    return;
  }
  // Otherwise reorder the markers:
  let j = 0;
  $markers.each(function () {
    j += 1;
    let $this = $(this),
        footnoteId = $this.attr('data-footnote-id'),
        citationText = $this.attr('data-citation'),
        citationTextModified = $this.attr('data-citation-modified'),
        inlineCitationText = $this.attr('data-inline-citation'),
        externalId = $this.attr('data-ext-id'),
        markerRef,
        n = data.order.indexOf(footnoteId);
    // If this is the markers first occurrence:
    if (n == -1) {
      // Store the id:
      data.order.push(footnoteId);
      data.originalCitationText.push(citationText);
      data.modifiedCitationText.push(citationTextModified);
      data.inlineCitation.push(inlineCitationText);
      data.externalIds.push(externalId);
      n = data.order.length;
      data.occurrences[footnoteId] = 1;
      markerRef = '1';
    } else {
      // Otherwise increment the number of occurrences:
      // (increment n due to zero-index array)
      n++;
      data.occurrences[footnoteId]++;
      markerRef = data.occurrences[footnoteId];
    }
    // Replace the marker contents:
    $(this).html(buildInlineCitation(prefix, citationText,
        citationTextModified, n, markerRef, footnoteId,
        inlineCitationText, externalId));
  });

  // Prepare the footnotesStore object:
  editor.footnotesStore = {};

  // Then rebuild the Footnotes content to match marker order:
  let footnotes = '',
    i = 0,
    l = data.order.length;
  for (i; i < l; i++) {
    footnotes +=
        buildFootnote(
          prefix, data.order[i], data.modifiedCitationText[i],
          data.inlineCitation[i], data.externalIds[i]);
    // Store the footnotes for later use (post cut/paste):
    editor.footnotesStore[data.order[i]] = data.originalCitationText[i];
  }
  // Insert the footnotes into the list:
  addFootnote(footnotes, true);

  // Next we need to reinstate the 'editable' properties of the footnotes.
  // (we have to do this individually due to Widgets 'fireOnce' for editable selectors)
  var footnoteWidget, footnoteId;
  // So first we need to find the right Widget instance:
  // (I hope there's a better way of doing this but I can't find one)
  for (<any>i in editor.widgets.instances) {
    if (editor.widgets.instances[i].name === 'footnotes') {
      footnoteWidget = editor.widgets.instances[i];
      break;
    }
  }
  if (footnoteWidget) {
    // Then we `initEditable` each footnote, giving it a unique selector:
    i = 1;
    $contents.find('.footnotes li').each(function(){
      footnoteId = $(this).attr('data-footnote-id');
      footnoteWidget.initEditable(
        'footnote_' + i,
        {
          selector: '#footnote' + prefix + '-' + footnoteId +' .cite',
          allowedContent: 'a[href]; cite[*](*); span[*](*); em strong i'
        }
      );
      i += 1;
    });
  }
  editor.fire('unlockSnapshot');
};
