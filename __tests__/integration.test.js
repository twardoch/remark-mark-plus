import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import plugin from '../src/index.js'

describe('integration tests', () => {
  describe('markdown pipeline', () => {
    it('should round-trip markdown correctly', () => {
      const processor = unified()
        .use(remarkParse)
        .use(plugin)
        .use(remarkStringify)

      const input = '==highlighted text=='
      const result = processor.processSync(input)
      expect(result.toString().trim()).toBe(input)
    })

    it('should handle complex markdown with marks', () => {
      const processor = unified()
        .use(remarkParse)
        .use(plugin)
        .use(remarkStringify)

      const input = '# Title\n\nThis is ==highlighted== text with **bold** and *italic*.'
      const result = processor.processSync(input)
      expect(result.toString()).toContain('==highlighted==')
      expect(result.toString()).toContain('**bold**')
      expect(result.toString()).toContain('*italic*')
    })

    it('should preserve mark syntax in lists', () => {
      const processor = unified()
        .use(remarkParse)
        .use(plugin)
        .use(remarkStringify)

      const input = '- Item with ==highlight==\n- Another item'
      const result = processor.processSync(input)
      expect(result.toString()).toContain('==highlight==')
    })

    it('should handle marks in blockquotes', () => {
      const processor = unified()
        .use(remarkParse)
        .use(plugin)
        .use(remarkStringify)

      const input = '> Quote with ==emphasis=='
      const result = processor.processSync(input)
      expect(result.toString()).toContain('==emphasis==')
    })
  })

  describe('html pipeline', () => {
    const createHtmlProcessor = () => unified()
      .use(remarkParse)
      .use(plugin)
      .use(remarkRehype, {
        handlers: {
          mark: (state, node) => ({
            type: 'element',
            tagName: 'mark',
            properties: {},
            children: state.all(node),
          }),
        },
      })
      .use(rehypeStringify)

    it('should convert marks to HTML mark elements', () => {
      const processor = createHtmlProcessor()
      const result = processor.processSync('==highlighted==')
      expect(result.toString()).toContain('<mark>highlighted</mark>')
    })

    it('should handle nested inline elements in marks', () => {
      const processor = createHtmlProcessor()
      const result = processor.processSync('==**bold** and *italic*==')
      expect(result.toString()).toContain('<mark>')
      // Currently marks only support text content, not nested inline elements
      expect(result.toString()).toContain('**bold** and *italic*')
      expect(result.toString()).toContain('</mark>')
    })

    it('should handle marks with code', () => {
      const processor = createHtmlProcessor()
      const result = processor.processSync('==code: `console.log()`==')
      expect(result.toString()).toContain('<mark>')
      // Currently marks only support text content
      expect(result.toString()).toContain('code: `console.log()`')
      expect(result.toString()).toContain('</mark>')
    })

    it('should handle marks with links', () => {
      const processor = createHtmlProcessor()
      const result = processor.processSync('==[link](https://example.com)==')
      expect(result.toString()).toContain('<mark>')
      // Currently marks only support text content
      expect(result.toString()).toContain('[link](https://example.com)')
      expect(result.toString()).toContain('</mark>')
    })

    it('should handle multiple marks in paragraph', () => {
      const processor = createHtmlProcessor()
      const result = processor.processSync('==first== and ==second==')
      expect(result.toString()).toContain('<mark>first</mark>')
      expect(result.toString()).toContain('<mark>second</mark>')
    })

    it('should handle marks in complex document structure', () => {
      const processor = createHtmlProcessor()
      const input = `
# Header

Paragraph with ==highlight== text.

- List item with ==emphasis==
- Another item

> Blockquote with ==marked text==
      `.trim()

      const result = processor.processSync(input)
      const html = result.toString()

      expect(html).toContain('<h1>Header</h1>')
      expect(html).toContain('<mark>highlight</mark>')
      expect(html).toContain('<mark>emphasis</mark>')
      expect(html).toContain('<mark>marked text</mark>')
    })
  })

  describe('error handling', () => {
    it('should handle malformed marks gracefully', () => {
      const processor = unified()
        .use(remarkParse)
        .use(plugin)
        .use(remarkStringify)

      const input = '==unclosed mark'
      const result = processor.processSync(input)
      expect(result.toString()).toContain('==unclosed mark')
    })

    it('should handle empty input', () => {
      const processor = unified()
        .use(remarkParse)
        .use(plugin)
        .use(remarkStringify)

      const result = processor.processSync('')
      expect(result.toString()).toBe('')
    })

    it('should handle input with only marks', () => {
      const processor = unified()
        .use(remarkParse)
        .use(plugin)
        .use(remarkStringify)

      const result = processor.processSync('==only mark==')
      expect(result.toString().trim()).toBe('==only mark==')
    })

    it('should handle consecutive marks', () => {
      const processor = unified()
        .use(remarkParse)
        .use(plugin)
        .use(remarkStringify)

      const result = processor.processSync('==first====second==')
      expect(result.toString()).toContain('==first==')
      expect(result.toString()).toContain('==second==')
    })
  })
})
