'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCollegeShortName } from '@/lib/colleges';
import KarmaModal from '@/components/KarmaModal';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [showKarmaModal, setShowKarmaModal] = useState(false);

  const collegeDisplay = getCollegeShortName(user?.collegeName);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Marketplace', href: '/marketplace', icon: '📦' },
    { name: 'Peer Skills', href: '/skills', icon: '🧑‍🏫' },
    { name: 'Study Groups', href: '/study-groups', icon: '📚' },
    { name: 'Campus Map', href: '/map', icon: '🗺️' },
    { name: 'Handshake', href: '/handshake', icon: '🤝' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#00afb9]/30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Institution Branding */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0081a7] flex items-center justify-center text-white text-xl shadow-xs">
              🎓
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#0081a7]">
                CampusConnect
              </span>
              <span
                className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#fed9b7] text-[#334155] border border-[#00afb9]/20 max-w-[190px] truncate align-middle"
                title={user?.collegeName || 'All Colleges'}
              >
                {collegeDisplay}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#0081a7] text-white shadow-xs'
                        : 'text-[#334155] hover:bg-[#fed9b7]/30 hover:text-[#0081a7]'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Status / Karma / Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Karma Balance Badge - Clickable to open Karma Hub */}
                <button
                  onClick={() => setShowKarmaModal(true)}
                  title="Click to view Karma History & Rewards"
                  className="flex items-center gap-1.5 bg-[#fdfcdc] hover:bg-[#fed9b7]/40 border border-[#00afb9] px-3 py-1.5 rounded-full shadow-xs transition cursor-pointer group"
                >
                  <span className="text-sm group-hover:scale-125 transition transform">⚡</span>
                  <span className="text-xs font-bold text-[#0081a7]">
                    {user?.karmaScore ?? 10} Karma
                  </span>
                </button>

                {/* Verified Badge */}
                <span className="hidden sm:inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#00afb9]/15 text-[#0081a7] border border-[#00afb9]/30">
                  ✓ Verified Student
                </span>

                {/* User menu & logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <Link
                    href="/profile"
                    title="View Profile & Karma History"
                    className="w-8 h-8 rounded-full bg-[#0081a7] hover:bg-[#00afb9] text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
                  >
                    {user?.fullName?.[0]?.toUpperCase() || 'P'}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-xs font-medium text-gray-500 hover:text-[#f07167] transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-bold text-[#0081a7] hover:bg-[#fed9b7]/30 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-bold text-white bg-[#0081a7] hover:bg-[#00afb9] rounded-lg transition shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav strip */}
        {isAuthenticated && (
          <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1 text-xs font-semibold whitespace-nowrap rounded-md ${
                  pathname === link.href
                    ? 'bg-[#0081a7] text-white'
                    : 'text-[#334155] bg-gray-100'
                }`}
              >
                {link.icon} {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Karma History & Rewards Center Modal */}
      <KarmaModal
        isOpen={showKarmaModal}
        onClose={() => setShowKarmaModal(false)}
      />
    </nav>
  );
}
