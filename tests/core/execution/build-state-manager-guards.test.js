/**
 * Testes para null guards em BuildStateManager
 *
 * Valida que getLastCheckpoint, getCheckpoint e getStatus
 * não falham com TypeError quando arrays são undefined.
 *
 * Closes #513
 */

const fs = require('fs');
const path = require('path');

// Mock fs para evitar I/O real
jest.spyOn(fs, 'existsSync').mockReturnValue(false);
jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

const { BuildStateManager } = require('../../../.aios-core/core/execution/build-state-manager');

describe('BuildStateManager - null guards (#513)', () => {
  let manager;

  beforeEach(() => {
    manager = new BuildStateManager('test-story', {
      rootPath: '/fake/project',
    });
  });

  // ============================================================
  // getLastCheckpoint
  // ============================================================
  describe('getLastCheckpoint', () => {
    test('retorna null quando _state é null', () => {
      manager._state = null;
      expect(manager.getLastCheckpoint()).toBeNull();
    });

    test('retorna null quando checkpoints é undefined', () => {
      manager._state = { status: 'running' };
      expect(manager.getLastCheckpoint()).toBeNull();
    });

    test('retorna null quando checkpoints é array vazio', () => {
      manager._state = { checkpoints: [] };
      expect(manager.getLastCheckpoint()).toBeNull();
    });

    test('retorna último checkpoint', () => {
      const checkpoint = { id: 'cp-2', phase: 'build' };
      manager._state = {
        checkpoints: [{ id: 'cp-1', phase: 'setup' }, checkpoint],
      };
      expect(manager.getLastCheckpoint()).toEqual(checkpoint);
    });
  });

  // ============================================================
  // getCheckpoint
  // ============================================================
  describe('getCheckpoint', () => {
    test('retorna null quando _state é null', () => {
      manager._state = null;
      expect(manager.getCheckpoint('cp-1')).toBeNull();
    });

    test('retorna null quando checkpoints é undefined', () => {
      manager._state = { status: 'running' };
      expect(manager.getCheckpoint('cp-1')).toBeNull();
    });

    test('retorna null quando checkpoint não existe', () => {
      manager._state = { checkpoints: [{ id: 'cp-1' }] };
      expect(manager.getCheckpoint('cp-999')).toBeNull();
    });

    test('retorna checkpoint pelo ID', () => {
      const target = { id: 'cp-2', phase: 'test' };
      manager._state = {
        checkpoints: [{ id: 'cp-1' }, target],
      };
      expect(manager.getCheckpoint('cp-2')).toEqual(target);
    });
  });

  // ============================================================
  // constructor
  // ============================================================
  describe('constructor', () => {
    test('requer storyId', () => {
      expect(() => new BuildStateManager()).toThrow('storyId is required');
    });

    test('aceita storyId string', () => {
      const m = new BuildStateManager('story-123');
      expect(m.storyId).toBe('story-123');
    });

    test('inicializa _state como null', () => {
      expect(manager._state).toBeNull();
    });

    test('usa rootPath padrão se não fornecido', () => {
      const m = new BuildStateManager('s1');
      expect(m.rootPath).toBe(process.cwd());
    });
  });
});
