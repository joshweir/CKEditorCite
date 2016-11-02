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
				'test <strong>footnote</strong> data', CKEDITOR.instances.doc);
			
			//get the content
			var $contents  = $(editor.editable().$);
			console.log($contents.html());
			
			//verify the marker format as expected
			
			
			//verify the footnote format as expected
			var $footnotes = $contents.find('.footnotes > ol > li');
			//console.log($footnotes.html());
			$footnotes.each(function() {
				var $this = $(this);
				//get the footnote id
				var footnote_id = $this.attr('data-footnote-id');
				//check the sup reference back to the marker and value is ^
				assert.equal($this.find('sup > a').attr('href'),'#footnote-marker-' + footnote_id + '-1');
				
				//check the cite value is correct based on input citation
				assert.equal( $this.find('cite').value, 'test <strong>footnote</strong> data');
				
			});
		});
		it('should create a new footnote auto-incremented when the footnote ' + 
			'text is different to existing footnotes', function() {
			
		});
		it('should reference the same numbered footnote when cited multiple times', function() {
			
		});
	});
	describe('custom inline citation marker format', function() {
		
	});
});

describe('generateMarkerHtml', function() {
    describe('default mode (auto numbered footnotes)', function() {
		it('should return a numbered footnote wrapped in anchor', function() {
			assert.equal(
				'<a href="#footnote' + '1' + '-' + '2' + '" id="footnote-marker' + '1' + '-' + '3' + 
					'" rel="footnote" data-footnote-id="' + 'foo1' + '">[' + '2' + ']</a>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 2, 3, 'foo1', null)
				);
		});
	});
	describe('custom inline citation marker format', function() {
		it('should apply the anchor transformations [!a!] -> <a.. ' + 
			'where no text after anchor close', function() {
			assert.equal(
				//change so that the href doesnt use the footnote number (n) anymore, instead 
				//uses the footnote-id, change all references to this in rest of plugin
				//also change non-inline-citation to use this also
				'foobar <a href="#footnote' + '1' + '-' + '2' + '" id="footnote-marker' + '1' + '-' + '3' + 
					'" rel="footnote" data-footnote-id="' + 'foo1' + '">inside anchor</a>',
				CKEDITOR.instances.doc.plugins.cite.generateMarkerHtml(
					1, 2, 3, 'foo1', 'foobar [!a!]inside anchor[/!a!]')
				);
		});
		it('should apply the anchor transformations [!a!] -> <a.. where no text before the anchor open but text after anchor close pattern', function() {
			CKEDITOR.instances.doc.plugins.cite.insertCitation('test <strong>footnote</strong> data', CKEDITOR.instances.doc);
				assert.equal(1,0);
		});
		it('should apply the anchor transformations [!a!] -> <a.. where no text before or after the anchor patterns', function() {
			CKEDITOR.instances.doc.plugins.cite.insertCitation('test <strong>footnote</strong> data', CKEDITOR.instances.doc);
			assert.equal(1,0);
		});
		it('should apply the anchor transformations automatically to the entire string if the anchor pattern doesnt exist', function() {
			assert.equal(1,0);
		});
	});
});


