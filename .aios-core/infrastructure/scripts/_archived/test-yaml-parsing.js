#!/usr/bin/env node
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const agentPath = path.join(__dirname, '..', 'agents', 'po.md');
const content = fs.readFileSync(agentPath, 'utf8');
const yamlMatch = content.match(/```yaml([\s\S]*?)```/);

if (yamlMatch) {
  try {
    const agent = yaml.load(yamlMatch[1]);
    console.log('✅ YAML parsed successfully!');
    console.log('Agent:', agent.agent.name);
    console.log('STEP 3 type:', typeof agent['activation-instructions'][2]);
    console.log('STEP 3 preview:', agent['activation-instructions'][2].substring(0, 150) + '...');
  } catch (error) {
    console.log('❌ YAML parsing failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('❌ No YAML block found');
  process.exit(1);
}
