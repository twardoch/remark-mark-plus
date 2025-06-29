# remark-mark-plus

`remark-mark-plus` is a [remark](https://github.com/remarkjs/remark) plugin that extends Markdown syntax to support highlighted text using `==text==` notation. This syntax is then transformed into HTML `<mark>` elements, commonly used to draw attention to specific portions of text.

This plugin seamlessly integrates into the [unified](https://unifiedjs.com/) ecosystem, leveraging [micromark](https://github.com/micromark/micromark) for efficient tokenization and [mdast](https://github.com/syntax-tree/mdast) for abstract syntax tree (AST) representation.

## Table of Contents

*   [Who is this for?](#who-is-this-for)
*   [Why is it useful?](#why-is-it-useful)
*   [Installation](#installation)
*   [How to Use](#how-to-use)
    *   [Programmatic Usage](#programmatic-usage)
    *   [Usage with `remark-cli`](#usage-with-remark-cli)
*   [Technical Deep Dive](#technical-deep-dive)
    *   [How It Works](#how-it-works)
    *   [AST (Abstract Syntax Tree) Structure](#ast-abstract-syntax-tree-structure)
    *   [Rehype Compatibility](#rehype-compatibility)
*   [Contributing](#contributing)
*   [License](#license)

## Who is this for?

This plugin is designed for:

*   Developers and content creators working with Markdown in Node.js environments.
*   Users of the `unified` collective, including `remark` for Markdown processing and `rehype` for HTML transformation.
*   Projects involving static site generation, documentation systems, or any application where rich text emphasis beyond standard Markdown (bold, italic) is needed.

## Why is it useful?

*   **Enhanced Semantics:** Provides a clear, GFM-like syntax (`==highlight==`) to semantically mark text for emphasis or highlighting.
*   **Standard HTML Output:** Converts the custom syntax to standard HTML `<mark>` tags, ensuring broad browser compatibility and accessibility.
*   **Ecosystem Compatible:** Built for the modern `unified` and `remark` ecosystem, ensuring compatibility and extensibility.
*   **Customizable Processing:** Fits into flexible `unified` pipelines, allowing combination with many other text processing plugins.

## Installation

Install `remark-mark-plus` using npm:

```bash
npm install remark-mark-plus
```

This package is an [ESM-only module](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). In CommonJS projects, you may need to use dynamic `import()`.

## How to Use

`remark-mark-plus` is used within a `unified` processing pipeline.

### Programmatic Usage

Here's a typical example of how to use `remark-mark-plus` to convert Markdown containing `==highlighted text==` into HTML:

```javascript
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkMarkPlus from 'remark-mark-plus' // Ensure this path is correct if local
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const markdownInput = `
This is some ==important highlighted text==.
You can also ==highlight text with ==nested markers== inside==.
And ==multiple highlights== in one paragraph.
`
// Note: While the syntax allows nested `==...==` like the example above,
// standard GFM-style markdowns usually don't support true nesting of the same marker.
// This plugin will parse it based on its rules, potentially leading to <mark>text with <mark>nested</mark> inside</mark>.
// Users should be mindful of this if aiming for strict GFM compatibility or specific rendering behaviors.

async function processMarkdown(markdown) {
  const file = await unified()
    .use(remarkParse)        // Parse the Markdown into an mdast tree
    .use(remarkMarkPlus)     // Apply the highlight syntax
    .use(remarkRehype)       // Convert mdast to hast (HTML AST)
    .use(rehypeStringify)    // Convert hast to an HTML string
    .process(markdown)
  return String(file)
}

processMarkdown(markdownInput).then(htmlOutput => {
  console.log(htmlOutput);
  /*
  Example Output:
  <p>This is some <mark>important highlighted text</mark>.
  You can also <mark>highlight text with <mark>nested markers</mark> inside</mark>.
  And <mark>multiple highlights</mark> in one paragraph.</p>
  */
})
```

### Usage with `remark-cli`

While `remark-mark-plus` is primarily used programmatically, `remark-cli` can be configured to use plugins. You would typically do this by:

1.  Ensuring `remark-cli` and `remark-mark-plus` are project dependencies.
2.  Creating a `.remarkrc.js` (or `.remarkrc.mjs` for ESM) configuration file in your project.

Example `.remarkrc.mjs`:

```javascript
import remarkMarkPlus from 'remark-mark-plus';

export default {
  plugins: [
    remarkMarkPlus,
    // other remark plugins
  ]
};
```

Then, you could use `remark-cli` to process files:

```bash
npx remark input.md --output
```

**Note:** `remark-cli` itself primarily processes and outputs Markdown. To get HTML output as shown in the programmatic example, your `remark` pipeline (configured via `.remarkrc.mjs` or programmatically) would need to include `remark-rehype` and a stringifier like `rehype-stringify`. The CLI command above would apply `remark-mark-plus` (and any other remark plugins) and then output the processed Markdown. For direct HTML output via CLI, you might use `remark-cli` in conjunction with other tools or a custom script that builds the full `unified` pipeline.

## Technical Deep Dive

### How It Works

`remark-mark-plus` operates as a plugin within the [unified](https://unifiedjs.com/) processing ecosystem. It extends [remark](https://github.com/remarkjs/remark) to understand and process `==highlighted text==` syntax.

The process involves several key stages:

1.  **Micromark Extension (`src/lib/micromark-syntax.js`)**:
    *   At the core, `remark-mark-plus` provides a [micromark](https://github.com/micromark/micromark) syntax extension. Micromark is the low-level parser that converts Markdown text into a stream of tokens.
    *   The extension defines how to recognize the `==` markers.
        *   It looks for an opening `==` sequence that is not followed by a space or another `=` (to avoid `===` being misinterpreted).
        *   It then tokenizes the content between the opening and a closing `==` sequence.
    *   The key token types generated by `micromark-syntax.js` are:
        *   `markSequence`: Represents the `==` opening and closing markers.
        *   `markText`: Represents the content within the `==...==` markers.
        *   `mark`: A wrapping token for the entire `==highlighted text==` construct.
    *   The tokenizer (`tokenizeMark` function) manages states to correctly parse opening sequences, content, and potential closing sequences, ensuring that markers are balanced and correctly scoped. It handles cases like unterminated marks or marks at line endings.

2.  **MDAST Utility Handlers (`src/lib/mdast-util-handlers.js`)**:
    *   Once micromark has tokenized the input, these handlers bridge the gap to the [mdast (Markdown Abstract Syntax Tree)](https://github.com/syntax-tree/mdast) representation.
    *   **`markFromMarkdown`**: This handler is used during the "fromMarkdown" phase (parsing Markdown to mdast).
        *   It listens for the `mark` token from the micromark extension.
        *   When an opening `markSequence` token is encountered, it starts building a new `mark` node in the mdast.
        *   The content (`markText`) is processed as phrasing content and becomes the children of this `mark` node.
        *   Upon encountering the closing `markSequence`, the `mark` node is finalized.
    *   **`markToMarkdown`**: This handler is used during the "toMarkdown" phase (serializing mdast back to Markdown).
        *   It defines how an mdast `mark` node should be converted back into its text representation.
        *   It prepends `==` to the serialized content of the `mark` node's children and appends `==`.
        *   It includes logic for safe serialization, considering characters that might be unsafe at the beginning or end of the highlighted content.

### AST (Abstract Syntax Tree) Structure

The plugin introduces a new `Mark` node type to the mdast.

Its definition in TypeScript (for illustrative purposes, as this is a JS project) would be:
```typescript
import {Parent, PhrasingContent} from 'mdast'

export interface Mark extends Parent {
  type: 'mark'
  children: PhrasingContent[]
}

// To make it available in the mdast content model for TypeScript users:
declare module 'mdast' {
  interface PhrasingContentMap {
    mark: Mark
  }
}
```

For example, the Markdown `This is ==highlighted==.` would yield an mdast structure (simplified) like:
```javascript
{
  type: 'paragraph',
  children: [
    { type: 'text', value: 'This is ' },
    {
      type: 'mark',
      children: [
        { type: 'text', value: 'highlighted' }
      ]
    },
    { type: 'text', value: '.' }
  ]
}
```

### Rehype Compatibility

When used with [`remark-rehype`](https://github.com/remarkjs/remark-rehype), the `mark` mdast nodes are transformed into `hast` (HTML Abstract Syntax Tree) elements. `remark-rehype` will convert `mark` nodes to HTML `<mark>` elements, which can then be stringified to HTML using [`rehype-stringify`](https://github.com/rehypejs/rehype-stringify).

## Contributing

We welcome contributions to `remark-mark-plus`! Whether it's reporting a bug, suggesting an enhancement, or submitting a pull request, your help is valued. Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for full details. Here's a summary:

*   **Getting Started**:
    1.  Fork the repository on GitHub.
    2.  Clone your fork: `git clone https://github.com/YOUR_USERNAME/remark-mark-plus.git`
    3.  Navigate to the project directory: `cd remark-mark-plus`
    4.  Install dependencies: `npm install` (this also runs `npm run build` via the `prepare` script).
    5.  To build manually: `npm run build`

*   **Development Process**:
    *   Create your feature branch from `main`.
    *   **Write Tests**: If you add new functionality or fix a bug, please add corresponding tests in the `__tests__` directory. Tests are run using Jest: `npm test`.
    *   **Lint Your Code**: This project uses ESLint for code style. Ensure your code adheres to the linting rules by running `npm run pretest`. Many editors can be configured to show ESLint errors and auto-fix them.
    *   **Update Documentation**: If you change APIs or add features, update this README.md and any other relevant documentation.
    *   **Commit Messages**: Consider adhering to conventional commit message standards.

*   **Pull Requests**:
    *   Ensure all tests pass (`npm test`).
    *   Ensure your code lints (`npm run pretest`).
    *   Push your branch to your fork and submit a pull request to the main `remark-mark-plus` repository.
    *   Provide a clear description of your changes in the pull request.

*   **Reporting Bugs & Suggesting Enhancements**:
    *   Use the [GitHub Issues](https://github.com/twardoch/remark-mark-plus/issues) page.
    *   For bugs, provide a clear title, description, relevant information, and a reproducible code sample or test case.
    *   For enhancements, clearly describe the proposed feature and its benefits.

This project is an ESM-only module. Please ensure your contributions are compatible with this module type.

## License

[MIT](LICENSE) © [Zeste de Savoir](https://zestedesavoir.com/) and contributors.
