#!/bin/bash

# Midnight Blueprint Theme - Installation & Development Script
# Run this script to install dependencies and set up the theme for development

set -e

echo "🌙 Midnight Blueprint Theme Setup"
echo "================================="

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if VS Code is installed
check_vscode() {
    if command -v code &> /dev/null; then
        print_success "VS Code CLI is available"
        return 0
    else
        print_error "VS Code CLI not found. Please install VS Code and ensure 'code' command is available."
        return 1
    fi
}

# Check if vsce (VS Code Extension Manager) is installed
check_vsce() {
    if command -v vsce &> /dev/null; then
        print_success "vsce is available"
        return 0
    else
        print_warning "vsce not found. Installing via npm..."
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

# Validate theme files
validate_theme() {
    print_status "Validating theme files..."
    
    # Check if main theme file exists
    if [[ -f "themes/midnight-blueprint-color-theme.json" ]]; then
        print_success "Theme file found"
    else
        print_error "Theme file not found"
        return 1
    fi
    
    # Check if package.json exists and is valid
    if [[ -f "package.json" ]]; then
        if command -v node &> /dev/null; then
            if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"; then
                print_success "package.json is valid"
            else
                print_error "package.json is invalid"
                return 1
            fi
        else
            print_warning "Node.js not available, skipping package.json validation"
        fi
    else
        print_error "package.json not found"
        return 1
    fi
    
    return 0
}

# Package the extension
package_extension() {
    print_status "Packaging extension..."
    
    if vsce package; then
        print_success "Extension packaged successfully"
        return 0
    else
        print_error "Failed to package extension"
        return 1
    fi
}

# Install extension locally
install_extension() {
    print_status "Installing extension locally..."
    
    # Find the generated .vsix file
    VSIX_FILE=$(ls *.vsix 2>/dev/null | head -n 1)
    
    if [[ -z "$VSIX_FILE" ]]; then
        print_error "No .vsix file found. Please run package step first."
        return 1
    fi
    
    if code --install-extension "$VSIX_FILE"; then
        print_success "Extension installed successfully"
        print_status "You can now select 'Midnight Blueprint' from VS Code's theme selector"
        return 0
    else
        print_error "Failed to install extension"
        return 1
    fi
}

# Open sample files for testing
open_samples() {
    print_status "Opening sample files for theme testing..."
    
    SAMPLE_FILES=(
        "samples/UserDashboard.tsx"
        "samples/data_processor.py"
        "samples/analytics.js"
        "samples/demo.html"
        "samples/styles.css"
    )
    
    # Check if sample files exist
    for file in "${SAMPLE_FILES[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_warning "Sample file not found: $file"
        fi
    done
    
    # Open existing sample files
    EXISTING_FILES=()
    for file in "${SAMPLE_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            EXISTING_FILES+=("$file")
        fi
    done
    
    if [[ ${#EXISTING_FILES[@]} -gt 0 ]]; then
        code "${EXISTING_FILES[@]}"
        print_success "Opened ${#EXISTING_FILES[@]} sample files"
    else
        print_warning "No sample files found to open"
    fi
}

# Show usage information
show_usage() {
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  check     - Check system dependencies"
    echo "  validate  - Validate theme files"
    echo "  package   - Package the extension"
    echo "  install   - Install the extension locally"
    echo "  samples   - Open sample files for testing"
    echo "  full      - Run complete setup (default)"
    echo "  help      - Show this help message"
    echo ""
}

# Main execution logic
main() {
    local command=${1:-full}
    
    case $command in
        "check")
            print_status "Checking system dependencies..."
            check_vscode && check_vsce
            ;;
        "validate")
            validate_theme
            ;;
        "package")
            package_extension
            ;;
        "install")
            install_extension
            ;;
        "samples")
            open_samples
            ;;
        "full")
            print_status "Running complete setup..."
            if check_vscode && check_vsce && validate_theme; then
                if package_extension && install_extension; then
                    open_samples
                    echo ""
                    print_success "🎉 Setup complete! Your Midnight Blueprint theme is ready to use."
                    print_status "Go to VS Code → Preferences → Color Theme and select 'Midnight Blueprint'"
                else
                    print_error "Setup failed during packaging or installation"
                    exit 1
                fi
            else
                print_error "Setup failed during dependency check or validation"
                exit 1
            fi
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

# Run main function with all arguments
main "$@"
