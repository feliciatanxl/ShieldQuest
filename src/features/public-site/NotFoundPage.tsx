import { Link } from 'react-router-dom';
import { Home, MapPin, ShieldAlert } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-800">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-600 shadow-inner">
        <ShieldAlert className="h-10 w-10" />
      </div>

      <span className="mt-6 text-xs font-black uppercase tracking-widest text-amber-600">
        404 · Unknown Sector
      </span>
      <h1 className="mt-2 text-3xl font-black text-navy-900 sm:text-4xl">
        Space Not Found
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        You seem to have navigated past the perimeter of the ShieldQuest City Board.
        Let’s guide you safely back to an active station.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          <Home className="h-4 w-4" />
          Public Home
        </Link>
        <Link
          to="/board"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 text-sm font-extrabold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800"
        >
          <MapPin className="h-4 w-4 text-amber-400" />
          Return to Board
        </Link>
      </div>
    </div>
  );
}
