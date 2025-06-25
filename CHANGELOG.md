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

### Known Issues (Tests Failing)
- **Empty Marks Bug:** Highlighted content is lost (e.g., `==text==` results in an empty mark). `mark` mdast nodes do not appear to capture their child text content. This leads to empty `<mark></mark>` tags in HTML (when a HAST handler is provided) and `====` in Markdown serialization.
- **Tokenizer Bug for Complex Inputs:** Inputs like `==a=b==` are not parsed as marks but are treated as literal text, due to a logic flaw in the `micromark-syntax.js` tokenizer's handling of closing sequences.
