import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/Loader";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import {
  Clock,
  AlertTriangle,
  FileQuestion,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExamQuestion {
  id: number;
  examId: number;
  type: string;
  text: string;
  options: string[] | null;
  correctAnswers: any;
  marks: number;
  order: number;
}

interface ExamData {
  id: number;
  code: string;
  title: string;
  subject: string;
  description: string;
  instructions: string;
  duration: number;
  attachment: string | null;
  creatorId: number;
}

export default function TakeExam({ code }: { code: string }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isTimeUpDialogOpen, setIsTimeUpDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Fetch exam data
  const {
    data: exam,
    isLoading: isExamLoading,
    error: examError,
  } = useQuery<ExamData>({
    queryKey: [`/api/exams/code/${code}`],
    enabled: !!code,
  });

  // Fetch questions
  const {
    data: questions,
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useQuery<ExamQuestion[]>({
    queryKey: [exam ? `/api/exams/${exam.id}/questions` : null],
    enabled: !!exam,
  });

  // Start exam mutation
  const startExamMutation = useMutation({
    mutationFn: async () => {
      if (!exam || !user) return null;
      
      const res = await apiRequest("POST", `/api/exams/${exam.id}/submissions`, {
        examId: exam.id,
        userId: user.id,
      });
      
      return await res.json();
    },
    onSuccess: (data) => {
      if (data) {
        setSubmissionId(data.id);
        setExamStarted(true);
        // Initialize timer
        setTimeLeft(exam?.duration ? exam.duration * 60 : null);
      }
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء بدء الاختبار",
        variant: "destructive",
      });
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: number; answer: any }) => {
      if (!submissionId) return null;
      
      const res = await apiRequest("POST", `/api/submissions/${submissionId}/answers`, {
        submissionId,
        questionId,
        answer,
      });
      
      return await res.json();
    },
  });

  // Complete exam mutation
  const completeExamMutation = useMutation({
    mutationFn: async () => {
      if (!submissionId) return null;
      
      const res = await apiRequest("POST", `/api/submissions/${submissionId}/complete`, {});
      
      return await res.json();
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "تم إرسال الإجابات",
          description: "تم الانتهاء من الاختبار بنجاح",
        });
        
        // Navigate to results page
        navigate(`/exams/results/${submissionId}`);
      }
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الإجابات",
        variant: "destructive",
      });
    },
  });

  // Timer effect
  useEffect(() => {
    if (!examStarted || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          setIsTimeUpDialogOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  // Format time left
  const formatTimeLeft = () => {
    if (timeLeft === null) return "--:--:--";
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  const startExam = () => {
    startExamMutation.mutate();
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = async () => {
    const currentQuestion = questions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    // Save the current answer
    if (answers[currentQuestion.id] !== undefined) {
      submitAnswerMutation.mutate({
        questionId: currentQuestion.id,
        answer: answers[currentQuestion.id],
      });
    }

    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    // Save the last answer if not saved yet
    const currentQuestion = questions?.[currentQuestionIndex];
    if (currentQuestion && answers[currentQuestion.id] !== undefined) {
      await submitAnswerMutation.mutateAsync({
        questionId: currentQuestion.id,
        answer: answers[currentQuestion.id],
      });
    }

    // Complete the exam
    completeExamMutation.mutate();
  };

  // Handle forced submission when time is up
  const handleTimeUp = () => {
    setIsTimeUpDialogOpen(false);
    handleSubmitExam();
  };

  if (isExamLoading || isQuestionsLoading) {
    return <Loader />;
  }

  if (examError || questionsError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>
            حدث خطأ أثناء تحميل الاختبار. تأكد من صحة رمز الاختبار وحاول مرة أخرى.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/")}>العودة للصفحة الرئيسية</Button>
      </div>
    );
  }

  if (!exam || !questions) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>
            الاختبار غير موجود. تأكد من صحة رمز الاختبار وحاول مرة أخرى.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/")}>العودة للصفحة الرئيسية</Button>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {exam.title}
            </h1>
            <div className="mb-6">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                {exam.subject}
              </p>
              {exam.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {exam.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center">
                <Clock className="ml-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">المدة</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDuration(exam.duration)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FileQuestion className="ml-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    عدد الأسئلة
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {questions.length} سؤال
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تنبيه</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    لا يمكنك المغادرة أثناء الاختبار
                  </p>
                </div>
              </div>
            </div>

            {exam.instructions && (
              <div className="mb-6 bg-gray-50 dark:bg-darkMode-700 p-4 rounded-lg border border-gray-200 dark:border-darkMode-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  تعليمات الاختبار:
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {exam.instructions}
                </p>
              </div>
            )}

            {exam.attachment && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  المرفقات:
                </h3>
                <a
                  href={exam.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                >
                  <i className="fas fa-file-download ml-2"></i>
                  تحميل المرفق
                </a>
              </div>
            )}

            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>تنبيه هام</AlertTitle>
              <AlertDescription>
                بمجرد بدء الاختبار، سيبدأ العد التنازلي ولن يمكنك إيقافه. تأكد من أنك جاهز قبل البدء.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={startExam} 
              disabled={startExamMutation.isPending}
              className="w-full"
              size="lg"
            >
              {startExamMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري بدء الاختبار...
                </>
              ) : (
                "بدء الاختبار"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exam is started
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {exam.title}
        </h1>
        <div className="mt-4 md:mt-0 flex items-center py-2 px-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-full">
          <Clock className="ml-2 h-5 w-5" />
          <span className="font-mono font-bold">{formatTimeLeft()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Questions navigation sidebar */}
        <div className="md:col-span-1 order-2 md:order-1">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                الأسئلة
              </h2>
              <div className="grid grid-cols-5 md:grid-cols-3 gap-2">
                {questions.map((q, index) => (
                  <Button
                    key={q.id}
                    variant={currentQuestionIndex === index ? "default" : answers[q.id] !== undefined ? "outline" : "ghost"}
                    size="sm"
                    className={`h-10 w-10 p-0 font-medium ${
                      answers[q.id] !== undefined
                        ? "border-2 border-primary-500 dark:border-primary-400"
                        : ""
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-primary-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    السؤال الحالي
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-primary-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    تمت الإجابة
                  </span>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                variant="destructive"
                onClick={() => setIsSubmitDialogOpen(true)}
              >
                إنهاء الاختبار
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current question */}
        <div className="md:col-span-4 order-1 md:order-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  السؤال {currentQuestionIndex + 1} من {questions.length}
                </h2>
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 text-sm px-2 py-1 rounded">
                  {currentQuestion.marks} درجة
                </span>
              </div>

              <p className="text-gray-800 dark:text-gray-200 mb-6 text-lg">
                {currentQuestion.text}
              </p>

              {currentQuestion.type === "essay" && (
                <div className="mb-4">
                  <Textarea
                    placeholder="أدخل إجابتك هنا..."
                    rows={6}
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    className="resize-none"
                  />
                </div>
              )}

              {currentQuestion.type === "multipleChoice" && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString() || ""}
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion.id, value)
                  }
                  className="space-y-3"
                >
                  {(currentQuestion.options as string[]).map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="text-gray-700 dark:text-gray-300">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "trueFalse" && (
                <RadioGroup
                  value={
                    answers[currentQuestion.id] !== undefined
                      ? answers[currentQuestion.id].toString()
                      : ""
                  }
                  onValueChange={(value) =>
                    handleAnswerChange(
                      currentQuestion.id,
                      value === "true" ? true : false
                    )
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="text-gray-700 dark:text-gray-300">
                      صح
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="text-gray-700 dark:text-gray-300">
                      خطأ
                    </Label>
                  </div>
                </RadioGroup>
              )}

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  السؤال السابق
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button onClick={handleNextQuestion}>
                    السؤال التالي
                  </Button>
                ) : (
                  <Button onClick={() => setIsSubmitDialogOpen(true)}>
                    إنهاء الاختبار
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من إنهاء الاختبار؟</AlertDialogTitle>
            <AlertDialogDescription>
              بعد إنهاء الاختبار، لن تتمكن من العودة لتعديل إجاباتك.
              {questions.filter((q) => answers[q.id] === undefined).length > 0 && (
                <div className="mt-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="inline-block ml-1 h-4 w-4" />
                  هناك {questions.filter((q) => answers[q.id] === undefined).length} أسئلة لم تتم الإجابة عليها بعد.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>العودة للاختبار</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitExam}
              disabled={completeExamMutation.isPending}
            >
              {completeExamMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الإرسال...
                </>
              ) : (
                <>
                  <CheckCircle2 className="ml-2 h-4 w-4" /> إنهاء وإرسال الإجابات
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
      <AlertDialog open={isTimeUpDialogOpen} onOpenChange={setIsTimeUpDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>انتهى الوقت!</AlertDialogTitle>
            <AlertDialogDescription>
              لقد انتهى الوقت المخصص للاختبار. سيتم إرسال إجاباتك الآن.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleTimeUp}>
              {completeExamMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الإرسال...
                </>
              ) : (
                "موافق"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
