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
                            class: 'footnote_text',
                            label: 'In-Text Citation:',
                            inputStyle: 'height: 100px',
							//validate: 
							
							/*CKEDITOR.dialog.validate.regex(
								/\[!a!\]/, 
								"The In-Text Citation must contain the link anchor tags eg: Weinberg [!a!]1967[/!a!]." )/* && CKEDITOR.dialog.validate.regex(
								/\[\/!a!\]/, 
								"The In-Text Citation must contain the link anchor tags eg: Weinberg [!a!]1967[/!a!]." ),*/
                        },
						{
							type: 'html',
							html: '<p style="color: grey; font-style: italic;">The In-Text Citation must contain the link anchor tags.<br /> eg: Weinberg [!a!]1967[/!a!] <br />[!a!] = The open of the link anchor<br />[/!a!] = The close of the link anchor</p>'
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
                                // Dynamically add existing footnotes:
                                $footnotes = $(editor.editable().$).find('.footnotes ol');
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
				var $this = this;
                var dialog = this;
                CKEDITOR.on( 'instanceLoaded', function( evt ) {
                    dialog.editor_name = evt.editor.name;
                } );

                // Allow page to scroll with dialog to allow for many/long footnotes
                // (https://github.com/andykirk/CKEditorFootnotes/issues/12)
                jQuery('.cke_dialog').css({'position': 'absolute', 'top': '2%'});

                var current_editor_id = dialog.getParentEditor().id;
				
                CKEDITOR.replaceAll( function( textarea, config ) {
                    // Make sure the textarea has the correct class:
                    if (!textarea.className.match(/footnote_text/)) {
                        return false;
                    }

                    // Make sure we only instantiate the relevant editor:
                    var el = textarea;
                    while ((el = el.parentElement) && !el.classList.contains(current_editor_id));
                    if (!el) {
                        return false;
                    }
                    //console.log(el);
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
							var intext_citation_text = $(editor.widgets.focused.element.$).attr('data-inline-citation');
							if (!intext_citation_text) {
								intext_citation_text = $(editor.widgets.focused.element.$).text();
								intext_citation_text = '[!a!]' + intext_citation_text + '[/!a!]';
							}
							this.insertHtml(
								$('<div/>').text(intext_citation_text).html());  //.replace(/"/,'&quot;'));
						},
						
						focus: function( evt ){
                            var $editor_el = $('#' + evt.editor.id + '_contents');
                            $editor_el.parents('tr').next().find(':checked').attr('checked', false);
                            $editor_el.parents('tr').next().find(':text').val('');
                        },
                        
                        change: function(evt) {
							$('.intext-citation-preview').html($('<div/>').text($(this.editable().$).text()).html().replace('[!a!]','<a href="#">').replace('[/!a!]','</a>'));  //.replace(/"/,'&quot;'));
						}
                    };
                    return true;
                });
            },

            // This method is invoked once a user clicks the OK button, confirming the dialog.
            onOk: function() {
				var dialog = this;
                var footnote_editor = CKEDITOR.instances[dialog.editor_name];
                //var footnote_id     = dialog.getValueOf('tabbasic', 'footnote_id');
                var footnote_data   = footnote_editor.getData();
                
				if (!footnote_data.match(/\[!a!\]/) || 
					!footnote_data.match(/\[\/!a!\]/)) {
					$('.intext-citation-validation').html("The In-Text Citation must contain the link anchor tags<br />eg: Weinberg [!a!]1967[/!a!].");
					return false;
				}
				else $('.intext-citation-validation').text("");
				
				footnote_editor.destroy();
				
                if (footnote_id == '') {
                    // No existing id selected, check for new footnote:
                    if (footnote_data == '') {
                        // Nothing entered, so quit:
                        return;
                    } else {
                        // Insert new footnote:
                        editor.plugins.cite.build(footnote_data, true, editor);
                    }
                } else {
                    // Insert existing footnote:
                    editor.plugins.cite.build(footnote_id, false, editor);
                }
                // Destroy the editor so it's rebuilt properly next time:
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
