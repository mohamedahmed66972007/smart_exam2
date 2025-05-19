import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User } from "lucide-react";

export function Navbar({ isAuthenticated: propsAuthenticated }: { isAuthenticated?: boolean }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(propsAuthenticated || window.appAuth.isAuthenticated || false);
  const [user, setUser] = useState<{ name?: string } | null>(window.appAuth.user || null);

  // Authentication check using global auth state
  useEffect(() => {
    // If isAuthenticated is passed as prop, use that
    if (propsAuthenticated !== undefined) {
      setIsAuthenticated(propsAuthenticated);
    } else {
      // Use the global auth state
      setIsAuthenticated(window.appAuth.isAuthenticated);
    }
    
    // Get user data from global auth state
    setUser(window.appAuth.user);
    
    // Set up event listener for auth changes
    const handleAuthChange = () => {
      setIsAuthenticated(window.appAuth.isAuthenticated);
      setUser(window.appAuth.user);
    };
    
    // Setup a custom event for auth changes
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [propsAuthenticated]);

  const handleLogout = () => {
    window.appAuth.logout();
    // The global logout function will handle navigation
  };

  return (
    <nav className="bg-white dark:bg-darkMode-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div 
                className="flex items-center cursor-pointer" 
                onClick={() => window.location.href = "/"}
              >
                <img
                  className="h-10 w-auto"
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"
                  alt="شعار نظام الاختبارات"
                />
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400 mr-2">
                  اختباراتي
                </span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse">
              <button
                onClick={() => window.location.href = "/"}
                className={`${
                  location === "/"
                    ? "border-primary-500 text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium bg-transparent`}
              >
                الرئيسية
              </button>
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => window.location.href = "/exams/list"}
                    className={`${
                      location === "/exams/list"
                        ? "border-primary-500 text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium bg-transparent`}
                  >
                    اختباراتي
                  </button>
                  <button
                    onClick={() => window.location.href = "/exams/create"}
                    className={`${
                      location === "/exams/create"
                        ? "border-primary-500 text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium bg-transparent`}
                  >
                    إنشاء اختبار
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle className="ml-3" />
            
            <div className="mr-4 flex items-center space-x-3 space-x-reverse">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" forceMount>
                    <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = "/exams/list"}>
                      <span className="w-full">اختباراتي</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = "/exams/create"}>
                      <span className="w-full">إنشاء اختبار</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button onClick={() => window.location.href = "/login"}>دخول</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/register"}
                  >تسجيل</Button>
                </>
              )}
            </div>
            
            <div className="mr-2 flex sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="فتح القائمة"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <div
              className={`${
                location === "/"
                  ? "bg-primary-50 dark:bg-darkMode-700 border-primary-500 text-primary-700 dark:text-primary-400"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkMode-700 hover:border-gray-300"
              } block pr-3 pl-4 py-2 border-r-4 text-base font-medium cursor-pointer`}
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
            >
              الرئيسية
            </div>
            {isAuthenticated && (
              <>
                <div
                  className={`${
                    location === "/exams/list"
                      ? "bg-primary-50 dark:bg-darkMode-700 border-primary-500 text-primary-700 dark:text-primary-400"
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkMode-700 hover:border-gray-300"
                  } block pr-3 pl-4 py-2 border-r-4 text-base font-medium cursor-pointer`}
                  onClick={() => {
                    navigate("/exams/list");
                    setMobileMenuOpen(false);
                  }}
                >
                  اختباراتي
                </div>
                <Link href="/exams/create">
                  <a
                    className={`${
                      location === "/exams/create"
                        ? "bg-primary-50 dark:bg-darkMode-700 border-primary-500 text-primary-700 dark:text-primary-400"
                        : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkMode-700 hover:border-gray-300"
                    } block pr-3 pl-4 py-2 border-r-4 text-base font-medium`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    إنشاء اختبار
                  </a>
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link href="/login">
                  <a
                    className="border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkMode-700 hover:border-gray-300 block pr-3 pl-4 py-2 border-r-4 text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    دخول
                  </a>
                </Link>
                <Link href="/register">
                  <a
                    className="border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkMode-700 hover:border-gray-300 block pr-3 pl-4 py-2 border-r-4 text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    تسجيل
                  </a>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <a
                href="#"
                className="border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkMode-700 hover:border-gray-300 block pr-3 pl-4 py-2 border-r-4 text-base font-medium"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                تسجيل الخروج
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
