"use client"

import { Building2, Users2, Landmark, Clock, Award, ShieldCheck } from "lucide-react"
import { Card3D } from "../ui/card-3d"

const stats = [
  {
    value: "₹5,500+ Cr",
    label: "Cumulative Loans Disbursed",
    description: "Financing home ownership across urban & rural India",
    icon: Landmark
  },
  {
    value: "215+",
    label: "Full-Service Branches",
    description: "Deep direct presence across 15 Indian states",
    icon: Building2
  },
  {
    value: "1,15,000+",
    label: "Proud Families Housed",
    description: "Helping first-generation homeowners achieve dignity",
    icon: Users2
  },
  {
    value: "48 Hours",
    label: "Average In-Principle Sanction",
    description: "Fast doorstep valuation & in-house legal verification",
    icon: Clock
  },
  {
    value: "CRISIL A+",
    label: "Stable Credit Rating",
    description: "Recognized financial strength & sound asset quality",
    icon: Award
  }
]

export function StatsBanner() {
  return (
    <section className="border-b border-[#e5eae2] bg-[#f5f8f3] py-12">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd9c8] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1e5836]">
            <ShieldCheck size={13} className="text-[#2a7b4f]" />
            <span>Proven Scale & Performance</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#143221] sm:text-3xl">
            A trusted national housing finance institution.
          </h2>
          <p className="mt-2 text-xs text-[#5a6c5c] leading-relaxed">
            Listed on NSE and BSE, India Shelter provides formal credit access to underserved middle-income and low-income households.
          </p>
        </div>

        {/* 5-Column Grid with GPU-Composited 3D Depth */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 perspective-1000">
          {stats.map(({ value, label, description, icon: Icon }) => (
            <Card3D
              key={label}
              maxRotation={8}
              scale={1.03}
              className="h-full"
            >
              <div className="h-full rounded-2xl border border-[#dde4d9] bg-white p-5 shadow-xs transition hover:shadow-md hover:border-[#b8cdb6] flex flex-col justify-between">
                <div>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#edf5ee] text-[#1b5e39] mb-4">
                    <Icon size={18} />
                  </div>
                  <div className="font-mono text-2xl font-extrabold tracking-tight text-[#11311f]">
                    {value}
                  </div>
                  <h3 className="mt-1 text-xs font-bold text-[#1e3c2b] leading-snug">
                    {label}
                  </h3>
                </div>
                <p className="mt-2 text-[11px] text-[#69796a] leading-relaxed">
                  {description}
                </p>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  )
}
