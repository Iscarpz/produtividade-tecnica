import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Database, LogOut, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Settings() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  useEffect(() => setName(user?.name || ""), [user?.name]);
  const update = trpc.auth.updateProfile.useMutation({ onSuccess: () => { utils.auth.me.invalidate(); toast.success("Configurações salvas"); }, onError: (e) => toast.error(e.message) });
  const canManageImageBios = user?.role === "admin" || user?.role === "manager";
  return <div className="p-6 lg:p-8"><div className="mx-auto max-w-3xl"><p className="text-sm font-medium text-[#e09f18]">Preferências</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Configurações</h1><p className="mt-1 text-sm text-slate-500">Ajustes simples para adaptar a operação ao seu fluxo.</p><div className="mt-7 space-y-5"><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-900">Perfil do técnico</h2><p className="mt-1 text-sm text-slate-500">Este nome aparece na sessão e nas próximas expansões para múltiplos técnicos.</p><div className="mt-5 max-w-lg"><Label htmlFor="technician-name">Nome do técnico</Label><Input id="technician-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" placeholder="Seu nome"/></div><Button onClick={() => update.mutate({ name })} disabled={!name.trim() || update.isPending} className="mt-5 bg-[#173f5f] text-white hover:bg-[#102d43]"><Save className="mr-2 h-4 w-4"/>{update.isPending ? "Salvando..." : "Salvar perfil"}</Button></section>{user?.role === "admin" && <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-900">Usuários</h2><p className="mt-1 text-sm text-slate-500">Convide técnicos e autorize os acessos pendentes.</p><Button variant="outline" className="mt-5 border-[#173f5f] text-[#173f5f]" onClick={() => setLocation("/configuracoes/usuarios")}>Gerenciar usuários</Button></section>}{canManageImageBios && <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><Database className="mt-0.5 h-5 w-5 text-[#e09f18]"/><div><h2 className="font-semibold text-slate-900">Imagens / BIOS</h2><p className="mt-1 text-sm text-slate-500">Cadastre modelos e versões usadas automaticamente no script técnico.</p><Button variant="outline" className="mt-5 border-[#173f5f] text-[#173f5f]" onClick={() => setLocation("/configuracoes/imagens-bios")}>Gerenciar Imagens / BIOS</Button></div></div></section>}<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-900">Preferências básicas</h2><div className="mt-5 flex items-center justify-between gap-5"><div><p className="text-sm font-medium text-slate-800">Atualização automática</p><p className="mt-1 text-sm text-slate-500">Atualiza as filas periodicamente sem precisar pressionar F5.</p></div><Switch checked={autoRefresh} onCheckedChange={setAutoRefresh}/></div></section><section className="rounded-xl border border-rose-200 bg-rose-50/50 p-6"><h2 className="font-semibold text-rose-900">Sessão</h2><p className="mt-1 text-sm text-rose-700">Encerre a sessão atual neste dispositivo.</p><Button variant="outline" onClick={logout} className="mt-5 border-rose-300 bg-white text-rose-700 hover:bg-rose-100"><LogOut className="mr-2 h-4 w-4"/>Sair / Logout</Button></section></div></div></div>;
}
