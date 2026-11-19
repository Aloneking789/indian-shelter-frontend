"use client"

import { Check, X, ShieldCheck, Scale, Award } from "lucide-react"

const comparisonRows = [
  {
    criteria: "Income Documentation Required",
    banks: "Mandatory 3-year Income Tax Returns (ITR), audited P&L, balance sheets, and formal salary slips.",
    indiaShelter: "Informal income welcomed: bank passbook analysis, trade bills, daily cash register, and direct shop verification.",
    highlight: true
  },
  {
    criteria: "Property Types Financed",
    banks: "Strictly approved builder flats and municipal urban layouts; rejects non-standard land titles.",
    indiaShelter: "Self-construction on owned land, gram panchayat titles, Lal Dora, and semi-urban properties evaluated.",
    highlight: true
  },
  {
    criteria: "Turnaround Time (In-Principle)",
    banks: "25 to 45 working days with extensive branch back-and-forth.",
    indiaShelter: "In-principle sanction within 48 to 72 hours via in-house legal and technical teams.",
    highlight: false
  },
  {
    criteria: "Customer Interaction",
    banks: "Applicant must visit distant branch multiple times for document submission and signature formalities.",
    indiaShelter: "Dedicated relationship manager visits your doorstep at your convenience for all paperwork.",
    highlight: true
  },
  {
    criteria: "Co-Applicant & Family Flexibility",
    banks: "Rigid co-borrower constraints based strictly on formal co-owners with salary slips.",
    indiaShelter: "Family members (spouses, earning children, parents) can club incomes to boost loan eligibility.",
    highlight: false
  }
]

export function UnderwritingEdge() {
  return (
    <section id="why-us" className="scroll-mt-20 py-16 sm:py-24 bg-[#f8faf6] border-b border-[#e5eae2]">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd9c8] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1e5836]">
            <Scale size={13} className="text-[#2a7b4f]" />
            <span>The India Shelter Difference</span>
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#143221] sm:text-4xl">
            Why families choose us over traditional banks.
          </h2>
          <p className="mt-2.5 text-sm text-[#556756] leading-relaxed">
            Most commercial banks are built exclusively for corporate salaried employees with years of ITRs. We were built from the ground up for India’s enterprising middle class.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-2xl border border-[#d8e2d5] bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.45fr_1.45fr] border-b border-[#e1e7de] bg-[#edf4ed] text-xs font-bold text-[#153e26]">
            <div className="p-4 sm:p-5 flex items-center">Underwriting Criterion</div>
            <div className="p-4 sm:p-5 border-t md:border-t-0 md:border-l border-[#d8e2d5] text-[#697a6b] flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#9daaa0]" />
              <span>Traditional Commercial Banks</span>
            </div>
            <div className="p-4 sm:p-5 border-t md:border-t-0 md:border-l border-[#d8e2d5] bg-[#14472d] text-white flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#62d294]" />
              <span>India Shelter Finance Corporation</span>
            </div>
          </div>

          <div className="divide-y divide-[#e7ece5] text-xs">
            {comparisonRows.map((row, idx) => (
              <div 
                key={row.criteria}
                className={`grid grid-cols-1 md:grid-cols-[1.1fr_1.45fr_1.45fr] transition-colors hover:bg-[#fbfcfb] ${
                  row.highlight ? "bg-[#fcfdfb]" : ""
                }`}
              >
                {/* Criterion column */}
                <div className="p-4 sm:p-5 font-bold text-[#1c3826] flex items-center">
                  {row.criteria}
                </div>

                {/* Traditional Bank Column */}
                <div className="p-4 sm:p-5 md:border-l border-[#e7ece5] text-[#627363] leading-relaxed flex items-start gap-2.5">
                  <div className="size-5 rounded-full bg-[#fdeeed] text-[#b34032] flex items-center justify-center shrink-0 mt-0.5">
                    <X size={13} />
                  </div>
                  <span>{row.banks}</span>
                </div>

                {/* India Shelter Column */}
                <div className="p-4 sm:p-5 md:border-l border-[#e7ece5] bg-[#f4f9f4]/60 text-[#143e26] font-medium leading-relaxed flex items-start gap-2.5">
                  <div className="size-5 rounded-full bg-[#dcf2e4] text-[#1b6b3e] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check size={13} />
                  </div>
                  <span>{row.indiaShelter}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
