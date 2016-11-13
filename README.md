CKEditor Cite Add On
====================

Adapted from the [CKEditor Footnotes Add On](https://github.com/andykirk/CKEditorFootnotes), extending the additional functionality which is:

> Allows for the easy creation of footnotes inside a CKEditor instance.

> Makes use of Widgets to allow for drag and drop reordering of footnote markers. Automatically reorders the footnotes and renumbers the markers.

> Supports multiple instances of the same footnote and presents footnotes in the style of Wikipedia.

> PLEASE NOTE: jQuery is required for this plugin to work.

The existing Footnotes add on auto numbers the intext footnote markers (eg: <a>[1]</a>), the Cite Add On offers the following additional functionality:

1. Allows for footnote markers to be customized to confirm to academic journal in-text citation standards, for example instead of 

<a>[1]</a> 

we could create a marker that looks like this:

Laemmli <a>1970</a>

2. In-text citations can be edited, multiple markers citing the same reference, could have different marker text/anchors.

3. Create footnotes through API call external to CKEDITOR.

Checkout demo.html which presents the functionality in a nutshell.

## Installation

1. Clone this repo and run `demo.html`; or

2. Copy the `ckeditor/plugins/cite` directory to your ckeditor plugins folder, add `cite` to your config.plugins variable in `ckeditor/config.js`.

