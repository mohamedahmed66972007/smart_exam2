import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionForm } from "@/components/QuestionForm";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Save, FileUp, Clock, ArrowRight } from "lucide-react";
import { Question } from "@shared/schema";

type QuestionType = "essay" | "multipleChoice" | "trueFalse";

interface CreateExamProps {
  auth?: {
    user: any;
    isAuthenticated: boolean;
  };
}

export default function CreateExam({ auth }: CreateExamProps) {
  const [step, setStep] = useState(1);
  const [examData, setExamData] = useState({
    title: "",
    subject: "",
    description: "",
    instructions: "",
    duration: 60,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examId, setExamId] = useState<number | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get user data from global auth state
  const [user, setUser] = useState(window.appAuth?.user || null);

  // Load user data from global auth state if not already loaded
  useEffect(() => {
    if (!user && window.appAuth?.user) {
      setUser(window.appAuth.user);
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExamData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setExamData((prev) => ({ ...prev, duration: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentFile(e.target.files[0]);
    }
  };

  const handleNextStep = async () => {
    // Validate step 1
    if (step === 1) {
      if (!examData.title || !examData.subject || !examData.duration) {
        toast({
          title: "المعلومات غير مكتملة",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsSubmitting(true);
        const response = await apiRequest("POST", "/api/exams", {
          ...examData,
          creatorId: user?.id || window.appAuth?.user?.id,
        });
        
        const createdExam = await response.json();
        setExamId(createdExam.id);
        
        // Upload attachment if exists
        if (attachmentFile && createdExam.id) {
          const formData = new FormData();
          formData.append("file", attachmentFile);
          
          // Use the fetch API directly for file uploads
          await fetch(`/api/exams/${createdExam.id}/attachment`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        }
        
        setStep(2);
        toast({
          title: "تم حفظ معلومات الاختبار",
          description: "يمكنك الآن إضافة الأسئلة",
        });
      } catch (error) {
        toast({
          title: "خطأ في إنشاء الاختبار",
          description: "حدث خطأ أثناء حفظ معلومات الاختبار",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 2) {
      if (questions.length === 0) {
        toast({
          title: "لا توجد أسئلة",
          description: "يرجى إضافة سؤال واحد على الأقل",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAddQuestion = async (questionData: any) => {
    if (!examId) return;
    
    try {
      const response = await apiRequest("POST", `/api/exams/${examId}/questions`, {
        ...questionData,
        examId,
        order: questions.length + 1,
      });
      
      const newQuestion = await response.json();
      setQuestions((prev) => [...prev, newQuestion]);
      
      toast({
        title: "تمت إضافة السؤال",
        description: "تمت إضافة السؤال بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في إضافة السؤال",
        description: "حدث خطأ أثناء إضافة السؤال",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await apiRequest("DELETE", `/api/questions/${questionId}`, undefined);
      
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      
      toast({
        title: "تم حذف السؤال",
        description: "تم حذف السؤال بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في حذف السؤال",
        description: "حدث خطأ أثناء حذف السؤال",
        variant: "destructive",
      });
    }
  };

  const handleFinish = () => {
    toast({
      title: "تم إنشاء الاختبار",
      description: "تم إنشاء الاختبار بنجاح، يمكنك الآن مشاركته مع الطلاب",
    });
    navigate(`/exams/results/${examId}`);
  };

  const calculateTotalMarks = () => {
    return questions.reduce((total, q) => total + q.marks, 0);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        إنشاء اختبار جديد
      </h1>

      {/* Wizard Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 ${
                step >= 1
                  ? "bg-primary-500 text-white"
                  : "bg-gray-300 dark:bg-darkMode-700 text-gray-700 dark:text-gray-300"
              } rounded-full flex items-center justify-center`}
            >
              <span>1</span>
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                step >= 1
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              معلومات الاختبار
            </span>
          </div>

          <div
            className={`flex-1 h-1 mx-4 ${
              step > 1
                ? "bg-primary-200 dark:bg-primary-900"
                : "bg-gray-300 dark:bg-darkMode-700"
            }`}
          ></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 ${
                step >= 2
                  ? "bg-primary-500 text-white"
                  : "bg-gray-300 dark:bg-darkMode-700 text-gray-700 dark:text-gray-300"
              } rounded-full flex items-center justify-center`}
            >
              <span>2</span>
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                step >= 2
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              إضافة الأسئلة
            </span>
          </div>

          <div
            className={`flex-1 h-1 mx-4 ${
              step > 2
                ? "bg-primary-200 dark:bg-primary-900"
                : "bg-gray-300 dark:bg-darkMode-700"
            }`}
          ></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 ${
                step >= 3
                  ? "bg-primary-500 text-white"
                  : "bg-gray-300 dark:bg-darkMode-700 text-gray-700 dark:text-gray-300"
              } rounded-full flex items-center justify-center`}
            >
              <span>3</span>
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                step >= 3
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              إعدادات ومشاركة
            </span>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Step 1: Exam Information */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                معلومات الاختبار
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="title" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    عنوان الاختبار
                  </Label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    value={examData.title}
                    onChange={handleChange}
                    placeholder="أدخل عنوان الاختبار"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    المادة
                  </Label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={examData.subject}
                    onChange={handleChange}
                    placeholder="أدخل اسم المادة"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    مدة الاختبار (بالدقائق)
                  </Label>
                  <div className="flex items-center">
                    <Clock className="ml-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="number"
                      id="duration"
                      name="duration"
                      value={examData.duration}
                      onChange={handleDurationChange}
                      placeholder="مثال: 60"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="attachment" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    إرفاق ملف (اختياري)
                  </Label>
                  <div className="flex items-center">
                    <FileUp className="ml-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="file"
                      id="attachment"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="description" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  وصف الاختبار
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={examData.description}
                  onChange={handleChange}
                  placeholder="أدخل وصفاً موجزاً للاختبار"
                />
              </div>

              <div className="mb-6">
                <Label htmlFor="instructions" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  تعليمات الاختبار
                </Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  rows={4}
                  value={examData.instructions}
                  onChange={handleChange}
                  placeholder="أدخل تعليمات للطلاب حول كيفية الإجابة على الاختبار"
                />
              </div>
            </div>
          )}

          {/* Step 2: Add Questions */}
          {step === 2 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  إضافة الأسئلة
                </h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                    مجموع الدرجات: {calculateTotalMarks()}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                    عدد الأسئلة: {questions.length}
                  </span>
                </div>
              </div>

              <Tabs defaultValue="add">
                <TabsList className="mb-4">
                  <TabsTrigger value="add">إضافة سؤال</TabsTrigger>
                  <TabsTrigger value="view">الأسئلة الحالية ({questions.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="add">
                  <QuestionForm onAddQuestion={handleAddQuestion} />
                </TabsContent>
                <TabsContent value="view">
                  {questions.length > 0 ? (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <Card key={question.id} className="border border-gray-200 dark:border-darkMode-700">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                السؤال {index + 1}
                                {question.type === "essay" && " (سؤال مقالي)"}
                                {question.type === "multipleChoice" && " (اختيار من متعدد)"}
                                {question.type === "trueFalse" && " (صح/خطأ)"}
                              </h3>
                              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 text-sm px-2 py-1 rounded">
                                {question.marks} درجة
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                              {question.text}
                            </p>
                            {question.type === "multipleChoice" && question.options && (
                              <div className="mb-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الخيارات:</p>
                                <ul className="list-disc mr-6 space-y-1">
                                  {(question.options as string[]).map((option, i) => (
                                    <li key={i} className="text-gray-700 dark:text-gray-300">
                                      {option}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              الإجابة الصحيحة:{" "}
                              {question.type === "essay" && 
                                Array.isArray(question.correctAnswers) ? 
                                (question.correctAnswers as string[]).join(" أو ") : 
                                question.type === "trueFalse" ? 
                                (question.correctAnswers === true ? "صح" : "خطأ") :
                                Array.isArray(question.correctAnswers) ? 
                                (question.correctAnswers as (string | number)[]).join(", ") : 
                                question.correctAnswers}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              حذف السؤال
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        لم تتم إضافة أي أسئلة بعد
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => document.querySelector('[data-value="add"]')?.click()}
                      >
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة سؤال جديد
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Step 3: Exam Preview & Settings */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                مراجعة الاختبار
              </h2>

              <div className="bg-gray-50 dark:bg-darkMode-700 p-6 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      عنوان الاختبار
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {examData.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      المادة
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {examData.subject}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      المدة
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {examData.duration} دقيقة
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    وصف الاختبار
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {examData.description || "لا يوجد وصف"}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    تعليمات الاختبار
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {examData.instructions || "لا توجد تعليمات"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      عدد الأسئلة
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {questions.length} سؤال
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      مجموع الدرجات
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {calculateTotalMarks()} درجة
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      المرفقات
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {attachmentFile ? attachmentFile.name : "لا توجد مرفقات"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                  الاختبار جاهز للمشاركة!
                </h3>
                <p className="text-green-700 dark:text-green-400">
                  اضغط على زر "إنهاء" لإكمال إنشاء الاختبار ومشاركته مع الطلاب.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={isSubmitting}
          >
            العودة
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate("/exams/list")}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        )}

        {step < 3 ? (
          <Button onClick={handleNextStep} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {step === 1 ? (
              <>
                التالي <ArrowRight className="mr-2 h-4 w-4" />
              </>
            ) : (
              "التالي"
            )}
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            إنهاء
          </Button>
        )}
      </div>
    </div>
  );
}
