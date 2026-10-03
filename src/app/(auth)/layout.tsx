'use client';
// Auth group layout — minimal wrapper; redirects to dashboard if already logged in
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcdc]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0081a7]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcdc] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <span className="text-4xl">🎓</span>
        <h2 className="text-2xl font-black text-[#0081a7] mt-2">CampusConnect</h2>
        <p className="text-sm text-gray-500 mt-1">PSIT Kanpur — Peer Exchange Platform</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
