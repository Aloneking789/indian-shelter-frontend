"use client"

import { useState } from "react"
import { AlertCircle, ArrowLeft, ArrowRight, Check, FileSpreadsheet, Loader2, Upload, X, AlertTriangle } from "lucide-react"
import { api, ImportPreviewData, ImportConfirmData } from "@/lib/api"

export function TemplateImportWizard({
  onClose,
  onDone,
}: {
  existingIds?: string[]
  onClose: () => void
  onDone: (result?: ImportConfirmData) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null)
  const [result, setResult] = useState<ImportConfirmData | null>(null)
  const [step, setStep] = useState<"select" | "preview" | "confirmed">("select")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)

  async function handleFileSelect(selectedFile?: File) {
    if (!selectedFile) return
    setError("")

    if (!/\.(xlsx|xls|csv)$/i.test(selectedFile.name)) {
      setError("Please choose a valid Excel (.xlsx, .xls) or CSV (.csv) file.")
      return
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("This file exceeds the 20 MB size limit.")
      return
    }

    setFile(selectedFile)
    setLoading(true)

    try {
      const res = await api.import.preview(selectedFile)
      if (res.success && res.data) {
        setPreviewData(res.data)
        setStep("preview")
      } else {
        throw new Error("Unable to analyze file.")
      }
    } catch (err: any) {
      setError(err?.message || "Failed to parse spreadsheet on server. Please check file formatting.")
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmImport() {
    if (!file) return
    setError("")
    setLoading(true)

    try {
      const res = await api.import.confirm(file)
      if (res.success && res.data) {
        setResult(res.data)
        setStep("confirmed")
      } else {
        throw new Error(res.message || "Failed to complete import.")
      }
    } catch (err: any) {
      setError(err?.message || "Import failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5">
      {/* Progress Steps */}
      <div className="mb-5 grid grid-cols-3 gap-2" aria-label="Import steps">
        {[
          { id: "select", label: "Select file" },
          { id: "preview", label: "Validation preview" },
          { id: "confirmed", label: "Import complete" },
        ].map(({ id, label }, index) => {
          const isActive = step === id
          const isDone =
            (step === "preview" && index === 0) ||
            (step === "confirmed" && index <= 1)
          return (
            <div
              key={id}
              className={`rounded-md border px-2 py-2 text-center text-[10px] transition ${
                isActive
                  ? "border-[#cbd9ce] bg-[#f1f6f2] font-semibold text-[#326344]"
                  : isDone
                  ? "border-[#d8e2d8] bg-[#fbfdfb] text-[#4d7254]"
                  : "border-[#edf0ec] text-[#9aa096]"
              }`}
            >
              <span className="mr-1 font-mono">0{index + 1}</span>
              {label}
            </div>
          )
        })}
      </div>

      {/* Step 0: Upload / Drop */}
      {step === "select" && (
        <>
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              void handleFileSelect(event.dataTransfer.files[0])
            }}
            className={`flex min-h-[200px] flex-col items-center justify-center rounded-md border border-dashed px-5 text-center transition ${
              dragging ? "border-[#4f8159] bg-[#f1f6f2]" : "border-[#cfd8cf] bg-[#fafbf9]"
            }`}
          >
            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-[#eaf1eb] text-[#3c704c]">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={19} />}
            </div>
            <span className="text-[13px] font-semibold">
              {loading ? "Analyzing spreadsheet with server..." : "Drop your Excel or CSV file here"}
            </span>
            <span className="mt-1 text-[11px] text-[#899187]">
              Supports .xlsx, .xls, .csv · Auto-detects Hindi/Unicode & DLT IDs · up to 20 MB
            </span>
            <label className="mt-4 inline-flex h-8 cursor-pointer items-center rounded-md border border-[#dfe5dd] bg-white px-3.5 text-[11px] font-medium text-[#435242] shadow-xs hover:bg-[#f7f9f6]">
              Browse files
              <input
                type="file"
                disabled={loading}
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={(event) => void handleFileSelect(event.target.files?.[0])}
              />
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-[#8c9389]">
            <span>Supported columns: DLT Template ID, Name, Due Date, Content, Owner Name, Remarks</span>
            <button
              type="button"
              onClick={() => {
                const sample =
                  "DLT Template ID,Template Name,Due Date,SMS Content,Owner Name,Remarks\n1007202950682404991,Account Welcome,Adhoc,Dear Customer welcome to India Shelter. - India Shelter,Ganga Prasad,Approved\n1007202950682404992,EMI Due Notice,Monthly,Dear Customer your EMI is due. - India Shelter,Neha Sharma,OK\n"
                const blob = new Blob([sample], { type: "text/csv;charset=utf-8" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "india-shelter-sample-templates.csv"
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="font-medium text-[#356444] hover:underline"
            >
              Download sample template
            </button>
          </div>
        </>
      )}

      {/* Step 1: Preview & Validation results */}
      {step === "preview" && previewData && (
        <>
          <div className="mb-4 flex items-center justify-between rounded-md border border-[#e7ece6] bg-[#fafbf9] p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-9 items-center justify-center rounded bg-[#edf4ef] text-[#356444]">
                <FileSpreadsheet size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold">{previewData.fileName}</p>
                <p className="text-[10px] text-[#8c9389]">
                  {previewData.totalRows} data rows parsed · {previewData.detectedColumns.length} headers mapped
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null)
                setPreviewData(null)
                setStep("select")
              }}
              className="rounded p-1 text-[#858d82] hover:bg-[#eef2ed]"
              title="Select different file"
            >
              <X size={15} />
            </button>
          </div>

          {/* Validation Metrics */}
          <div className="mb-4 grid grid-cols-3 gap-2.5">
            <div className="rounded-md border border-[#e7ece6] bg-white p-3">
              <p className="text-[10px] text-[#8a9288]">Valid records</p>
              <p className="mt-1 text-xl font-bold text-[#39704a]">{previewData.validCount}</p>
              <p className="text-[9px] text-[#939a90]">Ready to import</p>
            </div>
            <div className="rounded-md border border-[#e7ece6] bg-white p-3">
              <p className="text-[10px] text-[#8a9288]">Duplicate DLT IDs</p>
              <p className="mt-1 text-xl font-bold text-[#966c2d]">{previewData.duplicateCount}</p>
              <p className="text-[9px] text-[#939a90]">Will be skipped</p>
            </div>
            <div className="rounded-md border border-[#e7ece6] bg-white p-3">
              <p className="text-[10px] text-[#8a9288]">Invalid rows</p>
              <p className="mt-1 text-xl font-bold text-[#a44e42]">{previewData.invalidCount}</p>
              <p className="text-[9px] text-[#939a90]">Missing required data</p>
            </div>
          </div>

          {/* Preview Table of First 10 rows */}
          <div className="overflow-hidden rounded-md border border-[#e7ece6]">
            <div className="border-b border-[#edf0ec] bg-[#fafbf9] px-4 py-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-[#4e584d]">
                Data preview <span className="font-normal text-[#899187]">· first 10 records</span>
              </p>
              <span className="text-[10px] text-[#878f84]">Server validation complete</span>
            </div>
            <div className="max-h-[220px] overflow-auto">
              <table className="w-full min-w-[550px] text-left text-[11px]">
                <thead className="sticky top-0 bg-[#fbfcfb] text-[#899187] text-[10px] uppercase">
                  <tr className="border-b border-[#edf0ec]">
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">DLT Template ID</th>
                    <th className="px-3 py-2">Template Name</th>
                    <th className="px-3 py-2">Frequency</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.previewRecords.map((item) => (
                    <tr key={item.rowNumber} className="border-t border-[#f0f2ef] hover:bg-[#fafbf9]">
                      <td className="px-3 py-2 font-mono text-[10px] text-[#8c948a]">{item.rowNumber}</td>
                      <td className="px-3 py-2 font-mono text-[10px]">{item.data.dltTemplateId || "—"}</td>
                      <td className="px-3 py-2 truncate max-w-[160px]">{item.data.name || "—"}</td>
                      <td className="px-3 py-2 text-[10px] text-[#697267]">{item.data.dueDate || "—"}</td>
                      <td className="px-3 py-2">
                        {item.isValid ? (
                          <span className="inline-flex items-center gap-1 rounded bg-[#edf6ef] px-1.5 py-0.5 text-[9px] font-medium text-[#386c47]">
                            <Check size={10} /> Valid
                          </span>
                        ) : item.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 rounded bg-[#fef7eb] px-1.5 py-0.5 text-[9px] font-medium text-[#986e2d]">
                            <AlertTriangle size={10} /> Duplicate
                          </span>
                        ) : (
                          <span
                            title={item.errors.join(", ")}
                            className="inline-flex items-center gap-1 rounded bg-[#fdf2f0] px-1.5 py-0.5 text-[9px] font-medium text-[#a54b3f]"
                          >
                            <AlertCircle size={10} /> {item.errors[0] || "Invalid"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-[#858d82]">
            Note: Duplicates and invalid rows will be safely bypassed. All valid rows will be committed directly to
            PostgreSQL in a single transaction batch.
          </p>
        </>
      )}

      {/* Step 2: Confirmed Result */}
      {step === "confirmed" && result && (
        <div className="py-4 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#edf6ef] text-[#2f6841]">
            <Check size={24} />
          </div>
          <h3 className="text-base font-semibold text-[#242b23]">Import Completed Successfully</h3>
          <p className="mt-1 text-[11px] text-[#717a6e]">
            Spreadsheet batch <span className="font-mono">{result.batchId.slice(0, 8)}...</span> has been processed.
          </p>

          <div className="my-5 grid grid-cols-3 gap-3 rounded-lg border border-[#e4eae2] bg-[#fafbf9] p-4 text-left">
            <div>
              <p className="text-[10px] text-[#868d83]">Inserted</p>
              <p className="mt-0.5 text-xl font-bold text-[#356e45]">{result.successfulCount}</p>
              <p className="text-[9px] text-[#939a90]">New templates</p>
            </div>
            <div>
              <p className="text-[10px] text-[#868d83]">Skipped</p>
              <p className="mt-0.5 text-xl font-bold text-[#8f692b]">{result.skippedCount}</p>
              <p className="text-[9px] text-[#939a90]">Duplicates</p>
            </div>
            <div>
              <p className="text-[10px] text-[#868d83]">Failed</p>
              <p className="mt-0.5 text-xl font-bold text-[#9e4638]">{result.failedCount}</p>
              <p className="text-[9px] text-[#939a90]">Errors</p>
            </div>
          </div>

          <button
            onClick={() => {
              onDone(result)
              onClose()
            }}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#205c3c] px-5 text-[12px] font-medium text-white shadow-xs hover:bg-[#174b30]"
          >
            Done & View Templates
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-md border border-[#efd7d3] bg-[#fff7f5] px-3 py-2 text-[11px] text-[#9b4a3e]"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Footer controls */}
      {step !== "confirmed" && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0ec] pt-4">
          <button
            disabled={loading}
            onClick={step === "select" ? onClose : () => setStep("select")}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e2e7e0] px-3 text-[11px] font-medium text-[#556052] hover:bg-[#f6f8f5] disabled:opacity-50"
          >
            {step === "select" ? "Cancel" : <><ArrowLeft size={13} /> Back</>}
          </button>

          {step === "preview" && (
            <button
              disabled={loading || (previewData?.validCount ?? 0) === 0}
              onClick={handleConfirmImport}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#205c3c] px-4 text-[11px] font-medium text-white shadow-xs hover:bg-[#174b30] disabled:opacity-45"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Importing...
                </>
              ) : (
                <>
                  <Check size={13} /> Confirm & Import {previewData?.validCount} Templates
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
