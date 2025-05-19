import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CreateExam from "@/pages/CreateExam";
import ExamsList from "@/pages/ExamsList";
import TakeExam from "@/pages/TakeExam";
import ExamResults from "@/pages/ExamResults";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Loader } from "./components/Loader";

// This private route wrapper ensures the component is only accessible to authenticated users
function PrivateRoute({ component: Component, ...rest }: any) {
  // Check for token directly to avoid dependency on AuthContext
  const hasToken = localStorage.getItem("token") !== null;
  
  // Show a loading spinner for a moment while checking
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Small timeout to simulate checking auth
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Loader /></div>;
  }

  if (!hasToken) {
    window.location.href = "/login";
    return null;
  }

  // Create a simplified auth object to pass to components instead of relying on AuthContext
  const authData = {
    user: getStoredUser(),
    isAuthenticated: true
  };

  return <Component {...rest} auth={authData} />;
}

// Helper function to get user from localStorage
function getStoredUser() {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (e) {
    console.error("Error parsing user data", e);
  }
  return null;
}

// Router component handles all routes
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/exams/create">
        {() => <PrivateRoute component={CreateExam} />}
      </Route>
      <Route path="/exams/list">
        {() => <PrivateRoute component={ExamsList} />}
      </Route>
      <Route path="/exams/take/:code">
        {(params) => <PrivateRoute component={TakeExam} code={params.code} />}
      </Route>
      <Route path="/exams/results/:id">
        {(params) => <PrivateRoute component={ExamResults} id={params.id} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// App component without circular dependencies
function App() {
  // Check for token directly to avoid circular dependency
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);
  
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen dark:bg-gray-900">
        <Navbar isAuthenticated={isAuthenticated} />
        <main className="flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <Loader />
            </div>
          ) : (
            <Router />
          )}
        </main>
        <Footer />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
