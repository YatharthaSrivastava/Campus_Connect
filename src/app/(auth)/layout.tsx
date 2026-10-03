'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect away from /login if already authenticated
    // Do NOT intercept registration or profile setup onboarding flows
    if (!isLoading && isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005F73]" />
      </div>
    );
  }

  // If on setup-profile, render the full-width profile setup layout directly
  if (pathname === '/setup-profile') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <span className="text-4xl">🎓</span>
        <h2 className="text-2xl font-black text-[#005F73] mt-2">CampusConnect</h2>
        <p className="text-sm text-gray-500 mt-1">Institutional Peer Exchange Platform</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
