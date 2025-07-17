import {micromark} from 'micromark'
import {markSyntax} from '../src/lib/micromark-syntax.js'

describe('micromark-syntax', () => {
  const processMarkdown = (markdown) => micromark(markdown, {
    extensions: [markSyntax],
  })

  it('should tokenize basic mark syntax', () => {
    const result = processMarkdown('==highlighted==')
    expect(result).toContain('highlighted')
  })

  it('should handle multiple marks in one line', () => {
    const result = processMarkdown('==first== and ==second==')
    expect(result).toContain('first')
    expect(result).toContain('second')
  })

  it('should handle marks with spaces', () => {
    const result = processMarkdown('==highlighted text==')
    expect(result).toContain('highlighted text')
  })

  it('should not process incomplete marks', () => {
    const result = processMarkdown('==incomplete')
    expect(result).toBe('<p>==incomplete</p>')
  })

  it('should handle escaped marks', () => {
    const result = processMarkdown('\\==not highlighted==')
    expect(result).toContain('==not highlighted==')
  })

  it('should handle marks at line boundaries', () => {
    const result = processMarkdown('==start\nof line==')
    expect(result).toContain('start')
    expect(result).toContain('of line')
  })

  it('should handle empty marks', () => {
    const result = processMarkdown('====')
    expect(result).toBe('<p>====</p>')
  })

  it('should handle marks with equals signs inside', () => {
    const result = processMarkdown('==a=b==')
    expect(result).toContain('a=b')
  })

  it('should handle nested-like syntax', () => {
    const result = processMarkdown('==outer ==inner== text==')
    expect(result).toContain('outer')
    expect(result).toContain('inner')
    expect(result).toContain('text')
  })

  it('should handle marks with various content', () => {
    const result = processMarkdown('==123 $@# special chars==')
    expect(result).toContain('123 $@# special chars')
  })
})
