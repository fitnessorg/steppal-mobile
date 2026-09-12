/** One day of steps, as the app cares about it. */
export type DailySteps = {
  /** Local calendar day, YYYY-MM-DD. */
  day: string;
  steps: number;
};

export type HealthStatus =
  | 'ready'
  | 'not_installed'
  | 'unsupported'
  | 'permission_denied'
  | 'unknown';

/**
 * Every step source implements this. The app never imports a health library
 * directly, so adding HealthKit later is additive rather than surgical, and a
 * contributor with no Android device can still run the whole app.
 */
export interface StepSource {
  readonly name: string;
  /** Is the underlying store present and usable on this device? */
  status(): Promise<HealthStatus>;
  /** Ask the user. Returns true only if read access to Steps was granted. */
  requestPermission(): Promise<boolean>;
  /** Inclusive day range, local time. */
  getRange(from: Date, to: Date): Promise<DailySteps[]>;
}

export function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
