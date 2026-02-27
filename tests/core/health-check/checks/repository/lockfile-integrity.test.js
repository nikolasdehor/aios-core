/**
 * Unit tests for LockfileIntegrityCheck
 *
 * Tests lockfile sync verification: package.json/package-lock.json comparison,
 * missing packages detection, invalid JSON, and healer configuration.
 */

const fs = require('fs').promises;
const LockfileIntegrityCheck = require('../../../../../.aios-core/core/health-check/checks/repository/lockfile-integrity');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('LockfileIntegrityCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new LockfileIntegrityCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('repository.lockfile-integrity');
    });

    test('has HIGH severity', () => {
      expect(check.severity).toBe('HIGH');
    });

    test('is cacheable', () => {
      expect(check.cacheable).toBe(true);
    });

    test('has healingTier 2', () => {
      expect(check.healingTier).toBe(2);
    });
  });

  // ============================================================
  // execute - in sync
  // ============================================================
  describe('execute - pass', () => {
    test('passes when lockfile is in sync', async () => {
      const packageJson = {
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { jest: '^29.0.0' },
      };
      const lockfile = {
        lockfileVersion: 3,
        packages: {
          '': { dependencies: { lodash: '^4.17.21' }, devDependencies: { jest: '^29.0.0' } },
          'node_modules/lodash': { version: '4.17.21' },
          'node_modules/jest': { version: '29.7.0' },
        },
      };

      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('package-lock')) return Promise.resolve(JSON.stringify(lockfile));
        return Promise.resolve(JSON.stringify(packageJson));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('in sync');
    });

    test('passes when no package.json exists', async () => {
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      fs.readFile.mockRejectedValue(err);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('skipped');
    });
  });

  // ============================================================
  // execute - fail (missing lockfile)
  // ============================================================
  describe('execute - fail', () => {
    test('fails when lockfile not found', async () => {
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('package-lock')) {
          const err = new Error('ENOENT');
          err.code = 'ENOENT';
          return Promise.reject(err);
        }
        return Promise.resolve(JSON.stringify({ dependencies: {} }));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not found');
      expect(result.recommendation).toContain('npm install');
    });

    test('fails when lockfile has invalid JSON', async () => {
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('package-lock')) return Promise.resolve('not json{');
        return Promise.resolve(JSON.stringify({ dependencies: {} }));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('invalid JSON');
    });

    test('fails when packages are missing from lockfile', async () => {
      const packageJson = {
        dependencies: { lodash: '^4.17.21', express: '^4.18.0' },
      };
      const lockfile = {
        lockfileVersion: 3,
        packages: {
          '': { dependencies: { lodash: '^4.17.21' } },
          'node_modules/lodash': { version: '4.17.21' },
        },
      };

      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('package-lock')) return Promise.resolve(JSON.stringify(lockfile));
        return Promise.resolve(JSON.stringify(packageJson));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('out of sync');
      expect(result.message).toContain('1 package');
      expect(result.details.missingPackages).toContain('express');
    });
  });

  // ============================================================
  // execute - error
  // ============================================================
  describe('execute - error', () => {
    test('returns error when unexpected exception in outer try', async () => {
      // Inner try/catches handle fs errors; to trigger outer catch
      // we force this.pass to throw after successful execution
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('package-lock')) {
          return Promise.resolve(JSON.stringify({
            lockfileVersion: 3,
            packages: { '': { dependencies: {} } },
          }));
        }
        return Promise.resolve(JSON.stringify({ dependencies: {} }));
      });

      jest.spyOn(check, 'pass').mockImplementation(() => {
        throw new Error('unexpected internal error');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('unexpected internal error');

      check.pass.mockRestore();
    });
  });

  // ============================================================
  // getHealer
  // ============================================================
  describe('getHealer', () => {
    test('returns regenerate lockfile healer', () => {
      const healer = check.getHealer();
      expect(healer.name).toBe('npm-install-lockfile');
      expect(healer.action).toBe('regenerate-lockfile');
      expect(healer.risk).toBe('low');
      expect(typeof healer.fix).toBe('function');
    });
  });
});
