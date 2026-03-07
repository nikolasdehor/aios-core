/**
 * Tests for Strategy Optimizer
 *
 * Story: 9.7 - Strategy Optimizer
 * Epic: Epic 9 - Persistent Memory Layer
 */

const fs = require('fs');
const path = require('path');
const StrategyOptimizer = require('../../../.aios-core/core/memory/strategy-optimizer');
const { ExperimentStatus, Events, CONFIG } = StrategyOptimizer;

const TEST_DIR = path.join(__dirname, '__test-strategy-optimizer__');

function createOptimizer(overrides = {}) {
  return new StrategyOptimizer({
    projectRoot: TEST_DIR,
    config: {
      experimentsPath: '.aiox/strategy-experiments.json',
      minSampleSize: 3,
      confidenceThreshold: 0.5,
      ...overrides,
    },
  });
}

beforeEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════════

describe('StrategyOptimizer - constructor', () => {
  test('initializes with defaults', () => {
    const opt = createOptimizer();
    expect(opt.experiments).toEqual([]);
    expect(opt.bestStrategies.size).toBe(0);
    expect(opt._loaded).toBe(false);
  });

  test('accepts custom config', () => {
    const opt = createOptimizer({ minSampleSize: 20 });
    expect(opt.config.minSampleSize).toBe(20);
  });

  test('is an EventEmitter', () => {
    const opt = createOptimizer();
    expect(typeof opt.on).toBe('function');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              LOAD / SAVE
// ═══════════════════════════════════════════════════════════════════════════════════

describe('StrategyOptimizer - load/save', () => {
  test('loads from empty state', async () => {
    const opt = createOptimizer();
    await opt.load();
    expect(opt._loaded).toBe(true);
    expect(opt.experiments).toEqual([]);
  });

  test('save and load round-trip', async () => {
    const opt1 = createOptimizer();
    await opt1.load();
    opt1.createExperiment({
      name: 'Test',
      taskType: 'implementation',
      variants: ['a', 'b'],
    });
    opt1.setBestStrategy('debugging', 'log-analysis');
    await opt1.save();

    const opt2 = createOptimizer();
    await opt2.load();
    expect(opt2.experiments).toHaveLength(1);
    expect(opt2.bestStrategies.get('debugging')).toBe('log-analysis');
  });

  test('handles corrupted file', async () => {
    const dir = path.join(TEST_DIR, '.aiox');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'strategy-experiments.json'), 'INVALID');

    const opt = createOptimizer();
    await opt.load();
    expect(opt.experiments).toEqual([]);
  });

  test('resets on schema mismatch', async () => {
    const dir = path.join(TEST_DIR, '.aiox');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'strategy-experiments.json'),
      JSON.stringify({ schemaVersion: 'old', experiments: [{ id: 'x' }] }),
    );

    const opt = createOptimizer();
    await opt.load();
    expect(opt.experiments).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CREATE EXPERIMENT
// ═══════════════════════════════════════════════════════════════════════════════════

describe('StrategyOptimizer - createExperiment', () => {
  test('creates experiment with variants', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'TDD vs Hack',
      taskType: 'implementation',
      variants: ['tdd', 'hack-first'],
      description: 'Testing which approach works better',
    });

    expect(exp.id).toMatch(/^exp_/);
    expect(exp.name).toBe('TDD vs Hack');
    expect(exp.variants).toHaveLength(2);
    expect(exp.status).toBe(ExperimentStatus.RUNNING);
    expect(exp.variants[0].name).toBe('tdd');
    expect(exp.variants[0].results).toEqual([]);
  });

  test('throws on missing required fields', () => {
    const opt = createOptimizer();
    expect(() => opt.createExperiment({})).toThrow('Required fields');
    expect(() =>
      opt.createExperiment({ name: 'X', taskType: 'Y' }),
    ).toThrow('Required fields');
  });

  test('throws on less than 2 variants', () => {
    const opt = createOptimizer();
    expect(() =>
      opt.createExperiment({ name: 'X', taskType: 'Y', variants: ['only-one'] }),
    ).toThrow('at least 2');
  });

  test('throws on max concurrent experiments', () => {
    const opt = createOptimizer({ maxConcurrentExperiments: 2 });

    opt.createExperiment({ name: 'E1', taskType: 't1', variants: ['a', 'b'] });
    opt.createExperiment({ name: 'E2', taskType: 't2', variants: ['a', 'b'] });

    expect(() =>
      opt.createExperiment({ name: 'E3', taskType: 't3', variants: ['a', 'b'] }),
    ).toThrow('Max concurrent');
  });

  test('emits EXPERIMENT_CREATED event', () => {
    const opt = createOptimizer();
    const handler = jest.fn();
    opt.on(Events.EXPERIMENT_CREATED, handler);

    opt.createExperiment({ name: 'Test', taskType: 'impl', variants: ['a', 'b'] });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('assigns equal weights by default', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b', 'c'],
    });

    expect(exp.variants.every((v) => v.weight === 1)).toBe(true);
  });

  test('accepts custom weights', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
      weights: [3, 1],
    });

    expect(exp.variants[0].weight).toBe(3);
    expect(exp.variants[1].weight).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ASSIGN VARIANT
// ═══════════════════════════════════════════════════════════════════════════════════

describe('StrategyOptimizer - assignVariant', () => {
  test('assigns a variant from running experiment', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
    });

    const assigned = opt.assignVariant(exp.id);
    expect(['a', 'b']).toContain(assigned);
  });

  test('throws for unknown experiment', () => {
    const opt = createOptimizer();
    expect(() => opt.assignVariant('fake-id')).toThrow('Unknown experiment');
  });

  test('returns winner for concluded experiment', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['winner', 'loser'],
    });
    exp.status = ExperimentStatus.CONCLUDED;
    exp.winner = 'winner';

    expect(opt.assignVariant(exp.id)).toBe('winner');
  });

  test('respects weights in assignment distribution', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['heavy', 'light'],
      weights: [99, 1],
    });

    // With 99:1 weight, most assignments should be 'heavy'
    const counts = { heavy: 0, light: 0 };
    for (let i = 0; i < 100; i++) {
      counts[opt.assignVariant(exp.id)]++;
    }
    expect(counts.heavy).toBeGreaterThan(80);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              RECORD RESULT
// ═══════════════════════════════════════════════════════════════════════════════════

describe('StrategyOptimizer - recordResult', () => {
  test('records success result', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
    });

    opt.recordResult({ experimentId: exp.id, variant: 'a', success: true, durationMs: 5000 });

    const variant = exp.variants.find((v) => v.name === 'a');
    expect(variant.results).toHaveLength(1);
    expect(variant.successCount).toBe(1);
    expect(variant.failureCount).toBe(0);
  });

  test('records failure result', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
    });

    opt.recordResult({ experimentId: exp.id, variant: 'b', success: false });
    const variant = exp.variants.find((v) => v.name === 'b');
    expect(variant.failureCount).toBe(1);
  });

  test('throws on missing fields', () => {
    const opt = createOptimizer();
    expect(() => opt.recordResult({})).toThrow('Required fields');
  });

  test('throws for unknown experiment', () => {
    const opt = createOptimizer();
    expect(() =>
      opt.recordResult({ experimentId: 'fake', variant: 'a', success: true }),
    ).toThrow('Unknown experiment');
  });

  test('throws for concluded experiment', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
    });
    exp.status = ExperimentStatus.CONCLUDED;

    expect(() =>
      opt.recordResult({ experimentId: exp.id, variant: 'a', success: true }),
    ).toThrow('not running');
  });

  test('throws for unknown variant', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
    });

    expect(() =>
      opt.recordResult({ experimentId: exp.id, variant: 'c', success: true }),
    ).toThrow('Unknown variant');
  });

  test('emits RESULT_RECORDED event', () => {
    const opt = createOptimizer();
    const handler = jest.fn();
    opt.on(Events.RESULT_RECORDED, handler);

    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
    });

    opt.recordResult({ experimentId: exp.id, variant: 'a', success: true });
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'a', success: true }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              AUTO-CONCLUSION
// ═══════════════════════════════════════════════════════════════════════════════════

describe('StrategyOptimizer - auto-conclusion', () => {
  test('concludes when clear winner with enough samples', () => {
    const opt = createOptimizer({ minSampleSize: 3, confidenceThreshold: 0.5 });
    const concludeHandler = jest.fn();
    const promoteHandler = jest.fn();
    opt.on(Events.EXPERIMENT_CONCLUDED, concludeHandler);
    opt.on(Events.STRATEGY_PROMOTED, promoteHandler);

    const exp = opt.createExperiment({
      name: 'TDD vs Hack',
      taskType: 'implementation',
      variants: ['tdd', 'hack'],
    });

    // TDD: 3 successes
    for (let i = 0; i < 3; i++) {
      opt.recordResult({ experimentId: exp.id, variant: 'tdd', success: true });
    }
    // Hack: 3 failures
    for (let i = 0; i < 3; i++) {
      opt.recordResult({ experimentId: exp.id, variant: 'hack', success: false });
    }

    expect(exp.status).toBe(ExperimentStatus.CONCLUDED);
    expect(exp.winner).toBe('tdd');
    expect(concludeHandler).toHaveBeenCalled();
    expect(promoteHandler).toHaveBeenCalledWith(
      expect.objectContaining({ taskType: 'implementation', strategy: 'tdd' }),
    );
  });

  test('promotes winner to bestStrategies', () => {
    const opt = createOptimizer({ minSampleSize: 3, confidenceThreshold: 0.5 });
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'debugging',
      variants: ['logs', 'debugger'],
    });

    for (let i = 0; i < 3; i++) {
      opt.recordResult({ experimentId: exp.id, variant: 'logs', success: true });
    }
    for (let i = 0; i < 3; i++) {
      opt.recordResult({ experimentId: exp.id, variant: 'debugger', success: false });
    }

    expect(opt.getBestStrategy('debugging')).toBe('logs');
  });

  test('does not conclude before minSampleSize', () => {
    const opt = createOptimizer({ minSampleSize: 5 });
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
    });

    for (let i = 0; i < 3; i++) {
      opt.recordResult({ experimentId: exp.id, variant: 'a', success: true });
      opt.recordResult({ experimentId: exp.id, variant: 'b', success: false });
    }

    expect(exp.status).toBe(ExperimentStatus.RUNNING); // Not enough samples
  });

  test('does not conclude when results are too close', () => {
    const opt = createOptimizer({ minSampleSize: 3, confidenceThreshold: 0.9 });
    const exp = opt.createExperiment({
      name: 'Close Race',
      taskType: 'impl',
      variants: ['a', 'b'],
    });

    // Nearly equal: 2/3 vs 1/3
    opt.recordResult({ experimentId: exp.id, variant: 'a', success: true });
    opt.recordResult({ experimentId: exp.id, variant: 'a', success: true });
    opt.recordResult({ experimentId: exp.id, variant: 'a', success: false });

    opt.recordResult({ experimentId: exp.id, variant: 'b', success: true });
    opt.recordResult({ experimentId: exp.id, variant: 'b', success: false });
    opt.recordResult({ experimentId: exp.id, variant: 'b', success: false });

    // With high confidence threshold, this should not conclude
    expect(exp.status).toBe(ExperimentStatus.RUNNING);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              BEST STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════════

describe('StrategyOptimizer - bestStrategies', () => {
  test('getBestStrategy returns null for unknown type', () => {
    const opt = createOptimizer();
    expect(opt.getBestStrategy('unknown')).toBeNull();
  });

  test('setBestStrategy works', () => {
    const opt = createOptimizer();
    opt.setBestStrategy('testing', 'property-based');
    expect(opt.getBestStrategy('testing')).toBe('property-based');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CANCEL
// ═══════════════════════════════════════════════════════════════════════════════════

describe('StrategyOptimizer - cancelExperiment', () => {
  test('cancels a running experiment', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
    });

    opt.cancelExperiment(exp.id);
    expect(exp.status).toBe(ExperimentStatus.CANCELLED);
    expect(exp.concludedAt).not.toBeNull();
  });

  test('emits EXPERIMENT_CANCELLED event', () => {
    const opt = createOptimizer();
    const handler = jest.fn();
    opt.on(Events.EXPERIMENT_CANCELLED, handler);

    const exp = opt.createExperiment({
      name: 'Test',
      taskType: 'impl',
      variants: ['a', 'b'],
    });

    opt.cancelExperiment(exp.id);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('throws for unknown experiment', () => {
    const opt = createOptimizer();
    expect(() => opt.cancelExperiment('fake')).toThrow('Unknown experiment');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              LIST & STATS
// ═══════════════════════════════════════════════════════════════════════════════════

describe('StrategyOptimizer - listExperiments', () => {
  test('lists all experiments', () => {
    const opt = createOptimizer();
    opt.createExperiment({ name: 'E1', taskType: 't1', variants: ['a', 'b'] });
    opt.createExperiment({ name: 'E2', taskType: 't2', variants: ['a', 'b'] });

    expect(opt.listExperiments()).toHaveLength(2);
  });

  test('filters by status', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({ name: 'E1', taskType: 't1', variants: ['a', 'b'] });
    opt.createExperiment({ name: 'E2', taskType: 't2', variants: ['a', 'b'] });
    opt.cancelExperiment(exp.id);

    expect(opt.listExperiments({ status: ExperimentStatus.RUNNING })).toHaveLength(1);
    expect(opt.listExperiments({ status: ExperimentStatus.CANCELLED })).toHaveLength(1);
  });

  test('filters by taskType', () => {
    const opt = createOptimizer();
    opt.createExperiment({ name: 'E1', taskType: 'impl', variants: ['a', 'b'] });
    opt.createExperiment({ name: 'E2', taskType: 'debug', variants: ['a', 'b'] });

    expect(opt.listExperiments({ taskType: 'impl' })).toHaveLength(1);
  });

  test('applies limit', () => {
    const opt = createOptimizer();
    for (let i = 0; i < 5; i++) {
      opt.createExperiment({ name: `E${i}`, taskType: `t${i}`, variants: ['a', 'b'] });
    }
    expect(opt.listExperiments({ limit: 2 })).toHaveLength(2);
  });
});

describe('StrategyOptimizer - getStats', () => {
  test('returns stats', () => {
    const opt = createOptimizer();
    opt.createExperiment({ name: 'E1', taskType: 't1', variants: ['a', 'b'] });
    opt.setBestStrategy('impl', 'tdd');

    const stats = opt.getStats();
    expect(stats.totalExperiments).toBe(1);
    expect(stats.totalBestStrategies).toBe(1);
    expect(stats.byStatus[ExperimentStatus.RUNNING]).toBe(1);
  });
});

describe('StrategyOptimizer - getExperiment', () => {
  test('returns experiment by id', () => {
    const opt = createOptimizer();
    const exp = opt.createExperiment({ name: 'E1', taskType: 't1', variants: ['a', 'b'] });
    expect(opt.getExperiment(exp.id)).toBe(exp);
  });

  test('returns null for unknown id', () => {
    const opt = createOptimizer();
    expect(opt.getExperiment('fake')).toBeNull();
  });
});
