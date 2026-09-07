import { useLocation, useNavigate } from 'react-router-dom';
import { ScenarioPortal } from './ScenarioPortal';
import type { AdminSection } from '../../../types/admin.js';

export function AdminRouteWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  let section: AdminSection = 'overview';
  const path = location.pathname.toLowerCase();

  if (path.startsWith('/admin/sessions')) {
    section = 'sessions';
  } else if (path.startsWith('/admin/scenarios') || path.startsWith('/admin/library')) {
    section = 'library';
  } else if (path.startsWith('/admin/builder')) {
    section = 'builder';
  } else if (path.startsWith('/admin/review')) {
    section = 'review';
  } else if (path.startsWith('/admin/youth-missions') || path.startsWith('/admin/youth')) {
    section = 'youth';
  } else if (path.startsWith('/admin/analytics') || path.startsWith('/admin/insights')) {
    section = 'insights';
  } else if (path.startsWith('/admin/resources')) {
    section = 'resources';
  }

  return (
    <ScenarioPortal
      initialSection={section}
      onReturnToGame={() => navigate('/board')}
    />
  );
}
