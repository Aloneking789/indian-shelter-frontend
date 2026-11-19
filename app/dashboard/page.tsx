"use client"

import dynamic from "next/dynamic"

const TemplatePortal = dynamic(
  () => import("@/components/template-portal").then((mod) => mod.TemplatePortal),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-7 animate-spin rounded-full border-2 border-[#205c3c] border-t-transparent" />
          <p className="text-xs font-medium text-[#657164]">Connecting to India Shelter Workspace...</p>
        </div>
      </div>
    ),
  }
)

export default function DashboardPage() {
  return <TemplatePortal />
}
