#!/usr/bin/env node
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

console.log('🔍 Verifying YAML Fix\n');

const AGENTS = [
  'dev.md', 'qa.md', 'po.md', 'sm.md', 'pm.md',
  'architect.md', 'analyst.md', 'data-engineer.md',
  'devops.md', 'aios-master.md', 'ux-design-expert.md'
];

let passCount = 0;
let failCount = 0;

for (const agentFile of AGENTS) {
  const agentPath = path.join(__dirname, '..', 'agents', agentFile);
  const content = fs.readFileSync(agentPath, 'utf8');
  const yamlMatch = content.match(/```yaml([\s\S]*?)```/);

  try {
    const agent = yaml.load(yamlMatch[1]);
    const step3 = agent['activation-instructions'][2];

    // STEP 3 should now be an object with "STEP 3" key containing multi-line string
    if (typeof step3 === 'object' && step3['STEP 3']) {
      console.log(`✅ ${agentFile.padEnd(25)} - YAML valid, pipe syntax working`);
      passCount++;
    } else if (typeof step3 === 'string' && step3.includes('Build intelligent greeting')) {
      console.log(`✅ ${agentFile.padEnd(25)} - YAML valid`);
      passCount++;
    } else {
      console.log(`⚠️  ${agentFile.padEnd(25)} - Unexpected format: ${typeof step3}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ ${agentFile.padEnd(25)} - Parse error: ${error.message.substring(0, 50)}`);
    failCount++;
  }
}

console.log(`\n📊 Results: ${passCount}/${AGENTS.length} agents valid`);

if (failCount === 0) {
  console.log('✅ All agents have valid YAML!');
  process.exit(0);
} else {
  console.log(`❌ ${failCount} agents have issues`);
  process.exit(1);
}
