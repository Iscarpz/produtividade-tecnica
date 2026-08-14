import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart3, ChevronLeft, ChevronRight, ExternalLink, FileSignature, FileText, LayoutDashboard, LogOut, Package, RefreshCcw, Search, Settings, ShieldCheck, Wrench } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export const LAUDO_CREATOR_URL = "https://laudoatppr.base44.app/";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Search, label: "Chamados", path: "/chamados" },
  { icon: Wrench, label: "Em andamento", path: "/fila/em-andamento" },
  { icon: Package, label: "PP", path: "/fila/pp" },
  { icon: FileText, label: "Orçamento", path: "/fila/orcamento" },
  { icon: ShieldCheck, label: "ZURICH", path: "/fila/zurich" },
  { icon: RefreshCcw, label: "Trocas", path: "/trocas" },
  { icon: FileText, label: "Orçamentos recusados", path: "/recusados" },
  { icon: FileSignature, label: "Laudo Creator", path: "laudo", highlight: true },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]"><div className="w-full max-w-sm rounded-2xl border bg-white p-10 text-center shadow-sm"><div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-[#173f5f] font-bold text-white">PT</div><h1 className="text-2xl font-semibold text-slate-900">Produtividade Técnica</h1><p className="mb-7 mt-2 text-sm text-slate-500">Entre com sua conta para acessar seus chamados.</p><Button className="w-full bg-[#173f5f] text-white hover:bg-[#0f2f49]" onClick={() => startLogin()}>Entrar com Manus</Button></div></div>;

  const go = (path: string) => { if (path === "laudo") window.open(LAUDO_CREATOR_URL, "_blank", "noopener,noreferrer"); else setLocation(path); };
  const isActive = (path: string) => path !== "laudo" && (path === "/" ? location === "/" : location.startsWith(path));
  const widthClass = collapsed ? "w-16" : "w-64";
  const contentClass = collapsed ? "ml-16" : "ml-64";
  const title = location === "/" ? "Dashboard" : menuItems.find((item) => item.path !== "laudo" && item.path !== "/" && location.startsWith(item.path))?.label || "Operação";

  return <div className="min-h-screen overflow-x-hidden bg-[#f5f7fa]"><aside className={`fixed inset-y-0 left-0 z-40 flex ${widthClass} flex-col border-r border-[#244866] bg-[#102d43] text-white transition-[width] duration-200`}><div className="flex h-16 items-center justify-between border-b border-white/10 px-3"><button onClick={() => go("/")} title="Ir para Dashboard" className="flex min-w-0 items-center gap-3 rounded-md text-left outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2b134]"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f2b134] font-extrabold text-[#102d43]">PT</div>{!collapsed && <div className="min-w-0"><p className="truncate font-semibold">Produtividade</p><p className="text-xs text-slate-300">Controle técnico</p></div>}</button><button aria-label={collapsed ? "Expandir menu" : "Recolher menu"} onClick={() => setCollapsed((value) => !value)} className="hidden rounded-md p-1 text-slate-300 hover:bg-white/10 hover:text-white lg:block">{collapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}</button></div><nav className="flex-1 overflow-y-auto px-2 py-4">{menuItems.map((item) => <button key={item.label} title={collapsed ? item.label : undefined} onClick={() => go(item.path)} className={`mb-1 flex h-10 w-full items-center rounded-lg px-3 text-left text-sm font-medium transition ${item.highlight && !isActive(item.path) ? "border border-[#f2b134]/35 bg-[#f2b134]/10 text-[#ffe09a] hover:bg-[#f2b134]/20" : isActive(item.path) ? "bg-[#f2b134] text-[#102d43]" : "text-white/90 hover:bg-white/10 hover:text-white"}`}><item.icon className="h-4 w-4 shrink-0"/>{!collapsed && <><span className="ml-3 truncate">{item.label}</span>{item.path === "laudo" && <ExternalLink className="ml-auto h-3.5 w-3.5"/>}</>}</button>)}</nav><div className="border-t border-white/10 p-2"><DropdownMenu><DropdownMenuTrigger asChild><button title={collapsed ? (user.name || "Definir nome") : undefined} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/10"><Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="bg-[#f2b134] font-bold text-[#102d43]">{user.name?.slice(0, 1)?.toUpperCase() || "?"}</AvatarFallback></Avatar>{!collapsed && <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{user.name || "Definir nome"}</p><p className="text-xs text-slate-300">Sessão ativa</p></div>}</button></DropdownMenuTrigger><DropdownMenuContent side="right" align="end" className="z-50 min-w-52 border-slate-200 bg-white text-slate-800 shadow-xl"><DropdownMenuItem className="cursor-pointer focus:bg-slate-100 focus:text-slate-900" onClick={logout}><LogOut className="mr-2 h-4 w-4"/>Sair / Logout</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></aside><div className={`min-w-0 ${contentClass} transition-[margin] duration-200`}><header className="sticky top-0 z-20 flex h-16 min-w-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6"><button aria-label={collapsed ? "Expandir menu" : "Recolher menu"} onClick={() => setCollapsed((value) => !value)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"><span className="sr-only">Alternar menu</span>{collapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}</button><p className="truncate text-sm text-slate-500">Operação / <span className="font-semibold text-slate-900">{title}</span></p><p className="ml-auto hidden shrink-0 items-center gap-2 text-xs text-slate-500 md:flex"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Atualização automática ativa</p></header><main className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-col overflow-x-hidden"><div className="min-w-0 flex-1">{children}</div><footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-[11px] text-slate-400">Desenvolvido por Vinicius Scarpeta</footer></main></div></div>;
}
