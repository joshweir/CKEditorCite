import addFootnote from '../add-footnote';

describe('addFootnote', () => {
  const footnote = 'my footnote';
  const footnotesOlHtml = jest.fn();
  const footnotesOlAppend = jest.fn();
  const footnotesOl = () => ({
    find: jest.fn().mockImplementation(() => ({
      html: footnotesOlHtml,
      append: footnotesOlAppend,
    })),
  });
  const footnotesFind = jest.fn().mockImplementation(footnotesOl);
  let footnotesLength;
  let $contents;
  let editor;

  const mockFootnotesExist = () => {
    footnotesLength = jest.fn().mockImplementation(() => 1);
    $contents = {
      find: footnotesFind,
      length: footnotesLength,
    };
    editor = jest.fn();
  };

  describe('when footnotes exist', () => {
    beforeEach(() => {
      mockFootnotesExist();
    });

    test('appends the new footnote', () => {
      addFootnote(editor, $contents)(footnote);
      expect(footnotesOlAppend).toHaveBeenCalledWith(footnote);
      expect(footnotesOlHtml).not.toHaveBeenCalled();
    });

    describe('and replace param is truthy', () => {
      beforeEach(() => {
        mockFootnotesExist();
      });

      test('replaces with the new footnote', () => {
        addFootnote(editor, $contents)(footnote, true);
        expect(footnotesOlAppend).not.toHaveBeenCalled();
        expect(footnotesOlHtml).toHaveBeenCalledWith(footnote);
      });
    });
  });

  afterEach(() => {
    [editor, footnotesLength, footnotesOlAppend, footnotesOlHtml]
    .map(m => m.mockReset());
  });
});
