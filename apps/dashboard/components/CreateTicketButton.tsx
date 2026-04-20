"use client";

import { showToast } from "./Toast";

interface Props {
  requestName: string;
  url: string;
  method: string;
  error?: string | null;
}

export default function CreateTicketButton({ requestName, url, method, error }: Props) {
  const handleClick = () => {
    showToast("GLPI aún no está configurado. Contactá al administrador.", "info");
  };

  return (
    <button
      onClick={handleClick}
      className="mt-1 flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
      Crear ticket GLPI
    </button>
  );
}
