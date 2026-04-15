"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/types";

interface Props {
  onProjectChange?: (project: Project) => void;
}

export default function ProjectSelector({ onProjectChange }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string>("lv");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/projects")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setProjects(data);
          const saved = localStorage.getItem("selectedProject");
          if (saved && data.find((p: Project) => p.id === saved)) {
            setSelected(saved);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("Failed to load projects:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    setOpen(false);
    localStorage.setItem("selectedProject", id);
    const project = projects.find((p) => p.id === id);
    if (project && onProjectChange) {
      onProjectChange(project);
    }
  };

  const currentProject = projects.find((p) => p.id === selected);

  if (loading) {
    return (
      <div className="h-9 w-32 bg-gray-100 animate-pulse rounded-lg" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
        {currentProject?.name ?? "Seleccionar"}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSelect(project.id)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  selected === project.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700"
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
