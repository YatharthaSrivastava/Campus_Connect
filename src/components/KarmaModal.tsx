'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userAPI } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

interface KarmaHistoryEntry {
  _id: string;
  amount: number;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

interface KarmaEarnGuide {
  action: string;
  points: string;
  icon: string;
  desc: string;
}

interface KarmaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KarmaModal({ isOpen, onClose }: KarmaModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'earn'>('history');
  const [history, setHistory] = useState<KarmaHistoryEntry[]>([]);
  const [earnGuide, setEarnGuide] = useState<KarmaEarnGuide[]>([]);
  const [tier, setTier] = useState('Bronze Scholar');
  const [nextTier, setNextTier] = useState('Silver Mentor');
  const [nextTierPoints, setNextTierPoints] = useState(50);
  const [totalEarned, setTotalEarned] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchKarmaData() {
      try {
        setLoading(true);
        const res = await userAPI.getKarmaHistory();
        const data = res.data.data || {};
        setHistory(data.history || []);
        setEarnGuide(data.earnGuide || []);
        if (data.tier) setTier(data.tier);
        if (data.nextTier) setNextTier(data.nextTier);
        if (data.nextTierPoints) setNextTierPoints(data.nextTierPoints);
        if (data.totalEarned) setTotalEarned(data.totalEarned);
      } catch (err) {
        console.error('Failed to load karma data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchKarmaData();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentKarma = user?.karmaScore ?? 10;
  const progressPercent = Math.min(100, Math.round((currentKarma / nextTierPoints) * 100));

  const tierBadges: Record<string, { color: string; icon: string }> = {
    'Bronze Scholar': { color: 'bg-[#E9D8A6]/60 text-[#BB3E03] border-[#EE9B00]/40', icon: '🥉' },
    'Silver Mentor': { color: 'bg-slate-100 text-slate-800 border-slate-300', icon: '🥈' },
    'Gold Pioneer': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🥇' },
    'Platinum Legend': { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '💎' },
  };

  const currentTierBadge = tierBadges[tier] || tierBadges['Bronze Scholar'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-[#0A9396]/20 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header with Ocean Sunset Gradient ───────────────────── */}
        <div className="bg-gradient-to-br from-[#001219] via-[#005F73] to-[#0A9396] p-6 text-white text-center relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>

          <span className="text-4xl block mb-1">⚡</span>
          <h2 className="text-2xl font-black tracking-tight">Campus Karma Hub</h2>
          <p className="text-[#94D2BD] text-xs mt-0.5">Your Academic Trust & Reputation Passport</p>

          {/* Balance & Tier Row */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold">
              Balance: <span className="text-lg font-black text-[#EE9B00]">⚡ {currentKarma}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${currentTierBadge.color}`}>
              {currentTierBadge.icon} {tier}
            </div>
          </div>

          {/* Tier Progress Bar */}
          {nextTierPoints > currentKarma && (
            <div className="mt-4 max-w-xs mx-auto text-left">
              <div className="flex justify-between text-[11px] text-[#E9D8A6] font-semibold mb-1">
                <span>Next Tier: {nextTier}</span>
                <span>{currentKarma} / {nextTierPoints}</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#EE9B00] to-[#CA6702] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex bg-black/25 rounded-2xl p-1 mt-5 gap-1 border border-white/10">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-[#005F73] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              📜 Karma History
            </button>
            <button
              onClick={() => setActiveTab('earn')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                activeTab === 'earn'
                  ? 'bg-white text-[#005F73] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              🚀 How to Earn More
            </button>
          </div>
        </div>

        {/* ── Modal Content ───────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading your karma ledger...</div>
          ) : activeTab === 'history' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b">
                <span>Recorded Activity Log</span>
                <span className="font-extrabold text-[#005F73]">Lifetime Points: +{totalEarned}</span>
              </div>

              {history.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No karma transactions recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 space-y-1">
                  {history.map((item) => {
                    const iconMap: Record<string, string> = {
                      welcome: '🎉',
                      handshake: '🤝',
                      rating: '⭐',
                      listing: '📦',
                      mentor: '🧑‍🏫',
                      general: '⚡',
                    };
                    const icon = iconMap[item.category] || '⚡';
                    return (
                      <div key={item._id} className="pt-3 pb-2 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl mt-0.5">{icon}</span>
                          <div>
                            <h4 className="text-xs font-bold text-[#001219]">{item.title}</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                            <span className="text-[10px] text-gray-400 block mt-1">
                              {new Date(item.createdAt).toLocaleDateString()} at{' '}
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <span className="px-2.5 py-1 rounded-full bg-[#94D2BD]/30 text-[#005F73] font-extrabold text-xs">
                            +{item.amount} Karma
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-gray-500 pb-2 border-b">
                Earn Karma points by participating in verified academic transfers and mentoring.
              </div>

              <div className="space-y-3">
                {earnGuide.map((rule) => (
                  <div
                    key={rule.action}
                    className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200 flex items-start justify-between gap-3 hover:border-[#0A9396] transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{rule.icon}</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#005F73]">{rule.action}</h4>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{rule.desc}</p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#E9D8A6] text-[#001219] font-black text-xs whitespace-nowrap">
                      {rule.points}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons to Earn */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/marketplace"
                  onClick={onClose}
                  className="py-2.5 px-3 bg-[#005F73] hover:bg-[#0A9396] text-white text-xs font-bold rounded-xl text-center transition shadow-xs"
                >
                  📦 List Gear (+5)
                </Link>
                <Link
                  href="/skills"
                  onClick={onClose}
                  className="py-2.5 px-3 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white text-xs font-bold rounded-xl text-center transition shadow-xs"
                >
                  🧑‍🏫 Mentor Peers (+10)
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ────────────────────────────────────────────── */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 flex-shrink-0">
          <span>🔒 Cryptographically audited Karma ledger</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#005F73] hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
