"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, PhoneCall } from "lucide-react"

const faqs = [
  {
    q: "Can I get a home loan if I do not file Income Tax Returns (ITR)?",
    a: "Yes, absolutely. A significant portion of India Shelter's customers are self-employed traders, micro-business owners, and skilled professionals who do not have formal audited ITRs. Our credit underwriting officers assess your actual earning capacity through bank account statements, daily ledger entries, shop inventory, customer footfall, and personal cash-flow appraisal during a doorstep visit."
  },
  {
    q: "What is the minimum and maximum loan amount I can borrow?",
    a: "We offer loan amounts ranging from ₹5,00,000 (₹5 Lakhs) up to ₹50,00,000 (₹50 Lakhs), depending on your repayment capacity and property valuation. For specific loan requirements above this bracket, special approvals are evaluated by our zonal credit committee."
  },
  {
    q: "Can I use the loan to build a home on a plot I already own?",
    a: "Yes. Our Home Construction Loan is specifically designed for customers who own a residential plot or parcel of land and wish to build an independent house. Loan amounts are released in tranches aligned with construction stages (foundation, slab, lintel, finishing)."
  },
  {
    q: "Are there any prepayment or foreclosure charges?",
    a: "As per regulatory directives by the National Housing Bank (NHB) and Reserve Bank of India (RBI), there are zero prepayment charges or foreclosure penalties on floating-rate housing loans sanctioned to individual borrowers."
  },
  {
    q: "How fast is the loan sanction process?",
    a: "Once our relationship officer picks up your basic KYC documents and property details at your doorstep, our in-house technical and legal team aims to issue an in-principle sanction letter within 48 to 72 hours."
  },
  {
    q: "Can I add my family members as co-applicants to increase eligibility?",
    a: "Yes! Clubbing the income of your spouse, working son, daughter, or parents as co-applicants can significantly enhance your total borrowing capacity and help you secure a higher loan amount."
  }
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-20 py-16 sm:py-24 bg-white border-b border-[#e5eae2]">
      <div className="mx-auto max-w-[980px] px-4 sm:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd9c8] bg-[#edf5ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1e5836]">
            <HelpCircle size={13} className="text-[#2a7b4f]" />
            <span>Clear Answers</span>
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#143221] sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-[#556756]">
            Everything you need to know about loan eligibility, informal appraisals, and loan sanctions.
          </p>
        </div>

        {/* Accordions */}
        <div className="divide-y divide-[#e3e9e0] rounded-2xl border border-[#dde4d9] bg-[#fbfbf9] overflow-hidden shadow-xs">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="transition-colors hover:bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-[#143221] group-hover:text-[#195a36] transition-colors">
                    {faq.q}
                  </span>
                  <div className={`flex size-7 items-center justify-center rounded-full bg-[#edf5ee] text-[#1c5c3a] shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "rotate-180 bg-[#14472d] text-white" : "group-hover:bg-[#dbe9dc]"}`}>
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-[#4f6050] leading-relaxed border-t border-[#edf2ea] bg-white pt-4 animate-in fade-in-50 zoom-in-98 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Extra Support Callout */}
        <div className="mt-8 text-center text-xs text-[#627363]">
          <span>Still have questions about your specific documents? </span>
          <a href="tel:18005728888" className="font-semibold text-[#185333] hover:underline inline-flex items-center gap-1">
            <PhoneCall size={12} />
            <span>Call Toll-Free 1800-572-8888</span>
          </a>
        </div>
      </div>
    </section>
  )
}
