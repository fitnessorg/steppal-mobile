import { Linking } from 'react-native';
import {
  HealthConnectStepSource,
  openHealthConnectPlayStore,
  openHealthConnectSettingsSafe,
  PLAY_STORE_MARKET_URI,
  PLAY_STORE_WEB_URL,
} from '../healthConnect';
import {
  getSdkStatus,
  initialize,
  getGrantedPermissions,
  requestPermission,
  readRecords,
  openHealthConnectSettings,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

jest.mock('react-native-health-connect', () => ({
  initialize: jest.fn(),
  getSdkStatus: jest.fn(),
  getGrantedPermissions: jest.fn(),
  requestPermission: jest.fn(),
  readRecords: jest.fn(),
  openHealthConnectSettings: jest.fn(),
  SdkAvailabilityStatus: {
    SDK_UNAVAILABLE: 1,
    SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED: 2,
    SDK_AVAILABLE: 3,
  },
}));

describe('Health Connect Service & Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openHealthConnectPlayStore', () => {
    it('opens market URI when supported by device', async () => {
      const canOpenSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
      const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

      await openHealthConnectPlayStore();

      expect(canOpenSpy).toHaveBeenCalledWith(PLAY_STORE_MARKET_URI);
      expect(openSpy).toHaveBeenCalledWith(PLAY_STORE_MARKET_URI);
      expect(openSpy).not.toHaveBeenCalledWith(PLAY_STORE_WEB_URL);

      canOpenSpy.mockRestore();
      openSpy.mockRestore();
    });

    it('falls back to web URL when market URI is not supported', async () => {
      const canOpenSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
      const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

      await openHealthConnectPlayStore();

      expect(canOpenSpy).toHaveBeenCalledWith(PLAY_STORE_MARKET_URI);
      expect(openSpy).toHaveBeenCalledWith(PLAY_STORE_WEB_URL);

      canOpenSpy.mockRestore();
      openSpy.mockRestore();
    });

    it('falls back to web URL when canOpenURL throws', async () => {
      const canOpenSpy = jest
        .spyOn(Linking, 'canOpenURL')
        .mockRejectedValue(new Error('ActivityNotFound'));
      const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

      await openHealthConnectPlayStore();

      expect(openSpy).toHaveBeenCalledWith(PLAY_STORE_WEB_URL);

      canOpenSpy.mockRestore();
      openSpy.mockRestore();
    });
  });

  describe('openHealthConnectSettingsSafe', () => {
    it('calls openHealthConnectSettings when available', async () => {
      const result = await openHealthConnectSettingsSafe();
      expect(result).toBe(true);
      expect(openHealthConnectSettings).toHaveBeenCalled();
    });
  });

  describe('HealthConnectStepSource status & permissions', () => {
    it('reports unsupported when SDK is unavailable', async () => {
      (getSdkStatus as jest.Mock).mockResolvedValue(SdkAvailabilityStatus.SDK_UNAVAILABLE);
      const status = await HealthConnectStepSource.status();
      expect(status).toBe('unsupported');
    });

    it('reports not_installed when provider update is required', async () => {
      (getSdkStatus as jest.Mock).mockResolvedValue(
        SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED,
      );
      const status = await HealthConnectStepSource.status();
      expect(status).toBe('not_installed');
    });

    it('reports ready when SDK is available and initializes', async () => {
      (getSdkStatus as jest.Mock).mockResolvedValue(SdkAvailabilityStatus.SDK_AVAILABLE);
      (initialize as jest.Mock).mockResolvedValue(true);
      const status = await HealthConnectStepSource.status();
      expect(status).toBe('ready');
    });

    it('checkPermission returns true when Steps read permission is granted', async () => {
      (initialize as jest.Mock).mockResolvedValue(true);
      (getGrantedPermissions as jest.Mock).mockResolvedValue([
        { recordType: 'Steps', accessType: 'read' },
      ]);

      const granted = await HealthConnectStepSource.checkPermission?.();
      expect(granted).toBe(true);
    });

    it('checkPermission returns false when Steps read permission is missing', async () => {
      (initialize as jest.Mock).mockResolvedValue(true);
      (getGrantedPermissions as jest.Mock).mockResolvedValue([
        { recordType: 'HeartRate', accessType: 'read' },
      ]);

      const granted = await HealthConnectStepSource.checkPermission?.();
      expect(granted).toBe(false);
    });

    it('requestPermission returns true when user grants permission', async () => {
      (initialize as jest.Mock).mockResolvedValue(true);
      (requestPermission as jest.Mock).mockResolvedValue([
        { recordType: 'Steps', accessType: 'read' },
      ]);

      const result = await HealthConnectStepSource.requestPermission();
      expect(result).toBe(true);
    });

    it('requestPermission returns false when user denies permission', async () => {
      (initialize as jest.Mock).mockResolvedValue(true);
      (requestPermission as jest.Mock).mockResolvedValue([]);

      const result = await HealthConnectStepSource.requestPermission();
      expect(result).toBe(false);
    });
  });

  describe('HealthConnectStepSource getRange', () => {
    it('aggregates step records into calendar days and fills zero for empty days', async () => {
      (initialize as jest.Mock).mockResolvedValue(true);
      (readRecords as jest.Mock).mockResolvedValue({
        records: [
          { startTime: '2026-11-01T08:00:00Z', count: 3200 },
          { startTime: '2026-11-01T14:30:00Z', count: 4800 },
          { startTime: '2026-11-03T10:00:00Z', count: 5000 },
        ],
      });

      const from = new Date('2026-11-01T00:00:00');
      const to = new Date('2026-11-03T00:00:00');

      const days = await HealthConnectStepSource.getRange(from, to);

      expect(days).toEqual([
        { day: '2026-11-01', steps: 8000 },
        { day: '2026-11-02', steps: 0 },
        { day: '2026-11-03', steps: 5000 },
      ]);
    });
  });
});
