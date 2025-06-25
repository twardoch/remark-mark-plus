/**
 * @fileoverview
 *   mdast-util extensions to support GFM-like mark (`==highlighted==`).
 *   Defines how to transform micromark tokens into mdast (fromMarkdown)
 *   and how to serialize mdast nodes back to markdown (toMarkdown).
 */

// src/lib/mdast-util-handlers.js
import {types as markTokenTypes} from './micromark-syntax.js' // Our custom token type names

/**
 * Extension for `mdast-util-from-markdown` to handle mark tokens.
 * @type {import('mdast-util-from-markdown').Extension}
 */
export const markFromMarkdown = {
  enter: {
    [markTokenTypes.mark] (token) {
      this.enter({type: 'mark', children: []}, token)
    },
  },
  exit: {
    [markTokenTypes.mark] (token) {
      this.exit(token)
    },
    // markText is handled by the default text processing mechanism within the parent 'mark' node.
    // markSequence tokens are structural and typically don't need specific exit handlers
    // unless they contribute data to the mdast node.
  },
}

/** @type {import('mdast-util-to-markdown').Options['handlers']} */
const markToMarkdownHandlers = {
  mark: handleMark,
}

/**
 * @type {import('mdast-util-to-markdown').Handle}
 * @param {any} node
 */
function handleMark (node, _, context, safeOptions) {
  const exit = context.enter('mark')
  // `track` is important for `unsafe` patterns if content could break out.
  // For simple "==", it's mainly about getting the content.
  const value = context.containerPhrasing(node, {
    ...safeOptions,
    before: '=', // Unsafe if content starts with =
    after: '=', // Unsafe if content ends with =
  })
  exit()
  return `==${value}==`
}

/**
 * Extension for `mdast-util-to-markdown` to serialize mdast `mark` nodes.
 * @type {import('mdast-util-to-markdown').Options}
 */
export const markToMarkdown = {
  handlers: markToMarkdownHandlers,
  // `unsafe` is for characters that are unsafe *at the start or end of
  // what is currently being serialized*.
  // When serializing the content of a `mark` node, `containerPhrasing`
  // with `before`/`after` handles local context.
  // The top-level `unsafe` patterns are more about how `==` itself might
  // be problematic in broader contexts, or if the content itself could be `==`.
  // For `==value==`, the main concern is if `value` starts/ends with `=` or contains `==`.
  // If `value` itself contains `==`, `containerPhrasing` won't automatically
  // escape it unless an escape is defined.
  // This simple version assumes `value` doesn't contain unescaped `==`.
  unsafe: [
    // If a value starts with `==` it would form `====`.
    // If a value ends with `==` it would form `====`.
    // These are typically handled by the parser not recognizing `====` as a mark.
    // The `before` and `after` in `containerPhrasing` given to `handleMark`
    // already signal that the content is wrapped by `=`.
  ],
  join: [joinMark],
}

/** @type {import('mdast-util-to-markdown').Join} */
function joinMark (left, right, parent, context) {
  // This function influences how adjacent 'mark' nodes or 'mark' nodes and other
  // phrasing content are joined during serialization.
  // Returning `true` allows default joining behavior (e.g., adding a space
  // between words, no space next to punctuation).
  // Specific rules could prevent joining (return `false`) or force line breaks.
  // For a simple 'mark' node, default behavior is usually sufficient.
  return true
}
