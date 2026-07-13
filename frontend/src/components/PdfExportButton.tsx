import { useState, type RefObject } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/Button";

interface PdfExportButtonProps {
  targetRef: RefObject<HTMLElement>;
  fileName: string;
  label?: string;
}

export function PdfExportButton({
  targetRef,
  fileName,
  label = "Download PDF Report",
}: PdfExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    const node = targetRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleExport} loading={exporting}>
      {!exporting && "⬇"} {label}
    </Button>
  );
}
