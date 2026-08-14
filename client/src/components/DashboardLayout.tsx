import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart3, FileText, LayoutDashboard, LogOut, PanelLeft, PlusCircle, RefreshCcw, Search, Settings, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

export const LAUDO_CREATOR_URL = "https://laudoatppr.base44.app/";
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Wrench, label: "Chamados", path: "/chamados" },
  { icon: RefreshCcw, label: "Trocas", path: "/trocas" },
  { icon: FileText, label: "Orçamentos recusados", path: "/recusados" },
  { icon: BarChart3, label: "Laudo Creator", path: "laudo" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth(); const [collapsed, setCollapsed] = useState(false);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]"><div className="bg-white border rounded-2xl p-10 max-w-sm w-full text-center shadow-sm"><div className="mx-auto mb-5 h-12 w-12 rounded-xl bg-[#173f5f] text-white grid place-items-center font-bold">PT</div><h1 className="text-2xl font-semibold text-slate-900">Produtividade Técnica</h1><p className="text-sm text-slate-500 mt-2 mb-7">Entre com sua conta para acessar seus chamados.</p><Button className="w-full bg-[#173f5f] text-white hover:bg-[#0f2f49]" onClick={() => startLogin()}>Entrar com Manus</Button></div></div>;
  return <SidebarProvider defaultOpen={!collapsed}><LayoutContent user={user} collapsed={collapsed} setCollapsed={setCollapsed}>{children}</LayoutContent></SidebarProvider>;
}

function LayoutContent({ children, user, collapsed, setCollapsed }: { children: React.ReactNode; user: any; collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const [location, setLocation] = useLocation(); const { logout } = useAuth(); const { toggleSidebar } = useSidebar();
  useEffect(() => { setCollapsed(false); }, [location, setCollapsed]);
  const go = (path: string) => { if (path === "laudo") window.open(LAUDO_CREATOR_URL, "_blank", "noopener,noreferrer"); else setLocation(path); };
  const active = (path: string) => path !== "laudo" && (path === "/" ? location === "/" : location.startsWith(path));
  return <div className="min-h-screen"><Sidebar className="border-r border-[#244866] bg-[#102d43] text-white"><SidebarHeader className="h-20 px-5 justify-center"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-lg bg-[#f2b134] text-[#102d43] grid place-items-center font-extrabold">PT</div><div className="group-data-[collapsible=icon]:hidden"><div className="font-semibold tracking-tight">Produtividade</div><div className="text-xs text-slate-300">Controle técnico</div></div></div></SidebarHeader><SidebarContent><SidebarMenu className="px-3 py-4 gap-1">{menuItems.map((item) => <SidebarMenuItem key={item.label}><SidebarMenuButton className="h-11 text-white/90 hover:bg-white/15 hover:text-white data-[active=true]:bg-[#f2b134] data-[active=true]:text-[#102d43]" isActive={active(item.path)} onClick={() => go(item.path)} tooltip={item.label}><item.icon className="h-4 w-4"/><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-white/10 text-left"><Avatar className="h-9 w-9 bg-[#f2b134]"><AvatarFallback className="bg-[#f2b134] text-[#102d43] font-bold">{user.name?.slice(0, 1)?.toUpperCase() || "T"}</AvatarFallback></Avatar><div className="min-w-0 group-data-[collapsible=icon]:hidden"><p className="text-sm font-medium truncate">{user.name || "Técnico"}</p><p className="text-xs text-slate-300 truncate">Sessão ativa</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="z-50 min-w-52 border-slate-200 bg-white text-slate-800 shadow-xl"><DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4"/>Sair / Logout</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><SidebarInset className="min-w-0 bg-[#f5f7fa] md:ml-[16rem]"><header className="h-16 border-b border-slate-200 bg-white flex items-center gap-3 px-6 sticky top-0 z-20"><SidebarTrigger className="text-slate-500" onClick={toggleSidebar}><PanelLeft className="h-4 w-4"/></SidebarTrigger><div className="text-sm text-slate-500">Operação / <span className="text-slate-900 font-semibold">{location === "/" ? "Dashboard" : menuItems.find((item) => item.path !== "laudo" && location.startsWith(item.path))?.label || "Operação"}</span></div><div className="ml-auto hidden items-center gap-2 text-xs text-slate-500 md:flex"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Atualização automática ativa</div></header><main className="flex min-w-0 min-h-[calc(100vh-4rem)] flex-col overflow-x-hidden"><div className="flex-1">{children}</div><footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-[11px] text-slate-400">Desenvolvido por Vinicius Scarpeta</footer></main></SidebarInset></div>;
}
