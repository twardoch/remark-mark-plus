# Contributing to remark-mark-plus

First off, thank you for considering contributing to `remark-mark-plus`! Your help is appreciated.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/twardoch/remark-mark-plus/issues).

If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/twardoch/remark-mark-plus/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample or an executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for an enhancement, feel free to open an issue to discuss it. Please provide a clear description of the enhancement and why it would be beneficial.

### Pull Requests

1.  Fork the repo and create your branch from `main` (or the most recent development branch).
2.  If you've added code that should be tested, add tests.
3.  If you've changed APIs, update the documentation.
4.  Ensure the test suite passes (`npm test`).
5.  Make sure your code lints (`npm run pretest` or ensure ESLint passes).
6.  Issue that pull request!

## Development Setup

To get started with development:

1.  Clone the repository:
    ```bash
    git clone https://github.com/twardoch/remark-mark-plus.git
    cd remark-mark-plus
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  The `prepare` script (which runs on `npm install`) will automatically build the project. To build manually:
    ```bash
    npm run build
    ```
4.  Run tests:
    ```bash
    npm test
    ```
5.  Lint code:
    ```bash
    npm run pretest
    ```
    (This is automatically run before tests too)

## Code Style

This project uses ESLint to enforce code style. Please ensure your contributions adhere to the linting rules. You can check your code by running `npm run pretest`. Many issues can be automatically fixed by your editor's ESLint integration or by running ESLint with the `--fix` option where appropriate.

We appreciate your contributions!
