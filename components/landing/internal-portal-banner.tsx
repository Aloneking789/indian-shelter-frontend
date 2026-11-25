"use client"

import Link from "next/link"
import { 
  LockKeyhole, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  KeyRound, 
  Users, 
  Cpu,
  BadgeAlert
} from "lucide-react"

export function InternalPortalBanner() {
  return (
    <section className="bg-[#0e2c1c] text-white py-14 sm:py-16 relative overflow-hidden border-b border-[#1b432e]">
      {/* Background architectural circles */}
      <div className="absolute -right-36 -top-36 size-[450px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute right-10 -bottom-24 size-[320px] rounded-full border border-white/5 pointer-events-none" />

      <div className="mx-auto max-w-[1340px] px-4 sm:px-8 relative z-10">
        <div className="rounded-2xl border border-white/10 bg-[#143924]/80 p-7 sm:p-10 backdrop-blur-sm">
          
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            
            {/* Left Column: Description & Security Badges */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#306646] bg-[#1a4a2f] px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-[#9fe0ba]">
                <LockKeyhole size={12} className="text-[#64cb8c]" />
                <span>Internal Team Workspace</span>
              </div>

              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                India Shelter Operations Portal
              </h2>

              <p className="mt-2.5 text-xs sm:text-sm text-white/75 leading-relaxed max-w-2xl">
                Authorized internal gateway for branch credit managers, field loan officers, and compliance leads. Access the central DLT SMS template repository, customer communication audit trail, and loan document wizards.
              </p>

              {/* Feature Tags */}
              <div className="mt-6 flex flex-wrap gap-2.5 text-xs text-white/85">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
                  <FileText size={13} className="text-[#ffd782]" />
                  DLT Template Management
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
                  <KeyRound size={13} className="text-[#64cb8c]" />
                  Role-Based Employee Access
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
                  <ShieldCheck size={13} className="text-[#7bd2ff]" />
                  Regulatory Audit Trail
                </span>
              </div>
            </div>

            {/* Right Column: Prominent Sign In Gateway Button & Status Card */}
            <div className="flex flex-col gap-3.5 rounded-xl border border-white/15 bg-white/5 p-6 text-center lg:text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                  Authentication Status
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1b5e39] px-2.5 py-0.5 text-[10px] font-semibold text-[#8bf7b8]">
                  <span className="size-1.5 rounded-full bg-[#46e889] animate-pulse" />
                  Portal Active
                </span>
              </div>

              <p className="text-xs text-white/70">
                Sign in with your employee email or officer ID to manage communication templates and customer dispatch logs.
              </p>

              <Link
                href="/login"
                className="btn-press inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-bold text-[#113822] shadow-md hover:bg-[#eaf4ec] active:scale-[0.98] transition-all"
              >
                <LockKeyhole size={14} className="text-[#13492a]" />
                <span>Sign in to Employee Workspace</span>
                <ArrowRight size={14} className="text-[#13492a]" />
              </Link>

              <div className="flex items-center justify-center lg:justify-start gap-1 text-[10px] text-white/50">
                <BadgeAlert size={12} />
                <span>Restricted to India Shelter Finance Corporation personnel.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
