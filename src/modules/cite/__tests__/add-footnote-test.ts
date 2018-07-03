import addFootnote from '../add-footnote';

describe('addFootnote', () => {
  beforeEach(() => {
  });

  test('foo', () => {
    const footnote = 'my footnote';
    const footnotesOlHtml = jest.fn();
    const footnotesOlAppend = jest.fn();
    const footnotesOl = () => ({
      find: jest.fn().mockImplementation(() => ({
        html: footnotesOlHtml,
        append: footnotesOlAppend,
      })),
    });
    const footnotesLength = jest.fn().mockImplementation(() => 1);
    const footnotesFind = jest.fn().mockImplementation(footnotesOl);
    const footnotes = () => ({
      find: footnotesFind,
      length: footnotesLength,
    });
    const $contents = {
      find: footnotesFind,
      length: footnotesLength,
    };
    const editor = jest.fn();
    addFootnote(editor, $contents)(footnote);
    expect(footnotesFind).toHaveBeenCalledWith('.footnotes');
    expect(footnotesOlAppend).toHaveBeenCalledWith(footnote);
  });

});
