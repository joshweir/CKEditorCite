CKEditor Cite Plugin
====================

Adapted from the [CKEditor Footnotes Plugin](https://github.com/andykirk/CKEditorFootnotes), extending the additional functionality which is:

> Allows for the easy creation of footnotes inside a CKEditor instance.

> Makes use of Widgets to allow for drag and drop reordering of footnote markers. Automatically reorders the footnotes and renumbers the markers.

> Supports multiple instances of the same footnote and presents footnotes in the style of Wikipedia.

> PLEASE NOTE: jQuery is required for this plugin to work.

The existing [CKEditor Footnotes Plugin](https://github.com/andykirk/CKEditorFootnotes) auto numbers the intext footnote markers (eg: <a>[1]</a>), this plugin offers the following additional functionality:

1. Allows for footnote markers to be customized to confirm to academic journal in-text citation standards, for example instead of **[1]** we could create a marker that looks like this: **Laemmli 1970**.

2. In-text citations can be edited, multiple markers citing the same reference, could have different marker text/anchors.

3. Create footnotes through API call external to CKEDITOR.

4. Adjacent In-text citations are automatically grouped together. eg. [1, 2]

Demo: `demo/demo.html`.

## Installation

Clone this repo and run `demo/demo.html`; or

Copy the `ckeditor/plugins/cite` directory to your ckeditor plugins folder, add `cite` to the `config.plugins` variable in `ckeditor/config.js`.
Add the following to `ckeditor/config.js`: 

    config.plugins = 'dialogui,dialog,basicstyles,entities,wysiwygarea,fakeobjects,lineutils,widget,menu,contextmenu,floatpanel,panel,undo,cite';`
	config.extraAllowedContent = 'div h1 h2 h3 sup cite section b i strong span[data-*](*){*}';`

The Cite Plugin uses custom styles found in `styles/plugin.css`. These styles are automatically loaded when using the traditional iframe-based CKEditor. However, if you are using Inline mode, you need to add this stylesheet to the `<head>` section of any html pages that use the Inline editor.