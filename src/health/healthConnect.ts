import { Linking } from 'react-native';
import {
  initialize,
  getSdkStatus,
  getGrantedPermissions,
  requestPermission,
  readRecords,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import { toDayKey, type DailySteps, type HealthStatus, type StepSource } from './types';

const PERMISSIONS = [{ accessType: 'read' as const, recordType: 'Steps' as const }];

export const HEALTH_CONNECT_PACKAGE = 'com.google.android.apps.healthdata';
export const PLAY_STORE_MARKET_URI = `market://details?id=${HEALTH_CONNECT_PACKAGE}`;
export const PLAY_STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${HEALTH_CONNECT_PACKAGE}`;

/**
 * Directs the user to Google Play Store to install or update Health Connect.
 * Tries the native market:// URI first and gracefully falls back to the web URL.
 */
export async function openHealthConnectPlayStore(): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(PLAY_STORE_MARKET_URI);
    if (supported) {
      await Linking.openURL(PLAY_STORE_MARKET_URI);
      return;
    }
  } catch {
    // If market uri check fails on emulator or restricted device, fall back to browser.
  }
  await Linking.openURL(PLAY_STORE_WEB_URL);
}

/**
 * Attempts to open the system Health Connect settings screen.
 */
export async function openHealthConnectSettingsSafe(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const hc = require('react-native-health-connect');
    if (typeof hc.openHealthConnectSettings === 'function') {
      hc.openHealthConnectSettings();
      return true;
    }
  } catch {
    // Settings launch unavailable
  }
  return false;
}

/**
 * Reads daily step totals from Android Health Connect.
 *
 * Health Connect returns raw step *records* — many per day, one per sensor
 * session — so they are bucketed into local calendar days here. Bucketing on
 * the client is fine because the server re-validates everything anyway; the
 * phone reports, the server decides.
 */
export const HealthConnectStepSource: StepSource = {
  name: 'health_connect',

  async status(): Promise<HealthStatus> {
    try {
      const sdk = await getSdkStatus();
      if (sdk === SdkAvailabilityStatus.SDK_UNAVAILABLE) return 'unsupported';
      if (sdk === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
        return 'not_installed';
      }
      const ok = await initialize();
      return ok ? 'ready' : 'unknown';
    } catch {
      return 'unknown';
    }
  },

  async checkPermission(): Promise<boolean> {
    try {
      await initialize();
      const granted = await getGrantedPermissions();
      return granted.some((p) => p.recordType === 'Steps' && p.accessType === 'read');
    } catch {
      return false;
    }
  },

  async requestPermission(): Promise<boolean> {
    await initialize();
    const granted = await requestPermission(PERMISSIONS);
    return granted.some((p) => p.recordType === 'Steps' && p.accessType === 'read');
  },

  async getRange(from: Date, to: Date): Promise<DailySteps[]> {
    await initialize();

    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    const res = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
    });

    // v4 returns { records }, older shapes returned the array directly.
    const records: { startTime: string; count: number }[] = Array.isArray(res)
      ? res
      : ((res as { records: { startTime: string; count: number }[] }).records ?? []);

    const buckets = new Map<string, number>();
    for (const r of records) {
      const key = toDayKey(new Date(r.startTime));
      buckets.set(key, (buckets.get(key) ?? 0) + (r.count ?? 0));
    }

    // Emit every day in range, zero-filled — a missing day is a real answer.
    const out: DailySteps[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = toDayKey(cursor);
      out.push({ day: key, steps: buckets.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  },
};
