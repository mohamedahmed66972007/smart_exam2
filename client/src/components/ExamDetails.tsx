import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatDate } from "@/lib/utils";
import { FileText, Clock, User, Calendar } from "lucide-react";

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

interface ExamDetailsProps {
  exam: Exam;
  questions: Question[];
  totalMarks: number;
}

export function ExamDetails({ exam, questions, totalMarks }: ExamDetailsProps) {
  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case "essay":
        return "سؤال مقالي";
      case "multipleChoice":
        return "اختيار من متعدد";
      case "trueFalse":
        return "صح/خطأ";
      default:
        return type;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "essay":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "multipleChoice":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "trueFalse":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>معلومات الاختبار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  <FileText className="ml-2 h-5 w-5" />
                  التفاصيل العامة
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      عنوان الاختبار
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {exam.title}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      المادة
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {exam.subject}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      رمز الاختبار
                    </span>
                    <div className="flex items-center">
                      <span className="text-primary-600 dark:text-primary-400 font-mono font-bold">
                        {exam.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => navigator.clipboard.writeText(exam.code)}
                      >
                        نسخ
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  <Clock className="ml-2 h-5 w-5" />
                  الوقت والتاريخ
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      المدة
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDuration(exam.duration)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      تاريخ الإنشاء
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(exam.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {exam.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    وصف الاختبار
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {exam.description}
                  </p>
                </div>
              )}

              {exam.instructions && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    تعليمات الاختبار
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {exam.instructions}
                  </p>
                </div>
              )}

              {exam.attachment && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    المرفقات
                  </h3>
                  <a
                    href={exam.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <i className="fas fa-file-download ml-2"></i>
                    عرض المرفق
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>الأسئلة</CardTitle>
            <Badge variant="outline" className="text-primary-600 dark:text-primary-400">
              {questions.length} سؤال • {totalMarks} درجة
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <Card key={question.id} className="border border-gray-200 dark:border-darkMode-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        السؤال {index + 1}
                      </h3>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge
                          variant="secondary"
                          className={getQuestionTypeColor(question.type)}
                        >
                          {getQuestionTypeText(question.type)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30"
                        >
                          {question.marks} درجة
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {question.text}
                    </p>
                    {question.type === "multipleChoice" && question.options && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          الخيارات:
                        </p>
                        <ul className="list-disc mr-6 space-y-1">
                          {(question.options as string[]).map((option, i) => (
                            <li
                              key={i}
                              className={`text-gray-700 dark:text-gray-300 ${
                                Array.isArray(question.correctAnswers) &&
                                question.correctAnswers.includes(i.toString())
                                  ? "font-bold text-green-600 dark:text-green-400"
                                  : ""
                              }`}
                            >
                              {option}
                              {Array.isArray(question.correctAnswers) &&
                                question.correctAnswers.includes(i.toString()) && (
                                  <span className="text-green-600 dark:text-green-400 mr-2">
                                    ✓
                                  </span>
                                )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {question.type === "trueFalse" && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          الإجابة الصحيحة:
                        </p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {question.correctAnswers === true ? "صح" : "خطأ"}
                        </p>
                      </div>
                    )}
                    {question.type === "essay" && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          الإجابات المقبولة:
                        </p>
                        {Array.isArray(question.correctAnswers) ? (
                          <ul className="list-disc mr-6 space-y-1">
                            {(question.correctAnswers as string[]).map(
                              (answer, i) => (
                                <li
                                  key={i}
                                  className="text-green-600 dark:text-green-400"
                                >
                                  {answer}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-green-600 dark:text-green-400">
                            {String(question.correctAnswers)}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">
                  لا توجد أسئلة في هذا الاختبار
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
