const GLPI_API_URL = process.env.GLPI_API_URL || "";
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN || "";
const GLPI_USER_TOKEN = process.env.GLPI_USER_TOKEN || "";
const GLPI_ENTITY_ID = parseInt(process.env.GLPI_ENTITY_ID || "0", 10);

const CATEGORIES: Record<string, string> = {
  APEX: process.env.GLPI_CATEGORY_APEX || "1",
  CAPACIDADES: process.env.GLPI_CATEGORY_CAPACIDADES || "2",
  CHAT_SILENCIOSO: process.env.GLPI_CATEGORY_CHAT_SILENCIOSO || "12",
  EVENT_ASSIST: process.env.GLPI_CATEGORY_EVENT_ASSIST || "9",
  INCIDENTES: process.env.GLPI_CATEGORY_INCIDENTES || "3",
  CALL_AI: process.env.GLPI_CATEGORY_CALL_AI || "7",
  DESPACHO: process.env.GLPI_CATEGORY_DESPACHO || "8",
  SECURITY_DASHBOARD: process.env.GLPI_CATEGORY_SECURITY_DASHBOARD || "6",
  RESPONDER_CONNECT: process.env.GLPI_CATEGORY_RESPONDER_CONNECT || "4",
  TRANSCRIPCION: process.env.GLPI_CATEGORY_TRANSCRIPCION || "13",
  UBICACION: process.env.GLPI_CATEGORY_UBICACION || "10",
  VIDEO: process.env.GLPI_CATEGORY_VIDEO || "11",
};

async function initSession(): Promise<string> {
  const url = `${GLPI_API_URL}/initSession`;
  console.log("[GLPI] Calling initSession:", url);
  
  const res = await fetch(url, {
    headers: {
      "App-Token": GLPI_APP_TOKEN,
      Authorization: `user_token ${GLPI_USER_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  const responseText = await res.text();
  console.log("[GLPI] initSession response status:", res.status);
  console.log("[GLPI] initSession response body:", responseText.substring(0, 500));

  if (!res.ok) {
    throw new Error(`GLPI initSession failed (${res.status}): ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`GLPI returned non-JSON: ${responseText.substring(0, 200)}`);
  }

  if (!data.session_token) {
    throw new Error("GLPI did not return a session_token");
  }

  return data.session_token;
}

interface CreateTicketInput {
  name: string;
  content: string;
  categoryKey?: string;
  url?: string;
  method?: string;
  error?: string | null;
}

export async function createTicket(input: CreateTicketInput): Promise<{ id: number; url: string }> {
  const sessionToken = await initSession();

  const categoryId = input.categoryKey ? CATEGORIES[input.categoryKey] : CATEGORIES.INCIDENTES;

  const ticketData = {
    input: {
      name: input.name,
      content: input.content,
      entities_id: GLPI_ENTITY_ID,
      itilcategories_id: parseInt(categoryId, 10),
      _users_id_requester: 0,
    },
  };

  const res = await fetch(`${GLPI_API_URL}/Ticket`, {
    method: "POST",
    headers: {
      "App-Token": GLPI_APP_TOKEN,
      "Session-Token": sessionToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GLPI createTicket failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const ticketId = data.id;

  return {
    id: ticketId,
    url: `${GLPI_API_URL.replace("/apirest.php", "")}/front/ticket.form.php?id=${ticketId}`,
  };
}

export async function killSession(sessionToken: string): Promise<void> {
  try {
    await fetch(`${GLPI_API_URL}/killSession`, {
      headers: {
        "App-Token": GLPI_APP_TOKEN,
        "Session-Token": sessionToken,
      },
    });
  } catch {
    // ignore cleanup errors
  }
}
