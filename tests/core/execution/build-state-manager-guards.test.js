/**
 * Testes para null guards em BuildStateManager
 *
 * Valida que getLastCheckpoint, getCheckpoint, getStatus,
 * getNotifications, acknowledgeNotification e recordFailure
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

  // ============================================================
  // getStatus - null guards para arrays opcionais
  // ============================================================
  describe('getStatus', () => {
    test('retorna exists:false quando loadState retorna null', () => {
      jest.spyOn(manager, 'loadState').mockReturnValue(null);
      const status = manager.getStatus();
      expect(status.exists).toBe(false);
    });

    test('calcula recentFailures com failedAttempts undefined', () => {
      jest.spyOn(manager, 'loadState').mockReturnValue({
        status: 'running',
        startedAt: new Date().toISOString(),
        currentPhase: 'build',
        currentSubtask: null,
        metrics: { completedSubtasks: 0, totalSubtasks: 1, totalFailures: 0, totalAttempts: 0 },
        worktree: null,
        lastCheckpoint: null,
      });
      jest.spyOn(manager, '_checkAbandoned').mockReturnValue(false);
      const status = manager.getStatus();
      expect(status.recentFailures).toEqual([]);
      expect(status.checkpointCount).toBe(0);
      expect(status.notificationCount).toBe(0);
    });

    test('calcula checkpointCount e notificationCount com arrays presentes', () => {
      jest.spyOn(manager, 'loadState').mockReturnValue({
        status: 'running',
        startedAt: new Date().toISOString(),
        currentPhase: 'build',
        currentSubtask: null,
        metrics: { completedSubtasks: 0, totalSubtasks: 1, totalFailures: 0, totalAttempts: 0 },
        worktree: null,
        lastCheckpoint: null,
        checkpoints: [{ id: 'cp-1' }, { id: 'cp-2' }],
        notifications: [
          { acknowledged: false },
          { acknowledged: true },
          { acknowledged: false },
        ],
        failedAttempts: [{ subtaskId: 'a' }, { subtaskId: 'b' }],
      });
      jest.spyOn(manager, '_checkAbandoned').mockReturnValue(false);
      const status = manager.getStatus();
      expect(status.checkpointCount).toBe(2);
      expect(status.notificationCount).toBe(2);
      expect(status.recentFailures).toHaveLength(2);
    });
  });

  // ============================================================
  // getNotifications - null guard
  // ============================================================
  describe('getNotifications', () => {
    test('retorna array vazio quando _state é null', () => {
      manager._state = null;
      expect(manager.getNotifications()).toEqual([]);
    });

    test('retorna array vazio quando notifications é undefined', () => {
      manager._state = { status: 'running' };
      expect(manager.getNotifications()).toEqual([]);
    });

    test('filtra apenas não-acknowledged', () => {
      manager._state = {
        notifications: [
          { message: 'a', acknowledged: false },
          { message: 'b', acknowledged: true },
          { message: 'c', acknowledged: false },
        ],
      };
      const result = manager.getNotifications();
      expect(result).toHaveLength(2);
      expect(result[0].message).toBe('a');
      expect(result[1].message).toBe('c');
    });
  });

  // ============================================================
  // acknowledgeNotification - null guard
  // ============================================================
  describe('acknowledgeNotification', () => {
    test('não falha quando _state é null', () => {
      manager._state = null;
      expect(() => manager.acknowledgeNotification(0)).not.toThrow();
    });

    test('não falha quando notifications é undefined', () => {
      manager._state = { status: 'running' };
      expect(() => manager.acknowledgeNotification(0)).not.toThrow();
    });

    test('não falha com índice inválido', () => {
      manager._state = { notifications: [{ acknowledged: false }] };
      jest.spyOn(manager, 'saveState').mockImplementation(() => {});
      expect(() => manager.acknowledgeNotification(99)).not.toThrow();
    });

    test('marca notification como acknowledged', () => {
      manager._state = {
        notifications: [
          { message: 'alerta', acknowledged: false },
        ],
      };
      jest.spyOn(manager, 'saveState').mockImplementation(() => {});
      manager.acknowledgeNotification(0);
      expect(manager._state.notifications[0].acknowledged).toBe(true);
    });
  });

  // ============================================================
  // recordFailure - failedAttempts null guard
  // ============================================================
  describe('recordFailure', () => {
    test('inicializa failedAttempts quando undefined', () => {
      manager._state = {
        status: 'running',
        metrics: { totalFailures: 0, totalAttempts: 0 },
        notifications: [],
      };
      jest.spyOn(manager, 'saveState').mockImplementation(() => {});
      jest.spyOn(manager, '_logAttempt').mockImplementation(() => {});

      const result = manager.recordFailure('subtask-1', { error: 'test error' });
      expect(result.failure.subtaskId).toBe('subtask-1');
      expect(manager._state.failedAttempts).toHaveLength(1);
    });
  });
});
