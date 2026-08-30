import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('operator@intellimail.io');
  const [password, setPassword] = useState('Password123!');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const res = await login(email, password);
    if (res.success) {
      router.push('/dashboard');
    }
  };

  const handleDemoFill = () => {
    setEmail('operator@intellimail.io');
    setPassword('Password123!');
  };

  const handleGoogleOAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await api.get('/gmail/oauth/url');
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#1f1f1f] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Roboto',sans-serif]">
      <Head>
        <title>Sign in — Google Accounts (IntelliMail AI)</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Gmail Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <svg viewBox="0 0 24 24" className="w-10 h-10">
            <path fill="#4285F4" d="M1.5 5.5v13a2 2 0 0 0 2 2h1.5V9.75L12 14.5l7-4.75V20.5H20.5a2 2 0 0 0 2-2v-13a2 2 0 0 0-3.11-1.66L12 9 4.61 3.84A2 2 0 0 0 1.5 5.5z" />
            <path fill="#34A853" d="M3.5 20.5h2V10.25l-2-1.36V20.5z" />
            <path fill="#EA4335" d="M20.5 20.5h-2V10.25l2-1.36V20.5z" />
            <path fill="#FBBC04" d="M12 9l7.39-5.16A2 2 0 0 0 18.5 3.5H5.5a2 2 0 0 0-.89.34L12 9z" />
          </svg>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-normal text-[#444746] font-['Google_Sans',sans-serif]">IntelliMail</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#c2e7ff] text-[#001d35]">
                AI
              </span>
            </div>
            <p className="text-xs text-[#5f6368]">to continue to Gmail Workspace</p>
          </div>
        </Link>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#ffffff] border border-[#dadce0] p-8 rounded-3xl shadow-sm">
          <h2 className="text-xl font-normal text-[#202124] mb-1 font-['Google_Sans',sans-serif]">Sign in</h2>
          <p className="text-xs text-[#5f6368] mb-6">Use your Google or Demo Account</p>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#fce8e6] border border-[#fad2cf] flex items-center gap-2.5 text-[#c5221f] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Connect Button */}
          <button
            onClick={handleGoogleOAuth}
            disabled={isGoogleLoading}
            className="w-full h-11 rounded-full bg-[#ffffff] hover:bg-[#f8fafd] text-[#3c4043] font-medium text-xs flex items-center justify-center gap-3 border border-[#dadce0] transition-all mb-4 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isGoogleLoading ? 'Redirecting to Google...' : 'Sign in with Google OAuth'}</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-[#dadce0] w-full" />
            <span className="bg-[#ffffff] px-3 text-[11px] font-medium text-[#5f6368] uppercase">Or</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1">
                Email or phone
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@intellimail.io"
                className="w-full h-11 px-3.5 rounded-xl bg-[#ffffff] border border-[#dadce0] text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1">
                Enter your password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-xl bg-[#ffffff] border border-[#dadce0] text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link href="/register" className="text-xs font-medium text-[#1a73e8] hover:text-[#0b57d0]">
                Create account
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium text-xs font-['Google_Sans',sans-serif] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Next</span>
              </button>
            </div>
          </form>

          {/* Instant Demo Helper */}
          <div className="mt-6 pt-4 border-t border-[#f1f3f4] text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full py-2 px-3 rounded-full bg-[#f1f3f4] hover:bg-[#e0e2ec] text-[#444746] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Fill Demo Operator Credentials</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
