"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  IndianRupee, 
  Sparkles, 
  Clock4, 
  Building2, 
  BadgePercent,
  FileCheck2,
  LockKeyhole,
  Zap,
  Users
} from "lucide-react"
import { Card3D } from "../ui/card-3d"

interface HeroLoanProps {
  onOpenApply: () => void
}

export function HeroLoan({ onOpenApply }: HeroLoanProps) {
  // Interactive mini-calculator in the hero for instant engagement
  const [loanAmount, setLoanAmount] = useState(1800000) // ₹18 Lakhs
  const [tenureYears, setTenureYears] = useState(15) // 15 years
  const interestRate = 9.75 // 9.75% p.a.

  // Standard EMI Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyRate = interestRate / 12 / 100
  const totalMonths = tenureYears * 12
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  )

  const totalPayable = emi * totalMonths
  const totalInterest = totalPayable - loanAmount
  const principalPercent = Math.round((loanAmount / totalPayable) * 100)

  const heroAmountPercent = Math.round(((loanAmount - 500000) / (5000000 - 500000)) * 100)
  const heroTenurePercent = Math.round(((tenureYears - 5) / (20 - 5)) * 100)

  return (
    <section className="relative overflow-hidden bg-[#fbfaf6] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#e5eae2]">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#eef2ea_1px,transparent_1px),linear-gradient(to_bottom,#eef2ea_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

      <div className="relative mx-auto max-w-[1340px] px-4 sm:px-8">
        
        {/* Top Eyebrow Badge */}
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cbd9c7] bg-[#eef5ee] px-3.5 py-1 text-[11px] font-semibold text-[#185333] shadow-2xs">
            <Sparkles size={13} className="text-[#2a7b4f]" />
            <span>AFFORDABLE HOUSING & PROPERTY LOANS</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5c6e5e]">
            <Clock4 size={13} className="text-[#2a7b4f]" />
            <span>In-Principle Sanction in 48 Hours</span>
          </div>
        </div>

        {/* Hero Grid: Copy on Left, Tactile Live Calculator on Right */}
        <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          
          {/* Left Column: Proposition and Key Edge */}
          <div>
            <h1 className="text-[38px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#112d1e] sm:text-[50px] lg:text-[58px]">
              Your dream home, <br />
              <span className="text-[#20633e] underline decoration-[#c59b48]/40 decoration-wavy underline-offset-8">
                financed with certainty.
              </span>
            </h1>

            <p className="mt-6 max-w-[560px] text-[15px] leading-relaxed text-[#4b594d] sm:text-[16px]">
              India Shelter empowers small business owners, traders, and salaried households to build, buy, or renovate their own homes. Even with informal cash income and no audited ITR, our doorstep advisors find a way forward.
            </p>

            {/* Core Value Badges */}
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 max-w-lg">
              <div className="rounded-xl border border-[#dfe5dc] bg-white p-3 shadow-xs">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6b7b6c]">Ticket Size</span>
                <span className="mt-0.5 block font-mono text-[14px] font-bold text-[#153e28]">₹5L - ₹50 Lakhs</span>
              </div>
              <div className="rounded-xl border border-[#dfe5dc] bg-white p-3 shadow-xs">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6b7b6c]">Interest Rates</span>
                <span className="mt-0.5 block font-mono text-[14px] font-bold text-[#153e28]">From 9.75% p.a.*</span>
              </div>
              <div className="rounded-xl border border-[#dfe5dc] bg-white p-3 shadow-xs col-span-2 sm:col-span-1">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6b7b6c]">Max Tenure</span>
                <span className="mt-0.5 block font-mono text-[14px] font-bold text-[#153e28]">Up to 20 Years</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onOpenApply}
                className="btn-press inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#14472d] px-6 text-sm font-semibold text-white shadow-md hover:bg-[#0d3420] active:scale-[0.98]"
              >
                <span>Get In-Principle Approval</span>
                <ArrowRight size={15} />
              </button>

              <a
                href="#calculator"
                className="btn-press inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#cbd5c8] bg-white px-5 text-sm font-medium text-[#2d4031] shadow-2xs hover:bg-[#f6f8f5] active:scale-[0.98]"
              >
                <span>Explore Full EMI Calculator</span>
              </a>
            </div>

            {/* Assurance trust marks */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-[#e2e7df] pt-5 text-xs text-[#526353]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#267749]" />
                Doorstep Document Pickup
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#267749]" />
                Informal Income Appraisals
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#267749]" />
                No Hidden Surcharges
              </span>
            </div>
          </div>

          {/* Right Column: Tactile 3D Live Calculator Widget with Micro-Animations */}
          <div className="relative perspective-1000">
            {/* Ambient glowing backdrop */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#1b5e39]/25 via-[#2a8550]/15 to-[#c59b48]/20 blur-2xl opacity-75 animate-pulse-glow" />

            {/* Floating 3D Micro-Badges */}
            <div className="hidden sm:flex absolute -top-4 -right-3 z-30 items-center gap-1.5 rounded-full border border-[#b8dabf] bg-white/95 px-3 py-1 shadow-lg backdrop-blur-md animate-float-3d">
              <Zap size={13} className="text-[#207545] fill-[#207545]" />
              <span className="text-[11px] font-bold text-[#143d24]">Fast 48h Sanction</span>
            </div>

            <div className="hidden sm:flex absolute -bottom-3 -left-3 z-30 items-center gap-1.5 rounded-full border border-[#cbd9c7] bg-white/95 px-3 py-1 shadow-lg backdrop-blur-md animate-float-reverse-3d">
              <span className="flex size-2 rounded-full bg-[#34a853] animate-ping" />
              <span className="text-[11px] font-bold text-[#143d24]">1,15,000+ Happy Families</span>
            </div>

            <Card3D maxRotation={6} scale={1.015} className="w-full">
              <div className="relative rounded-2xl border border-[#d2dcd0] bg-white/98 p-6 shadow-xl sm:p-7 backdrop-blur-xs">
              
              {/* Header inside widget */}
              <div className="flex items-center justify-between border-b border-[#e9eee7] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#246740] font-mono">
                    Instant Loan Estimator
                  </span>
                  <h3 className="text-base font-bold text-[#143221]">Calculate Your Monthly EMI</h3>
                </div>
                <div className="rounded-lg bg-[#edf5ee] px-2.5 py-1 text-right">
                  <span className="block text-[9px] uppercase tracking-wider text-[#5f7362]">Rate</span>
                  <span className="font-mono text-xs font-bold text-[#164c2e]">{interestRate}% p.a.</span>
                </div>
              </div>

              {/* Slider 1: Loan Amount */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#465748]">Desired Loan Amount</label>
                  <span className="font-mono text-sm font-bold text-[#143d26] tabular-nums">
                    ₹{(loanAmount / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={5000000}
                  step={50000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="range-slider w-full"
                  style={{
                    "--slider-track": `linear-gradient(to right, #14472d 0%, #14472d ${heroAmountPercent}%, #e2eae0 ${heroAmountPercent}%, #e2eae0 100%)`
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-[10px] font-mono tabular-nums text-[#788879]">
                  <span>₹5 Lakh</span>
                  <span>₹25 Lakh</span>
                  <span>₹50 Lakh</span>
                </div>
              </div>

              {/* Slider 2: Loan Tenure */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#465748]">Repayment Tenure</label>
                  <span className="font-mono text-sm font-bold text-[#143d26] tabular-nums">
                    {tenureYears} Years ({totalMonths} Mos)
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={20}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="range-slider w-full"
                  style={{
                    "--slider-track": `linear-gradient(to right, #14472d 0%, #14472d ${heroTenurePercent}%, #e2eae0 ${heroTenurePercent}%, #e2eae0 100%)`
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-[10px] font-mono tabular-nums text-[#788879]">
                  <span>5 Years</span>
                  <span>10 Years</span>
                  <span>20 Years</span>
                </div>
              </div>

              {/* Monthly EMI Result Callout Box */}
              <div className="mt-6 rounded-xl border border-[#cfe0cc] bg-[#f2f8f2] p-4 shadow-2xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#355b41]">
                    Estimated Monthly EMI
                  </span>
                  <div className="text-right">
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#0e3b22] tabular-nums tracking-tight">
                      ₹{emi.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-[#4f6753]"> / month</span>
                  </div>
                </div>

                {/* Micro Ratio Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-[#556956] mb-1 font-medium">
                    <span>Principal: {principalPercent}%</span>
                    <span>Interest: {100 - principalPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#dbe8d8] overflow-hidden flex shadow-inner">
                    <div 
                      className="bg-[#1b5e39] transition-all duration-300 ease-out"
                      style={{ width: `${principalPercent}%` }} 
                    />
                    <div 
                      className="bg-[#dfb05b] transition-all duration-300 ease-out"
                      style={{ width: `${100 - principalPercent}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Action Button inside widget */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={onOpenApply}
                  className="btn-press group w-full flex items-center justify-center gap-2 rounded-xl bg-[#14472d] py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#0f3b23] active:scale-[0.98] transition-all"
                >
                  <span>Apply for ₹{(loanAmount / 100000).toFixed(1)}L with ₹{emi.toLocaleString("en-IN")} EMI</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>

              {/* Disclosures note */}
              <p className="mt-3 text-center text-[10px] text-[#7a8a7a]">
                *EMI is indicative. Final interest rate and tenure are subject to property appraisal & credit underwriting.
              </p>
            </div>
            </Card3D>
          </div>
        </div>
      </div>
    </section>
  )
}
