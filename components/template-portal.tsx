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
  Edit3,
  RefreshCw,
  Link as LinkIcon,
  UserPlus,
  Key,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  UserCheck,
  UserX,
  ShieldCheck,
  BookOpen,
  Landmark,
  Globe,
  ChevronRight,
} from "lucide-react"
import { TemplateImportWizard } from "@/components/template-import-wizard"
import { api, tokenStorage, userStorage, Template, User, TeamMember, ResourceLink, DashboardOverview, Pagination } from "@/lib/api"

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
  const [page, setPage] = useState<
    | "Dashboard"
    | "Customer Communications"
    | "Policies"
    | "PMAY"
    | "Meet Our Team"
    | "Staff Management"
    | "Activity"
    | "Settings"
  >("Dashboard")
  const [mobileNav, setMobileNav] = useState(false)

  // Resource Links (Policies and PMAY)
  const [policyLinks, setPolicyLinks] = useState<ResourceLink[]>([])
  const [pmayLinks, setPmayLinks] = useState<ResourceLink[]>([])
  const [selectedPmayId, setSelectedPmayId] = useState<string | null>(null)
  const [pmayExpanded, setPmayExpanded] = useState(true)
  const [linkModal, setLinkModal] = useState<"POLICY" | "PMAY" | null>(null)
  const [linkDraft, setLinkDraft] = useState({
    id: "",
    category: "POLICY" as "POLICY" | "PMAY",
    title: "",
    url: "",
    description: "",
    order: 0,
    isActive: true,
  })
  const [linkSubmitting, setLinkSubmitting] = useState(false)

  // Staff Management State (Admin only)
  const [staffList, setStaffList] = useState<User[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffModal, setStaffModal] = useState<"add" | "edit" | null>(null)
  const [passwordStaff, setPasswordStaff] = useState<User | null>(null)
  const [staffSearch, setStaffSearch] = useState("")
  const [staffRoleFilter, setStaffRoleFilter] = useState<"ALL" | "ADMIN" | "EMPLOYEE">("ALL")
  const [staffStatusFilter, setStaffStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [showPassword, setShowPassword] = useState(false)
  const [staffSubmitting, setStaffSubmitting] = useState(false)

  const [staffDraft, setStaffDraft] = useState({
    id: "",
    employeeId: "",
    name: "",
    email: "",
    role: "EMPLOYEE" as "ADMIN" | "EMPLOYEE",
    password: "",
    isActive: true,
  })

  const [passwordDraft, setPasswordDraft] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  // Meet Our Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamModal, setTeamModal] = useState<"add" | "edit" | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [teamDraft, setTeamDraft] = useState({
    id: "",
    name: "",
    designation: "",
    photoUrl: "",
    bio: "",
    department: "Operations",
    order: 0,
    isActive: true,
  })

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
  const [filtersOpen, setFiltersOpen] = useState(false)
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

  // 5. Fetch Meet Our Team
  const fetchTeam = useCallback(async () => {
    setTeamLoading(true)
    try {
      const res = await api.team.getAll()
      if (res.success && res.data) {
        setTeamMembers(res.data)
      }
    } catch (err) {
      console.error("Failed to load team members:", err)
    } finally {
      setTeamLoading(false)
    }
  }, [])

  // 6. Fetch Staff Members (Admin only)
  const fetchStaff = useCallback(async () => {
    if (user?.role !== "ADMIN") return
    setStaffLoading(true)
    try {
      const res = await api.staff.getAll()
      if (res.success && res.data) {
        setStaffList(res.data)
      }
    } catch (err: any) {
      console.error("Failed to load staff list:", err)
    } finally {
      setStaffLoading(false)
    }
  }, [user?.role])

  // 7. Fetch Resource Links (Policies & PMAY)
  const fetchLinks = useCallback(async () => {
    try {
      const res = await api.links.getAll()
      if (res.success && Array.isArray(res.data)) {
        const policies = res.data.filter((l) => l.category === "POLICY")
        const pmays = res.data.filter((l) => l.category === "PMAY")
        setPolicyLinks(policies)
        setPmayLinks(pmays)
        if (pmays.length > 0 && !selectedPmayId) {
          setSelectedPmayId(pmays[0].id)
        }
      }
    } catch (err) {
      console.error("Failed to load resource links:", err)
    }
  }, [selectedPmayId])

  // Initial load
  useEffect(() => {
    if (mounted && user) {
      fetchOverview()
      fetchFilterOptions()
      fetchTemplates()
      fetchTeam()
      fetchLinks()
      if (user.role === "ADMIN") {
        fetchStaff()
      }
    }
  }, [mounted, user, fetchOverview, fetchFilterOptions, fetchTemplates, fetchTeam, fetchStaff, fetchLinks])

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
    if (user?.role === "EMPLOYEE") {
      notify("Employees have read-only access. Only Administrators can edit templates.")
      return
    }
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

    if (modal === "edit" && user?.role === "EMPLOYEE") {
      setModalError("Employees have read-only access and cannot edit templates.")
      return
    }

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

  const openAddTeamModal = () => {
    setTeamDraft({
      id: "",
      name: "",
      designation: "",
      photoUrl: "",
      bio: "",
      department: "Operations",
      order: teamMembers.length + 1,
      isActive: true,
    })
    setTeamModal("add")
  }

  const openEditTeamModal = (m: TeamMember) => {
    setTeamDraft({
      id: m.id,
      name: m.name,
      designation: m.designation,
      photoUrl: m.photoUrl,
      bio: m.bio || "",
      department: m.department || "",
      order: m.order,
      isActive: m.isActive,
    })
    setTeamModal("edit")
  }

  const handleSaveTeamMember = async () => {
    if (!teamDraft.name.trim() || !teamDraft.designation.trim() || !teamDraft.photoUrl.trim()) {
      notify("Please provide Name, Designation, and Photo URL")
      return
    }
    try {
      if (teamModal === "add") {
        await api.team.create(teamDraft)
        notify("Team member added successfully!")
      } else if (teamModal === "edit" && teamDraft.id) {
        await api.team.update(teamDraft.id, teamDraft)
        notify("Team member updated successfully!")
      }
      setTeamModal(null)
      fetchTeam()
    } catch (err: any) {
      notify(err?.message || "Failed to save team member")
    }
  }

  const handleDeleteTeamMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from team?`)) return
    try {
      await api.team.delete(id)
      notify("Team member deleted")
      fetchTeam()
    } catch (err: any) {
      notify(err?.message || "Failed to delete team member")
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const res = await api.storage.upload(file, "team")
      if (res.data?.url) {
        setTeamDraft((prev) => ({ ...prev, photoUrl: res.data.url }))
        notify("Photo uploaded to Neon Object Storage bucket!")
      }
    } catch (err: any) {
      notify(err?.message || "Failed to upload photo to Neon storage")
    } finally {
      setPhotoUploading(false)
    }
  }

  // Staff Handlers (Admin Only)
  const openAddStaffModal = () => {
    setStaffDraft({
      id: "",
      employeeId: "",
      name: "",
      email: "",
      role: "EMPLOYEE",
      password: "",
      isActive: true,
    })
    setShowPassword(false)
    setStaffModal("add")
  }

  const openEditStaffModal = (staff: User) => {
    setStaffDraft({
      id: staff.id,
      employeeId: staff.employeeId,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      password: "",
      isActive: staff.isActive,
    })
    setStaffModal("edit")
  }

  const openChangePasswordModal = (staff: User) => {
    setPasswordStaff(staff)
    setPasswordDraft({ newPassword: "", confirmPassword: "" })
    setShowPassword(false)
  }

  const handleSaveStaff = async () => {
    if (staffModal === "add") {
      if (!staffDraft.employeeId.trim() || !staffDraft.name.trim() || !staffDraft.email.trim() || !staffDraft.password.trim()) {
        notify("Please fill in Name, Employee ID, Email, and Password")
        return
      }
      if (staffDraft.password.trim().length < 6) {
        notify("Password must be at least 6 characters long")
        return
      }
      setStaffSubmitting(true)
      try {
        const res = await api.staff.create({
          employeeId: staffDraft.employeeId.trim().toUpperCase(),
          name: staffDraft.name.trim(),
          email: staffDraft.email.trim(),
          role: staffDraft.role,
          password: staffDraft.password.trim(),
        })
        notify(res.message || "Staff member registered successfully!")
        setStaffModal(null)
        fetchStaff()
      } catch (err: any) {
        notify(err?.message || "Failed to create staff member")
      } finally {
        setStaffSubmitting(false)
      }
    } else if (staffModal === "edit" && staffDraft.id) {
      if (!staffDraft.name.trim() || !staffDraft.email.trim()) {
        notify("Please provide Name and Email")
        return
      }
      setStaffSubmitting(true)
      try {
        const res = await api.staff.update(staffDraft.id, {
          name: staffDraft.name.trim(),
          email: staffDraft.email.trim(),
          role: staffDraft.role,
          isActive: staffDraft.isActive,
        })
        notify(res.message || "Staff details updated successfully!")
        setStaffModal(null)
        fetchStaff()
      } catch (err: any) {
        notify(err?.message || "Failed to update staff member")
      } finally {
        setStaffSubmitting(false)
      }
    }
  }

  const handleSaveStaffPassword = async () => {
    if (!passwordStaff) return
    if (!passwordDraft.newPassword || passwordDraft.newPassword.trim().length < 6) {
      notify("New password must be at least 6 characters long")
      return
    }
    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      notify("Passwords do not match")
      return
    }
    setStaffSubmitting(true)
    try {
      const res = await api.staff.changePassword(passwordStaff.id, passwordDraft.newPassword.trim())
      notify(res.message || `Password for ${passwordStaff.name} updated successfully!`)
      setPasswordStaff(null)
      setPasswordDraft({ newPassword: "", confirmPassword: "" })
    } catch (err: any) {
      notify(err?.message || "Failed to change password")
    } finally {
      setStaffSubmitting(false)
    }
  }

  const handleToggleStaffStatus = async (staff: User) => {
    if (staff.id === user?.id) {
      notify("You cannot deactivate your own administrative account")
      return
    }
    try {
      const res = await api.staff.update(staff.id, { isActive: !staff.isActive })
      notify(res.message || (staff.isActive ? `Deactivated ${staff.name}` : `Activated ${staff.name}`))
      fetchStaff()
    } catch (err: any) {
      notify(err?.message || "Failed to update account status")
    }
  }

  // Link Handlers (Policies & PMAY)
  const openAddLinkModal = (category: "POLICY" | "PMAY") => {
    setLinkDraft({
      id: "",
      category,
      title: "",
      url: "",
      description: "",
      order: category === "POLICY" ? policyLinks.length : pmayLinks.length,
      isActive: true,
    })
    setLinkModal(category)
  }

  const openEditLinkModal = (link: ResourceLink) => {
    setLinkDraft({
      id: link.id,
      category: link.category,
      title: link.title,
      url: link.url,
      description: link.description || "",
      order: link.order,
      isActive: link.isActive,
    })
    setLinkModal(link.category)
  }

  const handleSaveLink = async () => {
    if (!linkDraft.title.trim() || !linkDraft.url.trim()) {
      notify("Please provide both Name and Link URL")
      return
    }
    setLinkSubmitting(true)
    try {
      if (linkDraft.id) {
        await api.links.update(linkDraft.id, {
          title: linkDraft.title.trim(),
          url: linkDraft.url.trim(),
          description: linkDraft.description.trim() || undefined,
          order: linkDraft.order,
          isActive: linkDraft.isActive,
        })
        notify(`${linkDraft.category === "POLICY" ? "Policy" : "PMAY"} link updated!`)
      } else {
        await api.links.create({
          category: linkDraft.category,
          title: linkDraft.title.trim(),
          url: linkDraft.url.trim(),
          description: linkDraft.description.trim() || undefined,
          order: linkDraft.order,
          isActive: linkDraft.isActive,
        })
        notify(`${linkDraft.category === "POLICY" ? "Policy" : "PMAY"} link added successfully!`)
      }
      setLinkModal(null)
      fetchLinks()
    } catch (err: any) {
      notify(err?.message || "Failed to save link")
    } finally {
      setLinkSubmitting(false)
    }
  }

  const handleDeleteLink = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      await api.links.delete(id)
      notify("Link deleted successfully")
      fetchLinks()
    } catch (err: any) {
      notify(err?.message || "Failed to delete link")
    }
  }

  const chooseNav = (
    nav:
      | "Dashboard"
      | "Customer Communications"
      | "Policies"
      | "PMAY"
      | "Meet Our Team"
      | "Staff Management"
      | "Activity"
      | "Settings"
  ) => {
    setPage(nav)
    setMobileNav(false)
  }

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
        className={`fixed inset-y-0 left-0 z-30 flex w-[238px] flex-col border-r border-[#e8ebe6] bg-white transition-transform duration-200 md:translate-x-0 ${
          mobileNav ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[64px] sm:h-[72px] items-center justify-between border-b border-[#edf0ec] px-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-sm bg-[#1d5c3b] text-[15px] font-bold tracking-tight text-white">
              IS
            </div>
            <div>
              <div className="text-[12px] font-semibold tracking-[.01em]">INDIA SHELTER</div>
              <div className="text-[9px] sm:text-[10px] text-[#848b82]">FINANCE CORPORATION</div>
            </div>
          </div>
          <button
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
            className="rounded p-1 text-[#788075] hover:bg-[#f2f4f1] md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 sm:px-4 pt-5">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#a2a89f]">
            Workspace
          </p>
          <nav className="flex flex-col gap-1">
            {/* Dashboard */}
            <button
              onClick={() => chooseNav("Dashboard")}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-[13px] transition ${
                page === "Dashboard"
                  ? "bg-[#edf4ef] font-medium text-[#205c3c]"
                  : "text-[#636b61] hover:bg-[#f5f7f4] hover:text-[#252b24]"
              }`}
            >
              <LayoutDashboard size={16} />
              <span className="flex-1 truncate">Dashboard</span>
            </button>

            {/* Customer Communications (Template Explorer) */}
            <button
              onClick={() => chooseNav("Customer Communications")}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-[13px] transition ${
                page === "Customer Communications"
                  ? "bg-[#edf4ef] font-medium text-[#205c3c]"
                  : "text-[#636b61] hover:bg-[#f5f7f4] hover:text-[#252b24]"
              }`}
            >
              <Files size={16} />
              <span className="flex-1 truncate">Customer Communications</span>
              <span className="ml-auto rounded-sm bg-white px-1.5 py-0.5 text-[10px] text-[#687368] border border-[#e2e7e0]">
                {pagination.totalRecords}
              </span>
            </button>

            {/* Policies - directly under Customer Communications, single main tab with no sub-tabs */}
            <button
              onClick={() => chooseNav("Policies")}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-[13px] transition ${
                page === "Policies"
                  ? "bg-[#edf4ef] font-medium text-[#205c3c]"
                  : "text-[#636b61] hover:bg-[#f5f7f4] hover:text-[#252b24]"
              }`}
            >
              <BookOpen size={16} />
              <span className="flex-1 truncate">Policies</span>
              {policyLinks.length > 0 && (
                <span className="ml-auto size-2 rounded-full bg-[#205c3c]" title="Policy Configured" />
              )}
            </button>

            {/* PMAY - Main option with multiple sub-tabs added from settings */}
            <div className="flex flex-col">
              <div
                className={`flex h-10 items-center justify-between rounded-md px-3 text-[13px] transition ${
                  page === "PMAY"
                    ? "bg-[#edf4ef] font-medium text-[#205c3c]"
                    : "text-[#636b61] hover:bg-[#f5f7f4] hover:text-[#252b24]"
                }`}
              >
                <button
                  onClick={() => {
                    chooseNav("PMAY")
                    if (pmayLinks.length > 0 && !selectedPmayId) {
                      setSelectedPmayId(pmayLinks[0].id)
                    }
                  }}
                  className="flex flex-1 items-center gap-3 truncate text-left"
                >
                  <Landmark size={16} />
                  <span className="truncate">PMAY</span>
                </button>
                {pmayLinks.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPmayExpanded(!pmayExpanded)
                    }}
                    className="p-1 text-[#838c80] hover:text-[#205c3c] rounded"
                    title={pmayExpanded ? "Collapse PMAY sub-tabs" : "Expand PMAY sub-tabs"}
                  >
                    {pmayExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>

              {/* Multiple Sub-tabs under PMAY */}
              {pmayExpanded && pmayLinks.length > 0 && (
                <div className="mt-1 space-y-0.5 pl-3 border-l-2 border-[#e3e8e1] ml-4">
                  {pmayLinks.map((subLink) => (
                    <button
                      key={subLink.id}
                      onClick={() => {
                        setSelectedPmayId(subLink.id)
                        chooseNav("PMAY")
                      }}
                      className={`flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-left text-[11px] transition ${
                        page === "PMAY" && selectedPmayId === subLink.id
                          ? "bg-[#e5eee6] font-semibold text-[#1e5837]"
                          : "text-[#666f64] hover:bg-[#f6f8f5] hover:text-[#232921]"
                      }`}
                    >
                      <span className="size-1 rounded-full bg-[#3d7a50]" />
                      <span className="flex-1 truncate">{subLink.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Meet Our Team */}
            <button
              onClick={() => chooseNav("Meet Our Team")}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-[13px] transition ${
                page === "Meet Our Team"
                  ? "bg-[#edf4ef] font-medium text-[#205c3c]"
                  : "text-[#636b61] hover:bg-[#f5f7f4] hover:text-[#252b24]"
              }`}
            >
              <Users size={16} />
              <span className="flex-1 truncate">Meet Our Team</span>
            </button>

            {/* Staff Management (Admin only) */}
            {user?.role === "ADMIN" && (
              <button
                onClick={() => chooseNav("Staff Management")}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-[13px] transition ${
                  page === "Staff Management"
                    ? "bg-[#edf4ef] font-medium text-[#205c3c]"
                    : "text-[#636b61] hover:bg-[#f5f7f4] hover:text-[#252b24]"
                }`}
              >
                <UserPlus size={16} />
                <span className="flex-1 truncate">Staff Management</span>
              </button>
            )}

            {/* Activity */}
            {/* <button
              onClick={() => chooseNav("Activity")}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-[13px] transition ${
                page === "Activity"
                  ? "bg-[#edf4ef] font-medium text-[#205c3c]"
                  : "text-[#636b61] hover:bg-[#f5f7f4] hover:text-[#252b24]"
              }`}
            >
              <Clock3 size={16} />
              <span className="flex-1 truncate">Activity</span>
            </button> */}
          </nav>
        </div>

        <div className="mt-6 px-3 sm:px-4">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#a2a89f]">
            Manage
          </p>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => {
                setModal("import")
                setMobileNav(false)
              }}
              className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-[13px] text-[#636b61] hover:bg-[#f5f7f4]"
            >
              <Upload size={16} /> Bulk Import
            </button>
          )}
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
        <div className="mt-auto p-3 sm:p-4">
          <div className="rounded-md border border-[#e9ece7] bg-[#fafbf9] p-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-[#e6eee8] text-[10px] font-semibold text-[#376447]">
                {user?.name?.slice(0, 2).toUpperCase() || "IS"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-[#252c23]">{user?.name || "Employee"}</p>
                <p className="truncate text-[10px] text-[#92988f]">
                  {user?.role === "ADMIN" ? "Administrator" : "Employee"} · {user?.employeeId}
                </p>
              </div>
              <button
                aria-label="Sign out"
                onClick={handleLogout}
                title="Sign out"
                className="ml-auto p-1 text-[#8b9289] hover:text-[#b44e3e]"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
          <p className="mt-2.5 px-1 text-[10px] text-[#a1a79f]">India Shelter Finance · Live DB</p>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileNav && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      {/* Main Container */}
      <div className="min-h-screen md:pl-[238px]">
        {/* Responsive Sticky Header */}
        <header className="sticky top-0 z-10 flex h-[60px] sm:h-[64px] items-center justify-between border-b border-[#e8ebe6] bg-white/95 px-3.5 sm:px-6 backdrop-blur">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              className="flex size-9 items-center justify-center rounded-md border border-[#e7ebe5] text-[#555f53] md:hidden hover:bg-[#f6f8f5]"
              aria-label="Open navigation menu"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={18} />
            </button>
            <div className="hidden text-[11px] text-[#9ba198] sm:block truncate">
              Workspace <span className="mx-2 text-[#c6cbc4]">/</span>
            </div>
            <h1 className="text-[13px] sm:text-[14px] font-semibold truncate">{page}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
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
              className="relative flex size-8 items-center justify-center rounded-md border border-[#eceeea] text-[#626a60] hover:bg-[#f6f8f5]"
            >
              <Bell size={15} />
              <i className="absolute right-[7px] top-[6px] size-1.5 rounded-full bg-[#468b57]" />
            </button>
            <div className="hidden h-5 w-px bg-[#e9ece7] sm:block" />
            <button
              onClick={() => chooseNav("Settings")}
              className="flex items-center gap-1.5 rounded-full p-0.5 hover:bg-[#f5f7f4]"
            >
              <div className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-[#e7eee8] text-[10px] font-semibold text-[#376447]">
                {user?.role === "ADMIN" ? "AV" : "TM"}
              </div>
              <ChevronDown size={13} className="hidden text-[#8b9289] sm:block" />
            </button>
          </div>
        </header>

        {/* Content Area with Fluid Responsive Padding */}
        <main className="mx-auto max-w-[1500px] px-3.5 py-4 sm:px-6 sm:py-6 lg:py-7">
          {page === "Customer Communications" ? (
            <>
              {/* Explorer Header */}
              <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#7e877c]">
                    <span>Workspace</span>
                    <span>/</span>
                    <span className="text-[#435044]">Customer Communications</span>
                  </div>
                  <h2 className="text-[20px] sm:text-[23px] font-semibold tracking-[-.035em]">
                    Customer Communications
                  </h2>
                  <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#7b8379]">
                    Search, filter, review and maintain official DLT SMS templates.
                  </p>
                </div>
                {user?.role === "ADMIN" && (
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                    <button
                      onClick={() => setModal("import")}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#dfe4dd] bg-white px-3 text-[12px] font-medium text-[#475046] hover:bg-[#fafbf9]"
                    >
                      <Upload size={14} /> Import
                    </button>
                    <button
                      onClick={openAddModal}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#205c3c] px-3.5 text-[12px] font-medium text-white shadow-xs hover:bg-[#174b30]"
                    >
                      <Plus size={15} /> Add template
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Stats Row - 2 cols on mobile, 4 on desktop */}
              <section className="mb-4 sm:mb-5 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                <Stat
                  label="Total templates"
                  value={stats.totalTemplates.toString()}
                  note="Registered in database"
                  icon={Files}
                />
                <Stat
                  label="Active templates"
                  value={stats.activeTemplates.toString()}
                  note="Ready to broadcast"
                  icon={Check}
                />
                <Stat
                  label="Adhoc templates"
                  value={stats.adhocTemplates.toString()}
                  note="Event notices"
                  icon={CalendarDays}
                />
                <Stat
                  label="With attachments"
                  value={stats.templatesWithAttachments.toString()}
                  note="Supporting URLs"
                  icon={Paperclip}
                />
              </section>

              {/* Search & Filter Card */}
              <section className="overflow-hidden rounded-lg border border-[#e5e9e3] bg-white shadow-[0_1px_2px_rgba(20,32,20,.025)]">
                <div className="border-b border-[#edf0ec] p-3.5 sm:p-5">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
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
                        placeholder="Search by ID, name, content, owner..."
                        className={`${cnInput} h-10 pl-9 pr-9 text-xs sm:text-sm`}
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
                      className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-[12px] font-medium transition ${
                        filtersOpen
                          ? "border-[#cbd9ce] bg-[#f1f6f2] text-[#265c3d]"
                          : "border-[#e2e6e0] text-[#555e54] hover:bg-[#fafbf9]"
                      }`}
                    >
                      <SlidersHorizontal size={14} /> Advanced filters
                      <span className="rounded-full bg-white px-1.5 py-0.2 text-[10px] font-semibold border border-[#d2dcd3]">
                        {Object.values(appliedFilters).filter(Boolean).length}
                      </span>
                    </button>
                  </div>

                  {filtersOpen && (
                    <div className="mt-3.5 rounded-md border border-[#edf0ec] bg-[#fafbf9] p-3 sm:p-4">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#485146]">Refine database records</span>
                        <button onClick={resetFilters} className="text-[11px] text-[#687467] underline-offset-2 hover:underline">
                          Reset all
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
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
                          placeholder="Search or select owner..."
                          datalistId="owners-filter-datalist"
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
                      <div className="mt-3.5 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] text-[#90978e]">
                          Filters are evaluated on PostgreSQL server with case-insensitive partial matching.
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:flex">
                          <button
                            onClick={resetFilters}
                            className="h-8 rounded-md border border-[#e0e5de] bg-white px-3 text-[11px] font-medium text-[#60695e] hover:bg-[#eef1ed]"
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
                  <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#727b70]">
                      <span className="font-semibold text-[#30382f]">{pagination.totalRecords}</span> templates found
                      {(query || Object.values(appliedFilters).some(Boolean)) && (
                        <button
                          onClick={resetFilters}
                          className="ml-1 flex items-center gap-1 rounded-full bg-[#edf4ef] px-2 py-0.5 text-[10px] text-[#346246]"
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
                            className="inline-flex items-center gap-1 rounded-full border border-[#e3e9e1] bg-white px-2 py-0.5 text-[10px] text-[#52614f]"
                          >
                            {appliedFilterLabels[key] || key}: {appliedFilters[key]} <X size={10} />
                          </button>
                        ))}
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={exportResults}
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#71796f] hover:text-[#205c3c]"
                      >
                        <Download size={13} /> Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk selection bar */}
                {checked.length > 0 && (
                  <div className="flex items-center justify-between border-b border-[#e8eee8] bg-[#f3f7f3] px-4 py-2">
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

                {/* 1. Mobile Cards View (Visible on < md screens) */}
                <div className="block md:hidden divide-y divide-[#edf0ec]">
                  {loading ? (
                    <div className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin text-[#205c3c]" />
                        <span className="text-xs text-[#717b70]">Loading templates...</span>
                      </div>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                      <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-[#f0f3ef] text-[#7e897c]">
                        <Search size={16} />
                      </div>
                      <p className="text-[13px] font-medium text-[#2d342c]">No templates found</p>
                      <p className="mt-1 text-[11px] text-[#8c9389]">
                        Try adjusting your search criteria or clear your active filters.
                      </p>
                    </div>
                  ) : (
                    templates.map((t, i) => (
                      <div key={t.id} className="p-3.5 space-y-2 hover:bg-[#fafbf9] transition">
                        {/* Card Header: Checkbox, DLT ID, Remark */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
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
                              className="accent-[#205c3c] size-3.5"
                            />
                            <button
                              onClick={() => copyText(t.dltTemplateId, "DLT ID copied")}
                              className="font-mono text-[11px] font-semibold text-[#446549] hover:underline flex items-center gap-1"
                            >
                              {t.dltTemplateId}
                              <Copy size={11} className="text-[#879688]" />
                            </button>
                          </div>
                          <Remark value={t.remarks || (t.isActive ? "Active" : "Inactive")} />
                        </div>

                        {/* Title & Preview */}
                        <div>
                          <button
                            onClick={() => setSelected(t)}
                            className="text-left text-[13px] font-semibold text-[#272e25] hover:text-[#205c3c] leading-snug line-clamp-1"
                          >
                            {t.name}
                          </button>
                          <p className="mt-0.5 text-[11px] text-[#6d756b] line-clamp-2 leading-relaxed">
                            {t.content}
                          </p>
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#788175] pt-1">
                          <span className="rounded bg-[#f1f3f0] px-1.5 py-0.5 font-medium text-[#4f564d]">
                            {t.dueDate}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-[#444b41] truncate max-w-[120px]">
                            {t.ownerName}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(t.updatedAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          {(t.attachmentLink1 || t.attachmentLink2) && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-0.5 text-[#3a6845] font-medium">
                                <Paperclip size={11} /> {(t.attachmentLink1 ? 1 : 0) + (t.attachmentLink2 ? 1 : 0)} link
                              </span>
                            </>
                          )}
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#f4f6f3]">
                          <button
                            onClick={() => setSelected(t)}
                            className="inline-flex h-7 items-center gap-1 rounded border border-[#e2e7e0] bg-white px-2.5 text-[10px] font-medium text-[#4e584d] hover:bg-[#f6f8f5]"
                          >
                            <ExternalLink size={11} /> View
                          </button>
                          {user?.role !== "EMPLOYEE" && (
                            <button
                              onClick={() => openEditModal(t)}
                              className="inline-flex h-7 items-center gap-1 rounded border border-[#e2e7e0] bg-white px-2.5 text-[10px] font-medium text-[#4e584d] hover:bg-[#f6f8f5]"
                            >
                              <Edit3 size={11} /> Edit
                            </button>
                          )}
                          {user?.role === "ADMIN" && (
                            <button
                              onClick={() => handleDeactivate(t.id)}
                              className="inline-flex h-7 items-center gap-1 rounded border border-[#eed0cc] bg-[#fff8f7] px-2 text-[10px] font-medium text-[#a1483c] hover:bg-[#fae8e6]"
                            >
                              <Trash2 size={11} /> Deactivate
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 2. Desktop & Tablet Table (Visible on md+ screens) */}
                <div className="hidden md:block w-full overflow-x-auto">
                  <table className="w-full min-w-[960px] border-collapse text-left">
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
                                  {user?.role !== "EMPLOYEE" && (
                                    <button
                                      title="Edit template"
                                      onClick={() => openEditModal(t)}
                                      className="flex size-7 items-center justify-center rounded text-[#71796f] hover:bg-[#eef2ed] hover:text-[#205c3c]"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                  )}
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

                {/* Responsive Pagination Controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#edf0ec] px-3.5 py-3 sm:px-5">
                  <span className="text-[11px] text-[#899187] text-center sm:text-left">
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
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <label className="flex items-center gap-1.5 text-[11px] text-[#838b80]">
                      Rows
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
                        className="h-7 rounded border border-[#e7ebe5] bg-white px-2.5 text-[11px] font-medium text-[#4b5449] disabled:opacity-40 hover:bg-[#fafbf9]"
                      >
                        Previous
                      </button>
                      <span className="px-2 text-[11px] font-medium text-[#737b71]">
                        {pagination.currentPage} / {Math.max(1, pagination.totalPages)}
                      </span>
                      <button
                        disabled={!pagination.hasNextPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="h-7 rounded border border-[#e7ebe5] bg-white px-2.5 text-[11px] font-medium text-[#4b5449] disabled:opacity-40 hover:bg-[#fafbf9]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : page === "Staff Management" ? (
            user?.role === "ADMIN" ? (
              <StaffManagementView
                staffList={staffList}
                loading={staffLoading}
                currentUser={user}
                search={staffSearch}
                setSearch={setStaffSearch}
                roleFilter={staffRoleFilter}
                setRoleFilter={setStaffRoleFilter}
                statusFilter={staffStatusFilter}
                setStatusFilter={setStaffStatusFilter}
                onAddStaff={openAddStaffModal}
                onEditStaff={openEditStaffModal}
                onChangePassword={openChangePasswordModal}
                onToggleStatus={handleToggleStaffStatus}
                onRefresh={fetchStaff}
              />
            ) : (
              <div className="rounded-lg border border-[#f0d5d5] bg-[#fdf7f7] p-8 text-center">
                <ShieldAlert size={28} className="mx-auto text-[#c0392b]" />
                <h3 className="mt-3 text-sm font-semibold text-[#8a2218]">Access Restricted</h3>
                <p className="mt-1 text-xs text-[#6e5553]">Staff management is restricted to Administrators only.</p>
              </div>
            )
          ) : page === "Policies" ? (
            <PoliciesView
              policyLinks={policyLinks}
              onGoToSettings={() => chooseNav("Settings")}
            />
          ) : page === "PMAY" ? (
            <PmayView
              pmayLinks={pmayLinks}
              selectedPmayId={selectedPmayId}
              onSelectPmay={setSelectedPmayId}
              onGoToSettings={() => chooseNav("Settings")}
            />
          ) : page === "Meet Our Team" ? (
            <MeetOurTeamView
              team={teamMembers}
              loading={teamLoading}
              user={user}
              onAdd={openAddTeamModal}
              onEdit={openEditTeamModal}
              onDelete={handleDeleteTeamMember}
            />
          ) : page === "Dashboard" ? (
            <DashboardView
              stats={stats}
              user={user}
              recentTemplates={templates.slice(0, 6)}
              onExplore={() => chooseNav("Customer Communications")}
              onAdd={openAddModal}
              onImport={() => setModal("import")}
              onView={setSelected}
            />
          ) : page === "Activity" ? (
            <ActivityView templates={templates} />
          ) : (
            <SettingsView
              user={user}
              onLogout={handleLogout}
              policyLinks={policyLinks}
              pmayLinks={pmayLinks}
              onAddPolicy={() => openAddLinkModal("POLICY")}
              onEditPolicy={(link) => openEditLinkModal(link)}
              onDeletePolicy={handleDeleteLink}
              onAddPmay={() => openAddLinkModal("PMAY")}
              onEditPmay={(link) => openEditLinkModal(link)}
              onDeletePmay={handleDeleteLink}
            />
          )}
        </main>

        {/* Portal Bottom Attribution Footer */}
        <footer className="border-t border-[#edf0ec] bg-white py-3.5 px-4 sm:px-8 text-center text-xs text-[#7e877c]">
          India Shelter Finance Corporation · Internal Operations Workspace · <strong className="font-extrabold text-[#1a5131]">Created by Ayush Vishwakarma</strong>
        </footer>
      </div>

      {/* Template Detail Drawer - Fully Responsive */}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/35 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null)
          }}
        >
          <section className="flex h-full w-full sm:max-w-[540px] flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between border-b border-[#e9ece7] px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#7d897d]">
                  DLT Template Details
                </p>
                <h2 className="mt-0.5 text-[16px] sm:text-[17px] font-semibold text-[#252c23]">
                  {selected.name}
                </h2>
                <p className="mt-0.5 font-mono text-[11px] text-[#66806a]">{selected.dltTemplateId}</p>
              </div>
              <button
                aria-label="Close details"
                onClick={() => setSelected(null)}
                className="rounded p-1.5 text-[#788075] hover:bg-[#f2f4f1]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-md border border-[#edf0ec] bg-[#fafbf9] p-3.5 sm:p-4">
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
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold">SMS Content</h3>
                  <span className="text-[10px] text-[#929a90]">{selected.content.length} characters</span>
                </div>
                <div className="whitespace-pre-wrap rounded-md border border-[#e9ece7] bg-[#fafbf9] p-3.5 sm:p-4 text-[12px] leading-6 text-[#4b5549]">
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
              <div className="mt-5">
                <h3 className="text-[12px] font-semibold mb-2">Attached Links & Resources</h3>
                <div className="flex flex-col gap-2">
                  {selected.attachmentLink1 ? (
                    <a
                      href={selected.attachmentLink1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-md border border-[#e5eae3] bg-[#fafbf9] p-2.5 sm:p-3 hover:bg-[#f4f7f3]"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-[#346244] min-w-0">
                        <LinkIcon size={14} className="shrink-0" />
                        <span className="truncate font-medium">{selected.attachmentLink1}</span>
                      </div>
                      <ExternalLink size={13} className="text-[#6d796b] shrink-0 ml-2" />
                    </a>
                  ) : null}

                  {selected.attachmentLink2 ? (
                    <a
                      href={selected.attachmentLink2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-md border border-[#e5eae3] bg-[#fafbf9] p-2.5 sm:p-3 hover:bg-[#f4f7f3]"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-[#346244] min-w-0">
                        <LinkIcon size={14} className="shrink-0" />
                        <span className="truncate font-medium">{selected.attachmentLink2}</span>
                      </div>
                      <ExternalLink size={13} className="text-[#6d796b] shrink-0 ml-2" />
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

            <div className="flex items-center justify-between border-t border-[#e9ece7] px-4 py-3 sm:px-5">
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
                {user?.role !== "EMPLOYEE" && (
                  <button
                    onClick={() => openEditModal(selected)}
                    className="h-8 rounded bg-[#205c3c] px-3.5 text-[11px] font-medium text-white hover:bg-[#174b30]"
                  >
                    Edit template
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Add / Edit / Import Modals - Fully Responsive */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !modalLoading) setModal(null)
          }}
        >
          <section className="w-full max-w-[580px] max-h-[92vh] flex flex-col rounded-lg border border-[#e8ebe6] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0ec] px-4 py-3.5 sm:px-5 sm:py-4">
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
                className="text-[#7e867c] hover:text-[#383f36] p-1"
              >
                <X size={17} />
              </button>
            </div>

            {modal === "import" ? (
              user?.role === "ADMIN" ? (
                <div className="overflow-y-auto flex-1">
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
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#c0392b]">
                  Bulk import is restricted to Administrators only.
                </div>
              )
            ) : (
              <div className="overflow-y-auto flex-1 p-4 sm:p-5">
                {modalError && (
                  <p
                    role="alert"
                    className="mb-3.5 rounded-md border border-[#efd7d3] bg-[#fff7f5] px-3.5 py-2 text-[11px] text-[#9b4a3e]"
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

                <div className="mt-5 flex justify-end gap-2 border-t border-[#edf0ec] pt-3.5">
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

      {/* Meet Our Team Add / Edit Modal */}
      {teamModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !photoUploading) setTeamModal(null)
          }}
        >
          <section className="w-full max-w-[520px] max-h-[92vh] flex flex-col rounded-lg border border-[#e8ebe6] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0ec] px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#252c23]">
                  {teamModal === "add" ? "Add Team Member" : "Edit Team Member"}
                </h2>
                <p className="mt-0.5 text-[11px] text-[#81897f]">
                  Upload member photograph to Neon Object Storage bucket and provide their designation.
                </p>
              </div>
              <button
                disabled={photoUploading}
                aria-label="Close"
                onClick={() => setTeamModal(null)}
                className="text-[#7e867c] hover:text-[#383f36] p-1"
              >
                <X size={17} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-3.5">
              {/* Photo Section with Neon Object Storage Upload */}
              <div>
                <label className="block text-[11px] font-medium text-[#535b50] mb-1.5">
                  Member Photograph *
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative size-20 rounded-lg overflow-hidden border border-[#dce2da] bg-[#f4f7f4] flex items-center justify-center shrink-0">
                    {teamDraft.photoUrl ? (
                      <img
                        src={teamDraft.photoUrl}
                        alt={teamDraft.name || "Preview"}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Users className="size-8 text-[#98a396]" />
                    )}
                    {photoUploading && (
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-white">
                        <Loader2 size={18} className="animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#c9d4c9] bg-[#f4f7f3] px-3 py-1.5 text-[11px] font-medium text-[#205c3c] hover:bg-[#eaf1eb] transition">
                      <Upload size={13} />
                      <span>{photoUploading ? "Uploading to Neon Storage..." : "Upload Photo to Neon Storage"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={photoUploading}
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-[#838b81]">
                      Stored securely in Neon Object Storage bucket <code className="bg-[#f0f3ee] px-1 py-0.5 rounded text-[#285c3b]">uploads</code>.
                    </p>
                    <input
                      type="url"
                      value={teamDraft.photoUrl}
                      onChange={(e) => setTeamDraft({ ...teamDraft, photoUrl: e.target.value })}
                      placeholder="Or enter public photo URL"
                      className={`${cnInput} text-[11px]`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full Name *">
                  <input
                    value={teamDraft.name}
                    onChange={(e) => setTeamDraft({ ...teamDraft, name: e.target.value })}
                    className={cnInput}
                    placeholder="e.g. Anil Sachidanand"
                  />
                </Field>
                <Field label="Designation *">
                  <input
                    value={teamDraft.designation}
                    onChange={(e) => setTeamDraft({ ...teamDraft, designation: e.target.value })}
                    className={cnInput}
                    placeholder="e.g. Managing Director & CEO"
                  />
                </Field>
                <Field label="Department">
                  <input
                    value={teamDraft.department}
                    onChange={(e) => setTeamDraft({ ...teamDraft, department: e.target.value })}
                    className={cnInput}
                    placeholder="Leadership, Credit, Ops..."
                  />
                </Field>
                <Field label="Display Order">
                  <input
                    type="number"
                    value={teamDraft.order}
                    onChange={(e) => setTeamDraft({ ...teamDraft, order: parseInt(e.target.value) || 0 })}
                    className={cnInput}
                    placeholder="1, 2, 3..."
                  />
                </Field>
              </div>

              <Field label="Bio / Professional Summary (optional)">
                <textarea
                  value={teamDraft.bio}
                  onChange={(e) => setTeamDraft({ ...teamDraft, bio: e.target.value })}
                  rows={2}
                  className={`${cnInput} h-auto resize-y py-2 leading-5 font-sans`}
                  placeholder="Key background, tenure, or strategic focus at India Shelter..."
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#edf0ec] px-4 py-3 sm:px-5">
              <button
                onClick={() => setTeamModal(null)}
                className="h-8 rounded-md border border-[#e2e7e0] px-3 text-[11px] font-medium text-[#525a50]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTeamMember}
                disabled={photoUploading}
                className="flex h-8 items-center gap-1.5 rounded-md bg-[#205c3c] px-4 text-[11px] font-medium text-white shadow-xs hover:bg-[#174b30] disabled:opacity-50"
              >
                Save Team Member
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Staff Member Add / Edit Modal */}
      {staffModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !staffSubmitting) setStaffModal(null)
          }}
        >
          <section className="w-full max-w-[500px] max-h-[92vh] flex flex-col rounded-lg border border-[#e8ebe6] bg-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#edf0ec] px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#252c23]">
                  {staffModal === "add" ? "Add New Staff Member" : "Edit Staff Account"}
                </h2>
                <p className="mt-0.5 text-[11px] text-[#81897f]">
                  {staffModal === "add"
                    ? "Register an employee account, assign their access role, and set initial credentials."
                    : "Update employee details, corporate email, and role privileges."}
                </p>
              </div>
              <button
                disabled={staffSubmitting}
                aria-label="Close"
                onClick={() => setStaffModal(null)}
                className="text-[#7e867c] hover:text-[#383f36] p-1"
              >
                <X size={17} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full Name *">
                  <input
                    value={staffDraft.name}
                    onChange={(e) => setStaffDraft({ ...staffDraft, name: e.target.value })}
                    className={cnInput}
                    placeholder="e.g. Rahul Sharma"
                  />
                </Field>
                <Field label="Employee ID *">
                  <input
                    value={staffDraft.employeeId}
                    onChange={(e) => setStaffDraft({ ...staffDraft, employeeId: e.target.value.toUpperCase() })}
                    disabled={staffModal === "edit"}
                    className={`${cnInput} uppercase ${staffModal === "edit" ? "bg-[#f5f6f4] opacity-75" : ""}`}
                    placeholder="e.g. IS-EMP-003"
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Corporate Email *">
                  <input
                    type="email"
                    value={staffDraft.email}
                    onChange={(e) => setStaffDraft({ ...staffDraft, email: e.target.value })}
                    className={cnInput}
                    placeholder="e.g. rahul@indianshelter.com"
                  />
                </Field>
                <Field label="Access Role *">
                  <select
                    value={staffDraft.role}
                    onChange={(e) => setStaffDraft({ ...staffDraft, role: e.target.value as "ADMIN" | "EMPLOYEE" })}
                    className={cnInput}
                  >
                    <option value="EMPLOYEE">Employee (Standard Access)</option>
                    <option value="ADMIN">Administrator (Full Access)</option>
                  </select>
                </Field>
              </div>

              {staffModal === "add" ? (
                <div className="rounded-md border border-[#e4ebe4] bg-[#f8faf8] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#255c3a] flex items-center gap-1.5">
                      <Lock size={12} /> Set Initial Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-[#48634e] hover:text-[#205c3c] flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={staffDraft.password}
                    onChange={(e) => setStaffDraft({ ...staffDraft, password: e.target.value })}
                    className={cnInput}
                    placeholder="Minimum 6 characters (e.g. Shelter@2026)"
                  />
                  <p className="text-[10px] text-[#6d796b] leading-tight">
                    The employee can immediately log in with their Employee ID and this password. They can change it later from Settings, or an Admin can reset it at any time.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#2d362c]">Account Status</p>
                    <p className="text-[10px] text-[#81897f]">
                      {staffDraft.isActive ? "Active employee can log in to workspace" : "Deactivated employee cannot log in"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStaffDraft({ ...staffDraft, isActive: !staffDraft.isActive })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      staffDraft.isActive ? "bg-[#205c3c]" : "bg-[#c8cfc7]"
                    }`}
                  >
                    <span
                      className={`inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        staffDraft.isActive ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#edf0ec] px-4 py-3 sm:px-5">
              <button
                disabled={staffSubmitting}
                onClick={() => setStaffModal(null)}
                className="h-8 rounded-md border border-[#e2e7e0] px-3 text-[11px] font-medium text-[#525a50] hover:bg-[#fafbf9]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStaff}
                disabled={staffSubmitting}
                className="flex h-8 items-center gap-1.5 rounded-md bg-[#205c3c] px-4 text-[11px] font-medium text-white shadow-xs hover:bg-[#174b30] disabled:opacity-50"
              >
                {staffSubmitting && <Loader2 size={12} className="animate-spin" />}
                <span>{staffModal === "add" ? "Register Staff Member" : "Save Changes"}</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Admin Change Staff Password Modal */}
      {passwordStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !staffSubmitting) setPasswordStaff(null)
          }}
        >
          <section className="w-full max-w-[440px] flex flex-col rounded-lg border border-[#e8ebe6] bg-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#edf0ec] px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#252c23] flex items-center gap-1.5">
                  <Key size={16} className="text-[#205c3c]" /> Change Staff Password
                </h2>
                <p className="mt-0.5 text-[11px] text-[#81897f]">
                  Reset credentials for <strong className="text-[#252c23]">{passwordStaff.name}</strong> ({passwordStaff.employeeId})
                </p>
              </div>
              <button
                disabled={staffSubmitting}
                aria-label="Close"
                onClick={() => setPasswordStaff(null)}
                className="text-[#7e867c] hover:text-[#383f36] p-1"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5">
              <div className="rounded-md border border-[#eef3ee] bg-[#f8faf8] p-3 text-[11px] text-[#4f5c4d] space-y-1">
                <p className="font-semibold text-[#1e5837] flex items-center gap-1">
                  <ShieldCheck size={13} /> Administrator Credential Override
                </p>
                <p className="text-[10px] text-[#6b776a] leading-relaxed">
                  As an Administrator, you can update this staff member's password directly. Their previous password is not required.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-[#535b50]">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-[#48634e] hover:text-[#205c3c] flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordDraft.newPassword}
                  onChange={(e) => setPasswordDraft({ ...passwordDraft, newPassword: e.target.value })}
                  className={cnInput}
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#535b50] mb-1">
                  Confirm New Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordDraft.confirmPassword}
                  onChange={(e) => setPasswordDraft({ ...passwordDraft, confirmPassword: e.target.value })}
                  className={cnInput}
                  placeholder="Re-type new password"
                />
                {passwordDraft.confirmPassword && passwordDraft.newPassword !== passwordDraft.confirmPassword && (
                  <p className="mt-1 text-[10px] text-[#c0392b]">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#edf0ec] px-4 py-3 sm:px-5">
              <button
                disabled={staffSubmitting}
                onClick={() => setPasswordStaff(null)}
                className="h-8 rounded-md border border-[#e2e7e0] px-3 text-[11px] font-medium text-[#525a50] hover:bg-[#fafbf9]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStaffPassword}
                disabled={staffSubmitting || !passwordDraft.newPassword || passwordDraft.newPassword !== passwordDraft.confirmPassword}
                className="flex h-8 items-center gap-1.5 rounded-md bg-[#205c3c] px-4 text-[11px] font-medium text-white shadow-xs hover:bg-[#174b30] disabled:opacity-50"
              >
                {staffSubmitting && <Loader2 size={12} className="animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Policy & PMAY Add / Edit Link Modal */}
      {linkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !linkSubmitting) setLinkModal(null)
          }}
        >
          <section className="w-full max-w-[500px] flex flex-col rounded-lg border border-[#e8ebe6] bg-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#edf0ec] px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#252c23] flex items-center gap-2">
                  {linkModal === "POLICY" ? <BookOpen size={16} className="text-[#205c3c]" /> : <Landmark size={16} className="text-[#205c3c]" />}
                  {linkDraft.id ? `Edit ${linkModal === "POLICY" ? "Policy" : "PMAY"} Link` : `Add ${linkModal === "POLICY" ? "Policy" : "PMAY"} Link`}
                </h2>
                <p className="mt-0.5 text-[11px] text-[#81897f]">
                  {linkModal === "POLICY"
                    ? "Set the official policy document name and target URL."
                    : "Add a PMAY resource link. It will appear as a sub-tab in the sidebar."}
                </p>
              </div>
              <button
                disabled={linkSubmitting}
                aria-label="Close"
                onClick={() => setLinkModal(null)}
                className="text-[#7e867c] hover:text-[#383f36] p-1"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5">
              <Field label="Resource Name / Title *">
                <input
                  value={linkDraft.title}
                  onChange={(e) => setLinkDraft({ ...linkDraft, title: e.target.value })}
                  className={cnInput}
                  placeholder={linkModal === "POLICY" ? "e.g. Credit & Underwriting Policy 2026" : "e.g. PMAY CLSS Subsidy Tracking"}
                />
              </Field>

              <Field label="Target URL / Web Link *">
                <input
                  type="url"
                  value={linkDraft.url}
                  onChange={(e) => setLinkDraft({ ...linkDraft, url: e.target.value })}
                  className={cnInput}
                  placeholder="e.g. https://indianshelter.in/policies/credit.pdf or https://pmayuclap.gov.in/"
                />
              </Field>

              <Field label="Description (optional)">
                <input
                  value={linkDraft.description}
                  onChange={(e) => setLinkDraft({ ...linkDraft, description: e.target.value })}
                  className={cnInput}
                  placeholder="Short note or summary of this resource..."
                />
              </Field>

              <Field label="Display Order">
                <input
                  type="number"
                  value={linkDraft.order}
                  onChange={(e) => setLinkDraft({ ...linkDraft, order: parseInt(e.target.value) || 0 })}
                  className={cnInput}
                  placeholder="0, 1, 2..."
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#edf0ec] px-4 py-3 sm:px-5">
              <button
                disabled={linkSubmitting}
                onClick={() => setLinkModal(null)}
                className="h-8 rounded-md border border-[#e2e7e0] px-3 text-[11px] font-medium text-[#525a50] hover:bg-[#fafbf9]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLink}
                disabled={linkSubmitting || !linkDraft.title.trim() || !linkDraft.url.trim()}
                className="flex h-8 items-center gap-1.5 rounded-md bg-[#205c3c] px-4 text-[11px] font-medium text-white shadow-xs hover:bg-[#174b30] disabled:opacity-50"
              >
                {linkSubmitting && <Loader2 size={12} className="animate-spin" />}
                <span>Save Link</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[60] flex items-center gap-2 rounded-md bg-[#263a2c] px-3.5 py-2.5 sm:px-4 sm:py-3 text-[12px] text-white shadow-xl animate-in fade-in duration-200"
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
    <div className="rounded-lg border border-[#e6eae4] bg-white p-3 sm:px-4 sm:py-3.5 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] sm:text-[11px] font-medium text-[#727b70] truncate">{label}</p>
        <Icon size={14} className="text-[#8d9a8b] shrink-0" />
      </div>
      <p className="mt-1.5 text-[20px] sm:text-[23px] font-semibold tracking-[-.04em] text-[#242b23]">{value}</p>
      <p className="mt-0.5 text-[9px] sm:text-[10px] text-[#9aa096] truncate">{note}</p>
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
  datalistId,
}: {
  label: string
  value: string
  placeholder?: string
  onChange: (v: string) => void
  select?: boolean
  options?: string[]
  type?: "text" | "date"
  datalistId?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium text-[#6b7469]">{label}</span>
      {datalistId ? (
        <>
          <input
            list={datalistId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cnInput}
          />
          <datalist id={datalistId}>
            {options.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </>
      ) : select ? (
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
      <p className="mt-0.5 text-[12px] font-medium text-[#3f483d] break-words">{value}</p>
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
      <div className="mb-5 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] sm:text-[11px] text-[#7e877c]">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h2 className="text-[20px] sm:text-[23px] font-semibold tracking-[-.035em]">
            Welcome, {user?.role === "ADMIN" ? "Ayush" : "Team"}
          </h2>
          <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#7b8379]">
            Live dashboard of India Shelter communication templates and distribution frequencies.
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              onClick={onImport}
              className="flex h-9 items-center justify-center gap-2 rounded-md border border-[#dfe4dd] bg-white px-3 text-[12px] font-medium text-[#444c42] hover:bg-[#f9faf8]"
            >
              <Upload size={14} /> Import Excel
            </button>
            <button
              onClick={onAdd}
              className="flex h-9 items-center justify-center gap-2 rounded-md bg-[#205c3c] px-3.5 text-[12px] font-medium text-white shadow-xs hover:bg-[#174b30]"
            >
              <Plus size={15} /> Add template
            </button>
          </div>
        )}
      </div>

      <div className="mb-5 sm:mb-6 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {[
          { label: "Total templates", value: stats.totalTemplates, icon: Files, note: "In PostgreSQL" },
          { label: "Active templates", value: stats.activeTemplates, icon: Check, note: "Ready to broadcast" },
          { label: "Adhoc templates", value: stats.adhocTemplates, icon: CalendarDays, note: "On-demand notices" },
          { label: "With attachments", value: stats.templatesWithAttachments, icon: Paperclip, note: "Supporting URLs" },
        ].map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="rounded-lg border border-[#e6eae4] bg-white p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
            <div className="flex justify-between text-[11px] text-[#727b70]">
              <span className="truncate">{label}</span>
              <Icon size={14} className="text-[#8d9a8b] shrink-0" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-[20px] sm:text-[25px] font-semibold tracking-tight text-[#232922]">{value}</p>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-[#9ba197] truncate">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        {/* Recently Updated Templates Table / Cards */}
        <section className="overflow-hidden rounded-lg border border-[#e5e9e3] bg-white shadow-[0_1px_2px_rgba(20,32,20,.02)]">
          <div className="flex items-center justify-between border-b border-[#edf0ec] px-4 py-3.5 sm:px-5 sm:py-4">
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

          {/* Mobile recent items */}
          <div className="block sm:hidden divide-y divide-[#edf0ec]">
            {recentTemplates.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-[#8c9389]">No templates found.</div>
            ) : (
              recentTemplates.map((t) => (
                <div key={t.id} className="p-3 hover:bg-[#fafbf9]">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onView(t)}
                      className="text-left text-xs font-semibold text-[#272e25] truncate"
                    >
                      {t.name}
                    </button>
                    <Remark value={t.remarks || (t.isActive ? "Active" : "Inactive")} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#858f83]">
                    <span className="font-mono">{t.dltTemplateId}</span>
                    <span>{t.dueDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop recent items */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[580px] text-left">
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
              Open customer communications →
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
      <div className="mb-4 sm:mb-6">
        <p className="mb-1 text-[11px] text-[#7e877c]">Workspace / Audit Trail</p>
        <h2 className="text-[20px] sm:text-[23px] font-semibold tracking-[-.035em]">Activity & Logs</h2>
        <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#7b8379]">
          Audit log of template registrations, updates, and spreadsheet imports.
        </p>
      </div>
      <section className="overflow-hidden rounded-lg border border-[#e5e9e3] bg-white shadow-[0_1px_2px_rgba(20,32,20,.02)]">
        <div className="flex items-center justify-between border-b border-[#edf0ec] px-4 py-3.5 sm:px-5 sm:py-4">
          <div>
            <h3 className="text-[13px] font-semibold text-[#242b23]">Recent Audit Events</h3>
            <p className="mt-0.5 text-[10px] text-[#8c9389]">Recorded across database operations</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-[#fafbf9] text-[10px] uppercase tracking-wide text-[#899187]">
              <tr>
                <th className="px-4 sm:px-5 py-3">Event</th>
                <th className="px-3 sm:px-4 py-3">Template Name</th>
                <th className="px-3 sm:px-4 py-3">DLT ID</th>
                <th className="px-3 sm:px-4 py-3">Owner</th>
                <th className="px-3 sm:px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {templates.slice(0, 10).map((t, i) => (
                <tr key={t.id} className="border-t border-[#f0f2ef] hover:bg-[#fafbf9]">
                  <td className="px-4 sm:px-5 py-3">
                    <span className="flex items-center gap-2 text-[11px]">
                      <span
                        className={`size-1.5 rounded-full ${
                          i === 0 ? "bg-[#3e8a52]" : i === 1 ? "bg-[#3e688a]" : "bg-[#8a723e]"
                        }`}
                      />
                      {i === 0 ? "Template modified" : i % 2 === 0 ? "Record updated" : "Batch verified"}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-[11px] font-medium text-[#2d342c] truncate max-w-[180px]">{t.name}</td>
                  <td className="px-3 sm:px-4 py-3 font-mono text-[10px] text-[#687a69]">{t.dltTemplateId}</td>
                  <td className="px-3 sm:px-4 py-3 text-[11px] text-[#555d53]">{t.ownerName}</td>
                  <td className="px-3 sm:px-4 py-3 text-[10px] text-[#727b70]">
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

function SettingsView({
  user,
  onLogout,
  policyLinks,
  pmayLinks,
  onAddPolicy,
  onEditPolicy,
  onDeletePolicy,
  onAddPmay,
  onEditPmay,
  onDeletePmay,
}: {
  user: User | null
  onLogout: () => void
  policyLinks: ResourceLink[]
  pmayLinks: ResourceLink[]
  onAddPolicy: () => void
  onEditPolicy: (link: ResourceLink) => void
  onDeletePolicy: (id: string, name: string) => void
  onAddPmay: () => void
  onEditPmay: (link: ResourceLink) => void
  onDeletePmay: (id: string, name: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* 1. Employee Profile Card */}
      <div className="rounded-lg border border-[#e5e9e3] bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
        <div className="flex items-center justify-between pb-4 border-b border-[#edf0ec]">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#222920]">Employee Profile & Settings</h2>
            <p className="mt-0.5 text-xs text-[#737b71]">
              Authenticated credentials and role-based permissions for India Shelter Workspace.
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-md border border-[#eed0cc] bg-[#fff8f7] px-3.5 py-1.5 text-xs font-medium text-[#a1483c] hover:bg-[#fae8e6] transition"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3">
            <p className="text-[10px] text-[#8b9389]">Employee Name</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-[#293127] truncate">{user?.name || "—"}</p>
          </div>
          <div className="rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3">
            <p className="text-[10px] text-[#8b9389]">Role & Permissions</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-[#293127]">
              {user?.role === "ADMIN" ? "Administrator" : "Employee"}
            </p>
          </div>
          <div className="rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3">
            <p className="text-[10px] text-[#8b9389]">Employee ID</p>
            <p className="mt-1 font-mono text-xs sm:text-sm font-semibold text-[#293127]">{user?.employeeId || "—"}</p>
          </div>
          <div className="rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3">
            <p className="text-[10px] text-[#8b9389]">Corporate Email</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-[#293127] truncate">{user?.email || "—"}</p>
          </div>
        </div>
      </div>

      {/* 2. Policies Configuration Section */}
      <div className="rounded-lg border border-[#e5e9e3] bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#edf0ec]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-[#edf5ee] text-[#1e5837]">
                <BookOpen size={15} />
              </span>
              <h3 className="text-base font-semibold text-[#222920]">Policy Configuration</h3>
            </div>
            <p className="mt-1 text-xs text-[#737b71]">
              Manage company policy documents and web links. Appears directly under Customer Communications in the sidebar.
            </p>
          </div>
          <button
            onClick={onAddPolicy}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#205c3c] px-3 text-xs font-medium text-white shadow-xs hover:bg-[#174b30] transition shrink-0"
          >
            <Plus size={13} /> Add Policy Link
          </button>
        </div>

        {policyLinks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#828d80]">
            <p>No policy links configured yet.</p>
            <button
              onClick={onAddPolicy}
              className="mt-2 text-xs font-semibold text-[#205c3c] hover:underline"
            >
              + Click here to add your first policy link
            </button>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-[#fafbf9] text-[10px] uppercase tracking-wide text-[#899187] border-b border-[#edf0ec]">
                <tr>
                  <th className="px-4 py-2.5">Policy Name</th>
                  <th className="px-3 py-2.5">Target Web Link</th>
                  <th className="px-3 py-2.5">Description</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2ef]">
                {policyLinks.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fafbf9] transition">
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-[#222920]">{p.title}</p>
                    </td>
                    <td className="px-3 py-3">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#255e39] hover:underline max-w-[280px] truncate"
                      >
                        <Globe size={11} className="shrink-0" />
                        <span className="truncate">{p.url}</span>
                      </a>
                    </td>
                    <td className="px-3 py-3 text-xs text-[#6e776d] max-w-[200px] truncate">
                      {p.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 items-center gap-1 rounded border border-[#dfe5de] bg-white px-2 text-[10px] font-medium text-[#4b5449] hover:bg-[#f6f8f5]"
                        >
                          <ExternalLink size={11} /> Open
                        </a>
                        <button
                          onClick={() => onEditPolicy(p)}
                          className="inline-flex h-7 items-center gap-1 rounded border border-[#dfe5de] bg-white px-2 text-[10px] font-medium text-[#4b5449] hover:bg-[#f6f8f5]"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => onDeletePolicy(p.id, p.title)}
                          className="inline-flex h-7 items-center gap-1 rounded border border-[#eed0cc] bg-[#fff8f7] px-2 text-[10px] font-medium text-[#a1483c] hover:bg-[#fae8e6]"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. PMAY Configuration Section */}
      <div className="rounded-lg border border-[#e5e9e3] bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#edf0ec]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-[#edf5ee] text-[#1e5837]">
                <Landmark size={15} />
              </span>
              <h3 className="text-base font-semibold text-[#222920]">PMAY Configuration</h3>
            </div>
            <p className="mt-1 text-xs text-[#737b71]">
              Add any number of PMAY portal links and schemes. Each entry appears as an expandable sub-tab under PMAY in the sidebar.
            </p>
          </div>
          <button
            onClick={onAddPmay}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#205c3c] px-3 text-xs font-medium text-white shadow-xs hover:bg-[#174b30] transition shrink-0"
          >
            <Plus size={13} /> Add PMAY Link
          </button>
        </div>

        {pmayLinks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#828d80]">
            <p>No PMAY sub-links configured yet.</p>
            <button
              onClick={onAddPmay}
              className="mt-2 text-xs font-semibold text-[#205c3c] hover:underline"
            >
              + Click here to add your first PMAY sub-link
            </button>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-[#fafbf9] text-[10px] uppercase tracking-wide text-[#899187] border-b border-[#edf0ec]">
                <tr>
                  <th className="px-4 py-2.5">Sub-Tab Name</th>
                  <th className="px-3 py-2.5">Target Web Link</th>
                  <th className="px-3 py-2.5">Order</th>
                  <th className="px-3 py-2.5">Description</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2ef]">
                {pmayLinks.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fafbf9] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-[#205c3c]" />
                        <p className="text-xs font-semibold text-[#222920]">{item.title}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#255e39] hover:underline max-w-[280px] truncate"
                      >
                        <Globe size={11} className="shrink-0" />
                        <span className="truncate">{item.url}</span>
                      </a>
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-[#5b645a]">
                      {item.order}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#6e776d] max-w-[180px] truncate">
                      {item.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 items-center gap-1 rounded border border-[#dfe5de] bg-white px-2 text-[10px] font-medium text-[#4b5449] hover:bg-[#f6f8f5]"
                        >
                          <ExternalLink size={11} /> Open
                        </a>
                        <button
                          onClick={() => onEditPmay(item)}
                          className="inline-flex h-7 items-center gap-1 rounded border border-[#dfe5de] bg-white px-2 text-[10px] font-medium text-[#4b5449] hover:bg-[#f6f8f5]"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => onDeletePmay(item.id, item.title)}
                          className="inline-flex h-7 items-center gap-1 rounded border border-[#eed0cc] bg-[#fff8f7] px-2 text-[10px] font-medium text-[#a1483c] hover:bg-[#fae8e6]"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PoliciesView({
  policyLinks,
  onGoToSettings,
}: {
  policyLinks: ResourceLink[]
  onGoToSettings: () => void
}) {
  const primaryPolicy = policyLinks[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#7e877c]">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-[#435044]">Policies & Guidelines</span>
          </div>
          <h2 className="text-[20px] sm:text-[23px] font-semibold tracking-[-.035em] text-[#1f261e]">
            Company Policies
          </h2>
          <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#7b8379]">
            Official India Shelter lending policies, operating guidelines, and regulatory frameworks.
          </p>
        </div>
        <button
          onClick={onGoToSettings}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dfe4dd] bg-white px-3 text-xs font-medium text-[#465044] hover:bg-[#fafbf9]"
        >
          <Settings2 size={13} /> Manage in Settings
        </button>
      </div>

      {policyLinks.length === 0 ? (
        <div className="rounded-lg border border-[#e5e9e3] bg-white p-12 text-center shadow-[0_1px_2px_rgba(20,32,20,.02)]">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#f0f4f0] text-[#2c5f3e]">
            <BookOpen size={22} />
          </div>
          <h3 className="text-sm font-semibold text-[#222920]">No Policy Link Configured Yet</h3>
          <p className="mt-1 text-xs text-[#737b71] max-w-sm mx-auto">
            You can add the official policy document name and URL from the Settings page. It will be immediately accessible here.
          </p>
          <button
            onClick={onGoToSettings}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#205c3c] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#174b30]"
          >
            <Plus size={13} /> Add Policy in Settings
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Main Active Policy Card */}
          <div className="rounded-lg border border-[#dbe4dc] bg-gradient-to-br from-white via-[#fcfdfb] to-[#f6f9f6] p-5 sm:p-6 shadow-[0_2px_4px_rgba(20,35,20,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#edf6ef] border border-[#cfdfd1] px-2.5 py-0.5 text-[11px] font-semibold text-[#1e5836]">
                  <BookOpen size={12} /> Active Policy Document
                </span>
                <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#1a2e20]">
                  {primaryPolicy.title}
                </h3>
                {primaryPolicy.description && (
                  <p className="mt-1 text-xs text-[#5e695d] max-w-2xl leading-relaxed">
                    {primaryPolicy.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#436449] break-all bg-[#f0f4ef] px-3 py-1.5 rounded-md border border-[#e1e9e0] w-fit">
                  <Globe size={13} className="shrink-0 text-[#255e39]" />
                  <a
                    href={primaryPolicy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate max-w-[400px]"
                  >
                    {primaryPolicy.url}
                  </a>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <a
                  href={primaryPolicy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#205c3c] px-4 text-xs font-medium text-white shadow-xs hover:bg-[#174b30] transition"
                >
                  <ExternalLink size={14} /> Open Policy Document
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(primaryPolicy.url)
                    alert("Policy URL copied to clipboard!")
                  }}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#dfe4dd] bg-white px-3 text-xs font-medium text-[#465044] hover:bg-[#f6f8f5] transition"
                >
                  <Copy size={13} /> Copy Link
                </button>
              </div>
            </div>

            {/* Embedded Policy Viewer / Preview Container */}
            <div className="mt-6 border-t border-[#e8efe8] pt-5">
              <p className="text-[11px] font-medium text-[#6c786a] mb-2 flex items-center justify-between">
                <span>Embedded Policy Viewer</span>
                <span className="text-[10px] text-[#8e988c]">If blocked by browser security, use "Open Policy Document"</span>
              </p>
              <div className="w-full h-[620px] rounded-lg border border-[#d8e2d8] overflow-hidden bg-white shadow-inner relative">
                <iframe
                  src={primaryPolicy.url}
                  title={primaryPolicy.title}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </div>
          </div>

          {/* If there are additional policies, list them */}
          {policyLinks.length > 1 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#798578] mb-3">
                All Configured Policies ({policyLinks.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {policyLinks.slice(1).map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-[#e5e9e3] bg-white p-4 hover:border-[#205c3c] transition shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <h5 className="font-semibold text-sm text-[#1e261d]">{p.title}</h5>
                      {p.description && <p className="text-xs text-[#6a7469] mt-1">{p.description}</p>}
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#f0f3ee]">
                      <span className="text-[11px] font-mono text-[#6d776c] truncate max-w-[200px]">
                        {p.url}
                      </span>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#205c3c] hover:underline"
                      >
                        Open <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PmayView({
  pmayLinks,
  selectedPmayId,
  onSelectPmay,
  onGoToSettings,
}: {
  pmayLinks: ResourceLink[]
  selectedPmayId: string | null
  onSelectPmay: (id: string) => void
  onGoToSettings: () => void
}) {
  const activeLink = pmayLinks.find((l) => l.id === selectedPmayId) || pmayLinks[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#7e877c]">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-[#435044]">Government Schemes</span>
          </div>
          <h2 className="text-[20px] sm:text-[23px] font-semibold tracking-[-.035em] text-[#1f261e]">
            Pradhan Mantri Awas Yojana (PMAY)
          </h2>
          <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#7b8379]">
            Access Ministry of Housing and Urban Affairs (MoHUA) portals, CLSS subsidy verification, and MIS dashboards.
          </p>
        </div>
        <button
          onClick={onGoToSettings}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dfe4dd] bg-white px-3 text-xs font-medium text-[#465044] hover:bg-[#fafbf9]"
        >
          <Settings2 size={13} /> Manage in Settings
        </button>
      </div>

      {pmayLinks.length === 0 ? (
        <div className="rounded-lg border border-[#e5e9e3] bg-white p-12 text-center shadow-[0_1px_2px_rgba(20,32,20,.02)]">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#f0f4f0] text-[#2c5f3e]">
            <Landmark size={22} />
          </div>
          <h3 className="text-sm font-semibold text-[#222920]">No PMAY Links Added Yet</h3>
          <p className="mt-1 text-xs text-[#737b71] max-w-sm mx-auto">
            You can add any number of PMAY portal links (e.g., CLSS Portal, Beneficiary Registry, MIS Reports) in Settings.
            Each one will appear as a sub-tab in the sidebar.
          </p>
          <button
            onClick={onGoToSettings}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#205c3c] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#174b30]"
          >
            <Plus size={13} /> Add PMAY Link in Settings
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Sub-tab horizontal pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#edf0ec]">
            {pmayLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectPmay(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition shrink-0 ${
                  activeLink?.id === item.id
                    ? "bg-[#205c3c] text-white shadow-xs"
                    : "bg-white text-[#525b50] border border-[#dfe4dc] hover:bg-[#f6f8f5]"
                }`}
              >
                <Landmark size={12} />
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          {activeLink && (
            <div className="rounded-lg border border-[#dbe4dc] bg-gradient-to-br from-white via-[#fcfdfb] to-[#f6f9f6] p-5 sm:p-6 shadow-[0_2px_4px_rgba(20,35,20,0.03)]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#edf6ef] border border-[#cfdfd1] px-2.5 py-0.5 text-[11px] font-semibold text-[#1e5836]">
                    <Landmark size={12} /> PMAY Sub-Tab Resource
                  </span>
                  <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#1a2e20]">
                    {activeLink.title}
                  </h3>
                  {activeLink.description && (
                    <p className="mt-1 text-xs text-[#5e695d] max-w-2xl leading-relaxed">
                      {activeLink.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#436449] break-all bg-[#f0f4ef] px-3 py-1.5 rounded-md border border-[#e1e9e0] w-fit">
                    <Globe size={13} className="shrink-0 text-[#255e39]" />
                    <a
                      href={activeLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate max-w-[400px]"
                    >
                      {activeLink.url}
                    </a>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <a
                    href={activeLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#205c3c] px-4 text-xs font-medium text-white shadow-xs hover:bg-[#174b30] transition"
                  >
                    <ExternalLink size={14} /> Open PMAY Portal
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeLink.url)
                      alert("PMAY URL copied to clipboard!")
                    }}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#dfe4dd] bg-white px-3 text-xs font-medium text-[#465044] hover:bg-[#f6f8f5] transition"
                  >
                    <Copy size={13} /> Copy Link
                  </button>
                </div>
              </div>

              {/* Embedded Viewer Container */}
              <div className="mt-6 border-t border-[#e8efe8] pt-5">
                <p className="text-[11px] font-medium text-[#6c786a] mb-2 flex items-center justify-between">
                  <span>Portal Preview & Access Frame</span>
                  <span className="text-[10px] text-[#8e988c]">If the external portal prevents framing, click "Open PMAY Portal" above</span>
                </p>
                <div className="w-full h-[620px] rounded-lg border border-[#d8e2d8] overflow-hidden bg-white shadow-inner relative">
                  <iframe
                    src={activeLink.url}
                    title={activeLink.title}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MeetOurTeamView({
  team,
  loading,
  user,
  onAdd,
  onEdit,
  onDelete,
}: {
  team: TeamMember[]
  loading: boolean
  user: User | null
  onAdd: () => void
  onEdit: (m: TeamMember) => void
  onDelete: (id: string, name: string) => void
}) {
  return (
    <>
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-[11px] text-[#7e877c]">Workspace / Organization Directory</p>
          <h2 className="text-[20px] sm:text-[23px] font-semibold tracking-[-.035em] text-[#1c221b]">
            Meet Our Team
          </h2>
          <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#7b8379]">
            Key leadership and operations team powering India Shelter's nationwide housing finance network.
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <button
            onClick={onAdd}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#205c3c] px-3.5 text-xs font-medium text-white shadow-xs hover:bg-[#174b30] transition"
          >
            <Plus size={14} /> Add Team Member
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="rounded-lg border border-[#e5e9e3] bg-white p-4 shadow-[0_1px_2px_rgba(20,32,20,.02)] animate-pulse"
            >
              <div className="h-52 w-full rounded-md bg-[#eef1ed]" />
              <div className="mt-3.5 h-4 w-3/4 rounded bg-[#eef1ed]" />
              <div className="mt-2 h-3.5 w-1/2 rounded bg-[#eef1ed]" />
              <div className="mt-3 h-12 w-full rounded bg-[#f4f7f4]" />
            </div>
          ))}
        </div>
      ) : team.length === 0 ? (
        <div className="rounded-lg border border-[#e5e9e3] bg-white p-12 text-center shadow-[0_1px_2px_rgba(20,32,20,.02)]">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#f0f4f0] text-[#2c5f3e]">
            <Users size={22} />
          </div>
          <h3 className="text-sm font-semibold text-[#222920]">No Team Members Registered Yet</h3>
          <p className="mt-1 text-xs text-[#737b71] max-w-sm mx-auto">
            Get started by adding leadership and operations members with photos uploaded directly to Neon Object Storage.
          </p>
          {user?.role === "ADMIN" && (
            <button
              onClick={onAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#205c3c] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#174b30]"
            >
              <Plus size={13} /> Add First Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {team.map((member) => (
            <div
              key={member.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-[#e5e9e3] bg-white shadow-[0_1px_2px_rgba(20,32,20,.025)] transition hover:shadow-md hover:border-[#cbd9ce]"
            >
              {/* Member Photo on Top - 100% Full Uncropped View */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gradient-to-b from-[#f3f7f3] via-[#ecf3ec] to-[#e2ebe2] border-b border-[#edf0ec] flex items-center justify-center">
                {member.photoUrl ? (
                  <>
                    <img
                      src={member.photoUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 size-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
                    />
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="relative z-10 max-h-full max-w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = "none"
                      }}
                    />
                  </>
                ) : (
                  <div className="flex size-full items-center justify-center bg-[#eef3ee] text-[#55785c]">
                    <Users size={40} />
                  </div>
                )}
                {member.department && (
                  <span className="absolute top-2.5 left-2.5 z-20 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-[#2c5d3d] shadow-xs border border-[#d6e3d7]">
                    {member.department}
                  </span>
                )}
              </div>

              {/* Details with Designation right under Photo */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-[15px] font-bold text-[#1f261e] leading-snug tracking-tight">
                  {member.name}
                </h3>
                
                {/* Highlighted Designation underneath photo and name */}
                <div className="mt-1">
                  <span className="inline-block rounded-md bg-[#eef6f0] border border-[#d6e7d9] px-2 py-0.5 text-[11px] font-semibold text-[#1e5837]">
                    {member.designation}
                  </span>
                </div>

                {member.bio && (
                  <p className="mt-2.5 text-[11px] text-[#555d52] line-clamp-3 leading-relaxed flex-1">
                    {member.bio}
                  </p>
                )}

                {/* Admin Management Controls */}
                {user?.role === "ADMIN" && (
                  <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-[#f0f3ef] pt-3">
                    <button
                      onClick={() => onEdit(member)}
                      className="inline-flex h-7 items-center gap-1 rounded border border-[#e2e7e0] bg-white px-2.5 text-[10px] font-medium text-[#4e584d] hover:bg-[#f6f8f5] transition"
                    >
                      <Edit3 size={11} /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(member.id, member.name)}
                      className="inline-flex h-7 items-center gap-1 rounded border border-[#eed0cc] bg-[#fff8f7] px-2 text-[10px] font-medium text-[#a1483c] hover:bg-[#fae8e6] transition"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function StaffManagementView({
  staffList,
  loading,
  currentUser,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onAddStaff,
  onEditStaff,
  onChangePassword,
  onToggleStatus,
  onRefresh,
}: {
  staffList: User[]
  loading: boolean
  currentUser: User | null
  search: string
  setSearch: (s: string) => void
  roleFilter: "ALL" | "ADMIN" | "EMPLOYEE"
  setRoleFilter: (r: "ALL" | "ADMIN" | "EMPLOYEE") => void
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE"
  setStatusFilter: (s: "ALL" | "ACTIVE" | "INACTIVE") => void
  onAddStaff: () => void
  onEditStaff: (u: User) => void
  onChangePassword: (u: User) => void
  onToggleStatus: (u: User) => void
  onRefresh: () => void
}) {
  const filtered = staffList.filter((s) => {
    if (roleFilter !== "ALL" && s.role !== roleFilter) return false
    if (statusFilter === "ACTIVE" && !s.isActive) return false
    if (statusFilter === "INACTIVE" && s.isActive) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchName = s.name.toLowerCase().includes(q)
      const matchId = s.employeeId.toLowerCase().includes(q)
      const matchEmail = s.email.toLowerCase().includes(q)
      return matchName || matchId || matchEmail
    }
    return true
  })

  const totalCount = staffList.length
  const adminCount = staffList.filter((s) => s.role === "ADMIN").length
  const activeCount = staffList.filter((s) => s.isActive).length
  const inactiveCount = totalCount - activeCount

  return (
    <>
      {/* Header with Title and Primary Actions */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#cbd9c8] bg-[#f4f8f4] px-2.5 py-0.5 text-[10px] font-semibold text-[#1e5836]">
              <ShieldCheck size={11} /> Admin Only
            </span>
            <p className="text-[11px] text-[#7e877c]">Workspace / Staff Directory</p>
          </div>
          <h2 className="mt-1 text-[20px] sm:text-[23px] font-semibold tracking-[-.035em] text-[#1c221b]">
            Staff & Employee Accounts
          </h2>
          <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#7b8379]">
            Add employee credentials, set initial passwords, and change or reset login access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            aria-label="Refresh Staff"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#e2e7e0] bg-white px-2.5 text-xs text-[#525a50] hover:bg-[#fafbf9]"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={onAddStaff}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#205c3c] px-3.5 text-xs font-medium text-white shadow-xs hover:bg-[#174b30] transition"
          >
            <UserPlus size={14} /> Add New Staff
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-lg border border-[#e5e9e3] bg-white p-3.5 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b9389]">Total Staff</p>
          <p className="mt-1 text-xl font-bold text-[#1f261e]">{totalCount}</p>
          <p className="mt-0.5 text-[10px] text-[#737b71]">Registered accounts</p>
        </div>
        <div className="rounded-lg border border-[#e5e9e3] bg-white p-3.5 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b9389]">Administrators</p>
          <p className="mt-1 text-xl font-bold text-[#1f261e]">{adminCount}</p>
          <p className="mt-0.5 text-[10px] text-[#737b71]">Full access rights</p>
        </div>
        <div className="rounded-lg border border-[#e5e9e3] bg-white p-3.5 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b9389]">Active Accounts</p>
          <p className="mt-1 text-xl font-bold text-[#205c3c]">{activeCount}</p>
          <p className="mt-0.5 text-[10px] text-[#737b71]">Can log in & edit</p>
        </div>
        <div className="rounded-lg border border-[#e5e9e3] bg-white p-3.5 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b9389]">Deactivated</p>
          <p className="mt-1 text-xl font-bold text-[#899187]">{inactiveCount}</p>
          <p className="mt-0.5 text-[10px] text-[#737b71]">Access suspended</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#e5e9e3] bg-white p-3 shadow-[0_1px_2px_rgba(20,32,20,.02)]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91998f]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by Name, Employee ID, or Email..."
            className="h-8 w-full rounded-md border border-[#e5e7eb] bg-[#fafbf9] pl-8 pr-3 text-[12px] text-[#242923] outline-none transition placeholder:text-[#a2a69f] focus:border-[#78927d] focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "ALL" | "ADMIN" | "EMPLOYEE")}
            className="h-8 rounded-md border border-[#e5e7eb] bg-white px-2.5 text-[11px] text-[#4b5449] outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="EMPLOYEE">Employees</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
            className="h-8 rounded-md border border-[#e5e7eb] bg-white px-2.5 text-[11px] text-[#4b5449] outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-lg border border-[#e5e9e3] bg-white shadow-[0_1px_2px_rgba(20,32,20,.02)]">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#737b71]">
            <Loader2 size={22} className="mx-auto mb-2 animate-spin text-[#205c3c]" />
            Loading staff directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserX size={32} className="mx-auto text-[#9fa89d] mb-2" />
            <h3 className="text-sm font-semibold text-[#222920]">No Staff Members Found</h3>
            <p className="mt-1 text-xs text-[#737b71]">
              {search || roleFilter !== "ALL" || statusFilter !== "ALL"
                ? "Try adjusting your filters or search terms."
                : "Get started by adding your first employee."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#fafbf9] text-[10px] uppercase tracking-wide text-[#899187] border-b border-[#edf0ec]">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-3 py-3">Employee ID</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Templates</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2ef]">
                {filtered.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#fafbf9] transition">
                    {/* Staff Member (Avatar + Name + Email) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eef4ee] text-[11px] font-bold text-[#205c3c]">
                          {staff.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[#1f261e] truncate">{staff.name}</p>
                          <p className="text-[11px] text-[#788275] truncate">{staff.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-[11px] font-medium text-[#2d362c] bg-[#f2f5f2] px-2 py-0.5 rounded border border-[#dfe5df]">
                        {staff.employeeId}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-3 py-3">
                      {staff.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#edf6ef] border border-[#cfdfd1] px-2 py-0.5 text-[10px] font-semibold text-[#1e5836]">
                          <ShieldCheck size={11} /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-[#f4f5f3] border border-[#e2e5e1] px-2 py-0.5 text-[10px] font-medium text-[#5c645a]">
                          Employee
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          staff.isActive
                            ? "bg-[#edf7ee] text-[#24693b]"
                            : "bg-[#f5f5f4] text-[#787877]"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            staff.isActive ? "bg-[#2ea043]" : "bg-[#8c918a]"
                          }`}
                        />
                        {staff.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>

                    {/* Templates Count */}
                    <td className="px-3 py-3 text-[11px] text-[#555d52]">
                      {staff._count?.createdTemplates || 0}
                    </td>

                    {/* Created Date */}
                    <td className="px-3 py-3 text-[10px] text-[#788275]">
                      {staff.createdAt
                        ? new Date(staff.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Change Password Button */}
                        <button
                          onClick={() => onChangePassword(staff)}
                          title="Change / Reset Password"
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-[#d6e2d8] bg-[#f8faf8] px-2 text-[10px] font-medium text-[#1e5836] hover:bg-[#eef5ee] transition"
                        >
                          <Key size={11} />
                          <span>Change Password</span>
                        </button>

                        {/* Edit Staff Button */}
                        <button
                          onClick={() => onEditStaff(staff)}
                          title="Edit Details"
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-[#e2e7e0] bg-white px-2 text-[10px] font-medium text-[#4e584d] hover:bg-[#f6f8f5] transition"
                        >
                          <Edit3 size={11} />
                          <span>Edit</span>
                        </button>

                        {/* Deactivate / Activate Button */}
                        {staff.id !== currentUser?.id && (
                          <button
                            onClick={() => onToggleStatus(staff)}
                            title={staff.isActive ? "Deactivate Account" : "Activate Account"}
                            className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[10px] font-medium transition ${
                              staff.isActive
                                ? "border-[#eed0cc] bg-[#fff8f7] text-[#a1483c] hover:bg-[#fae8e6]"
                                : "border-[#cfdfd1] bg-[#edf6ef] text-[#1e5836] hover:bg-[#e2efe4]"
                            }`}
                          >
                            {staff.isActive ? (
                              <>
                                <UserX size={11} />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={11} />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
