# remark-mark-plus

This plugin parses `==custom Markdown syntax==` to the HTML `<mark>` element.
It adds a new node type to the [mdast][mdast] produced by [remark][remark]: `mark`

If you are using [rehype][rehype], the stringified HTML result will be `<mark>`.

## Syntax

```markdown
Click ==File > Open== to open the file.
```

## AST (see [mdast][mdast] specification)

`Mark` ([`Parent`][parent]) represents a reference to a user.

```javascript
interface Mark <: Parent {
  type: "mark";
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
const unified = require('unified')
const remarkParse = require('remark-parse')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')

const remarkMark = require('remark-mark-plus')
```

Usage:

```javascript
unified()
  .use(remarkParse)
  .use(remarkMark)
  .use(remark2rehype)
  .use(stringify)
```

## License

[MIT][license] © [Zeste de Savoir][zds]

<!-- Definitions -->

[license]: https://github.com/twardoch/remark-mark-plus/blob/master//LICENSE

[npm]: https://www.npmjs.com/package/remark-mark-plus

[mdast]: https://github.com/syntax-tree/mdast/blob/master/readme.md

[remark]: https://github.com/remarkjs/remark

[rehype]: https://github.com/rehypejs/rehype

[parent]: https://github.com/syntax-tree/unist#parent
