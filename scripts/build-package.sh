#!/bin/bash

# Package build script for distribution
# This script builds the package ready for distribution

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Get package info
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")

echo_info "Building $PACKAGE_NAME@$PACKAGE_VERSION"

# Clean previous build
echo_step "Cleaning previous build..."
npm run clean

# Install dependencies
echo_step "Installing dependencies..."
npm ci

# Run quality checks
echo_step "Running lint checks..."
npm run lint

# Run tests
echo_step "Running tests..."
npm test

# Build the package
echo_step "Building package..."
npm run build

# Verify build output
echo_step "Verifying build output..."
if [ ! -d "dist" ] || [ ! -f "dist/index.js" ]; then
    echo_error "Build failed - missing output files"
    exit 1
fi

# Show build results
echo_info "Build output:"
ls -la dist/

# Package size info
echo_step "Checking package size..."
npm pack --dry-run | grep -E "^(npm notice|unpacked size|package size)"

echo_info "Package built successfully!"
echo_info "Ready for: npm publish"