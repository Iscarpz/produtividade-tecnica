import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/lib/trpc";
import { daysOpen } from "@/lib/callParser";
import { LAUDO_CREATOR_URL } from "./DashboardLayout";
import { CheckCircle2, Clock3, Download, Eye, FileText, Package, Paperclip, Pencil, Save, Trash2, Upload, Wrench, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const statusTone: Record<string, string> = {
  RECEBIDO: "bg-slate-100 text-slate-700 ring-slate-200",
  "EM ANDAMENTO": "bg-blue-50 text-blue-700 ring-blue-200",
  "AGUARDANDO PP": "bg-amber-50 text-amber-700 ring-amber-200",
  "AGUARDANDO ORÇAMENTO": "bg-violet-50 text-violet-700 ring-violet-200",
  Zurich: "bg-rose-50 text-rose-700 ring-rose-200",
  FINALIZADO: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  TROCA: "bg-slate-100 text-slate-700 ring-slate-200",
  RECUSADO: "bg-red-50 text-red-700 ring-red-200",
};

const emptyRepair = () => ({ peca: "", codigo: "", serialRetirada: "", serialInstalada: "", observacao: "" });
const fileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Não foi possível ler o anexo")); reader.readAsDataURL(file); });
const fileSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

type TimelineEvent = { id: number | string; evento: string; statusNovo?: string | null; statusAnterior?: string | null; observacao?: string | null; createdAt: Date | string };
export function getOperationalTimeline(history: TimelineEvent[], repairs: Array<{ id: number }>) {
  const movements = history.filter((event) => Boolean(event.statusNovo) || event.evento === "Chamado recebido no setor" || event.evento === "Início do andamento");
  const firstRepair = repairs.length ? history.find((event) => event.evento.startsWith("Peça adicionada:")) : undefined;
  const timeline = firstRepair ? [...movements, { id: `repair-${firstRepair.id}`, evento: "Reparo realizado", createdAt: firstRepair.createdAt }] : movements;
  return timeline.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function CallDetail({ id, onClose, onRefresh }: { id: number; onClose: () => void; onRefresh: () => void }) {
  const [deleted, setDeleted] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const detailQueryKey = getQueryKey(trpc.calls.detail, { id }, "query");
  const { data, isLoading, isError } = trpc.calls.detail.useQuery({ id }, { enabled: !deleted, retry: false });
  const { data: scriptPreview } = trpc.calls.generateScript.useQuery({ id }, { enabled: !deleted, retry: false });
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({ modelo: "", serial: "", queixa: "" });
  const [technicalFields, setTechnicalFields] = useState({ diagnostico: "", observacoes: "", inspecaoVisual: "" });
  const [diagnosticEditing, setDiagnosticEditing] = useState(false);
  const [observationsEditing, setObservationsEditing] = useState(false);
  const [diagnosticSaveState, setDiagnosticSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [observationsSaveState, setObservationsSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const lastPersistedTechnical = useRef({ diagnostico: "", observacoes: "", inspecaoVisual: "" });
  const [technicalSaveState, setTechnicalSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [repair, setRepair] = useState(emptyRepair);
  const [editingRepairId, setEditingRepairId] = useState<number | null>(null);
  const [repairToDelete, setRepairToDelete] = useState<{ id: number; peca: string } | null>(null);
  const [laudoAction, setLaudoAction] = useState<"Enviar para Orçamento" | "Enviar para Zurich" | null>(null);
  const [scriptVisible, setScriptVisible] = useState(false);
  const refreshOperationalData = async () => {
    await Promise.all([
      utils.calls.list.invalidate(),
      utils.calls.detail.invalidate({ id }),
      utils.calls.generateScript.invalidate({ id }),
      utils.productivity.range.invalidate(),
      utils.historical.troca.invalidate(),
      utils.historical.recusado.invalidate(),
    ]);
    onRefresh();
  };
  const transition = trpc.calls.transition.useMutation({ onSuccess: async (_result, variables) => { await refreshOperationalData(); toast.success(variables.action === "Reabrir chamado" ? "Chamado reaberto" : "Status atualizado"); if (["Finalizar", "Enviar para PP", "Enviar para Orçamento", "Enviar para Zurich"].includes(variables.action)) { onClose(); setLocation("/"); } }, onError: (error) => toast.error(error.message) });
  const updateData = trpc.calls.updateData.useMutation({ onSuccess: () => { toast.success("Dados atualizados"); setEditing(false); onRefresh(); }, onError: (error) => toast.error(error.message) });
  const updateTechnicalData = trpc.calls.updateTechnicalData.useMutation({ onMutate: (variables) => { setTechnicalSaveState("saving"); if (variables.diagnostico !== undefined) setDiagnosticSaveState("saving"); if (variables.observacoes !== undefined) setObservationsSaveState("saving"); }, onSuccess: (_result, variables) => { if (variables.diagnostico !== undefined) { lastPersistedTechnical.current = { ...lastPersistedTechnical.current, diagnostico: variables.diagnostico }; setDiagnosticSaveState("saved"); } if (variables.observacoes !== undefined) { lastPersistedTechnical.current = { ...lastPersistedTechnical.current, observacoes: variables.observacoes }; setObservationsSaveState("saved"); } setTechnicalSaveState("saved"); utils.calls.generateScript.invalidate({ id }); utils.calls.detail.invalidate({ id }); onRefresh(); }, onError: (error, variables) => { if (variables.diagnostico !== undefined) setDiagnosticSaveState("error"); if (variables.observacoes !== undefined) setObservationsSaveState("error"); setTechnicalSaveState("error"); toast.error(error.message); } });
  const addRepair = trpc.calls.addRepair.useMutation({ onSuccess: async () => { setRepair(emptyRepair()); await refreshOperationalData(); toast.success("Peça adicionada e Script Técnico atualizado"); }, onError: (error) => toast.error(error.message) });
  const updateRepair = trpc.calls.updateRepair.useMutation({ onSuccess: async () => { setEditingRepairId(null); setRepair(emptyRepair()); await refreshOperationalData(); toast.success("Peça atualizada e Script Técnico atualizado"); }, onError: (error) => toast.error(error.message) });
  const deleteRepair = trpc.calls.deleteRepair.useMutation({ onSuccess: async () => { setRepairToDelete(null); await refreshOperationalData(); toast.success("Peça excluída e Script Técnico atualizado"); }, onError: (error) => toast.error(error.message) });
  const uploadAttachment = trpc.calls.uploadAttachment.useMutation({ onSuccess: async () => { await utils.calls.detail.invalidate({ id }); onRefresh(); toast.success("Anexo adicionado ao chamado"); }, onError: (error) => toast.error(error.message) });
  const deleteAttachment = trpc.calls.deleteAttachment.useMutation({ onSuccess: async () => { await utils.calls.detail.invalidate({ id }); onRefresh(); toast.success("Anexo removido"); }, onError: (error) => toast.error(error.message) });
  const removeCall = trpc.calls.delete.useMutation({ onSuccess: async () => {
    setDeleted(true);
    await queryClient.cancelQueries({ queryKey: detailQueryKey, exact: true });
    queryClient.removeQueries({ queryKey: detailQueryKey, exact: true });
    onClose();
    await Promise.all([utils.calls.list.invalidate(), utils.productivity.range.invalidate(), utils.historical.troca.invalidate(), utils.historical.recusado.invalidate()]);
    onRefresh();
    toast.success("Chamado excluído permanentemente");
  }, onError: (error) => toast.error(error.message) });

  useEffect(() => {
    if (data?.call) { const technical = { diagnostico: data.call.diagnostico || "", observacoes: data.call.observacoes || "", inspecaoVisual: data.call.inspecaoVisual || "" }; setFields({ modelo: data.call.modelo, serial: data.call.serial, queixa: data.call.queixa }); setTechnicalFields(technical); lastPersistedTechnical.current = technical; }
  }, [data?.call?.id]);

  useEffect(() => { const interval = window.setInterval(() => setClock(Date.now()), 60_000); return () => window.clearInterval(interval); }, []);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector('[role="alertdialog"], [role="dialog"]')) return;
      onClose();
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [onClose]);

  if (isLoading) return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"><div className="flex min-w-52 flex-col items-center rounded-xl border border-[#D1FAE5] bg-white p-8 text-sm font-medium text-slate-700 shadow-xl"><span className="tecbase-loader"/><span className="mt-4">Carregando chamado...</span></div></div>;
  if (isError || !data) return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"><section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"><h2 className="text-xl font-bold text-slate-950">Chamado não encontrado</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Este chamado não existe mais ou não está disponível para sua conta.</p><Button className="mt-6 bg-[#2E7D32] text-white hover:bg-[#0D1117]" onClick={() => { onClose(); setLocation("/chamados"); }}>Voltar para Chamados</Button></section></div>;

  const call: any = data.call;
  const operationalTimeline = getOperationalTimeline(data.history, data.repairs);
  const actions = call.status === "RECEBIDO"
    ? ["Iniciar andamento"]
    : call.status === "EM ANDAMENTO"
    ? ["Finalizar", "Enviar para PP", "Enviar para Orçamento", "Enviar para Zurich"]
    : call.status === "AGUARDANDO PP"
      ? ["Peça recebida", "Troca"]
      : call.status === "AGUARDANDO ORÇAMENTO" || call.status === "Zurich"
        ? ["Orçamento aprovado", "Orçamento recusado", "Troca"]
        : call.status === "FINALIZADO"
          ? ["Reabrir chamado"]
          : [];
  const runAction = (action: string) => {
    if (action === "Finalizar" && !window.confirm("Confirmar a finalização do chamado?")) return;
    if (action === "Enviar para Orçamento" || action === "Enviar para Zurich") { setLaudoAction(action); return; }
    void completeTransition(action);
  };
  const continueWithoutLaudo = () => {
    if (!laudoAction) return;
    void completeTransition(laudoAction);
    setLaudoAction(null);
  };
  const openLaudoCreator = () => {
    if (!laudoAction) return;
    const movement = laudoAction === "Enviar para Zurich" ? "zurich" : "orcamento";
    window.open(`${LAUDO_CREATOR_URL}?chamado=${id}&movimento=${movement}`, "_blank", "noopener,noreferrer");
    void completeTransition(laudoAction);
    setLaudoAction(null);
  };
  const save = () => updateData.mutate({ id, ...fields });
  const saveDiagnostic = () => {
    const diagnostico = technicalFields.diagnostico;
    if (diagnostico === lastPersistedTechnical.current.diagnostico) return;
    updateTechnicalData.mutate({ id, diagnostico });
  };
  const saveObservations = () => { const observacoes = technicalFields.observacoes; if (observacoes === lastPersistedTechnical.current.observacoes) return; updateTechnicalData.mutate({ id, observacoes }); };
  const selectInspection = (inspecaoVisual: string) => {
    setTechnicalFields((current) => ({ ...current, inspecaoVisual }));
    if (inspecaoVisual === lastPersistedTechnical.current.inspecaoVisual) return;
    lastPersistedTechnical.current = { ...lastPersistedTechnical.current, inspecaoVisual };
    updateTechnicalData.mutate({ id, inspecaoVisual: inspecaoVisual as any });
  };
  const submitRepair = () => {
    if (editingRepairId) updateRepair.mutate({ id: editingRepairId, chamadoId: id, ...repair });
    else addRepair.mutate({ chamadoId: id, ...repair });
  };
  const startEditRepair = (item: any) => { setEditingRepairId(item.id); setRepair({ peca: item.peca, codigo: item.codigo || "", serialRetirada: item.serialRetirada || "", serialInstalada: item.serialInstalada || "", observacao: item.observacao || "" }); };
  const cancelRepairEdit = () => { setEditingRepairId(null); setRepair(emptyRepair()); };
  const copyScript = async () => { if (!scriptPreview?.script) return; await navigator.clipboard.writeText(scriptPreview.script); toast.success("Script técnico copiado"); };
  const pendingTechnicalFields = () => { const pending: { diagnostico?: string; observacoes?: string } = {}; if (technicalFields.diagnostico !== lastPersistedTechnical.current.diagnostico) pending.diagnostico = technicalFields.diagnostico; if (technicalFields.observacoes !== lastPersistedTechnical.current.observacoes) pending.observacoes = technicalFields.observacoes; return pending; };
  const completeTransition = (action: string) => { const pending = pendingTechnicalFields(); if (!Object.keys(pending).length) { transition.mutate({ id, action: action as any }); return; } void updateTechnicalData.mutateAsync({ id, ...pending }).then(() => transition.mutate({ id, action: action as any })).catch(() => undefined); };
  const addAttachment = async (file?: File) => { if (!file) return; if (file.size > 25 * 1024 * 1024) { toast.error("O anexo deve ter no máximo 25MB"); return; } try { await uploadAttachment.mutateAsync({ chamadoId: id, nomeArquivo: file.name, dataUrl: await fileAsDataUrl(file) }); } catch { /* feedback handled by the mutation */ } };

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-3 sm:p-6">
    <AlertDialog open={Boolean(laudoAction)} onOpenChange={(open) => { if (!open) setLaudoAction(null); }}>
      <AlertDialogContent className="z-[70] w-[calc(100%-2rem)] max-w-[420px] bg-white p-6 text-slate-900 sm:max-w-[420px]">
        <AlertDialogHeader><AlertDialogTitle className="text-xl font-bold text-slate-950">Necessário gerar um laudo?</AlertDialogTitle><AlertDialogDescription className="leading-relaxed text-slate-600">Escolha se deseja abrir o Laudo Creator antes de enviar este chamado para {laudoAction === "Enviar para Zurich" ? "Zurich" : "Orçamento"}.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter className="mt-3 gap-3 sm:justify-end"><AlertDialogCancel className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100" onClick={continueWithoutLaudo}>NÃO</AlertDialogCancel><AlertDialogAction className="bg-[#2E7D32] text-white hover:bg-[#0D1117]" onClick={openLaudoCreator}>SIM</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={Boolean(repairToDelete)} onOpenChange={(open) => { if (!open) setRepairToDelete(null); }}>
      <AlertDialogContent className="z-[70] w-[calc(100%-2rem)] max-w-[420px] bg-white p-6 text-slate-900 sm:max-w-[420px]">
        <AlertDialogHeader><AlertDialogTitle className="text-xl font-bold text-slate-950">Excluir esta peça?</AlertDialogTitle><AlertDialogDescription className="leading-relaxed text-slate-600">Esta ação removerá o registro desta peça do chamado.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter className="mt-3 gap-3 sm:justify-end"><AlertDialogCancel className="bg-white">Cancelar</AlertDialogCancel><AlertDialogAction disabled={deleteRepair.isPending} className="bg-red-700 text-white hover:bg-red-800" onClick={() => repairToDelete && deleteRepair.mutate({ id: repairToDelete.id, chamadoId: id })}>{deleteRepair.isPending ? "Excluindo..." : "Excluir"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <article className="mx-auto my-2 w-full max-w-6xl overflow-hidden rounded-2xl bg-[#f7f9fc] shadow-2xl">
      <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2E7D32]">Central técnica do chamado</p><div className="mt-3 flex flex-wrap items-center gap-3"><div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Chamado</p><h2 className="mt-1 font-mono text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{call.numeroOs}</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusTone[call.status] || "bg-slate-100 text-slate-700 ring-slate-200"}`}>{call.status}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Info label="Modelo" value={call.modelo}/><Info label="Serial" value={call.serial}/></div></div>
          <button aria-label="Fechar ficha" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5"/></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="Recebimento no setor" value={new Date(call.dataEntrada).toLocaleDateString()}/><Info label="Início do andamento" value={call.dataInicioAndamento ? new Date(call.dataInicioAndamento).toLocaleDateString() : "Ainda não iniciado"}/><div className="rounded-xl bg-[#2E7D32] p-3 text-white"><p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Tempo desde recebimento</p><p className="mt-1 text-lg font-bold">{daysOpen(call.dataEntrada, new Date(clock))} dias</p></div><div className="rounded-xl bg-blue-600 p-3 text-white"><p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Tempo em andamento</p><p className="mt-1 text-lg font-bold">{call.dataInicioAndamento ? `${daysOpen(call.dataInicioAndamento, new Date(clock))} dias` : "Não iniciado"}</p></div></div>
      </header>
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_340px] sm:p-8">
        <main className="min-w-0 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-[#2E7D32]"/><h3 className="font-semibold text-slate-900">Dados do chamado</h3></div>{editing ? <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setEditing(false); setFields({ modelo: call.modelo, serial: call.serial, queixa: call.queixa }); }}>Cancelar</Button><Button size="sm" className="bg-[#2E7D32] text-white hover:bg-[#0D1117]" disabled={updateData.isPending || !fields.modelo || !fields.serial || !fields.queixa} onClick={save}><Save className="mr-1 h-3.5 w-3.5"/>Salvar</Button></div> : <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="mr-1 h-3.5 w-3.5"/>Editar</Button>}</div>
            {editing ? <div className="mt-4 grid gap-3"><div className="grid gap-3 sm:grid-cols-2"><Input aria-label="Modelo" value={fields.modelo} onChange={(event) => setFields({ ...fields, modelo: event.target.value })}/><Input aria-label="Serial" value={fields.serial} onChange={(event) => setFields({ ...fields, serial: event.target.value })}/></div><Textarea aria-label="Queixa formalizada" value={fields.queixa} onChange={(event) => setFields({ ...fields, queixa: event.target.value })}/></div> : <><div className="mt-4 rounded-xl border border-amber-200 border-l-4 border-l-[#2E7D32] bg-amber-50/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">Queixa</p><p className="mt-2 text-base leading-relaxed text-slate-900">{call.queixa}</p></div>{call.queixaOriginal && call.queixaOriginal !== call.queixa && <details className="mt-3 rounded-lg border border-slate-200 px-4 py-3"><summary className="cursor-pointer text-sm font-medium text-slate-600">Ver queixa original extraída</summary><p className="mt-3 text-sm leading-relaxed text-slate-500">{call.queixaOriginal}</p></details>}</>}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#2E7D32]"/><h3 className="font-semibold text-slate-900">Diagnóstico e inspeção</h3></div>
            <p className="mt-1 text-xs text-slate-500">O diagnóstico é salvo ao sair do campo; a inspeção visual permanece com salvamento automático.</p>
            <div className="mt-4"><div className="flex flex-wrap items-center justify-between gap-2"><label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="diagnostico">Diagnóstico *</label>{diagnosticSaveState === "saved" && !diagnosticEditing && <span role="status" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5"/>Diagnóstico salvo</span>}{diagnosticSaveState === "saving" && <span role="status" className="text-xs font-medium text-amber-700">Salvando diagnóstico...</span>}{diagnosticSaveState === "error" && <span role="status" className="text-xs font-medium text-red-700">Não foi possível salvar</span>}</div><Textarea id="diagnostico" aria-label="Diagnóstico" className="mt-2 min-h-24" value={technicalFields.diagnostico} onFocus={() => { setDiagnosticEditing(true); setDiagnosticSaveState("idle"); }} onChange={(event) => setTechnicalFields((current) => ({ ...current, diagnostico: event.target.value }))} onBlur={() => { setDiagnosticEditing(false); saveDiagnostic(); }} placeholder="Descreva o diagnóstico técnico constatado."/></div>
            <div className="mt-5"><div className="flex flex-wrap items-center justify-between gap-2"><label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="observacoes">Observações</label>{observationsSaveState === "saved" && !observationsEditing && <span role="status" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5"/>Observações salvas</span>}{observationsSaveState === "saving" && <span role="status" className="text-xs font-medium text-amber-700">Salvando observações...</span>}{observationsSaveState === "error" && <span role="status" className="text-xs font-medium text-red-700">Não foi possível salvar</span>}</div><Textarea id="observacoes" aria-label="Observações" className="mt-2 min-h-20" value={technicalFields.observacoes} onFocus={() => { setObservationsEditing(true); setObservationsSaveState("idle"); }} onChange={(event) => setTechnicalFields((current) => ({ ...current, observacoes: event.target.value }))} onBlur={() => { setObservationsEditing(false); saveObservations(); }} placeholder="Registre informações adicionais do atendimento, se necessário."/></div>
            <fieldset className="mt-5"><legend className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inspeção visual / testes de hardware *</legend><div className="mt-3 space-y-2">{["SEM SINAIS DE MAU USO OU DE ABERTURA PRÉVIA.", "MAU USO CONSTATADO - EQUIPAMENTO COM AVARIAS E/OU DANOS FÍSICOS", "CONSTATADO ABERTURA PRÉVIA POR PESSOAL NÃO AUTORIZADO"].map((option) => <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${technicalFields.inspecaoVisual === option ? "border-[#2E7D32] bg-blue-50 text-slate-900" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><input type="radio" name={`inspecao-${id}`} checked={technicalFields.inspecaoVisual === option} onChange={() => selectInspection(option)} className="mt-0.5 accent-[#2E7D32]"/><span>{option}</span></label>)}</div></fieldset>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Imagem / BIOS</p><p className="mt-1 text-sm font-medium text-slate-800">{call.imagemBiosTipo && call.imagemBiosVersao ? `${call.imagemBiosTipo}: ${call.imagemBiosVersao}` : scriptPreview?.resolvedCatalog ? `${scriptPreview.resolvedCatalog.tipo}: ${scriptPreview.resolvedCatalog.versao}` : "IMAGEM/BIOS NÃO CADASTRADA"}</p><p className="mt-1 text-xs text-slate-500">{call.imagemBiosVersao ? "Versão persistida automaticamente no chamado." : scriptPreview?.resolvedCatalog ? "Versão será persistida ao salvar um dado técnico." : "Modelo sem versão de Imagem/BIOS cadastrada."}</p></div><p className={`text-xs font-medium ${technicalSaveState === "error" ? "text-red-600" : technicalSaveState === "saving" ? "text-amber-700" : "text-emerald-700"}`}>{diagnosticEditing ? "Editando diagnóstico localmente" : technicalSaveState === "saving" ? "Salvando..." : technicalSaveState === "error" ? "Não foi possível salvar" : "Salvamento ativo"}</p></div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Paperclip className="h-4 w-4 text-[#2E7D32]"/><div><h3 className="font-semibold text-slate-900">Anexos</h3><p className="mt-1 text-xs text-slate-500">Arquivos opcionais vinculados a este atendimento.</p></div></div><label className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Upload className="mr-1.5 h-3.5 w-3.5"/>{uploadAttachment.isPending ? "Enviando..." : "Adicionar anexo"}<input type="file" className="hidden" disabled={uploadAttachment.isPending} onChange={(event) => { void addAttachment(event.target.files?.[0]); event.currentTarget.value = ""; }}/></label></div><div className="mt-4 space-y-2">{data.attachments?.length ? data.attachments.map((item: any) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"><div className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-[#2E7D32]"/><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{item.tipo === "LAUDO_TECNICO" ? "LAUDO TÉCNICO · " : ""}{item.nomeArquivo}</p><p className="text-[11px] text-slate-500">{fileSize(item.tamanhoBytes)}</p></div></div><div className="flex shrink-0 gap-1"><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Visualizar ${item.nomeArquivo}`}><Button type="button" size="icon" variant="outline" className="h-8 w-8"><Eye className="h-3.5 w-3.5"/></Button></a><a href={item.url} download={item.nomeArquivo} aria-label={`Baixar ${item.nomeArquivo}`}><Button type="button" size="icon" variant="outline" className="h-8 w-8"><Download className="h-3.5 w-3.5"/></Button></a><Button type="button" size="icon" variant="outline" className="h-8 w-8 border-red-200 text-red-700 hover:bg-red-50" disabled={deleteAttachment.isPending} onClick={() => deleteAttachment.mutate({ id: item.id })}><Trash2 className="h-3.5 w-3.5"/></Button></div></div>) : <p className="text-sm text-slate-400">Nenhum anexo neste chamado.</p>}</div></section>
          <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-[#2E7D32]"/><h3 className="font-semibold text-slate-900">Reparos e Peças</h3></div><p className="mt-1 text-xs text-slate-500">Adicione, revise ou remova cada Peça utilizada neste equipamento.</p><div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-800">{editingRepairId ? "Editar Peça" : "Adicionar Peça"}</p>{editingRepairId && <Button size="sm" variant="outline" onClick={cancelRepairEdit}>Cancelar</Button>}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><Input placeholder="Peça *" value={repair.peca} onChange={(event) => setRepair({ ...repair, peca: event.target.value })}/><Input placeholder="Código" value={repair.codigo} onChange={(event) => setRepair({ ...repair, codigo: event.target.value })}/><Input placeholder="Número de série retirada" value={repair.serialRetirada} onChange={(event) => setRepair({ ...repair, serialRetirada: event.target.value })}/><Input placeholder="Número de série instalada" value={repair.serialInstalada} onChange={(event) => setRepair({ ...repair, serialInstalada: event.target.value })}/></div><Textarea className="mt-3" placeholder="Observação" value={repair.observacao} onChange={(event) => setRepair({ ...repair, observacao: event.target.value })}/><Button className="mt-3 bg-[#2E7D32] text-white hover:bg-[#0D1117]" disabled={!repair.peca || addRepair.isPending || updateRepair.isPending} onClick={submitRepair}>{editingRepairId ? updateRepair.isPending ? "Salvando..." : "Salvar alteração" : addRepair.isPending ? "Adicionando..." : "Adicionar Peça"}</Button></div><div className="mt-4 space-y-2"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Peças utilizadas no reparo</p>{data.repairs.length === 0 ? <p className="text-sm text-slate-400">Nenhuma Peça adicionada ao reparo.</p> : data.repairs.map((item: any) => <div key={item.id} className="rounded-lg border border-slate-100 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium text-slate-800">{item.peca} {item.codigo ? <span className="font-normal text-slate-500">· {item.codigo}</span> : null}</p><p className="mt-1 text-xs text-slate-500">{item.serialRetirada ? `Retirado: ${item.serialRetirada}` : ""}{item.serialRetirada && item.serialInstalada ? " · " : ""}{item.serialInstalada ? `Instalado: ${item.serialInstalada}` : ""}{item.observacao ? ` · ${item.observacao}` : ""}</p></div><div className="flex shrink-0 gap-1"><Button size="sm" variant="outline" onClick={() => startEditRepair(item)}><Pencil className="mr-1 h-3.5 w-3.5"/>Editar</Button><Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => setRepairToDelete({ id: item.id, peca: item.peca })}><Trash2 className="mr-1 h-3.5 w-3.5"/>Excluir</Button></div></div></div>)}</div></section>
          <section className="rounded-xl border border-[#2E7D32]/20 bg-[#f7fbff] p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Script.AI integrado</p><h3 className="mt-1 font-semibold text-slate-900">Gerador de script técnico</h3><p className="mt-1 text-sm text-slate-600">Usa os dados estruturados do chamado, diagnóstico, inspeção, Imagem/BIOS e reparos registrados.</p></div><Button className="bg-[#2E7D32] text-white hover:bg-[#0D1117]" onClick={() => setScriptVisible(true)}>GERAR SCRIPT TÉCNICO</Button></div>{scriptVisible && <div className="mt-5 border-t border-[#2E7D32]/15 pt-5">{!scriptPreview ? <p className="text-sm text-slate-500">Preparando dados técnicos...</p> : scriptPreview.errors.length > 0 ? <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-900">NÃO É POSSÍVEL GERAR O SCRIPT</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">{scriptPreview.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : <div className="flex justify-end"><Button size="sm" variant="outline" onClick={copyScript}>Copiar script</Button></div>} {scriptPreview?.errors.length === 0 && scriptPreview.script && <pre className="mt-3 max-h-[500px] overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100"><code>{scriptPreview.script}</code></pre>}</div>}</section>
          <section className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-5"><div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-400"/><h3 className="font-semibold text-slate-700">Opções disponíveis</h3></div><p className="mt-1 text-xs text-slate-500">Ações secundárias compatíveis com o status atual do chamado.</p><div className="mt-4 flex flex-wrap gap-2">{actions.length === 0 ? <p className="text-sm text-slate-400">Chamado encerrado — não há opções disponíveis.</p> : actions.map((action) => <Button key={action} variant={action === "Finalizar" || action === "Orçamento recusado" ? "default" : "outline"} className={action === "Finalizar" ? "bg-emerald-600 text-white hover:bg-emerald-700" : action === "Orçamento recusado" ? "bg-red-600 text-white hover:bg-red-700" : ""} disabled={transition.isPending} onClick={() => runAction(action)}>{action}</Button>)}</div></section>
          <div className="flex justify-end"><AlertDialog><AlertDialogTrigger asChild><Button variant="outline" className="border-red-300 bg-white text-red-700 hover:bg-red-100 hover:text-red-800"><Trash2 className="mr-2 h-4 w-4"/>Excluir chamado</Button></AlertDialogTrigger><AlertDialogContent className="z-[70] w-[calc(100%-2rem)] max-w-[460px] bg-white p-6 text-slate-900 sm:max-w-[460px]"><AlertDialogHeader><AlertDialogTitle className="text-xl font-bold text-slate-950">Excluir chamado?</AlertDialogTitle><AlertDialogDescription className="leading-relaxed text-slate-600"><span>Esta ação apagará permanentemente o chamado e todos os dados relacionados, incluindo reparos, peças, histórico e registros de produtividade.</span><span className="mt-3 block">Essa ação não pode ser desfeita.</span></AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="mt-2 gap-3 sm:justify-end"><AlertDialogCancel className="bg-white">Cancelar</AlertDialogCancel><AlertDialogAction disabled={removeCall.isPending} className="bg-red-700 text-white hover:bg-red-800" onClick={() => removeCall.mutate({ id })}>{removeCall.isPending ? "Excluindo..." : "Excluir permanentemente"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
        </main>
        <aside className="min-w-0"><section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#2E7D32]"/><h3 className="font-semibold text-slate-900">Histórico do chamado</h3></div><p className="mt-1 text-xs text-slate-500">Etapas relevantes do fluxo operacional.</p><div className="mt-5 space-y-5 border-l-2 border-slate-100 pl-5">{operationalTimeline.length === 0 ? <p className="text-sm text-slate-400">Nenhuma movimentação operacional registrada.</p> : operationalTimeline.map((event) => <div key={event.id} className="relative"><span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-[#2E7D32] ring-4 ring-white"/><p className="text-sm font-medium text-slate-800">{event.evento}</p><p className="mt-1 text-xs text-slate-400">{new Date(event.createdAt).toLocaleString()}</p>{event.statusNovo && <p className="mt-1 text-xs text-slate-500">{event.statusAnterior ? `${event.statusAnterior} → ` : ""}{event.statusNovo}</p>}</div>)}</div></section></aside>
      </div>
    </article>
  </div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>;
}
