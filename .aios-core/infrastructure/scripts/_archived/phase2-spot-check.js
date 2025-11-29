#!/usr/bin/env node

/**
 * Phase 2 Spot-Check Validation Script
 * Story 6.1.7.1 - Task Content Completion
 * 
 * Verifies Phase 2 TODO resolution accuracy
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(process.cwd(), '.aios-core', 'tasks');
const REPORT_FILE = path.join(process.cwd(), '.ai', 'phase2-spot-check-report.json');

// Phase 2 validation patterns
const PHASE2_TODOS = [
  { pattern: /campo: \{TODO: fieldName\}/, description: 'Entrada campo placeholder' },
  { pattern: /tipo: \{TODO: string\|number\|boolean\}/, description: 'Entrada tipo placeholder' },
  { pattern: /origem: \{TODO: User Input \| config \| Step X\}/, description: 'Entrada origem placeholder' },
  { pattern: /validação: \{TODO: validation rule\}/, description: 'Entrada validação placeholder' },
  { pattern: /campo: \{TODO: fieldName\}/, description: 'Saída campo placeholder' },
  { pattern: /tipo: \{TODO: type\}/, description: 'Saída tipo placeholder' },
  { pattern: /destino: \{TODO: output \| state \| Step Y\}/, description: 'Saída destino placeholder' },
  { pattern: /\*\*Error:\*\* \{TODO: error type\}/, description: 'Common Error placeholder' },
  { pattern: /\*\*Cause:\*\* \{TODO: why it happens\}/, description: 'Error Cause placeholder' },
  { pattern: /\*\*Resolution:\*\* \{TODO: how to fix\}/, description: 'Error Resolution placeholder' },
  { pattern: /\*\*Recovery:\*\* \{TODO: automated recovery steps\}/, description: 'Error Recovery placeholder' }
];

// Get all task files
function getAllTaskFiles() {
  return fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.md') && !f.includes('.pre-task-id-fix') && !f.includes('.v1-backup'));
}

// Random sample selection (stratified by category)
function selectRandomSample(files, sampleSize = 10) {
  // Shuffle array
  const shuffled = files.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
}

// Validate single task file
function validateTaskFile(filename) {
  const filePath = path.join(TASKS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const errors = [];
  
  // Check for Phase 2 TODOs
  PHASE2_TODOS.forEach(({ pattern, description }) => {
    if (pattern.test(content)) {
      errors.push(description);
    }
  });
  
  // Check that Entrada section has actual fields
  const entradaMatch = content.match(/\*\*Entrada:\*\*\n([\s\S]*?)\n\*\*Saída:\*\*/);
  if (!entradaMatch || entradaMatch[1].includes('{TODO')) {
    errors.push('Entrada section incomplete');
  }
  
  // Check that Saída section has actual fields
  const saidaMatch = content.match(/\*\*Saída:\*\*\n([\s\S]*?)\n```\n\n---/);
  if (!saidaMatch || saidaMatch[1].includes('{TODO')) {
    errors.push('Saída section incomplete');
  }
  
  // Check that Common Errors section has actual errors
  const errorsMatch = content.match(/\*\*Common Errors:\*\*\n\n([\s\S]*?)\n---/);
  if (!errorsMatch || errorsMatch[1].includes('{TODO')) {
    errors.push('Common Errors section incomplete');
  }
  
  return {
    filename,
    passed: errors.length === 0,
    errors
  };
}

// Main execution
function main() {
  console.log('🔍 Phase 2 Spot-Check Validation');
  console.log('=================================\n');
  
  const allFiles = getAllTaskFiles();
  const sample = selectRandomSample(allFiles, 10);
  
  console.log(`📁 Total tasks: ${allFiles.length}`);
  console.log(`🎲 Random sample: ${sample.length} tasks\n`);
  
  const results = {
    timestamp: new Date().toISOString(),
    totalTasks: allFiles.length,
    sampleSize: sample.length,
    passed: 0,
    failed: 0,
    details: []
  };
  
  sample.forEach((filename, index) => {
    const result = validateTaskFile(filename);
    results.details.push(result);
    
    if (result.passed) {
      results.passed++;
      console.log(`✅ [${index + 1}/${sample.length}] ${filename}: PASS`);
    } else {
      results.failed++;
      console.log(`❌ [${index + 1}/${sample.length}] ${filename}: FAIL`);
      result.errors.forEach(err => console.log(`   - ${err}`));
    }
  });
  
  console.log('\n📊 Summary:');
  console.log('===========');
  console.log(`Sample size: ${results.sampleSize}`);
  console.log(`Passed: ${results.passed} (${(results.passed / results.sampleSize * 100).toFixed(1)}%)`);
  console.log(`Failed: ${results.failed}`);
  
  // Write report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Report saved: ${REPORT_FILE}`);
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

main();

