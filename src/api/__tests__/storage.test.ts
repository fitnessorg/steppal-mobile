describe('Token Storage', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('uses secure store methods when expo-secure-store is present', async () => {
    const mockStore = {
      getItemAsync: jest.fn().mockResolvedValue('test-token'),
      setItemAsync: jest.fn().mockResolvedValue(undefined),
      deleteItemAsync: jest.fn().mockResolvedValue(undefined),
    };

    jest.doMock('expo-secure-store', () => mockStore);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { tokenStore } = require('../storage');
    const store = tokenStore();

    expect(store.persistent).toBe(true);

    await store.set('key', 'val');
    expect(mockStore.setItemAsync).toHaveBeenCalledWith('key', 'val');

    const value = await store.get('key');
    expect(value).toBe('test-token');
    expect(mockStore.getItemAsync).toHaveBeenCalledWith('key');

    await store.remove('key');
    expect(mockStore.deleteItemAsync).toHaveBeenCalledWith('key');
  });

  it('gracefully falls back to MemoryStore when expo-secure-store is unavailable', async () => {
    jest.doMock('expo-secure-store', () => {
      throw new Error('Native module not found');
    });

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { tokenStore } = require('../storage');
    const store = tokenStore();

    expect(store.persistent).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('expo-secure-store unavailable'));

    // Initial get returns null
    expect(await store.get('token')).toBeNull();

    // Set and retrieve
    await store.set('token', 'fallback-session');
    expect(await store.get('token')).toBe('fallback-session');

    // Remove
    await store.remove('token');
    expect(await store.get('token')).toBeNull();

    warnSpy.mockRestore();
  });
});
