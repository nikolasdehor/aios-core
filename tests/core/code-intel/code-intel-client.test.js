'use strict';

/**
 * CodeIntelClient Tests
 *
 * Tests for the central code intelligence client module.
 * Covers provider detection, circuit breaker, cache, metrics,
 * and all 8 capability proxy methods.
 *
 * @version 1.0.0
 */

// RegistryProvider — T1, mocked as unavailable so CodeGraph is the active provider
jest.mock('../../../.aios-core/core/code-intel/providers/registry-provider', () => ({
  RegistryProvider: jest.fn().mockImplementation((opts) => ({
    name: 'registry',
    options: opts,
    isAvailable: jest.fn().mockReturnValue(false),
    findDefinition: jest.fn(),
    findReferences: jest.fn(),
    findCallers: jest.fn(),
    findCallees: jest.fn(),
    analyzeDependencies: jest.fn(),
    analyzeComplexity: jest.fn(),
    analyzeCodebase: jest.fn(),
    getProjectStats: jest.fn(),
  })),
}));

jest.mock('../../../.aios-core/core/code-intel/providers/code-graph-provider', () => ({
  CodeGraphProvider: jest.fn().mockImplementation((opts) => ({
    name: 'code-graph',
    options: opts,
    // isAvailable: true when mcpCallFn is configured (matches new polymorphic detection)
    isAvailable: jest.fn().mockReturnValue(
      typeof opts.mcpCallFn === 'function',
    ),
    findDefinition: jest.fn(),
    findReferences: jest.fn(),
    findCallers: jest.fn(),
    findCallees: jest.fn(),
    analyzeDependencies: jest.fn(),
    analyzeComplexity: jest.fn(),
    analyzeCodebase: jest.fn(),
    getProjectStats: jest.fn(),
  })),
}));

const {
  CodeIntelClient,
  CIRCUIT_BREAKER_THRESHOLD,
  CIRCUIT_BREAKER_RESET_MS,
  CACHE_TTL_MS,
  CB_CLOSED,
  CB_OPEN,
  CB_HALF_OPEN,
} = require('../../../.aios-core/core/code-intel/code-intel-client');

// --- Helpers ---

function createClient(opts = {}) {
  return new CodeIntelClient(opts);
}

function createClientWithProvider() {
  const mcpCallFn = jest.fn();
  const client = createClient({ mcpCallFn });
  // CodeGraph provider (index 1) has isAvailable=true via mcpCallFn
  return { client, mcpCallFn };
}

/** Get the CodeGraph mock provider (index 1, after Registry at index 0) */
function getCodeGraphProvider(client) {
  return client._providers[1];
}

// --- Tests ---

describe('CodeIntelClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // Exported constants
  // --------------------------------------------------
  describe('exported constants', () => {
    it('should export CIRCUIT_BREAKER_THRESHOLD as 3', () => {
      expect(CIRCUIT_BREAKER_THRESHOLD).toBe(3);
    });

    it('should export CIRCUIT_BREAKER_RESET_MS as 60000', () => {
      expect(CIRCUIT_BREAKER_RESET_MS).toBe(60000);
    });

    it('should export CACHE_TTL_MS as 5 minutes', () => {
      expect(CACHE_TTL_MS).toBe(5 * 60 * 1000);
    });

    it('should export circuit breaker state constants', () => {
      expect(CB_CLOSED).toBe('CLOSED');
      expect(CB_OPEN).toBe('OPEN');
      expect(CB_HALF_OPEN).toBe('HALF-OPEN');
    });
  });

  // --------------------------------------------------
  // Constructor
  // --------------------------------------------------
  describe('constructor', () => {
    it('should initialize with default state', () => {
      const client = createClient();
      expect(client._providers).toHaveLength(2); // Registry (T1) + CodeGraph (T3)
      expect(client._activeProvider).toBeNull();
      expect(client._cbState).toBe(CB_CLOSED);
      expect(client._cbFailures).toBe(0);
      expect(client._cache.size).toBe(0);
      expect(client._cacheHits).toBe(0);
      expect(client._cacheMisses).toBe(0);
    });

    it('should pass options to the auto-registered CodeGraph provider', () => {
      const mcpCallFn = jest.fn();
      const client = createClient({ mcpServerName: 'custom', mcpCallFn });
      // _providers[0] = Registry, _providers[1] = CodeGraph
      const codeGraph = client._providers[1];
      expect(codeGraph.options.mcpServerName).toBe('custom');
      expect(codeGraph.options.mcpCallFn).toBe(mcpCallFn);
    });
  });

  // --------------------------------------------------
  // registerProvider
  // --------------------------------------------------
  describe('registerProvider()', () => {
    it('should add provider to the list', () => {
      const client = createClient();
      const extra = { name: 'extra', options: {} };
      client.registerProvider(extra);
      expect(client._providers).toHaveLength(3); // Registry + CodeGraph + extra
    });

    it('should reset active provider on registration', () => {
      const { client } = createClientWithProvider();
      client._detectProvider(); // sets _activeProvider
      expect(client._activeProvider).not.toBeNull();
      client.registerProvider({ name: 'new', options: {} });
      expect(client._activeProvider).toBeNull();
    });
  });

  // --------------------------------------------------
  // isCodeIntelAvailable
  // --------------------------------------------------
  describe('isCodeIntelAvailable()', () => {
    it('should return false when no provider isAvailable', () => {
      const client = createClient(); // no mcpCallFn → CodeGraph.isAvailable=false
      expect(client.isCodeIntelAvailable()).toBe(false);
    });

    it('should return true when provider isAvailable', () => {
      const { client } = createClientWithProvider();
      expect(client.isCodeIntelAvailable()).toBe(true);
    });
  });

  // --------------------------------------------------
  // _detectProvider
  // --------------------------------------------------
  describe('_detectProvider()', () => {
    it('should return null when no provider available', () => {
      const client = createClient();
      expect(client._detectProvider()).toBeNull();
    });

    it('should return cached active provider on second call', () => {
      const { client } = createClientWithProvider();
      const first = client._detectProvider();
      const second = client._detectProvider();
      expect(first).toBe(second);
    });
  });

  // --------------------------------------------------
  // Circuit Breaker
  // --------------------------------------------------
  describe('circuit breaker', () => {
    it('should start in CLOSED state', () => {
      const { client } = createClientWithProvider();
      expect(client.getCircuitBreakerState()).toBe(CB_CLOSED);
    });

    it('should open after CIRCUIT_BREAKER_THRESHOLD consecutive failures', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);

      provider.findDefinition.mockRejectedValue(new Error('fail'));

      for (let i = 0; i < CIRCUIT_BREAKER_THRESHOLD; i++) {
        await client.findDefinition('sym');
      }

      expect(client.getCircuitBreakerState()).toBe(CB_OPEN);
    });

    it('should return null when circuit is OPEN', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider.findDefinition.mockRejectedValue(new Error('fail'));

      // Trip the breaker
      for (let i = 0; i < CIRCUIT_BREAKER_THRESHOLD; i++) {
        await client.findDefinition('sym');
      }

      // Next call should short-circuit
      const result = await client.findDefinition('sym');
      expect(result).toBeNull();
      // Provider should not have been called again
      expect(provider.findDefinition).toHaveBeenCalledTimes(CIRCUIT_BREAKER_THRESHOLD);
    });

    it('should transition to HALF_OPEN after reset timeout', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider.findDefinition.mockRejectedValue(new Error('fail'));

      for (let i = 0; i < CIRCUIT_BREAKER_THRESHOLD; i++) {
        await client.findDefinition('sym');
      }
      expect(client._cbState).toBe(CB_OPEN);

      // Simulate time passing
      client._cbOpenedAt = Date.now() - CIRCUIT_BREAKER_RESET_MS - 1;
      expect(client.getCircuitBreakerState()).toBe(CB_HALF_OPEN);
    });

    it('should close after success in HALF_OPEN state', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);

      // Trip breaker
      provider.findDefinition.mockRejectedValue(new Error('fail'));
      for (let i = 0; i < CIRCUIT_BREAKER_THRESHOLD; i++) {
        await client.findDefinition('sym');
      }

      // Simulate reset timeout
      client._cbOpenedAt = Date.now() - CIRCUIT_BREAKER_RESET_MS - 1;
      client._cbState = CB_HALF_OPEN;

      // Successful call should close the breaker
      provider.findDefinition.mockResolvedValue({ file: 'a.js' });
      await client.findDefinition('sym');
      expect(client.getCircuitBreakerState()).toBe(CB_CLOSED);
      expect(client._cbFailures).toBe(0);
    });

    it('should reset failure count on success', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);

      // Partial failures (not enough to trip)
      provider.findDefinition.mockRejectedValueOnce(new Error('fail'));
      await client.findDefinition('sym');
      expect(client._cbFailures).toBe(1);

      // Success resets
      provider.findDefinition.mockResolvedValue({ file: 'a.js' });
      await client.findDefinition('sym');
      expect(client._cbFailures).toBe(0);
    });
  });

  // --------------------------------------------------
  // Cache
  // --------------------------------------------------
  describe('cache', () => {
    it('should cache results on first call', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider.findDefinition.mockResolvedValue({ file: 'a.js' });

      await client.findDefinition('sym');
      expect(client._cache.size).toBe(1);
    });

    it('should return cached result on second call', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider.findDefinition.mockResolvedValue({ file: 'a.js' });

      const first = await client.findDefinition('sym');
      const second = await client.findDefinition('sym');

      expect(first).toEqual(second);
      // Provider called only once; second call uses cache
      expect(provider.findDefinition).toHaveBeenCalledTimes(1);
    });

    it('should evict expired cache entries', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider.findDefinition.mockResolvedValue({ file: 'a.js' });

      await client.findDefinition('sym');

      // Simulate cache expiry
      const entry = client._cache.values().next().value;
      entry.timestamp = Date.now() - CACHE_TTL_MS - 1;

      // Next call should miss cache
      provider.findDefinition.mockResolvedValue({ file: 'b.js' });
      const result = await client.findDefinition('sym');
      expect(result).toEqual({ file: 'b.js' });
      expect(provider.findDefinition).toHaveBeenCalledTimes(2);
    });

    it('should track cache hits and misses', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider.findDefinition.mockResolvedValue({ file: 'a.js' });

      await client.findDefinition('sym'); // miss
      await client.findDefinition('sym'); // hit

      expect(client._cacheHits).toBe(1);
      expect(client._cacheMisses).toBe(1);
    });
  });

  // --------------------------------------------------
  // _executeCapability — no provider
  // --------------------------------------------------
  describe('_executeCapability() without provider', () => {
    it('should return null and log warning once', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const client = createClient(); // no mcpCallFn

      const r1 = await client.findDefinition('sym');
      const r2 = await client.findDefinition('sym2');

      expect(r1).toBeNull();
      expect(r2).toBeNull();
      // Warning only once (dedup)
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No provider available'),
      );

      warnSpy.mockRestore();
    });
  });

  // --------------------------------------------------
  // Metrics
  // --------------------------------------------------
  describe('getMetrics()', () => {
    it('should return correct metrics shape', () => {
      const { client } = createClientWithProvider();
      const metrics = client.getMetrics();

      expect(metrics).toEqual(
        expect.objectContaining({
          cacheHits: 0,
          cacheMisses: 0,
          cacheHitRate: 0,
          circuitBreakerState: CB_CLOSED,
          latencyLog: [],
          providerAvailable: true,
          activeProvider: expect.any(String),
        }),
      );
    });

    it('should calculate cacheHitRate correctly', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider.findDefinition.mockResolvedValue({});

      await client.findDefinition('a'); // miss
      await client.findDefinition('a'); // hit
      await client.findDefinition('b'); // miss

      const metrics = client.getMetrics();
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.cacheMisses).toBe(2);
      expect(metrics.cacheHitRate).toBeCloseTo(1 / 3);
    });

    it('should log latency entries', async () => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider.findDefinition.mockResolvedValue({});

      await client.findDefinition('sym');

      const metrics = client.getMetrics();
      expect(metrics.latencyLog).toHaveLength(1);
      expect(metrics.latencyLog[0]).toEqual(
        expect.objectContaining({
          capability: 'findDefinition',
          durationMs: expect.any(Number),
          isCacheHit: false,
        }),
      );
    });
  });

  // --------------------------------------------------
  // 8 Public Capabilities
  // --------------------------------------------------
  describe('public capabilities', () => {
    const capabilities = [
      ['findDefinition', ['sym', {}]],
      ['findReferences', ['sym', {}]],
      ['findCallers', ['sym', {}]],
      ['findCallees', ['sym', {}]],
      ['analyzeDependencies', ['src/', {}]],
      ['analyzeComplexity', ['src/', {}]],
      ['analyzeCodebase', ['src/', {}]],
      ['getProjectStats', [{}]],
    ];

    it.each(capabilities)('%s should delegate to provider', async (cap, args) => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider[cap].mockResolvedValue({ result: cap });

      const result = await client[cap](...args);
      expect(result).toEqual({ result: cap });
      expect(provider[cap]).toHaveBeenCalledTimes(1);
    });

    it.each(capabilities)('%s should return null on provider error', async (cap, args) => {
      const { client } = createClientWithProvider();
      const provider = getCodeGraphProvider(client);
      provider[cap].mockRejectedValue(new Error('fail'));

      const result = await client[cap](...args);
      expect(result).toBeNull();
    });
  });

  // --------------------------------------------------
  // _evictExpired
  // --------------------------------------------------
  describe('_evictExpired()', () => {
    it('should remove expired entries from cache', () => {
      const { client } = createClientWithProvider();
      const now = Date.now();

      client._cache.set('fresh', { value: 1, timestamp: now });
      client._cache.set('stale', { value: 2, timestamp: now - CACHE_TTL_MS - 1 });

      client._evictExpired();

      expect(client._cache.has('fresh')).toBe(true);
      expect(client._cache.has('stale')).toBe(false);
    });
  });
});
