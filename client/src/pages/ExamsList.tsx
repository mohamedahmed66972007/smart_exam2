import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExamCard } from "@/components/ExamCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Exam } from "@shared/schema";
import { Link } from "wouter";
import { Loader } from "@/components/Loader";
import { Plus, Search } from "lucide-react";

export default function ExamsList() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: exams, isLoading } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
    refetchOnWindowFocus: false,
  });

  // Filter exams based on search term
  const filteredExams = exams?.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loader />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          اختباراتي
        </h1>
        <Link href="/exams/create">
          <Button className="mt-4 sm:mt-0">
            <Plus className="ml-2 h-4 w-4" />
            إنشاء اختبار جديد
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="relative w-full sm:w-96 mb-4 sm:mb-0">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="البحث عن اختبار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              إجمالي الاختبارات: {exams?.length || 0}
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">جميع الاختبارات</TabsTrigger>
              <TabsTrigger value="active">النشطة</TabsTrigger>
              <TabsTrigger value="recent">الأخيرة</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredExams && filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExams.map((exam) => (
                    <ExamCard
                      key={exam.id}
                      id={exam.id}
                      title={exam.title}
                      subject={exam.subject}
                      description={exam.description || ""}
                      code={exam.code}
                      createdAt={exam.createdAt}
                      participantsCount={0}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm
                      ? "لم يتم العثور على أي اختبارات تطابق بحثك"
                      : "لم تقم بإنشاء أي اختبارات بعد"}
                  </p>
                  <Link href="/exams/create">
                    <Button>
                      <Plus className="ml-2 h-4 w-4" />
                      إنشاء اختبار جديد
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="active">
              {filteredExams && filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExams.map((exam) => (
                    <ExamCard
                      key={exam.id}
                      id={exam.id}
                      title={exam.title}
                      subject={exam.subject}
                      description={exam.description || ""}
                      code={exam.code}
                      createdAt={exam.createdAt}
                      participantsCount={0}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    لا توجد اختبارات نشطة حالياً
                  </p>
                  <Link href="/exams/create">
                    <Button>
                      <Plus className="ml-2 h-4 w-4" />
                      إنشاء اختبار جديد
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent">
              {filteredExams && filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExams
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 6)
                    .map((exam) => (
                      <ExamCard
                        key={exam.id}
                        id={exam.id}
                        title={exam.title}
                        subject={exam.subject}
                        description={exam.description || ""}
                        code={exam.code}
                        createdAt={exam.createdAt}
                        participantsCount={0}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    لا توجد اختبارات حديثة
                  </p>
                  <Link href="/exams/create">
                    <Button>
                      <Plus className="ml-2 h-4 w-4" />
                      إنشاء اختبار جديد
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
