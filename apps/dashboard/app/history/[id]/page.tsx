import Link from "next/link";
import ResponseBodyPanel from "@/components/ResponseBodyPanel";
import CreateTicketButton from "@/components/CreateTicketButton";

interface Assertion {
  name: string;
  passed: boolean;
  error?: string;
}

interface Result {
  id: number;
  request_name: string;
  url: string;
  method: string;
  status_code: number | null;
  duration_ms: number;
  passed: boolean;
  assertions: Assertion[];
  error: string | null;
  response_body: string | null;
}

interface Execution {
  id: number;
  collection: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  total: number;
  passed: number;
  failed: number;
  duration_ms: number;
}

async function getExecution(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/executions/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ execution: Execution; results: Result[] }>;
}

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getExecution(id);

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Ejecución no encontrada.</p>
          <Link href="/" className="text-indigo-600 text-sm mt-2 inline-block">
            ← Volver al dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { execution, results } = data;

  const startDate = new Date(execution.started_at);
  const formattedDate = startDate.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = startDate.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:underline mb-6 inline-block"
        >
          ← Volver al dashboard
        </Link>

        {/* Summary header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {execution.collection}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {formattedDate} · {formattedTime}
              </p>
            </div>
            <span
              className={`text-sm font-medium px-3 py-1.5 rounded-full ${
                execution.status === "passed"
                  ? "bg-green-100 text-green-700"
                  : execution.status === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {execution.status === "passed"
                ? "Todos pasaron"
                : execution.status === "failed"
                ? "Con fallos"
                : execution.status}
            </span>
          </div>

          <div className="flex gap-6 mt-5 text-sm">
            <div>
              <p className="text-gray-400">Total</p>
              <p className="text-xl font-semibold text-gray-900">
                {execution.total}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Pasaron</p>
              <p className="text-xl font-semibold text-green-600">
                {execution.passed}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Fallaron</p>
              <p className="text-xl font-semibold text-red-600">
                {execution.failed}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Duración</p>
              <p className="text-xl font-semibold text-gray-900">
                {execution.duration_ms > 0
                  ? `${(execution.duration_ms / 1000).toFixed(1)}s`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Results list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {results.map((result) => (
              <div key={result.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        result.passed ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {result.passed ? "✓" : "✗"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.request_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {result.method} {result.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {result.duration_ms}ms
                    </span>
                    {result.status_code && (
                      <span
                        className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                          result.status_code >= 200 && result.status_code < 300
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {result.status_code}
                      </span>
                    )}
                  </div>
                </div>

                {!result.passed && (
                  <div className="mt-3 ml-7 space-y-1.5">
                    {result.error && (
                      <div className="text-xs bg-red-50 text-red-700 rounded-lg px-3 py-2">
                        <span className="font-semibold">Error: </span>
                        {result.error}
                      </div>
                    )}
                    {result.assertions
                      .filter((a) => !a.passed)
                      .map((a, i) => (
                        <div
                          key={i}
                          className="text-xs bg-red-50 text-red-700 rounded-lg px-3 py-2"
                        >
                          <span className="font-semibold">{a.name}: </span>
                          {a.error}
                        </div>
                      ))}
                    <CreateTicketButton
                      requestName={result.request_name}
                      url={result.url}
                      method={result.method}
                      error={result.error}
                    />
                  </div>
                )}

                {result.passed && result.assertions.length > 0 && (
                  <div className="mt-2 ml-7 flex flex-wrap gap-1.5">
                    {result.assertions.map((a, i) => (
                      <span
                        key={i}
                        className="text-xs bg-green-50 text-green-700 rounded-full px-2 py-0.5"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}

                {result.response_body && (
                  <ResponseBodyPanel body={result.response_body} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
