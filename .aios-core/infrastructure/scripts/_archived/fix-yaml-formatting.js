#!/usr/bin/env node
/**
 * Fix YAML Formatting - Story 6.1.2.5 QA Fix
 *
 * Fixes invalid YAML indentation in activation-instructions
 * by converting to pipe syntax for multi-line content.
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'agents');
const CLAUDE_AGENTS_DIR = path.join(__dirname, '..', '..', '.claude', 'commands', 'AIOS', 'agents');

const AGENTS = [
  'dev.md', 'qa.md', 'po.md', 'sm.md', 'pm.md',
  'architect.md', 'analyst.md', 'data-engineer.md',
  'devops.md', 'aios-master.md', 'ux-design-expert.md'
];

// New STEP 3 with proper YAML pipe syntax
const NEW_STEP_3 = `  - STEP 3: |
      Build intelligent greeting using .aios-core/scripts/greeting-builder.js
      The buildGreeting(agentDefinition, conversationHistory) method:
        - Detects session type (new/existing/workflow) via context analysis
        - Checks git configuration status (with 5min cache)
        - Loads project status automatically
        - Filters commands by visibility metadata (full/quick/key)
        - Suggests workflow next steps if in recurring pattern
        - Formats adaptive greeting automatically`;

function fixAgentFile(filePath) {
  console.log(`Processing: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Find and replace the problematic STEP 3
  const step3Pattern = /  - STEP 3: Build intelligent greeting using \.aios-core\/scripts\/greeting-builder\.js\n           Call buildGreeting\(agentDefinition, conversationHistory\) which:\n           - Detects session type \(new\/existing\/workflow\) via context analysis\n           - Checks git configuration status \(with 5min cache\)\n           - Loads project status automatically\n           - Filters commands by visibility metadata \(full\/quick\/key\)\n           - Suggests workflow next steps if in recurring pattern\n           - Formats adaptive greeting automatically/;

  if (step3Pattern.test(content)) {
    content = content.replace(step3Pattern, NEW_STEP_3);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Fixed: ${path.basename(filePath)}`);
    return true;
  } else {
    console.log(`  ⚠️  Pattern not found in: ${path.basename(filePath)}`);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing YAML Formatting in Agent Files\n');

  let fixedCount = 0;
  let errors = [];

  // Fix agents in .aios-core/agents/
  for (const agent of AGENTS) {
    const agentPath = path.join(AGENTS_DIR, agent);

    try {
      if (fs.existsSync(agentPath)) {
        if (fixAgentFile(agentPath)) {
          fixedCount++;
        }
      } else {
        errors.push(`File not found: ${agent}`);
      }
    } catch (error) {
      errors.push(`Error processing ${agent}: ${error.message}`);
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  Fixed: ${fixedCount}/${AGENTS.length} agents`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Errors:`);
    errors.forEach(err => console.log(`  - ${err}`));
  }

  console.log(`\n✅ YAML formatting fixes complete!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Sync to .claude/commands/AIOS/agents/`);
  console.log(`  2. Run unit tests`);
  console.log(`  3. Verify YAML parsing works`);
}

main();
