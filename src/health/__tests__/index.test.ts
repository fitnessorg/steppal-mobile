import { Platform } from 'react-native';

describe('Step Source Detection & Fallback', () => {
  const originalEnv = process.env.EXPO_PUBLIC_STEP_SOURCE;

  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_STEP_SOURCE = originalEnv;
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_STEP_SOURCE = originalEnv;
  });

  it('forces MockStepSource when EXPO_PUBLIC_STEP_SOURCE is set to mock', () => {
    process.env.EXPO_PUBLIC_STEP_SOURCE = 'mock';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getStepSource, isLiveSource, sourceLabel } = require('../index');
    const source = getStepSource();

    expect(source.name).toBe('mock');
    expect(isLiveSource()).toBe(false);
    expect(sourceLabel()).toBe('Sample data');
  });

  it('falls back from Health Connect when not on Android', () => {
    Platform.OS = 'ios';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getStepSource, isLiveSource, sourceLabel } = require('../index');
    const source = getStepSource();

    // On iOS without HealthKit, falls back to pedometer or mock without throwing
    expect(source).toBeDefined();
    expect(typeof source.getRange).toBe('function');
    expect(typeof source.status).toBe('function');
    if (source.name === 'pedometer') {
      expect(isLiveSource()).toBe(true);
      expect(sourceLabel()).toBe('Step counter');
    }
  });

  it('falls back to pedometer when on Android but HealthConnect native module is missing', () => {
    Platform.OS = 'android';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NativeModules } = require('react-native');
    delete NativeModules.HealthConnect;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getStepSource } = require('../index');
    const source = getStepSource();

    expect(source).toBeDefined();
    expect(source.name).not.toBe('health_connect');
  });

  it('selects HealthConnect when NativeModules.HealthConnect is present on Android dev client', () => {
    Platform.OS = 'android';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NativeModules } = require('react-native');
    NativeModules.HealthConnect = { isAvailable: jest.fn() };

    jest.doMock('expo-constants', () => ({
      default: { executionEnvironment: 'bare' },
    }));

    const mockHealthConnectSource = {
      name: 'health_connect',
      getToday: jest.fn(),
      getRange: jest.fn(),
    };

    jest.doMock('../healthConnect', () => ({
      HealthConnectStepSource: mockHealthConnectSource,
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getStepSource, isLiveSource, sourceLabel } = require('../index');
    const source = getStepSource();

    expect(source.name).toBe('health_connect');
    expect(isLiveSource()).toBe(true);
    expect(sourceLabel()).toBe('Health Connect');
  });
});
