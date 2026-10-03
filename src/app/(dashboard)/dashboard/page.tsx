'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/lib/apiClient';
import { getCollegeShortName } from '@/lib/colleges';
import KarmaModal from '@/components/KarmaModal';

interface LeaderboardUser {
  _id: string;
  fullName: string;
  department: string;
  collegeName?: string;
  academicYear?: number;
  karmaScore: number;
  skillsOffered?: string[];
  isVerified: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [showKarmaModal, setShowKarmaModal] = useState(false);

  const collegeDisplay = user?.collegeName || 'Pranveer Singh Institute of Technology (PSIT), Kanpur';
  const collegeShort = getCollegeShortName(collegeDisplay);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoadingLeaderboard(true);
        const res = await userAPI.getLeaderboard();
        setLeaderboard(res.data.data || []);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoadingLeaderboard(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const platformPillars = [
    {
      title: 'Campus Marketplace',
      tag: 'Trade Gear',
      desc: 'Buy, sell, or rent semester textbooks, lab coats, and engineering drafters with verified peers.',
      icon: '📦',
      href: '/marketplace',
      action: 'Browse Listings →',
      bgColor: 'bg-[#0081a7]/10',
      accentColor: '#0081a7',
    },
    {
      title: 'Peer Skill Exchange',
      tag: 'Share Skills',
      desc: 'Match with senior peers for 1-on-1 tutoring, code reviews, and academic project guidance.',
      icon: '🧑‍🏫',
      href: '/skills',
      action: 'Find Peer Mentors →',
      bgColor: 'bg-[#00afb9]/15',
      accentColor: '#00afb9',
    },
    {
      title: 'Real-Time Study Finder',
      tag: 'Study Rooms',
      desc: 'Join active course study groups coordinated around library pods and campus computer labs.',
      icon: '📚',
      href: '/study-groups',
      action: 'Join Study Rooms →',
      bgColor: 'bg-[#fed9b7]/30',
      accentColor: '#0081a7',
    },
    {
      title: 'Cryptographic Handshake',
      tag: 'Zero-Trust Engine',
      desc: 'Verify physical transfers with dynamic CSPRNG OTP and ephemeral QR codes to earn Campus Karma.',
      icon: '🤝',
      href: '/handshake',
      action: 'Open Handshake Screen →',
      bgColor: 'bg-[#f07167]/15',
      accentColor: '#f07167',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Welcome & Reputation Banner ───────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#00afb9]/15 text-[#0081a7] border border-[#00afb9]/30">
              ✓ Verified Student Member
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fed9b7] text-[#334155] border border-[#00afb9]/20" title={collegeDisplay}>
              🏫 {collegeDisplay}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0081a7] tracking-tight">
            Welcome, {user?.fullName || 'Student'}!
          </h1>
          <p className="text-sm text-[#334155] mt-1 font-medium max-w-xl">
            Trade Gear. Share Skills. Match Study Sessions — inside your verified campus network.
          </p>
        </div>

        {/* Karma Stat Card & Profile link */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKarmaModal(true)}
            title="Click to view Karma Collection History & Rewards"
            className="bg-[#fdfcdc] hover:bg-[#fed9b7]/40 border-2 border-[#00afb9] rounded-2xl p-4 text-center min-w-[150px] shadow-xs transition cursor-pointer group"
          >
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Reputation
            </span>
            <div className="text-3xl font-black text-[#0081a7] my-0.5 group-hover:scale-105 transition transform">
              ⚡ {user?.karmaScore ?? 10}
            </div>
            <span className="text-[11px] font-extrabold text-[#00afb9] block underline">
              View Karma History ➔
            </span>
          </button>

          <Link
            href="/profile"
            className="px-4 py-4 bg-[#0081a7] hover:bg-[#00afb9] text-white text-xs font-bold rounded-2xl transition shadow-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
          >
            <span className="text-lg">👤</span>
            <span>My Profile</span>
          </Link>
        </div>
      </div>

      {/* ── Student Basic Info & Profile Card ─────────────────────────── */}
      <div className="bg-[#fdfcdc] rounded-3xl p-6 border border-[#00afb9]/30 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#00afb9]/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0081a7] text-white font-black flex items-center justify-center text-xl shadow-xs">
              {user?.fullName?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#0081a7]">
                  {user?.fullName || 'Student'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00afb9]/20 text-[#0081a7]">
                  Active Member
                </span>
              </div>
              <p className="text-xs text-[#334155] font-medium mt-0.5">
                {collegeDisplay}
              </p>
            </div>
          </div>

          <Link
            href="/setup-profile"
            className="text-xs font-bold text-[#0081a7] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>✏️</span> Edit Details
          </Link>
        </div>

        {/* Key Info Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-gray-200">
            <span className="text-gray-400 block text-[11px] font-medium">Department</span>
            <span className="font-extrabold text-[#334155]">{user?.department || 'Computer Science'}</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-200">
            <span className="text-gray-400 block text-[11px] font-medium">Academic Year</span>
            <span className="font-extrabold text-[#334155]">
              Year {user?.academicYear || 2} {user?.section ? `(Sec ${user.section})` : ''}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-200">
            <span className="text-gray-400 block text-[11px] font-medium">College Roll / ID</span>
            <span className="font-extrabold font-mono text-[#0081a7]">{user?.collegeId || 'PENDING'}</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-200">
            <span className="text-gray-400 block text-[11px] font-medium">Karma Status</span>
            <span className="font-extrabold text-amber-700">⚡ {user?.karmaScore ?? 10} Tokens</span>
          </div>
        </div>

        {/* Skills Summary */}
        {user?.skillsOffered && user.skillsOffered.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#00afb9]/15 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-gray-500">Your Offered Skills:</span>
            {user.skillsOffered.map((s) => (
              <span key={s} className="px-2.5 py-0.5 bg-white text-[#0081a7] font-bold text-[10px] rounded-full border border-[#0081a7]/20">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Action Shortcuts ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'List Academic Gear', href: '/marketplace', icon: '📦', color: 'hover:border-[#0081a7]' },
          { label: 'Find Peer Mentor', href: '/skills', icon: '🧑‍🏫', color: 'hover:border-[#00afb9]' },
          { label: 'Join Study Pod', href: '/study-groups', icon: '📚', color: 'hover:border-indigo-400' },
          { label: 'Explore Campus Map', href: '/map', icon: '🗺️', color: 'hover:border-emerald-400' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`p-4 bg-white rounded-2xl border border-gray-200 shadow-xs transition flex items-center gap-3 ${action.color}`}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-xs font-bold text-[#334155] leading-tight">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Four Platform Pillars Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platformPillars.map((p) => (
          <div
            key={p.title}
            className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${p.bgColor} flex items-center justify-center text-2xl shadow-xs`}
                >
                  {p.icon}
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fed9b7] text-[#334155]">
                  {p.tag}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-[#0081a7]">{p.title}</h2>
              <p className="text-xs text-[#334155] mt-2 leading-relaxed font-medium">
                {p.desc}
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100">
              <Link
                href={p.href}
                className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-bold text-white bg-[#0081a7] hover:bg-[#00afb9] transition block shadow-xs"
              >
                {p.action}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── Live Campus Karma Leaderboard ─────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-[#0081a7] flex items-center gap-2">
              <span>⚡</span> Campus Karma Leaderboard
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Recognizing top PSIT peers for verified academic handshakes and mentorship.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fed9b7] text-[#334155]">
            PSIT Campus Rank
          </span>
        </div>

        {loadingLeaderboard ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading campus rankings...</div>
        ) : leaderboard.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No student rankings available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Top Skills</th>
                  <th className="py-2.5 px-3 text-right">Campus Karma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.slice(0, 5).map((peer, idx) => {
                  const rankIcons = ['🥇', '🥈', '🥉', '4', '5'];
                  const isCurrentUser = peer._id === user?.id;
                  return (
                    <tr
                      key={peer._id}
                      className={`hover:bg-gray-50 transition ${
                        isCurrentUser ? 'bg-[#fdfcdc] font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-sm">
                        {idx < 3 ? rankIcons[idx] : `#${rankIcons[idx]}`}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-[#0081a7]">
                          {peer.fullName} {isCurrentUser && '(You)'}
                        </div>
                        <span className="text-[10px] text-[#00afb9] font-bold">
                          ✓ Verified PSIT
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#334155]">
                        {peer.department || 'Computer Science'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {peer.skillsOffered?.slice(0, 2).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-sm text-[#0081a7]">
                        ⚡ {peer.karmaScore}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 60-Second Demo User Flow Guide ────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          🎬 The CampusConnect Verified Journey
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#0081a7]/10 rounded-xl">
            <strong className="text-[#0081a7] block mb-1">01. Discover</strong>
            Browse academic equipment or find DBMS / OS peer mentors.
          </div>
          <div className="p-3 bg-[#00afb9]/15 rounded-xl">
            <strong className="text-[#0081a7] block mb-1">02. Coordinate</strong>
            Join study pods or schedule 1-on-1 sessions at Library Pod 3.
          </div>
          <div className="p-3 bg-[#fed9b7]/40 rounded-xl">
            <strong className="text-[#334155] block mb-1">03. Handshake</strong>
            Meet in Safe Exchange Zones and verify with 6-digit OTP & QR.
          </div>
          <div className="p-3 bg-[#f07167]/15 rounded-xl">
            <strong className="text-[#f07167] block mb-1">04. Earn & Review</strong>
            Earn +15 Karma per exchange, plus +5 bonus for 5-star peer reviews!
          </div>
        </div>
      </div>

      {/* Karma Collection History & Rewards Hub Modal */}
      <KarmaModal
        isOpen={showKarmaModal}
        onClose={() => setShowKarmaModal(false)}
      />
    </div>
  );
}
