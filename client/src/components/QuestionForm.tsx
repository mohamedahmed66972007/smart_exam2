import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, X, Trash } from "lucide-react";
import { questionTypes } from "@shared/schema";

type QuestionType = "essay" | "multipleChoice" | "trueFalse";

interface QuestionFormProps {
  onAddQuestion: (questionData: any) => void;
}

export function QuestionForm({ onAddQuestion }: QuestionFormProps) {
  const [questionType, setQuestionType] = useState<QuestionType>("essay");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>([""]);
  const [correctAnswer, setCorrectAnswer] = useState<any>(null);
  const [essayAnswers, setEssayAnswers] = useState<string[]>([""]);
  const [marks, setMarks] = useState("10");
  const { toast } = useToast();

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) {
      toast({
        title: "لا يمكن حذف جميع الخيارات",
        description: "يجب أن يكون هناك خيار واحد على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    // Reset correct answer if the removed option was selected
    if (correctAnswer === index.toString()) {
      setCorrectAnswer(null);
    } else if (parseInt(correctAnswer) > index) {
      // Adjust correct answer index if it's after the removed option
      setCorrectAnswer((parseInt(correctAnswer) - 1).toString());
    }
  };

  const handleAddEssayAnswer = () => {
    setEssayAnswers([...essayAnswers, ""]);
  };

  const handleEssayAnswerChange = (index: number, value: string) => {
    const newAnswers = [...essayAnswers];
    newAnswers[index] = value;
    setEssayAnswers(newAnswers);
  };

  const handleRemoveEssayAnswer = (index: number) => {
    if (essayAnswers.length <= 1) {
      toast({
        title: "لا يمكن حذف جميع الإجابات",
        description: "يجب أن تكون هناك إجابة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    const newAnswers = essayAnswers.filter((_, i) => i !== index);
    setEssayAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText) {
      toast({
        title: "حقل السؤال فارغ",
        description: "يرجى إدخال نص السؤال",
        variant: "destructive",
      });
      return;
    }
    
    if (questionType === "multipleChoice") {
      // Check if all options have values
      if (options.some(opt => !opt.trim())) {
        toast({
          title: "خيارات فارغة",
          description: "يرجى إدخال جميع الخيارات",
          variant: "destructive",
        });
        return;
      }
      
      // Check if a correct answer is selected
      if (correctAnswer === null) {
        toast({
          title: "لم يتم تحديد الإجابة الصحيحة",
          description: "يرجى تحديد الإجابة الصحيحة",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (questionType === "essay" && !essayAnswers.some(ans => ans.trim())) {
      toast({
        title: "لم يتم إدخال إجابة",
        description: "يرجى إدخال إجابة واحدة على الأقل للسؤال المقالي",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(parseInt(marks)) || parseInt(marks) <= 0) {
      toast({
        title: "قيمة الدرجات غير صالحة",
        description: "يرجى إدخال قيمة صالحة للدرجات",
        variant: "destructive",
      });
      return;
    }
    
    // Create question data
    const questionData: any = {
      type: questionType,
      text: questionText,
      marks: parseInt(marks),
    };
    
    if (questionType === "multipleChoice") {
      questionData.options = options;
      questionData.correctAnswers = [correctAnswer];
    } else if (questionType === "trueFalse") {
      questionData.correctAnswers = correctAnswer === "true";
    } else if (questionType === "essay") {
      questionData.correctAnswers = essayAnswers.filter(ans => ans.trim());
    }
    
    onAddQuestion(questionData);
    
    // Reset form
    setQuestionText("");
    setOptions([""]);
    setCorrectAnswer(null);
    setEssayAnswers([""]);
    setMarks("10");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة سؤال جديد</CardTitle>
        <CardDescription>
          قم بملء المعلومات التالية لإضافة سؤال جديد إلى الاختبار
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="questionType">نوع السؤال</Label>
            <Select
              value={questionType}
              onValueChange={(value: QuestionType) => setQuestionType(value)}
            >
              <SelectTrigger id="questionType">
                <SelectValue placeholder="اختر نوع السؤال" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={questionTypes.ESSAY}>سؤال مقالي</SelectItem>
                <SelectItem value={questionTypes.MULTIPLE_CHOICE}>اختيار من متعدد</SelectItem>
                <SelectItem value={questionTypes.TRUE_FALSE}>صح / خطأ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionText">نص السؤال</Label>
            <Textarea
              id="questionText"
              placeholder="أدخل نص السؤال"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
            />
          </div>

          {/* Multiple Choice Options */}
          {questionType === "multipleChoice" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>الخيارات</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                >
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة خيار
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`الخيار ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>الإجابة الصحيحة</Label>
                <RadioGroup
                  value={correctAnswer}
                  onValueChange={setCorrectAnswer}
                >
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                      <Label htmlFor={`answer-${index}`}>{option || `الخيار ${index + 1}`}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* True/False Options */}
          {questionType === "trueFalse" && (
            <div className="space-y-2">
              <Label>الإجابة الصحيحة</Label>
              <RadioGroup
                value={correctAnswer}
                onValueChange={setCorrectAnswer}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">صح</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">خطأ</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Essay Question Answer */}
          {questionType === "essay" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>الإجابات المقبولة</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEssayAnswer}
                >
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة إجابة بديلة
                </Button>
              </div>
              <div className="space-y-2">
                {essayAnswers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Textarea
                      value={answer}
                      onChange={(e) => handleEssayAnswerChange(index, e.target.value)}
                      placeholder={`الإجابة ${index + 1}`}
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEssayAnswer(index)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                يمكنك إضافة إجابات متعددة للسؤال المقالي، وستعتبر إجابة الطالب صحيحة إذا طابقت أي منها.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="marks">الدرجة</Label>
            <Input
              id="marks"
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              min="1"
            />
          </div>

          <Button type="submit" className="w-full">
            إضافة السؤال
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
