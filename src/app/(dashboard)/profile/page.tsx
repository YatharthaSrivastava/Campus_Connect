'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { userAPI, ratingsAPI } from '@/lib/apiClient';

interface TransactionItem {
  _id: string;
  listingId?: string;
  buyerId: string;
  sellerId: string;
  status: string;
  completedAt?: string;
  createdAt: string;
}

interface PeerReview {
  _id: string;
  reviewerName: string;
  stars: number;
  feedback: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reviews'>('overview');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setLoadingHistory(true);
        // Load transactions
        const txRes = await userAPI.getMyTransactions();
        setTransactions(txRes.data.data || []);

        // Load reviews
        const revRes = await ratingsAPI.getUserRatings(user.id);
        const data = revRes.data.data || {};
        setReviews(data.ratings || []);
        if (data.averageRating) setAvgRating(data.averageRating);
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadData();
  }, [user]);

  const badges = [
    {
      name: 'PSIT Verified Student',
      icon: '🎓',
      desc: 'Officially authenticated student member of PSIT Kanpur.',
      unlocked: true,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Handshake Pioneer',
      icon: '🤝',
      desc: 'Completed verified cryptographic handshakes.',
      unlocked: transactions.length > 0 || (user?.karmaScore ?? 0) >= 20,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      name: 'Campus Mentor',
      icon: '💡',
      desc: 'Shared academic skills with peer students.',
      unlocked: (user?.skillsOffered?.length ?? 0) > 0,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      name: 'Five-Star Scholar',
      icon: '⭐',
      desc: 'Maintained a 4.5+ average rating from peers.',
      unlocked: avgRating >= 4.5,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Profile Header Card ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#005F73]/10 to-[#0A9396]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#005F73] to-[#0A9396] text-white flex items-center justify-center font-black text-3xl shadow-md">
              {user?.fullName?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#005F73]">{user?.fullName || 'Student'}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#0A9396]/15 text-[#005F73] border border-[#0A9396]/30">
                  ✓ Verified
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.email} · {user?.department || 'Computer Science'} · Year {user?.academicYear || 3}
                {user?.section ? ` · Sec ${user.section}` : ''}
              </p>
              {user?.collegeId && (
                <span className="inline-block mt-1 font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-bold">
                  Roll: {user.collegeId}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions & Karma Balance */}
          <div className="flex items-center gap-3">
            <div className="bg-[#faf8f5] border-2 border-[#0A9396] rounded-2xl px-5 py-3 text-center shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Reputation</span>
              <span className="text-2xl font-black text-[#005F73]">⚡ {user?.karmaScore ?? 10}</span>
              <span className="text-[10px] text-[#0A9396] font-bold block">Karma Tokens</span>
            </div>

            <Link
              href="/setup-profile"
              className="px-4 py-3 bg-[#005F73] hover:bg-[#0A9396] text-white text-xs font-bold rounded-2xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>✏️</span> Edit Profile
            </Link>
          </div>
        </div>

        {/* Bio */}
        {user?.bio && (
          <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-[#334155] leading-relaxed">
            &ldquo;{user.bio}&rdquo;
          </div>
        )}
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────────────── */}
      <div className="flex bg-white rounded-2xl p-1.5 border border-gray-200 shadow-xs max-w-md">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#005F73] text-white shadow-xs'
              : 'text-[#334155] hover:bg-gray-100'
          }`}
        >
          Overview & Skills
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#005F73] text-white shadow-xs'
              : 'text-[#334155] hover:bg-gray-100'
          }`}
        >
          Handshakes ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-[#005F73] text-white shadow-xs'
              : 'text-[#334155] hover:bg-gray-100'
          }`}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {/* ── Tab Content: Overview ───────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Offered Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-[#005F73] text-base flex items-center gap-2">
                <span>💡</span> Skills You Can Offer / Teach
              </h2>
              <Link href="/setup-profile" className="text-xs text-[#0A9396] font-bold hover:underline">
                Manage
              </Link>
            </div>
            {user?.skillsOffered && user.skillsOffered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#005F73]/10 text-[#005F73] border border-[#005F73]/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                No skills added yet.{' '}
                <Link href="/setup-profile" className="text-[#005F73] font-bold hover:underline">
                  Add skills you can help peers with.
                </Link>
              </p>
            )}
          </div>

          {/* Skills Needed Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-[#0A9396] text-base flex items-center gap-2">
                <span>📚</span> Skills You Want to Learn
              </h2>
              <Link href="/setup-profile" className="text-xs text-[#0A9396] font-bold hover:underline">
                Manage
              </Link>
            </div>
            {user?.skillsNeeded && user.skillsNeeded.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skillsNeeded.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#0A9396]/15 text-[#005F73] border border-[#0A9396]/25"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                No learning goals added yet.{' '}
                <Link href="/setup-profile" className="text-[#0A9396] font-bold hover:underline">
                  Add subjects you need help with.
                </Link>
              </p>
            )}
          </div>

          {/* Badges Grid (Full width) */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-[#005F73] text-base flex items-center gap-2">
              <span>🏆</span> Campus Badges & Trust Accreditations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {badges.map((b) => (
                <div
                  key={b.name}
                  className={`p-4 rounded-2xl border transition ${
                    b.unlocked ? b.color : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <h3 className="font-bold text-xs">{b.name}</h3>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{b.desc}</p>
                  <span className="inline-block mt-2 text-[10px] font-extrabold uppercase">
                    {b.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content: History ────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="font-extrabold text-[#005F73] text-base">
              🤝 Verified Handshake History
            </h2>
            <span className="text-xs text-gray-400">Total: {transactions.length} transfers</span>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading history...</div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <span className="text-3xl">📦</span>
              <p className="text-sm font-bold text-gray-600">No completed transactions yet</p>
              <p className="text-xs text-gray-400">
                Browse the marketplace or match with a peer to complete your first physical transfer!
              </p>
              <Link
                href="/marketplace"
                className="inline-block mt-3 px-4 py-2 bg-[#005F73] text-white text-xs font-bold rounded-xl"
              >
                Browse Marketplace →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <div key={tx._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-700">
                        TX: {tx._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {tx.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#005F73]">+15 Karma Earned</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: Reviews ────────────────────────────────────── */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="font-extrabold text-[#005F73] text-base">
                ⭐ Peer Feedback & Reviews
              </h2>
              <span className="text-xs text-gray-500">
                Average Rating:{' '}
                <strong className="text-amber-500 font-extrabold">★ {avgRating}</strong> ({reviews.length} reviews)
              </span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <span className="text-3xl">⭐</span>
              <p className="text-sm font-bold text-gray-600">No reviews received yet</p>
              <p className="text-xs text-gray-400">
                Complete exchanges or mentor a peer to earn 5-star ratings and karma bonuses!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#005F73]">{r.reviewerName}</span>
                    <div className="flex text-amber-400 text-sm">
                      {Array.from({ length: r.stars }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#334155]">{r.feedback || 'Great exchange!'}</p>
                  <span className="text-[10px] text-gray-400 block">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
