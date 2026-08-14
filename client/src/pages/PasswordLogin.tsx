import { AccountAccessNotice } from "@/components/AccountAccessNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PasswordLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [blocked, setBlocked] = useState<"PENDING_AUTHORIZATION" | "REFUSED" | "REVOKED" | null>(null);
  const login = trpc.users.loginWithPassword.useMutation({ onSuccess: (result) => { if (result.accountStatus === "ACTIVE") { window.location.assign("/"); } else setBlocked(result.accountStatus); }, onError: (error) => toast.error(error.message) });
  if (blocked) return <AccountAccessNotice status={blocked}/>;
  return <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] p-5"><form className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl" onSubmit={(event) => { event.preventDefault(); login.mutate({ email, password }); }}><p className="text-sm font-semibold text-[#c98700]">Acesso do técnico</p><h1 className="mt-1 text-2xl font-bold text-slate-950">Entrar no sistema</h1><p className="mt-2 text-sm text-slate-500">Use a conta criada a partir do seu convite.</p><div className="mt-6 space-y-4"><div><Label htmlFor="login-email">E-mail</Label><Input id="login-email" type="email" className="mt-2" value={email} onChange={(event) => setEmail(event.target.value)} required/></div><div><Label htmlFor="login-password">Senha</Label><Input id="login-password" type="password" className="mt-2" value={password} onChange={(event) => setPassword(event.target.value)} required/></div></div><Button type="submit" disabled={login.isPending} className="mt-6 w-full bg-[#173f5f] text-white hover:bg-[#102d43]">{login.isPending ? "Entrando..." : "Entrar"}</Button><button type="button" className="mt-4 w-full text-sm font-medium text-[#173f5f] hover:underline" onClick={() => setLocation("/")}>Entrar com Manus</button></form></div>;
}
