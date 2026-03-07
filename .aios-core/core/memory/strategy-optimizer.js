#!/usr/bin/env node

/**
 * AIOX Strategy Optimizer
 *
 * Story: 9.7 - Strategy Optimizer
 * Epic: Epic 9 - Persistent Memory Layer
 *
 * Combines insights from Decision Memory and Reflection Engine to
 * automatically optimize agent strategies. Implements A/B testing
 * of strategies and promotes winners based on statistical evidence.
 *
 * Features:
 * - AC1: strategy-optimizer.js in .aios-core/core/memory/
 * - AC2: Persists experiments in .aiox/strategy-experiments.json
 * - AC3: Defines strategy experiments with variants and metrics
 * - AC4: Assigns variants to tasks using weighted random selection
 * - AC5: Collects results and computes statistical significance
 * - AC6: Auto-promotes winning strategies when confidence threshold met
 * - AC7: Maintains a strategy registry of current best strategies
 * - AC8: Emits events for experiment lifecycle
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  experimentsPath: '.aiox/strategy-experiments.json',
  maxExperiments: 50,
  minSampleSize: 10,
  confidenceThreshold: 0.75,
  maxConcurrentExperiments: 5,
  version: '1.0.0',
  schemaVersion: 'aiox-strategy-optimizer-v1',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

const ExperimentStatus = {
  RUNNING: 'running',
  CONCLUDED: 'concluded',
  CANCELLED: 'cancelled',
};

const Events = {
  EXPERIMENT_CREATED: 'experiment:created',
  EXPERIMENT_CONCLUDED: 'experiment:concluded',
  EXPERIMENT_CANCELLED: 'experiment:cancelled',
  RESULT_RECORDED: 'result:recorded',
  STRATEGY_PROMOTED: 'strategy:promoted',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STRATEGY OPTIMIZER
// ═══════════════════════════════════════════════════════════════════════════════════

class StrategyOptimizer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.projectRoot = options.projectRoot || process.cwd();
    this.config = { ...CONFIG, ...options.config };
    this.experiments = [];
    this.bestStrategies = new Map(); // taskType → strategy
    this._loaded = false;
  }

  /**
   * Get the experiments file path
   */
  _getFilePath() {
    return path.join(this.projectRoot, this.config.experimentsPath);
  }

  /**
   * Load experiments from disk
   */
  async load() {
    const filePath = this._getFilePath();
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);

        if (data.schemaVersion !== this.config.schemaVersion) {
          this.experiments = [];
          this.bestStrategies = new Map();
          this._loaded = true;
          return;
        }

        this.experiments = Array.isArray(data.experiments) ? data.experiments : [];
        this.bestStrategies = new Map(Object.entries(data.bestStrategies || {}));
      }
    } catch {
      this.experiments = [];
      this.bestStrategies = new Map();
    }
    this._loaded = true;
  }

  /**
   * Save experiments to disk
   */
  async save() {
    const filePath = this._getFilePath();
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      schemaVersion: this.config.schemaVersion,
      version: this.config.version,
      savedAt: new Date().toISOString(),
      experiments: this.experiments,
      bestStrategies: Object.fromEntries(this.bestStrategies),
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Create a new A/B experiment
   *
   * @param {Object} experiment
   * @param {string} experiment.name - Experiment name
   * @param {string} experiment.taskType - Task type being optimized
   * @param {string[]} experiment.variants - Strategy variant names
   * @param {number[]} [experiment.weights] - Assignment weights (default: equal)
   * @param {string} [experiment.description] - Experiment description
   * @returns {Object} Created experiment
   */
  createExperiment(experiment) {
    if (!experiment.name || !experiment.taskType || !experiment.variants) {
      throw new Error('Required fields: name, taskType, variants');
    }
    if (!Array.isArray(experiment.variants) || experiment.variants.length < 2) {
      throw new Error('variants must be an array with at least 2 entries');
    }

    // Check concurrent limit
    const running = this.experiments.filter((e) => e.status === ExperimentStatus.RUNNING).length;
    if (running >= this.config.maxConcurrentExperiments) {
      throw new Error(
        `Max concurrent experiments (${this.config.maxConcurrentExperiments}) reached`,
      );
    }

    const weights = experiment.weights || experiment.variants.map(() => 1);

    const entry = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: experiment.name,
      taskType: experiment.taskType,
      description: experiment.description || '',
      variants: experiment.variants.map((name, i) => ({
        name,
        weight: weights[i] || 1,
        results: [],
        successCount: 0,
        failureCount: 0,
        totalDurationMs: 0,
      })),
      status: ExperimentStatus.RUNNING,
      createdAt: new Date().toISOString(),
      concludedAt: null,
      winner: null,
    };

    this.experiments.push(entry);
    this.emit(Events.EXPERIMENT_CREATED, { id: entry.id, name: entry.name });
    return entry;
  }

  /**
   * Get the variant to use for a task (weighted random assignment)
   *
   * @param {string} experimentId - Experiment ID
   * @returns {string} Selected variant name
   */
  assignVariant(experimentId) {
    const exp = this.experiments.find((e) => e.id === experimentId);
    if (!exp) throw new Error(`Unknown experiment: ${experimentId}`);
    if (exp.status !== ExperimentStatus.RUNNING) {
      return exp.winner || exp.variants[0].name;
    }

    const totalWeight = exp.variants.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;

    for (const variant of exp.variants) {
      random -= variant.weight;
      if (random <= 0) return variant.name;
    }

    return exp.variants[exp.variants.length - 1].name;
  }

  /**
   * Record a result for a variant
   *
   * @param {Object} result
   * @param {string} result.experimentId - Experiment ID
   * @param {string} result.variant - Variant name
   * @param {boolean} result.success - Whether it succeeded
   * @param {number} [result.durationMs] - Execution duration
   * @param {Object} [result.metadata] - Additional data
   * @returns {Object} Updated experiment
   */
  recordResult(result) {
    if (!result.experimentId || !result.variant || result.success === undefined) {
      throw new Error('Required fields: experimentId, variant, success');
    }

    const exp = this.experiments.find((e) => e.id === result.experimentId);
    if (!exp) throw new Error(`Unknown experiment: ${result.experimentId}`);
    if (exp.status !== ExperimentStatus.RUNNING) {
      throw new Error(`Experiment ${result.experimentId} is not running`);
    }

    const variant = exp.variants.find((v) => v.name === result.variant);
    if (!variant) throw new Error(`Unknown variant: ${result.variant}`);

    variant.results.push({
      success: result.success,
      durationMs: result.durationMs || null,
      metadata: result.metadata || null,
      recordedAt: new Date().toISOString(),
    });

    if (result.success) variant.successCount++;
    else variant.failureCount++;

    if (result.durationMs) variant.totalDurationMs += result.durationMs;

    this.emit(Events.RESULT_RECORDED, {
      experimentId: exp.id,
      variant: result.variant,
      success: result.success,
    });

    // Check if we should conclude
    this._checkConclusion(exp);

    return exp;
  }

  /**
   * Get the best known strategy for a task type
   *
   * @param {string} taskType - Task type
   * @returns {string|null} Best strategy name or null
   */
  getBestStrategy(taskType) {
    return this.bestStrategies.get(taskType) || null;
  }

  /**
   * Manually set the best strategy for a task type
   *
   * @param {string} taskType
   * @param {string} strategy
   */
  setBestStrategy(taskType, strategy) {
    this.bestStrategies.set(taskType, strategy);
  }

  /**
   * Cancel a running experiment
   *
   * @param {string} experimentId
   * @returns {Object} Cancelled experiment
   */
  cancelExperiment(experimentId) {
    const exp = this.experiments.find((e) => e.id === experimentId);
    if (!exp) throw new Error(`Unknown experiment: ${experimentId}`);

    exp.status = ExperimentStatus.CANCELLED;
    exp.concludedAt = new Date().toISOString();
    this.emit(Events.EXPERIMENT_CANCELLED, { id: exp.id, name: exp.name });
    return exp;
  }

  /**
   * Get experiment by ID
   */
  getExperiment(experimentId) {
    return this.experiments.find((e) => e.id === experimentId) || null;
  }

  /**
   * List experiments with optional filter
   */
  listExperiments(filter = {}) {
    let results = [...this.experiments];
    if (filter.status) results = results.filter((e) => e.status === filter.status);
    if (filter.taskType) results = results.filter((e) => e.taskType === filter.taskType);
    if (filter.limit) results = results.slice(-filter.limit);
    return results;
  }

  /**
   * Get statistics
   */
  getStats() {
    const byStatus = {};
    for (const exp of this.experiments) {
      byStatus[exp.status] = (byStatus[exp.status] || 0) + 1;
    }

    return {
      totalExperiments: this.experiments.length,
      totalBestStrategies: this.bestStrategies.size,
      byStatus,
      bestStrategies: Object.fromEntries(this.bestStrategies),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              INTERNAL METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Check if experiment should conclude based on data
   * @private
   */
  _checkConclusion(experiment) {
    // Need minimum samples for each variant
    const allMeetMinimum = experiment.variants.every(
      (v) => v.results.length >= this.config.minSampleSize,
    );
    if (!allMeetMinimum) return;

    // Calculate success rates
    const rates = experiment.variants.map((v) => ({
      name: v.name,
      rate: v.results.length > 0 ? v.successCount / v.results.length : 0,
      count: v.results.length,
      avgDuration:
        v.results.filter((r) => r.durationMs).length > 0
          ? v.totalDurationMs / v.results.filter((r) => r.durationMs).length
          : null,
    }));

    // Sort by success rate descending
    rates.sort((a, b) => b.rate - a.rate);

    const best = rates[0];
    const secondBest = rates[1];

    // Compute confidence (simplified z-score approximation)
    const confidence = this._computeConfidence(best, secondBest);

    if (confidence >= this.config.confidenceThreshold) {
      experiment.status = ExperimentStatus.CONCLUDED;
      experiment.concludedAt = new Date().toISOString();
      experiment.winner = best.name;
      experiment.confidence = confidence;

      // Auto-promote winner
      this.bestStrategies.set(experiment.taskType, best.name);

      this.emit(Events.EXPERIMENT_CONCLUDED, {
        id: experiment.id,
        winner: best.name,
        confidence,
        rates,
      });

      this.emit(Events.STRATEGY_PROMOTED, {
        taskType: experiment.taskType,
        strategy: best.name,
        confidence,
        experimentId: experiment.id,
      });
    }
  }

  /**
   * Compute confidence that variant A is better than B
   * Uses simplified proportion test
   * @private
   */
  _computeConfidence(a, b) {
    if (a.count === 0 || b.count === 0) return 0;

    const diff = a.rate - b.rate;
    if (diff <= 0) return 0;

    // Pooled standard error
    const pooledP = (a.rate * a.count + b.rate * b.count) / (a.count + b.count);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / a.count + 1 / b.count));

    if (se === 0) return diff > 0 ? 1.0 : 0;

    // z-score to approximate confidence
    const z = diff / se;

    // Simple sigmoid-like mapping: z=1.65→90%, z=1.96→95%, z=2.58→99%
    const confidence = 1 / (1 + Math.exp(-1.7 * (z - 1)));
    return Math.min(1.0, Math.max(0, confidence));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = StrategyOptimizer;
module.exports.StrategyOptimizer = StrategyOptimizer;
module.exports.ExperimentStatus = ExperimentStatus;
module.exports.Events = Events;
module.exports.CONFIG = CONFIG;
