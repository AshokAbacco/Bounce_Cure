// src/components/multimediaCampaign/RecipientInput.jsx
import React, { useState } from "react";

export default function RecipientInput({ recipients, onChange }) {
    const [rawInput, setRawInput] = useState("");

    const parseNumbers = (text) => {
        const nums = text
            .split(/[\n,; ]+/)
            .map((n) => n.trim())
            .filter(Boolean)
            .map((n) => (n.startsWith("+") ? n : `+91${n}`)); // default to India
        onChange(Array.from(new Set(nums)));
    };

    return (
        <div>
            <label className="font-medium">Recipients</label>
            <textarea
                className="w-full mt-2 p-2 border rounded-lg h-24"
                placeholder="Enter numbers separated by commas or new lines"
                value={rawInput}
                onChange={(e) => {
                    setRawInput(e.target.value);
                    parseNumbers(e.target.value);
                }}
            />
            <p className="text-sm text-gray-500 mt-1">
                Parsed: {recipients.length} recipients
            </p>
        </div>
    );
}
