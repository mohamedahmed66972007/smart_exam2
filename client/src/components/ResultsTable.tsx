import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDateTime, calculateTimeDifference, calculatePercentage, getScoreColor } from "@/lib/utils";
import { Search, ArrowUpDown, Eye, FileText, DownloadCloud } from "lucide-react";

interface User {
  id: number;
  username: string;
  name: string;
}

interface Submission {
  id: number;
  examId: number;
  userId: number;
  startTime: string;
  endTime?: string;
  score?: number;
  completed: boolean;
  user?: User;
}

interface ResultsTableProps {
  submissions: Submission[];
  totalMarks: number;
}

export function ResultsTable({ submissions, totalMarks }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Submission | "percentage" | "name" | "time";
    direction: "asc" | "desc";
  }>({ key: "startTime", direction: "desc" });
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const { toast } = useToast();

  // If no submissions, show empty state
  if (!submissions.length) {
    return (
      <Card className="bg-gray-50 dark:bg-darkMode-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">لا توجد نتائج بعد</p>
        </CardContent>
      </Card>
    );
  }

  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter((submission) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      submission.user?.name.toLowerCase().includes(searchLower) ||
      submission.user?.username.toLowerCase().includes(searchLower)
    );
  });

  // Sort submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortConfig.key === "percentage") {
      aValue = a.score ? (a.score / totalMarks) * 100 : 0;
      bValue = b.score ? (b.score / totalMarks) * 100 : 0;
    } else if (sortConfig.key === "name") {
      aValue = a.user?.name || "";
      bValue = b.user?.name || "";
    } else if (sortConfig.key === "time") {
      if (a.startTime && a.endTime && b.startTime && b.endTime) {
        aValue = new Date(a.endTime).getTime() - new Date(a.startTime).getTime();
        bValue = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
      } else {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    } else {
      aValue = a[sortConfig.key] || "";
      bValue = b[sortConfig.key] || "";
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Handle sort
  const requestSort = (key: keyof Submission | "percentage" | "name" | "time") => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Copy results to clipboard
  const copyResults = () => {
    let csvContent = "الاسم,البريد الإلكتروني,الدرجة,النسبة المئوية,الوقت,تاريخ التقديم\n";

    submissions.forEach((submission) => {
      const percentage = submission.score
        ? Math.round((submission.score / totalMarks) * 100)
        : 0;
      const time = submission.startTime && submission.endTime
        ? calculateTimeDifference(submission.startTime, submission.endTime)
        : "-";
      
      csvContent += `${submission.user?.name || "-"},${submission.user?.username || "-"},${submission.score || 0},${percentage}%,${time},${formatDateTime(submission.startTime)}\n`;
    });

    navigator.clipboard.writeText(csvContent);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النتائج إلى الحافظة",
    });
  };

  // View submission details
  const viewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>نتائج الاختبار</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="البحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-10"
              />
            </div>
            <Button variant="outline" onClick={copyResults}>
              <FileText className="ml-2 h-4 w-4" />
              نسخ النتائج
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("name")}
                    className="font-medium flex items-center hover:bg-transparent"
                  >
                    الاسم
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("percentage")}
                    className="font-medium flex items-center hover:bg-transparent"
                  >
                    الدرجة
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("time")}
                    className="font-medium flex items-center hover:bg-transparent"
                  >
                    الوقت
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("startTime")}
                    className="font-medium flex items-center hover:bg-transparent"
                  >
                    تاريخ التقديم
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSubmissions.map((submission, index) => {
                const percentage = submission.score
                  ? calculatePercentage(submission.score, totalMarks)
                  : 0;
                return (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {submission.user?.name || "مستخدم غير معروف"}
                    </TableCell>
                    <TableCell>
                      {submission.completed ? (
                        <div className="flex items-center">
                          <span
                            className={`font-medium ${getScoreColor(percentage)}`}
                          >
                            {submission.score || 0}/{totalMarks} ({percentage}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          لم يكتمل
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.startTime && submission.endTime ? (
                        calculateTimeDifference(
                          submission.startTime,
                          submission.endTime
                        )
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(submission.startTime)}
                    </TableCell>
                    <TableCell>
                      {submission.completed ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        >
                          مكتمل
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                        >
                          قيد التقدم
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">عرض التفاصيل</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>تفاصيل النتيجة</DialogTitle>
                            <DialogDescription>
                              بيانات إتمام الاختبار للطالب {submission.user?.name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSubmission && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-darkMode-700 rounded-lg">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    الطالب
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {selectedSubmission.user?.name}
                                  </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-darkMode-700 rounded-lg">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    الدرجة
                                  </p>
                                  <p className={`font-medium ${getScoreColor(
                                    selectedSubmission.score
                                      ? calculatePercentage(
                                          selectedSubmission.score,
                                          totalMarks
                                        )
                                      : 0
                                  )}`}>
                                    {selectedSubmission.score || 0}/{totalMarks} (
                                    {selectedSubmission.score
                                      ? calculatePercentage(
                                          selectedSubmission.score,
                                          totalMarks
                                        )
                                      : 0}
                                    %)
                                  </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-darkMode-700 rounded-lg">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    الوقت المستغرق
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {selectedSubmission.startTime &&
                                    selectedSubmission.endTime
                                      ? calculateTimeDifference(
                                          selectedSubmission.startTime,
                                          selectedSubmission.endTime
                                        )
                                      : "-"}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-darkMode-700 rounded-lg">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    وقت البدء
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDateTime(selectedSubmission.startTime)}
                                  </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-darkMode-700 rounded-lg">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    وقت الانتهاء
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {selectedSubmission.endTime
                                      ? formatDateTime(selectedSubmission.endTime)
                                      : "-"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button>
                                  <DownloadCloud className="ml-2 h-4 w-4" />
                                  تصدير النتيجة
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">
              لا توجد نتائج تطابق البحث
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
