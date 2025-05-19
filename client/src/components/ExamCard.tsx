import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2 } from "lucide-react";

interface ExamCardProps {
  id: number;
  title: string;
  subject: string;
  description: string;
  code: string;
  createdAt: string;
  participantsCount?: number;
  onView?: () => void;
}

export function ExamCard({
  id,
  title,
  subject,
  description,
  code,
  createdAt,
  participantsCount = 0,
  onView,
}: ExamCardProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();

  const examLink = `${window.location.origin}/exams/take/${code}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ " + (text === code ? "الرمز" : "الرابط") + " إلى الحافظة",
    });
  };

  return (
    <Card className="bg-white dark:bg-darkMode-800 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
            {subject}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>
            <i className="fas fa-calendar-days ml-1"></i> {formatDate(createdAt)}
          </span>
          <span>
            <i className="fas fa-users ml-1"></i> {participantsCount} مشارك
          </span>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Link href={`/exams/results/${id}`}>
            <Button className="flex-1" onClick={onView}>
              عرض
            </Button>
          </Link>
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Share2 className="ml-2 h-4 w-4" />
                مشاركة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>مشاركة الاختبار</DialogTitle>
                <DialogDescription>
                  يمكنك مشاركة الاختبار من خلال الرمز أو الرابط المباشر
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">
                      رمز الاختبار
                    </label>
                    <div className="flex items-center">
                      <Input
                        value={code}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(code)}
                        className="mr-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">نسخ الرمز</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    رابط الاختبار
                  </label>
                  <div className="flex items-center">
                    <Input
                      value={examLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(examLink)}
                      className="mr-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">نسخ الرابط</span>
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setIsShareDialogOpen(false)}
                >
                  إغلاق
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
