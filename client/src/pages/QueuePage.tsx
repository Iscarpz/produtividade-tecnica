import React from "react";
import { Input } from "@/components/ui/input";
import { CallDetail } from "@/components/CallDetail";
import { trpc } from "@/lib/trpc";
import { Search, Wrench, ChevronRight } from "lucide-react";
import { useState } from "react";

export const queues = {
  recebidos: { status: "RECEBIDO", title: "Recebidos", description: "Chamados que chegaram ao setor e aguardam início de andamento em bancada.", color: "bg-slate-500" },
  "em-andamento": { status: "EM ANDAMENTO", title: "Em andamento", description: "Chamados disponíveis para diagnóstico e encaminhamento.", color: "bg-blue-500" },
  pp: { status: "AGUARDANDO PP", title: "PP", description: "Chamados aguardando peça; registre o recebimento para retornar ao andamento.", color: "bg-amber-500" },
  orcamento: { status: "AGUARDANDO ORÇAMENTO", title: "Orçamento", description: "Chamados aguardando retorno do orçamento.", color: "bg-violet-500" },
  zurich: { status: "Zurich", title: "Zurich", description: "Chamados em tratativa com a Zurich.", color: "bg-rose-500" },
} as const;

export default function QueuePage({ queue }: { queue: keyof typeof queues }) {
  const config = queues[queue];
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const { data: calls = [], isLoading } = trpc.calls.list.useQuery({ status: config.status, search: search.trim() || undefined }, { refetchInterval: 8000, refetchOnWindowFocus: true });
  const refresh = () => { utils.calls.list.invalidate(); utils.productivity.range.invalidate(); if (selectedId) utils.calls.detail.invalidate({ id: selectedId }); };
  return <div className="min-w-0 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1500px]"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[#2E7D32]">Fila operacional</p><div className="mt-1 flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${config.color}`}/><h1 className="text-3xl font-bold tracking-tight text-slate-900">{config.title}</h1></div><p className="mt-2 text-sm text-slate-500">{config.description}</p></div><span className="w-fit rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">{calls.length} chamados</span></div><div className="mt-7 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar chamado por número ou serial..." className="h-11 border-0 bg-slate-50 pl-10 shadow-none focus-visible:ring-1"/></div></div><div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{isLoading ? <div className="p-12 text-center text-sm text-slate-400">Carregando fila...</div> : calls.length === 0 ? <div className="p-14 text-center"><Wrench className="mx-auto h-9 w-9 text-slate-300"/><p className="mt-3 font-medium text-slate-600">Nenhum chamado nesta fila</p><p className="mt-1 text-xs text-slate-400">Os chamados aparecerão aqui automaticamente ao mudar de status.</p></div> : <div className="divide-y divide-slate-100">{calls.map((call: any) => <button key={call.id} onClick={() => setSelectedId(call.id)} className="flex w-full min-w-0 items-center gap-4 p-4 text-left transition hover:bg-slate-50 sm:p-5"><div className="min-w-0 flex-1"><p className="font-mono text-sm font-bold text-slate-900">Chamado {call.numeroOs}</p><p className="mt-1 truncate text-sm text-slate-700">{call.modelo}</p><p className="mt-1 truncate text-xs text-slate-400">Serial {call.serial} · {call.queixa}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-slate-300"/></button>)}</div>}</div>{selectedId && <CallDetail id={selectedId} onClose={() => setSelectedId(null)} onRefresh={refresh}/>}</div></div>;
}
