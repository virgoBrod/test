import { initDb, db } from "@/lib/db";

interface ProjectStatus {
  id: string;
  name: string;
  status: "online" | "partial" | "offline";
  mobileOnline: boolean;
  webOnline: boolean;
}

const HEALTH_ENDPOINT = "/api/health";

async function checkHealth(url: string, timeout = 3000): Promise<boolean> {
  if (!url) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(`${url}${HEALTH_ENDPOINT}`, {
      signal: controller.signal,
      mode: "no-cors",
    });
    clearTimeout(timeoutId);
    return response.ok || response.type === "opaque";
  } catch {
    return false;
  }
}

export async function GET() {
  await initDb();
  const rows = await db.execute({ sql: `SELECT id, name, base_url_mobile, base_url_web FROM projects ORDER BY name` });

  const statuses = await Promise.all(
    rows.rows.map(async (project): Promise<ProjectStatus> => {
      const mobileUrl = project.base_url_mobile as string;
      const webUrl = project.base_url_web as string;

      const [mobileOnline, webOnline] = await Promise.all([
        checkHealth(mobileUrl),
        checkHealth(webUrl),
      ]);

      let status: "online" | "partial" | "offline";
      if (mobileOnline && webOnline) {
        status = "online";
      } else if (mobileOnline || webOnline) {
        status = "partial";
      } else {
        status = "offline";
      }

      return {
        id: project.id as string,
        name: project.name as string,
        status,
        mobileOnline,
        webOnline,
      };
    })
  );

  return Response.json(statuses);
}
