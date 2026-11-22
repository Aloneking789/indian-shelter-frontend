"use client"

import Link from "next/link"
import { 
  Building2, 
  PhoneCall, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  LockKeyhole, 
  ArrowUpRight 
} from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#091f13] text-white border-t border-[#143a25]">
      {/* Upper Main Footer Grid */}
      <div className="mx-auto max-w-[1340px] px-4 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Col 1: Corporate Profile */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white text-[#0e3822] font-extrabold text-sm shadow-xs">
                IS
              </div>
              <div>
                <span className="block text-sm font-bold tracking-tight text-white">
                  INDIA SHELTER
                </span>
                <span className="block text-[9px] uppercase tracking-[0.16em] text-white/60">
                  Finance Corporation Limited
                </span>
              </div>
            </Link>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              India Shelter Finance Corporation Ltd (CIN: L65922HR2010PLC040609) is a housing finance company registered with the National Housing Bank (NHB) under Section 29A of the NHB Act, 1987. Listed on NSE and BSE.
            </p>

            <div className="pt-2 text-xs text-white/80 space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#64cb8c] shrink-0 mt-0.5" />
                <span className="text-[11px] text-white/70">
                  Registered Office: 6th Floor, Plot No. 15, Sector 44, Institutional Area, Gurugram, Haryana - 122002
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall size={14} className="text-[#64cb8c] shrink-0" />
                <a href="tel:18005728888" className="text-xs font-mono font-bold hover:underline text-[#8fe2af]">
                  1800-572-8888 (Toll Free)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-[#64cb8c] shrink-0" />
                <a href="mailto:customer.care@indiashelter.in" className="text-xs hover:underline text-white/75">
                  customer.care@indiashelter.in
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Loan Offerings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8fe2af] font-mono mb-4">
              Loan Offerings
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <a href="#loans" className="hover:text-white transition-colors">Home Purchase Loan</a>
              </li>
              <li>
                <a href="#loans" className="hover:text-white transition-colors">Plot & Construction Loan</a>
              </li>
              <li>
                <a href="#loans" className="hover:text-white transition-colors">Loan Against Property (LAP)</a>
              </li>
              <li>
                <a href="#loans" className="hover:text-white transition-colors">Home Improvement & Extension</a>
              </li>
              <li>
                <a href="#loans" className="hover:text-white transition-colors">PMAY-U 2.0 Interest Subsidy</a>
              </li>
              <li>
                <a href="#loans" className="hover:text-white transition-colors">Informal Income Assessment</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Tools & Network */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8fe2af] font-mono mb-4">
              Tools & Network
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">Interactive EMI Calculator</a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">Loan Eligibility Estimator</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">4-Step Doorstep Journey</a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">Compare with Banks</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">Frequently Asked Questions</a>
              </li>
              <li>
                <span className="text-white/40">215+ Branches in 15 States</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate Governance & Internal Portal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8fe2af] font-mono mb-4">
              Governance & Staff
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <span className="text-white/60">Fair Practices Code</span>
              </li>
              <li>
                <span className="text-white/60">Grievance Redressal</span>
              </li>
              <li>
                <span className="text-white/60">Interest Rate Model</span>
              </li>
              <li>
                <span className="text-white/60">Citizen Charter (NHB)</span>
              </li>
              
              {/* Internal Tool Link Highlight */}
              <li className="pt-3 border-t border-white/10">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-1.5 font-semibold text-[#ffd782] hover:text-white transition-colors"
                >
                  <LockKeyhole size={12} />
                  <span>Employee Sign In</span>
                  <ArrowUpRight size={11} />
                </Link>
                <p className="text-[10px] text-white/45 mt-0.5">
                  Template portal & operations
                </p>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Legal Disclaimer & Copyright */}
      <div className="border-t border-white/10 bg-[#06170d] py-6 px-4 sm:px-8 text-[11px] text-white/50">
        <div className="mx-auto max-w-[1340px] flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} India Shelter Finance Corporation Limited. All rights reserved.
          </p>

          {/* Prominent Creator Attribution */}
          <div className="flex items-center gap-1.5 text-xs text-white/90">
            <span>Designed & Engineered ·</span>
            <strong className="font-extrabold text-[#8fe2af] tracking-wide text-[13px]">
              Created by Ayush Vishwakarma
            </strong>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-white/60">
            <span>Disclaimer</span>
            <span>·</span>
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Use</span>
            <span>·</span>
            <Link href="/login" className="text-[#8fe2af] hover:underline">
              Staff Portal Access
            </Link>
          </div>
        </div>
        <p className="mx-auto max-w-[1340px] mt-3 text-[10px] leading-relaxed text-white/40">
          Disclaimer: Loans are granted at the sole discretion of India Shelter Finance Corporation Ltd after scrutiny of documents, legal title verification, and technical appraisal of the property. Terms & conditions apply.
        </p>
      </div>
    </footer>
  )
}
