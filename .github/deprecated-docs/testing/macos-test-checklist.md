# macOS Testing Checklist for AIOS-FULLSTACK

## Pre-Installation Testing

- [ ] Node.js v20+ is installed
- [ ] npm is available in PATH
- [ ] GitHub CLI can be installed via Homebrew
- [ ] GitHub CLI can be installed via MacPorts
- [ ] GitHub CLI can be installed via direct download

## Installation Testing

### Basic Installation
- [ ] `npx github:Pedrovaleriolopez/aios-fullstack install` works on macOS
- [ ] Installer correctly detects macOS platform
- [ ] Installation completes without permission errors
- [ ] `.aios-core` directory is created with correct permissions

### IDE Configuration
- [ ] Cursor configuration is created at `.cursor/rules/`
- [ ] Claude configuration is created at `.claude/commands/AIOS/`
- [ ] Windsurf configuration is created at `.windsurf/rules/`
- [ ] IDE shortcuts work correctly (Cmd+L for Cursor)

### Path Handling
- [ ] Tilde expansion works (`~/Documents` expands correctly)
- [ ] Spaces in paths are handled properly
- [ ] Case-sensitive filesystem compatibility
- [ ] Relative paths resolve correctly

## Platform Detection Testing

Run the test script:
```bash
node tools/test/test-macos-compatibility.js
```

Expected results:
- [ ] Platform detection returns true for macOS
- [ ] OS name returns "macOS"
- [ ] Home directory expansion works
- [ ] App data paths are correct
- [ ] IDE paths point to correct locations
- [ ] Script extension is `.sh`
- [ ] Null device is `/dev/null`

## GitHub CLI Testing

- [ ] `gh --version` works after installation
- [ ] `gh auth login` works with web browser
- [ ] `gh auth login` works with token
- [ ] Organization access can be verified
- [ ] Repository operations work correctly

## Permission Testing

### Standard User Permissions
- [ ] Installation works in user home directory
- [ ] Installation works in Documents folder
- [ ] No sudo required for normal installation

### System Directory Testing
- [ ] Installer detects system directories
- [ ] Appropriate permission instructions are shown
- [ ] Error messages include macOS-specific fix commands

## Update Testing

- [ ] Re-running installer detects existing installation
- [ ] Updates preserve custom configurations
- [ ] Backup files are created (`.bak`)
- [ ] No duplicate files are created

## Shell Script Testing

- [ ] Setup scripts have Unix line endings (LF)
- [ ] Scripts are executable without manual chmod
- [ ] Scripts work in both bash and zsh
- [ ] Path variables are quoted properly

## IDE Integration Testing

### Cursor
- [ ] Agent commands work with `@agent-name`
- [ ] Rules are loaded from correct directory
- [ ] Keyboard shortcuts work (Cmd+L)

### Claude Code
- [ ] Slash commands work with `/agent-name`
- [ ] Commands are loaded from correct directory
- [ ] CLAUDE.md is automatically loaded

### Windsurf
- [ ] Agent commands work with `@agent-name`
- [ ] Rules are loaded from correct directory

## Error Handling Testing

- [ ] Permission errors show macOS-specific instructions
- [ ] Path not found errors are clear
- [ ] Network errors during installation are handled
- [ ] Partial installation can be resumed

## Performance Testing

- [ ] Installation completes in reasonable time
- [ ] Large file operations work correctly
- [ ] Memory usage is reasonable
- [ ] No hanging processes

## Compatibility Testing

### macOS Versions
- [ ] macOS 10.15 (Catalina)
- [ ] macOS 11 (Big Sur)
- [ ] macOS 12 (Monterey)
- [ ] macOS 13 (Ventura)
- [ ] macOS 14 (Sonoma)

### Hardware
- [ ] Intel Macs
- [ ] Apple Silicon (M1/M2/M3)
- [ ] Low memory systems (4GB)
- [ ] High memory systems (16GB+)

## Documentation Testing

- [ ] macOS installation guide is accurate
- [ ] Troubleshooting steps work
- [ ] Examples use correct syntax
- [ ] Platform-specific notes are clear

## Regression Testing

- [ ] Windows functionality still works
- [ ] Linux functionality still works
- [ ] Cross-platform features work on all OS
- [ ] No platform-specific code breaks others

## Sign-off

- [ ] All critical tests pass
- [ ] Documentation is updated
- [ ] Known issues are documented
- [ ] Ready for release

**Tested by:** _________________
**Date:** _________________
**macOS Version:** _________________
**Hardware:** _________________