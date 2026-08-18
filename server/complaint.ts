import { invokeLLM } from "./_core/llm";

function clean(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export async function formalizeComplaint(original: string) {
  const queixaOriginal = clean(original);
  if (!queixaOriginal) return { queixaOriginal: "", queixaFormalizada: "" };
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você organiza queixas de assistência técnica. Use somente fatos presentes no texto fornecido. Não diagnostique, não atribua causa, não inclua defeitos não mencionados. Remova repetições e linguagem coloquial. Preserve literalmente termos técnicos, siglas e palavras em inglês, como touchscreen, display, BIOS, firmware, USB e HDMI; nunca os traduza ou substitua. Responda somente JSON válido." },
        { role: "user", content: `Organize e resuma esta queixa em uma frase técnica clara, preservando integralmente os fatos e os termos técnicos: ${queixaOriginal}` },
      ],
      response_format: { type: "json_schema", json_schema: { name: "technical_complaint", strict: true, schema: { type: "object", properties: { queixaFormalizada: { type: "string" } }, required: ["queixaFormalizada"], additionalProperties: false } } },
    });
    const content = response.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : null;
    const queixaFormalizada = clean(parsed?.queixaFormalizada || queixaOriginal);
    return { queixaOriginal, queixaFormalizada: queixaFormalizada || queixaOriginal };
  } catch {
    return { queixaOriginal, queixaFormalizada: queixaOriginal };
  }
}
