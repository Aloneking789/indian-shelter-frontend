"use client"

import { useState } from "react"
import { 
  House, 
  Building2, 
  Hammer, 
  Landmark, 
  ArrowRight, 
  Check, 
  Percent, 
  Calendar, 
  FileCheck2,
  Sparkles
} from "lucide-react"
import { Card3D } from "../ui/card-3d"

interface LoanProductsSectionProps {
  onOpenApply: (productTitle?: string) => void
  onSelectProductForCalculator: (amount: number, tenure: number, rate: number) => void
}

const products = [
  {
    id: "home-purchase",
    category: "purchase",
    badge: "Most Popular",
    title: "Home Purchase & Construction Loan",
    tagline: "Move into your new home or construct on an existing plot.",
    icon: House,
    rate: "From 9.75% p.a.",
    maxTenure: "Up to 20 Years",
    maxFunding: "Up to 85% LTV",
    defaultAmount: 2000000,
    defaultTenure: 18,
    defaultRate: 9.75,
    highlights: [
      "Purchase of new apartment or resale house",
      "Self-construction on owned land/plot",
      "Informal income assessment without audited accounts",
      "Doorstep legal title & valuation assistance"
    ]
  },
  {
    id: "lap",
    category: "property",
    badge: "High Liquidity",
    title: "Loan Against Property (LAP)",
    tagline: "Unlock high-value liquidity from your commercial or residential property.",
    icon: Building2,
    rate: "From 11.25% p.a.",
    maxTenure: "Up to 15 Years",
    maxFunding: "Up to 65% LTV",
    defaultAmount: 2500000,
    defaultTenure: 12,
    defaultRate: 11.25,
    highlights: [
      "Working capital for business expansion & inventory",
      "Funds for children's higher education or wedding",
      "Residential, commercial, and mixed-use properties accepted",
      "Low processing fees with flexible prepayment options"
    ]
  },
  {
    id: "renovation",
    category: "renovation",
    badge: "Quick Approval",
    title: "Home Renovation & Extension Loan",
    tagline: "Add a floor, upgrade your kitchen, or extend living space.",
    icon: Hammer,
    rate: "From 10.25% p.a.",
    maxTenure: "Up to 15 Years",
    maxFunding: "Up to 80% Cost",
    defaultAmount: 800000,
    defaultTenure: 10,
    defaultRate: 10.25,
    highlights: [
      "Room additions, roof repairs, and sanitary improvements",
      "Interior remodeling and structural fortification",
      "Minimal documentation with expedited disbursement",
      "Available for self-employed and informal earners"
    ]
  },
  {
    id: "pmay",
    category: "pmay",
    badge: "Govt Subsidy",
    title: "Pradhan Mantri Awas Yojana (PMAY-U 2.0)",
    tagline: "Direct credit-linked interest subsidy for affordable housing.",
    icon: Landmark,
    rate: "Subsidized Rates",
    maxTenure: "Up to 20 Years",
    maxFunding: "Interest Subsidy",
    defaultAmount: 1500000,
    defaultTenure: 20,
    defaultRate: 8.50,
    highlights: [
      "Applicable for EWS (Economically Weaker Section) & LIG",
      "Direct credit subsidy credited to reduce principal balance",
      "Female ownership incentive supported",
      "Full assistance with PMAY documentation & portal filing"
    ]
  }
]

export function LoanProductsSection({ onOpenApply, onSelectProductForCalculator }: LoanProductsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory)

  return (
    <section id="loans" className="scroll-mt-20 py-16 sm:py-24 bg-white border-b border-[#e5eae2]">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd9c8] bg-[#f0f6ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1e5836]">
              <Sparkles size={12} className="text-[#2a7b4f]" />
              <span>Tailored Loan Offerings</span>
            </div>
            <h2 className="mt-2.5 text-3xl font-bold tracking-tight text-[#143221] sm:text-4xl">
              Financing crafted for your real life.
            </h2>
            <p className="mt-2 text-sm text-[#576959] max-w-xl">
              Whether you are buying your first home, growing your retail trade, or remodeling an ancestral property, our loan solutions are structured for easy approval.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#dde4da] bg-[#f7f9f6] p-1.5">
            {[
              { id: "all", label: "All Loans" },
              { id: "purchase", label: "Home Purchase" },
              { id: "property", label: "Loan Against Property" },
              { id: "renovation", label: "Home Extension" },
              { id: "pmay", label: "PMAY 2.0" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveCategory(id)}
                className={`btn-press rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === id
                    ? "bg-[#14472d] text-white shadow-xs"
                    : "text-[#516152] hover:bg-[#ebf1ea] hover:text-[#183925]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid with 3D Perspective */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 perspective-1000">
          {filteredProducts.map((p) => {
            const Icon = p.icon
            return (
              <Card3D key={p.id} maxRotation={5} scale={1.018} className="h-full">
                <article
                  className="group relative flex h-full flex-col justify-between rounded-2xl border border-[#dfe5dd] bg-[#fcfbf9] p-7 shadow-xs hover:border-[#1d5c3b] hover:shadow-xl transition-all"
                >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#edf5ee] text-[#1a5b37] group-hover:bg-[#1a5b37] group-hover:text-white transition-colors duration-200">
                      <Icon size={24} />
                    </div>
                    <span className="rounded-full bg-[#f1f6f0] border border-[#d2ded1] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#215f3b]">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold tracking-tight text-[#143221]">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#5f7160] leading-relaxed">
                    {p.tagline}
                  </p>

                  {/* Financial Terms Chips */}
                  <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#e7ece5] py-3.5 text-center">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#718272]">Interest</span>
                      <span className="font-mono text-xs font-bold text-[#143d26]">{p.rate}</span>
                    </div>
                    <div className="border-x border-[#e7ece5]">
                      <span className="block text-[10px] uppercase tracking-wider text-[#718272]">Tenure</span>
                      <span className="font-mono text-xs font-bold text-[#143d26]">{p.maxTenure}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#718272]">Funding</span>
                      <span className="font-mono text-xs font-bold text-[#143d26]">{p.maxFunding}</span>
                    </div>
                  </div>

                  {/* Key Highlights list */}
                  <ul className="mt-5 space-y-2 text-xs text-[#485949]">
                    {p.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={14} className="text-[#2b794d] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Actions */}
                <div className="mt-7 pt-4 border-t border-[#ebf0ea] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectProductForCalculator(p.defaultAmount, p.defaultTenure, p.defaultRate)}
                    className="text-xs font-semibold text-[#1f5e3b] hover:text-[#0e3521] inline-flex items-center gap-1.5 group/calc transition-colors"
                  >
                    <span className="underline decoration-transparent hover:decoration-[#1f5e3b] transition-all">Simulate in EMI Calculator</span>
                    <ArrowRight size={13} className="group-hover/calc:translate-x-1 transition-transform duration-200" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenApply(p.title)}
                    className="btn-press rounded-lg bg-[#14472d] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0e3521] active:scale-[0.98] transition-all"
                  >
                    Apply Now
                  </button>
                </div>
              </article>
            </Card3D>
          )
        })}
        </div>
      </div>
    </section>
  )
}
