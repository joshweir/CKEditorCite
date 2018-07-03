import './styles/plugin.css';
import { getExternalIds, init, insert,
  updateCitationsByExternalId } from './modules/ck-plugin';

declare var CKEDITOR: any;
declare var jQuery: any;

jQuery.fn.reverse = [].reverse;

CKEDITOR.plugins.add('cite', {
  init,
  insert,
  updateCitationsByExternalId,
  getExternalIds,
  requires: 'widget,contextmenu,wysiwygarea,dialogui,dialog,' +
            'basicstyles,menu,contextmenu,floatpanel,panel',
  icons: 'cite',
  isValidHtml: () => true,
});
