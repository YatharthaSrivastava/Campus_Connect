'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { COLLEGES } from '@/lib/colleges';

export default function RegisterPage() {
  const [collegeName, setCollegeName] = useState(COLLEGES[0].name);
  const [customCollege, setCustomCollege] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalCollege = collegeName === 'other' ? customCollege.trim() : collegeName;
    if (!finalCollege) {
      setError('Please select or enter your college name.');
      return;
    }

    setIsLoading(true);
    try {
      await register(email.trim(), fullName.trim(), finalCollege);
      router.push('/setup-profile');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-[#005F73] rounded-2xl flex items-center justify-center text-white text-xl mx-auto mb-3 shadow-sm">
          🎓
        </div>
        <h1 className="text-2xl font-extrabold text-[#005F73]">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1">Join the verified inter-campus peer network</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#BB3E03] font-semibold">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: College Selection First */}
        <div className="p-3.5 bg-[#E9D8A6]/25 border border-[#0A9396]/30 rounded-2xl space-y-2">
          <label className="block text-xs font-black text-[#005F73] uppercase tracking-wider">
            🏫 1. Select Your College / University First *
          </label>
          <select
            value={collegeName}
            onChange={(e) => { setCollegeName(e.target.value); setError(''); }}
            required
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#001219] outline-none focus:border-[#0A9396]"
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
              className="w-full px-3 py-2 bg-white border border-[#0A9396] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0A9396]/30 mt-2"
            />
          )}
        </div>

        {/* Step 2: Student Details */}
        <div>
          <label className="block text-xs font-bold text-[#001219] mb-1.5">Full Name *</label>
          <input
            type="text"
            required
            minLength={2}
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setError(''); }}
            placeholder="Your full name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#001219] mb-1.5">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@gmail.com, student@domain.com..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70"
          />
          <p className="text-[11px] text-[#0A9396] mt-1 font-semibold flex items-center gap-1">
            <span>✓</span> Any personal (Gmail, Yahoo, Outlook) or college email accepted
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !fullName}
          className="w-full py-3 bg-[#005F73] hover:bg-[#0A9396] text-white font-extrabold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            'Create Free Account →'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-[#005F73] font-bold hover:underline">
            Log in
          </Link>
        </p>
        <Link href="/" className="inline-block mt-2 text-xs text-gray-400 hover:text-[#005F73]">
          ← Back to CampusConnect
        </Link>
      </div>
    </div>
  );
}
