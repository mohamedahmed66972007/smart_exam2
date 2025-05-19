import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/50 z-50">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-2 text-lg font-medium text-primary">جاري التحميل...</p>
      </div>
    </div>
  );
}
