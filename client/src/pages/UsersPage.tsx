import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Check, Copy, Link2, UserPlus, UsersRound, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const statusLabel: Record<string, string> = { ACTIVE: "Ativo", PENDING_AUTHORIZATION: "Aguardando autorização", REFUSED: "Recusado", REVOKED: "Revogado" };
const statusTone: Record<string, string> = { ACTIVE: "bg-emerald-50 text-emerald-700", PENDING_AUTHORIZATION: "bg-amber-50 text-amber-800", REFUSED: "bg-rose-50 text-rose-700", REVOKED: "bg-slate-100 text-slate-700" };

export default function UsersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const utils = trpc.useUtils();
  const users = trpc.users.list.useQuery();
  const invitations = trpc.users.listInvitations.useQuery(undefined, { enabled: Boolean(users.data) });
  const refresh = () => Promise.all([utils.users.list.invalidate(), utils.users.listInvitations.invalidate()]);
  const createInvitation = trpc.users.createInvitation.useMutation({
    onSuccess: (data) => { setLink(`${window.location.origin}/convite/${data.token}`); setName(""); setEmail(""); refresh(); toast.success("Convite gerado"); },
    onError: (error) => toast.error(error.message),
  });
  const authorize = trpc.users.authorize.useMutation({ onSuccess: () => { refresh(); toast.success("Técnico autorizado"); }, onError: (error) => toast.error(error.message) });
  const refuse = trpc.users.refuse.useMutation({ onSuccess: () => { refresh(); toast.success("Solicitação recusada"); }, onError: (error) => toast.error(error.message) });
  const revoke = trpc.users.revoke.useMutation({ onSuccess: () => { refresh(); toast.success("Acesso revogado"); }, onError: (error) => toast.error(error.message) });
  const revokeInvitation = trpc.users.revokeInvitation.useMutation({ onSuccess: () => { refresh(); toast.success("Convite revogado"); }, onError: (error) => toast.error(error.message) });

  if (users.isError) return <div className="p-8"><p className="text-sm text-slate-500">Você não possui acesso ao gerenciamento de usuários.</p></div>;
  if (users.isLoading) return <div className="p-8"><p className="text-sm text-slate-500">Carregando usuários...</p></div>;
  const pending = (users.data || []).filter((item) => item.accountStatus === "PENDING_AUTHORIZATION");

  return <div className="p-6 lg:p-8"><div className="mx-auto max-w-6xl">
    <p className="text-sm font-medium text-[#e09f18]">Configurações</p>
    <div className="mt-1 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-900">Usuários</h1><p className="mt-1 text-sm text-slate-500">Convide, autorize e gerencie os acessos dos técnicos.</p></div><Button className="bg-[#173f5f] text-white hover:bg-[#102d43]" onClick={() => setShowInvite((value) => !value)}><UserPlus className="mr-2 h-4 w-4"/>Convidar técnico</Button></div>
    {showInvite && <form className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); createInvitation.mutate({ name, email }); }}><div className="grid gap-4 sm:grid-cols-2"><div><Label>Nome do técnico</Label><Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} required/></div><div><Label>E-mail</Label><Input className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required/></div></div><Button type="submit" disabled={createInvitation.isPending} className="mt-4 bg-[#173f5f] text-white">Gerar convite</Button>{link && <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3"><Link2 className="h-4 w-4 text-slate-500"/><code className="min-w-0 flex-1 break-all text-xs text-slate-700">{link}</code><Button type="button" size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copiado"); }}><Copy className="mr-1 h-3.5 w-3.5"/>Copiar link</Button></div>}</form>}
    <section className="mt-7 rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4"><UsersRound className="h-5 w-5 text-[#173f5f]"/><div><h2 className="font-semibold text-slate-900">Solicitações pendentes</h2><p className="text-xs text-slate-500">Cadastros concluídos que aguardam sua decisão.</p></div></div><div className="divide-y divide-slate-100">{pending.length === 0 ? <p className="p-5 text-sm text-slate-500">Nenhuma solicitação aguardando autorização.</p> : pending.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-medium text-slate-900">{item.name}</p><p className="text-sm text-slate-500">{item.email}</p><p className="mt-1 text-xs text-slate-400">Cadastro em {new Date(item.createdAt).toLocaleDateString()}</p></div><div className="flex gap-2"><Button size="sm" className="bg-emerald-700 text-white hover:bg-emerald-800" onClick={() => authorize.mutate({ userId: item.id })}><Check className="mr-1 h-3.5 w-3.5"/>Autorizar</Button><Button size="sm" variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-50" onClick={() => refuse.mutate({ userId: item.id })}><X className="mr-1 h-3.5 w-3.5"/>Recusar</Button></div></div>)}</div></section>
    <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Usuários ativos e histórico de acesso</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Nome</th><th className="px-5 py-3">E-mail</th><th className="px-5 py-3">Perfil</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Cadastro</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{(users.data || []).map((item) => <tr key={item.id}><td className="px-5 py-4 font-medium text-slate-900">{item.name || "—"}</td><td className="px-5 py-4 text-slate-600">{item.email || "—"}</td><td className="px-5 py-4">{item.role === "admin" ? "Administrador" : "Técnico"}</td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone[item.accountStatus]}`}>{statusLabel[item.accountStatus]}</span></td><td className="px-5 py-4 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td><td className="px-5 py-4">{item.id !== user?.id && item.accountStatus === "ACTIVE" && <Button size="sm" variant="outline" className="border-slate-300" onClick={() => revoke.mutate({ userId: item.id })}>Revogar</Button>}</td></tr>)}</tbody></table></div></section>
    <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Convites</h2></div><div className="divide-y divide-slate-100">{(invitations.data || []).length === 0 ? <p className="p-5 text-sm text-slate-500">Nenhum convite criado.</p> : (invitations.data || []).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-medium text-slate-800">{item.inviteeName}</p><p className="text-sm text-slate-500">{item.email} · {item.status}</p><p className="text-xs text-slate-400">Expira em {new Date(item.expiresAt).toLocaleDateString()}</p></div>{item.status === "PENDING" && <Button size="sm" variant="outline" className="border-rose-300 text-rose-700" onClick={() => revokeInvitation.mutate({ id: item.id })}>Revogar convite</Button>}</div>)}</div></section>
    <button className="mt-6 text-sm font-medium text-[#173f5f] hover:underline" onClick={() => setLocation("/configuracoes")}>Voltar para Configurações</button>
  </div></div>;
}
