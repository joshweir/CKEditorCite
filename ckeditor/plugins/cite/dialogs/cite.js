(function($) {
    "use strict";

    // Dialog definition.
    CKEDITOR.dialog.add( 'citeDialog', function( editor ) {

        return {
            editor_name: false,
            // Basic properties of the dialog window: title, minimum size.
            title: 'Insert Citation',
            minWidth: 400,
            minHeight: 200,
            footnotes_el: false,

            // Dialog window contents definition.
            contents: [
                {
                    // Definition of the Basic Settings dialog tab (page).
                    id: 'tabbasic',
                    label: 'Basic Settings',

                    // The tab contents.
                    elements: [
                        {
                            // Text input field for the footnotes text.
                            type: 'textarea',
                            id: 'new_footnote',
                            'class': 'citation_footnote_text',
                            label: 'New Citation:',
                            inputStyle: 'height: 100px',
                        },
						{
							type: 'html',
							html: '<p style="color: grey; font-style: italic;">eg: Laemmli, U. K. (1970). Cleavage of Structural Proteins<br>during the Assembly of the Head of Bacteriophage T4. Nature, 227(5259), 680-685.</p>'
						},
						{
                            // Text input field for the footnotes text.
                            type: 'textarea',
                            id: 'new_intext_marker',
                            'class': 'intext_footnote_text',
                            label: 'In-text Citation Marker:',
                            inputStyle: 'height: 100px',
                        },
						{
							type: 'html',
							html: '<p style="color: grey; font-style: italic;">The In-Text Citation must contain the link anchor tags.<br /> eg: Laemmli [!a!]1970[/!a!] <br />[!a!] = The open of the link anchor<br />[/!a!] = The close of the link anchor<br>Leave blank for auto-numbered citation marker.</p>'
						},
                        {
                            // Text input field for the footnotes title (explanation).
                            type: 'text',
                            id: 'intext_footnote_preview',
                            name: 'intext_footnote_preview',
                            label: 'In-text Citation Preview:',
                            // Called by the main setupContent call on dialog initialization.
                            setup: function( element ) {
                                var dialog = this.getDialog(),
                                    $el = $('#' + this.domId),
                                    $footnotes, $this;
                                dialog.footnotes_el = $el;
                                editor = dialog.getParentEditor();
                                $this = this;
								//add preview block 
								$el.children('div').css('display', 'none');
								$el.append('<style>.validation-error{color: #B14644; padding: 0 0 10px;} .intext-citation-preview a{color: blue; text-decoration: underline; pointer-events: none; cursor: default;}</style><div style="padding: 10px 0 10px 10px; border: solid 1px #B6B6B6;" class="intext-citation-preview"></div>');
								if (!$('.intext-citation-validation').length)
									$('<div class="intext-citation-validation validation-error"></div>').insertBefore($el);
							}
                        }
                    ]
                },
            ],

            // Invoked when the dialog is loaded.
            onShow: function() {
                this.setupContent();
                var dialog = this;
                //clear any validation messages
				$('.intext-citation-validation').html('');
				
                // Allow page to scroll with dialog to allow for many/long footnotes
                // (https://github.com/andykirk/CKEditorFootnotes/issues/12)
                jQuery('.cke_dialog').css({'position': 'absolute', 'top': '2%'});

                var current_editor_id = dialog.getParentEditor().id;

                CKEDITOR.replaceAll( function( textarea, config ) {
                    // Make sure the textarea has the correct class:
                    if (!textarea.className.match(/citation_footnote_text/) &&
						!textarea.className.match(/intext_footnote_text/)) {
                        return false;
                    }
					if (textarea.className.match(/intext_footnote_text/))
						dialog.intext_editor_name = textarea.id;
					else 
						dialog.citation_editor_name = textarea.id;
                    // Make sure we only instantiate the relevant editor:
                    var el = textarea;
                    while ((el = el.parentElement) && !el.classList.contains(current_editor_id));
                    if (!el) {
                        return false;
                    }
                    config.toolbarGroups = [
                        { name: 'editing',     groups: [ 'undo', 'find', 'selection', 'spellchecker' ] },
                        { name: 'clipboard',   groups: [ 'clipboard' ] },
                        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                    ]
                    config.allowedContent = 'br em strong; a[!href]';
                    config.enterMode = CKEDITOR.ENTER_BR;
                    config.autoParagraph = false;
                    config.height = 80;
                    config.resize_enabled = false;
                    config.autoGrow_minHeight = 80;
                    config.removePlugins = 'cite';
                    config.on = {
						instanceReady: function(evt) {
							$(this.editable().$).css('margin','10px');
							if (textarea.className.match(/intext_footnote_text/)) 
								$('.intext-citation-preview').html($('<div/>').text('[!a!][1][/!a!]').html().replace('[!a!]','<a href="#">').replace('[/!a!]','</a>')); 
						},
                        change: function(evt) {
							if (textarea.className.match(/intext_footnote_text/)) 
								$('.intext-citation-preview').html($('<div/>').text($(this.editable().$).text()).html().replace('[!a!]','<a href="#">').replace('[/!a!]','</a>')); 
						}
                    };
                    return true;
                });

            },

            // This method is invoked once a user clicks the OK button, confirming the dialog.
            onOk: function() {
                var dialog = this;
                var citation_data = CKEDITOR.instances[dialog.citation_editor_name].getData();
				var intext_citation_data = CKEDITOR.instances[dialog.intext_editor_name].getData();
                if (intext_citation_data && !intext_citation_data.match(/\[!a!\].+\[\/!a!\]/)) {
					$('.intext-citation-validation').html("The In-Text Citation must contain the link anchor tags with text between them<br>eg: Weinberg [!a!]1967[/!a!].");
					return false;
				}
				else
				if (!citation_data) {
					$('.intext-citation-validation').html("New Citation is required.");
					return false;
				}
				else $('.intext-citation-validation').text("");
				
				CKEDITOR.instances[dialog.citation_editor_name].destroy();
				CKEDITOR.instances[dialog.intext_editor_name].destroy();
				CKEDITOR.instances.doc.plugins.cite.insertCitation(
					citation_data, editor, intext_citation_data);
                return;
            },

            onCancel: function() {
                var dialog = this;
                CKEDITOR.instances[dialog.intext_editor_name].destroy();
				CKEDITOR.instances[dialog.citation_editor_name].destroy();
            }
        };
    });
}(window.jQuery));
