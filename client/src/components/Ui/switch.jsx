import React from "react";

export function Switch({ checked, onCheckedChange }) {
    return (
        <button
            type="button"
            onClick={() => onCheckedChange(!checked)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-blue-600" : "bg-gray-300"
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"
                    }`}
            />
        </button>
    );
}
