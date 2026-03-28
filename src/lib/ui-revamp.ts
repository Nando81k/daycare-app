export type UiRevampPhase = 'foundation' | 'parent' | 'admin';

export interface UiRevampFlags {
  foundation: boolean;
  parent: boolean;
  admin: boolean;
  phase: UiRevampPhase;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on') {
    return true;
  }
  if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off') {
    return false;
  }
  return fallback;
}

function normalizePhase(value: string | undefined): UiRevampPhase {
  if (value === 'admin' || value === 'parent' || value === 'foundation') {
    return value;
  }
  return 'foundation';
}

export function getUiRevampFlags(): UiRevampFlags {
  const foundation = parseBoolean(process.env.NEXT_PUBLIC_UI_REVAMP_FOUNDATION, true);
  const parentRequested = parseBoolean(process.env.NEXT_PUBLIC_UI_REVAMP_PARENT, true);
  const adminRequested = parseBoolean(process.env.NEXT_PUBLIC_UI_REVAMP_ADMIN, true);
  const phase = normalizePhase(process.env.NEXT_PUBLIC_UI_REVAMP_PHASE);

  return {
    foundation,
    parent: foundation && parentRequested,
    admin: foundation && adminRequested,
    phase,
  };
}

export function isUiRevampEnabled(area: 'foundation' | 'parent' | 'admin') {
  const flags = getUiRevampFlags();
  if (area === 'foundation') return flags.foundation;
  if (area === 'parent') return flags.parent;
  return flags.admin;
}

