import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import React from "react";

export type LaudoVisualData = {
  numeroChamado: string; dataEmissao?: string; marca: string; nomeCliente: string; contato: string; enderecoCliente: string; cidadeCliente: string; estadoCliente: string; produto: string; tipoProduto: string; numeroSerie: string; bilheteSeguro: string; defeitoReclamado: string; avaliacaoTecnica: string; conclusao: string; responsavelTecnico: string; fotos: string[];
};

type Logos = { logoPositivo?: string | null; logoInfinix?: string | null; logoVaio?: string | null; logoCompaq?: string | null } | null | undefined;

const logoItems = (logos: Logos) => [["Positivo", logos?.logoPositivo], ["Infinix", logos?.logoInfinix], ["Vaio", logos?.logoVaio], ["Compaq", logos?.logoCompaq]] as const;

function DocumentSection({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return <section className="border border-slate-200"><div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2"><span className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#2E7D32]">{label}</span><h2 className="text-[10px] font-bold tracking-[0.1em] text-slate-800">{title}</h2></div><div className="p-4">{children}</div></section>;
}

function DocumentField({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return <div className={wide ? "col-span-2" : ""}><p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-1 min-h-4 text-[10px] font-medium leading-snug text-slate-800">{value || "—"}</p></div>;
}

export function LaudoDocument({ data, logos, documentRef }: { data: LaudoVisualData; logos: Logos; documentRef?: React.RefObject<HTMLDivElement | null> }) {
  return <article ref={documentRef} className="mx-auto w-[794px] bg-white p-[42px] text-slate-900" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
    <header className="border-y-2 border-[#2E7D32] py-4"><div className="grid grid-cols-[1fr_1.1fr] items-center gap-6"><div className="grid grid-cols-4 gap-2">{logoItems(logos).map(([brand, url]) => <div key={brand} className="flex h-9 min-w-0 items-center justify-center border-r border-slate-200 px-1 last:border-r-0">{url ? <img src={url} alt={`Logo ${brand}`} className="max-h-7 max-w-full object-contain"/> : <span className="text-center text-[8px] font-bold uppercase tracking-wide text-slate-400">{brand}</span>}</div>)}</div><div className="border-l border-slate-200 pl-5 text-right"><p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#2E7D32]">Assistência técnica autorizada</p><h1 className="mt-1 text-[22px] font-bold tracking-[0.04em] text-[#2E7D32]">LAUDO TÉCNICO</h1><p className="mt-1 text-[9px] text-slate-500">Chamado nº {data.numeroChamado} {data.dataEmissao ? `• Emitido em ${data.dataEmissao.split("-").reverse().join("/")}` : ""}</p></div></div></header>
    <main className="mt-5 space-y-4"><DocumentSection label="01" title="IDENTIFICAÇÃO DO CLIENTE"><div className="grid grid-cols-2 gap-x-8 gap-y-3"><DocumentField label="Nome" value={data.nomeCliente}/><DocumentField label="Contato" value={data.contato}/><DocumentField label="Endereço" value={data.enderecoCliente} wide/><DocumentField label="Cidade / UF" value={`${data.cidadeCliente}${data.estadoCliente ? ` / ${data.estadoCliente}` : ""}`} wide/></div></DocumentSection><DocumentSection label="02" title="IDENTIFICAÇÃO DO PRODUTO"><div className="grid grid-cols-3 gap-x-6 gap-y-3"><DocumentField label="Marca" value={data.marca}/><DocumentField label="Produto" value={data.produto}/><DocumentField label="Tipo" value={data.tipoProduto}/><DocumentField label="Número de série" value={data.numeroSerie}/><DocumentField label="Bilhete de seguro" value={data.bilheteSeguro}/><DocumentField label="Nº do chamado" value={data.numeroChamado}/></div></DocumentSection><DocumentSection label="03" title="AVALIAÇÃO TÉCNICA"><div className="space-y-4"><div><p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">Defeito reclamado</p><p className="mt-1 whitespace-pre-wrap text-[10px] leading-relaxed text-slate-800">{data.defeitoReclamado || "—"}</p></div><div className="border-t border-slate-100 pt-3"><p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">Avaliação técnica</p><p className="mt-1 whitespace-pre-wrap text-[10px] leading-relaxed text-slate-800">{data.avaliacaoTecnica || "—"}</p></div><div className="border-t border-slate-100 pt-3"><p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">Conclusão</p><p className="mt-1 whitespace-pre-wrap text-[10px] font-semibold leading-relaxed text-slate-800">{data.conclusao || "—"}</p></div></div></DocumentSection></main>
    <footer className="mt-9 flex items-end justify-between border-t border-slate-300 pt-4"><p className="max-w-72 text-[8px] leading-relaxed text-slate-400">Documento técnico emitido a partir das informações registradas no atendimento.</p><div className="w-56 border-t border-slate-500 pt-2 text-center"><p className="text-[10px] font-bold text-slate-800">{data.responsavelTecnico}</p><p className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-slate-400">Responsável técnico</p></div></footer>
  </article>;
}

function drawPdfHeader(pdf: jsPDF, pageLabel: string, data: LaudoVisualData) {
  pdf.setFillColor(23, 63, 95); pdf.rect(12, 10, 186, 11, "F"); pdf.setTextColor(255, 255, 255); pdf.setFontSize(8); pdf.text("ASSISTÊNCIA TÉCNICA AUTORIZADA", 16, 16); pdf.setFontSize(13); pdf.text("LAUDO TÉCNICO", 194, 16, { align: "right" }); pdf.setTextColor(178, 123, 16); pdf.setFontSize(7); pdf.text(pageLabel, 14, 27); pdf.setTextColor(71, 85, 105); pdf.setFontSize(8); pdf.text(`Chamado nº ${data.numeroChamado}`, 196, 27, { align: "right" });
}

async function buildLaudoPdf(data: LaudoVisualData, ref: React.RefObject<HTMLDivElement | null>) {
  const node = ref.current; if (!node) throw new Error("Prévia do documento indisponível"); const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const pdf = new jsPDF("p", "mm", "a4"); pdf.addImage(canvas.toDataURL("image/jpeg", 0.94), "JPEG", 10, 8, 190, 278); pdf.addPage(); drawPdfHeader(pdf, "REGISTRO FOTOGRÁFICO", data); const positions = [[14, 36], [108, 36], [14, 153], [108, 153]];
  for (let index = 0; index < data.fotos.length; index += 1) { const photo = data.fotos[index]; const image = await new Promise<HTMLImageElement>((resolve, reject) => { const item = new Image(); item.crossOrigin = "anonymous"; item.onload = () => resolve(item); item.onerror = reject; item.src = photo; }); const [x, y] = positions[index]; const ratio = Math.min(82 / image.width, 94 / image.height); const width = image.width * ratio; const height = image.height * ratio; pdf.setFillColor(248, 250, 252); pdf.rect(x, y, 84, 101, "F"); pdf.setDrawColor(203, 213, 225); pdf.rect(x, y, 84, 101); pdf.addImage(image, "JPEG", x + (84 - width) / 2, y + (94 - height) / 2 + 2, width, height); pdf.setTextColor(23, 63, 95); pdf.setFontSize(8); pdf.text(`EVIDÊNCIA ${String(index + 1).padStart(2, "0")}`, x + 4, y + 98); }
  pdf.setDrawColor(203, 213, 225); pdf.line(14, 286, 196, 286); pdf.setTextColor(100, 116, 139); pdf.setFontSize(7); pdf.text("Laudo técnico • Registro fotográfico", 14, 290); pdf.text("Página 2 de 2", 196, 290, { align: "right" }); return pdf;
}

export async function createLaudoPdfPreviewUrl(data: LaudoVisualData, ref: React.RefObject<HTMLDivElement | null>) { const pdf = await buildLaudoPdf(data, ref); return URL.createObjectURL(pdf.output("blob")); }
export async function generateLaudoPdf(data: LaudoVisualData, _logos: Logos, ref: React.RefObject<HTMLDivElement | null>) { const pdf = await buildLaudoPdf(data, ref); pdf.save(`Laudo_${data.numeroChamado}.pdf`); }
