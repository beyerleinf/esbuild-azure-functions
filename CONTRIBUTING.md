# How to contribute

Nice to see you here and I'm glad you took an interest in contributing to this project. All kinds of contributions are welcome, including:

- Reporting bugs
- Fixing bugs
- Proposing new features

## Reporting Bugs

Found a bug? Awesome! You can [file an issue here](https://github.com/beyerleinf/esbuild-azure-functions/issues/new?assignees=beyerleinf&labels=bug&template=bug_report.md&title=%5BBug%5D+%3Cinsert+title%3E). A great bug report typically contains:

- A quick summary of what you tried to achieve
- Steps to reproduce
  - Please be specific and include code samples if you can
- What you expected to happen
- What actually happens
- Notes (maybe you have hints on what causes the issue or other things you tried that didn't help)

Even though as a developer, bugs can be annoying, the more detail is in your bug report, the more I will love reading it 😉

But **please** make sure that this hasn't already been reported!

## Proposing a new Feature

You have an idea for a new feature or improvement? I'd love to hear it! Please [file an issue here](https://github.com/beyerleinf/esbuild-azure-functions/issues/new?assignees=beyerleinf&labels=feature&template=feature_request.md&title=%5BFeature%5D+%3Cinsert+title%3E). A great feature request usually contains:

- A description on what you want to achieve or solve with the feature
- How it should work

But **please** make sure that this hasn't already been requested!

## Contributing code

You want to fix a bug? Thank you 🙏 Here's how to get started.

### Getting started on development

There are only a couple of commands you need to use:

1. `npm run lint` to lint the code using ESLint
2. `npm run test` to run tests with Mocha
3. `npm run compile` to build the project with TypeScript

These packages are important to know about:

- [TypeScript](https://www.npmjs.com/package/typescript)
- [Commander](https://www.npmjs.com/package/commander) (for the CLI)
- [Zod](https://www.npmjs.com/package/zod) (for config validation)
- [Mocha](https://www.npmjs.com/package/mocha) and [Sinon](https://www.npmjs.com/package/sinon) (for unit testing)

### Submitting your changes

We use [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow), so everything happens trough Pull Requests (PRs).

- Fork the repo and create your branch from `main`
- If you've added code that needs test, please also add tests
- Ensure the CI pipeline passes (including build, test and lint)
- Open the PR 😊

## License

By contributing, you agree that your contributions will be licensed under its [MIT License](https://github.com/beyerleinf/esbuild-azure-functions/blob/main/LICENSE).
