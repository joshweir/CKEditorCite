import { compose, replace } from 'ramda';

const removeOuterBrackets = text => compose(
  replace(/\s*\){1}\s*$/g, ''),
  replace(/^\s*\({1}\s*/g, ''),
)(text);

const replaceQuotesWithPlaceholder = text => compose(
  replace(/&quot;/g, '[!hquot!]'),
  replace(/"/g, '[!quot!]'),
)(text);

const revertQuotesPlaceholder = text => compose(
  replace(/\[!quot!\]/g, '"'),
  replace(/\[!hquot!\]/g, '&quot;'),
)(text);

export { removeOuterBrackets, replaceQuotesWithPlaceholder,
  revertQuotesPlaceholder };
