'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

const FEATURES = [
  {
    icon: '📦',
    title: 'Campus Marketplace',
    description:
      'Buy, sell, or rent semester textbooks, lab coats, engineering drafters, and calculators — peer-to-peer within your verified campus network.',
    color: 'from-[#0081a7] to-[#00afb9]',
  },
  {
    icon: '🧑‍🏫',
    title: 'Peer Skill Exchange',
    description:
      'Connect with senior students for 1-on-1 DBMS tutoring, code reviews, DSA prep, and project mentorship — earn Campus Karma for every session.',
    color: 'from-[#00afb9] to-teal-400',
  },
  {
    icon: '📚',
    title: 'Real-Time Study Groups',
    description:
      'Find active study sessions happening right now across Library Pods, CS Labs, and campus hotspots. Join live via WebSocket-powered group chat.',
    color: 'from-indigo-500 to-[#0081a7]',
  },
  {
    icon: '🤝',
    title: 'Cryptographic Handshake',
    description:
      'Complete physical transfers with a CSPRNG-generated 6-digit OTP and ephemeral QR code — verified in seconds, with +15 Karma tokens awarded instantly.',
    color: 'from-[#f07167] to-orange-400',
  },
  {
    icon: '🗺️',
    title: 'Interactive Campus Map',
    description:
      'Discover geo-tagged study pods, designated Safe Exchange Zones, and active peer clusters across the PSIT campus in real time.',
    color: 'from-green-500 to-emerald-400',
  },
  {
    icon: '⚡',
    title: 'Karma Reputation System',
    description:
      'Every verified exchange, tutoring session, and 5-star rating builds your Campus Karma score — your trust passport in the CampusConnect ecosystem.',
    color: 'from-amber-500 to-yellow-400',
  },
];

const STATS = [
  { label: 'Active Students', value: '1,200+', icon: '👥' },
  { label: 'Items Exchanged', value: '850+', icon: '📦' },
  { label: 'Study Sessions', value: '340+', icon: '📚' },
  { label: 'Karma Tokens Awarded', value: '12,000+', icon: '⚡' },
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const openModal = (tab: 'login' | 'signup') => {
    setModalTab(tab);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fdfcdc] text-[#334155]">
      {/* ── Sticky Top Navigation Bar ─────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#00afb9]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0081a7] flex items-center justify-center text-white text-lg">
              🎓
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#0081a7] tracking-tight">
                CampusConnect
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fed9b7] text-[#334155]">
                PSIT Kanpur
              </span>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('login')}
              className="px-4 py-2 text-sm font-bold text-[#0081a7] hover:bg-[#fed9b7]/30 rounded-xl transition cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => openModal('signup')}
              className="px-4 py-2 text-sm font-bold text-white bg-[#0081a7] hover:bg-[#00afb9] rounded-xl transition shadow-sm cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0081a7] via-[#00afb9] to-teal-400 text-white py-24 px-4">
        {/* Abstract background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#fed9b7]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live on PSIT Campus — Kanpur
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Your Campus. <br />
            <span className="text-[#fed9b7]">Connected. Trusted. Rewarded.</span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            CampusConnect is a{' '}
            <strong className="text-white">peer-to-peer academic exchange platform</strong> built
            exclusively for PSIT students — trade gear, share skills, find study groups, and earn
            Campus Karma for every verified interaction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openModal('signup')}
              className="px-8 py-4 bg-white text-[#0081a7] font-extrabold text-base rounded-2xl hover:bg-[#fdfcdc] transition shadow-lg cursor-pointer"
            >
              Join CampusConnect — Free
            </button>
            <button
              onClick={() => openModal('login')}
              className="px-8 py-4 border-2 border-white/40 text-white font-bold text-base rounded-2xl hover:bg-white/10 transition cursor-pointer"
            >
              Sign In to Your Account
            </button>
          </div>
        </div>
      </section>

      {/* ── Live Stats Bar ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black text-[#0081a7]">{s.value}</div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platform Features Grid ─────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-[#0081a7] mb-4">
            Everything your campus life needs
          </h2>
          <p className="text-[#334155] text-base max-w-2xl mx-auto">
            Six integrated modules that create a complete, trust-verified campus ecosystem — from
            the first textbook you sell to the last exam you ace together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition group"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-sm`}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-extrabold text-[#0081a7] mb-2 group-hover:text-[#00afb9] transition">
                {f.title}
              </h3>
              <p className="text-sm text-[#334155] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-black text-[#0081a7] mb-3">How it works</h2>
          <p className="text-[#334155]">From sign-up to verified campus exchange in 4 steps.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Create Account',
              desc: 'Sign up with any email address in under 30 seconds.',
              icon: '✉️',
            },
            {
              step: '02',
              title: 'Complete Profile',
              desc: 'Add your department, year, and skills to unlock matching.',
              icon: '🪪',
            },
            {
              step: '03',
              title: 'Discover & Connect',
              desc: 'Browse marketplace gear, find peer mentors, or join live study rooms.',
              icon: '🔍',
            },
            {
              step: '04',
              title: 'Handshake & Earn',
              desc: 'Meet at a campus hotspot, scan QR / enter OTP, earn +15 Karma.',
              icon: '🤝',
            },
          ].map((item) => (
            <div key={item.step} className="relative text-center p-6 rounded-3xl bg-[#fdfcdc] border border-[#00afb9]/20">
              <div className="w-12 h-12 rounded-full bg-[#0081a7] text-white font-black text-sm flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="font-extrabold text-[#0081a7] mb-1">{item.title}</h4>
              <p className="text-xs text-[#334155] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust & Security Section ────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#0081a7] to-[#00afb9] rounded-3xl p-10 text-white text-center shadow-lg">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-2xl md:text-3xl font-black mb-3">
            Built on a Zero-Trust Security Engine
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-sm leading-relaxed">
            Every transaction is protected by CSPRNG-generated OTPs, SHA-256 hashing, and
            constant-time verification. Ephemeral QR codes expire in 15 minutes — making every
            campus exchange cryptographically secure.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              '🔑 CSPRNG OTP',
              '🛡️ SHA-256 Storage',
              '⏱️ 15-min TTL',
              '📡 Socket.io Real-time',
              '🗺️ Geospatial Hotspots',
              '⚡ Karma Token Ledger',
            ].map((badge) => (
              <span
                key={badge}
                className="px-4 py-2 bg-white/15 border border-white/20 rounded-full text-xs font-bold"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#fed9b7]/30 border-t border-[#00afb9]/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-[#0081a7] mb-3">
            Ready to join the campus network?
          </h2>
          <p className="text-[#334155] text-sm mb-8">
            Sign up for free and start earning Campus Karma from your very first exchange.
          </p>
          <button
            onClick={() => openModal('signup')}
            className="px-10 py-4 bg-[#0081a7] hover:bg-[#00afb9] text-white font-extrabold text-base rounded-2xl transition shadow-md cursor-pointer"
          >
            Get Started — It&apos;s Free 🚀
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-8 px-4 bg-white border-t border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">🎓</span>
          <span className="font-extrabold text-[#0081a7]">CampusConnect</span>
          <span className="text-xs text-gray-400">by HackForge · PSIT Kanpur</span>
        </div>
        <p className="text-xs text-gray-400">
          Built for Codeblitz 2.0 Hackathon · Pranveer Singh Institute of Technology, Kanpur
        </p>
      </footer>

      {/* ── Floating Auth Modal ─────────────────────────────────────────── */}
      {modalOpen && (
        <AuthModal
          defaultTab={modalTab}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
