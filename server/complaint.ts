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
        { role: "system", content: "Você sintetiza queixas de assistência técnica. Use somente fatos presentes no texto fornecido. Identifique primeiro o problema central e formule uma única frase técnica, objetiva e impessoal; não copie a estrutura da descrição e não repita o relato narrativo quando puder expressar a falha diretamente. Exemplo: 'Aparelho retornou da assistência com problema na câmera' deve ser sintetizado como 'Falha na câmera após retorno da assistência'. Não diagnostique, não atribua causa, não inclua defeitos não mencionados. Preserve literalmente termos técnicos, siglas e palavras em inglês, como touchscreen, display, BIOS, firmware, USB e HDMI; nunca os traduza ou substitua. Responda somente JSON válido." },
        { role: "user", content: `Sintetize a queixa a seguir destacando somente o problema principal, em uma frase técnica curta: ${queixaOriginal}` },
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
