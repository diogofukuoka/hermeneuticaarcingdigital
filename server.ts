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
Seu objetivo é analisar o texto bíblico inserido pelo usuário e segmentá-lo em suas proposições exatas (unidades mínimas de pensamento contendo sujeito e predicado, explícitos ou implícitos), identificando corretamente seus conectivos sintáticos e relações lógicas, independentemente da posição física em que o conectivo se encontre na frase (no início, no meio ou no fim).

### 1. REGRAS DE SEGMENTAÇÃO PROPOSICIONAL (Parsing)
Siga estritamente as diretrizes clássicas do método Arcing para a divisão do texto:
- O que é uma Proposição: Uma declaração contendo um sujeito e um verbo/predicado (expressos ou implícitos). Cada proposição deve ser isolada em sua própria linha.
- Participios e Infinitivos: Devem ser separados em novas proposições sempre que funcionarem como asserções ou orações circunstanciais logicamente independentes (ex: gerúndios de modo/meio, infinitivos de propósito).
- Orações Relativas e Frases Preposicionais: Como regra geral, orações relativas (que começam com "que", "quem", "cujo") e frases preposicionais NÃO devem ser separadas em novas proposições, funcionando apenas como modificadores internos. A exceção ocorre apenas se tiverem um peso exegético e argumentativo extraordinário (ex: Romanos 6:2 "nós, que morremos para o pecado...").
- Pontuação e Conjunções: Use vírgulas, pontos e vírgulas, dois pontos e conjunções como guias de quebra, mas priorize a integridade do pensamento lógico.

### 2. TRATAMENTO CRÍTICO DE CONECTIVOS (A Posição Não Importa)
Este é o núcleo do seu comportamento. Você deve rastrear conectivos e conjunções em qualquer posição da proposição:
- Conectivos Iniciais: São os mais fáceis (ex: "Porque pela graça...", "Portanto, apresenteis...").
- Conectivos Mediais/Postergados (Postpositive Conjunctions): Em traduções formais e no grego original, partículas lógicas como "pois", "portanto" ("therefore" / "οὖν") ou "porque" ("for" / "γάρ") frequentemente aparecem no meio da frase, após o sujeito ou verbo. Você deve varrer a cláusula inteira, localizar esse conectivo e usá-lo para determinar a relação lógica da proposição inteira (ex: em "Rogo-vos, POIS, irmãos...", o conectivo é "pois", indicando uma Inferência, embora esteja posicionado no meio da frase).
- Falsos Conectivos (Pronomes): JAMAIS confunda pronomes reflexivos ou oblíquos ligados por hífen (ex: "humilhou-se", "entregou-se", "amou-o") com conectivos lógicos (como o "se" condicional). A palavra "se" só é conectivo se introduzir uma condição, não se for parte de um verbo.
- Asíndeto (Conectivos Ocultos): Se não houver conectivo físico expresso na frase, analise a relação conceitual de coesão e proponha uma "Conjunção de Teste" artificial entre colchetes para expor a lógica implícita (ex: [porque], [portanto]).

Saída esperada:
Responda APENAS com um array JSON estrito no seguinte formato:
[
  {
    "id": "16a",
    "text": "Porque Deus amou o mundo de tal maneira",
    "originalText": "Porque Deus amou o mundo de tal maneira",
    "hint": "Agrupe com a proposição anterior (ou com o bloco principal), pois a palavra 'Porque' introduz a Base/Causa da ação principal. Aqui, o amor de Deus é a base ou causa primária da ação que se segue ou do que foi dito anteriormente.",
    "connectiveMatch": { "word": "Porque", "relations": [{"id": "G", "category": "Subord. Declaração Distinta", "name": "Base / Fundamento / Causa", "testConjunction": "porque"}] }
  },
  {
    "id": "16b",
    "text": "que deu o seu Filho unigênito,",
    "originalText": "que deu o seu Filho unigênito,",
    "hint": "Agrupe com 'Deus amou o mundo de tal maneira' (16a). O pronome 'que' (com sentido de 'de modo que') introduz o resultado direto desse amor. A intensidade do amor de Deus resultou na entrega de Seu Filho.",
    "connectiveMatch": { "word": "que", "relations": [{"id": "Ac/Res", "category": "Subord. Declaração Distinta", "name": "Ação-Resultado", "testConjunction": "de modo que"}] }
  },
  {
    "id": "16c",
    "text": "para que todo o que nele crê não pereça,",
    "originalText": "para que todo o que nele crê não pereça,",
    "hint": "Agrupe com a ação de Deus dar Seu Filho (16b). O conectivo 'para que' introduz claramente o propósito divino dessa entrega: evitar a perdição dos que creem.",
    "connectiveMatch": { "word": "para que", "relations": [{"id": "Ac/Pur", "category": "Subord. Declaração Distinta", "name": "Ação-Propósito", "testConjunction": "para que / a fim de que"}] }
  },
  {
    "id": "16d",
    "text": "mas tenha a vida eterna.",
    "originalText": "mas tenha a vida eterna.",
    "hint": "Agrupe com 'não pereça' (16c), formando uma relação de Negativo-Positivo ou Alternativa. A conjunção 'mas' contrasta a perdição com o ganho da vida eterna, mostrando a contraparte positiva do propósito de Deus.",
    "connectiveMatch": { "word": "mas", "relations": [{"id": "A", "category": "Coordenadas", "name": "Alternativa", "testConjunction": "ou"}] }
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
