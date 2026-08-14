import { invokeLLM } from "./_core/llm";

export async function extractCallFromImage(imageDataUrl: string) {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Você extrai dados de chamados técnicos de eletrônicos. Responda somente no JSON solicitado. Não invente valores; use string vazia quando um campo não estiver legível." },
      { role: "user", content: [
        { type: "text", text: "Leia o print do sistema oficial e extraia somente: numeroOs (Número O.S.), serial, modelo e queixa/descrição. Preserve números e letras exatamente como aparecem." },
        { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
      ] },
    ],
    response_format: { type: "json_schema", json_schema: { name: "call_ocr", strict: true, schema: { type: "object", properties: { numeroOs: { type: "string" }, serial: { type: "string" }, modelo: { type: "string" }, queixa: { type: "string" } }, required: ["numeroOs", "serial", "modelo", "queixa"], additionalProperties: false } } },
  });
  const content = response.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Não foi possível ler o print");
  return JSON.parse(content) as { numeroOs: string; serial: string; modelo: string; queixa: string };
}
