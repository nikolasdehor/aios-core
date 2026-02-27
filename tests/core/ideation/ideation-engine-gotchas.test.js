'use strict';

/**
 * Regression test for GotchasMemory import in IdeationEngine.
 *
 * Verifies that the constructor correctly uses the named export
 * ({ GotchasMemory }) instead of the raw module object.
 * See: https://github.com/SynkraAI/aios-core/issues/517
 */

const path = require('path');

// Mock fs and child_process to prevent real filesystem access
jest.mock('fs');
jest.mock('child_process');

describe('IdeationEngine — GotchasMemory import regression (#517)', () => {
  let IdeationEngine;
  let GotchasMemory;

  beforeEach(() => {
    jest.resetModules();
  });

  test('auto-creates GotchasMemory instance when config.gotchasMemory is omitted', () => {
    // Require fresh to get the module-level import
    IdeationEngine = require('../../../.aios-core/core/ideation/ideation-engine');
    ({ GotchasMemory } = require('../../../.aios-core/core/memory/gotchas-memory'));

    const engine = new IdeationEngine({ rootPath: '/tmp/test' });

    // Before the fix, gotchasMemory was always null because
    // the bare require() returned the module object, not the class
    expect(engine.gotchasMemory).not.toBeNull();
    expect(engine.gotchasMemory).toBeInstanceOf(GotchasMemory);
  });

  test('uses provided gotchasMemory when passed via config', () => {
    IdeationEngine = require('../../../.aios-core/core/ideation/ideation-engine');

    const customMemory = { getAll: jest.fn().mockReturnValue([]) };
    const engine = new IdeationEngine({
      rootPath: '/tmp/test',
      gotchasMemory: customMemory,
    });

    expect(engine.gotchasMemory).toBe(customMemory);
  });

  test('sets gotchasMemory to null when module fails to load', () => {
    // Mock the gotchas-memory module to throw on require
    jest.doMock('../../../.aios-core/core/memory/gotchas-memory', () => {
      throw new Error('Module not found');
    });

    // Suppress the expected console.warn
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    IdeationEngine = require('../../../.aios-core/core/ideation/ideation-engine');
    const engine = new IdeationEngine({ rootPath: '/tmp/test' });

    expect(engine.gotchasMemory).toBeNull();

    console.warn.mockRestore();
  });
});
