import path from "path";
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
  "environments"
);

export const COLLECTIONS: CollectionConfig[] = [
  {
    id: "auth",
    name: "Auth",
    description: "Flujo de autenticación general",
    collectionFile: path.join(COLLECTIONS_DIR, "auth.postman_collection.json"),
    environmentFile: path.join(
      ENVIRONMENTS_DIR,
      "mobile.postman_environment.json"
    ),
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
    collectionFile: path.join(
      COLLECTIONS_DIR,
      "mobile-flow.postman_collection.json"
    ),
    environmentFile: path.join(
      ENVIRONMENTS_DIR,
      "mobile.postman_environment.json"
    ),
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
    collectionFile: path.join(
      COLLECTIONS_DIR,
      "web-flow.postman_collection.json"
    ),
    environmentFile: path.join(
      ENVIRONMENTS_DIR,
      "web.postman_environment.json"
    ),
    type: "web",
    credentialFields: [
      { key: "webEmail", label: "Email", type: "text", envVar: "webEmail" },
      { key: "webPassword", label: "Contraseña", type: "password", envVar: "webPassword" },
    ],
  },
];

export function getCollection(id: CollectionId): CollectionConfig | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}
