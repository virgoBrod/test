"use client";

import { useState } from "react";
import { COLLECTIONS } from "@/lib/collections";
import CollectionCard from "@/components/CollectionCard";
import HistoryPanel from "@/components/HistoryPanel";

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard de Tests
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Ejecutá y monitoreá el estado de las aplicaciones.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Colecciones disponibles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLLECTIONS.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onExecutionComplete={() => setRefreshKey((k) => k + 1)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Historial de ejecuciones
          </h2>
          <HistoryPanel refreshKey={refreshKey} />
        </section>
      </div>
    </main>
  );
}
