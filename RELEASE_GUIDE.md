# Release Guide

This guide explains how to create releases for remark-mark-plus using the git-tag-based semversioning system.

## Prerequisites

- You must have write access to the repository
- Your working directory must be clean (no uncommitted changes)
- All tests must pass
- You must be on the main/master branch

## Local Release Process

### 1. Using the Release Script (Recommended)

The easiest way to create a release is using the provided script:

```bash
npm run local:release
```

This script will:
- Check that your working directory is clean
- Prompt you to select a release type (patch, minor, major, or custom)
- Run the full CI pipeline (lint, test, build)
- Create a git tag with the new version
- Push the tag to the remote repository

### 2. Manual Release Process

If you prefer to do it manually:

```bash
# Run the full test suite
npm run test:all

# Choose the appropriate version bump
npm run release:patch    # For bug fixes (1.0.0 -> 1.0.1)
npm run release:minor    # For new features (1.0.0 -> 1.1.0)
npm run release:major    # For breaking changes (1.0.0 -> 2.0.0)

# Or set a custom version
npm version 1.2.3
```

## What Happens After Creating a Tag

When you push a tag (format: `v*`), the following automated processes are triggered:

### 1. Release Workflow
- Runs comprehensive tests on the tagged version
- Creates a GitHub release with release notes
- Uploads the npm package tarball as a release asset

### 2. Package Workflow
- Builds the package for multiple platforms and Node.js versions
- Creates platform-specific packages
- Uploads all packages as release assets

### 3. NPM Publishing
- Automatically publishes the package to npm registry
- Requires the `NPM_TOKEN` secret to be configured

## Release Types

### Patch Release (1.0.0 -> 1.0.1)
- Bug fixes
- Documentation updates
- Performance improvements
- No breaking changes

### Minor Release (1.0.0 -> 1.1.0)
- New features
- Backward-compatible changes
- New APIs that don't break existing code

### Major Release (1.0.0 -> 2.0.0)
- Breaking changes
- Removal of deprecated features
- Changes that require users to update their code

## Repository Setup for Releases

### Required Secrets

The following secrets must be configured in your GitHub repository:

1. **NPM_TOKEN**: Your npm authentication token for publishing packages
   - Go to GitHub Settings → Secrets and variables → Actions
   - Add a new secret named `NPM_TOKEN`
   - Get the token from npm: `npm login` then `npm token create`

### Branch Protection

It's recommended to set up branch protection rules:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date before merging

## Testing Before Release

### Full Test Suite
```bash
npm run test:all
```

### Build Verification
```bash
npm run build:package
```

### Performance Check
```bash
npm run benchmark
```

## Troubleshooting

### "Working directory is not clean"
- Commit or stash all changes before creating a release
- Check `git status` to see what needs to be committed

### "Tests are failing"
- Fix all failing tests before releasing
- Run `npm test` to see specific failures

### "Build failed"
- Check that all source files are valid
- Run `npm run build` to see build errors

### "Cannot push to remote"
- Ensure you have write access to the repository
- Check that your git remote is configured correctly

## Best Practices

1. **Always test thoroughly** before releasing
2. **Update CHANGELOG.md** with release notes
3. **Use semantic versioning** correctly
4. **Test the release locally** before pushing
5. **Monitor the release process** in GitHub Actions
6. **Verify the npm package** after publishing

## Emergency Procedures

### Unpublishing a Release
```bash
npm unpublish remark-mark-plus@VERSION --force
```

### Deleting a Git Tag
```bash
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

### Rolling Back a Release
1. Delete the problematic tag
2. Fix the issues
3. Create a new patch release

## Questions?

If you encounter any issues with the release process, please:
1. Check the GitHub Actions logs
2. Review this guide
3. Open an issue in the repository
4. Contact the maintainers

---

*This guide was automatically generated as part of the git-tag-based semversioning setup.*