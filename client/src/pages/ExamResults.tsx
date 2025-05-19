import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsTable } from "@/components/ResultsTable";
import { ExamDetails } from "@/components/ExamDetails";
import { ExportPdf } from "@/components/ExportPdf";
import { Loader } from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Users,
  Clock,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { calculatePercentage, calculateTimeDifference } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

interface Exam {
  id: number;
  code: string;
  title: string;
  subject: string;
  description: string;
  instructions: string;
  duration: number;
  attachment: string | null;
  creatorId: number;
  createdAt: string;
}

interface Question {
  id: number;
  examId: number;
  type: string;
  text: string;
  options: string[] | null;
  correctAnswers: any;
  marks: number;
  order: number;
}

export default function ExamResults({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("submissions");
  const { user } = useAuth();

  // Fetch exam data
  const {
    data: exam,
    isLoading: isExamLoading,
    error: examError,
  } = useQuery<Exam>({
    queryKey: [`/api/exams/${id}`],
    enabled: !!id,
  });

  // Fetch questions
  const {
    data: questions,
    isLoading: isQuestionsLoading,
  } = useQuery<Question[]>({
    queryKey: [`/api/exams/${id}/questions`],
    enabled: !!id,
  });

  // Fetch submissions
  const {
    data: submissions,
    isLoading: isSubmissionsLoading,
  } = useQuery<Submission[]>({
    queryKey: [`/api/exams/${id}/submissions`],
    enabled: !!id,
  });

  const isLoading = isExamLoading || isQuestionsLoading || isSubmissionsLoading;

  if (isLoading) {
    return <Loader />;
  }

  if (examError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>
            حدث خطأ أثناء تحميل بيانات الاختبار. يرجى المحاولة مرة أخرى.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>
            الاختبار غير موجود أو ليس لديك صلاحية للوصول إليه.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate stats
  const completedSubmissions = submissions?.filter((s) => s.completed) || [];
  const totalMarks = questions?.reduce((sum, q) => sum + q.marks, 0) || 0;
  
  const averageScore = completedSubmissions.length
    ? completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSubmissions.length
    : 0;
  
  const averagePercentage = calculatePercentage(averageScore, totalMarks);
  
  const highestScore = completedSubmissions.length
    ? Math.max(...completedSubmissions.map((s) => s.score || 0))
    : 0;
  
  const highestPercentage = calculatePercentage(highestScore, totalMarks);
  
  const averageTime = completedSubmissions.length
    ? completedSubmissions.reduce((sum, s) => {
        if (s.startTime && s.endTime) {
          const timeDiff = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
          return sum + timeDiff;
        }
        return sum;
      }, 0) / completedSubmissions.length
    : 0;
  
  const averageMinutes = Math.round(averageTime / (1000 * 60));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {exam.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {exam.subject} • رمز الاختبار: {exam.code}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <ExportPdf examId={parseInt(id)} examTitle={exam.title} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4 h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  عدد المشاركين
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {submissions?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4 h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  متوسط الدرجات
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {averagePercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4 h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  أعلى درجة
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {highestPercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4 h-12 w-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  متوسط الوقت
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {averageMinutes} دقيقة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="submissions">
            <Users className="ml-2 h-4 w-4" />
            المشاركون ({submissions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="details">
            <FileText className="ml-2 h-4 w-4" />
            تفاصيل الاختبار
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="ml-2 h-4 w-4" />
            التحليلات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          {submissions && submissions.length > 0 ? (
            <ResultsTable submissions={submissions} totalMarks={totalMarks} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center py-12">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  لا توجد مشاركات بعد
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  لم يقم أحد بالمشاركة في هذا الاختبار بعد. شارك رمز الاختبار مع الطلاب ليتمكنوا من البدء.
                </p>
                <div className="flex justify-center">
                  <Card className="w-72 bg-gray-50 dark:bg-darkMode-700">
                    <CardContent className="p-4">
                      <p className="text-center text-lg font-bold text-primary-600 dark:text-primary-400 mb-2">
                        رمز الاختبار
                      </p>
                      <p className="text-center text-3xl font-mono">{exam.code}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details">
          <ExamDetails exam={exam} questions={questions || []} totalMarks={totalMarks} />
        </TabsContent>

        <TabsContent value="analytics">
          {completedSubmissions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الاختبار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      توزيع الدرجات
                    </h3>
                    <div className="h-64 flex items-end space-x-2 space-x-reverse justify-between">
                      {/* Mock chart for grade distribution */}
                      {[
                        { range: "0-20", count: completedSubmissions.filter(s => (s.score || 0) / totalMarks * 100 <= 20).length },
                        { range: "21-40", count: completedSubmissions.filter(s => (s.score || 0) / totalMarks * 100 > 20 && (s.score || 0) / totalMarks * 100 <= 40).length },
                        { range: "41-60", count: completedSubmissions.filter(s => (s.score || 0) / totalMarks * 100 > 40 && (s.score || 0) / totalMarks * 100 <= 60).length },
                        { range: "61-80", count: completedSubmissions.filter(s => (s.score || 0) / totalMarks * 100 > 60 && (s.score || 0) / totalMarks * 100 <= 80).length },
                        { range: "81-100", count: completedSubmissions.filter(s => (s.score || 0) / totalMarks * 100 > 80).length }
                      ].map((bar, index) => {
                        const maxCount = Math.max(...completedSubmissions.map(s => (s.score || 0) / totalMarks * 100));
                        const percentage = bar.count ? (bar.count / completedSubmissions.length) * 100 : 0;
                        const height = percentage > 0 ? Math.max(20, percentage) : 0;
                        
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="w-16 rounded-t-md bg-primary-500 dark:bg-primary-600" 
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{bar.range}%</div>
                            <div className="mt-1 text-sm font-semibold">{bar.count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      معدل الإكمال
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success-500 rounded-full"
                          style={{
                            width: `${
                              (completedSubmissions.length / (submissions?.length || 1)) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-700 dark:text-gray-300 font-bold">
                        {Math.round(
                          (completedSubmissions.length / (submissions?.length || 1)) * 100
                        )}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {completedSubmissions.length} من أصل {submissions?.length || 0} قاموا بإكمال الاختبار
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      تقييم أداء الاختبار
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gray-50 dark:bg-darkMode-700">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            نسبة النجاح
                          </p>
                          <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                            {Math.round(
                              (completedSubmissions.filter(
                                (s) => ((s.score || 0) / totalMarks) * 100 >= 60
                              ).length /
                                completedSubmissions.length) *
                                100
                            ) || 0}%
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-50 dark:bg-darkMode-700">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            أسرع وقت للإنجاز
                          </p>
                          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {completedSubmissions.length
                              ? Math.min(
                                  ...completedSubmissions
                                    .filter((s) => s.startTime && s.endTime)
                                    .map((s) =>
                                      Math.round(
                                        (new Date(s.endTime!).getTime() -
                                          new Date(s.startTime).getTime()) /
                                          (1000 * 60)
                                      )
                                    )
                                )
                              : 0}{" "}
                            دقيقة
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-50 dark:bg-darkMode-700">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            معدل الإكمال
                          </p>
                          <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                            {Math.round(
                              (completedSubmissions.length / exam.duration) * 100
                            ) / 100}{" "}
                            / دقيقة
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  لا توجد بيانات كافية
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  لا توجد بيانات كافية لعرض التحليلات. يحتاج الطلاب إلى إكمال الاختبار لعرض البيانات.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
