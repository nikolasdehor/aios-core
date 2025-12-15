# Migration Guide: v4.31.0 → v1.0.0

## Overview

AIOS-FULLSTACK v1.0.0 introduces significant improvements to cross-platform support and user experience. This guide helps you migrate from v4.31.x to v1.0.0.

**Key Changes:**
- ✅ Modern interactive CLI with @clack/prompts
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ Production-ready CI/CD pipeline
- ✅ Improved dependencies (execa, fs-extra, picocolors)
- ✅ Enhanced help system with commander framework

---

## Breaking Changes

### 1. Node.js Version Requirement

**v4.31.0**: Node.js >=14.0.0
**v1.0.0**: Node.js >=18.0.0 (v20+ recommended)

**Action Required:**
```bash
# Check your Node.js version
node --version

# If < 18.0.0, upgrade Node.js
# Download from: https://nodejs.org
```

### 2. New Dependencies

v1.0.0 introduces modern, lightweight dependencies:

**New Dependencies:**
- `execa@^9.0.0` - Cross-platform process execution (replaces child_process)
- `fs-extra@^11.0.0` - Enhanced file operations
- `picocolors@^1.0.0` - Terminal colors (replaces chalk, 6x smaller)
- `@clack/prompts@^0.7.0` - Modern interactive prompts (replaces inquirer + ora)
- `commander@^12.0.0` - CLI framework for help system

**Removed Dependencies:**
- `chalk` - Replaced by picocolors
- `inquirer` - Replaced by @clack/prompts
- `ora` - Replaced by @clack/prompts spinners

**Action Required:**

If you have a local installation:
```bash
# Update dependencies
npm install

# Or for clean install
rm -rf node_modules package-lock.json
npm install
```

For NPX users (recommended):
```bash
# No action needed - dependencies managed automatically
npx aios-fullstack@latest install
```

### 3. Interactive Installer Changes

The installation wizard now uses modern @clack/prompts instead of inquirer:

**Before (v4.31.0):**
```
? Project name: my-project
? Install dependencies? Yes
```

**After (v1.0.0):**
```
🚀 AIOS-FULLSTACK Installation

◆ What is your project name?
│  my-project
│
◇ Choose components to install:
│  ● Core Framework (Required)
│  ● Agent System (Required)
│  ○ Expansion Packs (optional)
│  ○ Example Projects (optional)
│
◇ Select package manager:
│  ○ npm
│  ● yarn
│  ○ pnpm
│
✔ Installation completed successfully!
```

**What Changed:**
- Modern visual prompts with icons
- Multi-select component selection
- Package manager choice (npm/yarn/pnpm)
- Real-time validation feedback
- Progress spinners for long operations
- Graceful cancellation support (Ctrl+C or ESC)
- Installation duration tracking

**Action Required:**
None - the new UX is fully backward compatible.

### 4. CLI Command Updates

**New Commands:**
```bash
# Display version
aios-fullstack --version

# Show comprehensive help
aios-fullstack --help

# Dry-run installation (test without modifying files)
aios-fullstack install --dry-run
```

**Enhanced Commands:**
```bash
# Doctor command with auto-fix
aios-fullstack doctor --fix

# Install with quiet mode
aios-fullstack install --quiet
```

**Action Required:**
Update any scripts that use old command formats. All existing commands remain functional.

---

## New Features

### 1. Cross-Platform Support

v1.0.0 is tested across multiple platforms:

**CI/CD Matrix:**
- **Operating Systems**: Ubuntu, Windows, macOS
- **Node.js Versions**: 18.x, 20.x, 22.x
- **Total Configurations**: 9 (3 OS × 3 Node versions)

**What This Means:**
- Guaranteed compatibility across platforms
- Automatic CI testing on every release
- Platform-specific edge cases handled

### 2. Modern CLI UX

**Improvements:**
- ✅ Colored output (errors, warnings, success messages)
- ✅ Progress indicators for long operations
- ✅ Input validation with immediate feedback
- ✅ Multi-select interfaces
- ✅ Graceful cancellation (Ctrl+C/ESC)
- ✅ Installation summaries
- ✅ Duration tracking

### 3. Help System

**New Help System:**
```bash
# General help
aios-fullstack --help

# Command-specific help
aios-fullstack install --help
aios-fullstack doctor --help
```

**Output Example:**
```
Usage: aios-fullstack [options] [command]

AIOS-FULLSTACK: AI-Orchestrated System for Full Stack Development

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  init <project-name>          Create new AIOS project
  install [options]            Install AIOS in current directory
  info                         Display system information
  doctor [options]             Run system diagnostics
  help [command]               display help for command
```

### 4. Improved Error Messages

**Before:**
```
Error: Installation failed
```

**After:**
```
✖ Installation failed

Error Details:
- Missing required dependency: Node.js >=18.0.0
- Current version: v16.14.0

Suggested Actions:
1. Upgrade Node.js to v18+ or v20+ (recommended)
2. Download from: https://nodejs.org
3. Re-run: npx aios-fullstack install
```

---

## Migration Steps

### For NPX Users (Recommended)

```bash
# Simply use latest version
npx aios-fullstack@latest install

# The installer will:
# ✅ Detect existing installation
# ✅ Update only changed files
# ✅ Preserve your custom configurations
# ✅ Create .bak backups for safety
```

### For Local Installations

```bash
# 1. Check Node.js version
node --version  # Should be >=18.0.0

# 2. Update repository
git pull origin main

# 3. Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# 4. Run installer
npm run install:aios

# 5. Verify installation
aios-fullstack doctor
```

### For Contributors/Developers

```bash
# 1. Update Node.js if needed (>=18.0.0)

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies
npm install

# 4. Run tests
npm test

# 5. Verify cross-platform tests
npm test -- test/cross-platform.test.js
```

---

## Testing Your Migration

### 1. Verify Node.js Version

```bash
node --version
# Should output: v18.x.x or higher
```

### 2. Test CLI Commands

```bash
# Version check
aios-fullstack --version

# Help system
aios-fullstack --help

# System diagnostics
aios-fullstack doctor

# Dry-run installation
aios-fullstack install --dry-run
```

### 3. Test Interactive Installer

```bash
# Run installer in test mode
aios-fullstack install --dry-run

# Should show:
# - Modern @clack/prompts interface
# - Component selection
# - Package manager choice
# - Progress indicators
```

### 4. Run Cross-Platform Tests

```bash
# Run test suite
npm test

# Run cross-platform specific tests
npm test -- test/cross-platform.test.js

# Expected: All 24 tests passing
```

---

## Troubleshooting

### Issue: "Node.js version too old"

**Solution:**
```bash
# Upgrade Node.js to v18+ or v20+
# Download from: https://nodejs.org

# Verify upgrade
node --version
```

### Issue: "Module not found: execa"

**Solution:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Interactive prompts not working"

**Possible Causes:**
- Terminal doesn't support interactive input
- Running in non-TTY environment (CI/CD)

**Solution:**
```bash
# Use quiet mode
aios-fullstack install --quiet

# Or force mode
aios-fullstack install --force
```

### Issue: "Colors not displaying"

**Solution:**
```bash
# Enable color support
export FORCE_COLOR=1  # Unix/Linux/macOS
set FORCE_COLOR=1     # Windows

# Or use NO_COLOR to disable
export NO_COLOR=1
```

### Issue: "Tests failing on Windows"

**Common Causes:**
- Path separator differences (/ vs \)
- Line ending differences (LF vs CRLF)

**Solution:**
```bash
# Windows users: ensure Git autocrlf is configured
git config core.autocrlf true

# Re-clone repository
git clone https://github.com/allfluenceinc/aios-fullstack.git
cd aios-fullstack
npm install
npm test
```

---

## Rollback Instructions

If you need to rollback to v4.31.0:

### For NPX Users

```bash
# Use specific version
npx aios-fullstack@4.31.0 install
```

### For Local Installations

```bash
# 1. Checkout v4.31.0 tag
git checkout v4.31.0

# 2. Clean install
rm -rf node_modules package-lock.json
npm install

# 3. Verify version
aios-fullstack --version
```

---

## What's Next

After migrating to v1.0.0:

1. **Explore Modern UX**: Try the new interactive installer
2. **Run System Diagnostics**: `aios-fullstack doctor`
3. **Read Updated Docs**: Check README for new features
4. **Join Community**: Share feedback on [Discord](https://discord.gg/gk8jAdXWmj)

---

## Support

Need help with migration?

- 💬 [Community Discord](https://discord.gg/gk8jAdXWmj)
- 🐛 [Report Issues](https://github.com/allfluenceinc/aios-fullstack/issues)
- 📖 [Documentation](https://github.com/allfluenceinc/aios-fullstack)

---

## Summary

**Key Takeaways:**
- ✅ Upgrade Node.js to v18+ (v20+ recommended)
- ✅ Dependencies automatically managed (NPX users)
- ✅ Backward compatible (existing installations work)
- ✅ Modern UX with @clack/prompts
- ✅ Cross-platform tested (Windows, macOS, Linux)
- ✅ Production-ready CI/CD pipeline

**Migration Difficulty**: 🟢 Easy (for NPX users) | 🟡 Moderate (for local installations)

**Estimated Time**: 5-10 minutes

---

*Last Updated: 2025-01-25*
*Version: v1.0.0*
