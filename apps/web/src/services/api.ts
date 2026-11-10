import {
  Guardian,
  District,
  ShieldStep,
  TeaserScenario,
  SiteMetadata,
  GUARDIANS,
  DISTRICTS,
  SHIELD_FRAMEWORK,
  TEASER_SCENARIOS,
  SITE_METADATA,
} from '@shieldquest/shared';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchSiteMetadata(): Promise<SiteMetadata> {
  try {
    const res = await fetch(`${API_BASE}/public/site`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch {
    return SITE_METADATA;
  }
}

export async function fetchGuardians(): Promise<Guardian[]> {
  try {
    const res = await fetch(`${API_BASE}/public/guardians`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch {
    return GUARDIANS;
  }
}

export async function fetchGuardianById(id: string): Promise<Guardian | undefined> {
  try {
    const res = await fetch(`${API_BASE}/public/guardians/${id}`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch {
    return GUARDIANS.find((g) => g.id.toLowerCase() === id.toLowerCase());
  }
}

export async function fetchDistricts(): Promise<District[]> {
  try {
    const res = await fetch(`${API_BASE}/public/districts`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch {
    return DISTRICTS;
  }
}

export async function fetchDistrictById(id: string): Promise<District | undefined> {
  try {
    const res = await fetch(`${API_BASE}/public/districts/${id}`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch {
    return DISTRICTS.find((d) => d.id.toLowerCase() === id.toLowerCase());
  }
}

export async function fetchFramework(): Promise<ShieldStep[]> {
  try {
    const res = await fetch(`${API_BASE}/public/framework`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch {
    return SHIELD_FRAMEWORK;
  }
}

export async function fetchTeaserScenarios(): Promise<TeaserScenario[]> {
  try {
    const res = await fetch(`${API_BASE}/public/teaser`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch {
    return TEASER_SCENARIOS;
  }
}
