"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProjectSelector from "@/components/ProjectSelector";
import ProjectSettingsModal from "@/components/ProjectSettingsModal";
import { ProjectProvider, useProject } from "@/components/ProjectContext";
import Toast from "@/components/Toast";
import type { Project } from "@/types";

function AppContent({ children }: { children: React.ReactNode }) {
  const { project, setProject } = useProject();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleProjectChange = (newProject: Project) => {
    setProject(newProject);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-gray-500">Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <ProjectSelector onProjectChange={handleProjectChange} />
            {project && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configuración del proyecto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      <Toast />
      {settingsOpen && project && (
        <ProjectSettingsModal project={project} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <AppContent>{children}</AppContent>
    </ProjectProvider>
  );
}
