# 🚀 Publishing Midnight Blueprint to VS Code Marketplace

## 📋 Complete Publishing Guide

### **Step 1: Prerequisites Setup**

1. **Create Publisher Account**
   - Visit https://marketplace.visualstudio.com/manage
   - Sign in with Microsoft account
   - Click "Create publisher" 
   - Use a unique publisher ID (e.g., "gagangoswami")

2. **Get Personal Access Token**
   - Go to https://dev.azure.com
   - Profile → Personal Access Tokens → New Token
   - Name: "VS Code Extensions"
   - Scope: **Marketplace (Manage)**
   - **Save the token securely!**

### **Step 2: Prepare for Publishing**

```bash
# Show the pre-publishing checklist
./publish.sh checklist

# Validate your package
./publish.sh validate
```

### **Step 3: Login to Marketplace**

```bash
# Login using your Personal Access Token
./publish.sh login
```

### **Step 4: Test Before Publishing**

```bash
# Package for local testing
./publish.sh package

# Install and test locally
code --install-extension midnight-blueprint-*.vsix
```

### **Step 5: Publish to Marketplace**

```bash
# Publish to marketplace
./publish.sh publish
```

## 🔧 **Manual Publishing Commands**

If you prefer manual commands:

```bash
# Install vsce (VS Code Extension Manager)
npm install -g vsce

# Login to marketplace
vsce login

# Publish extension
vsce publish
```

## 📦 **Version Management**

```bash
# Update patch version (1.0.0 → 1.0.1)
./publish.sh version patch

# Update minor version (1.0.0 → 1.1.0)
./publish.sh version minor

# Update major version (1.0.0 → 2.0.0)
./publish.sh version major

# Then publish the new version
./publish.sh publish
```

## 🎯 **Publishing Best Practices**

### **Before Publishing:**
- ✅ Test theme with multiple file types
- ✅ Verify all colors work in light/dark environments
- ✅ Check theme on different screen sizes
- ✅ Ensure README.md has good screenshots
- ✅ Test installation from .vsix file

### **Marketplace Optimization:**
- ✅ Good keywords in package.json
- ✅ Clear, descriptive description
- ✅ Professional README with screenshots
- ✅ Proper categories ("Themes")
- ✅ Repository link for community contributions

### **Post-Publishing:**
- ✅ Monitor reviews and feedback
- ✅ Respond to issues quickly
- ✅ Regular updates with improvements
- ✅ Engage with the community

## 📊 **Marketplace Analytics**

After publishing, you can:
- View download statistics
- Read user reviews
- Track popularity trends
- Monitor acquisition funnels

Access at: https://marketplace.visualstudio.com/manage

## 🔄 **Update Process**

To update your published theme:

1. Make changes to theme files
2. Update version: `./publish.sh version patch`
3. Test locally: `./publish.sh package`
4. Publish update: `./publish.sh publish`

## 🆘 **Troubleshooting**

**Common Issues:**

1. **"Publisher not found"**
   - Ensure publisher name in package.json matches your marketplace publisher ID

2. **"Authentication failed"**
   - Regenerate Personal Access Token
   - Ensure token has Marketplace (Manage) scope

3. **"Package validation failed"**
   - Check all required fields in package.json
   - Ensure theme file exists and is valid JSON

4. **"Extension already exists"**
   - Update version number in package.json
   - Use `./publish.sh version patch`

## 🎉 **Success Indicators**

Your theme is successfully published when:
- ✅ You receive confirmation email
- ✅ Theme appears in marketplace search
- ✅ Users can install via command palette
- ✅ Analytics show in publisher dashboard

## 📱 **Promotion Tips**

- Share on social media (#VSCode #Theme)
- Post in VS Code community forums
- Add to your GitHub profile
- Write blog post about design decisions
- Engage with theme communities

---

**Quick Start:**
```bash
./publish.sh checklist  # See requirements
./publish.sh login      # Login to marketplace  
./publish.sh publish    # Publish theme
```
