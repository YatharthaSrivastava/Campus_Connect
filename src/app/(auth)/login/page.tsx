'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email.trim());
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please enter a valid email address.';
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
        <h1 className="text-2xl font-extrabold text-[#005F73]">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your CampusConnect account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#BB3E03] font-semibold">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#001219] mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            autoFocus
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
          disabled={isLoading || !email}
          className="w-full py-3 bg-[#005F73] hover:bg-[#0A9396] text-white font-extrabold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            'Sign In →'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#005F73] font-bold hover:underline">
            Sign up free
          </Link>
        </p>
        <Link href="/" className="inline-block mt-2 text-xs text-gray-400 hover:text-[#005F73]">
          ← Back to CampusConnect
        </Link>
      </div>
    </div>
  );
}
