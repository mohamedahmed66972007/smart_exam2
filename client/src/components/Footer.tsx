import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-darkMode-800 border-t border-gray-200 dark:border-darkMode-700 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"
                alt="شعار نظام الاختبارات"
              />
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400 mr-2">
                اختباراتي
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              منصة متكاملة لإنشاء وإدارة الاختبارات الإلكترونية
            </p>
          </div>

          <div className="flex space-x-8 space-x-reverse">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                روابط سريعة
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="/">
                    <a className="hover:text-primary-600 dark:hover:text-primary-400">
                      الرئيسية
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/exams/list">
                    <a className="hover:text-primary-600 dark:hover:text-primary-400">
                      اختباراتي
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/exams/create">
                    <a className="hover:text-primary-600 dark:hover:text-primary-400">
                      إنشاء اختبار
                    </a>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                الدعم
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">
                    المساعدة
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">
                    الأسئلة الشائعة
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">
                    تواصل معنا
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">
                    سياسة الخصوصية
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-darkMode-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} نظام اختباراتي. جميع الحقوق محفوظة.
          </p>
          <div className="flex space-x-4 space-x-reverse mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <i className="fab fa-facebook"></i>
              <span className="sr-only">فيسبوك</span>
            </a>
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <i className="fab fa-twitter"></i>
              <span className="sr-only">تويتر</span>
            </a>
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <i className="fab fa-instagram"></i>
              <span className="sr-only">انستغرام</span>
            </a>
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <i className="fab fa-youtube"></i>
              <span className="sr-only">يوتيوب</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
