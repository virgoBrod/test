import path from "path";
import fs from "fs";
import type { CollectionType } from "@/types";

export type CollectionId = "auth" | "mobile-flow" | "web-flow";

export interface CollectionConfig {
  id: CollectionId;
  name: string;
  description: string;
  collectionFile: string;
  environmentFile: string;
  credentialFields: CredentialField[];
  type: CollectionType;
  projectId?: string;
}

export interface CredentialField {
  key: string;
  label: string;
  type: "text" | "password";
  envVar: string;
}

const COLLECTIONS_DIR = path.join(
  process.cwd(),
  "..",
  "..",
  "apps",
  "backend",
  "collections"
);

const ENVIRONMENTS_DIR = path.join(
  process.cwd(),
  "..",
  "..",
  "apps",
  "backend",
  "environments",
  "projects"
);

const BASE_COLLECTIONS: Omit<CollectionConfig, "collectionFile" | "environmentFile" | "projectId">[] = [
  {
    id: "auth",
    name: "Auth",
    description: "Flujo de autenticación general",
    type: "mobile",
    credentialFields: [
      { key: "callsign", label: "Callsign", type: "text", envVar: "callsign" },
      { key: "password", label: "Contraseña", type: "password", envVar: "password" },
    ],
  },
  {
    id: "mobile-flow",
    name: "Mobile Flow",
    description: "Flujo completo de la app móvil",
    type: "mobile",
    credentialFields: [
      { key: "callsign", label: "Callsign", type: "text", envVar: "callsign" },
      { key: "password", label: "Contraseña", type: "password", envVar: "password" },
    ],
  },
  {
    id: "web-flow",
    name: "Web Flow",
    description: "Flujo completo del portal web",
    type: "web",
    credentialFields: [
      { key: "webEmail", label: "Email", type: "text", envVar: "webEmail" },
      { key: "webPassword", label: "Contraseña", type: "password", envVar: "webPassword" },
    ],
  },
];

export function getCollection(id: CollectionId, projectId: string = "sales"): CollectionConfig | undefined {
  const baseCollection = BASE_COLLECTIONS.find((c) => c.id === id);
  if (!baseCollection) return undefined;

  const validProjects = ["sales"]; // TODO: Add more projects when flows are ready
  const project = validProjects.includes(projectId) ? projectId : "sales";

  const collectionFile = path.join(
    COLLECTIONS_DIR,
    project,
    `${id}.postman_collection.json`
  );

  // Mobile env: sales.postman_environment.json
  // Web env: web.sales.postman_environment.json
  const envPrefix = baseCollection.type === "mobile" ? "" : `web.`;
  const environmentFile = path.join(
    ENVIRONMENTS_DIR,
    `${envPrefix}${project}.postman_environment.json`
  );

  return {
    ...baseCollection,
    collectionFile,
    environmentFile,
    projectId: project,
  };
}

export function getAvailableFlows(projectId: string): CollectionConfig[] {
  const validProjects = ["sales"]; // TODO: Add more projects when flows are ready
  const project = validProjects.includes(projectId) ? projectId : "sales";

  const projectCollectionsDir = path.join(COLLECTIONS_DIR, project);
  
  if (!fs.existsSync(projectCollectionsDir)) {
    return [];
  }

  const files = fs.readdirSync(projectCollectionsDir);
  const flows: CollectionConfig[] = [];

  files.forEach((file) => {
    if (file.endsWith(".postman_collection.json")) {
      const flowId = file.replace(".postman_collection.json", "") as CollectionId;
      const config = getCollection(flowId, project);
      if (config) {
        flows.push(config);
      }
    }
  });

  return flows;
}
