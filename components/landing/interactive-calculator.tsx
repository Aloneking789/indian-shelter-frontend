"use client"

import { useState } from "react"
import { 
  Calculator, 
  IndianRupee, 
  Calendar, 
  Percent, 
  ArrowRight, 
  CheckCircle2, 
  PieChart, 
  Sliders, 
  ChevronDown,
  Info,
  Plus,
  Minus
} from "lucide-react"

interface InteractiveCalculatorProps {
  onOpenApply: (productTitle?: string) => void
  externalAmount?: number
  externalTenure?: number
  externalRate?: number
}

export function InteractiveCalculator({ 
  onOpenApply,
  externalAmount = 2000000,
  externalTenure = 15,
  externalRate = 9.75
}: InteractiveCalculatorProps) {
  const [tab, setTab] = useState<"emi" | "eligibility">("emi")

  // EMI Calculator State
  const [amount, setAmount] = useState<number>(externalAmount)
  const [tenureYears, setTenureYears] = useState<number>(externalTenure)
  const [interestRate, setInterestRate] = useState<number>(externalRate)
  const [showAmortization, setShowAmortization] = useState<boolean>(false)

  // Eligibility Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState<number>(45000)
  const [existingEmi, setExistingEmi] = useState<number>(5000)

  // Calculate percentage of track fill for CSS gradient
  const amountPercent = Math.round(((amount - 300000) / (5000000 - 300000)) * 100)
  const tenurePercent = Math.round(((tenureYears - 3) / (20 - 3)) * 100)
  const ratePercent = Math.round(((interestRate - 9) / (15 - 9)) * 100)
  const incomePercent = Math.round(((monthlyIncome - 15000) / (200000 - 15000)) * 100)
  const existingEmiPercent = Math.round(((existingEmi - 0) / (50000 - 0)) * 100)

  // Standard Mathematical EMI calculation
  const monthlyRate = interestRate / 12 / 100
  const totalMonths = tenureYears * 12
  const emi = Math.round(
    (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  )

  const totalPayable = emi * totalMonths
  const totalInterest = Math.max(0, totalPayable - amount)
  const principalPercentage = Math.round((amount / totalPayable) * 100)
  const interestPercentage = 100 - principalPercentage

  // Eligibility calculation: FOIR = 50% of (Monthly Income - Existing EMI)
  const maxAvailableMonthlyEmi = Math.max(0, (monthlyIncome * 0.50) - existingEmi)
  const estimatedEligibility = Math.round(
    (maxAvailableMonthlyEmi * (Math.pow(1 + monthlyRate, totalMonths) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))
  )

  // Generate Year 1-5 Amortization preview
  const amortizationPreview = []
  let balance = amount
  for (let year = 1; year <= Math.min(5, tenureYears); year++) {
    let yearInterest = 0
    let yearPrincipal = 0
    for (let month = 1; month <= 12; month++) {
      const monthInterest = balance * monthlyRate
      const monthPrincipal = emi - monthInterest
      yearInterest += monthInterest
      yearPrincipal += monthPrincipal
      balance = Math.max(0, balance - monthPrincipal)
    }
    amortizationPreview.push({
      year,
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      balance: Math.round(balance)
    })
  }

  return (
    <section id="calculator" className="scroll-mt-20 py-16 sm:py-24 bg-[#f8faf6] border-b border-[#e5eae2]">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd9c8] bg-white px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1e5836] shadow-2xs">
            <Calculator size={13} className="text-[#2a7b4f]" />
            <span>Interactive Financial Planning</span>
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#143221] sm:text-4xl">
            Transparent numbers. Zero surprises.
          </h2>
          <p className="mt-2.5 text-sm text-[#556756] leading-relaxed">
            Test your loan tenure, calculate monthly repayments, and check your household purchasing eligibility before applying.
          </p>

          {/* Mode Switcher Tabs with Micro Transition */}
          <div className="inline-flex mt-6 rounded-xl border border-[#d8e0d6] bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setTab("emi")}
              className={`btn-press flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                tab === "emi"
                  ? "bg-[#14472d] text-white shadow-xs"
                  : "text-[#556756] hover:bg-[#f3f7f2]"
              }`}
            >
              <PieChart size={14} />
              <span>Loan EMI Calculator</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("eligibility")}
              className={`btn-press flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                tab === "eligibility"
                  ? "bg-[#14472d] text-white shadow-xs"
                  : "text-[#556756] hover:bg-[#f3f7f2]"
              }`}
            >
              <Sliders size={14} />
              <span>Eligibility Estimator</span>
            </button>
          </div>
        </div>

        {tab === "emi" ? (
          /* EMI Calculator View */
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start animate-in fade-in-50 duration-200">
            
            {/* Left Box: Controls & Sliders with custom dynamic fill */}
            <div className="rounded-2xl border border-[#dde4d9] bg-white p-6 sm:p-8 shadow-sm space-y-7">
              
              {/* Slider 1: Loan Amount */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#485b4b]">
                    Loan Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-[#cfe0cc] bg-[#f2f8f2] px-3 py-1 font-mono text-sm font-extrabold text-[#113a23] tabular-nums shadow-2xs">
                      <IndianRupee size={13} className="text-[#1a5b37]" />
                      <span>{(amount / 100000).toFixed(1)} Lakhs</span>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAmount(Math.max(300000, amount - 100000))}
                    className="btn-press size-7 rounded-full border border-[#d6dfd3] bg-[#f8faf7] flex items-center justify-center text-[#235839] hover:bg-[#ebf3ea] shrink-0 active:scale-90"
                    aria-label="Decrease amount by 1 lakh"
                  >
                    <Minus size={12} />
                  </button>

                  <input
                    type="range"
                    min={300000}
                    max={5000000}
                    step={50000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="range-slider w-full"
                    style={{
                      "--slider-track": `linear-gradient(to right, #14472d 0%, #14472d ${amountPercent}%, #e2eae0 ${amountPercent}%, #e2eae0 100%)`
                    } as React.CSSProperties}
                  />

                  <button
                    type="button"
                    onClick={() => setAmount(Math.min(5000000, amount + 100000))}
                    className="btn-press size-7 rounded-full border border-[#d6dfd3] bg-[#f8faf7] flex items-center justify-center text-[#235839] hover:bg-[#ebf3ea] shrink-0 active:scale-90"
                    aria-label="Increase amount by 1 lakh"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="flex justify-between text-[11px] font-mono tabular-nums text-[#748575]">
                  <span>₹3 Lakh</span>
                  <span>₹25 Lakh</span>
                  <span>₹50 Lakh</span>
                </div>
              </div>

              {/* Slider 2: Tenure Years */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#485b4b]">
                    Loan Tenure
                  </label>
                  <div className="flex items-center gap-1 rounded-lg border border-[#cfe0cc] bg-[#f2f8f2] px-3 py-1 font-mono text-sm font-extrabold text-[#113a23] tabular-nums shadow-2xs">
                    <Calendar size={13} className="text-[#1a5b37]" />
                    <span>{tenureYears} Years ({totalMonths} Mos)</span>
                  </div>
                </div>

                <div className="relative flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTenureYears(Math.max(3, tenureYears - 1))}
                    className="btn-press size-7 rounded-full border border-[#d6dfd3] bg-[#f8faf7] flex items-center justify-center text-[#235839] hover:bg-[#ebf3ea] shrink-0 active:scale-90"
                    aria-label="Decrease tenure by 1 year"
                  >
                    <Minus size={12} />
                  </button>

                  <input
                    type="range"
                    min={3}
                    max={20}
                    step={1}
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="range-slider w-full"
                    style={{
                      "--slider-track": `linear-gradient(to right, #14472d 0%, #14472d ${tenurePercent}%, #e2eae0 ${tenurePercent}%, #e2eae0 100%)`
                    } as React.CSSProperties}
                  />

                  <button
                    type="button"
                    onClick={() => setTenureYears(Math.min(20, tenureYears + 1))}
                    className="btn-press size-7 rounded-full border border-[#d6dfd3] bg-[#f8faf7] flex items-center justify-center text-[#235839] hover:bg-[#ebf3ea] shrink-0 active:scale-90"
                    aria-label="Increase tenure by 1 year"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="flex justify-between text-[11px] font-mono tabular-nums text-[#748575]">
                  <span>3 Years</span>
                  <span>10 Years</span>
                  <span>20 Years</span>
                </div>
              </div>

              {/* Slider 3: Interest Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#485b4b]">
                    Interest Rate (p.a.)
                  </label>
                  <div className="flex items-center gap-1 rounded-lg border border-[#cfe0cc] bg-[#f2f8f2] px-3 py-1 font-mono text-sm font-extrabold text-[#113a23] tabular-nums shadow-2xs">
                    <Percent size={13} className="text-[#1a5b37]" />
                    <span>{interestRate.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="relative flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInterestRate(Math.max(9.00, Number((interestRate - 0.25).toFixed(2))))}
                    className="btn-press size-7 rounded-full border border-[#d6dfd3] bg-[#f8faf7] flex items-center justify-center text-[#235839] hover:bg-[#ebf3ea] shrink-0 active:scale-90"
                    aria-label="Decrease interest rate by 0.25%"
                  >
                    <Minus size={12} />
                  </button>

                  <input
                    type="range"
                    min={9.00}
                    max={15.00}
                    step={0.25}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="range-slider w-full"
                    style={{
                      "--slider-track": `linear-gradient(to right, #14472d 0%, #14472d ${ratePercent}%, #e2eae0 ${ratePercent}%, #e2eae0 100%)`
                    } as React.CSSProperties}
                  />

                  <button
                    type="button"
                    onClick={() => setInterestRate(Math.min(15.00, Number((interestRate + 0.25).toFixed(2))))}
                    className="btn-press size-7 rounded-full border border-[#d6dfd3] bg-[#f8faf7] flex items-center justify-center text-[#235839] hover:bg-[#ebf3ea] shrink-0 active:scale-90"
                    aria-label="Increase interest rate by 0.25%"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="flex justify-between text-[11px] font-mono tabular-nums text-[#748575]">
                  <span>9.00%</span>
                  <span>12.00%</span>
                  <span>15.00%</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2 border-t border-[#edf1ea]">
                <span className="block text-[11px] font-semibold text-[#5a6c5b] mb-2">Popular Configurations:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { label: "₹12L · 15Y · 9.75%", a: 1200000, t: 15, r: 9.75 },
                    { label: "₹25L · 18Y · 9.75%", a: 2500000, t: 18, r: 9.75 },
                    { label: "₹35L · 20Y · 10.25%", a: 3500000, t: 20, r: 10.25 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => { setAmount(preset.a); setTenureYears(preset.t); setInterestRate(preset.r); }}
                      className="btn-press px-2.5 py-1 rounded-md border border-[#d6dfd4] bg-[#f7faf6] text-[#334636] text-[11px] font-medium hover:bg-[#edf4ec] hover:border-[#b8ccb6] active:scale-95 transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Box: Breakdown, Visual Ratio & CTA */}
            <div className="rounded-2xl border border-[#cfe0cc] bg-[#f4f9f4] p-6 sm:p-8 shadow-sm space-y-6">
              
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2d6c47]">
                  Your Estimated Monthly Repayment
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#0e3b22] tabular-nums tracking-tight">
                    ₹{emi.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-medium text-[#46604b]"> / month</span>
                </div>
              </div>

              {/* Graphical Proportion Bar with Smooth Motion */}
              <div className="rounded-xl bg-white border border-[#dce6db] p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-medium text-[#4c5e4d]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="size-3 rounded-full bg-[#1b5e39]" />
                    Principal: {principalPercentage}%
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="size-3 rounded-full bg-[#dfb05b]" />
                    Interest: {interestPercentage}%
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-[#e3ece2] overflow-hidden flex shadow-inner">
                  <div 
                    className="bg-[#1b5e39] transition-all duration-300 ease-out"
                    style={{ width: `${principalPercentage}%` }} 
                  />
                  <div 
                    className="bg-[#dfb05b] transition-all duration-300 ease-out"
                    style={{ width: `${interestPercentage}%` }} 
                  />
                </div>
              </div>

              {/* Exact Breakdown Numbers */}
              <div className="divide-y divide-[#dce7db] text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-[#5b6e5c]">Principal Loan Amount:</span>
                  <span className="font-mono font-bold text-[#143d26] tabular-nums">₹{amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-[#5b6e5c]">Total Interest Payable:</span>
                  <span className="font-mono font-bold text-[#865917] tabular-nums">₹{totalInterest.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-2.5 font-medium">
                  <span className="text-[#143221] font-semibold">Total Amount (Principal + Interest):</span>
                  <span className="font-mono font-bold text-[#143d26] tabular-nums">₹{totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* CTA Action */}
              <button
                type="button"
                onClick={() => onOpenApply(`Home Loan ₹${(amount/100000).toFixed(1)}L`)}
                className="btn-press group w-full flex items-center justify-center gap-2 rounded-xl bg-[#14472d] py-3.5 text-xs font-semibold text-white shadow-md hover:bg-[#0e3521] active:scale-[0.98] transition-all"
              >
                <span>Apply for this ₹{(amount / 100000).toFixed(1)} Lakh Plan</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              {/* Amortization Schedule Accordion with Smooth Expansion */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#215f3a] hover:underline pt-2 group"
                >
                  <span>{showAmortization ? "Hide Amortization Preview" : "View 5-Year Amortization Schedule"}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showAmortization ? "rotate-180" : ""}`} />
                </button>

                {showAmortization && (
                  <div className="mt-3 overflow-x-auto rounded-xl border border-[#dce6db] bg-white text-[11px] animate-in fade-in-50 zoom-in-98 duration-200 shadow-2xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#edf5ee] text-[#1c472d] font-semibold border-b border-[#dce6db]">
                        <tr>
                          <th className="py-2 px-3">Year</th>
                          <th className="py-2 px-3">Principal</th>
                          <th className="py-2 px-3">Interest</th>
                          <th className="py-2 px-3">End Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf1eb] font-mono tabular-nums text-[#435444]">
                        {amortizationPreview.map((row) => (
                          <tr key={row.year} className="hover:bg-[#f8fbf7] transition-colors">
                            <td className="py-1.5 px-3 font-sans font-bold">Year {row.year}</td>
                            <td className="py-1.5 px-3">₹{row.principal.toLocaleString("en-IN")}</td>
                            <td className="py-1.5 px-3">₹{row.interest.toLocaleString("en-IN")}</td>
                            <td className="py-1.5 px-3 font-semibold text-[#143d26]">₹{row.balance.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Eligibility Estimator View */
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start animate-in fade-in-50 duration-200">
            
            <div className="rounded-2xl border border-[#dde4d9] bg-white p-6 sm:p-8 shadow-sm space-y-7">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#485b4b]">
                    Net Monthly Household Income
                  </label>
                  <span className="font-mono text-sm font-extrabold text-[#113a23] tabular-nums shadow-2xs bg-[#f2f8f2] px-3 py-1 rounded-lg border border-[#cfe0cc]">
                    ₹{monthlyIncome.toLocaleString("en-IN")} / mo
                  </span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={200000}
                  step={5000}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="range-slider w-full"
                  style={{
                    "--slider-track": `linear-gradient(to right, #14472d 0%, #14472d ${incomePercent}%, #e2eae0 ${incomePercent}%, #e2eae0 100%)`
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-[11px] font-mono tabular-nums text-[#748575]">
                  <span>₹15,000</span>
                  <span>₹1,00,000</span>
                  <span>₹2,00,000</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#485b4b]">
                    Current Existing Monthly EMIs
                  </label>
                  <span className="font-mono text-sm font-extrabold text-[#7c2f25] tabular-nums shadow-2xs bg-[#fef2f0] px-3 py-1 rounded-lg border border-[#f5d3cf]">
                    ₹{existingEmi.toLocaleString("en-IN")} / mo
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={1000}
                  value={existingEmi}
                  onChange={(e) => setExistingEmi(Number(e.target.value))}
                  className="range-slider w-full"
                  style={{
                    "--slider-track": `linear-gradient(to right, #8e352b 0%, #8e352b ${existingEmiPercent}%, #e2eae0 ${existingEmiPercent}%, #e2eae0 100%)`
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-[11px] font-mono tabular-nums text-[#748575]">
                  <span>₹0</span>
                  <span>₹25,000</span>
                  <span>₹50,000</span>
                </div>
              </div>

              <div className="rounded-xl border border-[#dfe8de] bg-[#f8fbf7] p-4 text-xs text-[#526453] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-[#18462b]">
                  <Info size={15} />
                  <span>Informal Income Considerations</span>
                </div>
                <p className="leading-relaxed">
                  If you run a local retail shop, trade business, or micro-workshop, India Shelter takes into account daily ledger entries, UPI collections, and physical inventory to augment your formal eligibility.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#cfe0cc] bg-[#f4f9f4] p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2d6c47]">
                  Estimated Maximum Loan Eligibility
                </span>
                <div className="mt-2">
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#0e3b22] tabular-nums">
                    ₹{(estimatedEligibility / 100000).toFixed(1)} Lakhs
                  </span>
                  <p className="text-xs text-[#526955] mt-1">
                    Based on 50% FOIR (Fixed Obligation to Income Ratio) over a 15-year tenure.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white border border-[#dce6db] p-4 space-y-2 text-xs shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-[#647665]">Allowable Monthly EMI:</span>
                  <span className="font-mono font-bold text-[#143d26] tabular-nums">₹{maxAvailableMonthlyEmi.toLocaleString("en-IN")} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647665]">Estimated Tenure:</span>
                  <span className="font-mono font-bold text-[#143d26] tabular-nums">15 Years (180 months)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenApply(`Eligibility ₹${(estimatedEligibility/100000).toFixed(1)}L`)}
                className="btn-press group w-full flex items-center justify-center gap-2 rounded-xl bg-[#14472d] py-3.5 text-xs font-semibold text-white shadow-md hover:bg-[#0e3521] active:scale-[0.98] transition-all"
              >
                <span>Check Eligibility with a Relationship Officer</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
