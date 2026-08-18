import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ClipboardCheck, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

export default function InviteAccept() {
  const [, params] = useRoute("/convite/:token");
  const token = params?.token || "";
  const [, setLocation] = useLocation();
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const info = trpc.users.invitationInfo.useQuery({ token }, { retry: false });
  const register = trpc.users.registerWithInvitation.useMutation({ onSuccess: () => setAccepted(true), onError: (error) => toast.error(error.message) });
  useEffect(() => { if (info.data?.valid) { setName(info.data.name); setEmail(info.data.email); } }, [info.data]);

  if (info.isLoading) return <div className="grid min-h-screen place-items-center bg-[#f5f7fa] text-sm text-slate-500">Validando convite...</div>;
  if (!info.data?.valid) return <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] p-5"><section className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-xl"><ClipboardCheck className="mx-auto h-10 w-10 text-rose-600"/><h1 className="mt-4 text-2xl font-bold text-slate-950">Convite indisponível</h1><p className="mt-2 text-sm leading-relaxed text-slate-600">Este convite não existe, expirou, foi revogado ou já foi utilizado.</p><Button className="mt-6 bg-[#2E7D32] text-white" onClick={() => setLocation("/entrar")}>Ir para entrada</Button></section></div>;
  if (accepted && register.isSuccess) return <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] p-5"><section className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-xl"><CheckCircle2 className="mx-auto h-11 w-11 text-emerald-600"/><h1 className="mt-4 text-2xl font-bold text-slate-950">Cadastro realizado com sucesso</h1><p className="mt-3 text-sm leading-relaxed text-slate-600">Sua conta foi criada e está aguardando autorização do administrador.</p><Button className="mt-6 bg-[#2E7D32] text-white" onClick={() => setLocation("/entrar")}>Ir para entrada</Button></section></div>;
  return <div className="min-h-screen bg-[#f5f7fa] p-5 py-10"><section className="mx-auto w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl sm:p-8"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#A3E635] text-[#0D1117]"><UserPlus className="h-5 w-5"/></div><div><p className="text-xs font-semibold uppercase tracking-wider text-[#2E7D32]">TECBASE</p><h1 className="text-2xl font-bold text-slate-950">Você foi convidado</h1></div></div>{!accepted ? <><p className="mt-6 text-sm leading-relaxed text-slate-600">Você foi convidado para utilizar o sistema como técnico. O convite é destinado a <strong>{info.data.email}</strong>.</p><Button className="mt-6 w-full bg-[#2E7D32] text-white hover:bg-[#0D1117]" onClick={() => setAccepted(true)}>Aceitar convite</Button></> : <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); if (password !== confirmation) return toast.error("As senhas não conferem"); register.mutate({ token, name, email, password }); }}><div><Label htmlFor="invite-name">Nome</Label><Input id="invite-name" className="mt-2" value={name} onChange={(event) => setName(event.target.value)}/></div><div><Label htmlFor="invite-email">E-mail</Label><Input id="invite-email" className="mt-2 bg-slate-50" value={email} readOnly/></div><div><Label htmlFor="invite-password">Senha</Label><Input id="invite-password" className="mt-2" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required/></div><div><Label htmlFor="invite-confirmation">Confirmação de senha</Label><Input id="invite-confirmation" className="mt-2" type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required/></div><Button type="submit" disabled={register.isPending} className="w-full bg-[#2E7D32] text-white hover:bg-[#0D1117]">{register.isPending ? "Criando conta..." : "Concluir cadastro"}</Button></form>}</section></div>;
}
