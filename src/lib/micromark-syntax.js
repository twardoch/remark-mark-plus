/**
 * @fileoverview
 *   Micromark syntax extension to support GFM-like mark (`==highlighted==`).
 */

// src/lib/micromark-syntax.js
import {codes, constants, types as coreTokenTypes} from 'micromark-util-symbol'
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

  // This is the tokenizer for the potential closing sequence
  const tokenizeClosingSequence = (effects, ok, nok) => {
    let size = 0

    return startSequence

    function startSequence (code) {
      // We are here because contentText saw an '='.
      // That '=' is the 'code' passed to this function.
      if (code !== MARKER_CODE) return nok(code) // Should not happen if called correctly
      // Mark as temporary
      effects.enter(
        types.markSequence,
        {_temporary: true},
      )
      effects.consume(code)
      size++
      return insideSequence
    }

    function insideSequence (code) {
      if (size < SEQUENCE_SIZE && code === MARKER_CODE) {
        effects.consume(code)
        size++
        return insideSequence // Stay in this state if we're building up the sequence
      }

      if (size === SEQUENCE_SIZE) {
        effects.exit(types.markSequence)
        // The `ok` callback (afterClosingSequenceSuccess) will handle exiting other tokens
        return ok // `attempt` will call `afterClosingSequenceSuccess` with the char *after* `==`
      }

      // Not a full sequence (e.g., "=b" or just "=" at EOF/space)
      // The `markSequence` was temporary, so `effects.attempt` will discard it.
      return nok // `attempt` will call `afterClosingSequenceFail` with the original char that started the attempt
    }
  }


  return start

  /** @type {import('micromark-util-types').State} */
  /* eslint-disable max-len */
  function start (code) {
    // `code` is the first suspected marker character.
    // Tokenizer is invoked when `MARKER_CODE` is seen.
    effects.enter(types.markSequence)
    effects.consume(code) // Consume the first '='
    return insideOpeningSequence
  }
  /* eslint-enable max-len */

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
    // Enter a chunkString token for the actual text data
    effects.enter(coreTokenTypes.chunkString, {contentType: constants.contentTypeString})
    return contentText(code) // Start consuming content with the current valid character
  }

  /** @type {import('micromark-util-types').State} */
  function contentText (code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      // Unterminated or newline breaks mark
      effects.exit(coreTokenTypes.chunkString) // Exit chunkString before markText
      effects.exit(types.markText)
      effects.exit(types.mark)
      return nok(code)
    }

    if (code === MARKER_CODE) {
      // Potential closing sequence. Exit current chunkString first.
      effects.exit(coreTokenTypes.chunkString)

      return effects.attempt(
        {tokenize: tokenizeClosingSequence, partial: true},
        afterClosingSequenceSuccess, // On success, chunkString is already exited.
        afterClosingSequenceFailReEnterChunk, // On failure, must re-enter chunkString.
      )(code)
    }

    effects.consume(code) // This is for the currently open chunkString
    return contentText
  }

  // chunkString was exited by contentText before attempt
  function afterClosingSequenceSuccess (code) {
    // effects.exit(coreTokenTypes.chunkString); // No longer needed here
    effects.exit(types.markText)
    effects.exit(types.mark)
    return ok(code) // This `ok` is the main `ok` from `tokenizeMark`
  }

  // chunkString was exited by contentText before attempt
  function afterClosingSequenceFailReEnterChunk (code) {
    // Attempt failed. The original MARKER_CODE (which is `code` here) should be content.
    // Re-enter chunkString to capture it.
    // Re-enter chunkString
    effects.enter(coreTokenTypes.chunkString, {contentType: constants.contentTypeString})
    effects.consume(code) // Consume the MARKER_CODE ('=') as regular content
    // chunkString is now open again.
    return contentText // Go back to contentText for the next char.
  }
}
