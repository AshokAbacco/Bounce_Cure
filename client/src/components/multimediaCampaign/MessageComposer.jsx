// src/components/multimediaCampaign/MessageComposer.jsx
import React from "react";

export default function MessageComposer({ channel, message, onChange }) {
    const charCount = message.length;
    const segmentSize = 160;
    const segments = Math.ceil(charCount / segmentSize);

    return (
        <div>
            <label className="font-medium">Message</label>
            <textarea
                className="w-full mt-2 p-2 border rounded-lg h-40"
                placeholder={`Type your ${channel.toUpperCase()} message...`}
                value={message}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="text-sm text-gray-500 mt-1 flex justify-between">
                <span>{charCount} characters</span>
                {channel === "sms" && <span>≈ {segments} SMS segments</span>}
            </div>
        </div>
    );
}
