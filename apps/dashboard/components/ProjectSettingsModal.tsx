"use client";

import { useState, useEffect } from "react";
import type { Project, Credentials } from "@/types";

interface Props {
  project: Project;
  onClose: () => void;
}

export default function ProjectSettingsModal({ project, onClose }: Props) {
  const [mobileCreds, setMobileCreds] = useState({ callsign: "", password: "" });
  const [webCreds, setWebCreds] = useState({ email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${project.id}/credentials`)
      .then((r) => r.json())
      .then((data) => {
        if (data.credentials) {
          const creds = data.credentials as Credentials;
          if (creds.mobile) setMobileCreds(creds.mobile);
          if (creds.web) setWebCreds(creds.web);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [project.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const creds: Credentials = {};
      if (mobileCreds.callsign || mobileCreds.password) {
        creds.mobile = { ...mobileCreds };
      }
      if (webCreds.email || webCreds.password) {
        creds.web = { ...webCreds };
      }

      await fetch(`/api/projects/${project.id}/credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentials: creds }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Configuración de {project.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Editá las credenciales guardadas</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 py-8 text-center">Cargando...</p>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Credenciales Mobile</h3>
              <p className="text-xs text-gray-500 mb-3">
                URL: <span className="font-mono">{project.base_url_mobile || "(no configurada)"}</span>
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={mobileCreds.callsign}
                  onChange={(e) => setMobileCreds((p) => ({ ...p, callsign: e.target.value }))}
                  placeholder="Callsign"
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  value={mobileCreds.password}
                  onChange={(e) => setMobileCreds((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Contraseña"
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Credenciales Web</h3>
              <p className="text-xs text-gray-500 mb-3">
                URL: <span className="font-mono">{project.base_url_web}</span>
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={webCreds.email}
                  onChange={(e) => setWebCreds((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email"
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  value={webCreds.password}
                  onChange={(e) => setWebCreds((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Contraseña"
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200
                  text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium
                  bg-indigo-600 text-white hover:bg-indigo-700 transition-colors
                  disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>

            {saved && (
              <p className="text-sm text-green-600 text-center font-medium">
                ✓ Credenciales guardadas
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
