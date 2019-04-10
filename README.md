# remark-kbd-plus [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status]

This plugin parses custom Markdown syntax to the "mark" HTML element.
It adds a new node type to the [mdast][mdast] produced by [remark][remark]: `kbd`

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
npm install remark-mark
```

## Usage

Dependencies:

```javascript
const unified = require('unified')
const remarkParse = require('remark-parse')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')

const remarkKbd = require('remark-kbd-plus')
```

Usage:

```javascript
unified()
  .use(remarkParse)
  .use(remarkKbd)
  .use(remark2rehype)
  .use(stringify)
```

## License

[MIT][license] © [Zeste de Savoir][zds]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/zestedesavoir/zmarkdown.svg

[build-status]: https://travis-ci.org/zestedesavoir/zmarkdown

[coverage-badge]: https://img.shields.io/coveralls/zestedesavoir/zmarkdown.svg

[coverage-status]: https://coveralls.io/github/zestedesavoir/zmarkdown

[license]: https://github.com/zestedesavoir/zmarkdown/blob/master/packages/remark-kbd-plus/LICENSE-MIT

[zds]: https://zestedesavoir.com

[npm]: https://www.npmjs.com/package/remark-kbd-plus

[mdast]: https://github.com/syntax-tree/mdast/blob/master/readme.md

[remark]: https://github.com/remarkjs/remark

[rehype]: https://github.com/rehypejs/rehype

[parent]: https://github.com/syntax-tree/unist#parent
