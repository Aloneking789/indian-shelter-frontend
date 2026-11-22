"use client"

import { useState } from "react"
import { SiteHeader } from "./landing/site-header"
import { QuickApplyModal } from "./landing/quick-apply-modal"
import { HeroLoan } from "./landing/hero-loan"
import { StatsBanner } from "./landing/stats-banner"
import { LoanProductsSection } from "./landing/loan-products-section"
import { InteractiveCalculator } from "./landing/interactive-calculator"
import { LoanJourneySection } from "./landing/loan-journey-section"
import { UnderwritingEdge } from "./landing/underwriting-edge"
import { InternalPortalBanner } from "./landing/internal-portal-banner"
import { MeetOurTeamSection } from "./landing/meet-our-team-section"
import { FaqSection } from "./landing/faq-section"
import { SiteFooter } from "./landing/site-footer"

export function PortalHome() {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("Home Loan")
  
  // Coordinated calculator state for product simulation
  const [calcAmount, setCalcAmount] = useState(2000000)
  const [calcTenure, setCalcTenure] = useState(15)
  const [calcRate, setCalcRate] = useState(9.75)

  const handleOpenApply = (productTitle?: string) => {
    if (productTitle) setSelectedProduct(productTitle)
    setIsApplyModalOpen(true)
  }

  const handleSelectProductForCalculator = (amount: number, tenure: number, rate: number) => {
    setCalcAmount(amount)
    setCalcTenure(tenure)
    setCalcRate(rate)
    
    // Smooth scroll down to the calculator section
    const calcElement = document.getElementById("calculator")
    if (calcElement) {
      calcElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#1c2a1f] antialiased">
      {/* 1. Header with Brand Identity, Phone Helpline & Employee Workspace Portal */}
      <SiteHeader onOpenApply={() => handleOpenApply()} />

      <main>
        {/* 2. Hero Section with Live Mini-Estimator & Value Props */}
        <HeroLoan onOpenApply={() => handleOpenApply()} />

        {/* 3. Proof of Scale: 5 Credibility Metric Cards */}
        <StatsBanner />

        {/* 4. Core Loan Offerings: Home Loan, LAP, Renovation, PMAY */}
        <LoanProductsSection 
          onOpenApply={handleOpenApply}
          onSelectProductForCalculator={handleSelectProductForCalculator}
        />

        {/* 5. Complete Interactive EMI & Eligibility Calculator Suite */}
        <InteractiveCalculator 
          onOpenApply={handleOpenApply}
          externalAmount={calcAmount}
          externalTenure={calcTenure}
          externalRate={calcRate}
        />

        {/* 6. The 4-Step Doorstep to Disbursement Journey */}
        <LoanJourneySection onOpenApply={() => handleOpenApply()} />

        {/* 7. Underwriting Edge: Bank vs India Shelter Comparison */}
        <UnderwritingEdge />

        {/* 8. Dedicated Employee Workspace & Internal Operations Portal Banner */}
        <InternalPortalBanner />

        {/* 8.5 Meet Our Team: Leadership & Operations Driving India Shelter */}
        <MeetOurTeamSection />

        {/* 9. Frequently Asked Questions (Accordion) */}
        <FaqSection />
      </main>

      {/* 10. Comprehensive Regulatory & Governance Footer */}
      <SiteFooter />

      {/* Quick Application Modal Dialog */}
      <QuickApplyModal 
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        initialLoanType={selectedProduct}
        initialAmount={calcAmount}
      />
    </div>
  )
}
