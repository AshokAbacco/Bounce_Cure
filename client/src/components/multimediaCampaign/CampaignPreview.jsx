// src/components/multimediaCampaign/CampaignPreview.jsx
import React from "react";

export default function CampaignPreview({
    recipients,
    message,
    mediaUrl,
    onSend,
    isSending,
    error,
    success,
}) {
    return (
        <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-lg">Preview</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{message}</p>
                {mediaUrl && <img src={mediaUrl} alt="media" className="mt-2 max-h-48" />}
            </div>

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">Message queued successfully!</p>}

            <button
                onClick={onSend}
                disabled={isSending || recipients.length === 0 || !message}
                className={`px-4 py-2 rounded-lg text-white ${isSending ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {isSending ? "Sending..." : "Send Campaign"}
            </button>
        </div>
    );
}
