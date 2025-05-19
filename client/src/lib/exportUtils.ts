import { apiRequest } from "@/lib/queryClient";

/**
 * Generates PDF file URL for an exam or its results
 * @param examId The ID of the exam to export
 * @param type Export type: 'exam' for the exam content, 'results' for student results
 * @returns URL to download the generated PDF
 */
export async function generatePdfUrl(examId: number, type: "exam" | "results"): Promise<string> {
  try {
    // Generate URL with query params
    const url = `/api/exams/${examId}/export?format=pdf${type === "results" ? "&includeResults=true" : ""}`;
    
    // For PDF generation, we need to return the URL directly
    // The browser will handle the download through an anchor tag
    return url;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

/**
 * Generates DOCX file URL for an exam or its results
 * @param examId The ID of the exam to export
 * @param type Export type: 'exam' for the exam content, 'results' for student results
 * @returns URL to download the generated DOCX
 */
export async function generateDocxUrl(examId: number, type: "exam" | "results"): Promise<string> {
  try {
    // Generate URL with query params
    const url = `/api/exams/${examId}/export?format=docx${type === "results" ? "&includeResults=true" : ""}`;
    
    // For DOCX generation, we return the URL directly
    // The browser will handle the download through an anchor tag
    return url;
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw new Error("Failed to generate DOCX");
  }
}

/**
 * Formats the content for Arabic PDF export
 * This handles RTL formatting and proper Arabic text rendering
 * @param content The content to format
 * @returns Formatted content ready for PDF export
 */
export function formatArabicPdfContent(content: string): string {
  // Add RTL markers to ensure proper text direction
  return `\u202B${content}\u202C`;
}

/**
 * Generates a filename for the exported document
 * @param examTitle The title of the exam
 * @param type Export type (exam or results)
 * @param format File format (pdf or docx)
 * @returns A sanitized filename
 */
export function generateExportFilename(
  examTitle: string, 
  type: "exam" | "results", 
  format: "pdf" | "docx"
): string {
  // Remove special characters and spaces
  const sanitizedTitle = examTitle
    .replace(/[^\u0600-\u06FFa-zA-Z0-9_]/g, "_")
    .replace(/_{2,}/g, "_");
  
  const typeText = type === "exam" ? "نموذج" : "نتائج";
  const date = new Date().toISOString().slice(0, 10);
  
  return `${typeText}_${sanitizedTitle}_${date}.${format}`;
}

/**
 * Preview the generated PDF in a new tab instead of downloading
 * @param examId The ID of the exam to preview
 * @param type Export type (exam or results)
 */
export function previewPdf(examId: number, type: "exam" | "results"): void {
  const url = `/api/exams/${examId}/export?format=pdf${type === "results" ? "&includeResults=true" : ""}&preview=true`;
  window.open(url, "_blank");
}
