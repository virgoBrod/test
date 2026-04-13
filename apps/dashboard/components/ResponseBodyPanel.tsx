"use client";

import { useState } from "react";

interface Props {
  body: string;
}

export default function ResponseBodyPanel({ body }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 ml-7">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {open ? "Ocultar" : "Ver"} response body
      </button>

      {open && (
        <pre className="mt-2 text-xs bg-gray-950 text-green-400 rounded-xl p-4 overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">
          {body}
        </pre>
      )}
    </div>
  );
}
