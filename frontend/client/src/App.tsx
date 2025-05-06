import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Set document title
    document.title = "Finlyzer - Financial Portfolio Analysis";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Router />
      <Toaster />
    </div>
  );
}

export default App;
