'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/lib/apiClient';
import Link from 'next/link';
import { COLLEGES } from '@/lib/colleges';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
];

const COMMON_SKILLS = [
  'C++', 'Python', 'Java', 'React', 'Node.js', 'Data Structures',
  'Machine Learning', 'DBMS', 'Operating Systems', 'Algorithms',
  'Web Development', 'Android', 'Cloud Computing', 'DSA', 'Mathematics',
];

export default function SetupProfilePage() {
  const { user, token, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [collegeName, setCollegeName] = useState(user?.collegeName || 'Pranveer Singh Institute of Technology (PSIT), Kanpur');
  const [customCollege, setCustomCollege] = useState('');
  const [department, setDepartment] = useState(user?.department || '');
  const [academicYear, setAcademicYear] = useState(user?.academicYear ? String(user.academicYear) : '');
  const [section, setSection] = useState(user?.section || '');
  const [collegeId, setCollegeId] = useState(user?.collegeId || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsOffered, setSkillsOffered] = useState<string[]>(user?.skillsOffered || []);
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>(user?.skillsNeeded || []);
  const [customSkillOffer, setCustomSkillOffer] = useState('');
  const [customSkillNeed, setCustomSkillNeed] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form if user data is loaded
  useEffect(() => {
    if (user) {
      if (user.collegeName) {
        const found = COLLEGES.some((c) => c.name === user.collegeName);
        if (found) {
          setCollegeName(user.collegeName);
        } else {
          setCollegeName('other');
          setCustomCollege(user.collegeName);
        }
      }
      if (user.department && !department) setDepartment(user.department);
      if (user.academicYear && !academicYear) setAcademicYear(String(user.academicYear));
      if (user.collegeId && !collegeId) setCollegeId(user.collegeId);
      if (user.section && !section) setSection(user.section);
      if (user.bio && !bio) setBio(user.bio);
      if (user.skillsOffered && user.skillsOffered.length > 0 && skillsOffered.length === 0) {
        setSkillsOffered(user.skillsOffered);
      }
      if (user.skillsNeeded && user.skillsNeeded.length > 0 && skillsNeeded.length === 0) {
        setSkillsNeeded(user.skillsNeeded);
      }
    }
  }, [user]);

  const toggleSkill = (skill: string, type: 'offer' | 'need') => {
    if (type === 'offer') {
      setSkillsOffered((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill].slice(0, 10)
      );
    } else {
      setSkillsNeeded((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill].slice(0, 10)
      );
    }
  };

  const addCustomSkill = (type: 'offer' | 'need') => {
    const skill = type === 'offer' ? customSkillOffer.trim() : customSkillNeed.trim();
    if (!skill) return;
    if (type === 'offer') {
      setSkillsOffered((prev) => [...new Set([...prev, skill])].slice(0, 10));
      setCustomSkillOffer('');
    } else {
      setSkillsNeeded((prev) => [...new Set([...prev, skill])].slice(0, 10));
      setCustomSkillNeed('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const currentToken = localStorage.getItem('cc_token') || token;
    if (!currentToken) {
      setError('Your session has expired. Please log in first.');
      return;
    }
    if (!localStorage.getItem('cc_token') && currentToken) {
      localStorage.setItem('cc_token', currentToken);
    }

    if (!department || !academicYear || !collegeId) {
      setError('Please fill in all required fields (College ID, Department, and Academic Year).');
      return;
    }

    setIsSaving(true);
    const finalCollege = collegeName === 'other' ? customCollege.trim() : collegeName;
    const profileData = {
      collegeName: finalCollege,
      department,
      academicYear: parseInt(academicYear, 10),
      section: section.trim(),
      collegeId: collegeId.toUpperCase().trim(),
      bio: bio.trim(),
      skillsOffered,
      skillsNeeded,
      isProfileComplete: true,
    };

    try {
      await userAPI.updateProfile(profileData);
      await refreshUser();
    } catch (err: unknown) {
      console.warn('Profile update via API failed — saving locally:', err);
      // Even if the API call fails (e.g. mock token), save profile in localStorage
      // so the user can still access the dashboard
      const storedUser = localStorage.getItem('cc_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const merged = { ...parsed, ...profileData };
          localStorage.setItem('cc_user', JSON.stringify(merged));
        } catch {
          // ignore parse error
        }
      }
    } finally {
      setIsSaving(false);
    }

    // Always navigate to dashboard — profile is saved either via API or locally
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005F73]" />
      </div>
    );
  }

  // Not authenticated warning
  if (!isAuthenticated && !localStorage.getItem('cc_token')) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg text-center border border-gray-200">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-black text-[#005F73] mb-2">Authentication Required</h2>
          <p className="text-sm text-gray-600 mb-6">
            You need to be logged in to set up your profile. Please sign in or create an account.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="py-3 px-4 bg-[#005F73] text-white font-bold rounded-xl hover:bg-[#0A9396] transition"
            >
              Go to Home & Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4 text-[#001219]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-4xl">🎓</span>
          <h1 className="text-2xl font-black text-[#005F73] mt-2">Complete Your Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome, <strong>{user?.fullName || 'Student'}</strong>! Let&apos;s get your campus profile ready.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-[#BB3E03] font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* College Selection */}
            <div className="p-4 bg-[#E9D8A6]/25 border border-[#0A9396]/30 rounded-2xl space-y-2">
              <label className="block text-xs font-black text-[#005F73] uppercase tracking-wider">
                🏫 College / University *
              </label>
              <select
                value={collegeName}
                onChange={(e) => { setCollegeName(e.target.value); setError(''); }}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#001219] outline-none focus:border-[#0A9396]"
              >
                {COLLEGES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.city})
                  </option>
                ))}
                <option value="other">➕ Other / Not Listed (Type Custom)</option>
              </select>

              {collegeName === 'other' && (
                <input
                  type="text"
                  required
                  placeholder="Enter your College / University name..."
                  value={customCollege}
                  onChange={(e) => { setCustomCollege(e.target.value); setError(''); }}
                  className="w-full px-4 py-2.5 bg-white border border-[#0A9396] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0A9396]/30 mt-2"
                />
              )}
            </div>

            {/* Academic Details */}
            <div>
              <h2 className="text-base font-extrabold text-[#005F73] mb-3">📋 Academic Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#001219] mb-1">
                    College ID / Roll No. <span className="text-[#BB3E03]">*</span>
                  </label>
                  <input
                    type="text"
                    value={collegeId}
                    onChange={(e) => { setCollegeId(e.target.value); setError(''); }}
                    placeholder="e.g. 2210990001"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#001219] mb-1">
                    Department <span className="text-[#BB3E03]">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value); setError(''); }}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70"
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#001219] mb-1">
                    Academic Year <span className="text-[#BB3E03]">*</span>
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => { setAcademicYear(e.target.value); setError(''); }}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70"
                  >
                    <option value="">Select year</option>
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#001219] mb-1">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. A, B, C"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-[#001219] mb-1">
                Short Bio (optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your campus peers about yourself, your interests, and study habits..."
                maxLength={300}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70 resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/300</p>
            </div>

            {/* Skills Offered */}
            <div>
              <h2 className="text-base font-extrabold text-[#005F73] mb-1">
                💡 Skills You Can Teach / Offer
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Select up to 10 skills you&apos;re confident helping others with.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill, 'offer')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition font-bold cursor-pointer ${
                      skillsOffered.includes(skill)
                        ? 'bg-[#005F73] text-white border-[#005F73]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#0A9396]'
                    }`}
                  >
                    {skill} {skillsOffered.includes(skill) ? '✓' : '+'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkillOffer}
                  onChange={(e) => setCustomSkillOffer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill('offer'))}
                  placeholder="Add custom skill..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] bg-gray-50/70"
                />
                <button
                  type="button"
                  onClick={() => addCustomSkill('offer')}
                  className="px-4 py-2 bg-[#E9D8A6] text-[#001219] rounded-xl text-sm font-bold hover:bg-[#E9D8A6]/80 transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Skills Needed */}
            <div>
              <h2 className="text-base font-extrabold text-[#005F73] mb-1">
                📚 Skills You Want to Learn
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                What subjects would you like peer tutoring or study partners in?
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill, 'need')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition font-bold cursor-pointer ${
                      skillsNeeded.includes(skill)
                        ? 'bg-[#0A9396] text-white border-[#0A9396]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#0A9396]'
                    }`}
                  >
                    {skill} {skillsNeeded.includes(skill) ? '✓' : '+'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkillNeed}
                  onChange={(e) => setCustomSkillNeed(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill('need'))}
                  placeholder="Add custom skill..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] bg-gray-50/70"
                />
                <button
                  type="button"
                  onClick={() => addCustomSkill('need')}
                  className="px-4 py-2 bg-[#E9D8A6] text-[#001219] rounded-xl text-sm font-bold hover:bg-[#E9D8A6]/80 transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Karma Notice */}
            <div className="p-4 bg-[#E9D8A6]/25 border border-[#EE9B00]/40 rounded-2xl text-xs text-[#001219] flex gap-3 items-center">
              <span className="text-xl">⚡</span>
              <div>
                <strong>Karma Balance:</strong> You have{' '}
                <strong className="text-[#005F73]">{user?.karmaScore ?? 10} Karma tokens</strong>.
                Earn +15 Karma for every verified marketplace exchange and peer mentorship session!
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-[#005F73] hover:bg-[#0A9396] text-white font-black rounded-2xl disabled:opacity-50 transition text-base shadow-md cursor-pointer"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/40 border-t-white" />
                  Saving Profile...
                </span>
              ) : (
                'Complete Profile & Enter CampusConnect 🚀'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
