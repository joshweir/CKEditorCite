
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
			CKEDITOR.dtd.$editable['sup'] = 1;
			CKEDITOR.dtd.$editable['span'] = 1;
			
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
				//setup a hidden div to use for ckeditor auto html cleaning 
				//of citatino texts if they dont confirm to html - ckeditor auto fixes
				/*
				var $contents = $(editor.editable().$);
				if (!$contents.find('.cite-cleaner').length)
					$contents.prepend('<div class="cite-cleaner hidden"></div>');
				*/
            });
			
            // Add the reorder change event:
            editor.on('change', function(evt) {
                var d = new Date();
				var now = d.getTime();
				var upd = localStorage.getItem('reordering_markers');
				if(!upd) {
					localStorage.setItem('reordering_markers', now);
				} 
				
                // Copy the footnotes_store as we may be doing a cut:
                if(!evt.editor.footnotes_tmp) {
                    evt.editor.footnotes_tmp = evt.editor.footnotes_store;
                }
				if(!evt.editor.footnotes_inline_tmp) {
                    evt.editor.footnotes_inline_tmp = evt.editor.footnotes_inline_store;
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
				//by the user
				var $contents = $(editor.editable().$);
				//get the current footnotes section header 
				var $footnotes_header = $contents.find('.footnotes header h2').html();
				$contents.find('.footnotes li cite').each(function(){
					var $cite = $(this);
					var footnote_id = $(this).parent('li').attr('data-footnote-id');
					$contents.find('sup[data-footnote-id='+ footnote_id
						+']').each(function(){
						$(this).attr('data-citation-modified',
							$cite.html());
						if ($footnotes_header)
							$(this).attr('data-footnotes-heading', 
								$footnotes_header);
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
			//for (i; i <= l; i++) {
			//	footnote_id = footnotes.attr('data-footnote-id');
            //    def['footnote_' + i] = {selector: '#footnote' + prefix + '-' + i + ' cite', allowedContent: 'a[href]; cite[*](*); strong em span br i'};
            //}

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
			
			// Define an editor command that opens our dialog.
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
			
			editor.on( 'dialogShow', function( dialogShowEvent )
			{
				var selectorObj = dialogShowEvent.data._.contents.tabbasic.new_footnote;
				
				// Watch for the "change" event to be fired for the element you 
				// created a reference to (a select element in this case).
				selectorObj.on( 'change', function( changeEvent )
				{
					alert("selectorObj Changed");
				});
			});
            
			CKEDITOR.on('instanceReady', function(ev) {
				if (!editor._.menuItems.editCiteCmd) {
					editor.addMenuGroup('cite');
					editor.addCommand('editCiteCmd', {
						exec : function( editor ) {
							alert('editCiteCmd');
						}
					});
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

		insertCitation: function(footnote, editor, inline_citation) {
            this.build(footnote, editor, (inline_citation ? inline_citation : null));
		},

        build: function(footnote, editor, inline_citation) {
			var footnote_id = this.findFootnote(footnote, editor);
			var is_new = false;
			if (!footnote_id) {
				is_new = true;
				footnote_id = this.generateFootnoteId();
			}
			
            // Insert the marker:
			var $contents = $(editor.editable().$);	
			/*		
			if (!$contents.find('.cite-cleaner').length)
				$contents.prepend('<div class="cite-cleaner hidden"></div>');
			$contents.find('.cite-cleaner').html(footnote);
			var cleaned_footnote = $contents.find('.cite-cleaner').html();
			if (!cleaned_footnote) console.error('Couldnt find data in cite-cleaner');
			$contents.find('.cite-cleaner').html(inline_citation);
			var cleaned_inline_citation = $contents.find('.cite-cleaner').html();
			*/
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
			$('<span class="dummyF">&nbsp;</span>').insertAfter($contents.find('sup[data-footnote-id]:contains(X)').parent('span'));
			
			if (is_new) {
                editor.fire('lockSnapshot');
                this.addFootnote(this.buildFootnote(footnote_id, footnote, false, editor, inline_citation), editor);
                editor.fire('unlockSnapshot');
            }
            this.reorderMarkers(editor,'build');
            
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
			/*
			//firstly insert the footnote into a hidden div in the ckeditor 
			//so ckeditor can clean the string if it is not valid html 
			//then retrieve it back as the footnote 
			var $contents = $(editor.editable().$);
			if (!$contents.find('.cite-cleaner').length)
				$contents.prepend('<div class="cite-cleaner hidden"></div>');
			$contents.find('.cite-cleaner').html(footnote);
			var cleaned_footnote = $contents.find('.cite-cleaner').html();
			if (!cleaned_footnote) console.error('Couldnt find data in cite-cleaner');
			*/
			var footnote_id = null;
			for (var key in editor.footnotes_store) {
				if (editor.footnotes_store.hasOwnProperty(key)) {
					//console.log('store: ', editor.footnotes_store[key], ' footnote: ', footnote);
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
				footnote_text + '</cite></li>';
            return footnote;
        },

        addFootnote: function(footnote, editor, replace) {
            var $contents  = $(editor.editable().$);
            var $footnotes = $contents.find('.footnotes');

            if ($footnotes.length == 0) {
				var header_title = editor.config.footnotesTitle ? editor.config.footnotesTitle : 'Footnotes';
                var data_header_title = 
					$contents.find('sup[data-footnotes-heading]').attr('data-footnotes-heading');
				header_title = (data_header_title ? data_header_title : header_title);
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
				//console.log(citation_text);
				//console.log(citation_text_modified);
                if (n == -1) {
                    // Store the id:
                    data.order.push(footnote_id);
					data.original_citation_text.push(citation_text);
					data.modified_citation_text.push(citation_text_modified);
					data.inline_citation.push(inline_citation_text);
                    n = data.order.length;
                    data.occurrences[footnote_id] = 1;
                    //marker_ref = n + '-1';
					marker_ref = '1';
                } else {
                    // Otherwise increment the number of occurrences:
                    // (increment n due to zero-index array)
                    n++;
                    data.occurrences[footnote_id]++;
                    //marker_ref = n + '-' + data.occurrences[footnote_id];
					marker_ref = data.occurrences[footnote_id];
                }
                // Replace the marker contents:
                var marker = self.generateMarkerHtml(prefix, citation_text, citation_text_modified, n, marker_ref, footnote_id, 
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
				
				// If the footnotes text can't be found in the editor, it may be in the tmp store
                // following a cut:
                //if (!footnote_text) {
				//	footnote_text = (editor.footnotes_tmp && editor.footnotes_tmp[footnote_id] ? editor.footnotes_tmp[footnote_id] : null);
                //}
				
                footnotes += this.buildFootnote(footnote_id, footnote_text_modified, data, editor);
                // Store the footnotes for later use (post cut/paste):
                editor.footnotes_store[footnote_id] = footnote_text;
			}
			
			// Insert the footnotes into the list:
            //$contents.find('.footnotes ol').html(footnotes);
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
			if (inline_citation) {
				//inline_citation will include an anchor placement so could be like this:
				//Clark et al. [!a!]2015[/!a!] foo
				//if there are no anchors, assume anchor around the entire inline citation 
				if (!inline_citation.match(/\[!a!\]/)) {
					the_html = '<span class="inline-citation-before-link"></span><a href="#footnote' + prefix + '-' + footnote_id + '" id="footnote-marker' + prefix + '-' + footnote_id + '-' + marker_ref + 
						'" data-citation="'+citation_text+'"'+
						' data-citation-modified="'+citation_text_modified+'"' +
						' data-inline-citation="'+
						inline_citation+'" data-footnote-id="' + 
						footnote_id + '">' + inline_citation + '</a><span class="inline-citation-after-link"></span>';
				}
				//else, split by opening anchor 
				//	in 1st part, keep that to join at the end 
				//	then in 2nd part, split by closing anchor,
				//		then with 1st part, wrap this in the anchor
				//		with 2nd part, keep this to join at the end. 
				else {
					var parts = inline_citation.split(/\[!a!\]/);
					var parts_2 = parts[1].split(/\[\/!a!\]/);
					the_html = '<span class="inline-citation-before-link">'+parts[0]+'</span>' + '<a href="#footnote' + prefix + '-' + footnote_id + '" id="footnote-marker' + prefix + '-' + footnote_id + '-' + marker_ref + 
						'" data-citation="'+citation_text+'"'+
						' data-citation-modified="'+citation_text_modified+'"' +
						' data-inline-citation="'+inline_citation+
						'" data-footnote-id="' + footnote_id + '">' + parts_2[0] + '</a>' + 
						'<span class="inline-citation-after-link">'+(parts_2[1] ? parts_2[1] : '')+'</span>';
				}
			}
			else {
				the_html = '<a href="#footnote' + prefix + '-' + footnote_id + '" id="footnote-marker' + prefix + '-' + footnote_id + '-' + marker_ref + 
					'" data-citation="'+citation_text+'"'+
					' data-citation-modified="'+citation_text_modified+'"' +
					' data-footnote-id="' + footnote_id + '">[' + n + ']</a>';
			}
			return the_html;
		}
    });
}(window.jQuery));
