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
				marker_footnote_id +'-1" data-citation="test <strong>footnote</strong> data1" data-footnote-id="' + 
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
					marker_footnote_id +'-1" data-citation="test <strong>footnote</strong> data'+i+'" data-footnote-id="' + 
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
					marker_footnote_id +'-'+(i==3 ? 2 : 1)+'" data-citation="test <strong>footnote</strong> data'+(i==3 ? 2 : i)+'" data-footnote-id="' + 
					marker_footnote_id + '">['+i+']</a>',
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
			
		});
		
		it('should create a new custom inline cited footnote auto-incremented when the footnote ' + 
			'text is different to existing footnotes', function() {
			
		});
		
		it('should reference the same custom inline cited footnote when cited multiple times', function() {
			
		});
	});
});

describe('generateMarkerHtml', function() {
    describe('default mode (auto numbered footnotes)', function() {
		it('should return a numbered footnote wrapped in anchor', function() {
			assert.equal(
				'<a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-footnote-id="' + 'foo1' + '">[' + '2' + ']</a>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 2, 3, 'foo1', null)
				);
		});
	});
	describe('custom inline citation marker format', function() {
		it('should apply the anchor transformations [!a!] -> <a.. ' + 
			'where no text after anchor close', function() {
			assert.equal(
				'foobar <a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-inline-citation="foobar [!a!]inside anchor[/!a!]" data-footnote-id="' + 
					'foo1' + '">inside anchor</a>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 2, 3, 'foo1', 'foobar [!a!]inside anchor[/!a!]')
				);
		});
		it('should apply the anchor transformations [!a!] -> <a.. where no text before the anchor open but text after anchor close pattern', function() {
			assert.equal(
				'<a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-inline-citation="[!a!]inside anchor[/!a!] foobar" data-footnote-id="' + 
					'foo1' + '">inside anchor</a> foobar',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 2, 3, 'foo1', '[!a!]inside anchor[/!a!] foobar')
				);
		});
		it('should apply the anchor transformations [!a!] -> <a.. where no text before or after the anchor patterns', function() {
			assert.equal(
				'<a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-inline-citation="[!a!]inside anchor[/!a!]" data-footnote-id="' + 
					'foo1' + '">inside anchor</a>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 2, 3, 'foo1', '[!a!]inside anchor[/!a!]')
				);
		});
		it('should apply the anchor transformations automatically to the entire string if the anchor pattern doesnt exist', function() {
			assert.equal(
				'<a href="#footnote' + '1' + '-' + 'foo1' + '" id="footnote-marker' + '1' + '-' + 'foo1' + '-' + '3' +
					'" data-citation="test citation" data-inline-citation="inside anchor" data-footnote-id="' + 
					'foo1' + '">inside anchor</a>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 'test citation', 2, 3, 'foo1', 'inside anchor')
				);
		});
		it('should handle citations with double quotes within the citation', function() {
			assert.equal(1,0);
		});
		it('should handle citations with html special characters within the citation', function() {
			assert.equal(1,0);
		});
	});
});

