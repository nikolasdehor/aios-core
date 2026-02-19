'use strict';

jest.mock('../../../.aios-core/core/code-intel/providers/code-graph-provider', () => ({
  CodeGraphProvider: jest.fn().mockImplementation((opts) => ({
    name: 'code-graph',
    options: opts,
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

const {
  CodeGraphProvider,
} = require('../../../.aios-core/core/code-intel/providers/code-graph-provider');

// ---------------------------------------------------------------------------
// 1. Exported constants
// ---------------------------------------------------------------------------
describe('Exported constants', () => {
  test('CIRCUIT_BREAKER_THRESHOLD equals 3', () => {
    expect(CIRCUIT_BREAKER_THRESHOLD).toBe(3);
  });

  test('CIRCUIT_BREAKER_RESET_MS equals 60 000', () => {
    expect(CIRCUIT_BREAKER_RESET_MS).toBe(60000);
  });

  test('CACHE_TTL_MS equals 300 000 (5 minutes)', () => {
    expect(CACHE_TTL_MS).toBe(300000);
  });

  test('circuit breaker state constants', () => {
    expect(CB_CLOSED).toBe('CLOSED');
    expect(CB_OPEN).toBe('OPEN');
    expect(CB_HALF_OPEN).toBe('HALF-OPEN');
  });
});

// ---------------------------------------------------------------------------
// 2. Constructor
// ---------------------------------------------------------------------------
describe('CodeIntelClient constructor', () => {
  beforeEach(() => {
    CodeGraphProvider.mockClear();
  });

  test('creates an instance with default options', () => {
    const client = new CodeIntelClient();
    expect(client).toBeInstanceOf(CodeIntelClient);
    expect(client._providers).toHaveLength(1);
    expect(client._activeProvider).toBeNull();
    expect(client._cbState).toBe(CB_CLOSED);
    expect(client._cbFailures).toBe(0);
    expect(client._cbOpenedAt).toBeNull();
    expect(client._cache).toBeInstanceOf(Map);
    expect(client._cache.size).toBe(0);
    expect(client._cacheHits).toBe(0);
    expect(client._cacheMisses).toBe(0);
    expect(client._latencyLog).toEqual([]);
  });

  test('passes options to CodeGraphProvider', () => {
    const mcpCallFn = jest.fn();
    new CodeIntelClient({ mcpServerName: 'custom', mcpCallFn });
    expect(CodeGraphProvider).toHaveBeenCalledWith({
      mcpServerName: 'custom',
      mcpCallFn,
    });
  });

  test('uses defaults when no options given', () => {
    new CodeIntelClient();
    expect(CodeGraphProvider).toHaveBeenCalledWith({
      mcpServerName: 'code-graph',
      mcpCallFn: null,
    });
  });
});

// ---------------------------------------------------------------------------
// 3. _registerDefaultProviders
// ---------------------------------------------------------------------------
describe('_registerDefaultProviders', () => {
  beforeEach(() => CodeGraphProvider.mockClear());

  test('pushes a CodeGraphProvider instance into _providers', () => {
    const client = new CodeIntelClient();
    expect(client._providers).toHaveLength(1);
    expect(client._providers[0].name).toBe('code-graph');
  });
});

// ---------------------------------------------------------------------------
// 4. registerProvider
// ---------------------------------------------------------------------------
describe('registerProvider', () => {
  test('appends provider and resets _activeProvider', () => {
    const mcpCallFn = jest.fn();
    const client = new CodeIntelClient({ mcpCallFn });
    // _activeProvider is cached after _detectProvider
    client._detectProvider();
    expect(client._activeProvider).not.toBeNull();

    const custom = { name: 'custom', options: { mcpCallFn: jest.fn() } };
    client.registerProvider(custom);
    expect(client._providers).toHaveLength(2);
    expect(client._activeProvider).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 5. _detectProvider
// ---------------------------------------------------------------------------
describe('_detectProvider', () => {
  test('returns null when no provider has mcpCallFn function', () => {
    const client = new CodeIntelClient(); // default mcpCallFn is null
    expect(client._detectProvider()).toBeNull();
  });

  test('returns the first provider whose mcpCallFn is a function', () => {
    const mcpCallFn = jest.fn();
    const client = new CodeIntelClient({ mcpCallFn });
    const result = client._detectProvider();
    expect(result).toBe(client._providers[0]);
    expect(result.options.mcpCallFn).toBe(mcpCallFn);
  });

  test('caches the detected provider on subsequent calls', () => {
    const client = new CodeIntelClient({ mcpCallFn: jest.fn() });
    const first = client._detectProvider();
    const second = client._detectProvider();
    expect(first).toBe(second);
    expect(client._activeProvider).toBe(first);
  });
});

// ---------------------------------------------------------------------------
// 6. isCodeIntelAvailable
// ---------------------------------------------------------------------------
describe('isCodeIntelAvailable', () => {
  test('returns false when no provider is available', () => {
    const client = new CodeIntelClient();
    expect(client.isCodeIntelAvailable()).toBe(false);
  });

  test('returns true when a provider has mcpCallFn', () => {
    const client = new CodeIntelClient({ mcpCallFn: jest.fn() });
    expect(client.isCodeIntelAvailable()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. _executeCapability — orchestration
// ---------------------------------------------------------------------------
describe('_executeCapability', () => {
  let client;
  let mockProvider;

  beforeEach(() => {
    mockProvider = {
      name: 'mock',
      options: { mcpCallFn: jest.fn() },
      findDefinition: jest.fn().mockResolvedValue({ file: 'a.js', line: 1 }),
      findReferences: jest.fn().mockResolvedValue([]),
    };
    client = new CodeIntelClient();
    // Replace provider list with our mock
    client._providers = [mockProvider];
    client._activeProvider = null;
  });

  test('returns null and warns once when no provider is available', async () => {
    const noProvClient = new CodeIntelClient(); // mcpCallFn = null
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const r1 = await noProvClient._executeCapability('findDefinition', ['sym']);
    expect(r1).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    // Second call should NOT warn again
    const r2 = await noProvClient._executeCapability('findDefinition', ['sym']);
    expect(r2).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  test('delegates to the provider and returns the result', async () => {
    const result = await client._executeCapability('findDefinition', ['mySymbol', {}]);
    expect(mockProvider.findDefinition).toHaveBeenCalledWith('mySymbol', {});
    expect(result).toEqual({ file: 'a.js', line: 1 });
  });

  test('caches the result and serves from cache on second call', async () => {
    await client._executeCapability('findDefinition', ['s1']);
    await client._executeCapability('findDefinition', ['s1']);
    // Provider called only once; second was cache hit
    expect(mockProvider.findDefinition).toHaveBeenCalledTimes(1);
    expect(client._cacheHits).toBe(1);
    expect(client._cacheMisses).toBe(1);
  });

  test('increments cacheMisses on first call', async () => {
    await client._executeCapability('findDefinition', ['s1']);
    expect(client._cacheMisses).toBe(1);
    expect(client._cacheHits).toBe(0);
  });

  test('returns null when provider throws and records failure', async () => {
    mockProvider.findDefinition.mockRejectedValueOnce(new Error('boom'));
    const result = await client._executeCapability('findDefinition', ['s1']);
    expect(result).toBeNull();
    expect(client._cbFailures).toBe(1);
  });

  test('returns null when circuit breaker is open (within reset window)', async () => {
    // Manually set CB to OPEN
    client._cbState = CB_OPEN;
    client._cbOpenedAt = Date.now();
    const result = await client._executeCapability('findDefinition', ['s1']);
    expect(result).toBeNull();
    expect(mockProvider.findDefinition).not.toHaveBeenCalled();
  });

  test('logs latency entries', async () => {
    await client._executeCapability('findDefinition', ['s1']);
    expect(client._latencyLog).toHaveLength(1);
    expect(client._latencyLog[0].capability).toBe('findDefinition');
    expect(typeof client._latencyLog[0].durationMs).toBe('number');
    expect(client._latencyLog[0].isCacheHit).toBe(false);
  });

  test('logs a cache-hit latency entry on second call', async () => {
    await client._executeCapability('findDefinition', ['s1']);
    await client._executeCapability('findDefinition', ['s1']);
    const cacheEntry = client._latencyLog.find((e) => e.isCacheHit);
    expect(cacheEntry).toBeDefined();
    expect(cacheEntry.capability).toBe('findDefinition');
  });
});

// ---------------------------------------------------------------------------
// 8. Circuit breaker
// ---------------------------------------------------------------------------
describe('Circuit breaker', () => {
  let client;
  let mockProvider;

  beforeEach(() => {
    jest.useFakeTimers();
    mockProvider = {
      name: 'mock',
      options: { mcpCallFn: jest.fn() },
      findDefinition: jest.fn().mockRejectedValue(new Error('fail')),
    };
    client = new CodeIntelClient();
    client._providers = [mockProvider];
    client._activeProvider = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('_onSuccess resets failures to 0', () => {
    client._cbFailures = 2;
    client._onSuccess();
    expect(client._cbFailures).toBe(0);
  });

  test('_onSuccess transitions HALF_OPEN → CLOSED', () => {
    client._cbState = CB_HALF_OPEN;
    client._onSuccess();
    expect(client._cbState).toBe(CB_CLOSED);
  });

  test('_onFailure increments failure count', () => {
    client._onFailure();
    expect(client._cbFailures).toBe(1);
  });

  test('_onFailure opens breaker at threshold (3)', () => {
    client._onFailure();
    client._onFailure();
    expect(client._cbState).toBe(CB_CLOSED);
    client._onFailure();
    expect(client._cbState).toBe(CB_OPEN);
    expect(client._cbOpenedAt).toBeDefined();
  });

  test('getCircuitBreakerState returns CLOSED initially', () => {
    expect(client.getCircuitBreakerState()).toBe(CB_CLOSED);
  });

  test('getCircuitBreakerState transitions OPEN → HALF_OPEN after reset time', () => {
    client._cbState = CB_OPEN;
    client._cbOpenedAt = Date.now();
    expect(client.getCircuitBreakerState()).toBe(CB_OPEN);

    jest.advanceTimersByTime(CIRCUIT_BREAKER_RESET_MS);
    expect(client.getCircuitBreakerState()).toBe(CB_HALF_OPEN);
  });

  test('three consecutive failures via _executeCapability opens breaker', async () => {
    await client._executeCapability('findDefinition', ['a']);
    await client._executeCapability('findDefinition', ['b']);
    await client._executeCapability('findDefinition', ['c']);
    expect(client._cbState).toBe(CB_OPEN);
  });

  test('open breaker transitions to HALF_OPEN inside _executeCapability after reset', async () => {
    // Trip the breaker
    await client._executeCapability('findDefinition', ['a']);
    await client._executeCapability('findDefinition', ['b']);
    await client._executeCapability('findDefinition', ['c']);
    expect(client._cbState).toBe(CB_OPEN);

    // Advance past reset window; provider now succeeds
    mockProvider.findDefinition.mockResolvedValueOnce({ ok: true });
    jest.advanceTimersByTime(CIRCUIT_BREAKER_RESET_MS);

    const result = await client._executeCapability('findDefinition', ['d']);
    expect(result).toEqual({ ok: true });
    // After success in HALF_OPEN, should be CLOSED
    expect(client._cbState).toBe(CB_CLOSED);
  });
});

// ---------------------------------------------------------------------------
// 9. Cache
// ---------------------------------------------------------------------------
describe('Cache', () => {
  let client;

  beforeEach(() => {
    jest.useFakeTimers();
    client = new CodeIntelClient();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('_getFromCache returns undefined for missing key', () => {
    expect(client._getFromCache('missing')).toBeUndefined();
  });

  test('_putInCache stores and _getFromCache retrieves', () => {
    client._putInCache('k1', { data: 42 });
    expect(client._getFromCache('k1')).toEqual({ data: 42 });
  });

  test('_getFromCache returns undefined for expired entries', () => {
    client._putInCache('k1', 'val');
    jest.advanceTimersByTime(CACHE_TTL_MS + 1);
    expect(client._getFromCache('k1')).toBeUndefined();
  });

  test('expired entry is deleted from map on access', () => {
    client._putInCache('k1', 'val');
    jest.advanceTimersByTime(CACHE_TTL_MS + 1);
    client._getFromCache('k1');
    expect(client._cache.has('k1')).toBe(false);
  });

  test('_evictExpired removes only expired entries', () => {
    client._putInCache('old', 'old-val');
    jest.advanceTimersByTime(CACHE_TTL_MS + 1);
    client._putInCache('new', 'new-val');
    client._evictExpired();
    expect(client._cache.has('old')).toBe(false);
    expect(client._cache.has('new')).toBe(true);
  });

  test('_putInCache triggers eviction every 50 puts', () => {
    const evictSpy = jest.spyOn(client, '_evictExpired');
    // Fill cache to size 49 first (need size to be multiple of 50 before the put)
    for (let i = 0; i < 49; i++) {
      client._putInCache(`key-${i}`, i);
    }
    expect(evictSpy).not.toHaveBeenCalled();
    // 50th entry — size is 49 at check time... size check is on current size
    // Let's re-read the logic: "if (this._cache.size > 0 && this._cache.size % 50 === 0)"
    // At 50th put, cache.size is 49 before set. So need to get size to 50 then put one more.
    client._putInCache('key-49', 49);
    // Now cache size is 50. Next put will see size 50 % 50 === 0 → evict
    expect(evictSpy).not.toHaveBeenCalled();
    client._putInCache('key-50', 50);
    expect(evictSpy).toHaveBeenCalledTimes(1);
    evictSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// 10. _logLatency and getMetrics
// ---------------------------------------------------------------------------
describe('_logLatency and getMetrics', () => {
  test('_logLatency pushes entry with all fields', () => {
    const client = new CodeIntelClient();
    client._logLatency('findCallers', 42, true);
    expect(client._latencyLog).toHaveLength(1);
    expect(client._latencyLog[0]).toMatchObject({
      capability: 'findCallers',
      durationMs: 42,
      isCacheHit: true,
    });
    expect(typeof client._latencyLog[0].timestamp).toBe('number');
  });

  test('getMetrics returns full metrics object', () => {
    const client = new CodeIntelClient({ mcpCallFn: jest.fn() });
    client._cacheHits = 3;
    client._cacheMisses = 7;
    const m = client.getMetrics();
    expect(m).toEqual({
      cacheHits: 3,
      cacheMisses: 7,
      cacheHitRate: 0.3,
      circuitBreakerState: CB_CLOSED,
      latencyLog: [],
      providerAvailable: true,
      activeProvider: 'code-graph',
    });
  });

  test('getMetrics returns 0 cacheHitRate when no calls', () => {
    const client = new CodeIntelClient();
    expect(client.getMetrics().cacheHitRate).toBe(0);
  });

  test('getMetrics returns null activeProvider when none detected', () => {
    const client = new CodeIntelClient();
    expect(client.getMetrics().activeProvider).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 11. Eight public capability methods
// ---------------------------------------------------------------------------
describe('Public capability methods', () => {
  let client;
  let mockProvider;

  const capabilities = [
    { method: 'findDefinition', args: ['sym', {}] },
    { method: 'findReferences', args: ['sym', {}] },
    { method: 'findCallers', args: ['sym', {}] },
    { method: 'findCallees', args: ['sym', {}] },
    { method: 'analyzeDependencies', args: ['/path', {}] },
    { method: 'analyzeComplexity', args: ['/path', {}] },
    { method: 'analyzeCodebase', args: ['/path', {}] },
    { method: 'getProjectStats', args: [{}] },
  ];

  beforeEach(() => {
    mockProvider = {
      name: 'mock',
      options: { mcpCallFn: jest.fn() },
    };
    capabilities.forEach(({ method }) => {
      mockProvider[method] = jest.fn().mockResolvedValue(`${method}-result`);
    });
    client = new CodeIntelClient();
    client._providers = [mockProvider];
    client._activeProvider = null;
  });

  test.each(capabilities)(
    '$method delegates to _executeCapability',
    async ({ method, args }) => {
      const result = await client[method](...args);
      expect(result).toBe(`${method}-result`);
      expect(mockProvider[method]).toHaveBeenCalledWith(...args);
    }
  );

  test('getProjectStats passes single options argument', async () => {
    const opts = { verbose: true };
    await client.getProjectStats(opts);
    expect(mockProvider.getProjectStats).toHaveBeenCalledWith(opts);
  });
});
