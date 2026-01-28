import { NextResponse } from 'next/server';
import { getModel, getFallbackModel } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { type, content, title, prompt: extraPrompt } = await req.json();

    let predefinedPrompt = "";

    switch (type) {
        case 'grammar':
            predefinedPrompt = `Corrija a gramática e ortografia do seguinte texto (em HTML ou Markdown). 
            Mantenha a formatação HTML/Markdown intacta. Retorne apenas o texto corrigido, sem explicações.`;
            break;
        case 'improve':
            predefinedPrompt = `Melhore a fluidez e clareza do texto. Torne-o mais envolvente para um blog de concursos.
            Mantenha a formatação HTML/Markdown. Retorne apenas o texto melhorado.`;
            break;
        case 'objective':
            predefinedPrompt = `Reescreva o texto de forma mais objetiva e direta. Remova redundâncias.
            Mantenha a formatação HTML/Markdown. Retorne apenas o texto reescrito.`;
            break;
        case 'longer':
            predefinedPrompt = `Expanda o texto fornecendo mais detalhes e explicações, mantendo o tom informativo.
            Mantenha a formatação HTML/Markdown. Retorne apenas o texto expandido.`;
            break;
        case 'suggestions':
            predefinedPrompt = `Analise o texto e forneça uma lista HTML (<ul><li>...</li></ul>) de sugestões de melhoria (estrutura, tom, conteúdo, SEO).
            Não reescreva o texto, apenas liste as sugestões.`;
            break;
        case 'title':
            predefinedPrompt = `Gere 5 opções de títulos atrativos e otimizados para SEO para este conteúdo de concurso público.
            Retorne apenas a lista de títulos, um por linha.`;
            break;
        default:
            predefinedPrompt = extraPrompt || "Melhore este texto.";
    }

    const fullPrompt = `${predefinedPrompt}\n\n${title ? `Título Atual: ${title}\n` : ''}Texto:\n${content}`;

    let text = "";
    try {
      const result = await getModel().generateContent(fullPrompt);
      text = result.response.text();
    } catch (primaryError) {
      console.warn("Primary model failed, trying fallback:", primaryError);
      try {
        const result = await getFallbackModel().generateContent(fullPrompt);
        text = result.response.text();
      } catch (fallbackError: any) {
        console.error("Fallback model also failed:", fallbackError);
        throw new Error("Ambos os modelos de IA falharam. Por favor, tente novamente mais tarde.");
      }
    }

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
