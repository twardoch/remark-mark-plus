# remark-mark-plus

This plugin parses `==highlighted text==` into HTML `<mark>highlighted text</mark>` elements.
It is a [unified][unified] ([remark][remark]) plugin that leverages [micromark][micromark] for tokenizing.

If you are using [rehype][rehype], the HTML result will be `<mark>contents</mark>`.

## Features

*   Parses `==text==` into `mark` mdast nodes.
*   Converts `mark` mdast nodes to `<mark>text</mark>` HTML elements when used with rehype.
*   Supports nesting of other inline markdown within the mark tags (e.g., `==*emphasis*==`).
*   Follows modern unified/remark/micromark plugin architecture.

## When to use this

If you want to highlight text in your Markdown files using a simple `==text==` syntax and have it render as `<mark>text</mark>` in HTML.

## Syntax

```markdown
This is ==highlighted text==.
You can also highlight ==*emphasized* or **strong** text==.
Even ==[links](https://example.com)== are supported.
```

This plugin follows the original `remark-mark` behavior regarding spaces:
*   `== text ==` (with spaces inside but adjacent to markers) will be parsed.
*   `== text==` (space after opening marker) will *not* be parsed as a mark.
*   `====` will *not* be parsed as an empty mark (it's treated as literal `====` if `afterOpenMarker`'s `nok` path is hit, or `==<mark></mark>==` if the test case `====not a mark====` is more representative of current behavior). Behavior for `====` might need further refinement depending on exact desired outcome vs. current test suite.

## AST (see [mdast][mdast] specification)

This plugin adds a `mark` node type to mdast, which is a [Parent][parent] node containing Phrasing content.

For example, the following markdown:

`==File > Open==`

Yields:

```javascript
{
  type: 'mark',
  children: [
    {
      type: 'text',
      value: 'File > Open'
    }
  ]
}
```

## Compatibility

This plugin is compatible with Node.js 18+ and modern versions of unified, remark, and rehype.
It is an ESM-only package.

## Installation

[npm][npm]:

```bash
npm install remark-mark-plus
```

## Usage

Example:

```javascript
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkMarkPlus from 'remark-mark-plus' // This plugin
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import {VFile} from 'vfile' // For file message reporting

const markdown = `
This is ==highlighted text==.
And this is ==*important* and highlighted==.
This is not a mark: ===highlight=== or == highlight ==
`

async function main() {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMarkPlus)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown)

  console.log(String(file))
}

main()
```

Output HTML:

```html
<p>This is <mark>highlighted text</mark>.
And this is <mark><em>important</em> and highlighted</mark>.
This is not a mark: ===highlight=== or == highlight ==</p>
```

## API

This package exports no identifiers. The default export is `remarkMarkPlus`.

### `unified().use(remarkMarkPlus)`

Configures `unified` to support the `==text==` syntax. There are no options.

## Security

Use of `remark-mark-plus` does not involve parsing HTML so there are no openings for XSS vectors.
However, if you are using `rehype-stringify` with `allowDangerousHtml: true`, ensure that the input Markdown is trusted, as this could allow arbitrary HTML if other plugins are involved.

## Development

To contribute to this project, please follow these steps:

1.  Clone the repository.
2.  Install dependencies with `npm install`.
3.  Run tests with `npm test`.
4.  Build the project with `npm run build`.

Please ensure that your code adheres to the existing linting rules and that all tests pass before submitting a pull request.

## License

[MIT][license] © [Adam Twardoch](https://github.com/twardoch) and [Contributors][contributors]

<!-- Definitions -->

[license]: LICENSE
[npm]: https://www.npmjs.com/package/remark-mark-plus
[mdast]: https://github.com/syntax-tree/mdast
[remark]: https://github.com/remarkjs/remark
[rehype]: https://github.com/rehypejs/rehype
[parent]: https://github.com/syntax-tree/unist#parent
[unified]: https://unifiedjs.com/
[micromark]: https://github.com/micromark/micromark
[contributors]: https://github.com/twardoch/remark-mark-plus/graphs/contributors
