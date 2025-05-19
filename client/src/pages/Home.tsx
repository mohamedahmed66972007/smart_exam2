import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [examCode, setExamCode] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Check authentication status using the global auth state
  useEffect(() => {
    setIsAuthenticated(window.appAuth?.isAuthenticated || false);
    
    // Create an event listener to update auth state when it changes
    const handleAuthChange = () => {
      setIsAuthenticated(window.appAuth?.isAuthenticated || false);
    };
    
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examCode.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز الاختبار",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول أولاً قبل بدء الاختبار",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    navigate(`/exams/take/${examCode}`);
  };

  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-l from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 rounded-lg overflow-hidden shadow-xl mb-10 mx-4 sm:mx-8 lg:mx-auto lg:container mt-8">
        <div className="absolute inset-0 opacity-10 bg-pattern"></div>
        <div className="relative px-8 py-12 md:flex md:items-center">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h2 className="text-3xl font-bold text-white mb-2">
              مرحباً بك في نظام الاختبارات الإلكترونية
            </h2>
            <p className="text-white text-opacity-90 mb-6">
              قم بإنشاء اختبارات إلكترونية بكل سهولة ومشاركتها مع الطلاب والحصول على النتائج فوراً
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-white text-primary-700 hover:bg-gray-100"
                onClick={() => navigate("/exams/create")}
              >
                إنشاء اختبار جديد
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-primary-800 bg-opacity-50 hover:bg-opacity-70 text-white border border-white border-opacity-30"
                onClick={() => navigate("/exams/list")}
              >
                استكشاف الاختبارات
              </Button>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <img
              className="h-auto max-w-full md:max-w-xs"
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300"
              alt="صورة توضيحية للاختبارات الإلكترونية"
            />
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Create Exam Card */}
          <Card className="bg-white dark:bg-gray-800 overflow-hidden card-shadow border-0">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                إنشاء اختبار
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                قم بإنشاء اختبار جديد وإضافة أسئلة متنوعة مثل المقالية والاختيار من متعدد والصح والخطأ.
              </p>
              <Button 
                className="w-full"
                onClick={() => navigate("/exams/create")}
              >
                إنشاء اختبار
              </Button>
            </CardContent>
          </Card>

          {/* My Exams Card */}
          <Card className="bg-white dark:bg-gray-800 overflow-hidden card-shadow border-0">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-600 dark:text-success-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                اختباراتي
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                عرض جميع الاختبارات التي قمت بإنشائها والاطلاع على نتائج الطلاب وتحليل أدائهم.
              </p>
              <Button 
                className="w-full bg-success-500 hover:bg-success-600"
                onClick={() => navigate("/exams/list")}
              >
                عرض الاختبارات
              </Button>
            </CardContent>
          </Card>

          {/* Take Exam Card */}
          <Card className="bg-white dark:bg-gray-800 overflow-hidden card-shadow border-0">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-600 dark:text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                بدء اختبار
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                إدخال رمز الاختبار للبدء في حل اختبار تم مشاركته معك وتسليم إجاباتك.
              </p>
              <form onSubmit={handleStartExam} className="flex items-center">
                <Input
                  type="text"
                  placeholder="أدخل رمز الاختبار"
                  className="flex-1 rounded-r-md"
                  value={examCode}
                  onChange={(e) => setExamCode(e.target.value)}
                />
                <Button
                  type="submit"
                  className="bg-accent-500 hover:bg-accent-600 rounded-l-md rounded-r-none"
                >
                  بدء
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            مميزات نظام الاختبارات الإلكترونية
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Question Types Feature */}
            <Card className="bg-white dark:bg-darkMode-800 p-6">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-file-alt text-primary-600 dark:text-primary-300"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                أنواع متعددة من الأسئلة
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                أسئلة مقالية، اختيار من متعدد، وصح وخطأ مع إمكانية إرفاق ملفات.
              </p>
            </Card>

            {/* Sharing Feature */}
            <Card className="bg-white dark:bg-darkMode-800 p-6">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-share-nodes text-primary-600 dark:text-primary-300"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                مشاركة الاختبارات
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                مشاركة الاختبارات بسهولة عبر روابط مباشرة أو رموز الاختبار.
              </p>
            </Card>

            {/* Grading Feature */}
            <Card className="bg-white dark:bg-darkMode-800 p-6">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-check-double text-primary-600 dark:text-primary-300"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                تصحيح تلقائي ويدوي
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                تصحيح الأسئلة تلقائياً مع إمكانية المراجعة اليدوية للأسئلة المقالية.
              </p>
            </Card>

            {/* Export Feature */}
            <Card className="bg-white dark:bg-darkMode-800 p-6">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-file-export text-primary-600 dark:text-primary-300"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                تصدير الاختبارات
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                تصدير الاختبارات بتنسيق PDF أو Word بتصميم أنيق للطباعة.
              </p>
            </Card>
          </div>
        </div>

        {/* Recent Exams Section */}
        <div className="mb-10">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              اختبارات حديثة
            </h2>
            <Link href="/exams/list">
              <a className="text-primary-600 dark:text-primary-400 hover:underline">
                عرض الكل
              </a>
            </Link>
          </div>
          
          {/* We'll replace this with real data in a future enhancement */}
          <div className="text-center p-8 bg-gray-50 dark:bg-darkMode-900 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              قم بإنشاء اختبارك الأول لتظهر هنا الاختبارات الأخيرة التي قمت بإنشائها.
            </p>
            <Button 
              onClick={() => navigate("/exams/create")}
              className="bg-primary-500 hover:bg-primary-600"
            >
              إنشاء اختبار جديد
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
