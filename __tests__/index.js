import dedent from 'dedent'
import {unified} from 'unified'
import reParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import rehypeStringify from 'rehype-stringify'
import remark2rehype from 'remark-rehype'

import plugin from '../src/index.js'
// import {h} from 'hastscript' // Not used


const render = text => unified()
  .use(reParse, {
    footnotes: true,
  })
  .use(plugin)
  .use(remark2rehype, {
    handlers: {
      mark: (state, node) => {
        // In mdast-util-to-hast, 'state' is 'h', and 'node' is 'node'.
        // The handler signature is (h, node, parent)
        // For remark-rehype, it might pass state differently or wrap it.
        // Let's use a common signature found in examples: (h, node)
        // where h is the hastscript hyperscript function.
        // remark-rehype passes state (which has `all` method) and node.
        // The actual HAST creator `h` is often bound or accessible via `state.h`.
        // However, many examples use `hastscript`'s `h` directly.
        // For remark-rehype, the `state` object is the `MdastHastTransformer` instance.
        // `state.all(node)` processes children.
        return {
          type: 'element',
          tagName: 'mark',
          properties: {},
          children: state.all(node),
        }
      },
    },
  })
  .use(rehypeStringify)
  .processSync(text)

const fixture = dedent`
  Blabla ==ok== kxcvj ==ok foo== sdff

  sdf ==== df

  sfdgs | | dfg == dgsg | qs

  With two equals signs: \==key== you'll get ==key==.

  It can contain inline markdown:

  * ==hell[~~o~~](#he)?==

  It cannot contain blocks:

  * ==hello: [[secret]]?==
`


describe('parses mark', () => {
  it('parses a big fixture', () => {
    const contents = render(fixture).value
    expect(contents).toMatchSnapshot()
  })

  it('escapes the start marker', () => {
    const contents = render(dedent`
      ==one== \==escaped== ==three== \===four=== ==five==
    `).value
    expect(contents).toContain('==escaped==') // This means \==escaped== should render as literal ==escaped==
    expect(contents).toContain('=<mark>four</mark>') // This means \===four=== should render as literal = followed by <mark>four</mark>
  })

  it('handles internal equals signs correctly (==a=b==)', () => {
    const text = '==a=b=='
    const contents = render(text).value
    expect(contents).toBe('<p><mark>a=b</mark></p>')

    const markdownContents = unified()
      .use(reParse)
      .use(remarkStringify)
      .use(plugin)
      .processSync(text)
      .toString()
    expect(markdownContents).toBe('==a=b==')
  })
})

test('to markdown', () => {
  const contents = unified()
    .use(reParse)
    .use(remarkStringify)
    .use(plugin)
    .processSync(fixture)
    .toString()

  expect(contents).toMatchSnapshot()
})
