import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import HistoricalCalls from "./pages/HistoricalCalls";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster/><DashboardLayout><Switch><Route path="/" component={Home}/><Route path="/chamados" component={Home}/><Route path="/trocas"><HistoricalCalls kind="TROCA"/></Route><Route path="/recusados"><HistoricalCalls kind="RECUSADO"/></Route><Route path="/configuracoes" component={Settings}/><Route path="/404" component={NotFound}/><Route component={NotFound}/></Switch></DashboardLayout></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
