/**
 * Unit tests for ApiEndpointsCheck
 *
 * Tests API endpoint connectivity: HTTPS HEAD requests, response times,
 * critical vs non-critical failures, status code handling, and edge cases.
 */

const https = require('https');
const ApiEndpointsCheck = require('../../../../../.aios-core/core/health-check/checks/services/api-endpoints');

jest.mock('https');

describe('ApiEndpointsCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new ApiEndpointsCheck();
  });

  function mockRequest(statusCode) {
    https.request.mockImplementation((_opts, callback) => {
      const req = {
        on: jest.fn(),
        end: jest.fn(),
        destroy: jest.fn(),
      };
      process.nextTick(() => callback({ statusCode }));
      return req;
    });
  }

  function mockRequestError(errorMsg) {
    https.request.mockImplementation((_opts, _callback) => {
      const req = {
        on: jest.fn(),
        end: jest.fn(),
        destroy: jest.fn(),
      };
      process.nextTick(() => {
        const errorHandler = req.on.mock.calls.find((c) => c[0] === 'error');
        if (errorHandler) errorHandler[1](new Error(errorMsg));
      });
      return req;
    });
  }

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('services.api-endpoints');
    });

    test('has LOW severity', () => {
      expect(check.severity).toBe('LOW');
    });
  });

  describe('execute - all reachable', () => {
    test('passes when all endpoints respond 200', async () => {
      mockRequest(200);

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('2');
      expect(result.message).toContain('reachable');
    });

    test('passes when endpoint returns 401 (auth required but reachable)', async () => {
      mockRequest(401);

      const result = await check.execute({});
      expect(result.status).toBe('pass');
    });

    test('passes when endpoint returns 403', async () => {
      mockRequest(403);

      const result = await check.execute({});
      expect(result.status).toBe('pass');
    });
  });

  describe('execute - critical failure', () => {
    test('fails when critical endpoint (npm) is unreachable', async () => {
      mockRequestError('ECONNREFUSED');

      const result = await check.execute({});
      expect(result.status).toBe('fail');
      expect(result.message).toContain('npm Registry');
    });
  });

  describe('execute - non-critical failure only', () => {
    test('warns when only non-critical endpoints fail', async () => {
      let callIndex = 0;
      https.request.mockImplementation((_opts, callback) => {
        const idx = callIndex++;
        const req = {
          on: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
        process.nextTick(() => {
          if (idx === 0) {
            callback({ statusCode: 200 });
          } else {
            const errorHandler = req.on.mock.calls.find((c) => c[0] === 'error');
            if (errorHandler) errorHandler[1](new Error('timeout'));
          }
        });
        return req;
      });

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('GitHub API');
    });
  });

  describe('execute - bad status codes', () => {
    test('treats 500 as failure', async () => {
      mockRequest(500);

      const result = await check.execute({});
      expect(result.status).toBe('fail');
    });
  });

  describe('checkEndpoint', () => {
    test('resolves with response time on success', async () => {
      mockRequest(200);

      const time = await check.checkEndpoint('example.com', '/');
      expect(typeof time).toBe('number');
    });

    test('rejects on timeout', async () => {
      https.request.mockImplementation(() => {
        const req = {
          on: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
        process.nextTick(() => {
          const timeoutHandler = req.on.mock.calls.find((c) => c[0] === 'timeout');
          if (timeoutHandler) timeoutHandler[1]();
        });
        return req;
      });

      await expect(check.checkEndpoint('slow.com', '/')).rejects.toThrow('Timeout');
    });
  });

  describe('getHealer', () => {
    test('returns manual guide', () => {
      const healer = check.getHealer();
      expect(healer.action).toBe('manual');
      expect(healer.steps.length).toBeGreaterThan(0);
    });
  });
});
