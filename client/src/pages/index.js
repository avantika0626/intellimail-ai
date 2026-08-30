import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Mail,
  Sparkles,
  Bot,
  ShieldCheck,
  Zap,
  ListTodo,
  Calendar,
  Search,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Inbox,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#1f1f1f] flex flex-col font-['Roboto',sans-serif] antialiased selection:bg-[#c2e7ff] selection:text-[#001d35]">
      <Head>
        <title>IntelliMail AI — Intelligent Google Mail Workspace</title>
        <meta
          name="description"
          content="IntelliMail AI — Supercharge your Gmail with Gemini AI summaries, multi-tone smart replies, action extraction, and deadline tracking."
        />
      </Head>

      {/* Navigation */}
      <nav className="h-16 border-b border-[#e0e2ec] bg-[#ffffff] px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <path fill="#4285F4" d="M1.5 5.5v13a2 2 0 0 0 2 2h1.5V9.75L12 14.5l7-4.75V20.5H20.5a2 2 0 0 0 2-2v-13a2 2 0 0 0-3.11-1.66L12 9 4.61 3.84A2 2 0 0 0 1.5 5.5z" />
            <path fill="#34A853" d="M3.5 20.5h2V10.25l-2-1.36V20.5z" />
            <path fill="#EA4335" d="M20.5 20.5h-2V10.25l2-1.36V20.5z" />
            <path fill="#FBBC04" d="M12 9l7.39-5.16A2 2 0 0 0 18.5 3.5H5.5a2 2 0 0 0-.89.34L12 9z" />
          </svg>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-normal tracking-tight text-[#444746] font-['Google_Sans',sans-serif]">
              IntelliMail
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#c2e7ff] text-[#001d35]">
              AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-medium text-[#444746] hover:text-[#1f1f1f] px-4 py-2 rounded-full hover:bg-[#f1f3f4] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-medium font-['Google_Sans',sans-serif] shadow-sm transition-all flex items-center gap-2"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f0fe] border border-[#c2e7ff] text-[#0b57d0] text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>Next-Generation Google Mail Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1f1f1f] tracking-tight leading-[1.15] mb-6 font-['Google_Sans',sans-serif]">
          Your Gmail, Supercharged by <br />
          <span className="text-[#0b57d0] font-medium">
            IntelliMail AI
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#5f6368] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Summarize long email threads, generate tailored tone replies, extract actionable task checklists and deadlines, and search semantically with Gemini AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium text-sm font-['Google_Sans',sans-serif] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Connect with Google OAuth</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ffffff] border border-[#dadce0] hover:bg-[#f1f3f4] text-[#3c4043] font-medium text-sm font-['Google_Sans',sans-serif] transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Demo Inbox</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="px-6 py-16 bg-[#ffffff] border-t border-[#e0e2ec]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-normal text-[#1f1f1f] tracking-tight mb-2 font-['Google_Sans',sans-serif]">
              Built for High-Velocity Email Management
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368]">
              Seamless Google Workspace design with AI tools that save you hours every week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-[#f8fafd] border border-[#dadce0] hover:border-[#1a73e8] transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mb-3.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">AI Email Summaries</h3>
              <p className="text-xs text-[#5f6368] leading-relaxed">
                Extract concise executive summaries, key bullet points, and required actions from long conversations instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-[#f8fafd] border border-[#dadce0] hover:border-[#1a73e8] transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-[#f3e8ff] text-[#7c3aed] flex items-center justify-center mb-3.5">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">Multi-Tone Smart Replies</h3>
              <p className="text-xs text-[#5f6368] leading-relaxed">
                Generate tailored response drafts across 6 tones (Professional, Friendly, Formal, Concise, Apologetic, Confident).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-[#f8fafd] border border-[#dadce0] hover:border-[#1a73e8] transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center mb-3.5">
                <ListTodo className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">Action Item Extraction</h3>
              <p className="text-xs text-[#5f6368] leading-relaxed">
                Turn unstructured paragraphs into interactive checklists of tasks and deliverables with a single click.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-[#f8fafd] border border-[#dadce0] hover:border-[#1a73e8] transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-[#fef7e0] text-[#b06000] flex items-center justify-center mb-3.5">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">Deadline & Date Detection</h3>
              <p className="text-xs text-[#5f6368] leading-relaxed">
                Automatically identifies submission deadlines, scheduled meetings, and milestone timeframes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-[#f8fafd] border border-[#dadce0] hover:border-[#1a73e8] transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center mb-3.5">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">Semantic Smart Search</h3>
              <p className="text-xs text-[#5f6368] leading-relaxed">
                Search using natural language intent: "Show emails where someone asked for an invoice or audit report".
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-[#f8fafd] border border-[#dadce0] hover:border-[#1a73e8] transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-[#fce8e6] text-[#c5221f] flex items-center justify-center mb-3.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">Zero Trust & Security</h3>
              <p className="text-xs text-[#5f6368] leading-relaxed">
                AI assists and drafts, but you always have the final review before any message is sent or deleted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#e0e2ec] bg-[#f6f8fc] py-8 px-6 lg:px-12 text-xs text-[#5f6368] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#444746] font-['Google_Sans',sans-serif]">IntelliMail AI</span>
          <span>© 2026. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-[#1f1f1f]">
            Sign in
          </Link>
          <Link href="/dashboard" className="hover:text-[#1f1f1f]">
            Workspace
          </Link>
          <Link href="/settings" className="hover:text-[#1f1f1f]">
            Settings & Security
          </Link>
        </div>
      </footer>
    </div>
  );
}
