import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Execution, ExecutionResult } from "@/types";

export function generateTestReportPDF(execution: Execution, results: ExecutionResult[]) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text(`${execution.collection} - Test Report`, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString("es-AR")}`, 14, 30);

  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  const startDate = new Date(execution.started_at);
  doc.text(`Execution Date: ${startDate.toLocaleDateString("es-AR")} ${startDate.toLocaleTimeString("es-AR")}`, 14, 40);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, 52);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const statusColor = execution.status === "passed" ? [34, 197, 94] : [239, 68, 68];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Status: ${execution.status === "passed" ? "PASSED" : "FAILED"}`, 14, 60);

  doc.setTextColor(33, 33, 33);
  doc.text(`Total: ${execution.total}`, 14, 68);
  doc.setTextColor(34, 197, 94);
  doc.text(`Passed: ${execution.passed}`, 60, 68);
  doc.setTextColor(239, 68, 68);
  doc.text(`Failed: ${execution.failed}`, 100, 68);
  doc.setTextColor(33, 33, 33);
  doc.text(`Duration: ${(execution.duration_ms / 1000).toFixed(2)}s`, 140, 68);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Request Details", 14, 82);

  const tableData = results.map((r) => [
    r.request_name,
    r.method,
    r.status_code?.toString() ?? "-",
    `${r.duration_ms}ms`,
    r.passed ? "✓" : "✗",
  ]);

  autoTable(doc, {
    startY: 86,
    head: [["Request", "Method", "Status", "Duration", "Result"]],
    body: tableData,
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
    },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === "body") {
        const val = data.cell.text[0];
        if (val === "✓") {
          data.cell.styles.textColor = [34, 197, 94];
          data.cell.styles.fontStyle = "bold";
        } else if (val === "✗") {
          data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = "bold";
        }
      }
      if (data.column.index === 2 && data.section === "body") {
        const code = parseInt(data.cell.text[0]);
        if (code >= 200 && code < 300) {
          data.cell.styles.textColor = [34, 197, 94];
        } else if (code >= 400) {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
  }

  return doc;
}

export function downloadPDF(execution: Execution, results: ExecutionResult[]) {
  const doc = generateTestReportPDF(execution, results);
  const filename = `${execution.collection.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
