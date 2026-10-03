'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { skillsAPI, studyGroupAPI } from '@/lib/apiClient';

interface PeerMentor {
  _id: string;
  fullName: string;
  email: string;
  department: string;
  academicYear: number;
  karmaScore: number;
  skillsOffered: string[];
  skillsNeeded: string[];
  skillLevel?: string;
  bio?: string;
  isVerified: boolean;
}

export default function SkillsPage() {
  const [peers, setPeers] = useState<PeerMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectQuery, setSubjectQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Booking Modal State
  const [bookingPeer, setBookingPeer] = useState<PeerMentor | null>(null);
  const [bookedTopic, setBookedTopic] = useState('');
  const [bookedLocation, setBookedLocation] = useState('Library Pod 3 (Quiet Study Zone)');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  const fetchPeers = async () => {
    try {
      setLoading(true);
      const params: { subjectCode?: string; skillLevel?: string } = {};
      if (subjectQuery) params.subjectCode = subjectQuery;
      if (selectedLevel !== 'all') params.skillLevel = selectedLevel;

      const res = await skillsAPI.matchPeers(params);
      setPeers(res.data.data || []);
    } catch (err) {
      console.error('Failed to match peers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeers();
  }, [selectedLevel]);

  const handleOpenBooking = (peer: PeerMentor) => {
    setBookingPeer(peer);
    setBookedTopic(peer.skillsOffered?.[0] ? `${peer.skillsOffered[0]} 1-on-1 Mentorship` : 'Academic Mentorship');
    setBookingSuccess(false);
    setCreatedRoomId(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPeer || !bookedTopic) return;

    try {
      setBookingLoading(true);
      const res = await studyGroupAPI.createStudyGroup({
        subject: bookedTopic,
        location: bookedLocation,
        subjectCode: bookingPeer.skillsOffered?.[0] || 'KCS501',
      });

      const newGroup = res.data?.data;
      setBookingSuccess(true);
      if (newGroup?._id) setCreatedRoomId(newGroup._id);
    } catch (err: unknown) {
      console.error('Failed to book session', err);
      alert('Could not schedule mentorship session. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="pb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0081a7] tracking-tight">
            Peer Skill Exchange & Mentorship
          </h1>
          <p className="text-sm text-[#334155] mt-1 font-medium">
            Connect directly with verified PSIT senior peers for 1-on-1 exam prep, code reviews, and project guidance.
          </p>
        </div>

        <Link
          href="/setup-profile"
          className="px-4 py-2.5 bg-[#fed9b7] hover:bg-[#fed9b7]/80 text-[#334155] text-xs font-bold rounded-2xl transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>💡</span> Offer Your Skills
        </Link>
      </div>

      {/* ── Search & Filter Bar ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-3xl border border-gray-200 shadow-xs">
        <div className="flex-1 w-full relative">
          <span className="absolute left-3.5 top-2.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search skill or subject (e.g. DBMS, Python, React, DSA, Java)..."
            value={subjectQuery}
            onChange={(e) => setSubjectQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPeers()}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0081a7]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Level:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0081a7]"
          >
            <option value="all">All Skill Levels</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button
            onClick={fetchPeers}
            className="px-5 py-2 bg-[#0081a7] hover:bg-[#00afb9] text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Peer Mentor Cards Grid ────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-64 p-6 border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : peers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 space-y-3">
          <span className="text-4xl">🧑‍🏫</span>
          <h3 className="text-lg font-bold text-gray-700">No peer mentors matched your search</h3>
          <p className="text-xs text-gray-400">Try searching for other subjects or reset filters.</p>
          <button
            onClick={() => { setSubjectQuery(''); setSelectedLevel('all'); fetchPeers(); }}
            className="px-4 py-2 bg-[#0081a7] text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peers.map((peer) => (
            <div
              key={peer._id}
              className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header Profile Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0081a7] to-[#00afb9] text-white font-black flex items-center justify-center text-lg shadow-xs">
                      {peer.fullName[0]?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0081a7] text-base leading-tight">
                        {peer.fullName}
                      </h3>
                      <span className="text-[11px] text-gray-500 block">
                        {peer.department} · Year {peer.academicYear}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fdfcdc] text-[#0081a7] text-xs font-black border border-[#00afb9]/30">
                      ⚡ {peer.karmaScore}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {peer.bio && (
                  <p className="text-xs text-[#334155] mb-4 line-clamp-2 leading-relaxed italic bg-gray-50 p-2.5 rounded-xl">
                    &ldquo;{peer.bio}&rdquo;
                  </p>
                )}

                {/* Skills Offered */}
                <div className="space-y-2 mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
                    Can Teach / Mentor in:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.skillsOffered?.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0081a7]/10 text-[#0081a7]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills Needed */}
                {peer.skillsNeeded && peer.skillsNeeded.length > 0 && (
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">
                      Wants to learn:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {peer.skillsNeeded.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100 mt-2">
                <button
                  onClick={() => handleOpenBooking(peer)}
                  className="w-full py-2.5 bg-[#0081a7] hover:bg-[#00afb9] text-white text-xs font-extrabold rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📅</span> Request Mentorship Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Mentorship Booking Modal ──────────────────────────────────── */}
      {bookingPeer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-lg font-black text-[#0081a7]">
                  Book 1-on-1 Mentorship
                </h2>
                <p className="text-xs text-gray-500">with {bookingPeer.fullName}</p>
              </div>
              <button
                onClick={() => setBookingPeer(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-gray-900">Session Pod Created!</h3>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  A live collaborative study room has been opened for you and {bookingPeer.fullName}.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/study-groups"
                    className="w-full py-3 bg-[#0081a7] hover:bg-[#00afb9] text-white text-xs font-bold rounded-xl transition shadow-xs text-center"
                  >
                    Enter Live Study Room Chat →
                  </Link>
                  <button
                    onClick={() => setBookingPeer(null)}
                    className="w-full py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Subject / Discussion Topic *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookedTopic}
                    onChange={(e) => setBookedTopic(e.target.value)}
                    placeholder="e.g., DBMS Normalization or React Custom Hooks"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0081a7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Campus Location *
                  </label>
                  <select
                    value={bookedLocation}
                    onChange={(e) => setBookedLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0081a7]"
                  >
                    <option value="Library Pod 3 (Quiet Study Zone)">Library Pod 3 (Quiet Study Zone)</option>
                    <option value="CS Lab 2 (Terminal Room)">CS Lab 2 (Terminal Room)</option>
                    <option value="Central Courtyard Gazebo">Central Courtyard Gazebo</option>
                    <option value="Auditorium Foyer Pod B">Auditorium Foyer Pod B</option>
                    <option value="Cafeteria Study Nook">Cafeteria Study Nook</option>
                  </select>
                </div>

                <div className="p-3 bg-[#fdfcdc] border border-[#00afb9]/30 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-[#0081a7] flex items-center gap-1">
                    <span>⚡</span> Peer Exchange Incentive
                  </div>
                  <p className="text-gray-600 text-[11px]">
                    After your session, complete a 1-minute peer review to award +5 Karma to your mentor!
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingPeer(null)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-2 py-3 bg-[#0081a7] hover:bg-[#00afb9] text-white text-xs font-extrabold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {bookingLoading ? 'Scheduling...' : 'Schedule & Open Room'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
