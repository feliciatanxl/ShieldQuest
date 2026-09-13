import { useCallback } from 'react';

import { navigate, usePath } from '../router.ts';
import { FacilitatorLogin } from './FacilitatorLogin.tsx';
import { ScenarioPortal } from './ScenarioPortal.tsx';
import type { AdminSection } from './types.ts';

/**
 * The facilitator portal's front door.
 *
 * Ported from v1's `AdminRouteWrapper`, which read the path and nothing else.
 * This version keeps the section and the URL in step in BOTH directions: the
 * path names the section on arrival, and moving between sections rewrites the
 * path. That matters more here than on the other two surfaces — a reviewer is
 * sent to a queue by a colleague, and "open the portal, then click Content
 * Review" is not a link.
 *
 * The sign-in page is a demonstration, and deliberately does not gate the
 * portal: there is no account system behind it (the proposal commits to no
 * accounts), and a lock that any visitor walks past by typing `/admin` would
 * claim a protection this build does not have. It exists because the funded
 * pilot's portal will need one, and because it is the screen that explains what
 * the portal is for.
 */

/** Path segment ⇄ section. Aliases exist because both names were linked in v1. */
const SECTION_PATHS: { section: AdminSection; path: string; aliases?: string[] }[] = [
  { section: 'overview', path: '/admin' },
  { section: 'sessions', path: '/admin/sessions' },
  { section: 'library', path: '/admin/library', aliases: ['/admin/scenarios'] },
  { section: 'builder', path: '/admin/builder' },
  { section: 'review', path: '/admin/review' },
  { section: 'youth', path: '/admin/youth', aliases: ['/admin/youth-missions'] },
  { section: 'insights', path: '/admin/insights', aliases: ['/admin/analytics'] },
  { section: 'resources', path: '/admin/resources' },
];

function sectionFor(path: string): AdminSection {
  const normalised = path.toLowerCase().replace(/\/+$/, '') || '/admin';
  const match = SECTION_PATHS.find(
    (entry) => normalised === entry.path || entry.aliases?.includes(normalised),
  );
  return match?.section ?? 'overview';
}

function pathFor(section: AdminSection): string {
  return SECTION_PATHS.find((entry) => entry.section === section)?.path ?? '/admin';
}

export default function PortalApp() {
  const path = usePath();

  const onSectionChange = useCallback((section: AdminSection) => {
    const next = pathFor(section);
    if (next !== window.location.pathname) navigate(next);
  }, []);

  if (path.toLowerCase().startsWith('/admin/login')) {
    return <FacilitatorLogin />;
  }

  return (
    <ScenarioPortal
      initialSection={sectionFor(path)}
      onSectionChange={onSectionChange}
      onReturnToGame={() => navigate('/play')}
    />
  );
}
