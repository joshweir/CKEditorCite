
// Register the plugin within the editor.
(function($) {
    "use strict";

    CKEDITOR.plugins.add( 'cite', {

        footnote_ids: [],
		requires: 'widget',
        //icons: 'footnotes',
		
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
            var css = '.footnotes{background:#eee; padding:1px 15px;} .footnotes cite{font-style: normal;}';
            CKEDITOR.addCss(css);

            var $this = this;

            /*editor.on('saveSnapshot', function(evt) {
                console.log('saveSnapshot');
            });*/

            // Force a reorder on startup to make sure all vars are set: (e.g. footnotes store):
            editor.on('instanceReady', function(evt) {
                $this.reorderMarkers(editor, 'startup');
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
				
				if(localStorage.getItem('reordering_markers') != d.getTime())
					return;
                
                if(localStorage.getItem('reordering_markers') == d.getTime()) {
					// SetTimeout seems to be necessary (it's used in the core but can't be 100% sure why)
					setTimeout(function(){
							$this.reorderMarkers(editor, 'change');
						},
						0
					);
				}
				setTimeout(function() {
					localStorage.removeItem('reordering_markers');
				  }, 500);
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
            var contents = $('<div>' + editor.element.$.textContent + '</div>')
                     , l = contents.find('.footnotes li').length
                     , i = 1;
            for (i; i <= l; i++) {
                def['footnote_' + i] = {selector: '#footnote' + prefix + '-' + i + ' cite', allowedContent: 'a[href]; cite[*](*); strong em span br'};
            }

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
                },
            });
        },

		insertCitation: function(footnote, editor, inline_citation) {
            //todo: determine if citation already exists based on the citation value itself
			//instead of using this is_new flag
			//todo: inline_citation optional argument, will include an anchor placement so could be like this:
			//Clark et al. [!a!]2015[/!a!]
			//todo: within the footnote, add another data attribute to store the inline_citation 
			this.build(footnote, editor, (inline_citation ? inline_citation.replace(/"/,'') : null));
		},

        build: function(footnote, editor, inline_citation) {
			var footnote_id = this.findFootnote(footnote, editor);
			var is_new = false;
			if (!footnote_id) {
				is_new = true;
				footnote_id = this.generateFootnoteId();
			}
			
            // Insert the marker:
            var footnote_marker = '<sup data-citation="'+footnote+
				'" data-footnote-id="' + footnote_id + 
				'"'+
				(inline_citation ? 'data-inline-citation="'+inline_citation+'"' : '')
				+'>X</sup>';
			editor.insertHtml(footnote_marker);
			if (is_new) {
                editor.fire('lockSnapshot');
                this.addFootnote(this.buildFootnote(footnote_id, footnote, false, editor, inline_citation), editor);
                editor.fire('unlockSnapshot');
            }
            this.reorderMarkers(editor,'build');
        },
		
		findFootnote: function(footnote, editor) {
			if (!editor.footnotes_store) return null;
			var footnote_id = null;
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
				footnote_text + '</cite></li>';
            return footnote;
        },

        addFootnote: function(footnote, editor, replace) {
            var $contents  = $(editor.editable().$);
            var $footnotes = $contents.find('.footnotes');

            if ($footnotes.length == 0) {
				var header_title = editor.config.footnotesTitle ? editor.config.footnotesTitle : 'Footnotes';
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
				inline_citation: []
            };
            var self = this;
			// Check that there's a footnotes section. If it's been deleted the markers are useless:
            //if ($contents.find('.footnotes').length == 0) {
            //    $contents.find('sup[data-footnote-id]').remove();
            //    editor.fire('unlockSnapshot');
            //    return;
            //}

			//prepare the inline footnotes markers store 
			editor.footnotes_inline_store = {};
			
			// find all inline footnotes and store against footnote id 
			var $inline_footnotes = $contents.find('.footnotes > ol li');
			$inline_footnotes.each(function() {
				var footnote_id = $(this).attr('data-footnote-id'),
					inline_footnote = $(this).attr('data-inline-citation');
				// If the footnotes text can't be found in the editor, it may be in the tmp store
                // following a cut:
                if (!inline_footnote) {
                    inline_footnote = (editor.footnotes_inline_tmp && editor.footnotes_inline_tmp[footnote_id] ? editor.footnotes_inline_tmp[footnote_id] : null);
                }
                editor.footnotes_inline_store[footnote_id] = inline_footnote;
			});
			
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
			$markers.each(function(){
                j++;
				var footnote_id = $(this).attr('data-footnote-id')
                  , citation_text = $(this).attr('data-citation')
				  , inline_citation_text = $(this).attr('inline-citation')
				  , marker_ref
                  , n = data.order.indexOf(footnote_id);

                // If this is the markers first occurrence:
                if (n == -1) {
                    // Store the id:
                    data.order.push(footnote_id);
					data.original_citation_text.push(citation_text);
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
                var marker = self.generateMarkerHtml(prefix, citation_text, j, marker_ref, footnote_id, 
						inline_citation_text);
				$(this).html(marker);
            });

            // Prepare the footnotes_store object:
            editor.footnotes_store = {};
			
            // Then rebuild the Footnotes content to match marker order:
            var footnotes     = ''
              , footnote_text = ''
			  , inline_citation_text = ''
              , footnote_id
              , i = 0
              , l = data.order.length;
            for (i; i < l; i++) {
                footnote_id   = data.order[i];
				footnote_text = data.original_citation_text[i]; //$contents.find('.footnotes [data-footnote-id=' + footnote_id + '] cite').html();

				// If the footnotes text can't be found in the editor, it may be in the tmp store
                // following a cut:
                if (!footnote_text) {
					footnote_text = (editor.footnotes_tmp && editor.footnotes_tmp[footnote_id] ? editor.footnotes_tmp[footnote_id] : null);
                }
				
                footnotes += this.buildFootnote(footnote_id, footnote_text, data, editor);
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
				for (i in data.order) {
					n = parseInt(i) + 1;
					footnote_widget.initEditable('footnote_' + n, {selector: '#footnote' + prefix + '-' + n +' cite', allowedContent: 'a[href]; cite[*](*); em strong span'});
				}
			}
            editor.fire('unlockSnapshot');
        },
        
        generateMarkerHtml: function(prefix, citation_text, n, marker_ref, footnote_id, inline_citation) {
			var the_html = '';
			if (inline_citation) {
				//inline_citation will include an anchor placement so could be like this:
				//Clark et al. [!a!]2015[/!a!] foo
				//if there are no anchors, assume anchor around the entire inline citation 
				if (!inline_citation.match(/\[!a!\]/)) {
					the_html = '<a href="#footnote' + prefix + '-' + footnote_id + '" id="footnote-marker' + prefix + '-' + footnote_id + '-' + marker_ref + 
						'" data-citation="'+citation_text+'" data-inline-citation="'+inline_citation+'" data-footnote-id="' + footnote_id + '">' + inline_citation + '</a>';
				}
				//else, split by opening anchor 
				//	in 1st part, keep that to join at the end 
				//	then in 2nd part, split by closing anchor,
				//		then with 1st part, wrap this in the anchor
				//		with 2nd part, keep this to join at the end. 
				else {
					var parts = inline_citation.split(/\[!a!\]/);
					var parts_2 = parts[1].split(/\[\/!a!\]/);
					the_html = parts[0] + '<a href="#footnote' + prefix + '-' + footnote_id + '" id="footnote-marker' + prefix + '-' + footnote_id + '-' + marker_ref + 
						'" data-citation="'+citation_text+'" data-inline-citation="'+inline_citation+'" data-footnote-id="' + footnote_id + '">' + parts_2[0] + '</a>' + 
						(parts_2[1] ? parts_2[1] : '');
				}
			}
			else {
				the_html = '<a href="#footnote' + prefix + '-' + footnote_id + '" id="footnote-marker' + prefix + '-' + footnote_id + '-' + marker_ref + 
					'" data-citation="'+citation_text+'" data-footnote-id="' + footnote_id + '">[' + n + ']</a>';
			}
			return the_html;
		}
    });
}(window.jQuery));
