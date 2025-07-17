#!/bin/bash

# Local release script for remark-mark-plus
# This script helps with local development and testing of the release process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo_error "Not in a git repository"
    exit 1
fi

# Check if working directory is clean
if [[ $(git status --porcelain) ]]; then
    echo_error "Working directory is not clean. Please commit or stash changes first."
    git status --short
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo_info "Current version: $CURRENT_VERSION"

# Ask for release type
echo ""
echo "Select release type:"
echo "1) patch (bug fixes)"
echo "2) minor (new features)"
echo "3) major (breaking changes)"
echo "4) custom version"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        RELEASE_TYPE="patch"
        ;;
    2)
        RELEASE_TYPE="minor"
        ;;
    3)
        RELEASE_TYPE="major"
        ;;
    4)
        read -p "Enter custom version: " CUSTOM_VERSION
        RELEASE_TYPE="custom"
        ;;
    *)
        echo_error "Invalid choice"
        exit 1
        ;;
esac

# Confirm release
echo ""
if [[ $RELEASE_TYPE == "custom" ]]; then
    echo_info "About to release version: $CUSTOM_VERSION"
else
    echo_info "About to release $RELEASE_TYPE version"
fi
read -p "Continue? [y/N]: " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo_info "Release cancelled"
    exit 0
fi

# Run the full CI pipeline
echo_info "Running full CI pipeline..."
npm run ci

# Create release
echo_info "Creating release..."
if [[ $RELEASE_TYPE == "custom" ]]; then
    npm version $CUSTOM_VERSION
else
    npm version $RELEASE_TYPE
fi

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo_info "Released version: $NEW_VERSION"

# Show what happened
echo ""
echo_info "Release completed successfully!"
echo_info "- Version bumped from $CURRENT_VERSION to $NEW_VERSION"
echo_info "- Git tag v$NEW_VERSION created"
echo_info "- Changes pushed to remote"
echo ""
echo_warn "To publish to npm, run: npm publish"