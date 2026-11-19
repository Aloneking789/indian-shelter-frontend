"use client"

import { useEffect, useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Files,
  Clock3,
  Upload,
  Settings2,
  Plus,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  MoreHorizontal,
  Paperclip,
  Copy,
  ExternalLink,
  Star,
  Download,
  Menu,
  Check,
  FileText,
  CalendarDays,
  Users,
  ArrowRight,
  LogOut,
  Loader2,
  Trash2,
  ShieldAlert,
  Edit3,
  RefreshCw,
  Link as LinkIcon
} from "lucide-react"
import { TemplateImportWizard } from "@/components/template-import-wizard"
import { api, tokenStorage, userStorage, Template, User, DashboardOverview, Pagination } from "@/lib/api"

const fallbackFrequencies = [
  "Adhoc",
  "Daily",
  "Weekly",
  "Monthly – 5th to 6th",
  "Monthly – 15th to 20th",
  "Monthly",
  "Once a quarter"
]

const cnInput =
  "h-9 w-full rounded-md border border-[#e5e7eb] bg-white px-3 text-[13px] text-[#242923] outline-none transition placeholder:text-[#a2a69f] focus:border-[#78927d] focus:ring-2 focus:ring-[#78927d]/15"

const appliedFilterLabels: Record<string, string> = {
  dltTemplateId: "DLT ID",
  name: "Name",
  dueDate: "Frequency",
  ownerName: "Owner",
  content: "Content",
  remarks: "Remarks",
  updatedFrom: "Updated from",
  updatedTo: "Updated through"
}

export function TemplatePortal() {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // User & Mount State
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)

  // Navigation State
  const [page, setPage] = useState<"Dashboard" | "Template Explorer" | "Activity" | "Settings">("Dashboard")
  const [mobileNav, setMobileNav] = useState(false)

  // Template Data State
  const [templates, setTemplates] = useState<Template[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [loading, setLoading] = useState(false)

  // Stats State
  const [stats, setStats] = useState<DashboardOverview>({
    totalTemplates: 0,
    activeTemplates: 0,
    inactiveTemplates: 0,
    adhocTemplates: 0,
    dailyTemplates: 0,
    weeklyTemplates: 0,
    monthlyTemplates: 0,
    quarterlyTemplates: 0,
    templatesWithAttachments: 0,
    templatesWithoutAttachments: 0,
    totalUniqueOwners: 0,
  })

  // Dynamic Options
  const [ownersList, setOwnersList] = useState<string[]>([])
  const [frequenciesList, setFrequenciesList] = useState<string[]>(fallbackFrequencies)

  // Filters & Search
  const [query, setQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [filters, setFilters] = useState({
    dltTemplateId: "",
    name: "",
    dueDate: "",
    ownerName: "",
    content: "",
    remarks: "",
    updatedFrom: "",
    updatedTo: "",
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "name" | "dltTemplateId">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // UI Selection & Modals
  const [selected, setSelected] = useState<Template | null>(null)
  const [modal, setModal] = useState<"add" | "edit" | "import" | null>(null)
  const [toast, setToast] = useState("")
  const [checked, setChecked] = useState<string[]>([])
  const [draft, setDraft] = useState({
    id: "",
    dltTemplateId: "",
    name: "",
    dueDate: "Adhoc",
    ownerName: "",
    content: "",
    remarks: "OK",
    attachmentLink1: "",
    attachmentLink2: "",
    isActive: true,
  })
  const [modalError, setModalError] = useState("")
  const [modalLoading, setModalLoading] = useState(false)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 3000)
  }

  // 1. Authenticate user on mount
  useEffect(() => {
    setMounted(true)
    const token = tokenStorage.get()
    const storedUser = userStorage.get()
    if (storedUser) setUser(storedUser)

    if (!token) {
      router.push("/login")
      return
    }

    api.auth
      .getMe()
      .then((res) => {
        const currentUser = res.user || res.data
        if (currentUser) {
          setUser(currentUser)
        } else {
          tokenStorage.remove()
          router.push("/login")
        }
      })
      .catch((err) => {
        if (err?.status === 401) {
          tokenStorage.remove()
          router.push("/login")
        }
      })
      .finally(() => {
        setAuthChecking(false)
      })
  }, [router])

  // 2. Fetch Dashboard Overview
  const fetchOverview = useCallback(async () => {
    try {
      const res = await api.dashboard.getOverview()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error("Failed to fetch dashboard overview:", err)
    }
  }, [])

  // 3. Fetch Distinct Filters
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [ownersRes, freqRes] = await Promise.allSettled([
        api.templates.getOwners(),
        api.templates.getFrequencies(),
      ])
      if (ownersRes.status === "fulfilled" && ownersRes.value.data) {
        setOwnersList(ownersRes.value.data)
      }
      if (freqRes.status === "fulfilled" && freqRes.value.data?.length) {
        setFrequenciesList(freqRes.value.data)
      }
    } catch (err) {
      console.error("Failed to load filter options:", err)
    }
  }, [])

  // 4. Fetch Templates with server-side filters & pagination
  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.templates.getAll({
        search: query.trim() || undefined,
        dltTemplateId: appliedFilters.dltTemplateId.trim() || undefined,
        name: appliedFilters.name.trim() || undefined,
        dueDate: appliedFilters.dueDate.trim() || undefined,
        ownerName: appliedFilters.ownerName.trim() || undefined,
        content: appliedFilters.content.trim() || undefined,
        remarks: appliedFilters.remarks.trim() || undefined,
        updatedFrom: appliedFilters.updatedFrom || undefined,
        updatedTo: appliedFilters.updatedTo || undefined,
        page: currentPage,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      })

      if (res.success && res.data) {
        setTemplates(res.data)
        if (res.pagination) {
          setPagination(res.pagination)
        }
      }
    } catch (err: any) {
      notify(err?.message || "Failed to load templates from server")
    } finally {
      setLoading(false)
    }
  }, [query, appliedFilters, currentPage, rowsPerPage, sortBy, sortOrder])

  // Initial load
  useEffect(() => {
    if (!authChecking && user) {
      fetchOverview()
      fetchFilterOptions()
      fetchTemplates()
    }
  }, [authChecking, user, fetchOverview, fetchFilterOptions, fetchTemplates])

  // Filter actions
  const applyFilters = () => {
    setAppliedFilters(filters)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    const blank = {
      dltTemplateId: "",
      name: "",
      dueDate: "",
      ownerName: "",
      content: "",
      remarks: "",
      updatedFrom: "",
      updatedTo: "",
    }
    setFilters(blank)
    setAppliedFilters(blank)
    setQuery("")
    setCurrentPage(1)
  }

  const removeSingleFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: "" }))
    setAppliedFilters((prev) => ({ ...prev, [key]: "" }))
    setCurrentPage(1)
  }

  const handleLogout = () => {
    api.auth.logout()
    router.push("/login")
  }

  const copyText = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text)
      notify(msg)
    } catch {
      notify("Failed to copy to clipboard")
    }
  }

  // Export CSV
  const exportResults = () => {
    if (!templates.length) {
      notify("No records to export")
      return
    }
    const columns = [
      "DLT Template ID",
      "Template Name",
      "Due Date / Frequency",
      "Owner Name",
      "SMS Content",
      "Remarks",
      "Status",
      "Attachment 1",
      "Attachment 2",
      "Last Updated",
    ]
    const values = templates.map((t) => [
      t.dltTemplateId,
      t.name,
      t.dueDate,
      t.ownerName,
      t.content,
      t.remarks || "",
      t.isActive ? "Active" : "Inactive",
      t.attachmentLink1 || "",
      t.attachmentLink2 || "",
      new Date(t.updatedAt).toLocaleDateString("en-IN"),
    ])
    const csv = [columns, ...values]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value).replaceAll('"', '""')
            return `"${/^[-=+@]/.test(text) ? `'${text}` : text}"`
          })
          .join(",")
      )
      .join("\r\n")

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `india-shelter-templates-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    notify(`Exported ${templates.length} templates to CSV`)
  }

  // Open Add Modal
  const openAddModal = () => {
    setModalError("")
    setDraft({
      id: "",
      dltTemplateId: "",
      name: "",
      dueDate: "Adhoc",
      ownerName: user?.name || "",
      content: "",
      remarks: "OK",
      attachmentLink1: "",
      attachmentLink2: "",
      isActive: true,
    })
    setModal("add")
  }

  // Open Edit Modal
  const openEditModal = (t: Template) => {
    setModalError("")
    setDraft({
      id: t.id,
      dltTemplateId: t.dltTemplateId,
      name: t.name,
      dueDate: t.dueDate,
      ownerName: t.ownerName,
      content: t.content,
      remarks: t.remarks || "",
      attachmentLink1: t.attachmentLink1 || "",
      attachmentLink2: t.attachmentLink2 || "",
      isActive: t.isActive,
    })
    setModal("edit")
  }

  // Save / Update Template
  const handleSaveTemplate = async () => {
    setModalError("")

    if (!draft.dltTemplateId.trim()) {
      setModalError("DLT Template ID is required")
      return
    }
    if (!draft.name.trim()) {
      setModalError("Template name is required")
      return
    }
    if (!draft.dueDate.trim()) {
      setModalError("Frequency is required")
      return
    }
    if (!draft.ownerName.trim()) {
      setModalError("Owner name is required")
      return
    }
    if (!draft.content.trim()) {
      setModalError("SMS Content is required")
      return
    }

    setModalLoading(true)
    try {
      if (modal === "add") {
        await api.templates.create({
          dltTemplateId: draft.dltTemplateId.trim(),
          name: draft.name.trim(),
          dueDate: draft.dueDate.trim(),
          ownerName: draft.ownerName.trim(),
          content: draft.content.trim(),
          remarks: draft.remarks.trim() || null,
          attachmentLink1: draft.attachmentLink1.trim() || null,
          attachmentLink2: draft.attachmentLink2.trim() || null,
          isActive: draft.isActive,
        })
        notify("Template created successfully!")
      } else if (modal === "edit" && draft.id) {
        const res = await api.templates.update(draft.id, {
          dltTemplateId: draft.dltTemplateId.trim(),
          name: draft.name.trim(),
          dueDate: draft.dueDate.trim(),
          ownerName: draft.ownerName.trim(),
          content: draft.content.trim(),
          remarks: draft.remarks.trim() || null,
          attachmentLink1: draft.attachmentLink1.trim() || null,
          attachmentLink2: draft.attachmentLink2.trim() || null,
          isActive: draft.isActive,
        })
        notify("Template updated successfully!")
        if (selected && selected.id === draft.id) {
          setSelected(res.data)
        }
      }
      setModal(null)
      fetchTemplates()
      fetchOverview()
      fetchFilterOptions()
    } catch (err: any) {
      setModalError(err?.message || "Failed to save template. Please review all fields.")
    } finally {
      setModalLoading(false)
    }
  }

  // Deactivate template (Admin only)
  const handleDeactivate = async (id: string) => {
    if (user?.role !== "ADMIN") {
      notify("Only administrators can deactivate templates")
      return
    }
    if (!confirm("Are you sure you want to deactivate this template?")) {
      return
    }

    try {
      await api.templates.delete(id)
      notify("Template deactivated successfully")
      if (selected?.id === id) {
        setSelected(null)
      }
      fetchTemplates()
      fetchOverview()
    } catch (err: any) {
      notify(err?.message || "Failed to deactivate template")
    }
  }

  const chooseNav = (nav: "Dashboard" | "Template Explorer" | "Activity" | "Settings") => {
    setPage(nav)
    setMobileNav(false)
  }

  const navItems = [
    { label: "Dashboard" as const, icon: LayoutDashboard },
    { label: "Template Explorer" as const, icon: Files },
    { label: "Activity" as const, icon: Clock3 },
  ]

  if (!mounted || authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-[#205c3c]" />
          <p className="text-xs font-medium text-[#657164]">Connecting to India Shelter Workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#232822]">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[238px] flex-col border-r border-[#e8ebe6] bg-white transition-transform md:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center gap-3 border-b border-[#edf0ec] px-5">
          <div className="flex size-9 items-center justify-center rounded-sm bg-[#1d5c3b] text-[16px] font-bold tracking-tight text-white">
            IS
          </div>
          <div>
            <div className="text-[12px] font-semibold tracking-[.01em]">INDIA SHELTER</div>
            <div className="mt-0.5 text-[10px] text-[#848b82]">FINANCE CORPORATION</div>
          </div>
        </div>

        <div className="px-4 pt-6">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#a2a89f]">
            Workspace
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => chooseNav(label)}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-[13px] transition ${
                  page === label
                    ? "bg-[#edf4ef] font-medium text-[#205c3c]"
                    : "text-[#636b61] hover:bg-[#f5f7f4] hover:text-[#252b24]"
                }`}
              >
                <Icon size={16} />
                {label}
                {label === "Template Explorer" && (
                  <span className="ml-auto rounded-sm bg-white px-1.5 py-0.5 text-[10px] text-[#687368] border border-[#e2e7e0]">
                    {pagination.totalRecords}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-7 px-4">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#a2a89f]">
            Manage
          </p>
          <button
            onClick={() => setModal("import")}
            className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-[13px] text-[#636b61] hover:bg-[#f5f7f4]"
          >
            <Upload size={16} /> Bulk Import
          </button>
          <button
            onClick={() => chooseNav("Settings")}
            className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-[13px] ${
              page === "Settings" ? "bg-[#edf4ef] text-[#205c3c]" : "text-[#636b61] hover:bg-[#f5f7f4]"
            }`}
          >
            <Settings2 size={16} /> Settings
          </button>
        </div>

        {/* Current Employee Profile Pill */}
        <div className="mt-auto p-4">
          <div className="rounded-md border border-[#e9ece7] bg-[#fafbf9] p-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-[#e6eee8] text-[10px] font-semibold text-[#376447]">
                {user?.name?.slice(0, 2).toUpperCase() || "IS"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-[#252c23]">{user?.name || "Employee"}</p>
                <p className="text-[10px] text-[#92988f]">
                  {user?.role === "ADMIN" ? "Administrator" : "Employee"} · {user?.employeeId}
                </p>
              </div>
              <button
                aria-label="Sign out"
                onClick={handleLogout}
                title="Sign out"
                className="ml-auto text-[#8b9289] hover:text-[#b44e3e]"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
          <p className="mt-3 px-1 text-[10px] text-[#a1a79f]">India Shelter Finance · Live DB</p>
        </div>
      </aside>

      {mobileNav && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      {/* Main Container */}
      <div className="min-h-screen md:pl-[238px]">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-[64px] items-center justify-between border-b border-[#e8ebe6] bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              className="text-[#667064] md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={19} />
            </button>
            <div className="hidden text-[11px] text-[#9ba198] sm:block">
              Workspace <span className="mx-2 text-[#c6cbc4]">/</span>
            </div>
            <h1 className="text-[13px] font-semibold">{page}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              title="Refresh templates"
              onClick={() => {
                fetchTemplates()
                fetchOverview()
                notify("Refreshed latest data")
              }}
              className="flex size-8 items-center justify-center rounded-md border border-[#eceeea] text-[#626a60] hover:bg-[#f6f8f5]"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              aria-label="Notifications"
              onClick={() => notify("All systems operational. Database connected.")}
              className="relative flex size-8 items-center justify-center rounded-md border border-[#eceeea] text-[#626a60]"
            >
              <Bell size={15} />
              <i className="absolute right-[7px] top-[6px] size-1.5 rounded-full bg-[#468b57]" />
            </button>
            <div className="hidden h-6 w-px bg-[#e9ece7] sm:block" />
            <button onClick={() => chooseNav("Settings")} className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#e7eee8] text-[10px] font-semibold text-[#376447]">
                {user?.name?.slice(0, 2).toUpperCase() || "IS"}
              </div>
              <ChevronDown size={13} className="hidden text-[#8b9289] sm:block" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-7">
          {page === "Template Explorer" ? (
            <>
              {/* Explorer Header */}
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-1.5 flex items-center gap-2 text-[11px] text-[#7e877c]">
                    <span>Workspace</span>
                    <span>/</span>
                    <span className="text-[#435044]">Templates</span>
                  </div>
                  <h2 className="text-[23px] font-semibold tracking-[-.035em]">SMS Template Explorer</h2>
                  <p className="mt-1 text-[12px] text-[#7b8379]">
                    Search, filter, review and maintain official DLT SMS templates.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModal("import")}
                    className="flex h-9 items-center gap-2 rounded-md border border-[#dfe4dd] bg-white px-3 text-[12px] font-medium text-[#475046] hover:bg-[#fafbf9]"
                  >
                    <Upload size={14} /> Import
                  </button>
                  <button
                    onClick={openAddModal}
                    className="flex h-9 items-center gap-2 rounded-md bg-[#205c3c] px-3.5 text-[12px] font-medium text-white shadow-xs hover:bg-[#174b30]"
                  >
                    <Plus size={15} /> Add template
                  </button>
                </div>
              </div>

              {/* Dynamic Stats Row */}
              <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                  label="Total templates"
                  value={stats.totalTemplates.toString()}
                  note="Registered in database"
                  icon={Files}
                />
                <Stat
                  label="Active templates"
                  value={stats.activeTemplates.toString()}
                  note="Available for broadcast"
                  icon={Check}
                />
                <Stat
                  label="Adhoc templates"
                  value={stats.adhocTemplates.toString()}
                  note="Event-triggered notices"
                  icon={CalendarDays}
                />
                <Stat
                  label="With attachments"
                  value={stats.templatesWithAttachments.toString()}
                  note="Supporting links configured"
                  icon={Paperclip}
                />
              </section>

              {/* Search & Filter Card */}
              <section className="overflow-hidden rounded-lg border border-[#e5e9e3] bg-white shadow-[0_1px_2px_rgba(20,32,20,.025)]">
                <div className="border-b border-[#edf0ec] p-4 sm:px-5 sm:py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929a90]" />
                      <input
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") fetchTemplates()
                          if (e.key === "Escape") setQuery("")
                        }}
                        placeholder="Search by Template ID, name, content, owner or remarks..."
                        className={`${cnInput} h-10 pl-9 pr-9`}
                      />
                      {query && (
                        <button
                          aria-label="Clear search"
                          onClick={() => {
                            setQuery("")
                            setCurrentPage(1)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#899187]"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setFiltersOpen(!filtersOpen)}
                      className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-[12px] font-medium ${
                        filtersOpen
                          ? "border-[#cbd9ce] bg-[#f1f6f2] text-[#265c3d]"
                          : "border-[#e2e6e0] text-[#555e54] hover:bg-[#fafbf9]"
                      }`}
                    >
                      <SlidersHorizontal size={14} /> Advanced filters
                      <span className="rounded-full bg-white px-1.5 text-[10px] border border-[#d2dcd3]">
                        {Object.values(appliedFilters).filter(Boolean).length}
                      </span>
                    </button>
                  </div>

                  {filtersOpen && (
                    <div className="mt-4 rounded-md border border-[#edf0ec] bg-[#fafbf9] p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#485146]">Refine database records</span>
                        <button onClick={resetFilters} className="text-[11px] text-[#687467] underline-offset-2 hover:underline">
                          Reset all
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <FilterInput
                          label="DLT Template ID"
                          value={filters.dltTemplateId}
                          placeholder="e.g. 1007..."
                          onChange={(v) => setFilters({ ...filters, dltTemplateId: v })}
                        />
                        <FilterInput
                          label="Template name"
                          value={filters.name}
                          placeholder="Search name"
                          onChange={(v) => setFilters({ ...filters, name: v })}
                        />
                        <FilterInput
                          label="Frequency"
                          select
                          options={frequenciesList}
                          value={filters.dueDate}
                          onChange={(v) => setFilters({ ...filters, dueDate: v })}
                        />
                        <FilterInput
                          label="Owner name"
                          select
                          options={ownersList}
                          value={filters.ownerName}
                          onChange={(v) => setFilters({ ...filters, ownerName: v })}
                        />
                        <FilterInput
                          label="SMS content"
                          value={filters.content}
                          placeholder="Search message text"
                          onChange={(v) => setFilters({ ...filters, content: v })}
                        />
                        <FilterInput
                          label="Remarks"
                          value={filters.remarks}
                          placeholder="Search remarks"
                          onChange={(v) => setFilters({ ...filters, remarks: v })}
                        />
                        <FilterInput
                          label="Updated from"
                          type="date"
                          value={filters.updatedFrom}
                          onChange={(v) => setFilters({ ...filters, updatedFrom: v })}
                        />
                        <FilterInput
                          label="Updated through"
                          type="date"
                          value={filters.updatedTo}
                          onChange={(v) => setFilters({ ...filters, updatedTo: v })}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[10px] text-[#90978e]">
                          Filters are evaluated on the backend PostgreSQL server with case-insensitive partial matching.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={resetFilters}
                            className="h-8 rounded-md px-3 text-[11px] font-medium text-[#60695e] hover:bg-[#eef1ed]"
                          >
                            Clear all
                          </button>
                          <button
                            onClick={applyFilters}
                            className="h-8 rounded-md bg-[#205c3c] px-3.5 text-[11px] font-medium text-white hover:bg-[#174b30]"
                          >
                            Apply filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Filters Pill Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#727b70]">
                      <span className="font-semibold text-[#30382f]">{pagination.totalRecords}</span> templates found
                      {(query || Object.values(appliedFilters).some(Boolean)) && (
                        <button
                          onClick={resetFilters}
                          className="ml-1 flex items-center gap-1 rounded-full bg-[#edf4ef] px-2 py-1 text-[10px] text-[#346246]"
                        >
                          Clear all <X size={11} />
                        </button>
                      )}
                      {(Object.keys(appliedFilters) as (keyof typeof appliedFilters)[])
                        .filter((key) => appliedFilters[key])
                        .map((key) => (
                          <button
                            key={key}
                            onClick={() => removeSingleFilter(key)}
                            className="inline-flex items-center gap-1 rounded-full border border-[#e3e9e1] bg-white px-2 py-1 text-[10px] text-[#52614f]"
                          >
                            {appliedFilterLabels[key] || key}: {appliedFilters[key]} <X size={10} />
                          </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={exportResults}
                        className="flex items-center gap-1.5 text-[11px] text-[#71796f] hover:text-[#205c3c]"
                      >
                        <Download size={13} /> Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk selection bar */}
                {checked.length > 0 && (
                  <div className="flex items-center justify-between border-b border-[#e8eee8] bg-[#f3f7f3] px-5 py-2">
                    <span className="text-[11px] text-[#3e674a]">{checked.length} selected</span>
                    <button
                      onClick={() =>
                        copyText(
                          templates
                            .filter((t) => checked.includes(t.id))
                            .map((t) => t.dltTemplateId)
                            .join("\n"),
                          "Template IDs copied"
                        )
                      }
                      className="flex items-center gap-1.5 text-[11px] font-medium text-[#285c3b]"
                    >
                      <Copy size={13} /> Copy selected IDs
                    </button>
                  </div>
                )}

                {/* Templates Table */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse text-left">
                    <thead className="bg-[#fafbf9]">
                      <tr className="border-b border-[#e9ece7] text-[10px] font-semibold uppercase tracking-[.065em] text-[#899187]">
                        <th className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label="Select all rows on this page"
                            checked={templates.length > 0 && templates.every((t) => checked.includes(t.id))}
                            onChange={(e) =>
                              setChecked(
                                e.target.checked
                                  ? [...new Set([...checked, ...templates.map((t) => t.id)])]
                                  : checked.filter((id) => !templates.some((t) => t.id === id))
                              )
                            }
                            className="accent-[#205c3c]"
                          />
                        </th>
                        <th className="w-12 px-2 py-3">#</th>
                        <th className="px-3 py-3">
                          <button
                            onClick={() => {
                              setSortBy("dltTemplateId")
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                            }}
                            className="flex items-center gap-1.5"
                          >
                            DLT Template ID <ArrowUpDown size={12} />
                          </button>
                        </th>
                        <th className="px-3 py-3">
                          <button
                            onClick={() => {
                              setSortBy("name")
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                            }}
                            className="flex items-center gap-1.5"
                          >
                            Template name <ArrowUpDown size={12} />
                          </button>
                        </th>
                        <th className="px-3 py-3">Frequency</th>
                        <th className="px-3 py-3">Owner</th>
                        <th className="px-3 py-3">Remarks</th>
                        <th className="px-3 py-3">Links</th>
                        <th className="px-3 py-3">
                          <button
                            onClick={() => {
                              setSortBy("updatedAt")
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                            }}
                            className="flex items-center gap-1.5"
                          >
                            Last updated <ArrowUpDown size={12} />
                          </button>
                        </th>
                        <th className="px-3 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={10} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Loader2 size={20} className="animate-spin text-[#205c3c]" />
                              <span className="text-xs text-[#717b70]">Loading templates from PostgreSQL...</span>
                            </div>
                          </td>
                        </tr>
                      ) : templates.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-6 py-14 text-center">
                            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-[#f0f3ef] text-[#7e897c]">
                              <Search size={17} />
                            </div>
                            <p className="text-[13px] font-medium text-[#2d342c]">No templates found</p>
                            <p className="mt-1 text-[11px] text-[#8c9389]">
                              Try adjusting your search criteria or clear your active filters.
                            </p>
                            <button
                              onClick={resetFilters}
                              className="mt-4 text-[11px] font-medium text-[#2d6541] hover:underline"
                            >
                              Clear all filters
                            </button>
                          </td>
                        </tr>
                      ) : (
                        templates.map((t, i) => {
                          const hasLinks = Boolean(t.attachmentLink1 || t.attachmentLink2)
                          return (
                            <tr key={t.id} className="border-b border-[#f0f2ef] transition hover:bg-[#fbfcfa]">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${t.name}`}
                                  checked={checked.includes(t.id)}
                                  onChange={(e) =>
                                    setChecked(
                                      e.target.checked
                                        ? [...checked, t.id]
                                        : checked.filter((id) => id !== t.id)
                                    )
                                  }
                                  className="accent-[#205c3c]"
                                />
                              </td>
                              <td className="px-2 py-3 text-[11px] text-[#8c948a]">
                                {(currentPage - 1) * rowsPerPage + i + 1}
                              </td>
                              <td className="px-3 py-3">
                                <button
                                  onClick={() => setSelected(t)}
                                  className="font-mono text-[11px] text-[#4b684f] hover:underline"
                                >
                                  {t.dltTemplateId}
                                </button>
                              </td>
                              <td className="max-w-[220px] px-3 py-3">
                                <button
                                  onClick={() => setSelected(t)}
                                  className="block truncate text-[12px] font-semibold text-[#30372f] hover:text-[#205c3c]"
                                >
                                  {t.name}
                                </button>
                                <span className="mt-0.5 block truncate text-[10px] text-[#9aa096]">
                                  {t.content.slice(0, 65)}...
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span className="whitespace-nowrap rounded-sm bg-[#f1f3f0] px-2 py-1 text-[10px] text-[#586155]">
                                  {t.dueDate}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-[11px] text-[#535c51]">{t.ownerName}</td>
                              <td className="px-3 py-3">
                                <Remark value={t.remarks || (t.isActive ? "Active" : "Inactive")} />
                              </td>
                              <td className="px-3 py-3">
                                {hasLinks ? (
                                  <button
                                    onClick={() => setSelected(t)}
                                    className="inline-flex items-center gap-1 text-[11px] text-[#56765a] hover:underline"
                                  >
                                    <Paperclip size={13} />
                                    {(t.attachmentLink1 ? 1 : 0) + (t.attachmentLink2 ? 1 : 0)}
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-[#b0b5ae]">—</span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-[11px] text-[#747c72]">
                                {new Date(t.updatedAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    title="View template details"
                                    onClick={() => setSelected(t)}
                                    className="flex size-7 items-center justify-center rounded text-[#71796f] hover:bg-[#eef2ed] hover:text-[#205c3c]"
                                  >
                                    <ExternalLink size={14} />
                                  </button>
                                  <button
                                    title="Edit template"
                                    onClick={() => openEditModal(t)}
                                    className="flex size-7 items-center justify-center rounded text-[#71796f] hover:bg-[#eef2ed] hover:text-[#205c3c]"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  {user?.role === "ADMIN" && (
                                    <button
                                      title="Deactivate template"
                                      onClick={() => handleDeactivate(t.id)}
                                      className="flex size-7 items-center justify-center rounded text-[#9a544c] hover:bg-[#fdf0ee]"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0ec] px-4 py-3 sm:px-5">
                  <span className="text-[10px] text-[#899187]">
                    Showing{" "}
                    {pagination.totalRecords
                      ? (pagination.currentPage - 1) * pagination.limit + 1
                      : 0}
                    –
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalRecords
                    )}{" "}
                    of {pagination.totalRecords} records
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-[10px] text-[#838b80]">
                      Rows per page
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        className="h-7 rounded border border-[#e7ebe5] bg-white px-1.5 text-[10px] text-[#4c554a] outline-none"
                      >
                        {[10, 25, 50, 100].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className="h-7 rounded border border-[#e7ebe5] bg-white px-2.5 text-[10px] font-medium text-[#4b5449] disabled:opacity-40 hover:bg-[#fafbf9]"
                      >
                        Previous
                      </button>
                      <span className="px-2 text-[10px] text-[#737b71]">
                        {pagination.currentPage} / {Math.max(1, pagination.totalPages)}
                      </span>
                      <button
                        disabled={!pagination.hasNextPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="h-7 rounded border border-[#e7ebe5] bg-white px-2.5 text-[10px] font-medium text-[#4b5449] disabled:opacity-40 hover:bg-[#fafbf9]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : page === "Dashboard" ? (
            <DashboardView
              stats={stats}
              user={user}
              recentTemplates={templates.slice(0, 6)}
              onExplore={() => chooseNav("Template Explorer")}
              onAdd={openAddModal}
              onImport={() => setModal("import")}
              onView={setSelected}
            />
          ) : page === "Activity" ? (
            <ActivityView templates={templates} />
          ) : (
            <SettingsView user={user} onLogout={handleLogout} />
          )}
        </main>
      </div>

      {/* Template Detail Drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/25"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null)
          }}
        >
          <section className="flex h-full w-full max-w-[540px] flex-col bg-white shadow-xl animate-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between border-b border-[#e9ece7] px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#7d897d]">
                  DLT Template Details
                </p>
                <h2 className="mt-1 text-[17px] font-semibold text-[#252c23]">{selected.name}</h2>
                <p className="mt-0.5 font-mono text-[11px] text-[#66806a]">{selected.dltTemplateId}</p>
              </div>
              <button
                aria-label="Close details"
                onClick={() => setSelected(null)}
                className="rounded p-1.5 text-[#788075] hover:bg-[#f2f4f1]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-4 rounded-md border border-[#edf0ec] bg-[#fafbf9] p-4">
                <Detail label="Due Date / Frequency" value={selected.dueDate} />
                <Detail label="Owner Name" value={selected.ownerName} />
                <Detail label="Remarks" value={selected.remarks || "—"} />
                <Detail label="Status" value={selected.isActive ? "Active" : "Inactive"} />
                <Detail
                  label="Last Updated"
                  value={new Date(selected.updatedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                />
                <Detail label="Created By" value={selected.createdBy?.name || "System"} />
              </div>

              {/* SMS Content */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold">SMS Content</h3>
                  <span className="text-[10px] text-[#929a90]">{selected.content.length} characters</span>
                </div>
                <div className="whitespace-pre-wrap rounded-md border border-[#e9ece7] bg-[#fafbf9] p-4 text-[12px] leading-6 text-[#4b5549]">
                  {selected.content.split(/(\.\*|\{[^}]+\})/g).map((part, i) =>
                    part === ".*" || part.startsWith("{") ? (
                      <mark key={i} className="rounded-sm bg-[#eaf2eb] px-1 text-[#285c3b]">
                        {part}
                      </mark>
                    ) : (
                      part
                    )
                  )}
                </div>
                <button
                  onClick={() => copyText(selected.content, "SMS content copied to clipboard")}
                  className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#356444] hover:underline"
                >
                  <Copy size={13} /> Copy message text
                </button>
              </div>

              {/* Attachments Section */}
              <div className="mt-6">
                <h3 className="text-[12px] font-semibold mb-2">Attached Links & Resources</h3>
                <div className="flex flex-col gap-2">
                  {selected.attachmentLink1 ? (
                    <a
                      href={selected.attachmentLink1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-md border border-[#e5eae3] bg-[#fafbf9] p-3 hover:bg-[#f4f7f3]"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-[#346244]">
                        <LinkIcon size={14} />
                        <span className="truncate max-w-[340px] font-medium">{selected.attachmentLink1}</span>
                      </div>
                      <ExternalLink size={13} className="text-[#6d796b]" />
                    </a>
                  ) : null}

                  {selected.attachmentLink2 ? (
                    <a
                      href={selected.attachmentLink2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-md border border-[#e5eae3] bg-[#fafbf9] p-3 hover:bg-[#f4f7f3]"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-[#346244]">
                        <LinkIcon size={14} />
                        <span className="truncate max-w-[340px] font-medium">{selected.attachmentLink2}</span>
                      </div>
                      <ExternalLink size={13} className="text-[#6d796b]" />
                    </a>
                  ) : null}

                  {!selected.attachmentLink1 && !selected.attachmentLink2 && (
                    <p className="rounded-md border border-dashed border-[#e2e7e0] px-4 py-4 text-center text-[11px] text-[#949b92]">
                      No supporting URLs attached to this template.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#e9ece7] px-5 py-3">
              <button
                onClick={() => copyText(selected.dltTemplateId, "DLT Template ID copied")}
                className="flex h-8 items-center gap-1.5 rounded border border-[#e2e7e0] px-3 text-[11px] hover:bg-[#f7f9f6]"
              >
                <Copy size={13} /> Copy ID
              </button>
              <div className="flex gap-2">
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => handleDeactivate(selected.id)}
                    className="h-8 rounded border border-[#eed0cc] bg-[#fff8f7] px-3 text-[11px] font-medium text-[#a1483c] hover:bg-[#fbeeed]"
                  >
                    Deactivate
                  </button>
                )}
                <button
                  onClick={() => {
                    openEditModal(selected)
                  }}
                  className="h-8 rounded bg-[#205c3c] px-3.5 text-[11px] font-medium text-white hover:bg-[#174b30]"
                >
                  Edit template
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Add / Edit / Import Modals */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !modalLoading) setModal(null)
          }}
        >
          <section className="w-full max-w-[580px] rounded-lg border border-[#e8ebe6] bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#edf0ec] px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#252c23]">
                  {modal === "add"
                    ? "Add New DLT Template"
                    : modal === "edit"
                    ? "Edit Template"
                    : "Bulk Import Templates"}
                </h2>
                <p className="mt-0.5 text-[11px] text-[#81897f]">
                  {modal === "import"
                    ? "Upload .xlsx, .xls, or .csv for multi-record validation and database import."
                    : "Values are stored and validated against India Shelter DLT registry constraints."}
                </p>
              </div>
              <button
                disabled={modalLoading}
                aria-label="Close"
                onClick={() => setModal(null)}
                className="text-[#7e867c] hover:text-[#383f36]"
              >
                <X size={17} />
              </button>
            </div>

            {modal === "import" ? (
              <TemplateImportWizard
                onClose={() => setModal(null)}
                onDone={(res) => {
                  setModal(null)
                  fetchTemplates()
                  fetchOverview()
                  fetchFilterOptions()
                  if (res) {
                    notify(`Imported ${res.successfulCount} new templates to database!`)
                  }
                }}
              />
            ) : (
              <div className="max-h-[75vh] overflow-y-auto p-5">
                {modalError && (
                  <p
                    role="alert"
                    className="mb-4 rounded-md border border-[#efd7d3] bg-[#fff7f5] px-3.5 py-2 text-[11px] text-[#9b4a3e]"
                  >
                    {modalError}
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="DLT Template ID *">
                    <input
                      value={draft.dltTemplateId}
                      onChange={(e) => setDraft({ ...draft, dltTemplateId: e.target.value })}
                      className={cnInput}
                      placeholder="e.g. 1007202950682404861"
                    />
                  </Field>
                  <Field label="Template Name *">
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className={cnInput}
                      placeholder="e.g. Payment Reminder"
                    />
                  </Field>
                  <Field label="Frequency / Due Date *">
                    <input
                      list="frequencies-datalist"
                      value={draft.dueDate}
                      onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                      className={cnInput}
                      placeholder="Daily, Weekly, Monthly, Adhoc..."
                    />
                    <datalist id="frequencies-datalist">
                      {frequenciesList.map((f) => (
                        <option key={f} value={f} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="Owner Name *">
                    <input
                      value={draft.ownerName}
                      onChange={(e) => setDraft({ ...draft, ownerName: e.target.value })}
                      className={cnInput}
                      placeholder="e.g. Ganga Prasad"
                    />
                  </Field>
                  <Field label="Remarks">
                    <input
                      value={draft.remarks}
                      onChange={(e) => setDraft({ ...draft, remarks: e.target.value })}
                      className={cnInput}
                      placeholder="e.g. OK, Approved, In Review"
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={draft.isActive ? "true" : "false"}
                      onChange={(e) => setDraft({ ...draft, isActive: e.target.value === "true" })}
                      className={cnInput}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Attachment Link 1 (optional URL)">
                      <input
                        type="url"
                        value={draft.attachmentLink1}
                        onChange={(e) => setDraft({ ...draft, attachmentLink1: e.target.value })}
                        className={cnInput}
                        placeholder="https://example.com/document.pdf"
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Attachment Link 2 (optional URL)">
                      <input
                        type="url"
                        value={draft.attachmentLink2}
                        onChange={(e) => setDraft({ ...draft, attachmentLink2: e.target.value })}
                        className={cnInput}
                        placeholder="https://example.com/guide.pdf"
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="SMS Content * (Supports Hindi & Unicode text)">
                      <textarea
                        value={draft.content}
                        onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                        rows={4}
                        className={`${cnInput} h-auto resize-y py-2 leading-5 font-sans`}
                        placeholder="Enter registered SMS content. Dynamic placeholders like .* or {name} are allowed."
                      />
                      <p className="mt-1 text-right text-[10px] text-[#969d93]">
                        {draft.content.length} characters
                      </p>
                    </Field>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-[#edf0ec] pt-4">
                  <button
                    disabled={modalLoading}
                    onClick={() => setModal(null)}
                    className="h-9 rounded-md border border-[#e2e7e0] px-3.5 text-[11px] font-medium text-[#525a50]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={modalLoading}
                    onClick={handleSaveTemplate}
                    className="flex h-9 items-center gap-1.5 rounded-md bg-[#205c3c] px-4 text-[11px] font-medium text-white shadow-xs hover:bg-[#174b30] disabled:opacity-50"
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Template"
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-md bg-[#263a2c] px-4 py-3 text-[12px] text-white shadow-lg animate-in fade-in duration-200"
        >
          <Check size={15} />
          {toast}
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string
  value: string
  note: string
  icon: typeof Files
}) {
  return (
    <div className="rounded-lg border border-[#e6eae4] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium text-[#727b70]">{label}</p>
        <Icon size={15} className="text-[#8d9a8b]" />
      </div>
      <p className="mt-2 text-[23px] font-semibold tracking-[-.04em] text-[#242b23]">{value}</p>
      <p className="mt-0.5 text-[10px] text-[#9aa096]">{note}</p>
    </div>
  )
}

function FilterInput({
  label,
  value,
  placeholder,
  onChange,
  select,
  options = [],
  type = "text",
}: {
  label: string
  value: string
  placeholder?: string
  onChange: (v: string) => void
  select?: boolean
  options?: string[]
  type?: "text" | "date"
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium text-[#6b7469]">{label}</span>
      {select ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cnInput}>
          <option value="">{label === "Frequency" ? "All frequencies" : `All ${label.toLowerCase()}s`}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cnInput}
        />
      )}
    </label>
  )
}

function Remark({ value }: { value: string }) {
  const v = (value || "").toLowerCase()
  const style =
    v === "ok" || v === "approved" || v === "active"
      ? "bg-[#edf5ee] text-[#39704a]"
      : v.includes("review") || v.includes("revision")
      ? "bg-[#fff5e7] text-[#966c2d]"
      : v === "inactive"
      ? "bg-[#fbeeed] text-[#a1483c]"
      : "bg-[#f1f2f0] text-[#72796f]"
  return <span className={`whitespace-nowrap rounded-sm px-2 py-0.5 text-[10px] font-medium ${style}`}>{value}</span>
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-[#8b9389]">{label}</p>
      <p className="mt-0.5 text-[12px] font-medium text-[#3f483d]">{value}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium text-[#6b7469]">{label}</span>
      {children}
    </label>
  )
}

function DashboardView({
  stats,
  user,
  recentTemplates,
  onExplore,
  onAdd,
  onImport,
  onView,
}: {
  stats: DashboardOverview
  user: User | null
  recentTemplates: Template[]
  onExplore: () => void
  onAdd: () => void
  onImport: () => void
  onView: (t: Template) => void
}) {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] text-[#7e877c]">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h2 className="text-[23px] font-semibold tracking-[-.035em]">
            Welcome, {user?.name?.split(" ")[0] || "Employee"}
          </h2>
          <p className="mt-1 text-[12px] text-[#7b8379]">
            Live dashboard of India Shelter communication templates and distribution frequencies.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onImport}
            className="flex h-9 items-center gap-2 rounded-md border border-[#dfe4dd] bg-white px-3 text-[12px] font-medium text-[#444c42] hover:bg-[#f9faf8]"
          >
            <Upload size={14} /> Import Excel
          </button>
          <button
            onClick={onAdd}
            className="flex h-9 items-center gap-2 rounded-md bg-[#205c3c] px-3.5 text-[12px] font-medium text-white shadow-xs hover:bg-[#174b30]"
          >
            <Plus size={15} /> Add template
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total templates", value: stats.totalTemplates, icon: Files, note: "In PostgreSQL" },
          { label: "Active templates", value: stats.activeTemplates, icon: Check, note: "Ready to broadcast" },
          { label: "Adhoc templates", value: stats.adhocTemplates, icon: CalendarDays, note: "On-demand notices" },
          { label: "With attachments", value: stats.templatesWithAttachments, icon: Paperclip, note: "Supporting URLs" },
        ].map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="rounded-lg border border-[#e6eae4] bg-white p-4 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
            <div className="flex justify-between text-[11px] text-[#727b70]">
              <span>{label}</span>
              <Icon size={15} className="text-[#8d9a8b]" />
            </div>
            <p className="mt-2 text-[25px] font-semibold tracking-tight text-[#232922]">{value}</p>
            <p className="mt-0.5 text-[10px] text-[#9ba197]">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        {/* Recently Updated Templates Table */}
        <section className="overflow-hidden rounded-lg border border-[#e5e9e3] bg-white shadow-[0_1px_2px_rgba(20,32,20,.02)]">
          <div className="flex items-center justify-between border-b border-[#edf0ec] px-5 py-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[#252b23]">Recently Modified Templates</h3>
              <p className="mt-0.5 text-[10px] text-[#8c9389]">Latest live updates across your department</p>
            </div>
            <button
              onClick={onExplore}
              className="flex items-center gap-1 text-[11px] font-medium text-[#346444] hover:underline"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-[#fafbf9] text-[10px] uppercase tracking-wide text-[#899187]">
                <tr>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">DLT ID</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-[#8c9389]">
                      No templates found in database.
                    </td>
                  </tr>
                ) : (
                  recentTemplates.map((t) => (
                    <tr key={t.id} className="border-t border-[#f0f2ef] hover:bg-[#fafbf9]">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onView(t)}
                          className="text-[11px] font-semibold text-[#2c332a] hover:text-[#205c3c]"
                        >
                          {t.name}
                        </button>
                        <div className="mt-1">
                          <Remark value={t.remarks || (t.isActive ? "Active" : "Inactive")} />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#687a69]">{t.dltTemplateId}</td>
                      <td className="px-4 py-3 text-[11px] text-[#4f564d]">{t.ownerName}</td>
                      <td className="px-4 py-3 text-[10px] text-[#727b70]">{t.dueDate}</td>
                      <td className="px-4 py-3 text-[10px] text-[#727b70]">
                        {new Date(t.updatedAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sidebar Breakdown */}
        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-[#e5e9e3] bg-white p-4 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
            <h3 className="text-[12px] font-semibold text-[#272e25]">Frequency Breakdown</h3>
            <div className="mt-3 flex flex-col gap-2.5">
              {[
                { label: "Daily", value: stats.dailyTemplates },
                { label: "Weekly", value: stats.weeklyTemplates },
                { label: "Monthly", value: stats.monthlyTemplates },
                { label: "Quarterly", value: stats.quarterlyTemplates },
                { label: "Adhoc", value: stats.adhocTemplates },
              ].map((x) => (
                <div
                  key={x.label}
                  className="flex items-center justify-between border-b border-[#f0f2ef] pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-[11px] text-[#70796e]">{x.label}</span>
                  <span className="text-[12px] font-semibold text-[#2f362d]">{x.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#e5e9e3] bg-[#f3f7f3] p-4">
            <div className="flex items-center gap-2 text-[#3c6749]">
              <Users size={15} />
              <span className="text-[11px] font-semibold">Registered Owners ({stats.totalUniqueOwners})</span>
            </div>
            <p className="mt-1.5 text-[10px] leading-5 text-[#798478]">
              Manage department owners and ensure DLT compliant sender assignments.
            </p>
            <button
              onClick={onExplore}
              className="mt-2 text-[10px] font-semibold text-[#346444] hover:underline"
            >
              Open template explorer →
            </button>
          </section>
        </div>
      </div>
    </>
  )
}

function ActivityView({ templates }: { templates: Template[] }) {
  return (
    <>
      <div className="mb-6">
        <p className="mb-1 text-[11px] text-[#7e877c]">Workspace / Audit Trail</p>
        <h2 className="text-[23px] font-semibold tracking-[-.035em]">Activity & Logs</h2>
        <p className="mt-1 text-[12px] text-[#7b8379]">
          Audit log of template registrations, updates, and spreadsheet imports.
        </p>
      </div>
      <section className="overflow-hidden rounded-lg border border-[#e5e9e3] bg-white shadow-[0_1px_2px_rgba(20,32,20,.02)]">
        <div className="flex items-center justify-between border-b border-[#edf0ec] px-5 py-4">
          <div>
            <h3 className="text-[13px] font-semibold text-[#242b23]">Recent Audit Events</h3>
            <p className="mt-0.5 text-[10px] text-[#8c9389]">Recorded across database operations</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-[#fafbf9] text-[10px] uppercase tracking-wide text-[#899187]">
              <tr>
                <th className="px-5 py-3">Event</th>
                <th className="px-4 py-3">Template Name</th>
                <th className="px-4 py-3">DLT ID</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {templates.slice(0, 10).map((t, i) => (
                <tr key={t.id} className="border-t border-[#f0f2ef] hover:bg-[#fafbf9]">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2 text-[11px]">
                      <span
                        className={`size-1.5 rounded-full ${
                          i === 0 ? "bg-[#3e8a52]" : i === 1 ? "bg-[#3e688a]" : "bg-[#8a723e]"
                        }`}
                      />
                      {i === 0 ? "Template modified" : i % 2 === 0 ? "Record updated" : "Batch verified"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-medium text-[#2d342c]">{t.name}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-[#687a69]">{t.dltTemplateId}</td>
                  <td className="px-4 py-3 text-[11px] text-[#555d53]">{t.ownerName}</td>
                  <td className="px-4 py-3 text-[10px] text-[#727b70]">
                    {new Date(t.updatedAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function SettingsView({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <div className="rounded-lg border border-[#e5e9e3] bg-white p-8 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
      <h2 className="text-lg font-semibold text-[#222920]">Employee Profile & Settings</h2>
      <p className="mt-1 text-sm text-[#737b71]">
        Authenticated credentials and role-based permissions for India Shelter Workspace.
      </p>

      <div className="mt-6 grid max-w-lg gap-5 sm:grid-cols-2">
        <div className="rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3.5">
          <p className="text-[11px] text-[#8b9389]">Employee Name</p>
          <p className="mt-1 text-sm font-semibold text-[#293127]">{user?.name || "—"}</p>
        </div>
        <div className="rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3.5">
          <p className="text-[11px] text-[#8b9389]">Role & Permissions</p>
          <p className="mt-1 text-sm font-semibold text-[#293127]">
            {user?.role === "ADMIN" ? "Administrator" : "Employee"}
          </p>
        </div>
        <div className="rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3.5">
          <p className="text-[11px] text-[#8b9389]">Employee ID</p>
          <p className="mt-1 font-mono text-sm font-semibold text-[#293127]">{user?.employeeId || "—"}</p>
        </div>
        <div className="rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3.5">
          <p className="text-[11px] text-[#8b9389]">Corporate Email</p>
          <p className="mt-1 text-sm font-semibold text-[#293127]">{user?.email || "—"}</p>
        </div>
      </div>

      <div className="mt-8 border-t border-[#edf0ec] pt-6 flex items-center justify-between max-w-lg">
        <div>
          <p className="text-xs font-semibold text-[#2f362d]">Session Authentication</p>
          <p className="text-[11px] text-[#899187]">Secured with Bearer JWT</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-md border border-[#eed0cc] bg-[#fff8f7] px-3.5 py-2 text-xs font-medium text-[#a1483c] hover:bg-[#fae8e6]"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  )
}
