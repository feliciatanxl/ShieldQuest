import type { AnchorHTMLAttributes } from 'react';
import { useCityBoardStore } from '../../stores/cityBoardStore';

/** Internal SPA view links follow ShieldQuest's Zustand pattern. */
export default function CityLink({
  href = '/game',
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const navigate = useCityBoardStore((state) => state.navigate);
  return (
    <a
      {...props}
      href={`#${href}`}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        onClick?.(event);
        navigate(href);
      }}
    />
  );
}

export function useRouter() {
  return { push: useCityBoardStore((state) => state.navigate) };
}

export function useParams() {
  const view = useCityBoardStore((state) => state.view);
  return { districtId: view.split('/')[2] ?? '' };
}
