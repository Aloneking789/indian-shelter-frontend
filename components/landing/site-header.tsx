"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Building2, 
  PhoneCall, 
  Menu, 
  X, 
  ArrowRight, 
  LockKeyhole, 
  ShieldCheck, 
  Calculator, 
  MapPin, 
  Sparkles,
  ChevronDown
} from "lucide-react"

interface SiteHeaderProps {
  onOpenApply: () => void
}

export function SiteHeader({ onOpenApply }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)

  return (
    <>
      {/* Top corporate notice / regulatory banner */}
      <div className="bg-[#0b2819] text-[#b6d6c3] border-b border-[#16432c] text-[11px] py-1.5 px-4 sm:px-8">
        <div className="mx-auto flex max-w-[1340px] items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-[#17462d] px-2 py-0.5 text-[10px] font-semibold text-[#d4ebd9] tracking-wide">
              <ShieldCheck size={12} className="text-[#64cb8c]" />
              NHB REGISTERED
            </span>
            <span className="hidden sm:inline text-white/70">
              India Shelter Finance Corporation Ltd · Housing Finance Company
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a 
              href="tel:18005728888" 
              className="inline-flex items-center gap-1.5 font-mono text-[#e4f3ea] hover:text-white transition-colors"
            >
              <PhoneCall size={12} className="text-[#64cb8c]" />
              <span className="font-semibold">1800-572-8888</span>
              <span className="hidden md:inline text-[10px] text-white/60 font-sans">(Toll-free 9:30 AM - 6:30 PM)</span>
            </a>

            <div className="h-3 w-px bg-white/20 hidden sm:block" />

            {/* Direct Employee Portal Shortcut in top banner */}
            <Link 
              href="/login" 
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-[#ffd782] hover:text-white transition-colors"
            >
              <LockKeyhole size={11} />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <header className="sticky top-0 z-40 border-b border-[#e1e6de] bg-[#fbfaf6]/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-[72px] max-w-[1340px] items-center justify-between px-4 sm:px-8">
          
          {/* Logo & Corporate Identity */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="India Shelter Finance Home">
            <div className="flex size-11 items-center justify-center rounded-lg bg-[#14472d] text-white font-bold text-base shadow-sm group-hover:bg-[#0e3521] transition-colors">
              IS
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-bold tracking-tight text-[#143021]">INDIA SHELTER</span>
                <span className="rounded bg-[#edf4ed] px-1.5 py-0.2 text-[9px] font-semibold text-[#256843] border border-[#d2e2d4]">HFC</span>
              </div>
              <span className="block text-[9.5px] font-medium tracking-[0.14em] text-[#69796a] uppercase">
                Finance Corporation Ltd
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-[#3b4b3e]" aria-label="Primary Navigation">
            
            {/* Products Dropdown Trigger */}
            <div 
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button 
                className="flex items-center gap-1 py-2 hover:text-[#14472d] transition-colors"
                onClick={() => setProductsOpen(!productsOpen)}
              >
                <span>Loan Products</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${productsOpen ? "rotate-180 text-[#14472d]" : "text-[#7a887a]"}`} />
              </button>

              {productsOpen && (
                <div className="absolute top-full left-0 w-72 rounded-xl border border-[#dde4da] bg-white p-2.5 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
                  <a 
                    href="#loans" 
                    onClick={() => setProductsOpen(false)}
                    className="block p-2.5 rounded-lg hover:bg-[#f3f7f2] transition-colors"
                  >
                    <p className="text-xs font-semibold text-[#183925]">Home Purchase & Construction</p>
                    <p className="text-[11px] text-[#6e7d6f] mt-0.5">Rates from 9.75% p.a. · Up to 20 years</p>
                  </a>
                  <a 
                    href="#loans" 
                    onClick={() => setProductsOpen(false)}
                    className="block p-2.5 rounded-lg hover:bg-[#f3f7f2] transition-colors"
                  >
                    <p className="text-xs font-semibold text-[#183925]">Loan Against Property (LAP)</p>
                    <p className="text-[11px] text-[#6e7d6f] mt-0.5">Unlock capital from existing property</p>
                  </a>
                  <a 
                    href="#loans" 
                    onClick={() => setProductsOpen(false)}
                    className="block p-2.5 rounded-lg hover:bg-[#f3f7f2] transition-colors"
                  >
                    <p className="text-xs font-semibold text-[#183925]">Home Extension & Improvement</p>
                    <p className="text-[11px] text-[#6e7d6f] mt-0.5">Renovations, floor additions & repairs</p>
                  </a>
                  <a 
                    href="#loans" 
                    onClick={() => setProductsOpen(false)}
                    className="block p-2.5 rounded-lg hover:bg-[#f3f7f2] transition-colors border-t border-[#edf1ea] mt-1 pt-2"
                  >
                    <p className="text-xs font-semibold text-[#1f5636]">PMAY 2.0 Affordable Housing</p>
                    <p className="text-[11px] text-[#6e7d6f] mt-0.5">Government interest subsidy benefits</p>
                  </a>
                </div>
              )}
            </div>

            <a href="#calculator" className="hover:text-[#14472d] transition-colors flex items-center gap-1.5">
              <Calculator size={14} className="text-[#2b6d47]" />
              <span>EMI Calculator</span>
            </a>

            <a href="#how-it-works" className="hover:text-[#14472d] transition-colors">
              4-Step Process
            </a>

            <a href="#why-us" className="hover:text-[#14472d] transition-colors">
              Why India Shelter
            </a>

            <a href="#team" className="hover:text-[#14472d] transition-colors">
              Meet Our Team
            </a>

            <a href="#branches" className="hover:text-[#14472d] transition-colors flex items-center gap-1">
              <MapPin size={13} className="text-[#728574]" />
              <span>215+ Branches</span>
            </a>
          </nav>

          {/* Action Hub & Internal Tool Gateway */}
          <div className="flex items-center gap-3">
            
            {/* The Dedicated Internal Tool / Employee Workspace Gateway */}
            <Link 
              href="/login" 
              className="group relative flex items-center gap-2 rounded-lg border border-[#c9d8c6] bg-[#edf4ed] px-3.5 py-2 text-xs font-semibold text-[#18492c] transition-all hover:bg-[#e1ede0] hover:border-[#adc3a9] active:scale-[0.98]"
              title="India Shelter Internal Operations & Template Portal"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#298d54] opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-[#1b6b3e]"></span>
              </span>
              <LockKeyhole size={13} className="text-[#1e5836]" />
              <span className="tracking-tight">Employee Workspace</span>
            </Link>

            {/* Public Customer Apply CTA */}
            <button
              type="button"
              onClick={onOpenApply}
              className="btn-press group hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#14472d] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0e3521] active:scale-[0.98] transition-all"
            >
              <span>Apply for Loan</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex size-10 items-center justify-center rounded-lg border border-[#d8ded4] bg-white text-[#2a382b] hover:bg-[#f4f7f2]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e2e7df] bg-white px-5 py-6 shadow-xl animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-3 text-sm">
              <a 
                href="#loans" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f2f6f1] text-[#243326] font-medium"
              >
                Loan Products (Home Loan, LAP, Renovation)
              </a>
              <a 
                href="#calculator" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f2f6f1] text-[#243326] font-medium"
              >
                Interactive EMI Calculator
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f2f6f1] text-[#243326] font-medium"
              >
                How It Works (4-Step Doorstep Journey)
              </a>
              <a 
                href="#why-us" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f2f6f1] text-[#243326] font-medium"
              >
                Why India Shelter (Informal Income Approval)
              </a>
              <a 
                href="#team" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f2f6f1] text-[#243326] font-medium"
              >
                Meet Our Team (Leadership & Operations)
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#f2f6f1] text-[#243326] font-medium"
              >
                Frequently Asked Questions
              </a>
              
              <div className="pt-3 border-t border-[#edf0eb] flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onOpenApply()
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#14472d] py-3 text-xs font-semibold text-white shadow-sm"
                >
                  <span>Apply for Loan Online</span>
                  <ArrowRight size={14} />
                </button>

                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#c4d6c1] bg-[#eef5ee] py-2.5 text-xs font-semibold text-[#18492c]"
                >
                  <LockKeyhole size={14} />
                  <span>Enter Employee Workspace (Portal)</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
