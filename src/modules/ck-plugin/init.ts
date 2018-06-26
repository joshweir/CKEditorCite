import editor from './editor';

declare var CKEDITOR: any;
declare var jQuery: any;

export default (ed : any) => {
  editor.set(ed);
  /*
  // Check for jQuery
  // @TODO - remove if/when JQ dep. is removed.
  if (typeof(jQuery) === 'undefined') {
    console.warn('jQuery required but undetected so quitting cite.');
    return false;
  }
  // Allow `cite` to be editable:
  CKEDITOR.dtd.$editable['span'] = 1;
  _editor = editor;
  _editor.addContentsCss(this.path + 'styles/plugin.css');
  this.initWidgets();
  this.setupEditorEventHandlers();
  */
};
