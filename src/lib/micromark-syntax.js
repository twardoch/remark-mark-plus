/**
 * @fileoverview
 *   Micromark syntax extension to support GFM-like mark (`==highlighted==`).
 */

// src/lib/micromark-syntax.js
import {codes} from 'micromark-util-symbol'
import {markdownLineEnding, markdownSpace} from 'micromark-util-character'

const MARKER_CODE = codes.equalsTo
const SEQUENCE_SIZE = 2

/**
 * Token types for the mark syntax.
 * @enum {string}
 */
export const types = {
  mark: 'mark', // The main wrapping token for a mark node `==text==`
  markSequence: 'markSequence', // Token for the `==` sequence
  markText: 'markText', // Token for the text content within marks
}

/**
 * Micromark extension for GFM-like mark syntax.
 *
 * @returns {import('micromark-util-types').Extension}
 *   The Micromark extension.
 */
export function markSyntax () {
  return {
    text: {[MARKER_CODE]: {tokenize: tokenizeMark, partial: true}},
  }
}

/** @type {import('micromark-util-types').Tokenizer} */
function tokenizeMark (effects, ok, nok) {
  let closeSeqSize = 0

  return start

  /** @type {import('micromark-util-types').State} */
  function start (code) {
    // `code` is the first suspected marker character.
    // Tokenizer is invoked when `MARKER_CODE` is seen.
    effects.enter(types.markSequence)
    effects.consume(code) // Consume the first '='
    return insideOpeningSequence
  }

  /** @type {import('micromark-util-types').State} */
  function insideOpeningSequence (code) {
    // `code` is the character *after* the first consumed '='.
    if (code === MARKER_CODE) { // This is the second '='
      effects.consume(code)
      effects.exit(types.markSequence) // Successfully consumed "=="
      return checkAfterOpening // Next state will get char after "=="
    }
    // The character after the first "=" was not another "=".
    // So, the first "=" was not part of our "==" sequence.
    effects.exit(types.markSequence) // Exit the sequence for the single initial "=".
    return nok(code) // Let other tokenizers handle this `code`. Micromark will backtrack.
  }

  /** @type {import('micromark-util-types').State} */
  function checkAfterOpening (code) {
    // `code` here is the character *immediately after* the opening "==".
    // Disallow "===", "==\s", or "==" at EOF.
    if (code === MARKER_CODE || markdownSpace(code) || code === null) {
      return nok(code)
    }
    // Valid opening, proceed to content
    effects.enter(types.mark) // Enter the main "mark" token
    effects.enter(types.markText) // Enter the "markText" token for content
    return contentText(code) // Start consuming content with the current valid character
  }

  /** @type {import('micromark-util-types').State} */
  function contentText (code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      // Unterminated or newline breaks mark
      effects.exit(types.markText)
      effects.exit(types.mark)
      return nok(code)
    }

    if (code === MARKER_CODE) {
      // Potential closing sequence
      effects.exit(types.markText)
      effects.enter(types.markSequence) // Potential closing sequence
      closeSeqSize = 0
      return closingSequence(code)
    }

    effects.consume(code)
    return contentText
  }

  /** @type {import('micromark-util-types').State} */
  function closingSequence (code) {
    if (code === MARKER_CODE && closeSeqSize < SEQUENCE_SIZE) {
      effects.consume(code)
      closeSeqSize++
      return closingSequence
    }

    if (closeSeqSize === SEQUENCE_SIZE) {
      // Valid "==" closing sequence.
      // Note: GFM spec for strikethrough (similar syntax) disallows preceding whitespace
      // before the closing marker. This version does not implement that rule;
      // e.g., `==text ==` will parse as marked text.

      // Regarding `==a =b==` (single '=' consumed by closingSequence and then failing):
      // TODO: Verify with tests. Theory suggests `partial:true` + `nok` handles this correctly.

      effects.exit(types.markSequence) // Exit closing "=="
      effects.exit(types.mark) // Exit main "mark"
      return ok(code)
    }

    // Not a "==". This means the first "=" (that started the potential closing sequence)
    // was actually part of the content.
    // `nok` allows micromark to backtrack and re-parse that "=" as part of `markText`,
    // thanks to `partial: true` on the tokenizer.
    return nok(code)
  }
}
