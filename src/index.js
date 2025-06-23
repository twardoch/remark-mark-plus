import { codes } from 'micromark-util-symbol/codes.js'

const MARKER_SEQUENCE = [codes.equalsTo, codes.equalsTo] // ==

function tokenize(effects, ok, nok) {
  return start

  function start(code) {
    if (code !== MARKER_SEQUENCE[0]) {
      return nok(code)
    }
    effects.consume(code) // Consume first '='
    return open
  }

  function open(code) {
    if (code !== MARKER_SEQUENCE[1]) {
      return nok(code) // First '=' will be treated as text due to nok
    }
    effects.consume(code) // Consume second '='. Stream is now past '=='
    return afterOpenMarker
  }

  function afterOpenMarker(code) { // `code` is the character *after* the opening '=='
    if (code === codes.space || code === codes.horizontalTab || code === codes.virtualSpace || code === MARKER_SEQUENCE[0]) {
      return nok(code) // '==' will be treated as text
    }

    effects.enter('mark')
    effects.enter('markText', { contentType: 'text' })

    if (code === codes.eof) {
      effects.exit('markText')
      effects.exit('mark')
      return nok(code) // Invalid: empty mark at EOF or unclosed
    }
    effects.consume(code) // Consume the first character of content
    return data
  }

  // Sub-tokenizer for `effects.check` to see if '==' is ahead.
  // It consumes and creates temporary tokens, but `check` ensures these are rolled back.
  function closingSequenceChecker(effects, ok, nok) {
    return function checkStart(code) {
      if (code === MARKER_SEQUENCE[0]) {
        effects.enter('closingEqualsTemporary') // Temporary token for check
        effects.consume(code)
        return checkSecondEq
      }
      return nok(code)
    }

    function checkSecondEq(code) {
      if (code === MARKER_SEQUENCE[1]) {
        effects.consume(code)
        effects.exit('closingEqualsTemporary')
        return ok(code) // Found '=='
      }
      effects.exit('closingEqualsTemporary') // Didn't find '==', balance token
      return nok(code) // Not '=='
    }
  }

  function data(code) {
    if (code === codes.eof) { // Unclosed mark
      effects.exit('markText')
      effects.exit('mark')
      return nok(code)
    }

    if (code === MARKER_SEQUENCE[0]) { // Potential start of closing sequence '=='
      // Use `effects.check` to look ahead without permanently consuming if it fails.
      return effects.check(
        { tokenize: closingSequenceChecker, partial: true },
        foundClosingSequence, // If `closingSequenceChecker` returns `ok`
        notClosingSequence, // If `closingSequenceChecker` returns `nok`
      )(code) // Pass the current '=' to the checker
    }

    effects.consume(code) // It's a content character
    return data
  }

  // Called by `check` if `closingSequenceChecker` found '=='
  // The stream is now *back* to where it was when `check` was called (i.e., at the first '=' of closing '==')
  function foundClosingSequence(code) { // `code` is the first '=' of the closing sequence
    effects.exit('markText') // Finalize content

    effects.enter('markSequenceClose') // Token for the closing '=='
    effects.consume(MARKER_SEQUENCE[0]) // Consume first '='
    effects.consume(MARKER_SEQUENCE[1]) // Consume second '='
    effects.exit('markSequenceClose')

    effects.exit('mark') // Finalize the mark itself
    return ok(code) // Successful end of the main mark construct
    // `code` here is the first char of the closing sequence,
    // but the main stream pointer is now *after* the closing '=='
  }

  // Called by `check` if `closingSequenceChecker` did NOT find '=='
  // (e.g., it was a single '=' or '=a')
  // The stream is *back* to where it was when `check` was called.
  function notClosingSequence(code) { // `code` is the character that was checked (the first '=')
    effects.consume(code) // Consume this character as part of markText
    return data // Continue in data state, the *next* char will be passed to data
  }
}

const markSyntax = {
  text: { [codes.equalsTo]: { tokenize } },
}

function fromMarkdown(_options) {
  function enterMark(token) {
    this.enter({ type: 'mark', data: { hName: 'mark' }, children: [] }, token)
  }

  function exitMark(token) {
    this.exit(token)
  }

  // No need to handle 'closingEqualsTemporary' as `check` rolls it back.
  // No need to handle 'markSequenceClose' if it's just a marker, unless it needs specific AST properties.
  // mdast-util-from-markdown will ignore it if it has no children and isn't a known type to map.

  return {
    enter: {
      mark: enterMark,
    },
    exit: {
      mark: exitMark,
    },
  }
}

function toMarkdown(_options) {
  return {
    handlers: {
      mark(node, _, context) {
        const exit = context.enter('mark')
        const value = context.containerPhrasing(node, { before: '', after: '' })
        exit()
        return `==${value}==`
      },
    },
    unsafe: [
      { character: '=', inConstruct: 'phrasing', notAtStart: true, notAtEnd: true },
    ],
  }
}

export default function remarkMarkPlus(_options = {}) {
  const data = this.data()

  function add(field, value) {
    const list = data[field] ? data[field] : (data[field] = [])
    list.push(value)
  }

  add('micromarkExtensions', markSyntax)
  add('fromMarkdownExtensions', fromMarkdown(_options))
  add('toMarkdownExtensions', toMarkdown(_options))
}
