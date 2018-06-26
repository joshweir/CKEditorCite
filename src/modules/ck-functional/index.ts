const contentFrom = editor => editor.editable().$;
const footnotesPrefix = ({ config: { footnotesPrefix: prefix } }) => (
  prefix ? `-${prefix}` : ''
);

export { contentFrom, footnotesPrefix };
