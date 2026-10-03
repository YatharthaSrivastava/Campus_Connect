'use client';
import { useState, useEffect, useRef } from 'react';
import { studyGroupAPI } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';

interface StudySession {
  _id: string;
  subjectCode: string;
  subject: string;
  creatorName: string;
  location: string;
  maxParticipants: number;
  attendeeList: string[];
  createdAt: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  message: string;
  senderName: string;
  senderEmail: string;
  timestamp: string;
}

export default function StudyGroupsPage() {
  const { user } = useAuth();

  const [groups, setGroups] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Chat Room state
  const [activeRoom, setActiveRoom] = useState<StudySession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newLocation, setNewLocation] = useState('Library Pod 3');
  const [newCode, setNewCode] = useState('KCS501');
  const [isCreating, setIsCreating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const campusHotspots = [
    'Library Pod 3 (Quiet Study Zone)',
    'CS Lab 2 (Terminal Room)',
    'Central Courtyard Gazebo',
    'Auditorium Foyer Pod B',
    'Cafeteria Study Nook',
  ];

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await studyGroupAPI.getStudyGroups();
      const list = res.data.data || [];
      setGroups(list);
      if (list.length > 0 && !activeRoom) {
        joinRoom(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch study groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // WebSocket Room & Messaging Listener
  useEffect(() => {
    const socket = getSocket();

    socket.on('receive_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    socket.on('error', (err: { message: string }) => {
      alert(`WebSocket: ${err.message}`);
    });

    return () => {
      socket.off('receive_message');
      socket.off('error');
    };
  }, []);

  const joinRoom = (group: StudySession) => {
    setActiveRoom(group);
    const roomId = `room_${group._id}`;
    const socket = getSocket();

    // Per API Reference: socket.emit('join_study_room', { roomId: '...' });
    socket.emit('join_study_room', { roomId });

    // Initial greeting in channel
    setMessages([
      {
        id: 'sys_1',
        roomId,
        message: `Welcome to ${group.subject} study room at ${group.location}! Only verified PSIT peers are connected.`,
        senderName: 'CampusConnect Bot',
        senderEmail: 'system@psit.ac.in',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeRoom) return;

    const socket = getSocket();
    const roomId = `room_${activeRoom._id}`;

    socket.emit('send_message', {
      roomId,
      message: inputMsg.trim(),
      senderName: user?.fullName || 'PSIT Student',
      senderEmail: user?.email || '',
    });

    setInputMsg('');
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newLocation) return;

    try {
      setIsCreating(true);
      const res = await studyGroupAPI.createStudyGroup({
        subject: newSubject,
        location: newLocation,
        subjectCode: newCode,
      });

      setShowCreateModal(false);
      setNewSubject('');
      await fetchGroups();
      if (res.data?.data) {
        joinRoom(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create study group');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-[#005F73] tracking-tight">
            Study Group Finder & Live Rooms
          </h1>
          <p className="text-sm text-[#334155] mt-1 font-medium">
            Subject-based group matching around PSIT campus study pods and library zones.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-[#005F73] text-white font-bold rounded-xl hover:bg-[#0A9396] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>+</span> Host New Study Session
        </button>
      </div>

      {/* Main Study Hub split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Study Groups List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Active Campus Sessions ({groups.length})
          </h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white rounded-2xl border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => {
                const isSelected = activeRoom?._id === g._id;
                return (
                  <div
                    key={g._id}
                    onClick={() => joinRoom(g)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-white border-[#005F73] shadow-md ring-2 ring-[#005F73]/20'
                        : 'bg-white border-gray-200 hover:border-[#0A9396]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E9D8A6] text-[#334155]">
                        {g.subjectCode}
                      </span>
                      <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        Live Channel
                      </span>
                    </div>

                    <h3 className="font-bold text-[#005F73] text-sm mt-1">{g.subject}</h3>

                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span>📍</span> {g.location}
                    </p>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Host: {g.creatorName}</span>
                      <span>👥 {g.attendeeList?.length || 1} joined</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Real-time WebSocket Study Room Chat */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-xs flex flex-col h-[520px]">
          {activeRoom ? (
            <>
              {/* Room Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-3xl">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#005F73]">
                      {activeRoom.subject}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#0A9396]/15 text-[#005F73]">
                      {activeRoom.subjectCode}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <span>📍 Meetup Spot:</span> <strong>{activeRoom.location}</strong>
                  </p>
                </div>

                <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                  ⚡ Socket.io Sandboxed
                </span>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isMe = m.senderEmail === user?.email;
                  const isBot = m.senderName === 'CampusConnect Bot';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        isBot ? 'items-center' : isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      {isBot ? (
                        <div className="p-2.5 bg-[#faf8f5] border border-[#0A9396]/30 rounded-xl text-xs text-center text-[#334155] max-w-md">
                          🤖 {m.message}
                        </div>
                      ) : (
                        <div className="max-w-[75%] space-y-1">
                          <span className="text-[10px] text-gray-400 block px-1">
                            {isMe ? 'You' : m.senderName}
                          </span>
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-[#005F73] text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Coordinate with study group peers..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#005F73]"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim()}
                  className="px-5 py-2 bg-[#005F73] hover:bg-[#0A9396] text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400">
              Select or host a study session to join live chat
            </div>
          )}
        </div>
      </div>

      {/* Host New Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-[#005F73]">Host Campus Study Session</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DBMS - SQL Joins & Normalization"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#005F73]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. KCS501"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#005F73]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Campus Location / Hotspot *
                </label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#005F73] bg-white"
                >
                  {campusHotspots.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 text-sm font-bold bg-[#005F73] hover:bg-[#0A9396] text-white rounded-xl shadow-xs"
                >
                  {isCreating ? 'Creating...' : 'Start Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
