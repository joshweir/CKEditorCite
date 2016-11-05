'use strict';
//var expect = require('chai').expect;
var assert = chai.assert;

before(function() {

})

after(function() {
	
})

describe('insertCitation', function() {
	describe('default mode (auto numbered footnotes)', function() {
		it('should create an auto numbered footnote', function() {
			//insert the citation
			CKEDITOR.instances.doc.plugins.cite.insertCitation(
				'test <strong>footnote</strong> data1', editor);
			
			//get the content
			var $contents  = $(editor.editable().$);
			
			//verify the marker format as expected
			var $marker = $contents.find('sup[data-footnote-id]');
			var marker_footnote_id = $marker.attr('data-footnote-id');
			assert.equal(
				'<a href="#footnote-' + marker_footnote_id + '" id="footnote-marker-'+ 
				marker_footnote_id +'-1" data-citation="test <strong>footnote</strong> data1" data-citation-modified="test <strong>footnote</strong> data1" data-footnote-id="' + 
				marker_footnote_id + '">[1]</a>',
				$marker.html()
				);
			
			//verify the footnote format as expected
			$contents.find('.footnotes > ol > li').each(function() {
				var $this = $(this);
				//get the footnote id
				var footnote_id = $this.attr('data-footnote-id');
				//check the sup reference back to the marker and value is ^
				assert.equal(marker_footnote_id, footnote_id);
				assert.equal($this.find('sup > a').attr('href'),
					'#footnote-marker-' + footnote_id + '-1');
				assert.equal($this.attr('id'), 'footnote-' + footnote_id);
				
				//check the cite value is correct based on input citation
				assert.equal( $this.find('cite').html(), 
					'test <strong>footnote</strong> data1');
			});
		});
		
		it('should create a new footnote auto-incremented when the footnote ' + 
			'text is different to existing footnotes', function() {
			//insert 2nd different citation
			CKEDITOR.instances.doc.plugins.cite.insertCitation(
				'test <strong>footnote</strong> data2', CKEDITOR.instances.doc);
			//get the content
			var $contents  = $(CKEDITOR.instances.doc.editable().$);
			
			//verify the marker format as expected and retrieve footnote ids 
			//for each marker to verify against the footnotes below
			var marker_footnote_ids = [];
			var i = 0;
			$contents.find('sup[data-footnote-id]').each(function(){
				i++; 
				var $this = $(this)
					,marker_footnote_id = $this.attr('data-footnote-id');
				marker_footnote_ids.push(marker_footnote_id);
				assert.equal(
					'<a href="#footnote-' + marker_footnote_id + '" id="footnote-marker-'+ 
					marker_footnote_id +'-1" data-citation="test <strong>footnote</strong> data'+i+'" data-citation-modified="test <strong>footnote</strong> data'+i+'" data-footnote-id="' + 
					marker_footnote_id + '">['+i+']</a>',
					$this.html()
					);
			});
			assert.equal(marker_footnote_ids.length, 2);
			
			//verify the footnote format as expected and footnote ids 
			//match the marker footnote ids in order
			i = 0;
			$contents.find('.footnotes > ol > li').each(function() {
				var $this = $(this);
				//get the footnote id
				var footnote_id = $this.attr('data-footnote-id');
				//check the sup reference back to the marker and value is ^
				assert.equal(marker_footnote_ids[i], footnote_id);
				assert.equal($this.find('sup > a').attr('href'),
					'#footnote-marker-' + footnote_id + '-1');
				assert.equal($this.attr('id'), 'footnote-' + footnote_id);
				
				//check the cite value is correct based on input citation
				assert.equal( $this.find('cite').html(), 
					'test <strong>footnote</strong> data' + (i+1));
				i++;
			});
		});
		
		it('should reference the same numbered footnote when cited multiple times', function() {
			//insert same 2nd citation again
			CKEDITOR.instances.doc.plugins.cite.insertCitation(
				'test <strong>footnote</strong> data2', CKEDITOR.instances.doc);
			//get the content
			var $contents  = $(editor.editable().$);
			
			//verify the marker format as expected and retrieve footnote ids 
			//for each marker to verify against the footnotes below
			var marker_footnote_ids = [];
			var i = 0;
			$contents.find('sup[data-footnote-id]').each(function(){
				i++; 
				var $this = $(this)
					,marker_footnote_id = $this.attr('data-footnote-id');
				marker_footnote_ids.push(marker_footnote_id);
				assert.equal(
					'<a href="#footnote-' + marker_footnote_id + '" id="footnote-marker-'+ 
					marker_footnote_id +'-'+(i==3 ? 2 : 1)+'" data-citation="test <strong>footnote</strong> data'+(i==3 ? 2 : i)+'" data-citation-modified="test <strong>footnote</strong> data'+(i==3 ? 2 : i)+'" data-footnote-id="' + 
					marker_footnote_id + '">['+(i==3 ? 2 : i)+']</a>',
					$this.html()
					);
			});
			assert.equal(marker_footnote_ids.length, 3);
			
			//verify the footnote format as expected and footnote ids 
			//match the marker footnote ids in order
			i = 0;
			$contents.find('.footnotes > ol > li').each(function() {
				var $this = $(this);
				//get the footnote id
				var footnote_id = $this.attr('data-footnote-id');
				//check the sup reference back to the marker and value is ^
				assert.equal(marker_footnote_ids[i], footnote_id);
				assert.equal($this.find('sup > a').attr('href'),
					'#footnote-marker-' + footnote_id + '-1');
				assert.equal($this.attr('id'), 'footnote-' + footnote_id);
				
				//check the cite value is correct based on input citation
				assert.equal( $this.find('cite').html(), 
					'test <strong>footnote</strong> data' + (i+1));
				i++;
			});
		});
	});
	describe('custom inline citation marker format', function() {
		it('should create a custom inline cited footnote', function() {
			//insert a new custom inline cited footnote
			CKEDITOR.instances.doc.plugins.cite.insertCitation(
				'test <strong>custom footnote</strong> data4', CKEDITOR.instances.doc, '<foo [!a!]"inside4[/!a!] bar>');
			//get the content
			var $contents  = $(editor.editable().$);
			
			//verify the marker format as expected and retrieve footnote ids 
			//for each marker to verify against the footnotes below
			var marker_footnote_ids = [];
			var i = 0;
			$contents.find('sup[data-footnote-id]').each(function(){
				i++; 
				var $this = $(this)
					,marker_footnote_id = $this.attr('data-footnote-id');
				marker_footnote_ids.push(marker_footnote_id);
				if (i >= 4) { //only check the new custom cited, ignore the already tested auto numbered citations
					assert.equal(
						$this.find('span.inline-citation-before-link').html(), 
						'&lt;foo ');
					//assert.equal(
					//	$this.find('span.inline-citation-before-link').attr('contenteditable'), 'true');
					assert.equal(
						$this.find('span.inline-citation-after-link').html(), 
						' bar&gt;');
					//assert.equal(
					//	$this.find('span.inline-citation-after-link').attr('contenteditable'), 'true');
					assert.equal(
						$this.find('a').attr('href'), 
						'#footnote-' + marker_footnote_id);
					assert.equal(
						$this.find('a').attr('id'), 
						'footnote-marker-' + marker_footnote_id +'-'+'1');
					assert.equal(
						$this.find('a').attr('data-citation'), 
						'test <strong>custom footnote</strong> data'+i);
					assert.equal(
						$this.find('a').attr('data-citation-modified'), 
						'test <strong>custom footnote</strong> data'+i);
					assert.equal(
						$this.find('a').attr('data-inline-citation'), 
						'<foo [!a!]"inside'+i+'[/!a!] bar>');
					assert.equal(
						$this.find('a').attr('data-footnote-id'), 
						marker_footnote_id);
					assert.equal(
						$this.find('a').html(), 
						'"inside'+i);
				}
			});
			assert.equal(marker_footnote_ids.length, 4);
			
			//verify the footnote format as expected and footnote ids 
			//match the marker footnote ids in order
			i = 0;
			$contents.find('.footnotes > ol > li').each(function() {
				i++;
				var $this = $(this);
				if (i >= 3) {
					//get the footnote id
					var footnote_id = $this.attr('data-footnote-id');
					//check the sup reference back to the marker and value is ^
					assert.equal(marker_footnote_ids[i], footnote_id);
					assert.equal($this.find('sup > a').attr('href'),
						'#footnote-marker-' + footnote_id + '-1');
					assert.equal($this.attr('id'), 'footnote-' + footnote_id);
					
					//check the cite value is correct based on input citation
					assert.equal( $this.find('cite').html(), 
						'test <strong>custom footnote</strong> data' + (i+1));
				}
			});
		});
		
		it('should create a new custom inline cited footnote auto-incremented when the footnote ' + 
			'text is different to existing footnotes', function() {
			//insert a new custom inline cited footnote
			CKEDITOR.instances.doc.plugins.cite.insertCitation(
				'test <strong>custom footnote</strong> data5', CKEDITOR.instances.doc, '<foo [!a!]"inside5[/!a!] bar>');
			//get the content
			var $contents  = $(editor.editable().$);
			
			//verify the marker format as expected and retrieve footnote ids 
			//for each marker to verify against the footnotes below
			var marker_footnote_ids = [];
			var i = 0;
			$contents.find('sup[data-footnote-id]').each(function(){
				i++; 
				var $this = $(this)
					,marker_footnote_id = $this.attr('data-footnote-id');
				marker_footnote_ids.push(marker_footnote_id);
				if (i >= 4) { //only check the new custom cited, ignore the already tested auto numbered citations
					assert.equal(
						$this.find('span.inline-citation-before-link').html(), 
						'&lt;foo ');
					//assert.equal(
					//	$this.find('span.inline-citation-before-link').attr('contenteditable'), 'true');
					assert.equal(
						$this.find('span.inline-citation-after-link').html(), 
						' bar&gt;');
					//assert.equal(
					//	$this.find('span.inline-citation-after-link').attr('contenteditable'), 'true');
					assert.equal(
						$this.find('a').attr('href'), 
						'#footnote-' + marker_footnote_id);
					assert.equal(
						$this.find('a').attr('id'), 
						'footnote-marker-' + marker_footnote_id +'-'+'1');
					assert.equal(
						$this.find('a').attr('data-citation'), 
						'test <strong>custom footnote</strong> data'+i);
					assert.equal(
						$this.find('a').attr('data-citation-modified'), 
						'test <strong>custom footnote</strong> data'+i);
					assert.equal(
						$this.find('a').attr('data-inline-citation'), 
						'<foo [!a!]"inside'+i+'[/!a!] bar>');
					assert.equal(
						$this.find('a').attr('data-footnote-id'), 
						marker_footnote_id);
					assert.equal(
						$this.find('a').html(), 
						'"inside'+i);
					/*
					assert.equal(
						'<span class="inline-citation-before-link">&lt;foo </span><a href="#footnote-' + marker_footnote_id + '" id="footnote-marker-'+ 
						marker_footnote_id +'-'+'1'+'" data-citation="test <strong>custom footnote</strong> data'+
						i+'" data-citation-modified="test <strong>custom footnote</strong> data'+
						i+'" data-inline-citation="'+'<foo [!a!]&quot;inside'+i+'[/!a!] bar>'+'" data-footnote-id="' + 
						marker_footnote_id + '">'+'"inside'+i+'</a><span class="inline-citation-after-link"> bar&gt;</span>',
						$this.html()
						);
					*/
				}
			});
			assert.equal(marker_footnote_ids.length, 5);
			
			//verify the footnote format as expected and footnote ids 
			//match the marker footnote ids in order
			i = 0;
			$contents.find('.footnotes > ol > li').each(function() {
				i++;
				var $this = $(this);
				if (i >= 3) {
					//get the footnote id
					var footnote_id = $this.attr('data-footnote-id');
					//check the sup reference back to the marker and value is ^
					assert.equal(marker_footnote_ids[i], footnote_id);
					assert.equal($this.find('sup > a').attr('href'),
						'#footnote-marker-' + footnote_id + '-1');
					assert.equal($this.attr('id'), 'footnote-' + footnote_id);
					
					//check the cite value is correct based on input citation
					assert.equal( $this.find('cite').html(), 
						'test <strong>custom footnote</strong> data' + (i+1));
				}
			});
		});
		
		it('should reference the same custom inline cited footnote when cited multiple times', function() {
			//insert the same custom inline cited footnote
			CKEDITOR.instances.doc.plugins.cite.insertCitation(
				'test <strong>custom footnote</strong> data5', CKEDITOR.instances.doc, '<foo [!a!]"inside5[/!a!] bar>');
			//get the content
			var $contents  = $(editor.editable().$);
			
			//verify the marker format as expected and retrieve footnote ids 
			//for each marker to verify against the footnotes below
			var marker_footnote_ids = [];
			var i = 0;
			$contents.find('sup[data-footnote-id]').each(function(){
				i++; 
				var $this = $(this)
					,marker_footnote_id = $this.attr('data-footnote-id');
				marker_footnote_ids.push(marker_footnote_id);
				if (i >= 4) { //only check the new custom cited, ignore the already tested auto numbered citations
					if (i < 6) {
						assert.equal(
							$this.find('span.inline-citation-before-link').html(), 
							'&lt;foo ');
						//assert.equal(
						//	$this.find('span.inline-citation-before-link').attr('contenteditable'), 'true');
						assert.equal(
							$this.find('span.inline-citation-after-link').html(), 
							' bar&gt;');
						//assert.equal(
						//	$this.find('span.inline-citation-after-link').attr('contenteditable'), 'true');
						assert.equal(
							$this.find('a').attr('href'), 
							'#footnote-' + marker_footnote_id);
						assert.equal(
							$this.find('a').attr('id'), 
							'footnote-marker-' + marker_footnote_id +'-'+'1');
						assert.equal(
							$this.find('a').attr('data-citation'), 
							'test <strong>custom footnote</strong> data'+i);
						assert.equal(
							$this.find('a').attr('data-citation-modified'), 
							'test <strong>custom footnote</strong> data'+i);
						assert.equal(
							$this.find('a').attr('data-inline-citation'), 
							'<foo [!a!]"inside'+i+'[/!a!] bar>');
						assert.equal(
							$this.find('a').attr('data-footnote-id'), 
							marker_footnote_id);
						assert.equal(
							$this.find('a').html(), 
							'"inside'+i);
						/*
						assert.equal(
							'<span class="inline-citation-before-link">&lt;foo </span><a href="#footnote-' + marker_footnote_id + '" id="footnote-marker-'+ 
							marker_footnote_id +'-'+'1'+'" data-citation="test <strong>custom footnote</strong> data'+
							i+'" data-citation-modified="test <strong>custom footnote</strong> data'+
							i+'" data-inline-citation="'+'<foo [!a!]&quot;inside'+i+'[/!a!] bar>'+'" data-footnote-id="' + 
							marker_footnote_id + '">'+'"inside'+i+'</a><span class="inline-citation-after-link"> bar&gt;</span>',
							$this.html()
							);
						*/
					}
					else {
						assert.equal(
							$this.find('span.inline-citation-before-link').html(), 
							'&lt;foo ');
						//assert.equal(
						//	$this.find('span.inline-citation-before-link').attr('contenteditable'), 'true');
						assert.equal(
							$this.find('span.inline-citation-after-link').html(), 
							' bar&gt;');
						//assert.equal(
						//	$this.find('span.inline-citation-after-link').attr('contenteditable'), 'true');
						assert.equal(
							$this.find('a').attr('href'), 
							'#footnote-' + marker_footnote_id);
						assert.equal(
							$this.find('a').attr('id'), 
							'footnote-marker-' + marker_footnote_id +'-'+'2');
						assert.equal(
							$this.find('a').attr('data-citation'), 
							'test <strong>custom footnote</strong> data'+(i-1));
						assert.equal(
							$this.find('a').attr('data-citation-modified'), 
							'test <strong>custom footnote</strong> data'+(i-1));
						assert.equal(
							$this.find('a').attr('data-inline-citation'), 
							'<foo [!a!]"inside'+(i-1)+'[/!a!] bar>');
						assert.equal(
							$this.find('a').attr('data-footnote-id'), 
							marker_footnote_id);
						assert.equal(
							$this.find('a').html(), 
							'"inside'+(i-1));
						/*
						assert.equal(
							'<span class="inline-citation-before-link">&lt;foo </span><a href="#footnote-' + marker_footnote_id + '" id="footnote-marker-'+ 
							marker_footnote_id +'-'+'2'+'" data-citation="test <strong>custom footnote</strong> data'+
							(i-1)+'" data-citation-modified="test <strong>custom footnote</strong> data'+
							(i-1)+'" data-inline-citation="'+'<foo [!a!]&quot;inside'+(i-1)+'[/!a!] bar>'+'" data-footnote-id="' + 
							marker_footnote_id + '">'+'"inside'+(i-1)+'</a><span class="inline-citation-after-link"> bar&gt;</span>',
							$this.html()
							);
						*/
					}
				}
			});
			assert.equal(marker_footnote_ids.length, 6);
			
			//verify the footnote format as expected and footnote ids 
			//match the marker footnote ids in order
			i = 0;
			$contents.find('.footnotes > ol > li').each(function() {
				i++;
				var $this = $(this);
				if (i >= 3) {
					//get the footnote id
					var footnote_id = $this.attr('data-footnote-id');
					//check the sup reference back to the marker and value is ^
					assert.equal(marker_footnote_ids[i], footnote_id);
					assert.equal($this.find('sup > a').attr('href'),
						'#footnote-marker-' + footnote_id + '-1');
					assert.equal($this.attr('id'), 'footnote-' + footnote_id);
					
					//check the cite value is correct based on input citation
					assert.equal( $this.find('cite').html(), 
						'test <strong>custom footnote</strong> data' + (i+1));
				}
			});
		});
	});
});


describe('Rebuilding Footnotes on change', function() {
	it('should fix a reference inserted that has invalid html', function() {
		//insert the same custom inline cited footnote with invalid html
		CKEDITOR.instances.doc.plugins.cite.insertCitation(
			'test <strong>custom & footnote</strong> data6', CKEDITOR.instances.doc, '<foo [!a!]"inside6[/!a!] bar>');
		//get the content
		var $contents  = $(editor.editable().$);
		
		var $sup = $contents.find('sup[data-footnote-id][data-citation="test <strong>custom &amp; footnote</strong> data6"]')
		assert.equal($sup.attr('data-citation'), 'test <strong>custom &amp; footnote</strong> data6');
		
		var $footnote = $contents.find('.footnotes > ol > li[data-footnote-id="' + $sup.attr('data-footnote-id') + '"]')
		assert.equal( $footnote.find('cite').html(), 
					'test <strong>custom &amp; footnote</strong> data6');
	});
	it('should update inline citation "modified" citation text when the reference is updated by the user', function() {
		//modify an auto numbered and a custom inline text citation, ensure these references are kept when footnotes
		//are deleted below, this can test that modified references are rebuilt correctly in their modified state
		var $contents  = $(editor.editable().$);
		var autonum_footnote_id, custom_footnote_id;
		var i = 1;
		$contents.find('.footnotes ol li').each(function(){
			if (i == 1)
				autonum_footnote_id = $(this).attr('data-footnote-id');
			if (i==3)
				custom_footnote_id = $(this).attr('data-footnote-id');
			i++;
		});

		var range = editor.createRange();
		
		//set cursor to within a reference cite text to act as though editing and stop re-ordering the citation while editing
		range.setStart( editor.document.find('.footnotes ol li[data-footnote-id="'+autonum_footnote_id+'"] cite').getItem(0), 0 ); 
		range.setEnd( editor.document.find('.footnotes ol li[data-footnote-id="'+autonum_footnote_id+'"] cite').getItem(0), 0 ); 
		editor.getSelection().selectRanges( [ range ] );
		var modify = $contents.find('.footnotes > ol > li[data-footnote-id="'+autonum_footnote_id+'"] cite').html() + ' modified';
		$contents.find('.footnotes > ol > li[data-footnote-id="'+autonum_footnote_id+'"] cite').html(modify);
		modify = $contents.find('.footnotes > ol > li[data-footnote-id="'+custom_footnote_id+'"] cite').html() + ' modified';
		$contents.find('.footnotes > ol > li[data-footnote-id="'+custom_footnote_id+'"] cite').html(modify);
		//trigger a change to simulate the user changing these footnotes
		editor.fire('change');
		//set cursor back to the start of document
		range.setStart( editor.document.find('p').getItem(0), 0 ); 
		range.setEnd( editor.document.find('p').getItem(0), 0 ); 
		editor.getSelection().selectRanges( [ range ] );

		assert.equal($contents.find('sup[data-footnote-id="'+ autonum_footnote_id +'"]').attr('data-citation-modified'),
			$contents.find('sup[data-footnote-id="'+ autonum_footnote_id +'"]').attr('data-citation') + ' modified');
		assert.equal($contents.find('sup[data-footnote-id="'+ custom_footnote_id +'"]').attr('data-citation-modified'),
			$contents.find('sup[data-footnote-id="'+ custom_footnote_id +'"]').attr('data-citation') + ' modified');
	});
	it('should update inline citation "footnotes title" when the footnotes title is updated by the user', function() {
		
		var $contents  = $(editor.editable().$);
		var autonum_footnote_id, custom_footnote_id;
		var i = 1;
		$contents.find('.footnotes ol li').each(function(){
			if (i == 1)
				autonum_footnote_id = $(this).attr('data-footnote-id');
			if (i==3)
				custom_footnote_id = $(this).attr('data-footnote-id');
			i++;
		});

		var range = editor.createRange();
		
		//set cursor to within a reference cite text to act as though editing and stop re-ordering the citation while editing
		range.setStart( editor.document.find('.footnotes header h2').getItem(0), 0 ); 
		range.setEnd( editor.document.find('.footnotes header h2').getItem(0), 0 ); 
		editor.getSelection().selectRanges( [ range ] );
		var modify = $contents.find('.footnotes header h2').html() + ' & modified';
		$contents.find('.footnotes header h2').html(modify);
		//trigger a change to simulate the user changing these footnotes
		editor.fire('change');
		//set cursor back to the start of document
		range.setStart( editor.document.find('p').getItem(0), 0 ); 
		range.setEnd( editor.document.find('p').getItem(0), 0 ); 
		editor.getSelection().selectRanges( [ range ] );
		assert.equal($contents.find('sup[data-footnote-id="'+ autonum_footnote_id +'"]').attr('data-footnotes-heading'),
			'Footnotes &amp; modified');
		assert.equal($contents.find('sup[data-footnote-id="'+ custom_footnote_id +'"]').attr('data-footnotes-heading'),
			'Footnotes &amp; modified');
	});
	it('should, on delete of auto numbered footnote, rebuild footnotes and inline auto numbered footnotes deleting the referenced footnote', function(done) {
		CKEDITOR.instances.doc.plugins.cite.insertCitation(
			'test first footnote', CKEDITOR.instances.doc);
		var $contents  = $(editor.editable().$);
		//get value of 1,2nd,3rd,4th footnote marker is [1],[2],[3],[3]
		var i = 0;
		var footnote_ids = [];
		$contents.find('sup[data-footnote-id]').each(function(){
			i++;
			if (i > 4) return;
			footnote_ids.push($(this).attr('data-footnote-id'));
			assert.equal($(this).find('a').html(), '['+(i<4 ? i : i-1)+']');
		});
		//get value of 2nd,3rd reference 
		i = 0;
		var references = [];
		$contents.find('.footnotes ol li').each(function(){
			i++;
			if (i == 1 || i > 3) return;
			if (i == 2 || i == 3) {
				assert.equal($(this).attr('data-footnote-id'), footnote_ids[i-1]);
				references[i] = $(this).find('cite').html();
			}
		});
		
		//get value of footnotes heading 
		var footnotes_heading = $contents.find('.footnotes header h2').html();
		assert.equal(footnotes_heading, 'Footnotes &amp; modified');
		
		//delete the first footnote marker
		$contents.find('sup[data-footnote-id]').first().remove();
		setTimeout(function() {//wait for the reorder to happen
			try {
				//verify footnote markers now, 
				//[1] -> referencing the 2nd reference above 
				//[2],[2] -> referencing the 3rd reference above
				i = 0;
				$contents  = $(editor.editable().$);
				$contents.find('.footnotes ol li').each(function(){
					i++;
					if (i > 2) return;
					assert.equal($(this).attr('data-footnote-id'), footnote_ids[i]);
					assert.equal($(this).find('cite').html(), references[i+1]);
				});
				i = 0;
				$contents.find('sup[data-footnote-id]').each(function(){
					i++;
					if (i > 3) return;
					assert.equal($(this).find('a').html(), '['+(i<3 ? i : i-1)+']');
					assert.equal($(this).attr('data-footnote-id'), footnote_ids[i]);
				});
				assert.equal($contents.find('.footnotes header h2').html(), footnotes_heading);
			}
			catch (e) {
				return done(e);
			}
			done();
		}, 100)
	});
	it('should, on delete of auto numbered footnote that is a duplicate inline footnote, ' + 
		'rebuild footnotes and inline auto numbered footnotes not deleting the deleted footnote reference', function(done) {
		var $contents  = $(editor.editable().$);
		//get value of 1,2nd,3rd footnote marker is [1],[2],[2]
		var i = 0;
		var footnote_ids = [];
		$contents.find('sup[data-footnote-id]').each(function(){
			i++;
			if (i > 3) return;
			footnote_ids.push($(this).attr('data-footnote-id'));
			assert.equal($(this).find('a').html(), '['+(i<3 ? i : i-1)+']');
		});
		//get value of 1st,2nd reference 
		i = 0;
		var references = [];
		$contents.find('.footnotes ol li').each(function(){
			i++;
			if (i > 2) return;
			assert.equal($(this).attr('data-footnote-id'), footnote_ids[i-1]);
			references[i] = $(this).find('cite').html();
		});
		
		//delete the first footnote marker
		$contents.find('sup[data-footnote-id="'+footnote_ids[1]+'"]').first().remove();
		editor.fire('change');
		setTimeout(function() {//wait for the reorder to happen
			try {
				//verify footnote markers now, 
				//[1] -> referencing the 1st reference above 
				//[2] -> referencing the 2nd reference above
				i = 0;
				$contents  = $(editor.editable().$);
				$contents.find('.footnotes ol li').each(function(){
					i++;
					if (i > 2) return;
					assert.equal($(this).attr('data-footnote-id'), footnote_ids[i-1]);
					assert.equal($(this).find('cite').html(), references[i]);
				});
				i = 0;
				$contents.find('sup[data-footnote-id]').each(function(){
					i++;
					if (i > 2) return;
					assert.equal($(this).find('a').html(), '['+i+']');
					assert.equal($(this).attr('data-footnote-id'), footnote_ids[i-1]);
				});
			}
			catch (e) {
				return done(e);
			}
			done();
		}, 100)
	});
	it('should, on delete of custom inline citation footnote, rebuild footnotes and inline auto numbered footnotes deleting the referenced footnote', function(done) {
		var $contents  = $(editor.editable().$);
		//get value of 3rd,4th,5th footnote marker is <foo "inside4 bar>,<foo "inside5 bar>,<foo "inside5 bar>
		var i = 0;
		var footnote_ids = [];
		$contents.find('sup[data-footnote-id]').each(function(){
			i++;
			if (i > 5 || i < 3) return;
			footnote_ids[i] = $(this).attr('data-footnote-id');
			console.log($(this).text());
			assert.equal($(this).text(), '<foo "inside'+(i==5 ? i : i+1)+' bar>');
		});
		//get value of 3rd,4th reference 
		i = 0;
		var references = [];
		$contents.find('.footnotes ol li').each(function(){
			i++;
			if (i < 3 || i > 4) return;
			assert.equal($(this).attr('data-footnote-id'), footnote_ids[i]);
			references[i] = $(this).find('cite').html();
		});

		//delete the first footnote marker
		$contents.find('sup[data-footnote-id="'+ footnote_ids[3] +'"]').first().remove();
		setTimeout(function() {//wait for the reorder to happen
			try {
				//verify footnote markers now, 
				//<foo "inside5 bar>,<foo "inside5 bar> -> referencing the 2nd reference above
				i = 0;
				$contents  = $(editor.editable().$);
				$contents.find('.footnotes ol li').each(function(){
					i++;
					if (i < 3 || i > 3) return;
					assert.equal($(this).attr('data-footnote-id'), footnote_ids[i]);
					assert.equal($(this).find('cite').html(), references[i]);
				});
				i = 0;
				$contents.find('sup[data-footnote-id]').each(function(){
					i++;
					if (i < 3 || i > 4) return;
					assert.equal($(this).text(), '<foo "inside'+(i==4 ? i+1 : i+2)+' bar>');
					assert.equal($(this).attr('data-footnote-id'), footnote_ids[i+1]);
				});
			}
			catch (e) {
				return done(e);
			}
			done();
		}, 100)
	});
	it('should, on delete of custom inline citation footnote that is a duplicate inline footnote, ' + 
		'rebuild footnotes and inline auto numbered footnotes not deleting the deleted footnote reference', function(done) {
		
	});
	it('should, on inserting a new citation which is the same as another citation that was user modified, ' + 
		'rebuild footnotes including modified references and footnotes title and wont duplicate the modified reference', function() {
		
	});
});

describe('generateMarkerHtml', function() {
    describe('default mode (auto numbered footnotes)', function() {
		it('should return a numbered footnote wrapped in anchor', function() {
			assert.equal(
				'<a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-citation-modified="test citation" data-footnote-id="' + 'foo1' + '">[' + '2' + ']</a>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 'test citation', 2, 3, 'foo1', null)
				);
		});
	});
	describe('custom inline citation marker format', function() {
		it('should apply the anchor transformations [!a!] -> <a.. ' + 
			'where no text after anchor close', function() {
			assert.equal(
				'<span class="inline-citation-before-link">foobar </span><a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-citation-modified="test citation" data-inline-citation="foobar [!a!]inside anchor[/!a!]" data-footnote-id="' + 
					'foo1' + '">inside anchor</a><span class="inline-citation-after-link"></span>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 'test citation', 2, 3, 'foo1', 'foobar [!a!]inside anchor[/!a!]')
				);
		});
		it('should apply the anchor transformations [!a!] -> <a.. where no text before the anchor open but text after anchor close pattern', function() {
			assert.equal(
				'<span class="inline-citation-before-link"></span><a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-citation-modified="test citation" data-inline-citation="[!a!]inside anchor[/!a!] foobar" data-footnote-id="' + 
					'foo1' + '">inside anchor</a><span class="inline-citation-after-link"> foobar</span>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 'test citation', 2, 3, 'foo1', '[!a!]inside anchor[/!a!] foobar')
				);
		});
		it('should apply the anchor transformations [!a!] -> <a.. where no text before or after the anchor patterns', function() {
			assert.equal(
				'<span class="inline-citation-before-link"></span><a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-citation-modified="test citation" data-inline-citation="[!a!]inside anchor[/!a!]" data-footnote-id="' + 
					'foo1' + '">inside anchor</a><span class="inline-citation-after-link"></span>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 'test citation', 2, 3, 'foo1', '[!a!]inside anchor[/!a!]')
				);
		});
		it('should apply the anchor transformations automatically to the entire string if the anchor pattern doesnt exist', function() {
			assert.equal(
				'<span class="inline-citation-before-link"></span><a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-citation-modified="test citation" data-inline-citation="inside anchor" data-footnote-id="' + 
					'foo1' + '">inside anchor</a><span class="inline-citation-after-link"></span>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 'test citation', 2, 3, 'foo1', 'inside anchor')
				);
		});
		it('should handle citations with double quotes within the citation', function() {
			assert.equal(
				'<span class="inline-citation-before-link"></span><a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test&quot; citation" data-citation-modified="test&quot; citation" data-inline-citation="inside&quot; anchor" data-footnote-id="' + 
					'foo1' + '">inside" anchor</a><span class="inline-citation-after-link"></span>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test" citation', 'test" citation', 2, 3, 'foo1', 'inside" anchor')
				);
		});
		it('should handle citations with html special characters within the citation', function() {
			assert.equal(
				'<span class="inline-citation-before-link"></span><a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test&gt; citation" data-citation-modified="test&gt; citation" data-inline-citation="inside&lt; anchor" data-footnote-id="' + 
					'foo1' + '">inside&lt; anchor</a><span class="inline-citation-after-link"></span>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test> citation', 'test> citation', 2, 3, 'foo1', 'inside< anchor')
				);
			assert.equal(
				'<span class="inline-citation-before-link"></span><a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test &lt;strong&gt;citation&lt;/strong&gt;" data-citation-modified="test &lt;strong&gt;citation&lt;/strong&gt;" data-inline-citation="inside&lt; anchor" data-footnote-id="' + 
					'foo1' + '">inside&lt; anchor</a><span class="inline-citation-after-link"></span>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test <strong>citation</strong>', 'test <strong>citation</strong>', 2, 3, 'foo1', 'inside< anchor')
				);
		});
	});
});

