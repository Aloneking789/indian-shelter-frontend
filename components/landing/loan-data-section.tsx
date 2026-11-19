import { ArrowUpRight, Home, Building2, Wrench } from "lucide-react"

const loanUses = [
  { title: "Purchase a home", description: "Finance for buying a home for your family.", icon: Home },
  { title: "Build your home", description: "Support for home construction and extension needs.", icon: Building2 },
  { title: "Improve your home", description: "Funding for repairs, renovation and improvements.", icon: Wrench },
]

export function LoanDataSection() {
  return (
    <section id="loan-data" className="relative border-y border-foreground/10 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <span className="mb-5 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
              <span className="h-px w-8 bg-foreground/30" />Home loan information
            </span>
            <h2 className="max-w-xl font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">Make room for what comes next.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">Explore home finance options from India Shelter Finance. Loan amount and repayment terms are subject to eligibility and assessment.</p>
            <a href="https://www.indiashelter.in/" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">Explore India Shelter <ArrowUpRight size={15} /></a>
          </div>
          <div className="grid gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2">
            <div className="bg-background p-6 sm:col-span-2 sm:p-8">
              <p className="font-mono text-xs text-muted-foreground">Published home loan range</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1"><span className="font-display text-4xl tracking-tight sm:text-5xl">₹7 lakh</span><span className="text-muted-foreground">to</span><span className="font-display text-4xl tracking-tight sm:text-5xl">₹1 crore</span></div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">The amount offered depends on applicant profile, property, and eligibility checks.</p>
            </div>
            <div className="bg-background p-6 sm:p-8"><p className="font-mono text-xs text-muted-foreground">Repayment tenure</p><p className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Up to 15 years</p><p className="mt-3 text-xs leading-5 text-muted-foreground">Available tenure varies by product and borrower eligibility.</p></div>
            <div className="flex flex-col justify-center bg-background p-6 sm:p-8"><p className="font-mono text-xs text-muted-foreground">Loan purposes</p><div className="mt-4 flex flex-col gap-4">{loanUses.map(({title,description,icon:Icon})=><div key={title} className="flex items-start gap-3"><Icon className="mt-0.5 shrink-0 text-muted-foreground" size={17}/><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></div>)}</div></div>
          </div>
        </div>
        <p className="mt-4 text-[10px] leading-5 text-muted-foreground">Indicative information based on publicly available India Shelter home-loan product details. Interest rates and final loan terms vary by eligibility; confirm current terms directly with India Shelter Finance.</p>
      </div>
    </section>
  )
}
