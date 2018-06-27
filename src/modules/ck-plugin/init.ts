import { initWidgets, initEventHandlers } from './index';
import store from '../store/store';

declare var CKEDITOR: any;
declare var jQuery: any;

export default function (editor : any) {
  // Check for jQuery
  // @TODO - remove if/when JQ dep. is removed.
  if (typeof(jQuery) === 'undefined') {
    console.warn('jQuery required but undetected so quitting cite.');
    return false;
  }
  // Allow `cite` to be editable:
  CKEDITOR.dtd.$editable['span'] = 1;
  editor.addContentsCss(`${this.path}styles/plugin.css`);
  store.reset(), store.set({ editor });
  initWidgets(this), initEventHandlers();
}
