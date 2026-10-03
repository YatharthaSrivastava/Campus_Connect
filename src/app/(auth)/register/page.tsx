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
      await register(email, fullName, finalCollege);
      router.push('/setup-profile');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })
        ?.response?.status;
      if (status === 409) {
        setError('An account with this email already exists. Please log in.');
      } else {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Registration failed. Please try again.';
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-[#0081a7] rounded-2xl flex items-center justify-center text-white text-xl mx-auto mb-3">
          🎓
        </div>
        <h1 className="text-2xl font-extrabold text-[#0081a7]">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1">Join the verified inter-campus network</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: College Selection First */}
        <div className="p-3.5 bg-[#fdfcdc] border border-[#00afb9]/30 rounded-2xl space-y-2">
          <label className="block text-xs font-black text-[#0081a7] uppercase tracking-wider">
            🏫 1. Select Your College / University First *
          </label>
          <select
            value={collegeName}
            onChange={(e) => { setCollegeName(e.target.value); setError(''); }}
            required
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#334155] outline-none focus:border-[#0081a7]"
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
              className="w-full px-3 py-2 bg-white border border-[#00afb9] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00afb9]/30"
            />
          )}
        </div>

        {/* Step 2: Student Details */}
        <div>
          <label className="block text-xs font-bold text-[#334155] mb-1.5">Full Name *</label>
          <input
            type="text"
            required
            minLength={2}
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setError(''); }}
            placeholder="Your full name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0081a7] focus:ring-2 focus:ring-[#0081a7]/20 transition bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#334155] mb-1.5">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0081a7] focus:ring-2 focus:ring-[#0081a7]/20 transition bg-gray-50"
          />
          <p className="text-[11px] text-[#00afb9] mt-1 font-medium">
            ✓ Any college or personal email accepted
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !fullName}
          className="w-full py-3 bg-[#0081a7] hover:bg-[#00afb9] text-white font-extrabold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
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
          <Link href="/login" className="text-[#0081a7] font-bold hover:underline">
            Log in
          </Link>
        </p>
        <Link href="/" className="inline-block mt-2 text-xs text-gray-400 hover:text-[#0081a7]">
          ← Back to CampusConnect
        </Link>
      </div>
    </div>
  );
}
