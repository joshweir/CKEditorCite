
// Register the plugin within the editor.
;(function($) {
    "use strict";
	
    CKEDITOR.plugins.add( 'cite', {

        footnote_ids: [],
		requires: 'widget,contextmenu',
        icons: 'cite',
		
        // The plugin initialization logic goes inside this method.
        init: function(editor) {
            // Check for jQuery
            // @TODO - remove if/when JQ dep. is removed.
            if (typeof(window.jQuery) == 'undefined') {
                console.warn('jQuery required but undetected so quitting cite.');
                return false;
            }

            // Allow `cite` to be editable:
            CKEDITOR.dtd.$editable['cite'] = 1;
			
            // Add some CSS tweaks:
            var css = '.footnotes{background:#eee; padding:1px 15px;} .footnotes cite{font-style: normal;} .hidden{display: none;}';
            CKEDITOR.addCss(css);

            var $this = this;

            /*editor.on('saveSnapshot', function(evt) {
                console.log('saveSnapshot');
            });*/

            // Force a reorder on startup to make sure all vars are set: (e.g. footnotes store):
            editor.on('instanceReady', function(evt) {
                $this.reorderMarkers(editor, 'startup');
            });
            
            //unselect any focused sup widgets if user clicks away from the editor, as if they then 
            //going to insert a citation external to ckeditor, we dont want to overwrite any existing citation markers
            editor.on('blur', function() {
				if (editor.widgets.focused) {
					$('<span class="dummyF">&nbsp;</span>').insertAfter($(editor.widgets.focused.element.$).parent());
					var sel = editor.getSelection(); 
					var range = editor.createRange();
					range.setStart( editor.document.find('span.dummyF').getItem(0), 0 ); 
					range.setEnd( editor.document.find('span.dummyF').getItem(0), 0 ); 
					editor.getSelection().selectRanges( [ range ] );
					$contents.find('span.dummyF').each(function(){
						$(this).remove();
					});
				}
			});
			
            // Add the reorder change event:
            editor.on('change', function(evt) {
                var d = new Date();
				var now = d.getTime();
				//set a locally stored timestamp to prevent an endless loop when reordering markers below..
				var upd = localStorage.getItem('reordering_markers');
				if(!upd) {
					localStorage.setItem('reordering_markers', now);
				} 
				
                // Prevent no selection errors:
                if (!evt.editor.getSelection() || !evt.editor.getSelection().getStartElement()) {
                    return;
                }
                // Don't reorder the markers if editing a cite:
                var footnote_section = evt.editor.getSelection().getStartElement().getAscendant('section');
                if (footnote_section && footnote_section.$.className.indexOf('footnotes') != -1) {
                    return;
                }
				if(localStorage.getItem('reordering_markers') == d.getTime()) {
					// SetTimeout seems to be necessary (it's used in the core but can't be 100% sure why)
					setTimeout(function(){
							//reorder markers on change
							$this.reorderMarkers(editor, 'change');
						},
						0
					);
				}
				//prevent an endless loop of reorderingMarkers on change
				setTimeout(function() {
					localStorage.removeItem('reordering_markers');
				  }, 200);
            });
			
			editor.on('change', function(evt) {
				//store the current value of footnotes citations against 
				//their inline citations as they may have been changed 
				//by the user and will be needed when footnotes are rebuilt
				var $contents = $(editor.editable().$);
				//get the current footnotes section header 
				var $footnotes_header = $contents.find('.footnotes header h2').html();
				$contents.find('.footnotes li cite').each(function(){
					var $cite = $(this);
					var footnote_id = $(this).parent('li').attr('data-footnote-id');
					$contents.find('sup[data-footnote-id='+ footnote_id +']').each(function(){
						$(this).attr('data-citation-modified', $cite.html().replace(/"/,'[!quot!]').replace('&quot;','[!quot!]') );
						if ($footnotes_header)
							$(this).attr('data-footnotes-heading', $footnotes_header.replace(/"/,'[!quot!]').replace('&quot;','[!quot!]') );
					});
				});
			});
			
            // Build the initial footnotes widget editables definition:
            var prefix = editor.config.footnotesPrefix ? '-' + editor.config.footnotesPrefix : '';
            var def = {
                header: {
                    selector: 'header > *',
                    //allowedContent: ''
                    allowedContent: 'strong em span sub sup;'
                }
            };
			var def2 = {};
            var contents = $('<div>' + editor.element.$.textContent + '</div>')
                     , footnotes = contents.find('.footnotes li')
					 , l = footnotes.length
                     , i = 1
					 , footnote_id;
            contents.find('.footnotes li').each(function(){
				footnote_id = $(this).attr('data-footnote-id');
				def['footnote_' + i] = {selector: '#footnote' + prefix + '-' + footnote_id + ' cite', allowedContent: 'a[href]; cite[*](*); strong em span br i'};
				i++;
			});
			i = 1;
			contents.find('sup[data-footnote-id]').each(function(){
				def2['marker_before_' + i] = {selector: 'span.inline-citation-before-link', allowedContent: 'strong em span i'};
				def2['marker_after_' + i] = {selector: 'span.inline-citation-after-link', allowedContent: 'strong em span i'};
				i++;
			});
			
            // Register the footnotes widget.
            editor.widgets.add('footnotes', {

                // Minimum HTML which is required by this widget to work.
                requiredContent: 'section(footnotes)',

                // Check the elements that need to be converted to widgets.
                upcast: function(element) {
                    return element.name == 'section' && element.hasClass('footnotes');
                },

                editables: def
            });

            // Register the footnotemarker widget.
            editor.widgets.add('footnotemarker', {

                // Minimum HTML which is required by this widget to work.
                requiredContent: 'sup[data-footnote-id]',

                // Check the elements that need to be converted to widgets.
                upcast: function(element) {
                    return element.name == 'sup' && element.attributes['data-footnote-id'] != 'undefined';
                }/*,
				
				editables: def2*/
            });
			
			// Define editor commands that open our dialogs
            editor.addCommand('cite', new CKEDITOR.dialogCommand('citeDialog', {
                allowedContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]',
                requiredContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]'
            }));

			editor.addCommand('intext_cite', new CKEDITOR.dialogCommand('intextCiteDialog', {
                allowedContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]',
                requiredContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]'
            }));

            // Create a toolbar button that executes the above command.
            editor.ui.addButton('Cite', {

                // The text part of the button (if available) and tooptip.
                label: 'Insert Citation',

                // The command to execute on click.
                command: 'cite',

                // The button placement in the toolbar (toolbar group name).
                toolbar: 'insert'
            });

            // Register dialogs
            CKEDITOR.dialog.add('citeDialog', this.path + 'dialogs/cite.js');
            CKEDITOR.dialog.add('intextCiteDialog', this.path + 'dialogs/intext_cite.js');
            
            editor.on('doubleclick', function(ev) {
				var selection = editor.getSelection();
				var el = selection.getStartElement();
				if (el.getName()=='span' && el.find('sup[data-footnote-id]')) {
					editor.execCommand('intext_cite');
				}
			});
			//add the Edit In-Text Citation right click menu item when right clicking 
			//in-text citations, remove the copy/cut/paste items.
			CKEDITOR.on('instanceReady', function(ev) {
				if (!editor._.menuItems.editCiteCmd) {
					editor.addMenuGroup('cite');
					var editCiteCmd = {
						command : 'editCiteCmd',
						group : 'cite'
					};
					editor.contextMenu.addListener(function(element, selection ) {
						//check element is sup[data-footnote-id]
						var ascendant = element.getAscendant( function( el ) {
							try {
								return el.getName()=='span' && el.find('sup[data-footnote-id]');
							}
							catch(e) {
								return null;
							}
						}, true );
						
						if ( ascendant ) {
							return {
								editCiteCmd : CKEDITOR.TRISTATE_ON
							};
						}
					});
					editor.addMenuItems({
						editCiteCmd : {
							label : 'Edit In-text Citation',
							command : 'intext_cite',
							group : 'cite',
							order : 2
						}
					});
					editor.removeMenuItem('paste');
					editor.removeMenuItem('copy');
					editor.removeMenuItem('cut');
				}
			});
        },

		isValidHtml: function(html) {
			var doc = document.createElement('div');
			doc.innerHTML = html;
			return ( doc.innerHTML === html );
		},

        insert: function(footnote, editor, inline_citation) {
			if (footnote && !this.isValidHtml(footnote)) {
				console.error('Error inserting citation, value for Citation ('+
					footnote+') is not valid html.');
				return;
			}
			if (inline_citation && !this.isValidHtml(inline_citation)) {
				console.error('Error inserting citation, value for In-text Citation ('+
					inline_citation+') is not valid html.');
				return;
			}
			var footnote_id = this.findFootnote(footnote, editor);
			var is_new = false;
			if (!footnote_id) {
				is_new = true;
				footnote_id = this.generateFootnoteId();
			}
			
			var $contents = $(editor.editable().$);	
			
			//if any sup widgets are currently focused, then place the cursor after them effectively unselecting the widget
			//this prevents overwriting the existing widget. 
			//have to use a dummy span, select this span then remove it - couldnt find another way.
			if (editor.widgets.focused) {
				$('<span class="dummyF">&nbsp;</span>').insertAfter($(editor.widgets.focused.element.$).parent());
				var sel = editor.getSelection(); 
				var range = editor.createRange();
				range.setStart( editor.document.find('span.dummyF').getItem(0), 0 ); 
				range.setEnd( editor.document.find('span.dummyF').getItem(0), 0 ); 
				editor.getSelection().selectRanges( [ range ] );
				$contents.find('span.dummyF').each(function(){
					$(this).remove();
				});
			}
			inline_citation = (inline_citation ? inline_citation.replace(/"/,'[!quot!]').replace('&quot;','[!quot!]') : null);
			footnote = footnote.replace(/"/,'[!quot!]').replace('&quot;','[!quot!]');
            // Insert the marker:
			var footnote_marker = '<sup data-citation="'+footnote+
				'" data-footnote-id="' + footnote_id + 
				'"'+
				' data-citation-modified="'+footnote+'"' +
				(inline_citation ? ' data-inline-citation="'+inline_citation+'"' : '')
				+'>X</sup>';
			editor.insertHtml(footnote_marker);
			$contents.find('sup[data-footnote-id]:contains(X)')
				.attr('data-citation', footnote)
				.attr('data-citation-modified', footnote);
			if (inline_citation)
				$contents.find('sup[data-footnote-id]:contains(X)')
					.attr('data-inline-citation', inline_citation);
			
			//create a dummy span so that below we can place the cursor after the inserted marker 
			//allowing the user to continue typing after insert
			$('<span class="dummyF">&nbsp;</span>').insertAfter($contents.find('sup[data-footnote-id]:contains(X)').parent('span'));
			//build the footnote if it is new
			if (is_new) {
                editor.fire('lockSnapshot');
                this.addFootnote(this.buildFootnote(footnote_id, footnote, false, editor, inline_citation), editor);
                editor.fire('unlockSnapshot');
            }
            this.reorderMarkers(editor,'build');
            console.log($contents.find('sup[data-footnote-id]').parent().html());
            //select after the inserted marker widget
            var sel = editor.getSelection(); 
			var range = editor.createRange();
			range.setStart( editor.document.find('span.dummyF').getItem(0), 0 ); 
			range.setEnd( editor.document.find('span.dummyF').getItem(0), 0 ); 
			editor.getSelection().selectRanges( [ range ] );
			$contents.find('span.dummyF').each(function(){
				$(this).remove();
			});
			editor.focus();
        },
		
		findFootnote: function(footnote, editor) {
			if (!editor.footnotes_store) return null;
			var footnote_id = null;
			footnote = footnote.replace(/"/,'[!quot!]').replace('&quot;','[!quot!]');
			for (var key in editor.footnotes_store) {
				if (editor.footnotes_store.hasOwnProperty(key)) {
					if (editor.footnotes_store[key] == footnote) {
						footnote_id = key;
						break;
					}
				}
			}
			return footnote_id;
		},

        buildFootnote: function(footnote_id, footnote_text, data, editor, inline_citation) {
            var links   = '',
                footnote,
                letters = 'abcdefghijklmnopqrstuvwxyz',
                order   = data ? data.order.indexOf(footnote_id) + 1 : 1,
                prefix  = editor.config.footnotesPrefix ? '-' + editor.config.footnotesPrefix : '';

            if (!inline_citation && data && data.occurrences[footnote_id] == 1) {
                links = '<a href="#footnote-marker' + prefix + '-' + footnote_id + '-1">^</a> ';
            } else if (!inline_citation && data && data.occurrences[footnote_id] > 1) {
                var i = 0
                  , l = data.occurrences[footnote_id]
                  , n = l;
                for (i; i < l; i++) {
                    links += '<a href="#footnote-marker' + prefix + '-' + footnote_id + '-' + (i + 1) + '">' + letters.charAt(i) + '</a>';
                    if (i < l-1) {
                        links += ', ';
                    } else {
                        links += ' ';
                    }
                }
            }
            footnote = '<li id="footnote' + prefix + '-' + footnote_id + '" data-footnote-id="' + footnote_id + '"' + 
				(inline_citation ? ' data-inline-citation="' + inline_citation + '"' : '') + '>' + 
				(inline_citation ? '' : '<sup>' + links + '</sup>') + '<cite>' + 
				footnote_text.replace('[!quot!]','&quot;') + '</cite></li>';
            return footnote;
        },

        addFootnote: function(footnote, editor, replace) {
            var $contents  = $(editor.editable().$);
            var $footnotes = $contents.find('.footnotes');

            if ($footnotes.length == 0) {
				var header_title = editor.config.footnotesTitle ? editor.config.footnotesTitle : 'Footnotes';
                var data_header_title = 
					$contents.find('sup[data-footnotes-heading]').attr('data-footnotes-heading');
				header_title = (data_header_title ? data_header_title : header_title).replace('[!quot!]','&quot;')  ;
				var header_els = ['<h2>', '</h2>'];//editor.config.editor.config.footnotesHeaderEls
                if (editor.config.footnotesHeaderEls) {
                    header_els = editor.config.footnotesHeaderEls;
                }
                var container = '<section class="footnotes"><header>' + header_els[0] + header_title + header_els[1] + '</header><ol>' + footnote + '</ol></section>';
                // Move cursor to end of content:
                var range = editor.createRange();
                range.moveToElementEditEnd(range.root);
                editor.getSelection().selectRanges([range]);
                // Insert the container:
                editor.insertHtml(container);
            } else {
                if (replace)
					$footnotes.find('ol').html(footnote);
				else 
					$footnotes.find('ol').append(footnote);
            }
        },

        generateFootnoteId: function() {
            var id = Math.random().toString(36).substr(2, 5);
            while ($.inArray(id, this.footnote_ids) != -1) {
                id = String(this.generateFootnoteId());
            }
            this.footnote_ids.push(id);
            return id;
        },

        reorderMarkers: function(editor, context) {
			editor.fire('lockSnapshot');
            var prefix  = editor.config.footnotesPrefix ? '-' + editor.config.footnotesPrefix : '';
            var $contents = $(editor.editable().$);
            var data = {
                order: [],
                occurrences: {},
				original_citation_text: [],
				inline_citation: [],
				modified_citation_text: []
            };
            var self = this;

            // Find all the markers in the document:
            var $markers = $contents.find('sup[data-footnote-id]');
            // If there aren't any, remove the Footnotes container:
            if ($markers.length == 0) {
                $contents.find('.footnotes').parent().remove();
                editor.fire('unlockSnapshot');
                return;
            }

            // Otherwise reorder the markers:
            var j = 0;
			var footnotes_heading;
			$markers.each(function(){
                j++;
				var footnote_id = $(this).attr('data-footnote-id')
                  , citation_text = $(this).attr('data-citation')
				  , citation_text_modified = $(this).attr('data-citation-modified')
				  , inline_citation_text = $(this).attr('data-inline-citation')
				  , marker_ref
                  , n = data.order.indexOf(footnote_id);
				// If this is the markers first occurrence:
				if (n == -1) {
                    // Store the id:
                    data.order.push(footnote_id);
					data.original_citation_text.push(citation_text);
					data.modified_citation_text.push(citation_text_modified);
					data.inline_citation.push(inline_citation_text);
                    n = data.order.length;
                    data.occurrences[footnote_id] = 1;
                    marker_ref = '1';
                } else {
                    // Otherwise increment the number of occurrences:
                    // (increment n due to zero-index array)
                    n++;
                    data.occurrences[footnote_id]++;
                    marker_ref = data.occurrences[footnote_id];
                }
                // Replace the marker contents:
                var marker = self.generateMarkerHtml(prefix, citation_text, 
								citation_text_modified, n, marker_ref, footnote_id, 
								inline_citation_text);
				$(this).html(marker);
            });

            // Prepare the footnotes_store object:
            editor.footnotes_store = {};
			
            // Then rebuild the Footnotes content to match marker order:
            var footnotes     = ''
              , footnote_text = ''
			  , footnote_text_modified = ''
			  , inline_citation_text = ''
              , footnote_id
              , i = 0
              , l = data.order.length;
            for (i; i < l; i++) {
                footnote_id   = data.order[i];
				footnote_text = data.original_citation_text[i]; //$contents.find('.footnotes [data-footnote-id=' + footnote_id + '] cite').html();
				footnote_text_modified = data.modified_citation_text[i];
				footnotes += this.buildFootnote(footnote_id, footnote_text_modified, data, editor);
                // Store the footnotes for later use (post cut/paste):
                editor.footnotes_store[footnote_id] = footnote_text;
			}
			
			// Insert the footnotes into the list:
            this.addFootnote(footnotes, editor, true);
			
            // Next we need to reinstate the 'editable' properties of the footnotes.
            // (we have to do this individually due to Widgets 'fireOnce' for editable selectors)
            var el = $contents.find('.footnotes')
              , n
              , footnote_widget;
            // So first we need to find the right Widget instance:
            // (I hope there's a better way of doing this but I can't find one)
            for (i in editor.widgets.instances) {
                if (editor.widgets.instances[i].name == 'footnotes') {
                    footnote_widget = editor.widgets.instances[i];
                    break;
                }
            }
			if (footnote_widget) {
				// Then we `initEditable` each footnote, giving it a unique selector:
				i = 1;
				$contents.find('.footnotes li').each(function(){
					footnote_id = $(this).attr('data-footnote-id');
					footnote_widget.initEditable('footnote_' + i, {selector: '#footnote' + prefix + '-' + footnote_id +' cite', allowedContent: 'a[href]; cite[*](*); em strong span i'});
					i++;
				});
			}
			/*
			for (i in editor.widgets.instances) {
                if (editor.widgets.instances[i].name == 'footnotemarker') {
                    editor.widgets.instances[i]
						.initEditable('marker_before_' + i, 
							{selector: 'span.inline-citation-before-link', 
							 allowedContent: 'em strong span i'});
					editor.widgets.instances[i]
						.initEditable('marker_after_' + i, 
							{selector: 'span.inline-citation-after-link', 
							 allowedContent: 'em strong span i'});
                }
            }
            */
            editor.fire('unlockSnapshot');
        },
        
        generateMarkerHtml: function(prefix, citation_text, citation_text_modified, n, marker_ref, footnote_id, inline_citation) {
			var the_html = '';
			citation_text = citation_text.replace(/"/,'[!quot!]').replace('&quot;','[!quot!]');
			citation_text_modified = citation_text_modified.replace(/"/,'[!quot!]').replace('&quot;','[!quot!]');
			if (citation_text && !this.isValidHtml(citation_text)) {
				console.error('Error generatingMarkerHtml, value for Citation ('+
					citation_text+') is not valid html.');
				return;
			}
			if (citation_text_modified && !this.isValidHtml(citation_text_modified)) {
				console.error('Error generatingMarkerHtml, value for Citation (modified) ('+
					citation_text_modified+') is not valid html.');
				return;
			}
			if (inline_citation) {
				inline_citation = inline_citation.replace(/"/,'[!quot!]').replace('&quot;','[!quot!]');
				if (inline_citation && !this.isValidHtml(inline_citation)) {
					console.error('Error generatingMarkerHtml, value for In-text Citation ('+
						inline_citation+') is not valid html.');
					return;
				}
				//inline_citation will include an anchor placement so could be like this:
				//Clark et al. [!a!]2015[/!a!] foo
				//if there are no anchors, assume anchor around the entire inline citation 
				if (!inline_citation.match(/\[!a!\]/)) {
					the_html = '<span class="inline-citation-before-link"></span><a href="#footnote' + prefix + 
					'-' + footnote_id + '" id="footnote-marker' + prefix + '-' + footnote_id + '-' + marker_ref + 
						'" data-citation="'+citation_text+'"'+
						' data-citation-modified="'+citation_text_modified+'"' +
						' data-inline-citation="'+
						inline_citation+'" data-footnote-id="' + 
						footnote_id + '">' + inline_citation.replace('[!quot!]','&quot;') + '</a><span class="inline-citation-after-link"></span>';
				}
				//else, split by opening anchor 
				//	in 1st part, keep that to join at the end 
				//	then in 2nd part, split by closing anchor,
				//		then with 1st part, wrap this in the anchor
				//		with 2nd part, keep this to join at the end. 
				else {
					var parts = inline_citation.split(/\[!a!\]/);
					var parts_2 = parts[1].split(/\[\/!a!\]/);
					the_html = '<span class="inline-citation-before-link">'+parts[0].replace('[!quot!]','&quot;') +'</span>' + '<a href="#footnote' + 
						prefix + '-' + footnote_id + '" id="footnote-marker' + prefix + '-' + footnote_id + '-' + marker_ref + 
						'" data-citation="'+citation_text+'"'+
						' data-citation-modified="'+citation_text_modified+'"' +
						' data-inline-citation="'+inline_citation+
						'" data-footnote-id="' + footnote_id + '">' + parts_2[0].replace('[!quot!]','&quot;')  + '</a>' + 
						'<span class="inline-citation-after-link">'+(parts_2[1] ? parts_2[1] : '').replace('[!quot!]','&quot;') +'</span>';
				}
			}
			else {
				the_html = '<a href="#footnote' + prefix + '-' + footnote_id + '" id="footnote-marker' + prefix + '-' + 
					footnote_id + '-' + marker_ref + 
					'" data-citation="'+citation_text+'"'+
					' data-citation-modified="'+citation_text_modified+'"' +
					' data-footnote-id="' + footnote_id + '">[' + n + ']</a>';
			}
			return the_html;
		}
    });
}(window.jQuery));
