#!/bin/bash

# Comprehensive test script for local development
# This script runs all quality checks and tests

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

# Function to run a command and capture its exit code
run_check() {
    local name="$1"
    local command="$2"
    
    echo_step "Running $name..."
    
    if eval "$command"; then
        echo_info "$name: PASSED"
        return 0
    else
        echo_error "$name: FAILED"
        return 1
    fi
}

# Script start
echo_info "Starting comprehensive test suite..."
echo_info "Working directory: $(pwd)"
echo_info "Node version: $(node --version)"
echo_info "npm version: $(npm --version)"

# Initialize counters
total_checks=0
passed_checks=0
failed_checks=0

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo_warn "Dependencies not found. Installing..."
    npm install
fi

# Run lint check
total_checks=$((total_checks + 1))
if run_check "Lint" "npm run lint"; then
    passed_checks=$((passed_checks + 1))
else
    failed_checks=$((failed_checks + 1))
fi

# Run tests
total_checks=$((total_checks + 1))
if run_check "Tests" "npm test"; then
    passed_checks=$((passed_checks + 1))
else
    failed_checks=$((failed_checks + 1))
fi

# Run build
total_checks=$((total_checks + 1))
if run_check "Build" "npm run build"; then
    passed_checks=$((passed_checks + 1))
else
    failed_checks=$((failed_checks + 1))
fi

# Check if build artifacts exist
total_checks=$((total_checks + 1))
if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    echo_info "Build artifacts: PASSED"
    passed_checks=$((passed_checks + 1))
else
    echo_error "Build artifacts: FAILED"
    failed_checks=$((failed_checks + 1))
fi

# Run package validation
total_checks=$((total_checks + 1))
if run_check "Package validation" "npm pack --dry-run"; then
    passed_checks=$((passed_checks + 1))
else
    failed_checks=$((failed_checks + 1))
fi

# Summary
echo ""
echo "================================"
echo_info "Test Summary"
echo "================================"
echo_info "Total checks: $total_checks"
echo_info "Passed: $passed_checks"
echo_info "Failed: $failed_checks"

if [ $failed_checks -eq 0 ]; then
    echo_info "All checks passed! ✅"
    exit 0
else
    echo_error "Some checks failed! ❌"
    exit 1
fi