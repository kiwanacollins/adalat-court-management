import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function HomePage() {
  return (
    <Fragment>
      {/* Hero */}
      <section className="px-2 py-20 bg-white md:px-0">
        <div className="container items-center max-w-6xl px-8 mx-auto xl:px-5">
          <div className="flex flex-wrap items-center sm:-mx-3">
            <div className="w-full md:w-1/2 md:px-3">
              <div className="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-widest">
                  Lwengo Grade I Magistrate&apos;s Court — Uganda
                </p>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-5xl xl:text-6xl">
                  <span className="block">E-Judiciary</span>
                  <span className="block text-blue-700">Case Scheduling System</span>
                </h1>
                <p className="mx-auto text-base text-gray-500 sm:max-w-md lg:text-xl md:max-w-3xl">
                  A digital platform for efficient court case registration, scheduling, and management — reducing backlog and improving access to justice.
                </p>
                <div className="relative flex flex-col sm:flex-row sm:space-x-4">
                  <Link href="/auth">
                    <a className="flex items-center w-full px-6 py-3 mb-3 text-lg text-white bg-blue-700 sm:mb-0 hover:bg-blue-800 sm:w-auto rounded-2xl">
                      Get Started
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-full h-auto overflow-hidden shadow-xl rounded-2xl">
                <Image
                  src="/hero_img.jpeg"
                  alt="Lwengo Magistrate Court"
                  width="90"
                  height="50"
                  layout="responsive"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-50">
        <div className="container max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold tracking-tight text-center text-gray-900">
            System Features
          </h2>
          <p className="mt-2 text-lg text-center text-gray-500">
            Designed to modernise case management at Lwengo Grade I Magistrate&apos;s Court.
          </p>
          <div className="grid grid-cols-4 gap-8 mt-10 sm:grid-cols-8 lg:grid-cols-12 sm:px-8 xl:px-0">

            <div className="relative flex flex-col items-center justify-between col-span-4 px-8 py-12 space-y-4 overflow-hidden bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="p-3 text-white bg-blue-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800">Smart Scheduling</h4>
              <p className="text-base text-center text-gray-500">
                Rule-based hearing scheduling with automatic conflict detection to prevent double-booking and clashes.
              </p>
            </div>

            <div className="flex flex-col items-center justify-between col-span-4 px-8 py-12 space-y-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="p-3 text-white bg-blue-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800">Case Registration</h4>
              <p className="text-base text-center text-gray-500">
                Digitally register criminal, civil, land, and family cases with auto-generated case numbers.
              </p>
            </div>

            <div className="flex flex-col items-center justify-between col-span-4 px-8 py-12 space-y-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="p-3 text-white bg-blue-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800">Notifications</h4>
              <p className="text-base text-center text-gray-500">
                In-app alerts keep judicial officers and parties informed of upcoming hearings and status changes.
              </p>
            </div>

            <div className="flex flex-col items-center justify-between col-span-4 px-8 py-12 space-y-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="p-3 text-white bg-blue-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800">Reports & Analytics</h4>
              <p className="text-base text-center text-gray-500">
                Comprehensive dashboards with case summaries, workload distribution, and upcoming hearing calendars.
              </p>
            </div>

            <div className="flex flex-col items-center justify-between col-span-4 px-8 py-12 space-y-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="p-3 text-white bg-blue-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800">Role-Based Access</h4>
              <p className="text-base text-center text-gray-500">
                Separate secure access for Magistrates, Court Clerks, and Litigants with appropriate permissions.
              </p>
            </div>

            <div className="flex flex-col items-center justify-between col-span-4 px-8 py-12 space-y-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="p-3 text-white bg-blue-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800">Mobile Accessible (PWA)</h4>
              <p className="text-base text-center text-gray-500">
                Works on smartphones and desktops with offline support, ensuring access even with limited connectivity.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">E-Judiciary CMS</p>
            <p className="text-slate-400 text-sm">Lwengo Grade I Magistrate&apos;s Court, Uganda</p>
          </div>
          <div className="flex gap-6 text-slate-400 text-sm">
            <span>© {new Date().getFullYear()} Lwengo Judiciary</span>
          </div>
        </div>
      </footer>
    </Fragment>
  );
}

export default HomePage;
