import { codes } from 'micromark-util-symbol/codes.js';
import { types } from 'micromark-util-types';
import { factorySpace } from 'micromark-factory-space';
const MARKER_SEQUENCE = [codes.equalsTo, codes.equalsTo]; // ==

function tokenize(effects, ok, nok) {
  let size = 0;
  return start;
  function start(code) {
    if (code !== MARKER_SEQUENCE[0]) return nok(code);
    effects.enter('markSequenceTemporary');
    effects.consume(code);
    return open;
  }
  function open(code) {
    if (code !== MARKER_SEQUENCE[1]) return nok(code);
    effects.consume(code);
    effects.exit('markSequenceTemporary');
    return afterOpen;
  }
  function afterOpen(code) {
    // Original plugin behavior: Do not parse if whitespace follows opening marker `== `
    // or if it's `====`
    if (code === codes.space || code === codes.horizontalTab || code === codes.virtualSpace || code === MARKER_SEQUENCE[0]) {
      return nok(code);
    }
    // Check for `====` case (e.g. == followed by ==)
    // This is tricky because the current `code` is the character *after* the initial `==`.
    // If the character after `==` is another `=`, it could be `===` or `====`.
    // The previous check `code === MARKER_SEQUENCE[0]` handles `===` by not parsing.
    // For `====`, the `tokenizer.previous` would be the first `=` of the second pair.
    // This needs to be handled carefully, perhaps by ensuring there's content.
    // The initial check `code === MARKER_SEQUENCE[0]` (i.e., the next char is '=')
    // effectively prevents `===` and `====` from starting a valid mark sequence
    // because it expects content next, not another equals.

    effects.enter('mark');
    effects.enter('markSequenceOpen');
    effects.enter(types.chunkString, {
      contentType: types.contentTypeString
    });
    effects.consume(MARKER_SEQUENCE[0]);
    effects.consume(MARKER_SEQUENCE[1]);
    effects.exit(types.chunkString);
    effects.exit('markSequenceOpen');
    effects.enter('markText'); // Container for the content
    return data;
  }
  function data(code) {
    if (code === codes.eof) return nok(code); // End of file before closing marker

    if (code === MARKER_SEQUENCE[0]) {
      // Potential closing marker
      effects.enter('markSequenceTemporary');
      effects.consume(code);
      return potentialEnd;
    }

    // Consume content character
    effects.consume(code);
    return data; // Loop back to consume more content
  }
  function potentialEnd(code) {
    if (code === MARKER_SEQUENCE[1]) {
      // It's a closing marker `==`
      effects.exit('markSequenceTemporary'); // Exit the temporary marker sequence
      effects.exit('markText'); // Exit content

      effects.enter('markSequenceClose');
      effects.enter(types.chunkString, {
        contentType: types.contentTypeString
      });
      effects.consume(MARKER_SEQUENCE[0]); // consume the first = of closing ==
      effects.consume(MARKER_SEQUENCE[1]); // consume the second = of closing ==
      effects.exit(types.chunkString);
      effects.exit('markSequenceClose');
      effects.exit('mark');
      return ok;
    }
    // Not a closing marker (e.g. just a single '=' within the text)
    // So, the previous '=' was part of the content.
    // We need to "replay" it as content.
    effects.exit('markSequenceTemporary');
    effects.consume(MARKER_SEQUENCE[0]); // Re-consume the first '=' as content
    return data(code); // Continue with current code as content
  }
}
const markSyntax = {
  text: {
    [codes.equalsTo]: {
      tokenize
    }
  }
};
function fromMarkdown(options) {
  let buffer = [];
  function enterMark(token) {
    this.enter({
      type: 'mark',
      children: []
    }, token);
  }
  function exitMark(token) {
    const data = this.resume();
    const node = this.stack[this.stack.length - 1];
    this.exit(token);
    node.children = data; // data should be an array of phrasing content
  }
  function enterMarkText(token) {
    buffer = []; // Clear buffer for new text segment
    this.buffer(); // Activate buffering for phrasing content
  }
  function exitMarkText(token) {
    const data = this.resume().replace(/^==|==$/g, ''); // Remove markers if they were buffered
    const node = this.stack[this.stack.length - 1];
    // The default fromMarkdown for text should handle this, but we ensure markers are stripped.
    // However, the micromark tokenizer is designed to exclude markers from the 'markText' token.
    // So, this.resume() here should give the pure content.
    // The `markText` token itself should not contain the `==`
  }
  return {
    enter: {
      mark: enterMark
      // markText: enterMarkText, // Let default phrasing content handling work within mark
    },
    exit: {
      mark: exitMark
      // markText: exitMarkText,
    }
  };
}
function toMarkdown(options) {
  return {
    handlers: {
      mark(node, _, context) {
        const exit = context.enter('mark');
        const value = context.containerPhrasing(node, {
          before: '=',
          after: '='
        });
        exit();
        return `==${value}==`;
      }
    },
    unsafe: [{
      character: '=',
      inConstruct: 'phrasing'
    }]
  };
}
export default function remarkMarkPlus(options = {}) {
  const data = this.data();
  function add(field, value) {
    const list = data[field] ? data[field] : data[field] = [];
    list.push(value);
  }
  add('micromarkExtensions', markSyntax);
  add('fromMarkdownExtensions', fromMarkdown(options));
  add('toMarkdownExtensions', toMarkdown(options));
}
//# sourceMappingURL=index.js.map