import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  app.post("/api/parse", async (req, res) => {
    try {
      const { text } = req.body;
      
      const prompt = `Você é um linguista computacional sênior e especialista em Hermenêutica Bíblica e Análise de Discurso (método Arcing/Tracing developed by Daniel Fuller, John Piper, and Thomas Schreiner).

Sempre que o usuário enviar uma referência bíblica ou um texto para analisar, siga exatamente este processo sequencial antes de compor as proposições:

- **Fase 1: Recuperação do Texto e Segmentação Proposicional**
- (Caso receba uma referência, assuma o texto já fornecido na entrada. Ele já está na tradução ACF ou na tradução escolhida pelo usuário).
- Divida o texto em proposições exatas (unidades de significado completo com sujeito e verbo, explícitos ou implícitos).
- Regra de Ouro da Segmentação: Nunca separe orações relativas ou frases preposicionais em proposições distintas, a menos que carreguem um peso argumentativo e teológico extraordinário no fluxo do autor.

- **Fase 2: Identificação de Conectivos e Asíndetos**
- Identifique todos os conectivos sintáticos (conjunções, preposições circunstanciais, advérbios).
- Se houver ausência de conectivo (Asíndeto), identifique a relação lógica conceitual implícita e adicione uma [Conjunção de Teste] entre colchetes.

### 1. REGRAS DE SEGMENTAÇÃO PROPOSICIONAL (Parsing)
Siga estritamente as diretrizes clássicas do método Arcing para a divisão do texto:
- O que é uma Proposição: Uma declaração contendo um sujeito e um verbo/predicado (expressos ou implícitos). Cada proposição deve ser isolada em sua própria linha.
- Participios e Infinitivos: Devem ser separados em novas proposições sempre que funcionarem como asserções ou orações circunstanciais logicamente independentes (ex: gerúndios de modo/meio, infinitivos de propósito).
- Orações Relativas e Frases Preposicionais: Como regra geral, orações relativas (que começam com "que", "quem", "cujo") e frases preposicionais NÃO devem ser separadas em novas proposições.

### NUMERAÇÃO DE VERSÍCULOS (CRÍTICO)
O texto de entrada contém marcadores de versículos no formato [1], [2], [3], etc.
O campo "id" da proposição (ex: "1a", "1b", "2a") DEVE CORRESPONDER EXATAMENTE ao número do versículo ao qual aquela parte do texto pertence.
Você DEVE acompanhar as quebras de versículos ao longo do texto. Se a frase "De sorte que haja em vós..." vem depois de um "[5]", o id dessa proposição deve ser "5a" e não a continuação do versículo 4. Leia o texto com cuidado e numere corretamente. A letra (a, b, c) indica a ordem da proposição dentro daquele versículo. O marcador do versículo em si (ex: "[5]") não precisa ser incluído no campo "text".

### 2. TRATAMENTO CRÍTICO DE CONECTIVOS (A Posição Não Importa)
Este é o núcleo do seu comportamento. Você deve rastrear conectivos e conjunções em qualquer posição da proposição:
- Conectivos Iniciais: São os mais fáceis (ex: "Porque pela graça...", "Portanto, apresenteis...").
- Conectivos Mediais/Postergados (Postpositive Conjunctions): Em traduções formais e no grego original, partículas lógicas como "pois", "portanto" frequentemente aparecem no meio da frase. Varra a cláusula inteira, localize o conectivo e use-o (ex: em "Rogo-vos, POIS, irmãos...", o conectivo é "pois").
- Falsos Conectivos (Pronomes): JAMAIS confunda pronomes reflexivos ("humilhou-se") com conectivos ("se" condicional).
- Asíndeto (Conectivos Ocultos): Se não houver conectivo expresso na frase, analise a relação conceitual e proponha uma "Conjunção de Teste" entre colchetes, ex: [porque].

Saída esperada:
Responda APENAS com um array JSON estrito no seguinte formato:
[
  {
    "id": "1a",
    "text": "Portanto, se há algum conforto em Cristo,",
    "originalText": "Portanto, se há algum conforto em Cristo,",
    "hint": "Agrupe com a proposição anterior (ou com o bloco principal), pois a palavra 'Portanto' introduz uma Inferência.",
    "connectiveMatch": { "word": "Portanto", "relations": [{"id": "Inf", "category": "Subord. Declaração Distinta", "name": "Inferência", "testConjunction": "portanto"}] }
  }
]

Atenção: O campo relations deve conter os objetos exatos de relação (apenas id, category, name e testConjunction) correspondentes à conjunção encontrada.
O campo hint DEVE ser preenchido para cada proposição e deve ser muito claro e didático. A dica DEVE, obrigatoriamente, responder:
1. Com qual(is) proposição(ões) ou bloco(s) esta proposição deve ser arqueada.
2. O porquê desta ligação, citando a palavra conectiva encontrada e a lógica do autor.
3. Uma breve explicação do sentido teológico/gramatical da relação.
De acordo com as seguintes relações oficiais do método:

1. Série (S) - Coordenadas (teste: e)
2. Progressão (P) - Coordenadas (teste: então / finalmente)
3. Alternativa (A) - Coordenadas (teste: ou)
4. Ambos-Inclusive (B&) - Coordenadas (teste: tanto... como)
5. Ação-Maneira (Ac/Mn) - Subord. Reiteração (teste: ao / por meio de)
6. Comparação (Cf) - Subord. Reiteração (teste: assim como)
7. Negativo-Positivo (-/+) - Subord. Reiteração (teste: não... mas)
8. Ideia-Explicação (Id/Exp) - Subord. Reiteração (teste: isto é / ou seja)
9. Pergunta-Resposta (Q/A) - Subord. Reiteração (teste: ?)
10. Geral-Específico (Gn/Sp) - Subord. Reiteração (teste: tais como)
11. Fato-Interpretação (Ft/In) - Subord. Reiteração (teste: isto é)
12. Base / Fundamento / Causa (G) - Subord. Declaração Distinta (teste: porque)
13. Inferência (Inf) - Subord. Declaração Distinta (teste: portanto)
14. Bilateral (BL) - Subord. Declaração Distinta (teste: pois... portanto)
15. Ação-Resultado (Ac/Res) - Subord. Declaração Distinta (teste: de modo que)
16. Ação-Propósito (Ac/Pur) - Subord. Declaração Distinta (teste: para que / a fim de que)
17. Condicional (If/Th) - Subord. Declaração Distinta (teste: se... então)
18. Temporal (T) - Subord. Declaração Distinta (teste: quando)
19. Locativo (L) - Subord. Declaração Distinta (teste: onde)
20. Antecipação-Cumprimento (Ant/F) - Subord. Declaração Distinta (teste: e assim)
21. Concessiva (Csv) - Subord. Declaração Contrária (teste: embora / ainda que)
22. Situação-Resposta (Sit/R) - Subord. Declaração Contrária (teste: e contudo / e ainda assim)

Se o connectiveMatch for implícito (Asíndeto), coloque o conectivo de teste em colchetes no "word", por exemplo, "[porque]".

Abaixo está o texto para analisar:
${text}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const resultText = response.text;
      if (!resultText) {
          throw new Error("Empty response from AI");
      }
      const parsed = JSON.parse(resultText);
      res.json(parsed);

    } catch (error: any) {
      // Check for quota exceeded or other specific Gemini errors
      const isQuotaError = 
        error?.status === 429 || 
        error?.status === "RESOURCE_EXHAUSTED" ||
        (error?.message && error.message.includes("quota"));

      if (isQuotaError) {
        console.warn("Gemini API quota exceeded. Falling back to local parsing...");
        return res.status(429).json({ error: "Gemini API quota exceeded. Falling back to local parsing..." });
      }

      console.error("AI parsing error:", error);
      res.status(500).json({ error: "Failed to parse text" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log('Server running on port ' + PORT);
  });
}

startServer();
