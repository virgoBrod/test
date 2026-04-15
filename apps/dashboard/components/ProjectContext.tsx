"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Project } from "@/types";

interface ProjectContextType {
  project: Project | null;
  setProject: (project: Project) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  project: null,
  setProject: () => {},
});

export function useProject() {
  return useContext(ProjectContext);
}

interface Props {
  children: ReactNode;
}

export function ProjectProvider({ children }: Props) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("selectedProject");
    if (savedId) {
      fetch(`/api/projects/${savedId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.id) {
            setProject(data);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
