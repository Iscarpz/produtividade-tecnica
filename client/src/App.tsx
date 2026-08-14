import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster/><Switch><Route path="/"><DashboardLayout><Home/></DashboardLayout></Route><Route path="/404" component={NotFound}/><Route component={NotFound}/></Switch></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
