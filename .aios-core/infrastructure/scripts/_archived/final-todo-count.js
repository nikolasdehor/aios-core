#!/usr/bin/env node

/**
 * Final TODO Count Script
 * Story 6.1.7.1 - Task Content Completion
 * 
 * Counts all remaining TODOs in task files
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(process.cwd(), '.aios-core', 'tasks');
const REPORT_FILE = path.join(process.cwd(), '.ai', 'final-todo-count-report.json');

// All TODO patterns to search for
const TODO_PATTERNS = [
  { pattern: /\{TODO:/g, description: 'Generic TODO placeholder' },
  { pattern: /todo:/gi, description: 'Lowercase todo' }
];

// Get all task files
function getAllTaskFiles() {
  return fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.md') && !f.includes('.pre-task-id-fix') && !f.includes('.v1-backup'));
}

// Count TODOs in a file
function countTodosInFile(filename) {
  const filePath = path.join(TASKS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  let todoCount = 0;
  const todos = [];
  
  TODO_PATTERNS.forEach(({ pattern, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      todoCount += matches.length;
      matches.forEach((match, idx) => {
        // Find the line number
        const lines = content.split('\n');
        let lineNum = 0;
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1; // +1 for newline
          if (content.indexOf(match, charCount - lines[i].length - 1) < charCount) {
            lineNum = i + 1;
            const contextStart = Math.max(0, lines[i].indexOf(match) - 20);
            const contextEnd = Math.min(lines[i].length, lines[i].indexOf(match) + match.length + 50);
            const context = lines[i].substring(contextStart, contextEnd);
            todos.push({
              line: lineNum,
              match: match,
              context: context.trim()
            });
            break;
          }
        }
      });
    }
  });
  
  return {
    filename,
    todoCount,
    todos: todos.slice(0, 10) // Limit to first 10 for report brevity
  };
}

// Main execution
function main() {
  console.log('🔍 Final TODO Count');
  console.log('===================\n');
  
  const allFiles = getAllTaskFiles();
  console.log(`📁 Scanning ${allFiles.length} task files...\n`);
  
  const results = {
    timestamp: new Date().toISOString(),
    totalFiles: allFiles.length,
    filesWithTodos: 0,
    totalTodos: 0,
    details: []
  };
  
  allFiles.forEach((filename, index) => {
    const fileResults = countTodosInFile(filename);
    
    if (fileResults.todoCount > 0) {
      results.filesWithTodos++;
      results.totalTodos += fileResults.todoCount;
      results.details.push(fileResults);
      console.log(`⚠️  [${index + 1}/${allFiles.length}] ${filename}: ${fileResults.todoCount} TODOs remaining`);
    } else {
      if (index < 10) {
        console.log(`✅ [${index + 1}/${allFiles.length}] ${filename}: No TODOs`);
      }
    }
  });
  
  console.log('\n📊 Summary:');
  console.log('===========');
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`Files with TODOs: ${results.filesWithTodos}`);
  console.log(`Total TODOs remaining: ${results.totalTodos}`);
  
  if (results.totalTodos === 0) {
    console.log('\n🎉 SUCCESS: All TODOs resolved! ✅');
  } else {
    console.log(`\n⚠️  WARNING: ${results.totalTodos} TODOs still need resolution`);
  }
  
  // Write report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Report saved: ${REPORT_FILE}`);
  
  process.exit(results.totalTodos > 0 ? 1 : 0);
}

main();

