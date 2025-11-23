/**
 * Environment Configuration Module
 * Story 1.6: Environment Configuration
 *
 * Handles .env and core-config.yaml generation with interactive prompts
 *
 * @module configure-environment
 */

/* eslint-disable no-console */
// Console statements are intentional for user feedback during installation

const fs = require('fs-extra');
const path = require('path');
const { confirm, password } = require('@clack/prompts');
const { generateEnvContent, generateEnvExample } = require('./templates/env-template');
const { generateCoreConfig } = require('./templates/core-config-template');
const {
  validateEnvFormat,
  validateApiKeyFormat,
  validateYamlSyntax,
  validateCoreConfigStructure,
  sanitizeInput
} = require('./validation/config-validator');

/**
 * Configure environment files (.env and core-config.yaml)
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.targetDir] - Target directory (default: process.cwd())
 * @param {string} [options.projectType] - Project type from Story 1.3
 * @param {Array<string>} [options.selectedIDEs] - Selected IDEs from Story 1.4
 * @param {Array<Object>} [options.mcpServers] - MCP servers from Story 1.5
 * @param {boolean} [options.skipPrompts] - Skip interactive prompts (for testing)
 * @returns {Promise<Object>} Configuration result
 */
async function configureEnvironment(options = {}) {
  const {
    targetDir = process.cwd(),
    projectType = 'GREENFIELD',
    selectedIDEs = [],
    mcpServers = [],
    skipPrompts = false
  } = options;

  const results = {
    envCreated: false,
    envExampleCreated: false,
    coreConfigCreated: false,
    gitignoreUpdated: false,
    errors: []
  };

  try {
    // Step 1: Check for existing .env and offer backup
    const envPath = path.join(targetDir, '.env');
    const envExists = await fs.pathExists(envPath);

    if (envExists && !skipPrompts) {
      const shouldBackup = await confirm({
        message: 'Found existing .env file. Create backup before overwriting?',
        initialValue: true
      });

      if (shouldBackup) {
        const backupPath = path.join(targetDir, `.env.backup.${Date.now()}`);
        await fs.copy(envPath, backupPath);
        console.log(`✅ Backup created: ${backupPath}`);
      }
    }

    // Step 2: Collect API keys interactively (if not skipping prompts)
    let apiKeys = {};

    if (!skipPrompts) {
      console.log('\n📝 API Key Configuration (all optional - press Enter to skip)');
      console.log('You can configure these later in the .env file\n');

      apiKeys = await collectApiKeys();
    }

    // Step 3: Generate and write .env file
    const envContent = generateEnvContent(apiKeys);

    // Validate .env format
    const envValidation = validateEnvFormat(envContent);
    if (!envValidation.valid) {
      results.errors.push(...envValidation.errors);
      throw new Error('Generated .env file has invalid format');
    }

    await fs.writeFile(envPath, envContent, { encoding: 'utf8' });
    results.envCreated = true;

    // Set file permissions (0600 on Unix systems)
    if (process.platform !== 'win32') {
      await fs.chmod(envPath, 0o600);
    }

    console.log('✅ Created .env file');

    // Step 4: Generate and write .env.example
    const envExamplePath = path.join(targetDir, '.env.example');
    const envExampleContent = generateEnvExample();
    await fs.writeFile(envExamplePath, envExampleContent, { encoding: 'utf8' });
    results.envExampleCreated = true;
    console.log('✅ Created .env.example file');

    // Step 5: Update .gitignore
    await updateGitignore(targetDir);
    results.gitignoreUpdated = true;
    console.log('✅ Updated .gitignore');

    // Step 6: Generate and write core-config.yaml
    const coreConfigDir = path.join(targetDir, '.aios-core');
    await fs.ensureDir(coreConfigDir);

    const coreConfigContent = generateCoreConfig({
      projectType,
      selectedIDEs,
      mcpServers,
      aiosVersion: '2.1.0'
    });

    // Validate YAML syntax
    const yamlValidation = validateYamlSyntax(coreConfigContent);
    if (!yamlValidation.valid) {
      results.errors.push(yamlValidation.error);
      throw new Error('Generated core-config.yaml has invalid YAML syntax');
    }

    // Validate core config structure
    const structureValidation = validateCoreConfigStructure(yamlValidation.parsed);
    if (!structureValidation.valid) {
      results.errors.push(...structureValidation.errors);
      throw new Error('Generated core-config.yaml has invalid structure');
    }

    const coreConfigPath = path.join(coreConfigDir, 'core-config.yaml');
    await fs.writeFile(coreConfigPath, coreConfigContent, { encoding: 'utf8' });
    results.coreConfigCreated = true;
    console.log('✅ Created .aios-core/core-config.yaml');

    return results;
  } catch (error) {
    results.errors.push(error.message);
    throw error;
  }
}

/**
 * Collect API keys via interactive prompts
 *
 * @returns {Promise<Object>} API keys object
 */
async function collectApiKeys() {
  const keys = {};

  // OpenAI API Key
  const openaiKey = await password({
    message: 'OpenAI API Key (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized, 'openai');
      return validation.valid ? undefined : validation.error;
    }
  });

  if (openaiKey && typeof openaiKey === 'string') {
    keys.openai = sanitizeInput(openaiKey);
    console.log('✓ OpenAI API key configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  // Anthropic API Key
  const anthropicKey = await password({
    message: 'Anthropic API Key (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized, 'anthropic');
      return validation.valid ? undefined : validation.error;
    }
  });

  if (anthropicKey && typeof anthropicKey === 'string') {
    keys.anthropic = sanitizeInput(anthropicKey);
    console.log('✓ Anthropic API key configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  // ClickUp API Key (optional service)
  const clickupKey = await password({
    message: 'ClickUp API Key (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized);
      return validation.valid ? undefined : validation.error;
    }
  });

  if (clickupKey && typeof clickupKey === 'string') {
    keys.clickup = sanitizeInput(clickupKey);
    console.log('✓ ClickUp API key configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  // GitHub Token (optional service)
  const githubToken = await password({
    message: 'GitHub Personal Access Token (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized, 'github');
      return validation.valid ? undefined : validation.error;
    }
  });

  if (githubToken && typeof githubToken === 'string') {
    keys.github = sanitizeInput(githubToken);
    console.log('✓ GitHub token configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  // Exa API Key (for web search)
  const exaKey = await password({
    message: 'Exa API Key (optional):',
    validate: (value) => {
      if (!value) return; // Empty is ok (skip)
      const sanitized = sanitizeInput(value);
      const validation = validateApiKeyFormat(sanitized);
      return validation.valid ? undefined : validation.error;
    }
  });

  if (exaKey && typeof exaKey === 'string') {
    keys.exa = sanitizeInput(exaKey);
    console.log('✓ Exa API key configured');
  } else {
    console.log('⊘ Skipped - configure later in .env');
  }

  return keys;
}

/**
 * Update .gitignore to include .env
 *
 * @param {string} targetDir - Target directory
 * @returns {Promise<void>}
 */
async function updateGitignore(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');
  let gitignoreContent = '';

  // Read existing .gitignore if it exists
  if (await fs.pathExists(gitignorePath)) {
    gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
  }

  // Check if .env is already in .gitignore
  const lines = gitignoreContent.split('\n');
  const hasEnv = lines.some(line => line.trim() === '.env' || line.trim() === '/.env');

  if (!hasEnv) {
    // Add .env to .gitignore
    const newContent = gitignoreContent.trim()
      ? `${gitignoreContent.trim()}\n\n# Environment variables (AIOS)\n.env\n`
      : `# Environment variables (AIOS)\n.env\n`;

    await fs.writeFile(gitignorePath, newContent, { encoding: 'utf8' });
  }
}

module.exports = {
  configureEnvironment,
  collectApiKeys,
  updateGitignore
};
