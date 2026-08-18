import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ExternalLink, FileSignature, FileText, Globe2, Inbox, LayoutDashboard, LogOut, RefreshCcw, Search, Settings, ShieldCheck, Wrench } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { AccountAccessNotice } from "./AccountAccessNotice";

export const LAUDO_CREATOR_URL = "/laudos/novo";
export const PORTAL_ATP_URL = "https://portalatp.positivo.tech/login";
export const POSIFLOW_URL = "https://posiflow.positivotecnologia.com.br/services/formularios";

export const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Search, label: "Chamados", path: "/chamados" },
  { icon: Inbox, label: "Recebidos", path: "/fila/recebidos" },
  { icon: Wrench, label: "Em andamento", path: "/fila/em-andamento" },
  { icon: ShieldCheck, label: "Zurich", path: "/fila/zurich" },
  { icon: RefreshCcw, label: "Trocas", path: "/trocas" },
  { icon: FileText, label: "Orçamentos recusados", path: "/recusados" },
];

export const toolItems: Array<{ icon: typeof FileSignature; label: string; url: string; internal?: boolean; highlight?: boolean }> = [
  { icon: FileSignature, label: "Laudo Creator", url: LAUDO_CREATOR_URL, internal: true, highlight: true },
  { icon: Globe2, label: "Portal ATP", url: PORTAL_ATP_URL },
  { icon: Globe2, label: "Posiflow", url: POSIFLOW_URL },
];

function NavigationGroup({ title, expanded, children }: { title: string; expanded: boolean; children: React.ReactNode }) {
  return <section className="mb-4"><p className={`mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 transition-opacity duration-150 ${expanded ? "opacity-100" : "pointer-events-none h-0 overflow-hidden opacity-0"}`}>{title}</p>{children}</section>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [location, setLocation] = useLocation();
  const { data: calls = [] } = trpc.calls.list.useQuery(undefined, { enabled: Boolean(user && !loading && (!user.accountStatus || user.accountStatus === "ACTIVE")), refetchInterval: 8000, refetchOnWindowFocus: true });
  const inProductionCount = calls.filter((call: { status: string }) => call.status === "EM ANDAMENTO").length;

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-[#F7F8F7]"><div className="w-full max-w-sm rounded-2xl border bg-white p-10 text-center shadow-sm"><div className="mx-auto mb-5 grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-[#0D1117]"><img src="/manus-storage/tecbase-symbol_ba576b33.png" alt="TECBASE" className="h-9 w-9 object-contain"/></div><h1 className="text-2xl font-semibold text-slate-900">TECBASE</h1><p className="mb-7 mt-2 text-sm text-slate-500">Entre com sua conta para acessar seus chamados.</p><Button className="w-full bg-[#2E7D32] text-white hover:bg-[#1A1F24]" onClick={startLogin}>Entrar com Manus</Button></div></div>;
  if (user.accountStatus && user.accountStatus !== "ACTIVE") return <AccountAccessNotice status={user.accountStatus as "PENDING_AUTHORIZATION" | "REFUSED" | "REVOKED"} onLogout={logout}/>;

  const go = (path: string) => setLocation(path);
  const openExternal = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
  const isActive = (path: string) => path === "/" ? location === "/" : location.startsWith(path);
  const title = location === "/" ? "Dashboard" : menuItems.find((item) => item.path !== "/" && location.startsWith(item.path))?.label || "Operação";
  const navButtonClass = (active: boolean, highlight = false) => `mb-1 flex h-10 w-full items-center rounded-lg px-3 text-left text-sm font-medium transition-colors duration-150 ${highlight && !active ? "border border-[#A3E635]/35 bg-[#A3E635]/10 text-[#ECFCCB] hover:bg-[#A3E635]/20" : active ? "border-l-2 border-[#A3E635] bg-[#2E7D32] text-white shadow-[inset_0_0_0_1px_rgba(163,230,53,.18)]" : "text-white/90 hover:bg-[#1A1F24] hover:text-white"}`;

  return <div className="min-h-screen overflow-x-hidden bg-[#F7F8F7]">
    <aside onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)} className={`fixed inset-y-0 left-0 z-40 flex ${expanded ? "w-64" : "w-16"} flex-col border-r border-[#1A1F24] bg-[#0D1117] text-white shadow-xl transition-[width] duration-200 ease-out`}>
      <div className="flex h-16 items-center border-b border-white/10 px-3"><button onClick={() => go("/")} title="Ir para Dashboard" className="flex min-w-0 items-center rounded-md text-left outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A3E635]">{expanded ? <img src="/manus-storage/tecbase-horizontal_6248c029.png" alt="TECBASE" className="h-8 w-40 object-contain object-left"/> : <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-[#1A1F24]"><img src="/manus-storage/tecbase-symbol_ba576b33.png" alt="TECBASE" className="h-8 w-8 object-contain"/></div>}</button></div>
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <NavigationGroup title="Operação" expanded={expanded}>{menuItems.map((item) => <button key={item.label} title={expanded ? undefined : item.label} onClick={() => go(item.path)} className={navButtonClass(isActive(item.path))}><item.icon className="h-4 w-4 shrink-0"/><span className={`ml-3 truncate transition-opacity duration-150 ${expanded ? "opacity-100" : "pointer-events-none w-0 overflow-hidden opacity-0"}`}>{item.label}</span>{item.path === "/fila/em-andamento" && expanded && <span aria-label={`${inProductionCount} chamados em produção`} className={`ml-auto grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive(item.path) ? "bg-[#0D1117]/10 text-white" : "bg-[#A3E635]/15 text-[#D9F99D]"}`}>{inProductionCount}</span>}</button>)}</NavigationGroup>
        <NavigationGroup title="Ferramentas" expanded={expanded}>{toolItems.map((item) => <button key={item.label} title={expanded ? undefined : item.label} onClick={() => item.internal ? go(item.url) : openExternal(item.url)} className={navButtonClass(Boolean(item.internal && isActive(item.url)), item.highlight)}><item.icon className="h-4 w-4 shrink-0"/><span className={`ml-3 truncate transition-opacity duration-150 ${expanded ? "opacity-100" : "pointer-events-none w-0 overflow-hidden opacity-0"}`}>{item.label}</span>{expanded && !item.internal && <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-70"/>}</button>)}</NavigationGroup>
        <NavigationGroup title="Sistema" expanded={expanded}><button title={expanded ? undefined : "Configurações"} onClick={() => go("/configuracoes")} className={navButtonClass(isActive("/configuracoes"))}><Settings className="h-4 w-4 shrink-0"/><span className={`ml-3 truncate transition-opacity duration-150 ${expanded ? "opacity-100" : "pointer-events-none w-0 overflow-hidden opacity-0"}`}>Configurações</span></button><button title={expanded ? undefined : "Sair"} onClick={logout} className={navButtonClass(false)}><LogOut className="h-4 w-4 shrink-0"/><span className={`ml-3 truncate transition-opacity duration-150 ${expanded ? "opacity-100" : "pointer-events-none w-0 overflow-hidden opacity-0"}`}>Sair</span></button></NavigationGroup>
      </nav>
      <div className="border-t border-white/10 p-2"><div title={expanded ? undefined : (user.name || "Definir nome")} className="flex items-center gap-3 rounded-lg p-2"><Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="bg-[#A3E635] font-bold text-[#0D1117]">{user.name?.slice(0, 1)?.toUpperCase() || "?"}</AvatarFallback></Avatar><div className={`min-w-0 transition-opacity duration-150 ${expanded ? "opacity-100" : "pointer-events-none w-0 overflow-hidden opacity-0"}`}><p className="truncate text-sm font-medium text-white">{user.name || "Definir nome"}</p><p className="text-xs text-slate-300">Sessão ativa</p></div></div></div>
    </aside>
    <div className={`min-w-0 transition-[margin] duration-200 ease-out ${expanded ? "ml-64" : "ml-16"}`}><header className="sticky top-0 z-20 flex h-16 min-w-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6"><p className="truncate text-sm text-slate-500">Operação / <span className="font-semibold text-slate-900">{title}</span></p><p className="ml-auto hidden shrink-0 items-center gap-2 text-xs text-slate-500 md:flex"><span className="h-2 w-2 rounded-full bg-[#2E7D32]"/>Atualização automática ativa</p></header><main className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-col overflow-x-hidden"><div className="min-w-0 flex-1">{children}</div><footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-[11px] leading-5 text-slate-400"><span className="block">TECBASE · Gestão, operação e resultados</span><span className="block">Desenvolvido por Vinicius Scarpeta</span></footer></main></div>
  </div>;
}
