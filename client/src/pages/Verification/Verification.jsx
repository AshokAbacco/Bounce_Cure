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

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// DB stores mx as a comma-separated string; the API returns an array. Always use an array in the UI.
const toMxArray = (mx) => {
  if (Array.isArray(mx)) return mx;
  if (typeof mx === "string" && mx.trim()) return mx.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

const normalizeResult = (r = {}) => ({ ...r, mx: toMxArray(r.mx) });

// Server batches have total/validCount/createdAt at the top level and no results.
// Convert them to the shape the UI renders ({ name, timestamp, summary, results }).
const normalizeBatch = (b = {}) => {
  const summary = b.summary || {
    total: b.total ?? 0,
    validCount: b.validCount ?? 0,
    invalidCount: b.invalidCount ?? 0,
    riskyCount: b.riskyCount ?? 0,
  };
  const label = b.source === "manual" ? "Manual Paste" : "Bulk Upload";
  return {
    ...b,
    name: b.name || `${label} #${b.id}`,
    timestamp: b.timestamp || (b.createdAt ? new Date(b.createdAt).toLocaleString() : ""),
    summary,
    // null = not fetched yet; fetched lazily on View / Download
    results: Array.isArray(b.results) ? b.results.map(normalizeResult) : null,
  };
};

const HistoryRow = ({ batch, selected, busy, onView, onDownload, onDelete }) => (
  <div
    onClick={onView}
    className={`p-3 rounded bg-gray-800 flex justify-between items-center cursor-pointer ${selected ? "ring-2 ring-yellow-500" : ""}`}
  >
    <div>
      <div className="font-semibold text-yellow-300">{batch.name}</div>
      <div className="text-xs text-gray-400">{batch.timestamp}</div>
      <div className="text-xs text-gray-500">
        {formatNumber(batch.summary?.total)} emails • {formatNumber(batch.summary?.validCount)} valid •{" "}
        {formatNumber(batch.summary?.invalidCount)} invalid
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        title="View"
        onClick={(e) => { e.stopPropagation(); onView(); }}
        className="text-yellow-400 hover:text-yellow-300"
      >
        <FaEye />
      </button>
      <button
        type="button"
        title="Download CSV"
        disabled={busy}
        onClick={(e) => { e.stopPropagation(); onDownload(); }}
        className="text-green-400 hover:text-green-300 disabled:opacity-50"
      >
        <HiOutlineDownload />
      </button>
      <button
        type="button"
        title="Delete"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="text-red-400 hover:text-red-300"
      >
        <FaTrash />
      </button>
    </div>
  </div>
);

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

  // history actions
  const [loadingResultsId, setLoadingResultsId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null); // { id, source, name }
  const [deleting, setDeleting] = useState(false);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async (source, setHistory, setViewingId) => {
      try {
        const res = await axios.get(`${VRI_URL}/api/verification/batches?source=${source}`, {
          headers: authHeaders(),
        });
        const batches = (res.data.batches || []).map(normalizeBatch);
        setHistory(batches);
        if (batches.length > 0) setViewingId(batches[0].id);
      } catch (e) {
        console.warn(`Could not fetch ${source} history`, e?.message || e);
      }
    };

    loadHistory("bulk", setBulkHistory, setViewingBulkId);
    loadHistory("manual", setManualHistory, setViewingManualId);
  }, []);

  // ---------------- History helpers ----------------
  const setterFor = (source) => (source === "manual" ? setManualHistory : setBulkHistory);

  // Fetch a batch's results from the server and cache them on the batch in state
  const fetchBatchResults = async (batchId, source) => {
    setLoadingResultsId(batchId);
    try {
      const res = await axios.get(`${VRI_URL}/api/verification/batches/${batchId}/results`, {
        headers: authHeaders(),
      });
      const results = (res.data.results || []).map(normalizeResult);
      setterFor(source)((prev) => prev.map((b) => (b.id === batchId ? { ...b, results } : b)));
      return results;
    } finally {
      setLoadingResultsId((cur) => (cur === batchId ? null : cur));
    }
  };

  // Whenever the selected batch has no results loaded yet, fetch them
  useEffect(() => {
    const b = bulkHistory.find((x) => x.id === viewingBulkId);
    if (b && b.results === null && loadingResultsId !== b.id) {
      fetchBatchResults(b.id, "bulk").catch((err) =>
        console.error("Failed to load bulk results", err?.message || err)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingBulkId, bulkHistory]);

  useEffect(() => {
    const b = manualHistory.find((x) => x.id === viewingManualId);
    if (b && b.results === null && loadingResultsId !== b.id) {
      fetchBatchResults(b.id, "manual").catch((err) =>
        console.error("Failed to load manual results", err?.message || err)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingManualId, manualHistory]);

  const handleView = (batch, source) => {
    setFilter("all");
    if (source === "manual") setViewingManualId(batch.id);
    else setViewingBulkId(batch.id);
  };

  const handleDownload = async (batch, source) => {
    try {
      const results = Array.isArray(batch.results)
        ? batch.results
        : await fetchBatchResults(batch.id, source);
      downloadResults(results, "csv", `${source}_${batch.id}`);
    } catch (err) {
      console.error("Failed to download results", err?.message || err);
      alert("Could not download results. Please try again.");
    }
  };

  const requestDelete = (batch, source) => {
    setPendingDelete({ id: batch.id, source, name: batch.name });
  };

  const cancelDelete = () => {
    if (!deleting) setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, source } = pendingDelete;
    setDeleting(true);
    try {
      await axios.delete(`${VRI_URL}/api/verification/batches/${id}`, { headers: authHeaders() });
      setterFor(source)((prev) => prev.filter((x) => x.id !== id));
      if (source === "manual") setViewingManualId((cur) => (cur === id ? null : cur));
      else setViewingBulkId((cur) => (cur === id ? null : cur));
      setPendingDelete(null);
    } catch (err) {
      console.error("Failed to delete batch", err?.message || err);
      alert("Could not delete this record: " + (err.response?.data?.error || err.message || "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };

  // Close the delete popup with Escape
  useEffect(() => {
    if (!pendingDelete) return;
    const onKey = (e) => e.key === "Escape" && cancelDelete();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDelete, deleting]);

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
  const input = e.target;
  const file = input.files?.[0];
  if (!file) return;

  setLoadingBulk(true);
  try {
    // await the file read so every error below is caught and the loader stays on until done
    const text = await file.text();
    const emails = [
      ...new Set(
        (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((m) => m.trim().toLowerCase())
      ),
    ].slice(0, 1000);

    if (emails.length === 0) {
      alert("No valid emails found in the file.");
      return;
    }

    // ✅ Check local credits first
    const current = parseInt(localStorage.getItem("emailVerificationCredits")) || 0;
    if (emails.length > current) {
      alert("Not enough verification credits. Please purchase more credits.");
      return;
    }

    const res = await axios.post(
      `${VRI_URL}/api/verification/verify-bulk`,
      { emails },
      { headers: { "Content-Type": "application/json", ...authHeaders() } }
    );

    const data = res.data;

    // ✅ Deduct credits locally
    const newCount = Math.max(current - emails.length, 0);
    localStorage.setItem("emailVerificationCredits", newCount);
    window.dispatchEvent(new Event("storage"));

    const newBatch = normalizeBatch({
      id: data.batchId,
      source: "bulk",
      name: `Bulk Upload - ${file.name}`,
      createdAt: new Date().toISOString(),
      results: data.results || [],
      summary: data.summary || { total: emails.length, validCount: 0, invalidCount: 0, riskyCount: 0 },
    });

    setBulkHistory((prev) => [newBatch, ...prev]);
    setViewingBulkId(newBatch.id);
    setFilter("all");
  } catch (err) {
    if (err.response?.status === 403) {
      alert("Verification credits exceeded. Please purchase more credits.");
    } else {
      alert("Bulk verification failed: " + (err.response?.data?.error || err.message || "Unknown"));
    }
  } finally {
    setLoadingBulk(false);
    input.value = ""; // allow re-uploading the same file
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
    const newBatch = normalizeBatch({
      id: res.data.batchId, // real DB id, so View/Download/Delete work for this batch
      source: "manual",
      createdAt: new Date().toISOString(),
      results: res.data.results || [],
      summary: res.data.summary || { total: emails.length },
    });
    setManualHistory((p) => [newBatch, ...p]);
    setViewingManualId(newBatch.id);
    setFilter("all");
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
      mx: toMxArray(r.mx).join(", "),
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
                      MX: <span className="text-gray-200">{toMxArray(singleResult.mx).join(", ") || "-"}</span>
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
                      onClick={() => handleDownload(currentBulk, "bulk")}
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
                  <table className="w-full table-fixed text-sm">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="w-[40%] px-3 py-2 text-left">Email</th>
                        <th className="w-[20%] px-3 py-2 text-center">Status</th>
                        <th className="w-[15%] px-3 py-2 text-center">Score</th>
                        <th className="w-[25%] px-3 py-2 text-center">Flags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBulk.results === null && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4"><LoaderInline text="Loading results..." /></td>
                        </tr>
                      )}
                      {Array.isArray(currentBulk.results) && filterResults(currentBulk.results).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-gray-400">No results to show.</td>
                        </tr>
                      )}
                      {filterResults(currentBulk.results || []).map((r, i) => (
                        <tr key={`${r.email}-${i}`} className="border-t border-gray-700 hover:bg-gray-800">
                          <td className="px-3 py-2 text-left truncate" title={r.email}>{r.email}</td>
                          <td className="px-3 py-2 text-center"><StatusPill status={r.status} score={r.score ?? 0} /></td>
                          <td className="px-3 py-2 text-center">{r.score ?? 0}%</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex gap-2 flex-wrap justify-center">
                              {r.disposable && <span className="px-2 py-0.5 bg-red-600 rounded text-xs">DISP</span>}
                              {r.role_based && <span className="px-2 py-0.5 bg-purple-600 rounded text-xs">ROLE</span>}
                              {r.catch_all && <span className="px-2 py-0.5 bg-yellow-600 rounded text-xs">CATCH</span>}
                              {r.free_provider && <span className="px-2 py-0.5 bg-blue-600 rounded text-xs">FREE</span>}
                              {!r.disposable && !r.role_based && !r.catch_all && !r.free_provider && (
                                <span className="text-gray-500">-</span>
                              )}
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
                    <HistoryRow
                      key={b.id}
                      batch={b}
                      selected={viewingBulkId === b.id}
                      busy={loadingResultsId === b.id}
                      onView={() => handleView(b, "bulk")}
                      onDownload={() => handleDownload(b, "bulk")}
                      onDelete={() => requestDelete(b, "bulk")}
                    />
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
                      onClick={() => handleDownload(currentManual, "manual")}
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
                  <table className="w-full table-fixed text-sm">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="w-[40%] px-3 py-2 text-left">Email</th>
                        <th className="w-[20%] px-3 py-2 text-center">Status</th>
                        <th className="w-[15%] px-3 py-2 text-center">Score</th>
                        <th className="w-[25%] px-3 py-2 text-center">Flags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentManual.results === null && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4"><LoaderInline text="Loading results..." /></td>
                        </tr>
                      )}
                      {Array.isArray(currentManual.results) && filterResults(currentManual.results).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-gray-400">No results to show.</td>
                        </tr>
                      )}
                      {filterResults(currentManual.results || []).map((r, i) => (
                        <tr key={`${r.email}-${i}`} className="border-t border-gray-700 hover:bg-gray-800">
                          <td className="px-3 py-2 text-left truncate" title={r.email}>{r.email}</td>
                          <td className="px-3 py-2 text-center"><StatusPill status={r.status} score={r.score ?? 0} /></td>
                          <td className="px-3 py-2 text-center">{r.score ?? 0}%</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex gap-2 flex-wrap justify-center">
                              {r.disposable && <span className="px-2 py-0.5 bg-red-600 rounded text-xs">DISP</span>}
                              {r.role_based && <span className="px-2 py-0.5 bg-purple-600 rounded text-xs">ROLE</span>}
                              {r.catch_all && <span className="px-2 py-0.5 bg-yellow-600 rounded text-xs">CATCH</span>}
                              {r.free_provider && <span className="px-2 py-0.5 bg-blue-600 rounded text-xs">FREE</span>}
                              {!r.disposable && !r.role_based && !r.catch_all && !r.free_provider && (
                                <span className="text-gray-500">-</span>
                              )}
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
                <div className="space-y-3">
                  {manualHistory.map((m) => (
                    <HistoryRow
                      key={m.id}
                      batch={m}
                      selected={viewingManualId === m.id}
                      busy={loadingResultsId === m.id}
                      onView={() => handleView(m, "manual")}
                      onDownload={() => handleDownload(m, "manual")}
                      onDelete={() => requestDelete(m, "manual")}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------- DELETE CONFIRMATION ---------- */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={cancelDelete}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <HiExclamationCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-400" />
              <div>
                <h3 id="delete-dialog-title" className="text-lg font-bold text-gray-100">
                  Delete record
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  Are you sure you want to delete this record?
                </p>
                {pendingDelete.name && (
                  <p className="mt-1 text-xs text-gray-500">{pendingDelete.name}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                autoFocus
                className="rounded border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Verification;