"use client";

import ForceLogoutForm from "@/components/ForceLogoutForm";
import { useProject } from "@/components/ProjectContext";

export default function CSMToolsPage() {
  const { project } = useProject();

  const handleForceLogout = async (projectId: string, userIdentifier: string) => {
    const res = await fetch("/api/csm/force-logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, user_identifier: userIdentifier }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al cerrar sesión");
    }

    return data;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CSM Tools</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Herramientas de soporte técnico
        </p>
      </div>

      <div className="max-w-lg">
        <ForceLogoutForm
          selectedProject={project}
          onSubmit={handleForceLogout}
        />
      </div>
    </div>
  );
}
