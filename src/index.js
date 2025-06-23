// src/index.js
import {markSyntax} from './lib/micromark-syntax.js'
import {markFromMarkdown, markToMarkdown} from './lib/mdast-util-handlers.js'

/**
 * @typedef {import('unified').Processor} Processor
 */

/**
 * Plugin to support GFM-like mark ==highlighted text==.
 *
 * @this {Processor}
 * @param {void | Options | undefined} [options={}]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkMarkPlus (options = {}) {
  const data = this.data()

  function add (field, value) {
    const list = /** @type {unknown[]} */ (data[field] || (data[field] = []))
    list.push(value)
  }

  // Add the micromark extension for parsing "=="
  add('micromarkExtensions', markSyntax())

  // Add the mdast utility for converting from markdown AST (tokens) to mdast (nodes)
  add('fromMarkdownExtensions', markFromMarkdown)

  // Add the mdast utility for converting from mdast (nodes) to markdown AST (tokens)
  add('toMarkdownExtensions', markToMarkdown)
}

// For TypeScript, you might want to declare the new node type:
//
// import {Parent} from 'unist'
//
// export interface Mark extends Parent {
//   type: 'mark'
//   children: PhrasingContent[]
// }
//
// declare module 'mdast' {
//   interface PhrasingContentMap {
//     mark: Mark
//   }
// }
//
// This helps TypeScript understand the new 'mark' node type.
// Since this is a .js project, this is just a comment.
