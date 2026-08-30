import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const res = await register(name, email, password);
    if (res.success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#1f1f1f] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Roboto',sans-serif]">
      <Head>
        <title>Create your Google Account — IntelliMail AI</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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
            <p className="text-xs text-[#5f6368]">Create your Account</p>
          </div>
        </Link>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#ffffff] border border-[#dadce0] p-8 rounded-3xl shadow-sm">
          <h2 className="text-xl font-normal text-[#202124] mb-1 font-['Google_Sans',sans-serif]">Create account</h2>
          <p className="text-xs text-[#5f6368] mb-6">to continue to Gmail Workspace</p>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#fce8e6] border border-[#fad2cf] flex items-center gap-2.5 text-[#c5221f] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full h-11 px-3.5 rounded-xl bg-[#ffffff] border border-[#dadce0] text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@example.com"
                className="w-full h-11 px-3.5 rounded-xl bg-[#ffffff] border border-[#dadce0] text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1">
                Password
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
              <Link href="/login" className="text-xs font-medium text-[#1a73e8] hover:text-[#0b57d0]">
                Sign in instead
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium text-xs font-['Google_Sans',sans-serif] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Create</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
