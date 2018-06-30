import { compose, replace } from 'ramda';

const removeOuterBrackets = text => compose(
  replace(/\s*\){1}\s*$/g, ''),
  replace(/^\s*\({1}\s*/g, ''),
)(text);

const renameDOMElementInStr = (to, from, str) => {
  const fromOpenRegexp = new RegExp(`<${from}`, 'g');
  const toOpen = `<${to}`;
  const fromCloseRegexp = new RegExp(`<\/${from}`, 'g');
  const toClose = `</${to}`;
  const replaceOpenTags = replace(fromOpenRegexp, toOpen);
  const replaceCloseTags = replace(fromCloseRegexp, toClose);
  return compose(replaceCloseTags, replaceOpenTags)(str);
};

const replaceDivWithSpan = text => renameDOMElementInStr('span', 'div', text);

const replaceQuotesWithPlaceholder = text => compose(
  replace(/&quot;/g, '[!hquot!]'),
  replace(/"/g, '[!quot!]'),
)(text);

const revertQuotesPlaceholder = text => compose(
  replace(/\[!quot!\]/g, '"'),
  replace(/\[!hquot!\]/g, '&quot;'),
)(text);

const zeroLengthStringsRegexp = () => (
  new RegExp(
    '[\u0000\u0007\u0008\u001A\u001B\u007F\u200B-\u200F\uFEFF]',
    'g')
);

export { removeOuterBrackets, replaceDivWithSpan,
  replaceQuotesWithPlaceholder, revertQuotesPlaceholder,
  zeroLengthStringsRegexp };
