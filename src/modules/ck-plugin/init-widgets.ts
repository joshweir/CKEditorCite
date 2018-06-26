import store from '../store/store';

declare var CKEDITOR: any;
declare var $: any;

const retrieveFootnotesEditableElements = (editor : any, contents : any) => {
  const definition = {
    header: {
      selector: 'header > *',
      allowedContent: 'span[*](*); strong em sub sup;div[*](sup)',
    },
  };
  let i = 1;
  const footnotesPrefix = editor.config.footnotesPrefix;
  const prefix = footnotesPrefix ? `-${footnotesPrefix}` : '';
  contents.find('.footnotes li').each(function () {
    definition[`footnote_${i}`] = {
      selector: `#footnote${prefix}-${$(this).attr('data-footnote-id')} .cite`,
      allowedContent: 'a[href]; cite[*](*); span[*](*); strong em br i',
    };
    i += 1;
  });
  return definition;
};

const registerWidgets = (editor : any) => {
  editor.widgets.add('footnotes', {
    // Minimum HTML which is required by this widget to work.
    requiredContent: 'section(footnotes)',
    // Check the elements that need to be converted to widgets.
    upcast: ({ name, hasClass } : any) => (
      name === 'section' && hasClass('footnotes')
    ),
    editables: retrieveFootnotesEditableElements(
      editor, $(`<div>${editor.element.$.textContent}</div>`),
    ),
    draggable: false,
  });

  // Register the inline citation widget.
  editor.widgets.add('footnotemarker', {
    // Minimum HTML which is required by this widget to work.
    requiredContent: 'span[data-citation]',
    // Check the elements that need to be converted to widgets.
    upcast: ({ classes, attributes } : any) => (
      classes.indexOf('sup') > -1 &&
        attributes['data-footnote-id'] !== 'undefined'
    ),
    draggable: false,
  });
};

const addWidgetCommandsButtonsAndDialogs = (editor : any) => {
  // Define editor commands that open our dialogs
  editor.addCommand('cite', new CKEDITOR.dialogCommand('citeDialog', {
    allowedContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*];div[*](sup)',
    requiredContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*];div[*](sup)',
  }));

  editor.addCommand('intext_cite', new CKEDITOR.dialogCommand('intextCiteDialog', {
    allowedContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*];div[*](sup)',
    requiredContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*];div[*](sup)',
  }));

  // Create a toolbar button that executes the above command.
  editor.ui.addButton('Cite', {
    // The text part of the button (if available) and tooptip.
    label: 'Insert Citation',
    // The command to execute on click.
    command: 'cite',
    // The button placement in the toolbar (toolbar group name).
    toolbar: 'insert',
  });

  // Register dialogs
  CKEDITOR.dialog.add('citeDialog', this.path + 'dialogs/cite.js');
  CKEDITOR.dialog.add('intextCiteDialog', this.path + 'dialogs/intext_cite.js');
};

export default () => {
  const editor = store.get('editor');
  registerWidgets(editor);
  addWidgetCommandsButtonsAndDialogs(editor);
};
