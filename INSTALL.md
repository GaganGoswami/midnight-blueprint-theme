# Midnight Blueprint Theme - Installation Guide

## 🚀 Quick Installation

### Method 1: Automated Setup (Recommended)
```bash
# Make the setup script executable (if not already done)
chmod +x setup.sh

# Run the complete setup
./setup.sh

# Or run specific commands
./setup.sh check    # Check dependencies
./setup.sh package  # Package the extension
./setup.sh install  # Install locally
```

### Method 2: Manual Installation

1. **Install VS Code Extension Manager (vsce)**
   ```bash
   npm install -g vsce
   ```

2. **Package the Extension**
   ```bash
   vsce package
   ```

3. **Install the Extension**
   ```bash
   code --install-extension midnight-blueprint-*.vsix
   ```

4. **Activate the Theme**
   - Open VS Code
   - Go to **File → Preferences → Color Theme** (macOS: **Code → Preferences → Color Theme**)
   - Select **"Midnight Blueprint"** from the list

### Method 3: Development Installation

1. **Copy to Extensions Directory**
   ```bash
   # macOS/Linux
   cp -r . ~/.vscode/extensions/midnight-blueprint-theme/
   
   # Windows
   xcopy . %USERPROFILE%\.vscode\extensions\midnight-blueprint-theme\ /E /I
   ```

2. **Restart VS Code** and select the theme

## 🎨 Testing the Theme

After installation, open the sample files to see the theme in action:

```bash
# Open all sample files
code samples/UserDashboard.tsx samples/data_processor.py samples/analytics.js samples/demo.html samples/styles.css

# Or use the setup script
./setup.sh samples
```

## 🛠️ Development Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **VS Code** with CLI access
- **npm** or **yarn**

### Development Commands
```bash
# Validate theme files
./setup.sh validate

# Package for distribution
./setup.sh package

# Install locally for testing
./setup.sh install

# Clean build artifacts
rm -f *.vsix
```

### VS Code Tasks
Use the built-in VS Code tasks (Cmd/Ctrl + Shift + P → "Tasks: Run Task"):
- **Package Extension**
- **Install Extension Locally**
- **Validate Theme**
- **Open Sample Files**
- **Clean Build Artifacts**

## 🎯 Recommended Settings

Add these settings to your VS Code `settings.json` for the best experience:

```json
{
  "editor.fontFamily": "'Fira Code', 'SF Mono', 'Cascadia Code', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6,
  "editor.semanticHighlighting.enabled": true,
  "workbench.colorTheme": "Midnight Blueprint",
  "workbench.iconTheme": "vs-seti"
}
```

## 🔧 Customization

### Modifying Colors
Edit `themes/midnight-blueprint-color-theme.json` to customize colors:

```json
{
  "colors": {
    "editor.background": "#1a1f2e",
    "editor.foreground": "#9db7d6"
  },
  "tokenColors": [
    {
      "scope": ["keyword"],
      "settings": {
        "foreground": "#c792ea"
      }
    }
  ]
}
```

### Adding New Language Support
Add token scopes for additional languages in the `tokenColors` array.

## 🐛 Troubleshooting

### Common Issues

**Theme doesn't appear in list:**
- Ensure VS Code CLI is available: `code --version`
- Reinstall the extension: `./setup.sh install`
- Restart VS Code completely

**Colors don't match screenshots:**
- Check if semantic highlighting is enabled
- Verify font settings (ligatures, family)
- Ensure latest VS Code version

**Extension packaging fails:**
- Install/update vsce: `npm install -g vsce`
- Check package.json validity
- Ensure all required files are present

### Debug Mode
Enable debug logging by modifying the theme file to include diagnostic information.

## 📦 Distribution

### Creating a Release
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `./setup.sh package`
4. Test the generated `.vsix` file
5. Publish to VS Code Marketplace (optional)

### Publishing to Marketplace
```bash
# Login to marketplace
vsce login <publisher>

# Publish
vsce publish
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with sample files
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by VS Code's "Dark Modern" theme
- Color palette influenced by GitHub Dark Dimmed
- Typography recommendations from the developer community
