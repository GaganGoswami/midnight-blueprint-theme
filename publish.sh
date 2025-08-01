#!/bin/bash

# Midnight Blueprint Theme - Publishing Script
# Run this script to publish the theme to VS Code Marketplace

set -e

echo "🚀 Midnight Blueprint Theme Publishing"
echo "====================================="

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if vsce is installed
check_vsce() {
    if command -v vsce &> /dev/null; then
        print_success "vsce is available"
        return 0
    else
        print_error "vsce not found. Installing via npm..."
        if command -v npm &> /dev/null; then
            npm install -g vsce
            print_success "vsce installed successfully"
            return 0
        else
            print_error "npm not found. Please install Node.js and npm first."
            return 1
        fi
    fi
}

# Login to marketplace
login_marketplace() {
    print_status "Logging into VS Code Marketplace..."
    print_warning "You'll need your Personal Access Token from Azure DevOps"
    print_status "Get your token from: https://dev.azure.com → Personal Access Tokens"
    
    # Extract publisher name from package.json
    local publisher=$(grep '"publisher"' package.json | sed 's/.*"publisher": *"\([^"]*\)".*/\1/')
    
    if [[ -z "$publisher" ]]; then
        print_error "Publisher not found in package.json"
        return 1
    fi
    
    print_status "Using publisher: $publisher"
    
    if vsce login "$publisher"; then
        print_success "Successfully logged into marketplace as $publisher"
        return 0
    else
        print_error "Failed to login to marketplace"
        return 1
    fi
}

# Validate package before publishing
validate_package() {
    print_status "Validating package for publishing..."
    
    # Check required fields
    if ! grep -q '"publisher"' package.json; then
        print_error "Publisher field is required in package.json"
        return 1
    fi
    
    if ! grep -q '"version"' package.json; then
        print_error "Version field is required in package.json"
        return 1
    fi
    
    if ! grep -q '"description"' package.json; then
        print_error "Description field is required in package.json"
        return 1
    fi
    
    print_success "Package validation passed"
    return 0
}

# Package and publish
publish_extension() {
    print_status "Publishing extension to marketplace..."
    
    if vsce publish; then
        print_success "🎉 Extension published successfully!"
        print_status "It may take a few minutes to appear in the marketplace"
        return 0
    else
        print_error "Failed to publish extension"
        return 1
    fi
}

# Package only (for testing)
package_only() {
    print_status "Packaging extension for testing..."
    
    if vsce package; then
        VSIX_FILE=$(ls *.vsix 2>/dev/null | head -n 1)
        print_success "Extension packaged: $VSIX_FILE"
        print_status "You can test install with: code --install-extension $VSIX_FILE"
        return 0
    else
        print_error "Failed to package extension"
        return 1
    fi
}

# Show publishing checklist
show_checklist() {
    echo ""
    echo "📋 Pre-Publishing Checklist:"
    echo "=============================="
    echo "✅ Create publisher account at: https://marketplace.visualstudio.com/manage"
    echo "✅ Create Personal Access Token at: https://dev.azure.com"
    echo "✅ Update package.json with your publisher name"
    echo "✅ Test your theme locally"
    echo "✅ Create GitHub repository (recommended)"
    echo "✅ Add README.md with screenshots (recommended)"
    echo "✅ Add LICENSE file"
    echo ""
    echo "🚀 Publishing Commands:"
    echo "======================"
    echo "$0 login     - Login to marketplace"
    echo "$0 validate  - Validate package"
    echo "$0 package   - Package for testing"
    echo "$0 publish   - Publish to marketplace"
    echo "$0 checklist - Show this checklist"
    echo ""
}

# Update version
update_version() {
    local version_type=${1:-patch}
    
    print_status "Updating version ($version_type)..."
    
    if command -v npm &> /dev/null; then
        npm version $version_type --no-git-tag-version
        print_success "Version updated"
        grep '"version"' package.json
    else
        print_error "npm not found. Please update version manually in package.json"
        return 1
    fi
}

# Show usage
show_usage() {
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  login         - Login to VS Code Marketplace"
    echo "  validate      - Validate package for publishing"
    echo "  package       - Package extension (for testing)"
    echo "  publish       - Publish to marketplace"
    echo "  version TYPE  - Update version (patch|minor|major)"
    echo "  checklist     - Show pre-publishing checklist"
    echo "  help          - Show this help"
    echo ""
}

# Main execution
main() {
    local command=${1:-checklist}
    
    case $command in
        "login")
            check_vsce && login_marketplace
            ;;
        "validate")
            validate_package
            ;;
        "package")
            check_vsce && validate_package && package_only
            ;;
        "publish")
            if check_vsce && validate_package; then
                print_warning "This will publish your extension to the VS Code Marketplace!"
                print_status "Make sure you've tested it thoroughly."
                read -p "Continue? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    publish_extension
                else
                    print_status "Publishing cancelled"
                fi
            fi
            ;;
        "version")
            update_version $2
            ;;
        "checklist")
            show_checklist
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
