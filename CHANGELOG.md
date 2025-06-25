# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Refined `package.json` by removing duplicate contributors.
- Corrected a broken license link in `README.md`.
- Removed unused variables and clarified comments in `src/lib/micromark-syntax.js` and `src/lib/mdast-util-handlers.js`.
- Updated test setup in `__tests__/index.js` to correctly access VFile content and add a HAST handler for `mark` nodes during testing.

### Added
- New test case in `__tests__/index.js` for inputs like `==a=b==`.

### Fixed
- ESLint configuration issues that prevented tests from running initially.
- **Empty Marks Bug:** Corrected the `micromark-syntax.js` tokenizer to properly emit text content within `==mark==` syntax. Previously, `mark` mdast nodes did not capture their child text content, leading to empty `<mark></mark>` tags in HTML and `====` in Markdown serialization. The tokenizer now emits `chunkString` tokens for the content, allowing `mdast-util-from-markdown` to correctly populate the `mark` nodes with text children.

### Changed
- Refactored the tokenizer in `micromark-syntax.js` to use `effects.attempt` for handling potential closing sequences. This was intended to fix issues with parsing marks containing internal equals signs (e.g., `==a=b==`).

### Known Issues (Tests Failing)
- **Tokenizer Bug - Appended Closing Delimiters:** After refactoring the tokenizer to use `effects.attempt` for closing sequences, a new issue has appeared: the closing `==` delimiters are being incorrectly appended to the content of the mark (e.g., `==text==` results in content `text==`). This affects all mark parsing. The original issue with inputs like `==a=b==` not being parsed as marks is resolved by the refactor in terms of content identification, but this new appended delimiter bug masks it.
