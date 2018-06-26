const contentFrom = editor => editor.editable().$;
const footnotesHeaderEls = ({ config: { footnotesHeaderEls: headerEls } }) => (
  headerEls || ['<h2>', '</h2>']
);
const footnotesPrefix = ({ config: { footnotesPrefix: prefix } }) => (
  prefix ? `-${prefix}` : ''
);
const footnotesTitle = ({ config: { footnotesTitle: title } }) => (
  title || 'References'
);

export { contentFrom, footnotesHeaderEls, footnotesPrefix, footnotesTitle };
