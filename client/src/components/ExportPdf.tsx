import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePdfUrl, generateDocxUrl } from "@/lib/exportUtils";

interface ExportPdfProps {
  examId: number;
  examTitle: string;
}

export function ExportPdf({ examId, examTitle }: ExportPdfProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "docx">("pdf");
  const [exportType, setExportType] = useState<"exam" | "results">("exam");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsLoading(true);
      
      // Generate URL based on format
      const url = exportFormat === "pdf" 
        ? await generatePdfUrl(examId, exportType)
        : await generateDocxUrl(examId, exportType);
      
      // Create a temporary link element and trigger a download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${examTitle.replace(/\s+/g, "_")}_${exportType}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير الاختبار بصيغة ${exportFormat.toUpperCase()} بنجاح`,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "فشل التصدير",
        description: "حدث خطأ أثناء تصدير الاختبار، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="ml-2 h-4 w-4" />
          تصدير
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تصدير الاختبار</DialogTitle>
          <DialogDescription>
            اختر صيغة التصدير ونوع المستند الذي ترغب في تصديره
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="format">صيغة التصدير</Label>
            <Select
              value={exportFormat}
              onValueChange={(value: "pdf" | "docx") => setExportFormat(value)}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="اختر صيغة التصدير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">Word (DOCX)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>محتوى التصدير</Label>
            <RadioGroup
              value={exportType}
              onValueChange={(value: "exam" | "results") => setExportType(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="exam" id="export-exam" />
                <Label htmlFor="export-exam" className="cursor-pointer">نموذج الاختبار</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="results" id="export-results" />
                <Label htmlFor="export-results" className="cursor-pointer">نتائج الطلاب</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsDialogOpen(false)}
          >
            إلغاء
          </Button>
          <Button type="button" onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="ml-2 h-4 w-4" />
                تصدير {exportFormat === "pdf" ? "PDF" : "Word"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
