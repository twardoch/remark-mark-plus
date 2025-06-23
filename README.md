# remark-mark-plus

This plugin parses `==custom Markdown syntax==` to the HTML `<mark>` element.
It adds a new node type to the [mdast][mdast] produced by [remark][remark]: `mark`

If you are using [rehype][rehype], the stringified HTML result will be `<mark>`.

## Syntax

```markdown
Click ==File > Open== to open the file.
```

## AST (see [mdast][mdast] specification)

The `Mark` node ([`Parent`][parent]) represents highlighted text. It is a phrasing content node.

Its definition in TypeScript would be:
```typescript
import {Parent, PhrasingContent} from 'mdast'

export interface Mark extends Parent {
  type: 'mark'
  children: PhrasingContent[]
}

// To make it available in the mdast content model:
declare module 'mdast' {
  interface PhrasingContentMap {
    mark: Mark
  }
}
```

For example, the following markdown:

`==File > Open==`

Yields:

```javascript
{
  type: 'mark',
  children: [{
    type: 'text',
    value: 'File > Open'
  }]
}
```

## Rehype

This plugin is compatible with [rehype][rehype]. `Mark` mdast nodes will become `<mark>contents</mark>`.

## Installation

[npm][npm]:

```bash
npm install remark-mark-plus
```

## Usage

Dependencies:

```javascript
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkMarkPlus from 'remark-mark-plus' // or './path/to/src/index.js' if local
```

Usage:

```javascript
const processor = unified()
  .use(remarkParse)
  .use(remarkMarkPlus)
  .use(remarkRehype)
  .use(rehypeStringify)

const markdown = 'This is ==highlighted text==.'
const html = processor.processSync(markdown).toString()

console.log(html) // <p>This is <mark>highlighted text</mark>.</p>
```

A note on remark plugins:
This plugin is a modern ESM-only remark plugin. If you are using it in a CommonJS project, you might need to use dynamic `import()`.

## Internals & Extensibility

This plugin is built following the modern `unified` architecture and leverages `micromark` for tokenization and `mdast-util` for AST transformations. This ensures compatibility with the latest `remark` ecosystem.

### Using the Micromark extension

If you only need to parse the `==mark==` syntax at the token level (e.g., for syntax highlighting or other tools that work with `micromark`), you can use the Micromark extension directly:

```javascript
import {micromark} from 'micromark'
import {markSyntax, types as markTokenTypes} from 'remark-mark-plus/micromark-syntax' // Adjust path if using locally

const html = micromark('==text==', {
  extensions: [markSyntax()]
})

console.log(html) // Potentially just text if no HTML compiler, or tokens if configured
// To get HTML, you'd typically use fromMarkdown and toHast with the extension
```
(Note: The direct micromark to HTML output for custom extensions requires further setup, typically involving `fromMarkdown` and `toHast` with the extension's handlers if you want an HTML string directly from `micromark` for this custom syntax. The primary use of `micromark` extensions is within the `remark`/`unified` pipeline.)


## License

[MIT][license] © [Zeste de Savoir][zds]

<!-- Definitions -->

[license]: https://github.com/twardoch/remark-mark-plus/blob/master//LICENSE

[npm]: https://www.npmjs.com/package/remark-mark-plus

[mdast]: https://github.com/syntax-tree/mdast/blob/master/readme.md

[remark]: https://github.com/remarkjs/remark

[rehype]: https://github.com/rehypejs/rehype

[parent]: https://github.com/syntax-tree/unist#parent
