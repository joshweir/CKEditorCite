(function($) {
    "use strict";
	
    // Dialog definition.
    CKEDITOR.dialog.add( 'intextCiteDialog', function( editor ) {
		return {
            editor_name: false,
            // Basic properties of the dialog window: title, minimum size.
            title: 'Edit In-Text Citation',
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
                            class: 'edit_footnote_text',
                            label: 'In-Text Citation Marker:',
                            inputStyle: 'height: 100px',
                        },
						{
							type: 'html',
							html: '<p style="color: grey; font-style: italic;">The In-Text Citation must contain ' + 
								'the link anchor tags.<br /> eg: Laemmli [!a!]1970[/!a!] <br />[!a!] = The open of' + 
								' the link anchor<br />[/!a!] = The close of the link anchor</p>'
						},
                        {
                            // Text input field for the footnotes title (explanation).
                            type: 'text',
                            id: 'footnote_preview',
                            name: 'footnote_preview',
                            label: 'Preview:',
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
								$el.append('<style>.validation-error{color: #B14644; padding: 0 0 10px;} ' + 
									'.intext-citation-preview a{color: blue; text-decoration: underline; ' + 
									'pointer-events: none; cursor: default;}</style><div style="padding: ' + 
									'10px 0 10px 10px; border: solid 1px #B6B6B6;" class="intext-citation-preview"></div>');
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
				var $this = this;
                var dialog = this;

				//clear any validation messages
				$('.intext-citation-validation').html('');

                // Allow page to scroll with dialog to allow for many/long footnotes
                // (https://github.com/andykirk/CKEditorFootnotes/issues/12)
                jQuery('.cke_dialog').css({'position': 'absolute', 'top': '2%'});

                var current_editor_id = dialog.getParentEditor().id;
				
                CKEDITOR.replaceAll( function( textarea, config ) {
					// Make sure the textarea has the correct class:
                    if (!textarea.className.match(/edit_footnote_text/)) {
                        return false;
                    }
					dialog.editor_name = textarea.id;
                    // Make sure we only instantiate the relevant editor:
                    var el = textarea;
                    while ((el = el.parentElement) && !el.classList.contains(current_editor_id));
                    if (!el) {
                        return false;
                    }
                    /*
                    config.toolbarGroups = [
                        { name: 'editing',     groups: [ 'undo', 'find', 'selection', 'spellchecker' ] },
                        { name: 'clipboard',   groups: [ 'clipboard' ] },
                        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                    ]
                    */
                    config.toolbar_Basic = [['Bold','Italic']];
					config.toolbar = 'Basic';
                    config.allowedContent = 'em strong; a[!href]';
                    config.enterMode = CKEDITOR.ENTER_BR;
                    config.autoParagraph = false;
                    config.height = 40;
                    config.resize_enabled = false;
                    config.autoGrow_minHeight = 40;
                    config.removePlugins = 'cite';
                    config.on = {
                        instanceReady: function(evt) {
							$(this.editable().$).css('margin','10px');
							var intext_citation_text = $(editor.widgets.focused.element.$).attr('data-inline-citation');
							if (!intext_citation_text) {
								intext_citation_text = $(editor.widgets.focused.element.$).text();
								intext_citation_text = '[!a!]' + intext_citation_text.replace(/\[!quot!\]/g,'&quot;') + '[/!a!]';
							}
							else intext_citation_text = intext_citation_text.replace(/\[!quot!\]/g,'&quot;');
							this.insertHtml(intext_citation_text);
							$('.intext-citation-preview').html(
								$(this.editable().$).html().replace(/\[!quot!\]/g,'&quot;').replace('[!a!]','<a href="#">')
									.replace('[/!a!]','</a>'));      
						},
                        change: function(evt) {
							$('.intext-citation-preview').html(
								$(this.editable().$).html().replace(/\[!quot!\]/g,'&quot;').replace('[!a!]','<a href="#">')
									.replace('[/!a!]','</a>'));      
						}
                    };
                    return true;
                });
            },

            // This method is invoked once a user clicks the OK button, confirming the dialog.
            onOk: function() {
				var dialog = this;
                var footnote_editor = CKEDITOR.instances[dialog.editor_name];
                var footnote_data   = CKEDITOR.instances[dialog.editor_name].getData(); 
                
				if (!footnote_data.match(/\[!a!\].+\[\/!a!\]/)) {
					$('.intext-citation-validation').html("The In-Text Citation must contain the link " + 
						"anchor tags with text between them<br>eg: Weinberg [!a!]1967[/!a!].");
					return false;
				}
				else $('.intext-citation-validation').text("");
				footnote_editor.destroy();
				
				//get chunk before, within and after link anchors
				var parts = footnote_data.split(/\[!a!\]/);
				var parts_2 = parts[1].split(/\[\/!a!\]/);
				//replace the span before anchor, span after anchor, text within the anchor
				$(editor.widgets.focused.element.$).find('.inline-citation-before-link').html(parts[0]);
				$(editor.widgets.focused.element.$).find('.inline-citation-after-link').html((parts_2[1] ? parts_2[1] : ''));
				$(editor.widgets.focused.element.$).find('a').html(parts_2[0]);
				
				//replace the data-inline-citation attribute
				$(editor.widgets.focused.element.$).attr('data-inline-citation',footnote_data);
				
                return;
            },

            onCancel: function() {
                var dialog = this;
				var footnote_editor = CKEDITOR.instances[dialog.editor_name];
                footnote_editor.destroy();
            }
        };
    });
}(window.jQuery));
