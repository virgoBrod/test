import path from "path";
import fs from "fs";
import type { CollectionType } from "@/types";

export type CollectionId = "auth" | "mobile-flow" | "web-flow" | "web-flow-form" | "websocket-types" | "search-filters" | "incident-creation" | "security-dashboard" | "combined-flow";

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
  {
    id: "web-flow-form",
    name: "Web Flow - Form",
    description: "Flujo completo del portal web con creación de formulario",
    type: "web",
    credentialFields: [
      { key: "webEmail", label: "Email", type: "text", envVar: "webEmail" },
      { key: "webPassword", label: "Contraseña", type: "password", envVar: "webPassword" },
    ],
  },
  {
    id: "websocket-types",
    name: "WebSocket Types",
    description: "Monitorea tipos de mensajes del WebSocket por 10 segundos",
    type: "websocket",
    credentialFields: [
      { key: "webEmail", label: "Email", type: "text", envVar: "webEmail" },
      { key: "webPassword", label: "Contraseña", type: "password", envVar: "webPassword" },
    ],
  },
  {
    id: "search-filters",
    name: "Search Filters",
    description: "Prueba filtros de busqueda por CarbyneId y telefono",
    type: "web",
    credentialFields: [
      { key: "webEmail", label: "Email", type: "text", envVar: "webEmail" },
      { key: "webPassword", label: "Contraseña", type: "password", envVar: "webPassword" },
    ],
  },
  {
    id: "incident-creation",
    name: "Incident Creation",
    description: "Crea un incidente y valida su creacion",
    type: "web",
    credentialFields: [
      { key: "webEmail", label: "Email", type: "text", envVar: "webEmail" },
      { key: "webPassword", label: "Contraseña", type: "password", envVar: "webPassword" },
    ],
  },
  {
    id: "security-dashboard",
    name: "Security Dashboard",
    description: "Carga de metricas del dashboard de seguridad - valida tiempo de respuesta < 30s",
    type: "web",
    credentialFields: [
      { key: "webEmail", label: "Email", type: "text", envVar: "webEmail" },
      { key: "webPassword", label: "Contraseña", type: "password", envVar: "webPassword" },
    ],
  },
  {
    id: "combined-flow",
    name: "Combined Flow (Web + Mobile)",
    description: "Flow combinado - login web y mobile, verifica estado de agente, busca incidente con ubicación",
    type: "mix",
    credentialFields: [
      { key: "webEmail", label: "Email Web", type: "text", envVar: "webEmail" },
      { key: "webPassword", label: "Password Web", type: "password", envVar: "webPassword" },
      { key: "callsign", label: "Callsign Mobile", type: "text", envVar: "callsign" },
      { key: "password", label: "Password Mobile", type: "password", envVar: "password" },
    ],
  },
];

export function getCollection(id: CollectionId, projectId: string = "sales"): CollectionConfig | undefined {
  const baseCollection = BASE_COLLECTIONS.find((c) => c.id === id);
  if (!baseCollection) return undefined;

  const validProjects = ["sales", "amva", "medellin", "movilidad_medellin"];
  const project = validProjects.includes(projectId) ? projectId : "sales";

  // Medellín and Movilidad use web-style auth (email/password) instead of mobile (callsign/password)
  let collection = { ...baseCollection };
  const isMedellinProject = project === "medellin" || project === "movilidad_medellin";
  if (isMedellinProject && id === "auth") {
    collection = {
      ...collection,
      type: "web" as CollectionType,
      credentialFields: [
        { key: "webEmail", label: "Email", type: "text", envVar: "webEmail" },
        { key: "webPassword", label: "Contraseña", type: "password", envVar: "webPassword" },
      ],
    };
  }

  const collectionFile = path.join(
    COLLECTIONS_DIR,
    project,
    `${id}.postman_collection.json`
  );

  // Mobile env: sales.postman_environment.json
  // Web env: web.sales.postman_environment.json
  // Combined: combined.sales.postman_environment.json
  let envPrefix = collection.type === "mobile" ? "" : `web.`;
  if (id === "combined-flow") {
    envPrefix = "combined.";
  }
  const environmentFile = path.join(
    ENVIRONMENTS_DIR,
    `${envPrefix}${project}.postman_environment.json`
  );

  return {
    ...collection,
    collectionFile,
    environmentFile,
    projectId: project,
  };
}

export function getAvailableFlows(projectId: string): CollectionConfig[] {
  const validProjects = ["sales", "amva", "medellin", "movilidad_medellin"];
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
