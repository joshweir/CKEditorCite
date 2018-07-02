declare var $: any;

const getExternalIds = $contents => (
  $contents
  .find('.footnotes li[data-footnote-id][data-ext-id]')
  .map((_, el) => $(el).attr('data-ext-id')).toArray() || []
);

export default getExternalIds;
