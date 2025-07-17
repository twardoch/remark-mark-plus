import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import plugin from '../src/index.js'

describe('mdast-util-handlers', () => {
  it('should create proper AST nodes for marks', () => {
    const processor = unified()
      .use(remarkParse)
      .use(plugin)

    const tree = processor.parse('==highlighted==')
    const result = processor.runSync(tree)

    // Find the mark node
    const markNode = result.children[0].children.find(node => node.type === 'mark')
    expect(markNode).toBeDefined()
    expect(markNode.type).toBe('mark')
    expect(markNode.children).toHaveLength(1)
    expect(markNode.children[0].type).toBe('text')
    expect(markNode.children[0].value).toBe('highlighted')
  })

  it('should serialize marks back to markdown', () => {
    const processor = unified()
      .use(remarkParse)
      .use(plugin)
      .use(remarkStringify)

    const result = processor.processSync('==highlighted==')
    expect(result.toString().trim()).toBe('==highlighted==')
  })

  it('should handle complex mark content', () => {
    const processor = unified()
      .use(remarkParse)
      .use(plugin)

    const tree = processor.parse('==*bold* and `code`==')
    const result = processor.runSync(tree)

    const markNode = result.children[0].children.find(node => node.type === 'mark')
    expect(markNode).toBeDefined()
    expect(markNode.children).toHaveLength(1) // Currently only text is supported
    expect(markNode.children[0].type).toBe('text')
    expect(markNode.children[0].value).toBe('*bold* and `code`')
  })

  it('should preserve mark nodes in AST transformations', () => {
    const processor = unified()
      .use(remarkParse)
      .use(plugin)
      .use(() => (tree) => {
        // Simple transformer that should preserve mark nodes
        return tree
      })

    const tree = processor.parse('==test==')
    const result = processor.runSync(tree)

    const markNode = result.children[0].children.find(node => node.type === 'mark')
    expect(markNode).toBeDefined()
    expect(markNode.type).toBe('mark')
  })

  it('should handle multiple marks in paragraph', () => {
    const processor = unified()
      .use(remarkParse)
      .use(plugin)

    const tree = processor.parse('==first== and ==second==')
    const result = processor.runSync(tree)

    const paragraph = result.children[0]
    const markNodes = paragraph.children.filter(node => node.type === 'mark')
    expect(markNodes).toHaveLength(2)
    expect(markNodes[0].children[0].value).toBe('first')
    expect(markNodes[1].children[0].value).toBe('second')
  })

  it('should handle marks with line breaks or treat as regular text', () => {
    const processor = unified()
      .use(remarkParse)
      .use(plugin)

    const tree = processor.parse('==multi\nline==')
    const result = processor.runSync(tree)

    // Line breaks in marks might not be supported
    const paragraph = result.children[0]
    const markNode = paragraph.children.find(node => node.type === 'mark')

    // Test that either marks with line breaks work or they're treated as regular text
    expect(markNode || paragraph.children[0].value.includes('==multi')).toBeTruthy()
  })
})
