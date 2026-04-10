import { signOut, useSession } from 'next-auth/client';
import { Fragment, useState } from 'react';
import Link from 'next/link';

function Layout(props) {
  const [session] = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Fragment>
      <nav className="bg-[#0f172a] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link href="/" passHref>
              <a className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                <svg className="h-7 w-7 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Adaalat
              </a>
            </Link>

            {/* Desktop nav links */}
            {session && (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/dashboard">
                  <a className="text-white hover:text-white hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Dashboard
                  </a>
                </Link>
                <Link href="/dashboard/AddCases">
                  <a className="text-white hover:text-white hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Add Case
                  </a>
                </Link>
                <Link href="/lawyers">
                  <a className="text-white hover:text-white hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Lawyers
                  </a>
                </Link>
              </div>
            )}

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {session && (
                <>
                  <span className="text-white text-sm">{session.user.email}</span>
                  <button
                    onClick={signOut}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </>
              )}
              {!session && (
                <Link href="/auth">
                  <a className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
                    Sign In
                  </a>
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-slate-300 hover:text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#1e293b] border-t border-slate-700 px-4 py-3 space-y-1">
            {session && (
              <>
                <Link href="/dashboard"><a className="block text-white hover:text-white py-2 text-sm">Dashboard</a></Link>
                <Link href="/dashboard/AddCases"><a className="block text-white hover:text-white py-2 text-sm">Add Case</a></Link>
                <Link href="/lawyers"><a className="block text-white hover:text-white py-2 text-sm">Lawyers</a></Link>
                <button onClick={signOut} className="w-full text-left text-red-400 hover:text-red-300 py-2 text-sm">Sign Out</button>
              </>
            )}
            {!session && (
              <Link href="/auth"><a className="block text-blue-400 hover:text-blue-300 py-2 text-sm">Sign In</a></Link>
            )}
          </div>
        )}
      </nav>
      {props.children}
    </Fragment>
  );
}

export default Layout;
