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
      await login(email);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please check your email and try again.';
      setError(msg);
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
        <h1 className="text-2xl font-extrabold text-[#0081a7]">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your CampusConnect account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#334155] mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0081a7] focus:ring-2 focus:ring-[#0081a7]/20 transition bg-gray-50"
          />
          <p className="text-[11px] text-[#00afb9] mt-1 font-medium">
            ✓ Any valid email address accepted
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full py-3 bg-[#0081a7] hover:bg-[#00afb9] text-white font-extrabold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
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
          <Link href="/register" className="text-[#0081a7] font-bold hover:underline">
            Sign up free
          </Link>
        </p>
        <Link href="/" className="inline-block mt-2 text-xs text-gray-400 hover:text-[#0081a7]">
          ← Back to CampusConnect
        </Link>
      </div>
    </div>
  );
}
