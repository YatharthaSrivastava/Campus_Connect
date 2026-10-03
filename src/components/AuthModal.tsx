'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { COLLEGES } from '@/lib/colleges';

interface AuthModalProps {
  defaultTab: 'login' | 'signup';
  onClose: () => void;
}

export default function AuthModal({ defaultTab, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const router = useRouter();
  const { login, register } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup state — College selection first!
  const [signupCollege, setSignupCollege] = useState(COLLEGES[0].name);
  const [customCollege, setCustomCollege] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail.trim());
      onClose();
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please enter a valid email address.';
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    const finalCollegeName =
      signupCollege === 'other'
        ? customCollege.trim()
        : signupCollege;

    if (!finalCollegeName) {
      setSignupError('Please select or specify your college name.');
      return;
    }

    setSignupLoading(true);
    try {
      await register(signupEmail.trim(), signupName.trim(), finalCollegeName);
      onClose();
      router.push('/setup-profile');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setSignupError(msg);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 18, 25, 0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[92vh] flex flex-col border border-[#0A9396]/20">
        {/* Modal Header with Ocean Sunset Gradient */}
        <div className="bg-gradient-to-br from-[#001219] via-[#005F73] to-[#0A9396] px-6 pt-6 pb-6 text-white text-center relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-sm font-bold transition cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="text-3xl mb-1">🎓</div>
          <h2 className="text-xl font-extrabold tracking-tight">CampusConnect</h2>
          <p className="text-[#94D2BD] text-xs mt-0.5">Verified Peer Exchange for All Colleges</p>

          {/* Tab Switcher */}
          <div className="flex bg-black/25 rounded-2xl p-1 mt-4 gap-1 border border-white/10">
            <button
              onClick={() => { setTab('login'); setLoginError(''); setSignupError(''); }}
              className={`flex-1 py-2 text-sm font-extrabold rounded-xl transition cursor-pointer ${
                tab === 'login' ? 'bg-white text-[#005F73] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setTab('signup'); setLoginError(''); setSignupError(''); }}
              className={`flex-1 py-2 text-sm font-extrabold rounded-xl transition cursor-pointer ${
                tab === 'signup' ? 'bg-white text-[#005F73] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#001219] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                  placeholder="you@gmail.com, student@college.in..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70"
                />
                <p className="text-[11px] text-[#0A9396] mt-1 font-semibold flex items-center gap-1">
                  <span>✓</span> Use any personal email (Gmail, Yahoo, Outlook) or college email
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#BB3E03] font-semibold">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || !loginEmail}
                className="w-full py-3 bg-[#005F73] hover:bg-[#0A9396] text-white font-extrabold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In to Dashboard →'
                )}
              </button>

              <p className="text-center text-xs text-gray-500 pt-1">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-[#005F73] font-bold hover:underline cursor-pointer"
                >
                  Sign up free
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Step 1: College Selection FIRST */}
              <div className="p-3.5 bg-[#E9D8A6]/25 border border-[#0A9396]/30 rounded-2xl space-y-2">
                <label className="block text-xs font-black text-[#005F73] uppercase tracking-wider">
                  🏫 1. Select Your College / University First *
                </label>
                <select
                  value={signupCollege}
                  onChange={(e) => { setSignupCollege(e.target.value); setSignupError(''); }}
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

                {signupCollege === 'other' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter your College / University name..."
                    value={customCollege}
                    onChange={(e) => { setCustomCollege(e.target.value); setSignupError(''); }}
                    className="w-full px-3 py-2 bg-white border border-[#0A9396] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0A9396]/30 mt-2"
                  />
                )}
              </div>

              {/* Step 2: Student Details */}
              <div>
                <label className="block text-xs font-bold text-[#001219] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => { setSignupName(e.target.value); setSignupError(''); }}
                  placeholder="Your full name"
                  minLength={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#001219] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => { setSignupEmail(e.target.value); setSignupError(''); }}
                  placeholder="you@gmail.com, student@domain.com..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A9396] focus:ring-2 focus:ring-[#0A9396]/20 transition bg-gray-50/70"
                />
                <p className="text-[11px] text-[#0A9396] mt-1 font-semibold flex items-center gap-1">
                  <span>✓</span> Any personal or institutional email accepted
                </p>
              </div>

              {signupError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#BB3E03] font-semibold">
                  ⚠️ {signupError}
                </div>
              )}

              <button
                type="submit"
                disabled={signupLoading || !signupEmail || !signupName}
                className="w-full py-3 bg-[#005F73] hover:bg-[#0A9396] text-white font-extrabold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {signupLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create Free Account →'
                )}
              </button>

              <p className="text-center text-xs text-gray-500 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-[#005F73] font-bold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            </form>
          )}

          {/* Trust footer */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400">
              🔒 Zero-Trust Engine · Multi-Campus Network · Real-Time Exchange
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
