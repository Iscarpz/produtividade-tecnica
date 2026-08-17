import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import HistoricalCalls from "./pages/HistoricalCalls";
import CallSearch from "./pages/CallSearch";
import QueuePage from "./pages/QueuePage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import InviteAccept from "./pages/InviteAccept";
import PasswordLogin from "./pages/PasswordLogin";
import UsersPage from "./pages/UsersPage";
import ImageBiosSettings from "./pages/ImageBiosSettings";
import LaudosPage from "./pages/LaudosPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster/><Switch><Route path="/convite/:token" component={InviteAccept}/><Route path="/entrar" component={PasswordLogin}/><Route><DashboardLayout><Switch><Route path="/" component={Home}/><Route path="/chamados" component={CallSearch}/><Route path="/fila/recebidos"><QueuePage queue="recebidos"/></Route><Route path="/fila/em-andamento"><QueuePage queue="em-andamento"/></Route><Route path="/fila/pp"><QueuePage queue="pp"/></Route><Route path="/fila/orcamento"><QueuePage queue="orcamento"/></Route><Route path="/fila/zurich"><QueuePage queue="zurich"/></Route><Route path="/trocas"><HistoricalCalls kind="TROCA"/></Route><Route path="/recusados"><HistoricalCalls kind="RECUSADO"/></Route><Route path="/laudos/novo" component={LaudosPage}/><Route path="/laudos" component={LaudosPage}/><Route path="/configuracoes/usuarios" component={UsersPage}/><Route path="/configuracoes/imagens-bios" component={ImageBiosSettings}/><Route path="/configuracoes" component={Settings}/><Route path="/404" component={NotFound}/><Route component={NotFound}/></Switch></DashboardLayout></Route></Switch></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
