import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  ArrowRight,
  BrainCircuit,
  Database,
  Search,
  Sparkles,
  ShieldCheck,
  Target,
  FileCheck,
  UploadCloud
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      {/* Top Navigation */}
      <header className="h-16 px-6 md:px-12 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-950/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-100 text-neutral-950 flex items-center justify-center font-black text-sm tracking-tight">
            CI
          </div>
          <span className="font-bold tracking-tight text-sm text-neutral-100">
            CONTENT INTELLIGENCE
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
          <a href="#how-it-works" className="hover:text-neutral-100 transition-colors">How It Works</a>
          <a href="#architecture" className="hover:text-neutral-100 transition-colors">Memory Engine</a>
          <a href="#intelligence" className="hover:text-neutral-100 transition-colors">Intelligence Systems</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-neutral-100 hover:bg-white text-neutral-950 transition-colors cursor-pointer"
          >
            Launch Platform
          </button>
        </div>
      </header>

      {/* Hero Section per Section 24 */}
      <section className="relative px-6 md:px-12 pt-20 pb-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-xs text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hindsight Persistent Agent Memory</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
              Your content history. <br />
              Your brand memory. <br />
              <span className="text-neutral-400">Your next strategy.</span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 max-w-xl font-normal leading-relaxed">
              An AI content strategist that learns from the content your organization actually publishes. No fabricated history, no generic assumptions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-6 py-3 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs tracking-wide uppercase transition-colors flex items-center gap-2.5 cursor-pointer shadow-lg shadow-white/5"
              >
                <span>Start Building Memory</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#how-it-works"
                className="px-6 py-3 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900/80 text-neutral-300 font-semibold text-xs tracking-wide uppercase transition-colors flex items-center gap-2"
              >
                <span>Explore How It Works</span>
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neutral-400" />
                <span>Zero Hallucination Grounding</span>
              </div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-neutral-400" />
                <span>Persistent Hindsight Memory</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Asset */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
              <img
                src="/src/assets/images/editorial_strategy_hero_1790610176366.jpg"
                alt="Editorial Strategy Desk"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover aspect-16/10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-neutral-950/85 backdrop-blur-md border border-neutral-800/80 text-xs space-y-1">
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                  REAL-DATA ARCHITECTURE
                </div>
                <div className="text-neutral-300 text-xs font-medium">
                  The intelligence comes directly from the organization's actual publishing history.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Sequential Flow */}
      <section id="how-it-works" className="px-6 md:px-12 py-20 border-t border-neutral-900 bg-neutral-950">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              The Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Real Content to Evidence-Based Strategy
            </h2>
            <p className="text-sm text-neutral-400">
              Real content is ingested, extracted into Hindsight memory, and recalled dynamically during strategic reasoning.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4">
            {[
              { step: '01', title: 'Real Content', desc: 'Articles, posts, videos, or campaigns entered by your team', icon: FileCheck },
              { step: '02', title: 'Database', desc: 'Secure local SQLite storage of performance & metrics', icon: Database },
              { step: '03', title: 'Hindsight Retain', desc: 'Ingests real facts, topics, and metrics into memory bank', icon: BrainCircuit },
              { step: '04', title: 'Recall & Reflect', desc: 'TEMPR multi-strategy search across past signals', icon: Search },
              { step: '05', title: 'Groq Reasoning', desc: 'LLM synthesizes recommendations strictly from evidence', icon: Sparkles },
              { step: '06', title: 'Real Strategy', desc: 'Actionable guidance backed by exact supporting memories', icon: Target }
            ].map(node => {
              const Icon = node.icon;
              return (
                <div
                  key={node.step}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-neutral-500 font-bold">{node.step}</span>
                    <Icon className="h-4 w-4 text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-200 mb-1">{node.title}</div>
                    <div className="text-[11px] text-neutral-400 leading-relaxed">{node.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="mt-auto px-6 md:px-12 py-10 border-t border-neutral-900 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div>
          <span className="font-bold text-neutral-300">Content Intelligence</span> — Persistent Organizational Memory for Content Strategy
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          >
            Open Workspace
          </button>
        </div>
      </footer>
    </div>
  );
};
