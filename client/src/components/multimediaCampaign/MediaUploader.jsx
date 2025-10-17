import React, { useState } from "react";

export default function MediaUploader({ mediaUrl, onChange }) {
    const [preview, setPreview] = useState(mediaUrl);
    const [uploading, setUploading] = useState(false);
    const [manualUrl, setManualUrl] = useState("");
    const [mode, setMode] = useState("upload"); // "upload" or "link"

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

    // 🖼️ Handle file upload from device
    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Local preview before upload
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            alert("Cloudinary config missing in .env");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.secure_url) {
                onChange(data.secure_url);
                setPreview(data.secure_url);
            } else {
                alert(`Upload failed: ${data.error?.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            alert("Failed to upload media. Check your Cloudinary setup.");
        } finally {
            setUploading(false);
        }
    };

    // 🔗 Handle manual link entry
    const handleLinkSubmit = () => {
        if (!manualUrl.trim()) {
            alert("Please enter a valid image or video link");
            return;
        }
        onChange(manualUrl.trim());
        setPreview(manualUrl.trim());
    };

    // 🧹 Clear the current media selection
    const handleClear = () => {
        onChange(null);
        setPreview(null);
        setManualUrl("");
    };

    // 🖼️ Determine if URL is an image or video
    const renderPreview = () => {
        if (!preview) return null;
        const isVideo = preview.match(/\.(mp4|mov|avi|webm|mkv)$/i);
        return (
            <div className="mt-3 relative">
                {isVideo ? (
                    <video src={preview} controls className="rounded-xl max-h-48 w-auto" />
                ) : (
                    <img src={preview} alt="preview" className="rounded-xl max-h-48 w-auto" />
                )}
                <button
                    onClick={handleClear}
                    className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs hover:bg-black/70"
                >
                    ✕ Remove
                </button>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700">
            <label className="font-medium text-gray-800 dark:text-gray-200 block mb-2">
                Media (optional)
            </label>

            {/* Toggle between Upload / Link modes */}
            <div className="flex gap-2 mb-3">
                <button
                    type="button"
                    onClick={() => setMode("upload")}
                    className={`px-3 py-1 rounded-md text-sm ${mode === "upload"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                >
                    Upload from Device
                </button>
                <button
                    type="button"
                    onClick={() => setMode("link")}
                    className={`px-3 py-1 rounded-md text-sm ${mode === "link"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                >
                    Paste Media Link
                </button>
            </div>

            {/* Upload mode */}
            {mode === "upload" && (
                <div>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        className="block mt-2 w-full text-sm text-gray-700 dark:text-gray-300"
                        onChange={handleFile}
                        disabled={uploading}
                    />
                    {uploading && <p className="text-blue-600 mt-2">Uploading...</p>}
                </div>
            )}

            {/* Paste link mode */}
            {mode === "link" && (
                <div className="mt-2 space-y-2">
                    <input
                        type="text"
                        placeholder="Enter a public image or video URL"
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200"
                    />
                    <button
                        type="button"
                        onClick={handleLinkSubmit}
                        className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                        Add Media Link
                    </button>
                </div>
            )}

            {/* Preview */}
            {renderPreview()}
        </div>
    );
}
