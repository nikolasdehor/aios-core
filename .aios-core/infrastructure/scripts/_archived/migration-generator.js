const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Migration script generator for AIOS-FULLSTACK framework
 * Generates migration scripts between framework versions
 */
class MigrationGenerator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.migrationTemplates = this.initializeMigrationTemplates();
    this.versionTracker = options.versionTracker;
  }

  /**
   * Generate migration script between two versions
   */
  async generateMigrationScript(fromVersion, toVersion, options = {}) {
    const migrationScript = {
      migration_id: `${fromVersion}-to-${toVersion}`,
      from_version: fromVersion,
      to_version: toVersion,
      timestamp: new Date().toISOString(),
      operations: [],
      rollback_operations: [],
      estimated_duration: 0,
      risk_level: 'low',
      prerequisites: [],
      validation_checks: [],
      post_migration_tasks: [],
      metadata: {
        auto_generated: true,
        generator_version: '1.0.0',
        migration_type: options.migrationType || 'auto'
      }
    };

    try {
      console.log(chalk.blue(`🔧 Generating migration script: ${fromVersion} → ${toVersion}`));

      // Get version information
      const fromVersionInfo = await this.getVersionInfo(fromVersion);
      const toVersionInfo = await this.getVersionInfo(toVersion);

      // Analyze changes between versions
      const changes = await this.analyzeVersionChanges(fromVersionInfo, toVersionInfo);

      // Generate migration operations
      migrationScript.operations = await this.generateMigrationOperations(changes);
      migrationScript.rollback_operations = await this.generateRollbackOperations(changes);

      // Generate validation checks
      migrationScript.validation_checks = this.generateValidationChecks(changes);

      // Generate prerequisites
      migrationScript.prerequisites = this.generatePrerequisites(changes);

      // Generate post-migration tasks
      migrationScript.post_migration_tasks = this.generatePostMigrationTasks(changes);

      // Calculate metadata
      migrationScript.estimated_duration = this.calculateMigrationDuration(migrationScript.operations);
      migrationScript.risk_level = this.assessMigrationRisk(changes, migrationScript.operations);

      // Save migration script
      const scriptPath = await this.saveMigrationScript(migrationScript);

      console.log(chalk.green(`✅ Migration script generated: ${scriptPath}`));
      console.log(chalk.gray(`   Operations: ${migrationScript.operations.length}`));
      console.log(chalk.gray(`   Estimated duration: ${migrationScript.estimated_duration} minutes`));
      console.log(chalk.gray(`   Risk level: ${migrationScript.risk_level}`));

      return {
        migration_id: migrationScript.migration_id,
        script_path: scriptPath,
        operations: migrationScript.operations.length,
        estimated_duration: migrationScript.estimated_duration,
        risk_level: migrationScript.risk_level,
        prerequisites: migrationScript.prerequisites.length
      };

    } catch (error) {
      console.error(chalk.red(`Migration script generation failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate migration operations based on changes
   */
  async generateMigrationOperations(changes) {
    const operations = [];

    // File operations
    if (changes.files) {
      // New files
      for (const newFile of changes.files.added || []) {
        operations.push({
          type: 'create_file',
          description: `Create new file: ${newFile.path}`,
          target: newFile.path,
          content: newFile.content || null,
          template: newFile.template || null,
          order: 10
        });
      }

      // Modified files
      for (const modifiedFile of changes.files.modified || []) {
        if (modifiedFile.migration_type === 'automatic') {
          operations.push({
            type: 'update_file',
            description: `Update file: ${modifiedFile.path}`,
            target: modifiedFile.path,
            changes: modifiedFile.changes,
            backup_original: true,
            order: 20
          });
        } else {
          operations.push({
            type: 'manual_review',
            description: `Manual review required for: ${modifiedFile.path}`,
            target: modifiedFile.path,
            reason: 'Complex changes require manual intervention',
            guidance: modifiedFile.migration_guidance,
            order: 15
          });
        }
      }

      // Deleted files
      for (const deletedFile of changes.files.removed || []) {
        operations.push({
          type: 'archive_file',
          description: `Archive deprecated file: ${deletedFile.path}`,
          target: deletedFile.path,
          archive_location: `.aios/deprecated/${deletedFile.path}`,
          order: 30
        });
      }

      // Moved/renamed files
      for (const movedFile of changes.files.moved || []) {
        operations.push({
          type: 'move_file',
          description: `Move file: ${movedFile.from} → ${movedFile.to}`,
          source: movedFile.from,
          target: movedFile.to,
          update_references: true,
          order: 25
        });
      }
    }

    // Configuration changes
    if (changes.configuration) {
      for (const configChange of changes.configuration) {
        operations.push({
          type: 'update_configuration',
          description: `Update configuration: ${configChange.file}`,
          target: configChange.file,
          changes: configChange.changes,
          merge_strategy: configChange.merge_strategy || 'smart_merge',
          order: 5
        });
      }
    }

    // Dependency changes
    if (changes.dependencies) {
      // New dependencies
      for (const newDep of changes.dependencies.added || []) {
        operations.push({
          type: 'install_dependency',
          description: `Install new dependency: ${newDep.name}@${newDep.version}`,
          package: newDep.name,
          version: newDep.version,
          dev: newDep.dev || false,
          order: 1
        });
      }

      // Updated dependencies
      for (const updatedDep of changes.dependencies.updated || []) {
        operations.push({
          type: 'update_dependency',
          description: `Update dependency: ${updatedDep.name} ${updatedDep.from} → ${updatedDep.to}`,
          package: updatedDep.name,
          from_version: updatedDep.from,
          to_version: updatedDep.to,
          breaking_changes: updatedDep.breaking_changes || [],
          order: 2
        });
      }

      // Removed dependencies
      for (const removedDep of changes.dependencies.removed || []) {
        operations.push({
          type: 'remove_dependency',
          description: `Remove deprecated dependency: ${removedDep.name}`,
          package: removedDep.name,
          replacement: removedDep.replacement,
          order: 35
        });
      }
    }

    // Breaking changes
    if (changes.breaking_changes) {
      for (const breakingChange of changes.breaking_changes) {
        operations.push({
          type: 'breaking_change',
          description: `Handle breaking change: ${breakingChange.description}`,
          category: breakingChange.category,
          migration_steps: breakingChange.migration_steps,
          affected_components: breakingChange.affected_components,
          order: 40
        });
      }
    }

    // Database/storage migrations
    if (changes.storage) {
      for (const storageChange of changes.storage) {
        operations.push({
          type: 'migrate_storage',
          description: `Migrate storage: ${storageChange.description}`,
          migration_type: storageChange.type,
          data_transformations: storageChange.transformations,
          order: 45
        });
      }
    }

    // Sort operations by order
    return operations.sort((a, b) => a.order - b.order);
  }

  /**
   * Generate rollback operations
   */
  async generateRollbackOperations(changes) {
    const rollbackOps = [];

    // Reverse file operations
    if (changes.files) {
      // Rollback created files
      for (const newFile of changes.files.added || []) {
        rollbackOps.push({
          type: 'delete_file',
          description: `Remove file created during migration: ${newFile.path}`,
          target: newFile.path,
          order: 10
        });
      }

      // Rollback modified files
      for (const modifiedFile of changes.files.modified || []) {
        rollbackOps.push({
          type: 'restore_backup',
          description: `Restore original file: ${modifiedFile.path}`,
          target: modifiedFile.path,
          backup_source: `${modifiedFile.path}.migration-backup`,
          order: 20
        });
      }

      // Rollback archived files
      for (const deletedFile of changes.files.removed || []) {
        rollbackOps.push({
          type: 'restore_file',
          description: `Restore archived file: ${deletedFile.path}`,
          source: `.aios/deprecated/${deletedFile.path}`,
          target: deletedFile.path,
          order: 30
        });
      }

      // Rollback moved files
      for (const movedFile of changes.files.moved || []) {
        rollbackOps.push({
          type: 'move_file',
          description: `Restore file location: ${movedFile.to} → ${movedFile.from}`,
          source: movedFile.to,
          target: movedFile.from,
          update_references: true,
          order: 25
        });
      }
    }

    // Rollback dependency changes
    if (changes.dependencies) {
      for (const newDep of changes.dependencies.added || []) {
        rollbackOps.push({
          type: 'uninstall_dependency',
          description: `Remove dependency added during migration: ${newDep.name}`,
          package: newDep.name,
          order: 35
        });
      }

      for (const updatedDep of changes.dependencies.updated || []) {
        rollbackOps.push({
          type: 'downgrade_dependency',
          description: `Rollback dependency: ${updatedDep.name} ${updatedDep.to} → ${updatedDep.from}`,
          package: updatedDep.name,
          from_version: updatedDep.to,
          to_version: updatedDep.from,
          order: 36
        });
      }

      for (const removedDep of changes.dependencies.removed || []) {
        rollbackOps.push({
          type: 'reinstall_dependency',
          description: `Reinstall removed dependency: ${removedDep.name}`,
          package: removedDep.name,
          version: removedDep.version,
          order: 37
        });
      }
    }

    // Sort rollback operations in reverse order
    return rollbackOps.sort((a, b) => b.order - a.order);
  }

  /**
   * Generate validation checks for migration
   */
  generateValidationChecks(changes) {
    const checks = [];

    // Basic system checks
    checks.push({
      type: 'system_requirements',
      description: 'Verify system meets minimum requirements',
      checks: [
        'node_version_compatibility',
        'disk_space_available',
        'memory_requirements',
        'permission_checks'
      ]
    });

    // File integrity checks
    if (changes.files) {
      checks.push({
        type: 'file_integrity',
        description: 'Verify file integrity before migration',
        files: [
          ...(changes.files.modified || []).map(f => f.path),
          ...(changes.files.moved || []).map(f => f.from)
        ]
      });
    }

    // Dependency compatibility
    if (changes.dependencies) {
      checks.push({
        type: 'dependency_compatibility',
        description: 'Check dependency compatibility',
        dependencies: changes.dependencies.updated || []
      });
    }

    // Backup verification
    checks.push({
      type: 'backup_verification',
      description: 'Ensure backup is created and valid',
      backup_targets: this.getBackupTargets(changes)
    });

    // Custom validation based on breaking changes
    if (changes.breaking_changes) {
      for (const breakingChange of changes.breaking_changes) {
        if (breakingChange.validation) {
          checks.push({
            type: 'custom_validation',
            description: `Validate ${breakingChange.description}`,
            validation_script: breakingChange.validation,
            critical: true
          });
        }
      }
    }

    return checks;
  }

  /**
   * Generate prerequisites for migration
   */
  generatePrerequisites(changes) {
    const prerequisites = [];

    // Version requirements
    prerequisites.push({
      type: 'version_check',
      description: 'Verify current framework version',
      required_version: changes.from_version,
      validation: 'exact_match'
    });

    // Backup requirement
    prerequisites.push({
      type: 'backup_creation',
      description: 'Create full system backup before migration',
      backup_scope: 'full',
      verification_required: true
    });

    // Clean working directory
    prerequisites.push({
      type: 'clean_workspace',
      description: 'Ensure working directory is clean',
      requirements: [
        'no_uncommitted_changes',
        'no_untracked_files',
        'up_to_date_with_remote'
      ]
    });

    // Dependency installations
    if (changes.dependencies?.added?.length > 0) {
      prerequisites.push({
        type: 'dependency_preparation',
        description: 'Prepare for dependency installations',
        requirements: [
          'npm_registry_accessible',
          'sufficient_disk_space',
          'write_permissions'
        ]
      });
    }

    // Component-specific prerequisites
    if (changes.breaking_changes) {
      for (const breakingChange of changes.breaking_changes) {
        if (breakingChange.prerequisites) {
          prerequisites.push({
            type: 'component_prerequisite',
            description: `Prerequisites for ${breakingChange.description}`,
            requirements: breakingChange.prerequisites
          });
        }
      }
    }

    return prerequisites;
  }

  /**
   * Generate post-migration tasks
   */
  generatePostMigrationTasks(changes) {
    const tasks = [];

    // System validation
    tasks.push({
      type: 'system_validation',
      description: 'Validate system functionality after migration',
      tests: [
        'framework_initialization',
        'component_loading',
        'basic_operations',
        'configuration_validity'
      ]
    });

    // Performance verification
    tasks.push({
      type: 'performance_check',
      description: 'Verify performance after migration',
      benchmarks: [
        'startup_time',
        'memory_usage',
        'operation_latency'
      ]
    });

    // Update documentation
    if (changes.documentation_updates) {
      tasks.push({
        type: 'documentation_update',
        description: 'Update project documentation',
        files: changes.documentation_updates
      });
    }

    // Clean up temporary files
    tasks.push({
      type: 'cleanup',
      description: 'Clean up migration temporary files',
      targets: [
        '.aios/migration-temp',
        '*.migration-backup',
        '.aios/migration-logs'
      ]
    });

    // Version recording
    tasks.push({
      type: 'version_recording',
      description: 'Record successful migration',
      update_version_info: true,
      migration_log: true
    });

    return tasks;
  }

  /**
   * Analyze changes between versions
   */
  async analyzeVersionChanges(fromVersionInfo, toVersionInfo) {
    const changes = {
      from_version: fromVersionInfo.version,
      to_version: toVersionInfo.version,
      files: {
        added: [],
        modified: [],
        removed: [],
        moved: []
      },
      dependencies: {
        added: [],
        updated: [],
        removed: []
      },
      configuration: [],
      breaking_changes: toVersionInfo.breaking_changes || [],
      api_changes: toVersionInfo.api_changes || [],
      storage: []
    };

    // Compare component modifications
    const fromComponents = fromVersionInfo.components_modified || [];
    const toComponents = toVersionInfo.components_modified || [];

    // Find added components
    for (const component of toComponents) {
      if (!fromComponents.find(c => c.id === component.id)) {
        changes.files.added.push({
          path: component.file_path,
          type: 'component',
          component_type: component.type,
          template: component.template
        });
      }
    }

    // Find modified components
    for (const toComponent of toComponents) {
      const fromComponent = fromComponents.find(c => c.id === toComponent.id);
      if (fromComponent && fromComponent.checksum !== toComponent.checksum) {
        changes.files.modified.push({
          path: toComponent.file_path,
          type: 'component',
          migration_type: this.determineMigrationType(fromComponent, toComponent),
          changes: toComponent.changes || [],
          migration_guidance: this.generateMigrationGuidance(fromComponent, toComponent)
        });
      }
    }

    // Find removed components
    for (const component of fromComponents) {
      if (!toComponents.find(c => c.id === component.id)) {
        changes.files.removed.push({
          path: component.file_path,
          type: 'component',
          reason: 'deprecated'
        });
      }
    }

    return changes;
  }

  /**
   * Calculate migration duration
   */
  calculateMigrationDuration(operations) {
    let totalMinutes = 0;

    const operationTimes = {
      create_file: 1,
      update_file: 2,
      move_file: 2,
      archive_file: 1,
      install_dependency: 3,
      update_dependency: 4,
      remove_dependency: 2,
      update_configuration: 2,
      breaking_change: 10,
      migrate_storage: 15,
      manual_review: 30
    };

    for (const operation of operations) {
      totalMinutes += operationTimes[operation.type] || 5;
    }

    // Add base overhead
    totalMinutes += 10;

    return Math.ceil(totalMinutes);
  }

  /**
   * Assess migration risk level
   */
  assessMigrationRisk(changes, operations) {
    let riskScore = 0;

    // Breaking changes increase risk
    riskScore += (changes.breaking_changes?.length || 0) * 3;

    // File modifications
    riskScore += (changes.files?.modified?.length || 0) * 1;

    // Dependency updates
    riskScore += (changes.dependencies?.updated?.length || 0) * 2;

    // Manual operations
    const manualOps = operations.filter(op => op.type === 'manual_review').length;
    riskScore += manualOps * 5;

    // Storage migrations
    const storageOps = operations.filter(op => op.type === 'migrate_storage').length;
    riskScore += storageOps * 10;

    if (riskScore >= 20) return 'high';
    if (riskScore >= 10) return 'medium';
    return 'low';
  }

  /**
   * Save migration script to file
   */
  async saveMigrationScript(migrationScript) {
    const migrationsDir = path.join(this.rootPath, '.aios', 'migrations');
    await fs.mkdir(migrationsDir, { recursive: true });

    const scriptFilename = `${migrationScript.from_version}-to-${migrationScript.to_version}.json`;
    const scriptPath = path.join(migrationsDir, scriptFilename);

    const scriptContent = JSON.stringify(migrationScript, null, 2);
    await fs.writeFile(scriptPath, scriptContent);

    return scriptPath;
  }

  /**
   * Get version information
   */
  async getVersionInfo(version) {
    if (this.versionTracker) {
      const versionInfo = await this.versionTracker.getVersionHistory({ limit: 100 });
      const foundVersion = versionInfo.versions.find(v => v.version === version);
      
      if (foundVersion) {
        return foundVersion;
      }
    }

    // Return basic version info if not found
    return {
      version,
      components_modified: [],
      breaking_changes: [],
      api_changes: []
    };
  }

  /**
   * Determine migration type for component changes
   */
  determineMigrationType(fromComponent, toComponent) {
    // Simple heuristic based on change complexity
    const changeCount = toComponent.changes?.length || 0;
    const hasBreakingChanges = toComponent.breaking_changes?.length > 0;

    if (hasBreakingChanges || changeCount > 10) {
      return 'manual';
    }

    return 'automatic';
  }

  /**
   * Generate migration guidance for manual changes
   */
  generateMigrationGuidance(fromComponent, toComponent) {
    const guidance = [];

    if (toComponent.breaking_changes?.length > 0) {
      guidance.push('This component has breaking changes that require manual review.');
      guidance.push('Review the following breaking changes:');
      toComponent.breaking_changes.forEach(change => {
        guidance.push(`- ${change}`);
      });
    }

    if (toComponent.changes?.length > 10) {
      guidance.push('This component has extensive changes.');
      guidance.push('Carefully review all modifications before applying.');
    }

    guidance.push('Test component functionality after migration.');

    return guidance;
  }

  /**
   * Get backup targets from changes
   */
  getBackupTargets(changes) {
    const targets = [];

    if (changes.files) {
      targets.push(...(changes.files.modified || []).map(f => f.path));
      targets.push(...(changes.files.moved || []).map(f => f.from));
    }

    return [...new Set(targets)];
  }

  /**
   * Initialize migration templates
   */
  initializeMigrationTemplates() {
    return {
      file_operations: {
        create_file: {
          description: 'Create new file from template or content',
          parameters: ['target', 'content', 'template'],
          rollback: 'delete_file'
        },
        update_file: {
          description: 'Update existing file with changes',
          parameters: ['target', 'changes', 'backup_original'],
          rollback: 'restore_backup'
        },
        move_file: {
          description: 'Move or rename file',
          parameters: ['source', 'target', 'update_references'],
          rollback: 'move_file_reverse'
        },
        archive_file: {
          description: 'Archive file to deprecated location',
          parameters: ['target', 'archive_location'],
          rollback: 'restore_file'
        }
      },
      dependency_operations: {
        install_dependency: {
          description: 'Install new npm dependency',
          parameters: ['package', 'version', 'dev'],
          rollback: 'uninstall_dependency'
        },
        update_dependency: {
          description: 'Update existing dependency',
          parameters: ['package', 'from_version', 'to_version'],
          rollback: 'downgrade_dependency'
        },
        remove_dependency: {
          description: 'Remove deprecated dependency',
          parameters: ['package', 'replacement'],
          rollback: 'reinstall_dependency'
        }
      }
    };
  }
}

module.exports = MigrationGenerator;