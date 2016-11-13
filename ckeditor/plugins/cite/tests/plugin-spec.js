'use strict';
//var expect = require('chai').expect;
var assert = chai.assert;

before(function() {

})

after(function() {
	
})

describe('insert', function() {
	describe('default mode (auto numbered footnotes)', function() {
		it('should create an auto numbered footnote', function() {
			//insert the citation
			CKEDITOR.instances.doc.plugins.cite.insert(
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
			CKEDITOR.instances.doc.plugins.cite.insert(
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
			CKEDITOR.instances.doc.plugins.cite.insert(
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
			CKEDITOR.instances.doc.plugins.cite.insert(
				'test <strong>custom footnote</strong> data4', CKEDITOR.instances.doc, 
				'&lt;foo [!a!]"inside4[/!a!] bar&gt;');
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
						'<foo [!a!][!quot!]inside'+i+'[/!a!] bar>');
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
			CKEDITOR.instances.doc.plugins.cite.insert(
				'test <strong>custom footnote</strong> data5', CKEDITOR.instances.doc, 
				'&lt;foo [!a!]"inside5[/!a!] bar&gt;');
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
						'<foo [!a!][!quot!]inside'+i+'[/!a!] bar>');
					assert.equal(
						$this.find('a').attr('data-footnote-id'), 
						marker_footnote_id);
					assert.equal(
						$this.find('a').html(), 
						'"inside'+i);
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
			CKEDITOR.instances.doc.plugins.cite.insert(
				'test <strong>custom footnote</strong> data5', CKEDITOR.instances.doc, 
				'&lt;foo [!a!]"inside5[/!a!] bar&gt;');
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
							'<foo [!a!][!quot!]inside'+i+'[/!a!] bar>');
						assert.equal(
							$this.find('a').attr('data-footnote-id'), 
							marker_footnote_id);
						assert.equal(
							$this.find('a').html(), 
							'"inside'+i);
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
							'<foo [!a!][!quot!]inside'+(i-1)+'[/!a!] bar>');
						assert.equal(
							$this.find('a').attr('data-footnote-id'), 
							marker_footnote_id);
						assert.equal(
							$this.find('a').html(), 
							'"inside'+(i-1));
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
		CKEDITOR.instances.doc.plugins.cite.insert(
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
		editor.fire('change');
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
		editor.fire('change');
		setTimeout(function() {//wait for the reorder to happen
			try {
				//verify footnote markers now, 
				//<foo "inside5 bar>,<foo "inside5 bar> -> referencing the 2nd reference above
				i = 0;
				$contents  = $(editor.editable().$);
				$contents.find('.footnotes ol li').each(function(){
					i++;
					if (i < 3 || i > 3) return;
					assert.equal($(this).attr('data-footnote-id'), footnote_ids[i+1]);
					assert.equal($(this).find('cite').html(), references[i+1]);
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
		var $contents  = $(editor.editable().$);
		//get value of 3rd,4th footnote marker is <foo "inside5 bar>
		var i = 0;
		var footnote_ids = [];
		$contents.find('sup[data-footnote-id]').each(function(){
			i++;
			if (i < 3 || i > 4) return;
			footnote_ids[i] = $(this).attr('data-footnote-id');
			assert.equal($(this).text(), '<foo "inside5 bar>');
		});
		//get value of 3rd reference 
		i = 0;
		var references = [];
		$contents.find('.footnotes ol li').each(function(){
			i++;
			if (i < 3 || i > 3) return;
			assert.equal($(this).attr('data-footnote-id'), footnote_ids[i]);
			references[i] = $(this).find('cite').html();
		});
		
		//delete the first footnote marker
		$contents.find('sup[data-footnote-id="'+footnote_ids[3]+'"]').first().remove();
		editor.fire('change');
		setTimeout(function() {//wait for the reorder to happen
			try {
				//verify footnote markers now, 
				//<foo "inside5 bar> -> referencing the 3rd reference above 
				//not <foo "inside6 bar> -> not referencing the 3rd reference above
				i = 0;
				$contents  = $(editor.editable().$);
				$contents.find('.footnotes ol li').each(function(){
					i++;
					if (i < 3 || i > 4) return;
					if (i == 3) {
						assert.equal($(this).attr('data-footnote-id'), footnote_ids[i]);
						assert.equal($(this).find('cite').html(), references[i]);
					}
					if (i == 4) {
						assert.notEqual($(this).attr('data-footnote-id'), footnote_ids[i]);
						assert.notEqual($(this).find('cite').html(), references[i]);
					}
				});
				i = 0;
				$contents.find('sup[data-footnote-id]').each(function(){
					i++;
					if (i < 3 || i > 4) return;
					if (i == 3) {
						assert.equal($(this).text(), '<foo "inside5 bar>');
						assert.equal($(this).attr('data-footnote-id'), footnote_ids[i]);
					}
					if (i == 4) {
						assert.notEqual($(this).text(), '<foo "inside5 bar>');
						assert.notEqual($(this).attr('data-footnote-id'), footnote_ids[i]);
					}
				});
			}
			catch (e) {
				return done(e);
			}
			done();
		}, 100)
	});
	
	it('should, on inserting a new citation which is the same as another citation that was user modified, ' + 
		'rebuild footnotes including modified references and footnotes title and wont duplicate the modified reference', function(done) {
		//place cursor at the beginning
		var range = editor.createRange();
		range.setStart( editor.document.find('p').getItem(0), 0 ); 
		range.setEnd( editor.document.find('p').getItem(0), 0 ); 
		editor.getSelection().selectRanges( [ range ] );
		
		//insert footnote
		CKEDITOR.instances.doc.plugins.cite.insert(
			'Johnston, E. L., Piola, R. F., &amp; Clark, G. F. (2009). The role of propagule pressure in invasion success. In <i>Biological invasions in marine ecosystems</i> (pp. 133-151). Springer Berlin Heidelberg.', CKEDITOR.instances.doc);
		editor.fire('change');
		
		//verify first 2 footnote markers reference the same first reference
		setTimeout(function() {//wait for the reorder to happen
			try {
				range.setStart( editor.document.find('p').getItem(0), 0 ); 
				range.setEnd( editor.document.find('p').getItem(0), 0 ); 
				editor.getSelection().selectRanges( [ range ] );
				
				//insert same footnote again
				CKEDITOR.instances.doc.plugins.cite.insert(
					'Johnston, E. L., Piola, R. F., &amp; Clark, G. F. (2009). The role of propagule pressure in invasion success. In <i>Biological invasions in marine ecosystems</i> (pp. 133-151). Springer Berlin Heidelberg.', CKEDITOR.instances.doc);
				editor.fire('change');
				
				setTimeout(function() {//wait for the reorder to happen
					try {
						var $contents  = $(editor.editable().$);
						var i = 0;
						var footnote_ids = [];
						$contents.find('sup[data-footnote-id]').each(function(){
							i++;
							if (i > 2) return;
							footnote_ids[i] = $(this).attr('data-footnote-id');
							assert.equal($(this).find('a').html(), '[1]');
						});
						assert.equal(footnote_ids[1],footnote_ids[2]);
						
						i = 0;
						var references = [];
						$contents.find('.footnotes ol li').each(function(){
							i++;
							if (i > 1) return;
							assert.equal($(this).attr('data-footnote-id'), footnote_ids[1]);
							assert($(this).find('cite').html(),
								'Johnston, E. L., Piola, R. F., &amp; Clark, G. F. (2009). The role of propagule pressure in invasion success. In <i>Biological invasions in marine ecosystems</i> (pp. 133-151). Springer Berlin Heidelberg.');
						});
					}
					catch (e) {
						return done(e);
					}
					done();
				},100);
			}
			catch (e) {
				return done(e);
			}
		}, 100)
	});
	it('should, on changing an existing in-text citation text using the In-Text ' + 
		'Citation dialog, after re-ordering (after adding another auto numbered ' + 
		'footnote say) will maintain the same "user altered" custom in-text ' + 
		'citation marker, while another marker referencing the same citation will ' + 
		'remain in its previous state also', function(done) {
		//@TODO
		done();
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
					'" data-citation="test[!quot!] citation" data-citation-modified="test[!quot!] citation" data-inline-citation="inside[!quot!] anchor" data-footnote-id="' + 
					'foo1' + '">inside&quot; anchor</a><span class="inline-citation-after-link"></span>',
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
					1, 'test&gt; citation', 'test&gt; citation', 2, 3, 'foo1', 'inside&lt; anchor')
				);
			assert.equal(
				'<span class="inline-citation-before-link"></span><a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test <strong>citation</strong>" data-citation-modified="test <strong>citation</strong>" data-inline-citation="inside&lt; anchor" data-footnote-id="' + 
					'foo1' + '">inside&lt; anchor</a><span class="inline-citation-after-link"></span>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test <strong>citation</strong>', 'test <strong>citation</strong>', 2, 3, 'foo1', 'inside&lt; anchor')
				);
		});
	});

});



describe('InText Citation Dialog', function() {
	it('should open the dialog on double click of an inline citation', function() {
		//todo: determine how to automate this test, cannot fire the doubleclick event:
		//console.log(editor.widgets.instances);
		
		//var i = 0;
		//Object.keys(editor.widgets.instances).forEach(function (key) { 
		//	i++;
		//	if (i > 1) return;
		//	editor.widgets.instances[key].focus(); 
		//	//editor.widgets.instances[key].fire('doubleclick');
		//	setTimeout(function(){
		//		editor.widgets.instances[key].fire('doubleclick');
		//		done();
		//	},100);
		//});
		
	});
	it('should open the dialog on right click menu of a custom inline citation', function() {
		//todo: determine how to automate this test
		//dont know how to invoke the context menu
	});
	it('should default the current in-text citation value and default the preview transforming anchor tags into link', function(done) {
		var intext_citation_found = false;
		for(var key in editor.widgets.instances) {
			if (intext_citation_found) 
				break;
			if (CKEDITOR.dialog.getCurrent()) //for some reason this test runs twice, so just check dialog isnt already active
				break;
			if(editor.widgets.instances.hasOwnProperty(key)){
				if (editor.widgets.instances[key].name == 'footnotemarker' &&
					$(editor.widgets.instances[key].element.$).attr("data-inline-citation")) {
					intext_citation_found = true;
					var intext_citation_text = $(editor.widgets.instances[key].element.$).attr("data-inline-citation");
					editor.widgets.instances[key].focus(); 
					editor.execCommand('intext_cite');
					setTimeout(function() {
						try {
							var editor_found = false;
							Object.keys(CKEDITOR.instances).forEach(function (key) {
								if (CKEDITOR.instances[key].element.$.className.match(/footnote_text/)) {
									editor_found = true;
									var $contents  = $(CKEDITOR.instances[key].editable().$);
									assert.equal($contents.html(), intext_citation_text.replace(/\[!quot!\]/g,'"') + '<br>');
									assert.equal($('.intext-citation-preview').html(), intext_citation_text.replace(/\[!quot!\]/g,'"').replace('[!a!]','<a href="#">').replace('[/!a!]','</a>') + '<br>');
									//CKEDITOR.instances[key].setData('');
									var new_value = 'test change [!a!]link[/!a!] after link';
									CKEDITOR.instances[key].setData(new_value);
									CKEDITOR.instances[key].fire('change');
									setTimeout(function(){
										try {
											var $contents  = $(CKEDITOR.instances[key].editable().$);
											assert.notEqual($contents.html(), intext_citation_text.replace(/\[!quot!\]/g,'"') + '<br>');
											CKEDITOR.instances[key].destroy();
											CKEDITOR.dialog.getCurrent().hide();
											done();
										} catch(e) {
											return done(e);
										}
									},200);
								}
							});
							if (!editor_found) 
								throw('couldnt find dialog ckeditor instance!');
						} catch(e) {
							return done(e);
						}
					},500);
				}
			}
		}
	});
	it('should preview the intext citation in real time, turning anchor into a link', function(done) {
		var intext_citation_found = false;
		for(var key in editor.widgets.instances) {
			if (intext_citation_found) 
				break;
			if (CKEDITOR.dialog.getCurrent()) //for some reason this test runs twice, so just check dialog isnt already active
				break;
			if(editor.widgets.instances.hasOwnProperty(key)){
				if (editor.widgets.instances[key].name == 'footnotemarker' &&
					$(editor.widgets.instances[key].element.$).attr("data-inline-citation")) {
					intext_citation_found = true;
					var intext_citation_text = $(editor.widgets.instances[key].element.$).attr("data-inline-citation");
					editor.widgets.instances[key].focus(); 
					editor.execCommand('intext_cite');
					setTimeout(function() {
						try {
							var editor_found = false;
							Object.keys(CKEDITOR.instances).forEach(function (key) {
								if (CKEDITOR.instances[key].element.$.className.match(/footnote_text/)) {
									editor_found = true;
									var $contents  = $(CKEDITOR.instances[key].editable().$);
									assert.equal($contents.html(), intext_citation_text.replace(/\[!quot!\]/g,'"') + '<br>');
									assert.equal($('.intext-citation-preview').html(), intext_citation_text.replace(/\[!quot!\]/g,'"').replace('[!a!]','<a href="#">').replace('[/!a!]','</a>') + '<br>');
									var new_value = 'test change [!a!]link[/!a!] after link';
									CKEDITOR.instances[key].setData(new_value);
									CKEDITOR.instances[key].fire('change');
									//$(CKEDITOR.instances[key].editable().$).html(new_value)
									setTimeout(function(){
										try {
											var $contents  = $(CKEDITOR.instances[key].editable().$);
											assert.equal($contents.html(), 'test change [!a!]link[/!a!] after link');
											assert.equal($('.intext-citation-preview').html(), 'test change <a href="#">link</a> after link');
											CKEDITOR.instances[key].destroy();
											CKEDITOR.dialog.getCurrent().hide();
											done();
										} catch(e) {
											return done(e);
										}
									},300);
								}
							});
							if (!editor_found) 
								throw('couldnt find dialog ckeditor instance!');
						} catch(e) {
							return done(e);
						}
					},500);
				}
			}
		}
	});
	it('should validate that opening anchor ([!a!]) exist on ok', function(done) {
		var intext_citation_found = false;
		for(var key in editor.widgets.instances) {
			if (intext_citation_found) 
				break;
			if (CKEDITOR.dialog.getCurrent()) //for some reason this test runs twice, so just check dialog isnt already active
				break;
			if(editor.widgets.instances.hasOwnProperty(key)){
				if (editor.widgets.instances[key].name == 'footnotemarker' &&
					$(editor.widgets.instances[key].element.$).attr("data-inline-citation")) {
					intext_citation_found = true;
					var intext_citation_text = $(editor.widgets.instances[key].element.$).attr("data-inline-citation");
					editor.widgets.instances[key].focus(); 
					editor.execCommand('intext_cite');
					setTimeout(function() {
						try {
							var editor_found = false;
							Object.keys(CKEDITOR.instances).forEach(function (key) {
								if (CKEDITOR.instances[key].element.$.className.match(/footnote_text/)) {
									editor_found = true;
									var $contents  = $(CKEDITOR.instances[key].editable().$);
									assert.equal($contents.html(), intext_citation_text.replace(/\[!quot!\]/g,'"') + '<br>');
									assert.equal($('.intext-citation-preview').html(), intext_citation_text.replace(/\[!quot!\]/g,'"').replace('[!a!]','<a href="#">').replace('[/!a!]','</a>') + '<br>');
									var new_value = 'test change link[/!a!] after link';
									CKEDITOR.instances[key].setData(new_value);
									CKEDITOR.instances[key].fire('change');
									CKEDITOR.dialog.getCurrent()._.buttons['ok'].click();
									setTimeout(function(){
										try {
											var $contents  = $(CKEDITOR.instances[key].editable().$);
											assert.equal($('.intext-citation-validation').html(), 'The In-Text Citation must contain the link anchor tags with text between them<br>eg: Weinberg [!a!]1967[/!a!].');
											CKEDITOR.instances[key].destroy();
											CKEDITOR.dialog.getCurrent().hide();
											done();
										} catch(e) {
											return done(e);
										}
									},500);
								}
							});
							if (!editor_found) 
								throw('couldnt find dialog ckeditor instance!');
						} catch(e) {
							return done(e);
						}
					},500);
				}
			}
		}
	});
	
	it('should clear the validation text, and re-init the intext citation based on current value on re-open of dialog after cancel', function(done) {
		var intext_citation_found = false;
		for(var key in editor.widgets.instances) {
			if (intext_citation_found) 
				break;
			if (CKEDITOR.dialog.getCurrent()) //for some reason this test runs twice, so just check dialog isnt already active
				break;
			if(editor.widgets.instances.hasOwnProperty(key)){
				if (editor.widgets.instances[key].name == 'footnotemarker' &&
					$(editor.widgets.instances[key].element.$).attr("data-inline-citation")) {
					intext_citation_found = true;
					var intext_citation_text = $(editor.widgets.instances[key].element.$).attr("data-inline-citation");
					editor.widgets.instances[key].focus(); 
					editor.execCommand('intext_cite');
					setTimeout(function() {
						try {
							var editor_found = false;
							Object.keys(CKEDITOR.instances).forEach(function (key) {
								if (CKEDITOR.instances[key].element.$.className.match(/footnote_text/)) {
									editor_found = true;
									var $contents  = $(CKEDITOR.instances[key].editable().$);
									assert.equal($contents.html(), intext_citation_text.replace(/\[!quot!\]/g,'"') + '<br>');
									assert.equal($('.intext-citation-preview').html(), intext_citation_text.replace(/\[!quot!\]/g,'"').replace('[!a!]','<a href="#">').replace('[/!a!]','</a>') + '<br>');
									assert.equal($('.intext-citation-validation').html(), '');
									setTimeout(function(){
										try {
											CKEDITOR.instances[key].destroy();
											CKEDITOR.dialog.getCurrent().hide();
											done();
										} catch(e) {
											return done(e);
										}
									},500);
								}
							});
							if (!editor_found) 
								throw('couldnt find dialog ckeditor instance!');
						} catch(e) {
							return done(e);
						}
					},500);
				}
			}
		}
	});
	it('should validate that closing anchors ([/!a!]) exist on ok', function(done) {
		var intext_citation_found = false;
		for(var key in editor.widgets.instances) {
			if (intext_citation_found) 
				break;
			if (CKEDITOR.dialog.getCurrent()) //for some reason this test runs twice, so just check dialog isnt already active
				break;
			if(editor.widgets.instances.hasOwnProperty(key)){
				if (editor.widgets.instances[key].name == 'footnotemarker' &&
					$(editor.widgets.instances[key].element.$).attr("data-inline-citation")) {
					intext_citation_found = true;
					var intext_citation_text = $(editor.widgets.instances[key].element.$).attr("data-inline-citation");
					editor.widgets.instances[key].focus(); 
					editor.execCommand('intext_cite');
					setTimeout(function() {
						try {
							var editor_found = false;
							Object.keys(CKEDITOR.instances).forEach(function (key) {
								if (CKEDITOR.instances[key].element.$.className.match(/footnote_text/)) {
									editor_found = true;
									var $contents  = $(CKEDITOR.instances[key].editable().$);
									assert.equal($contents.html(), intext_citation_text.replace(/\[!quot!\]/g,'"') + '<br>');
									assert.equal($('.intext-citation-preview').html(), intext_citation_text.replace(/\[!quot!\]/g,'"').replace('[!a!]','<a href="#">').replace('[/!a!]','</a>') + '<br>');
									var new_value = 'test change link[!a!] after link';
									CKEDITOR.instances[key].setData(new_value);
									CKEDITOR.instances[key].fire('change');
									CKEDITOR.dialog.getCurrent()._.buttons['ok'].click();
									setTimeout(function(){
										try {
											var $contents  = $(CKEDITOR.instances[key].editable().$);
											assert.equal($('.intext-citation-validation').html(), 'The In-Text Citation must contain the link anchor tags with text between them<br>eg: Weinberg [!a!]1967[/!a!].');
											CKEDITOR.instances[key].destroy();
											CKEDITOR.dialog.getCurrent().hide();
											done();
										} catch(e) {
											return done(e);
										}
									},500);
								}
							});
							if (!editor_found) 
								throw('couldnt find dialog ckeditor instance!');
						} catch(e) {
							return done(e);
						}
					},500);
				}
			}
		}
	});
	it('should validate that both opening and closing anchors ([!a!] and [/!a!]) exist and have text between them on ok', function(done) {
		var intext_citation_found = false;
		for(var key in editor.widgets.instances) {
			if (intext_citation_found) 
				break;
			if (CKEDITOR.dialog.getCurrent()) //for some reason this test runs twice, so just check dialog isnt already active
				break;
			if(editor.widgets.instances.hasOwnProperty(key)){
				if (editor.widgets.instances[key].name == 'footnotemarker' &&
					$(editor.widgets.instances[key].element.$).attr("data-inline-citation")) {
					intext_citation_found = true;
					var intext_citation_text = $(editor.widgets.instances[key].element.$).attr("data-inline-citation");
					editor.widgets.instances[key].focus(); 
					editor.execCommand('intext_cite');
					setTimeout(function() {
						try {
							var editor_found = false;
							Object.keys(CKEDITOR.instances).forEach(function (key) {
								if (CKEDITOR.instances[key].element.$.className.match(/footnote_text/)) {
									editor_found = true;
									var $contents  = $(CKEDITOR.instances[key].editable().$);
									assert.equal($contents.html(), intext_citation_text.replace(/\[!quot!\]/g,'"') + '<br>');
									assert.equal($('.intext-citation-preview').html(), intext_citation_text.replace(/\[!quot!\]/g,'"').replace('[!a!]','<a href="#">').replace('[/!a!]','</a>') + '<br>');
									var new_value = 'test change link[!a!][/!a!] after link';
									CKEDITOR.instances[key].setData(new_value);
									CKEDITOR.instances[key].fire('change');
									CKEDITOR.dialog.getCurrent()._.buttons['ok'].click();
									setTimeout(function(){
										try {
											var $contents  = $(CKEDITOR.instances[key].editable().$);
											assert.equal($('.intext-citation-validation').html(), 'The In-Text Citation must contain the link anchor tags with text between them<br>eg: Weinberg [!a!]1967[/!a!].');
											CKEDITOR.instances[key].destroy();
											CKEDITOR.dialog.getCurrent().hide();
											done();
										} catch(e) {
											return done(e);
										}
									},500);
								}
							});
							if (!editor_found) 
								throw('couldnt find dialog ckeditor instance!');
						} catch(e) {
							return done(e);
						}
					},500);
				}
			}
		}
	});
	it('should not update the intext citation text on cancel', function(done) {
		var intext_citation_found = false;
		for(var key in editor.widgets.instances) {
			if (intext_citation_found) 
				break;
			if (CKEDITOR.dialog.getCurrent()) //for some reason this test runs twice, so just check dialog isnt already active
				break;
			if(editor.widgets.instances.hasOwnProperty(key)){
				if (editor.widgets.instances[key].name == 'footnotemarker' &&
					$(editor.widgets.instances[key].element.$).attr("data-inline-citation")) {
					var widget_key = key;
					intext_citation_found = true;
					var intext_citation_text = $(editor.widgets.instances[key].element.$).attr("data-inline-citation");
					editor.widgets.instances[key].focus(); 
					editor.execCommand('intext_cite');
					setTimeout(function() {
						try {
							var editor_found = false;
							Object.keys(CKEDITOR.instances).forEach(function (key2) {
								if (CKEDITOR.instances[key2].element.$.className.match(/footnote_text/)) {
									editor_found = true;
									var $contents  = $(CKEDITOR.instances[key2].editable().$);
									assert.equal($contents.html(), intext_citation_text.replace(/\[!quot!\]/g,'"') + '<br>');
									assert.equal($('.intext-citation-preview').html(), intext_citation_text.replace(/\[!quot!\]/g,'"').replace('[!a!]','<a href="#">').replace('[/!a!]','</a>') + '<br>');
									var new_value = 'test change link[!a!][/!a!] after link';
									CKEDITOR.instances[key2].setData(new_value);
									CKEDITOR.instances[key2].fire('change');
									CKEDITOR.dialog.getCurrent()._.buttons['cancel'].click();
									setTimeout(function() {
										try {
											//var $contents  = $(CKEDITOR.instances[key2].editable().$);
											assert.equal($(editor.widgets.instances[widget_key].element.$).attr("data-inline-citation"), intext_citation_text);
											//CKEDITOR.instances[key2].destroy();
											//CKEDITOR.dialog.getCurrent().hide();
											done();
										} catch(e) {
											return done(e);
										}
									},500);
								}
							});
							if (!editor_found) 
								throw('couldnt find dialog ckeditor instance!');
						} catch(e) {
							return done(e);
						}
					},500);
				}
			}
		}
	});
	it('should update the intext citation text on ok, for only that inline citation it wont change the inline citation text of any other intext citations referencing the same citation', function(done) {
		//insert some duplicates
		CKEDITOR.instances.doc.plugins.cite.insert(
			'test <strong>custom footnote</strong> data7', CKEDITOR.instances.doc, '&lt;foo [!a!]"inside7[/!a!] bar&gt;');
		setTimeout(function(){
			CKEDITOR.instances.doc.plugins.cite.insert(
				'test <strong>custom footnote</strong> data7', CKEDITOR.instances.doc, '&lt;foo [!a!]"inside7[/!a!] bar&gt;');
			var intext_citation_found = false;
			for(var key in editor.widgets.instances) {
				if (intext_citation_found) 
					break;
				if (CKEDITOR.dialog.getCurrent()) //for some reason this test runs twice, so just check dialog isnt already active
					break;
				if(editor.widgets.instances.hasOwnProperty(key)){
					if (editor.widgets.instances[key].name == 'footnotemarker' &&
						$(editor.widgets.instances[key].element.$).attr("data-inline-citation") == '<foo [!a!]"inside5[/!a!] bar>') {
						var widget_key = key;
						intext_citation_found = true;
						var intext_citation_text = $(editor.widgets.instances[key].element.$).attr("data-inline-citation");
						editor.widgets.instances[key].focus(); 
						editor.execCommand('intext_cite');
						setTimeout(function() {
							try {
								var editor_found = false;
								Object.keys(CKEDITOR.instances).forEach(function (key2) {
									if (CKEDITOR.instances[key2].element.$.className.match(/footnote_text/)) {
										editor_found = true;
										var $contents  = $(CKEDITOR.instances[key2].editable().$);
										assert.equal($contents.html(), intext_citation_text.replace(/\[!quot!\]/g,'"') + '<br>');
										assert.equal($('.intext-citation-preview').html(), intext_citation_text.replace(/\[!quot!\]/g,'"').replace('[!a!]','<a href="#">').replace('[/!a!]','</a>') + '<br>');
										var new_value = 'test< change [!a!]li&nk[/!a!] after >link';
										CKEDITOR.instances[key2].setData(new_value);
										CKEDITOR.instances[key2].fire('change');
										CKEDITOR.dialog.getCurrent()._.buttons['ok'].click();
										setTimeout(function() {
											try {
												//var $contents  = $(CKEDITOR.instances[key2].editable().$);
												assert.equal($(editor.widgets.instances[widget_key].element.$).attr("data-inline-citation"), new_value);
												//CKEDITOR.instances[key2].destroy();
												//CKEDITOR.dialog.getCurrent().hide();
												done();
											} catch(e) {
												return done(e);
											}
										},500);
									}
								});
								if (!editor_found) 
									throw('couldnt find dialog ckeditor instance!');
							} catch(e) {
								return done(e);
							}
						},500);
					}
				}
			}
		},200);
	});
	it('should default the current auto numbered citation value and default the preview transforming anchor tags into link', function() {
		
	});
});


