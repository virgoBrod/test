"use client";

import { useState, useEffect, FormEvent } from "react";
import type { CollectionConfig } from "@/lib/collections";
import type { Credentials } from "@/types";

interface Props {
  collection: CollectionConfig;
  projectId?: string;
  onConfirm: (credentials: Record<string, string>) => void;
  onClose: () => void;
}

export default function CredentialsModal({ collection, projectId, onConfirm, onClose }: Props) {
  const [mobileCreds, setMobileCreds] = useState({ callsign: "", password: "" });
  const [webCreds, setWebCreds] = useState({ email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!projectId);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;

    fetch(`/api/projects/${projectId}/credentials`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.credentials) {
          const creds = data.credentials as Credentials;
          if (creds.mobile) setMobileCreds(creds.mobile);
          if (creds.web) setWebCreds(creds.web);
        }
      })
      .catch(() => {})
      .then(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const credentials: Record<string, string> = {};

    if (collection.type === "mobile") {
      credentials.callsign = mobileCreds.callsign;
      credentials.password = mobileCreds.password;
    } else {
      credentials.webEmail = webCreds.email;
      credentials.webPassword = webCreds.password;
    }

    if (projectId) {
      try {
        const existing = await fetch(`/api/projects/${projectId}/credentials`).then((r) => r.json());
        const currentCreds: Credentials = existing.credentials || {};

        const newCreds: Credentials = {
          ...currentCreds,
        };

        if (collection.type === "mobile") {
          newCreds.mobile = { ...mobileCreds };
        } else {
          newCreds.web = { ...webCreds };
        }

        await fetch(`/api/projects/${projectId}/credentials`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credentials: newCreds }),
        });
      } catch {
        // ignore save errors, still run the test
      }
    }

    setSaving(false);
    onConfirm(credentials);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Credenciales para {collection.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {projectId ? "Se guardarán para futuras ejecuciones." : "No se guardan."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {collection.type === "mobile" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Callsign</label>
                <input
                  type="text"
                  value={mobileCreds.callsign}
                  onChange={(e) => setMobileCreds((p) => ({ ...p, callsign: e.target.value }))}
                  required
                  placeholder="Callsign"
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  value={mobileCreds.password}
                  onChange={(e) => setMobileCreds((p) => ({ ...p, password: e.target.value }))}
                  required
                  placeholder="Contraseña"
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={webCreds.email}
                  onChange={(e) => setWebCreds((p) => ({ ...p, email: e.target.value }))}
                  required
                  placeholder="Email"
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  value={webCreds.password}
                  onChange={(e) => setWebCreds((p) => ({ ...p, password: e.target.value }))}
                  required
                  placeholder="Contraseña"
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200
                text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium
                bg-indigo-600 text-white hover:bg-indigo-700 transition-colors
                disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Ejecutar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
