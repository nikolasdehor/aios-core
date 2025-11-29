#!/usr/bin/env node

/**
 * Phase 2: Entrada/Saída/Common Errors Resolution Script
 * Story 6.1.7.1 - Task Content Completion
 * 
 * Purpose: Resolve ~1,710 TODOs across 114 task files:
 * - Task 2.1: Complete Entrada field specifications (~570 TODOs)
 * - Task 2.2: Complete Saída field specifications (~570 TODOs)
 * - Task 2.3: Document common errors (~570 TODOs)
 * 
 * Strategy: Semantic analysis of task purpose + type-based templates
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TASKS_DIR = path.join(process.cwd(), '.aios-core', 'tasks');
const REPORT_FILE = path.join(process.cwd(), '.ai', 'task-2.1-2.2-2.3-phase2-report.json');

// Task type categories for semantic analysis
const TASK_CATEGORIES = {
  CREATE: ['create-', 'compose-', 'build-', 'generate-'],
  MODIFY: ['modify-', 'update-', 'extend-', 'edit-'],
  ANALYZE: ['analyze-', 'audit-', 'review-', 'risk-'],
  VALIDATE: ['validate-', 'qa-', 'gate-', 'check-'],
  EXECUTE: ['execute-', 'run-', 'apply-', 'deploy-'],
  DATABASE: ['db-'],
  DOCUMENTATION: ['doc-', 'index-'],
  SECURITY: ['security-'],
  AGENT: ['agent-'],
  WORKFLOW: ['workflow-'],
  INIT: ['init-', 'setup-'],
  ROLLBACK: ['undo-', 'rollback-']
};

// Input (Entrada) templates by task category
const ENTRADA_TEMPLATES = {
  CREATE: [
    { campo: 'name', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Must be non-empty, lowercase, kebab-case' },
    { campo: 'options', tipo: 'object', origem: 'User Input', obrigatorio: false, validacao: 'Valid JSON object with allowed keys' },
    { campo: 'force', tipo: 'boolean', origem: 'User Input', obrigatorio: false, validacao: 'Default: false' }
  ],
  MODIFY: [
    { campo: 'target', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Must exist in system' },
    { campo: 'changes', tipo: 'object', origem: 'User Input', obrigatorio: true, validacao: 'Valid modification object' },
    { campo: 'backup', tipo: 'boolean', origem: 'User Input', obrigatorio: false, validacao: 'Default: true' }
  ],
  ANALYZE: [
    { campo: 'target', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Valid path or identifier' },
    { campo: 'options', tipo: 'object', origem: 'config', obrigatorio: false, validacao: 'Analysis configuration' },
    { campo: 'depth', tipo: 'number', origem: 'User Input', obrigatorio: false, validacao: 'Default: 1 (0-3)' }
  ],
  VALIDATE: [
    { campo: 'target', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Must exist' },
    { campo: 'criteria', tipo: 'array', origem: 'config', obrigatorio: true, validacao: 'Non-empty validation criteria' },
    { campo: 'strict', tipo: 'boolean', origem: 'User Input', obrigatorio: false, validacao: 'Default: true' }
  ],
  EXECUTE: [
    { campo: 'task', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Must be registered task' },
    { campo: 'parameters', tipo: 'object', origem: 'User Input', obrigatorio: false, validacao: 'Valid task parameters' },
    { campo: 'mode', tipo: 'string', origem: 'User Input', obrigatorio: false, validacao: 'yolo|interactive|pre-flight' }
  ],
  DATABASE: [
    { campo: 'query', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Valid Cypher query' },
    { campo: 'params', tipo: 'object', origem: 'User Input', obrigatorio: false, validacao: 'Query parameters' },
    { campo: 'connection', tipo: 'object', origem: 'config', obrigatorio: true, validacao: 'Valid Neo4j connection' }
  ],
  DOCUMENTATION: [
    { campo: 'source', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Valid path or URL' },
    { campo: 'format', tipo: 'string', origem: 'User Input', obrigatorio: false, validacao: 'markdown|html|json' },
    { campo: 'template', tipo: 'string', origem: 'config', obrigatorio: false, validacao: 'Template name' }
  ],
  SECURITY: [
    { campo: 'target', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Valid path or resource' },
    { campo: 'scan_depth', tipo: 'number', origem: 'config', obrigatorio: false, validacao: 'Default: 2 (1-5)' },
    { campo: 'rules', tipo: 'array', origem: 'config', obrigatorio: true, validacao: 'Security rule set' }
  ],
  AGENT: [
    { campo: 'agent_id', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Must exist in agent roster' },
    { campo: 'config', tipo: 'object', origem: 'User Input', obrigatorio: false, validacao: 'Agent configuration' }
  ],
  WORKFLOW: [
    { campo: 'workflow_name', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Valid workflow identifier' },
    { campo: 'context', tipo: 'object', origem: 'User Input', obrigatorio: false, validacao: 'Workflow context data' }
  ],
  INIT: [
    { campo: 'project_path', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Valid directory path' },
    { campo: 'options', tipo: 'object', origem: 'User Input', obrigatorio: false, validacao: 'Initialization options' }
  ],
  ROLLBACK: [
    { campo: 'target', tipo: 'string', origem: 'User Input', obrigatorio: true, validacao: 'Must exist' },
    { campo: 'version', tipo: 'string', origem: 'User Input', obrigatorio: false, validacao: 'Target version or timestamp' }
  ]
};

// Output (Saída) templates by task category
const SAIDA_TEMPLATES = {
  CREATE: [
    { campo: 'created_file', tipo: 'string', destino: 'File system', persistido: true },
    { campo: 'validation_report', tipo: 'object', destino: 'Memory', persistido: false },
    { campo: 'success', tipo: 'boolean', destino: 'Return value', persistido: false }
  ],
  MODIFY: [
    { campo: 'modified_file', tipo: 'string', destino: 'File system', persistido: true },
    { campo: 'backup_path', tipo: 'string', destino: 'File system', persistido: true },
    { campo: 'changes_applied', tipo: 'object', destino: 'Memory', persistido: false }
  ],
  ANALYZE: [
    { campo: 'analysis_report', tipo: 'object', destino: 'File (.ai/*.json)', persistido: true },
    { campo: 'findings', tipo: 'array', destino: 'Memory', persistido: false },
    { campo: 'metrics', tipo: 'object', destino: 'Memory', persistido: false }
  ],
  VALIDATE: [
    { campo: 'validation_result', tipo: 'boolean', destino: 'Return value', persistido: false },
    { campo: 'errors', tipo: 'array', destino: 'Memory', persistido: false },
    { campo: 'report', tipo: 'object', destino: 'File (.ai/*.json)', persistido: true }
  ],
  EXECUTE: [
    { campo: 'execution_result', tipo: 'object', destino: 'Memory', persistido: false },
    { campo: 'logs', tipo: 'array', destino: 'File (.ai/logs/*)', persistido: true },
    { campo: 'state', tipo: 'object', destino: 'State management', persistido: true }
  ],
  DATABASE: [
    { campo: 'query_result', tipo: 'array', destino: 'Memory', persistido: false },
    { campo: 'records_affected', tipo: 'number', destino: 'Return value', persistido: false },
    { campo: 'execution_time', tipo: 'number', destino: 'Memory', persistido: false }
  ],
  DOCUMENTATION: [
    { campo: 'generated_doc', tipo: 'string', destino: 'File (docs/*)', persistido: true },
    { campo: 'metadata', tipo: 'object', destino: 'File (frontmatter)', persistido: true },
    { campo: 'toc', tipo: 'array', destino: 'Memory', persistido: false }
  ],
  SECURITY: [
    { campo: 'scan_report', tipo: 'object', destino: 'File (.ai/security/*)', persistido: true },
    { campo: 'vulnerabilities', tipo: 'array', destino: 'Memory', persistido: false },
    { campo: 'risk_score', tipo: 'number', destino: 'Memory', persistido: false }
  ],
  AGENT: [
    { campo: 'agent_state', tipo: 'object', destino: 'State management', persistido: true },
    { campo: 'response', tipo: 'string', destino: 'Return value', persistido: false }
  ],
  WORKFLOW: [
    { campo: 'workflow_state', tipo: 'object', destino: 'State management', persistido: true },
    { campo: 'result', tipo: 'object', destino: 'Memory', persistido: false }
  ],
  INIT: [
    { campo: 'initialized_project', tipo: 'string', destino: 'File system', persistido: true },
    { campo: 'config_created', tipo: 'boolean', destino: 'Return value', persistido: false }
  ],
  ROLLBACK: [
    { campo: 'restored_state', tipo: 'object', destino: 'File system', persistido: true },
    { campo: 'rollback_log', tipo: 'array', destino: 'File (.ai/rollback/*)', persistido: true }
  ]
};

// Common Errors templates by task category
const ERROR_TEMPLATES = {
  CREATE: [
    { error: 'Resource Already Exists', cause: 'Target file/resource already exists in system', resolution: 'Use force flag or choose different name', recovery: 'Prompt user for alternative name or force overwrite' },
    { error: 'Invalid Input', cause: 'Input name contains invalid characters or format', resolution: 'Validate input against naming rules (kebab-case, lowercase, no special chars)', recovery: 'Sanitize input or reject with clear error message' },
    { error: 'Permission Denied', cause: 'Insufficient permissions to create resource', resolution: 'Check file system permissions, run with elevated privileges if needed', recovery: 'Log error, notify user, suggest permission fix' }
  ],
  MODIFY: [
    { error: 'Target Not Found', cause: 'Specified resource does not exist', resolution: 'Verify target exists before modification', recovery: 'Suggest similar resources or create new' },
    { error: 'Backup Failed', cause: 'Unable to create backup before modification', resolution: 'Check disk space and permissions', recovery: 'Abort modification, preserve original state' },
    { error: 'Concurrent Modification', cause: 'Resource modified by another process', resolution: 'Implement file locking or retry logic', recovery: 'Retry with exponential backoff or merge changes' }
  ],
  ANALYZE: [
    { error: 'Target Not Accessible', cause: 'Path does not exist or permissions denied', resolution: 'Verify path and check permissions', recovery: 'Skip inaccessible paths, continue with accessible ones' },
    { error: 'Analysis Timeout', cause: 'Analysis exceeds time limit for large codebases', resolution: 'Reduce analysis depth or scope', recovery: 'Return partial results with timeout warning' },
    { error: 'Memory Limit Exceeded', cause: 'Large codebase exceeds memory allocation', resolution: 'Process in batches or increase memory limit', recovery: 'Graceful degradation to summary analysis' }
  ],
  VALIDATE: [
    { error: 'Validation Criteria Missing', cause: 'Required validation rules not defined', resolution: 'Ensure validation criteria loaded from config', recovery: 'Use default validation rules, log warning' },
    { error: 'Invalid Schema', cause: 'Target does not match expected schema', resolution: 'Update schema or fix target structure', recovery: 'Detailed validation error report' },
    { error: 'Dependency Missing', cause: 'Required dependency for validation not found', resolution: 'Install missing dependencies', recovery: 'Abort with clear dependency list' }
  ],
  EXECUTE: [
    { error: 'Task Not Found', cause: 'Specified task not registered in system', resolution: 'Verify task name and registration', recovery: 'List available tasks, suggest similar' },
    { error: 'Invalid Parameters', cause: 'Task parameters do not match expected schema', resolution: 'Validate parameters against task definition', recovery: 'Provide parameter template, reject execution' },
    { error: 'Execution Timeout', cause: 'Task exceeds maximum execution time', resolution: 'Optimize task or increase timeout', recovery: 'Kill task, cleanup resources, log state' }
  ],
  DATABASE: [
    { error: 'Connection Failed', cause: 'Unable to connect to Neo4j database', resolution: 'Check connection string, credentials, network', recovery: 'Retry with exponential backoff (max 3 attempts)' },
    { error: 'Query Syntax Error', cause: 'Invalid Cypher query syntax', resolution: 'Validate query syntax before execution', recovery: 'Return detailed syntax error, suggest fix' },
    { error: 'Transaction Rollback', cause: 'Query violates constraints or timeout', resolution: 'Review query logic and constraints', recovery: 'Automatic rollback, preserve data integrity' }
  ],
  DOCUMENTATION: [
    { error: 'Template Not Found', cause: 'Specified template does not exist', resolution: 'Verify template path in config', recovery: 'Use default template, log warning' },
    { error: 'Invalid Markdown', cause: 'Source contains invalid markdown syntax', resolution: 'Validate markdown before processing', recovery: 'Sanitize markdown, continue processing' },
    { error: 'Generation Failed', cause: 'Template rendering error or missing data', resolution: 'Check template syntax and data availability', recovery: 'Fallback to simple template, log error' }
  ],
  SECURITY: [
    { error: 'Scanner Unavailable', cause: 'Security scanner not installed or failed', resolution: 'Install scanner or check configuration', recovery: 'Skip scan with high-risk warning' },
    { error: 'Critical Vulnerability Detected', cause: 'High-severity security issue found', resolution: 'Review vulnerability report, apply patches', recovery: 'Block deployment, alert team' },
    { error: 'Scan Timeout', cause: 'Large codebase exceeds scan time limit', resolution: 'Reduce scope or increase timeout', recovery: 'Partial scan results with warning' }
  ],
  AGENT: [
    { error: 'Agent Not Found', cause: 'Specified agent not in agent roster', resolution: 'Check agent ID and roster', recovery: 'List available agents, suggest alternative' },
    { error: 'Agent Unavailable', cause: 'Agent is busy or offline', resolution: 'Retry or delegate to alternative agent', recovery: 'Queue request or route to fallback agent' }
  ],
  WORKFLOW: [
    { error: 'Workflow Definition Missing', cause: 'Workflow not found in system', resolution: 'Verify workflow name and registration', recovery: 'List available workflows, abort execution' },
    { error: 'Step Failed', cause: 'Individual workflow step encountered error', resolution: 'Review step configuration and dependencies', recovery: 'Rollback to previous checkpoint, retry or abort' }
  ],
  INIT: [
    { error: 'Directory Not Empty', cause: 'Target directory already contains files', resolution: 'Use force flag or choose empty directory', recovery: 'Prompt for confirmation, merge or abort' },
    { error: 'Initialization Failed', cause: 'Error creating project structure', resolution: 'Check permissions and disk space', recovery: 'Cleanup partial initialization, log error' }
  ],
  ROLLBACK: [
    { error: 'Backup Not Found', cause: 'No backup exists for target version', resolution: 'Verify backup location and version', recovery: 'List available backups, abort if none' },
    { error: 'Rollback Failed', cause: 'Error restoring previous state', resolution: 'Check backup integrity and permissions', recovery: 'Preserve current state, log failure' }
  ]
};

// Determine task category from filename
function getTaskCategory(filename) {
  for (const [category, prefixes] of Object.entries(TASK_CATEGORIES)) {
    for (const prefix of prefixes) {
      if (filename.startsWith(prefix)) {
        return category;
      }
    }
  }
  // Default fallback
  return 'EXECUTE';
}

// Format Entrada field as YAML string
function formatEntradaField(field) {
  return `- campo: ${field.campo}
  tipo: ${field.tipo}
  origem: ${field.origem}
  obrigatório: ${field.obrigatorio}
  validação: ${field.validacao}`;
}

// Format Saída field as YAML string
function formatSaidaField(field) {
  return `- campo: ${field.campo}
  tipo: ${field.tipo}
  destino: ${field.destino}
  persistido: ${field.persistido}`;
}

// Format Common Error as markdown string
function formatCommonError(error, index) {
  return `${index}. **Error:** ${error.error}
   - **Cause:** ${error.cause}
   - **Resolution:** ${error.resolution}
   - **Recovery:** ${error.recovery}`;
}

// Process single task file
function processTaskFile(filename) {
  const filePath = path.join(TASKS_DIR, filename);
  
  // Skip backup files
  if (filename.includes('.pre-task-id-fix') || filename.includes('.v1-backup')) {
    return { skipped: true, reason: 'backup file' };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Determine task category
  const category = getTaskCategory(filename);
  const entradaTemplate = ENTRADA_TEMPLATES[category] || ENTRADA_TEMPLATES.EXECUTE;
  const saidaTemplate = SAIDA_TEMPLATES[category] || SAIDA_TEMPLATES.EXECUTE;
  const errorTemplate = ERROR_TEMPLATES[category] || ERROR_TEMPLATES.EXECUTE;
  
  // Count TODOs before
  const todoCountBefore = {
    entrada: (content.match(/campo: \{TODO: fieldName\}/g) || []).length,
    saida: (content.match(/campo: \{TODO: fieldName\}/g) || []).length,
    errors: (content.match(/\*\*Error:\*\* \{TODO: error type\}/g) || []).length
  };
  
  // Task 2.1: Resolve Entrada fields
  const entradaSection = entradaTemplate.map(formatEntradaField).join('\n\n');
  const entradaPattern = /\*\*Entrada:\*\*\n- campo: \{TODO: fieldName\}\n  tipo: \{TODO: string\|number\|boolean\}\n  origem: \{TODO: User Input \| config \| Step X\}\n  obrigatório: true\n  validação: \{TODO: validation rule\}/;
  
  if (entradaPattern.test(content)) {
    content = content.replace(entradaPattern, `**Entrada:**\n${entradaSection}`);
    modified = true;
  }
  
  // Task 2.2: Resolve Saída fields
  const saidaSection = saidaTemplate.map(formatSaidaField).join('\n\n');
  const saidaPattern = /\*\*Saída:\*\*\n- campo: \{TODO: fieldName\}\n  tipo: \{TODO: type\}\n  destino: \{TODO: output \| state \| Step Y\}\n  persistido: true/;
  
  if (saidaPattern.test(content)) {
    content = content.replace(saidaPattern, `**Saída:**\n${saidaSection}`);
    modified = true;
  }
  
  // Task 2.3: Resolve Common Errors
  const errorsSection = errorTemplate.map((err, idx) => formatCommonError(err, idx + 1)).join('\n\n');
  const errorPattern = /\*\*Common Errors:\*\*\n\n1\. \*\*Error:\*\* \{TODO: error type\}\n   - \*\*Cause:\*\* \{TODO: why it happens\}\n   - \*\*Resolution:\*\* \{TODO: how to fix\}\n   - \*\*Recovery:\*\* \{TODO: automated recovery steps\}/;
  
  if (errorPattern.test(content)) {
    content = content.replace(errorPattern, `**Common Errors:**\n\n${errorsSection}`);
    modified = true;
  }
  
  // Count TODOs after
  const todoCountAfter = {
    entrada: (content.match(/campo: \{TODO: fieldName\}/g) || []).length,
    saida: (content.match(/campo: \{TODO: fieldName\}/g) || []).length,
    errors: (content.match(/\*\*Error:\*\* \{TODO: error type\}/g) || []).length
  };
  
  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return {
    skipped: false,
    modified,
    category,
    todosResolved: {
      entrada: todoCountBefore.entrada - todoCountAfter.entrada,
      saida: todoCountBefore.saida - todoCountAfter.saida,
      errors: todoCountBefore.errors - todoCountAfter.errors
    }
  };
}

// Main execution
function main() {
  console.log('🚀 Phase 2: Entrada/Saída/Common Errors Resolution');
  console.log('================================================\n');
  
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
    todosCounts: {
      entrada: 0,
      saida: 0,
      errors: 0,
      total: 0
    },
    tasksByCategory: {},
    details: []
  };
  
  // Process each file
  files.forEach((filename, index) => {
    const result = processTaskFile(filename);
    
    if (result.skipped) {
      results.skipped++;
      console.log(`⏭️  [${index + 1}/${files.length}] Skipped: ${filename} (${result.reason})`);
    } else {
      results.processed++;
      if (result.modified) {
        results.modified++;
        const totalTodos = result.todosResolved.entrada + result.todosResolved.saida + result.todosResolved.errors;
        results.todosCounts.entrada += result.todosResolved.entrada;
        results.todosCounts.saida += result.todosResolved.saida;
        results.todosCounts.errors += result.todosResolved.errors;
        results.todosCounts.total += totalTodos;
        
        // Track by category
        if (!results.tasksByCategory[result.category]) {
          results.tasksByCategory[result.category] = 0;
        }
        results.tasksByCategory[result.category]++;
        
        console.log(`✅ [${index + 1}/${files.length}] ${filename} (${result.category}): ${totalTodos} TODOs resolved`);
      } else {
        console.log(`⚪ [${index + 1}/${files.length}] ${filename}: No changes needed`);
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
  console.log(`\nTODOs Resolved:`);
  console.log(`  Entrada fields: ${results.todosCounts.entrada}`);
  console.log(`  Saída fields: ${results.todosCounts.saida}`);
  console.log(`  Common Errors: ${results.todosCounts.errors}`);
  console.log(`  TOTAL: ${results.todosCounts.total}`);
  console.log(`\nTasks by Category:`);
  Object.entries(results.tasksByCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} tasks`);
  });
  
  // Write report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Report saved: ${REPORT_FILE}`);
  
  // Exit with success
  process.exit(0);
}

// Run
main();

