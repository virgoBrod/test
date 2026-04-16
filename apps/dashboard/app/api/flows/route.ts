import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

interface Flow {
  id: string;
  name: string;
  type: "mobile" | "web";
  hasAssertions: boolean;
}

interface ProjectFlows {
  projectId: string;
  flows: Flow[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("project");

  if (!projectId) {
    return Response.json({ error: "Project ID is required" }, { status: 400 });
  }

  const validProjects = ["sales", "movilidad_medellin", "medellin", "lv", "amva"];
  if (!validProjects.includes(projectId)) {
    return Response.json({ error: "Invalid project" }, { status: 400 });
  }

  const collectionsDir = path.join(
    process.cwd(),
    "..",
    "..",
    "apps",
    "backend",
    "collections",
    projectId
  );

  const flows: Flow[] = [];

  if (fs.existsSync(collectionsDir)) {
    const files = fs.readdirSync(collectionsDir);
    
    files.forEach((file) => {
      if (file.endsWith(".postman_collection.json")) {
        const flowName = file.replace(".postman_collection.json", "");
        const filePath = path.join(collectionsDir, file);
        
        try {
          const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          const hasRequests = content.item && content.item.length > 0;
          
          let type: "mobile" | "web" = "mobile";
          if (flowName.includes("web")) {
            type = "web";
          } else if (flowName.includes("mobile")) {
            type = "mobile";
          } else if (flowName === "auth") {
            type = "mobile";
          }

          flows.push({
            id: flowName,
            name: formatFlowName(flowName),
            type,
            hasAssertions: hasRequests,
          });
        } catch {
          flows.push({
            id: flowName,
            name: formatFlowName(flowName),
            type: flowName.includes("web") ? "web" : "mobile",
            hasAssertions: false,
          });
        }
      }
    });
  }

  const result: ProjectFlows = {
    projectId,
    flows,
  };

  return Response.json(result);
}

function formatFlowName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
