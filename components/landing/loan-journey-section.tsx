"use client"

import { useState } from "react"
import { 
  Footprints, 
  FileSpreadsheet, 
  Scale, 
  Banknote, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  MapPin,
  ChevronRight
} from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Doorstep Consultation",
    timeframe: "Within 2-4 Hours",
    icon: Footprints,
    tagline: "Zero branch visits required. We meet at your home or shop.",
    description: "Our local relationship officer visits your workplace or residence at your convenience. We discuss your home goals, verify basic KYC (Aadhaar & PAN), and explain the exact repayment structure.",
    deliverables: ["KYC document pickup", "Preliminary loan sizing", "Clear checklist of required papers"]
  },
  {
    step: "02",
    title: "Cash-Flow & Income Appraisal",
    timeframe: "Day 1 to Day 2",
    icon: FileSpreadsheet,
    tagline: "Informal income evaluated with dignity and common sense.",
    description: "No formal ITR or audited balance sheets? No problem. Our field credit assessors evaluate your business activity, bank transactions, daily customer footfall, raw material invoices, and trade references.",
    deliverables: ["Shop / business physical inspection", "Custom cash-flow computation", "Co-applicant inclusion benefits"]
  },
  {
    step: "03",
    title: "Legal & Technical Clearance",
    timeframe: "48-72 Hours",
    icon: Scale,
    tagline: "In-house lawyers & civil engineers conduct property valuation.",
    description: "Our technical team inspects the plot or property to assess construction quality and market valuation, while our legal counsel reviews municipal approvals, title chain, and registry papers.",
    deliverables: ["Formal in-principle sanction letter", "Transparent interest rate lock-in", "Zero hidden processing surprises"]
  },
  {
    step: "04",
    title: "Direct Account Disbursement",
    timeframe: "Within 3-5 Business Days",
    icon: Banknote,
    tagline: "Funds wired directly to the seller, contractor, or your account.",
    description: "Upon signing loan agreements and mortgage execution, the funds are released. For plot construction or home extensions, disbursements are released in sync with construction milestones.",
    deliverables: ["Instant digital disbursement notification", "Customer portal login credentials", "Welcome kit & EMI schedule"]
  }
]

interface LoanJourneySectionProps {
  onOpenApply: () => void
}

export function LoanJourneySection({ onOpenApply }: LoanJourneySectionProps) {
  const [activeStep, setActiveStep] = useState(0)

  // Calculate progress percentage along the 4 steps: 0, 33%, 66%, 100%
  const progressPercent = Math.round((activeStep / (steps.length - 1)) * 100)

  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-24 bg-white border-b border-[#e5eae2]">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd9c8] bg-[#edf5ee] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1e5836] shadow-2xs">
              <Clock size={12} className="text-[#2a7b4f]" />
              <span>Doorstep to Disbursement</span>
            </div>
            <h2 className="mt-2.5 text-3xl font-bold tracking-tight text-[#143221] sm:text-4xl">
              How our 48-hour approval works.
            </h2>
            <p className="mt-2 text-sm text-[#576959] max-w-xl">
              We eliminated bureaucratic queues and rigid bank checklists. Click through the timeline to see each milestone.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenApply}
            className="btn-press group inline-flex items-center gap-2 rounded-xl bg-[#14472d] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0e3521] active:scale-[0.98] transition-all"
          >
            <span>Request Doorstep Visit</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* Animated Connecting Journey Track (Desktop) */}
        <div className="relative mb-8 hidden lg:block">
          {/* Background track line */}
          <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 h-1 bg-[#e4ede2] rounded-full" />
          
          {/* Animated active progress fill */}
          <div 
            className="absolute top-1/2 left-10 -translate-y-1/2 h-1 bg-[#14472d] rounded-full transition-all duration-500 ease-out"
            style={{ width: `calc(${progressPercent}% * 0.88)` }}
          />

          {/* Stepper nodes */}
          <div className="relative z-10 flex justify-between">
            {steps.map((item, idx) => {
              const isPassed = idx <= activeStep
              const isCurrent = idx === activeStep
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`group flex flex-col items-center gap-2 text-left transition-all ${
                    isCurrent ? "scale-105" : "hover:opacity-85"
                  }`}
                >
                  <div className={`size-10 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 shadow-sm ${
                    isCurrent
                      ? "bg-[#14472d] text-white ring-4 ring-[#14472d]/20 scale-110"
                      : isPassed
                      ? "bg-[#256f46] text-white"
                      : "bg-white border-2 border-[#d6e0d3] text-[#788a7a]"
                  }`}>
                    {item.step}
                  </div>
                  <span className={`text-[11px] font-semibold transition-colors duration-200 ${
                    isCurrent ? "text-[#14472d]" : "text-[#677768]"
                  }`}>
                    {item.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 4 Interactive Step Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, idx) => {
            const Icon = item.icon
            const isSelected = activeStep === idx
            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(idx)}
                className={`card-hover cursor-pointer rounded-2xl border p-6 transition-all duration-300 flex flex-col justify-between select-none ${
                  isSelected
                    ? "border-[#1c5c3b] bg-[#f2f8f2] shadow-md ring-2 ring-[#1c5c3b]/30"
                    : "border-[#e0e6dd] bg-[#fbfbf9] hover:border-[#b8ccb6] opacity-90 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-mono text-2xl font-extrabold transition-colors duration-200 ${
                      isSelected ? "text-[#14472d]" : "text-[#778978]"
                    }`}>
                      {item.step}
                    </span>
                    <span className="rounded-md bg-white border border-[#d6dfd4] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#3b5540] tabular-nums">
                      {item.timeframe}
                    </span>
                  </div>

                  <div className={`flex size-11 items-center justify-center rounded-xl transition-all duration-300 mb-3 shadow-2xs ${
                    isSelected
                      ? "bg-[#14472d] text-white scale-105"
                      : "bg-white border border-[#d6dfd4] text-[#1a5b37]"
                  }`}>
                    <Icon size={22} />
                  </div>

                  <h3 className="text-base font-bold text-[#143221]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-[#256840]">
                    {item.tagline}
                  </p>
                  <p className="mt-2.5 text-xs text-[#5f7060] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#e2eae0]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#48604d] mb-1.5">
                    What we complete:
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-[#4f6050]">
                    {item.deliverables.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 size={13} className="text-[#2b794d] shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Active Step Highlight Card (Rich Drawer Transition) */}
        <div className="mt-8 rounded-2xl border border-[#cfe0cc] bg-[#f5faf4] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-[#14472d] text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
              {steps[activeStep].step}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#2d6c47]">
                Active Step Focus · {steps[activeStep].timeframe}
              </span>
              <h4 className="text-sm font-bold text-[#153a23]">
                {steps[activeStep].title}: {steps[activeStep].tagline}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="btn-press px-3 py-1.5 rounded-lg border border-[#c4d6c1] bg-white text-xs font-semibold text-[#1f4a2d] hover:bg-[#edf5ed]"
              >
                Previous Step
              </button>
            )}
            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="btn-press px-3.5 py-1.5 rounded-lg bg-[#14472d] text-xs font-semibold text-white hover:bg-[#0e3521] flex items-center gap-1"
              >
                <span>Next: {steps[activeStep + 1].title}</span>
                <ChevronRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenApply}
                className="btn-press px-4 py-1.5 rounded-lg bg-[#14472d] text-xs font-semibold text-white hover:bg-[#0e3521] flex items-center gap-1"
              >
                <span>Start Application</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Branch Network Footnote */}
        <div className="mt-8 rounded-2xl border border-[#d8e2d6] bg-[#edf4ed] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#1a5b37] shadow-2xs">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#153a23]">Over 215 Branch Locations Across 15 States</h4>
              <p className="text-xs text-[#526653]">Our field teams cover over 1,500 cities, towns, and peri-urban mandals.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenApply}
            className="btn-press self-start sm:self-auto rounded-lg bg-[#14472d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0e3521] active:scale-[0.98]"
          >
            Locate Nearest Branch Officer
          </button>
        </div>
      </div>
    </section>
  )
}
