"use client"

import { type FormEvent, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Loader2, KeyRound } from "lucide-react"
import { api, tokenStorage } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If already authenticated, redirect straight to dashboard
    const token = tokenStorage.get()
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.auth.login(identifier.trim(), password)
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please verify your credentials and network connection.")
      setLoading(false)
    }
  }

  function fillCredentials(empId: string, pass: string) {
    setIdentifier(empId)
    setPassword(pass)
    setError("")
  }

  return (
    <main className="grid min-h-screen bg-[#f8f9f7] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#174d33] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-36 -top-28 size-[520px] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-8 size-[360px] rounded-full border border-white/10" />
        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-sm bg-white text-sm font-bold text-[#174d33]">
            IS
          </span>
          <span>
            <span className="block text-xs font-semibold tracking-wide">INDIA SHELTER</span>
            <span className="mt-0.5 block text-[9px] text-white/65">FINANCE CORPORATION</span>
          </span>
        </Link>
        <div className="relative max-w-lg pb-10">
          <p className="font-mono text-xs uppercase tracking-[.16em] text-white/65">Employee workspace</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.04] tracking-tight xl:text-6xl">
            Your work,<br />within reach.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
            Sign in to search, review, create and manage registered communication templates for India Shelter Finance.
          </p>
        </div>
        <p className="relative text-[10px] text-white/55">Internal use only · Secure JWT Authentication</p>
      </section>

      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:px-14 xl:px-20">
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-xs text-[#717a70] hover:text-[#205c3c]">
          <ArrowLeft size={14} /> Back to home
        </Link>
        <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col justify-center py-12">
          <div className="mb-6 flex size-11 items-center justify-center rounded-md bg-[#eaf1eb] text-[#2d6943]">
            <LockKeyhole size={19} />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[.12em] text-[#66816c]">
            Template Management Portal
          </p>
          <h2 className="mt-2 text-[27px] font-semibold tracking-[-.04em]">Welcome back</h2>
          <p className="mt-2 text-[13px] text-[#7d857b]">Sign in with your employee credentials.</p>

          <form onSubmit={signIn} className="mt-8 flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium text-[#4c554b]">Employee ID or Email</span>
              <input
                autoComplete="username"
                required
                disabled={loading}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="h-10 w-full rounded-md border border-[#dfe4dd] bg-white px-3 text-sm outline-none transition focus:border-[#6e9278] focus:ring-2 focus:ring-[#6e9278]/15 disabled:bg-[#f2f4f1]"
                placeholder="e.g. IS-ADM-001 or email"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium text-[#4c554b]">Password</span>
              <span className="relative block">
                <input
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 w-full rounded-md border border-[#dfe4dd] bg-white px-3 pr-10 text-sm outline-none transition focus:border-[#6e9278] focus:ring-2 focus:ring-[#6e9278]/15 disabled:bg-[#f2f4f1]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label={visible ? "Hide password" : "Show password"}
                  onClick={() => setVisible(!visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#818a80] hover:text-[#424840]"
                >
                  {visible ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between text-[11px]">
              <label className="flex items-center gap-2 text-[#6e776c]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="accent-[#205c3c]"
                />
                Remember me
              </label>
              <span className="text-[#848c82]">Default password policy active</span>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-[#efd7d3] bg-[#fff7f5] px-3.5 py-2.5 text-[11px] leading-5 text-[#9b4a3e]"
              >
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="btn-press mt-1 flex h-10 items-center justify-center gap-2 rounded-md bg-[#205c3c] text-[12px] font-semibold text-white shadow-xs hover:bg-[#174b30] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in to Workspace"
              )}
            </button>
          </form>

          {/* Quick Credential Fillers for convenience */}
          {/* <div className="mt-6 rounded-md border border-[#e4eae2] bg-[#fbfcfb] p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#486b4f]">
              <KeyRound size={12} /> Test Credentials
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fillCredentials("IS-ADM-001", "Admin@123")}
                className="flex items-center justify-between rounded border border-[#e8ece6] bg-white px-2.5 py-1.5 text-left text-[11px] hover:border-[#6e9278] hover:bg-[#f4f7f3]"
              >
                <span>
                  <strong className="text-[#2b332a]">Admin:</strong> IS-ADM-001
                </span>
                <span className="font-mono text-[10px] text-[#717b70]">Admin@123</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("IS-EMP-001", "Employee@123")}
                className="flex items-center justify-between rounded border border-[#e8ece6] bg-white px-2.5 py-1.5 text-left text-[11px] hover:border-[#6e9278] hover:bg-[#f4f7f3]"
              >
                <span>
                  <strong className="text-[#2b332a]">Employee:</strong> IS-EMP-001
                </span>
                <span className="font-mono text-[10px] text-[#717b70]">Employee@123</span>
              </button>
            </div>
          </div> */}
        </div>
        <p className="text-center text-[11px] text-[#8e968b]">
          © India Shelter Finance Corporation Limited · <strong className="font-bold text-[#1e5837]">Created by Ayush Vishwakarma</strong>
        </p>
      </section>
    </main>
  )
}
