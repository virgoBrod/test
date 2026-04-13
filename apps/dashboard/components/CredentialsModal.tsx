"use client";

import { CollectionConfig } from "@/lib/collections";
import { useState, FormEvent } from "react";

interface Props {
  collection: CollectionConfig;
  onConfirm: (credentials: Record<string, string>) => void;
  onClose: () => void;
}

export default function CredentialsModal({ collection, onConfirm, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(collection.credentialFields.map((f) => [f.key, ""]))
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onConfirm(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Ejecutar {collection.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ingresá tus credenciales para esta ejecución. No se guardan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {collection.credentialFields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type={field.type}
                value={values[field.key]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                required
                placeholder={field.label}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          ))}

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
              className="flex-1 py-2.5 rounded-xl text-sm font-medium
                bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Correr Tests
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
