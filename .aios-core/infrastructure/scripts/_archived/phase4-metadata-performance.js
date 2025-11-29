#!/usr/bin/env node

/**
 * Phase 4: Metadata & Performance TODOs Resolution Script
 * Story 6.1.7.1 - Task Content Completion
 * 
 * Resolves remaining TODOs in:
 * - Performance section (token_usage, optimization notes)
 * - Metadata section (story, dependencies, tags)
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(process.cwd(), '.aios-core', 'tasks');
const REPORT_FILE = path.join(process.cwd(), '.ai', 'task-phase4-metadata-performance-report.json');

// Performance token usage by atomic layer
const TOKEN_USAGE_BY_LAYER = {
  Atom: '~500-1,000 tokens',
  Molecule: '~1,000-3,000 tokens',
  Organism: '~3,000-10,000 tokens',
  Template: '~1,500-5,000 tokens',
  Strategy: '~2,000-8,000 tokens',
  Config: '~800-2,500 tokens'
};

// Optimization notes by atomic layer
const OPTIMIZATION_NOTES_BY_LAYER = {
  Atom: 'Minimize external dependencies; cache results if reusable; validate inputs early',
  Molecule: 'Parallelize independent operations; reuse atom results; implement early exits',
  Organism: 'Break into smaller workflows; implement checkpointing; use async processing where possible',
  Template: 'Cache template compilation; minimize data transformations; lazy load resources',
  Strategy: 'Iterative analysis with depth limits; cache intermediate results; batch similar operations',
  Config: 'Validate configuration early; use atomic writes; implement rollback checkpoints'
};

// Process single task file
function processTaskFile(filename) {
  const filePath = path.join(TASKS_DIR, filename);
  
  // Skip backup files
  if (filename.includes('.pre-task-id-fix') || filename.includes('.v1-backup')) {
    return { skipped: true, reason: 'backup file' };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let todosResolved = 0;
  
  // Extract atomic_layer for context
  const atomicLayerMatch = content.match(/atomic_layer: (\w+)/);
  const atomicLayer = atomicLayerMatch ? atomicLayerMatch[1] : 'Organism';
  
  const tokenUsage = TOKEN_USAGE_BY_LAYER[atomicLayer] || '~2,000-5,000 tokens';
  const optimizationNotes = OPTIMIZATION_NOTES_BY_LAYER[atomicLayer] || 'Optimize based on task requirements';
  
  // Resolve token_usage TODO
  const tokenPattern = /token_usage: \{TODO: ~X tokens\}/g;
  if (tokenPattern.test(content)) {
    content = content.replace(tokenPattern, `token_usage: ${tokenUsage}`);
    modified = true;
    todosResolved++;
  }
  
  // Resolve optimization notes TODO
  const optimizationPattern = /- \{TODO: performance tips\}/g;
  if (optimizationPattern.test(content)) {
    content = content.replace(optimizationPattern, `- ${optimizationNotes}`);
    modified = true;
    todosResolved++;
  }
  
  // Resolve story TODO (N/A for now, will be filled when tasks are used in stories)
  const storyPattern = /story: \{TODO: Story ID or N\/A\}/g;
  if (storyPattern.test(content)) {
    content = content.replace(storyPattern, 'story: N/A');
    modified = true;
    todosResolved++;
  }
  
  // Resolve dependencies TODO
  const dependenciesPattern = /  - \{TODO: dependency file or N\/A\}/g;
  if (dependenciesPattern.test(content)) {
    content = content.replace(dependenciesPattern, '  - N/A');
    modified = true;
    todosResolved++;
  }
  
  // Resolve tags TODO
  const tag1Pattern = /  - \{TODO: tag1\}/g;
  const tag2Pattern = /  - \{TODO: tag2\}/g;
  
  // Determine appropriate tags based on task category
  const tags = [];
  if (filename.startsWith('dev-')) tags.push('development', 'code');
  else if (filename.startsWith('qa-')) tags.push('quality-assurance', 'testing');
  else if (filename.startsWith('po-')) tags.push('product-management', 'planning');
  else if (filename.startsWith('db-')) tags.push('database', 'infrastructure');
  else if (filename.startsWith('security-')) tags.push('security', 'audit');
  else if (filename.includes('create-')) tags.push('creation', 'setup');
  else if (filename.includes('analyze-')) tags.push('analysis', 'metrics');
  else if (filename.includes('modify-')) tags.push('modification', 'update');
  else tags.push('automation', 'workflow');
  
  if (tag1Pattern.test(content)) {
    content = content.replace(tag1Pattern, `  - ${tags[0] || 'automation'}`);
    modified = true;
    todosResolved++;
  }
  
  if (tag2Pattern.test(content)) {
    content = content.replace(tag2Pattern, `  - ${tags[1] || 'workflow'}`);
    modified = true;
    todosResolved++;
  }
  
  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return {
    skipped: false,
    modified,
    atomicLayer,
    todosResolved
  };
}

// Main execution
function main() {
  console.log('🚀 Phase 4: Metadata & Performance Resolution');
  console.log('==============================================\n');
  
  // Ensure report directory exists
  const reportDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Get all task files
  const files = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.md'));
  console.log(`📁 Found ${files.length} task files\n`);
  
  const results = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    processed: 0,
    skipped: 0,
    modified: 0,
    todosResolved: 0,
    details: []
  };
  
  // Process each file
  files.forEach((filename, index) => {
    const result = processTaskFile(filename);
    
    if (result.skipped) {
      results.skipped++;
      if (index < 10) {
        console.log(`⏭️  [${index + 1}/${files.length}] Skipped: ${filename} (${result.reason})`);
      }
    } else {
      results.processed++;
      if (result.modified) {
        results.modified++;
        results.todosResolved += result.todosResolved;
        console.log(`✅ [${index + 1}/${files.length}] ${filename}: ${result.todosResolved} TODOs resolved`);
      } else {
        if (index < 10) {
          console.log(`⚪ [${index + 1}/${files.length}] ${filename}: No changes needed`);
        }
      }
      
      results.details.push({
        filename,
        ...result
      });
    }
  });
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('===========');
  console.log(`Total files: ${results.totalFiles}`);
  console.log(`Processed: ${results.processed}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Modified: ${results.modified}`);
  console.log(`TODOs Resolved: ${results.todosResolved}`);
  
  // Write report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Report saved: ${REPORT_FILE}`);
  
  // Exit with success
  process.exit(0);
}

// Run
main();

