"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Building, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react"
import { Card3D } from "../ui/card-3d"
import { api, type TeamMember } from "@/lib/api"

export function MeetOurTeamSection() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.team.getAll()
      if (res && res.success && Array.isArray(res.data)) {
        setTeam(res.data)
      } else {
        setTeam([])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to load team members from server"
      console.error("[MeetOurTeam] Error loading team from API:", err)
      setError(msg)
      setTeam([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  return (
    <section id="team" className="scroll-mt-20 py-16 sm:py-24 bg-white border-b border-[#e5eae2]">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd9c8] bg-[#f4f8f4] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1e5836]">
            <Users size={13} className="text-[#2a7b4f]" />
            <span>Meet Our Team</span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#143221] sm:text-4xl">
            The Leadership Driving India Shelter
          </h2>
          <p className="mt-3 text-sm text-[#5d685c] leading-relaxed">
            Seasoned housing finance pioneers, credit underwriters, and risk specialists committed to fulfilling homeownership dreams across India.
          </p>
        </div>

        {/* Loading Skeleton State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`team-skeleton-${idx}`}
                className="flex flex-col overflow-hidden rounded-xl border border-[#e2e7df] bg-[#fbfcfb] animate-pulse"
              >
                {/* Image Placeholder */}
                <div className="h-72 sm:h-80 w-full bg-gradient-to-b from-[#eaf1ea] via-[#e2ebe2] to-[#d8e4d8]" />
                
                {/* Details Placeholder */}
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-5 w-44 rounded-md bg-[#e4ebe4]" />
                  <div className="h-4 w-32 rounded-md bg-[#d8e5d9]" />
                  <div className="space-y-1.5 pt-2">
                    <div className="h-3 w-full rounded-sm bg-[#edf2ed]" />
                    <div className="h-3 w-5/6 rounded-sm bg-[#edf2ed]" />
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#edf1ec] flex justify-between items-center">
                    <div className="h-3 w-24 rounded-sm bg-[#edf2ed]" />
                    <div className="h-3 w-28 rounded-sm bg-[#edf2ed]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry Button */}
        {!loading && error && team.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#f0d5d5] bg-[#fdf7f7] p-8 text-center shadow-xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fbeaea] text-[#c0392b]">
              <AlertCircle size={24} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-[#8a2218]">
              Unable to Load Team Information
            </h3>
            <p className="mt-2 text-xs text-[#6e5553] leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => fetchTeamMembers()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1e5836] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#164329] focus:outline-hidden focus:ring-2 focus:ring-[#1e5836] focus:ring-offset-2"
            >
              <RefreshCw size={14} className="animate-spin-reverse" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && team.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#e2e7df] bg-[#fbfcfb] p-10 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#eef4ee] text-[#296a41]">
              <Users size={28} />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#142e1d]">
              No Team Members Listed Yet
            </h3>
            <p className="mt-2 text-xs text-[#596358] leading-relaxed">
              Team member profiles will appear here once published by administrators.
            </p>
          </div>
        )}

        {/* Dynamic Team Cards Grid with 3D Depth */}
        {!loading && team.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 perspective-1000">
            {team.map((member) => (
              <Card3D
                key={member.id}
                maxRotation={5}
                scale={1.02}
                className="h-full"
              >
                <div
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#e2e7df] bg-[#fbfcfb] shadow-[0_2px_4px_rgba(20,40,20,0.03)] transition duration-200 hover:shadow-xl hover:border-[#bcd0be]"
                >
                  {/* Photo on Top - 100% Full Uncropped View with Studio Aura */}
                  <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-gradient-to-b from-[#f3f7f3] via-[#ecf3ec] to-[#e2ebe2] border-b border-[#edf1ec] flex items-center justify-center">
                    {member.photoUrl ? (
                      <>
                        {/* Ambient matching color glow in background */}
                        <img
                          src={member.photoUrl}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 size-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
                        />
                        {/* Full crisp uncropped foreground photo */}
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
                        <Users size={48} />
                      </div>
                    )}
                    
                    {member.department && (
                      <span className="absolute top-3 left-3 z-20 rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-[10px] font-semibold tracking-wide text-[#1e5836] shadow-xs border border-[#d6e3d7]">
                        {member.department}
                      </span>
                    )}
                  </div>

                  {/* Details & Prominent Designation Underneath */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[17px] font-bold text-[#142e1d] tracking-tight">
                      {member.name}
                    </h3>
                    
                    {/* Designation badge placed directly under photo and name */}
                    <div className="mt-1.5">
                      <span className="inline-block rounded-md bg-[#edf6ef] border border-[#cfdfd1] px-2.5 py-0.5 text-[12px] font-semibold text-[#1e5836]">
                        {member.designation}
                      </span>
                    </div>

                    {member.bio && (
                      <p className="mt-3 text-xs text-[#596358] leading-relaxed line-clamp-3 flex-1">
                        {member.bio}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-[#edf1ec] flex items-center justify-between text-[11px] text-[#7a8479]">
                      <span className="inline-flex items-center gap-1">
                        <Building size={12} className="text-[#3b7a51]" />
                        India Shelter HO
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-[#296a41]">
                        <ShieldCheck size={12} />
                        Verified Leadership
                      </span>
                    </div>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
