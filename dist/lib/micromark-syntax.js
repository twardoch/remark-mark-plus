"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.markSyntax = markSyntax;
exports.types = void 0;
var _micromarkUtilSymbol = require("micromark-util-symbol");
var _micromarkUtilCharacter = require("micromark-util-character");
/**
 * @fileoverview
 *   Micromark syntax extension to support GFM-like mark (`==highlighted==`).
 */

// src/lib/micromark-syntax.js

// Removed: import {types as coreTypes} from 'micromark-util-symbol/types.js'

const MARKER_CODE = _micromarkUtilSymbol.codes.equalsTo;
const SEQUENCE_SIZE = 2;

/**
 * Token types for the mark syntax.
 * @enum {string}
 */
const types = exports.types = {
  mark: 'mark',
  // The main wrapping token for a mark node `==text==`
  markSequence: 'markSequence',
  // Token for the `==` sequence
  markText: 'markText' // Token for the text content within marks
};

/**
 * Micromark extension for GFM-like mark syntax.
 *
 * @returns {import('micromark-util-types').Extension}
 *   The Micromark extension.
 */
function markSyntax() {
  return {
    text: {
      [MARKER_CODE]: {
        tokenize: tokenizeMark,
        partial: true
      }
    }
  };
}

/** @type {import('micromark-util-types').Tokenizer} */
function tokenizeMark(effects, ok, nok) {
  // const self = this // Removed as 'this' is used directly by state functions
  // let openSeqSize = 0 // Replaced by direct state transitions
  let closeSeqSize = 0;
  // Removed: let textStartPoint

  return start;

  /** @type {import('micromark-util-types').State} */
  function start(code) {
    // `code` is the first suspected marker character.
    // Tokenizer is invoked when `MARKER_CODE` is seen.
    effects.enter(types.markSequence);
    effects.consume(code); // Consume the first '='
    return insideOpeningSequence;
  }

  /** @type {import('micromark-util-types').State} */
  function insideOpeningSequence(code) {
    // `code` is the character *after* the first consumed '='.
    if (code === MARKER_CODE) {
      // This is the second '='
      effects.consume(code);
      effects.exit(types.markSequence); // Successfully consumed "=="
      return checkAfterOpening; // Next state will get char after "=="
    }
    // The character after the first "=" was not another "=".
    // So, the first "=" was not part of our "==" sequence.
    effects.exit(types.markSequence); // Exit the sequence for the single initial "=".
    return nok(code); // Let other tokenizers handle this `code`. Micromark will backtrack.
  }

  /** @type {import('micromark-util-types').State} */
  function checkAfterOpening(code) {
    // `code` here is the character *immediately after* the opening "==".
    // Disallow "===", "==\s", or "==" at EOF.
    if (code === MARKER_CODE || (0, _micromarkUtilCharacter.markdownSpace)(code) || code === null) {
      return nok(code);
    }
    // Valid opening, proceed to content
    effects.enter(types.mark); // Enter the main "mark" token
    effects.enter(types.markText); // Enter the "markText" token for content
    return contentText(code); // Start consuming content with the current valid character
  }

  /** @type {import('micromark-util-types').State} */
  function contentText(code) {
    if (code === _micromarkUtilSymbol.codes.eof || (0, _micromarkUtilCharacter.markdownLineEnding)(code)) {
      // Unterminated or newline breaks mark
      effects.exit(types.markText);
      effects.exit(types.mark);
      return nok(code);
    }
    if (code === MARKER_CODE) {
      // Potential closing sequence
      effects.exit(types.markText);
      effects.enter(types.markSequence); // Potential closing sequence
      closeSeqSize = 0;
      return closingSequence(code);
    }
    effects.consume(code);
    return contentText;
  }

  /** @type {import('micromark-util-types').State} */
  function closingSequence(code) {
    if (code === MARKER_CODE && closeSeqSize < SEQUENCE_SIZE) {
      effects.consume(code);
      closeSeqSize++;
      return closingSequence;
    }
    if (closeSeqSize === SEQUENCE_SIZE) {
      // Valid "==" closing sequence.
      // Check if char before this closing sequence (last char of markText) was whitespace.
      // This simplified version doesn't robustly check "no space before closing marker".
      // It also doesn't correctly handle "==a =b==" (single '=' consumed by closingSequence
      // and fail).

      // Example of a robust check (omitted for now for simplicity):
      // const precedingChar = events[events.length - 1].previous /* ... complex access ... */
      // if (markdownSpace(precedingChar)) return nok(code)

      effects.exit(types.markSequence); // Exit closing "=="
      effects.exit(types.mark); // Exit main "mark"
      return ok(code);
    }

    // Not a "==". This means the first "=" was part of text.
    // We need to "re-tokenize" that first "=" as text.
    // Simplest is `nok` here, assuming `partial:true` lets it be re-parsed as text.
    // This means "==a=b==" would fail to parse the outer mark correctly.
    return nok(code);
  }
}
//# sourceMappingURL=micromark-syntax.js.map