// Verification.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  HiOutlineDownload,
  HiCheckCircle,
  HiXCircle,
  HiExclamationCircle,
} from "react-icons/hi";
import { FaEye, FaTrash } from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";

const VRI_URL = import.meta.env.VITE_VRI_URL || "";

const LoaderInline = ({ text = "Processing..." }) => (
  <div className="flex items-center gap-3 text-yellow-400">
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
    </svg>
    <span className="font-medium">{text}</span>
  </div>
);

const StatusPill = ({ status = "invalid", score = 0 }) => {
  const cls =
    status === "valid"
      ? "bg-green-600 text-white"
      : status === "risky"
        ? "bg-yellow-400 text-black"
        : "bg-red-600 text-white";
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold ${cls}`}>
      <span className="text-sm">{status?.toUpperCase()}</span>
      <span className="text-xs opacity-90">({score}%)</span>
    </div>
  );
};

const formatNumber = (n) => (typeof n === "number" ? n : 0);

const Verification = () => {
  const [activeTab, setActiveTab] = useState("single");

  // single
  const [singleEmail, setSingleEmail] = useState("");
  const [singleResult, setSingleResult] = useState(null);
  const [singleHistory, setSingleHistory] = useState([]);
  const [loadingSingle, setLoadingSingle] = useState(false);

  // bulk
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkHistory, setBulkHistory] = useState([]);
  const [viewingBulkId, setViewingBulkId] = useState(null);

  // manual
  const [pasteText, setPasteText] = useState("");
  const [includeOnlyValid, setIncludeOnlyValid] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);
  const [manualHistory, setManualHistory] = useState([]);
  const [viewingManualId, setViewingManualId] = useState(null);

  const [filter, setFilter] = useState("all");
  const [downloadOpen, setDownloadOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    const loadBulk = async () => {
      try {
        const res = await axios.get(`${VRI_URL}/api/verification/batches?source=bulk`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Bulk batches response:", res.data);
        setBulkHistory(res.data.batches || []);
        if ((res.data.batches || []).length > 0) setViewingBulkId(res.data.batches[0].id);
      } catch (e) {
        console.warn("Could not fetch bulk history", e?.message || e);
      }
    };

    const loadManual = async () => {
      try {
        const res = await axios.get(`${VRI_URL}/api/verification/batches?source=manual`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Manual batches response:", res.data);
        setManualHistory(res.data.batches || []);
        if ((res.data.batches || []).length > 0) setViewingManualId(res.data.batches[0].id);
      } catch (e) {
        console.warn("Could not fetch manual history", e?.message || e);
      }
    };


    loadBulk();
    loadManual();
  }, []);

  useEffect(() => {
  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${VRI_URL}/api/users/credits`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        const { emailVerificationCredits } = res.data;
        localStorage.setItem("emailVerificationCredits", emailVerificationCredits);
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error("Failed to fetch credits:", err.message);
    }
  };

  fetchCredits();
}, []);


 // ---------------- Single verify ----------------
const verifySingle = async () => {
  const token = localStorage.getItem("token");

  if (!singleEmail?.trim()) return alert("Please enter an email");
  setLoadingSingle(true);
  try {
    const res = await axios.post(
      `${VRI_URL}/api/verification/verify-single`,
      { email: singleEmail.trim() },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const result = res.data?.email ? res.data : res.data?.result || res.data;
    setSingleResult(result);
    setSingleHistory((p) => [result, ...p]);

    // ✅ Deduct 1 credit locally
    const current = parseInt(localStorage.getItem("emailVerificationCredits")) || 0;
    const newCount = Math.max(current - 1, 0);
    localStorage.setItem("emailVerificationCredits", newCount);
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    if (err.response?.status === 403) {
      alert("You’ve used all your verification credits. Please purchase more credits.");
    } else {
      alert("Single verification failed: " + (err?.message || "Unknown"));
    }
  } finally {
    setSingleEmail("");
    setLoadingSingle(false);
  }
};

// ---------------- Bulk Upload ----------------
const handleBulkUpload = async (e) => {
  const token = localStorage.getItem("token");
  const file = e.target.files?.[0];
  if (!file) return;

  setLoadingBulk(true);
  try {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const emails = event.target.result
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line)
        .slice(0, 1000);

      if (emails.length === 0) {
        alert("No valid emails found in the file.");
        setLoadingBulk(false);
        return;
      }

      // ✅ Check local credits first
      const current = parseInt(localStorage.getItem("emailVerificationCredits")) || 0;
      if (emails.length > current) {
        alert("Not enough verification credits. Please purchase more credits.");
        setLoadingBulk(false);
        return;
      }

      const res = await axios.post(
        `${VRI_URL}/api/verification/verify-bulk`,
        { emails },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );

      const data = res.data;

      // ✅ Deduct credits locally
      const newCount = Math.max(current - emails.length, 0);
      localStorage.setItem("emailVerificationCredits", newCount);
      window.dispatchEvent(new Event("storage"));

      const newBatch = {
        id: data.batchId,
        name: `Bulk Upload ${new Date().toLocaleString()}`,
        timestamp: new Date().toLocaleString(),
        results: data.results || [],
        summary: data.summary || {
          total: emails.length,
          validCount: 0,
          invalidCount: 0,
          riskyCount: 0,
        },
      };

      setBulkHistory((prev) => [newBatch, ...prev]);
      setViewingBulkId(newBatch.id);
    };
    reader.readAsText(file);
  } catch (err) {
    if (err.response?.status === 403) {
      alert("Verification credits exceeded. Please purchase more credits.");
    } else {
      alert("Bulk verification failed: " + (err.message || "Unknown"));
    }
  } finally {
    setLoadingBulk(false);
  }
};

// ---------------- Manual verify ----------------
const verifyManual = async () => {
  const token = localStorage.getItem("token");

  if (!pasteText?.trim()) return alert("Paste emails or text first");
  setLoadingManual(true);
  try {
    const emails = pasteText
      .split(/\s|,|;/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    // ✅ Check local credits
    const current = parseInt(localStorage.getItem("emailVerificationCredits")) || 0;
    if (emails.length > current) {
      alert("Not enough verification credits. Please purchase more credits.");
      setLoadingManual(false);
      return;
    }

    const res = await axios.post(
      `${VRI_URL}/api/verification/verify-manual`,
      { text: pasteText },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ Deduct locally
    const newCount = Math.max(current - emails.length, 0);
    localStorage.setItem("emailVerificationCredits", newCount);
    window.dispatchEvent(new Event("storage"));

    // ✅ Add new batch
    const newBatch = {
      id: res.data.batchId || Date.now(),
      name: "Manual Paste",
      timestamp: new Date().toLocaleString(),
      results: res.data.results || [],
      summary: res.data.summary || { total: emails.length },
    };
    setManualHistory((p) => [newBatch, ...p]);
    setViewingManualId(newBatch.id);
    setPasteText("");
  } catch (err) {
    if (err.response?.status === 403) {
      alert("Verification credits exceeded. Please purchase more credits.");
    } else {
      alert("Manual verification failed: " + (err.message || "Unknown"));
    }
  } finally {
    setLoadingManual(false);
  }
};


  // ---------------- Utilities ----------------
  const downloadResults = (results = [], format = "csv", filename = "results") => {
    if (!results || results.length === 0) return alert("No results to download");
    // In the downloadResults function, update the mapping:
    const mapped = results.map((r) => ({
      email: r.email,
      status: r.status,
      score: `${r.score}%`,
      syntax_valid: r.syntax_valid ? "YES" : "NO",
      domain_valid: r.domain_valid ? "YES" : "NO",
      mailbox_exists: r.mailbox_exists ? "YES" : "NO",
      catch_all: r.catch_all ? "YES" : "NO",
      disposable: r.disposable ? "YES" : "NO",
      role_based: r.role_based ? "YES" : "NO",
      free_provider: r.free_provider ? "YES" : "NO",
      provider: r.provider || "-",
      mx: (r.mx || []).join(", "),
      reason: r.reason || "-",
      error: r.error || "-",
      quality_score: r.quality_score || 0,
    }));

    if (format === "csv" || format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(mapped);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Results");
      XLSX.writeFile(wb, `${filename}.${format}`);
    } else {
      const blob = new Blob([JSON.stringify(mapped, null, 2)], { type: "application/json" });
      saveAs(blob, `${filename}.json`);
    }
  };

  // get currently selected batch results (bulk / manual)
  const currentBulk = bulkHistory.find((b) => b.id === viewingBulkId) || null;
  const currentManual = manualHistory.find((b) => b.id === viewingManualId) || null;

  const filterResults = (arr = []) => {
    if (!arr) return [];
    if (filter === "all") return arr;
    if (filter === "valid") return arr.filter((r) => r.status === "valid");
    if (filter === "invalid") return arr.filter((r) => r.status === "invalid");
    if (filter === "risky") return arr.filter((r) => r.status === "risky");
    if (filter === "disposable") return arr.filter((r) => r.disposable);
    if (filter === "role_based") return arr.filter((r) => r.role_based);
    if (filter === "catch_all") return arr.filter((r) => r.catch_all);
    return arr;
  };

  // ---------------- Render ----------------
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 text-gray-200 mt-[5%]">
              {/* ✅ Show remaining credits */}
      <div className="text-center mb-6">
        <p className="text-lg text-yellow-400 font-semibold">
          Remaining Credits: {localStorage.getItem("emailVerificationCredits") || 0}
        </p>
      </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {["single", "bulk", "manual"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-2 rounded-md font-semibold transition ${activeTab === t ? "bg-yellow-500 text-black shadow-md" : "bg-gray-800 text-gray-300"
                }`}
            >
              {t === "single" ? "Single Verification" : t === "bulk" ? "Bulk Verification" : "Manual Paste"}
            </button>
          ))}
        </div>

        {/* ---------- SINGLE ---------- */}
        {activeTab === "single" && (
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Single Email Verification</h2>

            <div className="flex gap-3 items-center mb-4">
              <input
                type="email"
                placeholder="Enter email"
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded"
              />
              <button
                onClick={verifySingle}
                disabled={loadingSingle}
                className="px-4 py-2 bg-yellow-500 text-black rounded font-bold"
              >
                {loadingSingle ? "Verifying..." : "Verify"}
              </button>
            </div>

            {loadingSingle && <LoaderInline text="Verifying email..." />}

            {singleResult && (
              <div className="mt-4 bg-[#0f1720] border border-gray-700 p-4 rounded">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-yellow-300">{singleResult.email}</h3>
                    <div className="text-sm text-gray-400 mt-1">
                      Provider: <span className="text-gray-200">{singleResult.provider || "-"}</span>
                      {" • "}
                      MX: <span className="text-gray-200">{(singleResult.mx || []).join(", ") || "-"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusPill status={singleResult.status} score={singleResult.score ?? 0} />
                    {singleResult.reason && <div className="text-xs text-gray-400">Reason: {singleResult.reason}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {/* Syntax */}
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Syntax</div>
                    <div className={`font-semibold ${singleResult.syntax_valid ? "text-green-400" : "text-red-400"}`}>
                      {singleResult.syntax_valid ? "Valid" : "Invalid"}
                    </div>
                  </div>

                  {/* Domain */}
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Domain</div>
                    <div className={`font-semibold ${singleResult.domain_valid ? "text-green-400" : "text-red-400"}`}>
                      {singleResult.domain_valid ? "Valid" : "Invalid"}
                    </div>
                  </div>

                  {/* Mailbox */}
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Mailbox</div>
                    <div className={`font-semibold ${singleResult.mailbox_exists ? "text-green-400" : "text-red-400"}`}>
                      {singleResult.mailbox_exists ? "Exists" : "Missing"}
                    </div>
                  </div>

                  {/* Catch-all */}
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Catch-All</div>
                    <div className={`font-semibold ${singleResult.catch_all ? "text-yellow-300" : "text-green-400"}`}>
                      {singleResult.catch_all ? "Yes" : "No"}
                    </div>
                  </div>

                  {/* Disposable */}
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Disposable</div>
                    <div className={`font-semibold ${singleResult.disposable ? "text-red-400" : "text-green-400"}`}>
                      {singleResult.disposable ? "Yes" : "No"}
                    </div>
                  </div>

                  {/* Role-based */}
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Role-Based</div>
                    <div className={`font-semibold ${singleResult.role_based ? "text-yellow-300" : "text-green-400"}`}>
                      {singleResult.role_based ? "Yes" : "No"}
                    </div>
                  </div>

                  {/* Free provider */}
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Free Provider</div>
                    <div className={`font-semibold ${singleResult.free_provider ? "text-green-400" : "text-gray-300"}`}>
                      {singleResult.free_provider ? "Yes" : "No"}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Score</div>
                    <div className="font-bold text-blue-300">{singleResult.score ?? 0}%</div>
                  </div>

                  {/* Reason / Error (span full) */}
                  {singleResult.reason && (
                    <div className="bg-gray-800 p-3 rounded col-span-full sm:col-span-3 md:col-span-4 text-sm text-red-300">
                      Reason: {singleResult.reason}
                    </div>
                  )}
                  {singleResult.error && (
                    <div className="bg-gray-800 p-3 rounded col-span-full sm:col-span-3 md:col-span-4 text-sm text-red-400">
                      Error: {singleResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------- BULK ---------- */}
        {activeTab === "bulk" && (
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Bulk Verification</h2>

            <div className="mb-4">
              <input
                type="file"
                accept=".csv,.xlsx,.txt"
                onChange={handleBulkUpload}
                disabled={loadingBulk}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            {loadingBulk && (
              <div className="mb-4">
                <LoaderInline text="Processing bulk upload..." />
                <div className="w-full bg-gray-700 rounded h-2 mt-2 overflow-hidden">
                  <div className="bg-yellow-500 h-2 transition-all" style={{ width: `${bulkProgress}%` }} />
                </div>
              </div>
            )}

            {/* Active batch */}
            {currentBulk ? (
              <div className="mt-4">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-yellow-300">{currentBulk.name}</h3>
                    <div className="text-sm text-gray-400">{currentBulk.timestamp}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => downloadResults(currentBulk.results || [], "csv", `bulk_${currentBulk.id}`)}
                      className="px-3 py-1 bg-yellow-500 text-black rounded font-semibold"
                    >
                      Download CSV
                    </button>
                    <div className="text-sm text-gray-400">Total: {formatNumber(currentBulk.summary?.total)}</div>
                  </div>
                </div>

                {/* Summary tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-blue-400">{formatNumber(currentBulk.summary?.total)}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-green-400">{formatNumber(currentBulk.summary?.validCount)}</div>
                    <div className="text-xs text-gray-400">Valid</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-red-400">{formatNumber(currentBulk.summary?.invalidCount)}</div>
                    <div className="text-xs text-gray-400">Invalid</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-yellow-400">{formatNumber(currentBulk.summary?.riskyCount)}</div>
                    <div className="text-xs text-gray-400">Risky</div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  {["all", "valid", "invalid", "risky", "disposable", "role_based", "catch_all"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded text-sm ${filter === f ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-300"}`}
                    >
                      {f.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
                    </button>
                  ))}
                </div>

                {/* Results table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">Flags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterResults(currentBulk.results || []).map((r) => (
                        <tr key={r.email} className="border-t border-gray-700 hover:bg-gray-800">
                          <td className="px-3 py-2">{r.email}</td>
                          <td className="px-3 py-2"><StatusPill status={r.status} score={r.score ?? 0} /></td>
                          <td className="px-3 py-2">{r.score ?? 0}%</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2 flex-wrap">
                              {r.disposable && <span className="px-2 py-0.5 bg-red-600 rounded text-xs">DISP</span>}
                              {r.role_based && <span className="px-2 py-0.5 bg-purple-600 rounded text-xs">ROLE</span>}
                              {r.catch_all && <span className="px-2 py-0.5 bg-yellow-600 rounded text-xs">CATCH</span>}
                              {r.free_provider && <span className="px-2 py-0.5 bg-blue-600 rounded text-xs">FREE</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No batch selected. Upload a file or pick from history below.</div>
            )}

            {/* Bulk history */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">Bulk History</h3>
              {bulkHistory.length === 0 ? (
                <div className="text-gray-400">No bulk history yet.</div>
              ) : (
                <div className="space-y-3">
                  {bulkHistory.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setViewingBulkId(b.id)}
                      className={`p-3 rounded bg-gray-800 flex justify-between items-center cursor-pointer ${viewingBulkId === b.id ? "ring-2 ring-yellow-500" : ""}`}
                    >
                      <div>
                        <div className="font-semibold text-yellow-300">{b.name || "Batch"}</div>
                        <div className="text-xs text-gray-400">{b.timestamp}</div>
                        <div className="text-xs text-gray-500">
                          {formatNumber(b.total)} emails • {formatNumber(b.validCount)} valid • {formatNumber(b.invalidCount)} invalid
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* View */}
                        <button
                          title="View"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingBulkId(b.id);
                          }}
                          className="text-yellow-400"
                        >
                          <FaEye />
                        </button>

                        {/* Download */}
                        <button
                          title="Download CSV"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const res = await axios.get(`${VRI_URL}/api/verification/batches/${b.id}/results`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              const results = res.data.results || [];
                              downloadResults(results, "csv", `bulk_${b.id}`);
                            } catch (err) {
                              console.error("Failed to download results", err.message || err);
                            }
                          }}
                          className="text-green-400"
                        >
                          <HiOutlineDownload />
                        </button>

                        {/* Delete */}
                        <button
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Optionally call a DELETE endpoint here too
                            setBulkHistory((prev) => prev.filter((x) => x.id !== b.id));
                          }}
                          className="text-red-400"
                        >
                          <FaTrash />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------- MANUAL ---------- */}
        {activeTab === "manual" && (
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Manual Paste Verification</h2>

            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste emails or text..."
              className="w-full p-3 mb-3 bg-gray-800 border border-gray-700 rounded"
            />

            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeOnlyValid} onChange={() => setIncludeOnlyValid((p) => !p)} />
                Include only valid
              </label>
              <button
                onClick={verifyManual}
                disabled={loadingManual}
                className="px-4 py-2 bg-yellow-500 text-black rounded font-bold"
              >
                {loadingManual ? "Verifying..." : "Verify"}
              </button>
              <button
                onClick={() => {
                  const lines = pasteText
                    .split(/\s|,|;/)
                    .map((t) => t.trim())
                    .filter((t) => t.includes("@"));
                  if (!lines.length) return alert("No emails found");
                  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Copied emails"));
                }}
                className="px-3 py-1 border rounded text-sm"
              >
                Copy Emails
              </button>
            </div>

            {loadingManual && <LoaderInline text="Processing manual input..." />}

            {currentManual ? (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="font-bold text-yellow-300">{currentManual.name}</div>
                    <div className="text-xs text-gray-400">{currentManual.timestamp}</div>
                  </div>
                  <div>
                    <button
                      onClick={() => downloadResults(currentManual.results || [], "csv", `manual_${currentManual.id}`)}
                      className="px-3 py-1 bg-yellow-500 text-black rounded font-semibold"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-blue-400">{formatNumber(currentManual.summary?.total)}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-green-400">{formatNumber(currentManual.summary?.validCount)}</div>
                    <div className="text-xs text-gray-400">Valid</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-red-400">{formatNumber(currentManual.summary?.invalidCount)}</div>
                    <div className="text-xs text-gray-400">Invalid</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">Flags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterResults(currentManual.results || []).map((r) => (
                        <tr key={r.email} className="border-t border-gray-700 hover:bg-gray-800">
                          <td className="px-3 py-2">{r.email}</td>
                          <td className="px-3 py-2"><StatusPill status={r.status} score={r.score ?? 0} /></td>
                          <td className="px-3 py-2">{r.score ?? 0}%</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              {r.disposable && <span className="px-2 py-0.5 bg-red-600 rounded text-xs">DISP</span>}
                              {r.role_based && <span className="px-2 py-0.5 bg-purple-600 rounded text-xs">ROLE</span>}
                              {r.catch_all && <span className="px-2 py-0.5 bg-yellow-600 rounded text-xs">CATCH</span>}
                              {r.free_provider && <span className="px-2 py-0.5 bg-blue-600 rounded text-xs">FREE</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No manual batch selected yet.</div>
            )}

            {/* Manual history */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">Manual History</h3>
              {manualHistory.length === 0 ? (
                <div className="text-gray-400">No manual history yet.</div>
              ) : (
                <div className="space-y-2">
                  {manualHistory.map((m) => (
                    <div key={m.id} className="p-3 rounded bg-gray-800 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-yellow-300">{m.name}</div>
                        <div className="text-xs text-gray-400">{m.timestamp}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setViewingManualId(m.id)} className="text-yellow-400"><FaEye /></button>
                        <button onClick={() => downloadResults(m.results || [], "csv", `manual_${m.id}`)} className="text-green-400">
                          <HiOutlineDownload />
                        </button>
                        <button onClick={() => setManualHistory((p) => p.filter((x) => x.id !== m.id))} className="text-red-400"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Verification;