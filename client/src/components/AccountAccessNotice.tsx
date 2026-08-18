import { Button } from "@/components/ui/button";
import { Ban, Clock3, ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";

const messages = {
  PENDING_AUTHORIZATION: { icon: Clock3, title: "Acesso aguardando autorização", description: "Sua conta foi criada, mas ainda precisa ser autorizada pelo administrador." },
  REFUSED: { icon: ShieldAlert, title: "Acesso recusado", description: "Sua solicitação de acesso não foi autorizada. Procure o administrador para mais informações." },
  REVOKED: { icon: Ban, title: "Acesso revogado", description: "O acesso desta conta foi removido. Procure o administrador para mais informações." },
} as const;

export function AccountAccessNotice({ status, onLogout }: { status: "PENDING_AUTHORIZATION" | "REFUSED" | "REVOKED"; onLogout?: () => void }) {
  const [, setLocation] = useLocation();
  const message = messages[status];
  const Icon = message.icon;
  return <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] p-5"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-700"><Icon className="h-6 w-6"/></div><h1 className="mt-5 text-2xl font-bold text-slate-950">{message.title}</h1><p className="mt-3 text-sm leading-relaxed text-slate-600">{message.description}</p><div className="mt-7 flex justify-center gap-3"><Button variant="outline" onClick={() => setLocation("/entrar")}>Entrar com outra conta</Button>{onLogout && <Button className="bg-[#2E7D32] text-white hover:bg-[#0D1117]" onClick={onLogout}>Sair</Button>}</div></section></div>;
}
