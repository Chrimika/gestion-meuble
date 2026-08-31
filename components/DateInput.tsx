"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

interface DateInputProps {
  value: string; // ISO (YYYY-MM-DD) or DD/MM/YYYY
  onChange: (value: string) => void; // Returns YYYY-MM-DD ISO format
  className?: string;
  placeholder?: string;
  required?: boolean;
  isDark?: boolean;
  label?: string;
}

// Convert YYYY-MM-DD -> DD/MM/YYYY
export function isoToDisplay(isoStr: string): string {
  if (!isoStr) return "";
  if (isoStr.includes("/")) return isoStr;
  const parts = isoStr.split("T")[0].split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
}

// Convert DD/MM/YYYY -> YYYY-MM-DD
export function displayToIso(displayStr: string): string {
  if (!displayStr) return "";
  if (displayStr.includes("-") && displayStr.split("-")[0].length === 4) return displayStr;
  const parts = displayStr.split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return displayStr;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "JJ/MM/AAAA",
  required = false,
  isDark = false,
}) => {
  const [displayText, setDisplayText] = useState<string>(isoToDisplay(value));
  const hiddenDateRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDisplayText(isoToDisplay(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Auto-insert slashes for DD/MM/YYYY typing
    let cleaned = raw.replace(/[^\d/]/g, "");
    if (cleaned.length === 2 && !cleaned.includes("/") && raw.length > displayText.length) {
      cleaned = cleaned + "/";
    } else if (cleaned.length === 5 && cleaned.split("/").length === 2 && raw.length > displayText.length) {
      cleaned = cleaned + "/";
    }

    setDisplayText(cleaned);

    // If matches DD/MM/YYYY (8 digits total)
    const parts = cleaned.split("/");
    if (parts.length === 3 && parts[2].length === 4 && parts[0].length >= 1 && parts[1].length >= 1) {
      const iso = displayToIso(cleaned);
      onChange(iso);
    }
  };

  const handleBlur = () => {
    // Validate on blur
    const iso = displayToIso(displayText);
    if (iso && iso.includes("-")) {
      onChange(iso);
      setDisplayText(isoToDisplay(iso));
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedIso = e.target.value;
    if (selectedIso) {
      onChange(selectedIso);
      setDisplayText(isoToDisplay(selectedIso));
    }
  };

  const isoValue = displayToIso(displayText);

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        required={required}
        placeholder={placeholder}
        value={displayText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        maxLength={10}
        className={`${className} pr-9 font-mono`}
      />
      <button
        type="button"
        onClick={() => {
          const elem = hiddenDateRef.current as any;
          if (elem) {
            if ("showPicker" in elem) {
              elem.showPicker();
            } else if (elem.focus) {
              elem.focus();
              elem.click();
            }
          }
        }}
        className={`absolute right-2 text-slate-400 hover:text-amber-500 p-1 rounded-md transition-colors`}
        title="Ouvrir le calendrier"
      >
        <Calendar className="w-4 h-4" />
      </button>

      {/* Hidden HTML5 Native Date Picker for GUI fallback */}
      <input
        ref={hiddenDateRef}
        type="date"
        value={isoValue && isoValue.length === 10 ? isoValue : ""}
        onChange={handlePickerChange}
        className="sr-only pointer-events-none opacity-0 absolute"
        tabIndex={-1}
      />
    </div>
  );
};
