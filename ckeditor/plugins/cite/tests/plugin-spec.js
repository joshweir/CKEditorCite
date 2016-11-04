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
					assert.equal(
						$this.find('span.inline-citation-after-link').html(), 
						' bar&gt;');
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
					assert.equal(
						$this.find('span.inline-citation-after-link').html(), 
						' bar&gt;');
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
			//console.log(marker_footnote_ids);
			//console.log($contents.find('.footnotes').html());
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
						assert.equal(
							$this.find('span.inline-citation-after-link').html(), 
							' bar&gt;');
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
						assert.equal(
							$this.find('span.inline-citation-after-link').html(), 
							' bar&gt;');
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
			//console.log(marker_footnote_ids);
			//console.log($contents.find('.footnotes').html());
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

