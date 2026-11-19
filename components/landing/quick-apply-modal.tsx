"use client"

import { useState } from "react"
import { CheckCircle2, Phone, User, MapPin, IndianRupee, X, ArrowRight, ShieldCheck } from "lucide-react"

interface QuickApplyModalProps {
  isOpen: boolean
  onClose: () => void
  initialLoanType?: string
  initialAmount?: number
}

export function QuickApplyModal({ isOpen, onClose, initialLoanType = "Home Loan", initialAmount = 1500000 }: QuickApplyModalProps) {
  const [step, setStep] = useState<"form" | "success">("form")
  const [loanType, setLoanType] = useState(initialLoanType)
  const [amount, setAmount] = useState(initialAmount)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [occupation, setOccupation] = useState("self-employed")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("success")
  }

  const handleReset = () => {
    setStep("form")
    setName("")
    setPhone("")
    setCity("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#e2e7df] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header decoration */}
        <div className="bg-[#123e27] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#216140] text-white font-bold text-xs tracking-wider">
              ISFC
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#98c5ab] font-mono">India Shelter Finance</p>
              <h3 className="text-base font-semibold text-white">48-Hour Loan Sanction Request</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#5f6c5f] leading-relaxed">
                Provide your basic contact information. Our dedicated relationship manager in your city will connect with you within 2 business hours.
              </p>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#415042] mb-1.5">
                  Select Loan Type
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    "Home Purchase / Construction",
                    "Loan Against Property (LAP)",
                    "Home Renovation / Extension",
                    "PMAY 2.0 Affordable Housing"
                  ].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setLoanType(type)}
                      className={`px-3 py-2 text-left rounded-lg border text-xs font-medium transition-all ${
                        loanType === type
                          ? "border-[#1c5c3b] bg-[#edf5ef] text-[#14422a] font-semibold ring-1 ring-[#1c5c3b]"
                          : "border-[#e0e5dd] text-[#4b574a] hover:bg-[#f6f8f5]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#415042] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808d7f]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#dce2d9] bg-white text-[#1f2d22] placeholder:text-[#a0aaa0] focus:outline-none focus:border-[#1c5c3b] focus:ring-1 focus:ring-[#1c5c3b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#415042] mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808d7f]" />
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#dce2d9] bg-white text-[#1f2d22] placeholder:text-[#a0aaa0] focus:outline-none focus:border-[#1c5c3b] focus:ring-1 focus:ring-[#1c5c3b]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#415042] mb-1">
                    City / Town *
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808d7f]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Indore, Jaipur, Surat"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#dce2d9] bg-white text-[#1f2d22] placeholder:text-[#a0aaa0] focus:outline-none focus:border-[#1c5c3b] focus:ring-1 focus:ring-[#1c5c3b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#415042] mb-1">
                    Employment Status
                  </label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#dce2d9] bg-white text-[#1f2d22] focus:outline-none focus:border-[#1c5c3b] focus:ring-1 focus:ring-[#1c5c3b]"
                  >
                    <option value="self-employed">Self-Employed / Trader</option>
                    <option value="salaried">Salaried Employee</option>
                    <option value="contractor">Micro-Enterprise / Contractor</option>
                    <option value="informal">Informal Cash Income</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#415042]">
                    Estimated Loan Requirement:
                  </label>
                  <span className="text-xs font-bold font-mono text-[#14422a]">
                    ₹{(amount / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min={300000}
                  max={5000000}
                  step={50000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-[#1c5c3b] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#788577] mt-0.5">
                  <span>₹3 Lakh</span>
                  <span>₹25 Lakh</span>
                  <span>₹50 Lakh</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#edf0eb]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#617060]">
                  <ShieldCheck size={14} className="text-[#2b6f49]" />
                  <span>Doorstep Document Pickup</span>
                </div>
                <button
                  type="submit"
                  className="btn-press group inline-flex items-center gap-2 rounded-lg bg-[#185334] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#124229] active:scale-[0.98] transition-all"
                >
                  <span>Submit Request</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </form>
          ) : (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#edf7f0] text-[#1c663e]">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#143d26]">Application Received!</h4>
                <p className="mt-1 text-xs text-[#526352] max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-[#143d26]">{name || "Valued Applicant"}</span>. 
                  Our nearest branch officer for <span className="font-semibold text-[#143d26]">{city || "your region"}</span> has been notified and will call you at <span className="font-semibold font-mono text-[#143d26]">{phone}</span> shortly.
                </p>
              </div>
              <div className="rounded-xl border border-[#e1e7de] bg-[#f9faf8] p-3 text-left text-xs space-y-1.5 text-[#516151]">
                <div className="flex justify-between">
                  <span className="text-[#758474]">Application Ref:</span>
                  <span className="font-mono font-bold text-[#143d26]">ISFC-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#758474]">Product:</span>
                  <span className="font-medium text-[#143d26]">{loanType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#758474]">Estimated Amount:</span>
                  <span className="font-mono font-medium text-[#143d26]">₹{(amount / 100000).toFixed(1)} Lakhs</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="btn-press w-full rounded-lg bg-[#185334] py-2.5 text-xs font-semibold text-white hover:bg-[#124229]"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
