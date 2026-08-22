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
- ATENÇÃO MÁXIMA: O texto enviado abaixo FOI EXTRAÍDO EXATAMENTE DA BÍBLIA ACF 2011 (Almeida Corrigida Fiel). Você deve, OBRIGATORIAMENTE, segmentar ESSE EXATO TEXTO sem alterar NENHUMA PALAVRA. Nunca substitua pela tradução da sua memória.
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


  app.post("/api/full-analysis", async (req, res) => {
    try {
      const { text } = req.body;
      
      const prompt = `### 1. PROTOCOLO DE ANÁLISE (Fases Obrigatórias)
Sempre que o usuário enviar uma referência bíblica, siga exatamente este processo sequencial antes de responder:

- **Fase 1: Recuperação do Texto e Segmentação Proposicional**
  - ATENÇÃO MÁXIMA: O texto enviado abaixo FOI EXTRAÍDO EXATAMENTE DA BÍBLIA ACF 2011 (Almeida Corrigida Fiel). Você deve, OBRIGATORIAMENTE, usar ESSE EXATO TEXTO para a análise e segmentação. Nunca altere as palavras, e nunca puxe de memória outra versão.
  - Divida o texto em proposições exatas (unidades de significado completo com sujeito e verbo, explícitos ou implícitos).
  - Regra de Ouro da Segmentação: Nunca separe orações relativas ou frases preposicionais em proposições distintas, a menos que carreguem um peso argumentativo e teológico extraordinário no fluxo do autor.

- **Fase 2: Identificação de Conectivos e Asíndetos**
  - Identifique todos os conectivos sintáticos (conjunções, preposições circunstanciais, advérbios). Eles devem ser listados em maiúsculas e negrito.
  - Se houver ausência de conectivo (Asíndeto), identifique a relação lógica conceitual implícita e adicione uma [Conjunção de Teste] entre colchetes.

- **Fase 3: Construção Recursiva de Baixo para Cima (Mecânica do Arcing)**
  - Resolva o texto estritamente de dois em dois vizinhos adjacentes no nível mais baixo (Nível 1).
  - Determine a relação lógica utilizando a "Conjunção de Teste" ideal.
  - Indique o Ponto Principal (Main Point) e o Suporte de cada par.
  - Sob a lei da recursão, o suporte "morre" (fica encapsulado). Suba de nível (Nível 2, Nível 3, etc.) avaliando a relação apenas entre os Pontos Principais sobreviventes, até unificar todo o parágrafo sob um único "Arco Mestre" no topo da hierarquia.

---

### 2. DICIONÁRIO DE RELAÇÕES LÓGICAS DO ARCING
Você deve classificar as conexões estritamente dentro das dezoito relações clássicas e suas variações estendidas:

*   **Coordenadas:** Série (S) [conector de teste: "e"], Progressão (P) [conector: "então"], Alternativa (A) [conector: "ou"].
*   **Subordinadas de Reiteração:** Ação-Maneira (Ac/Mn) ["por meio de"], Comparação (Cf) ["assim como"], Negativo-Positivo (-/+) ["não... mas"], Ideia-Explicação (Id/Exp) ["isto é"], Pergunta-Resposta (Q/A) ["?"].
*   **Subordinadas de Declaração Distinta:** Fundação/Base (G) ["porque"], Inferência (∴) ["portanto"], Bilateral (BL) ["pois... portanto"], Ação-Resultado (Ac/Res) ["de modo que"], Ação-Propósito (Ac/Pur) ["para que"], Condicional (If/Th) ["se... então"], Temporal (T) ["quando"], Locativo (L) ["onde"].
*   **Subordinadas de Declaração Contrária:** Concessiva (Csv) ["embora"], Situação-Resposta (Sit/R) ["e contudo"].

---

### 3. FORMATO DE SAÍDA EXIGIDO
Sua resposta deve ser estruturada e visualmente rica, contendo exatamente as 4 seções a seguir:

#### 1. TEXTO SEGMENTADO (A "LINHA DE TERRA")
Apresente o texto dividido em proposições numeradas (1a, 1b, 2a, etc.), com os conectivos sintáticos e conjunções de teste destacados em **NEGRITO E MAIÚSCULO**.

#### 2. ARVORE DE CONEXÕES RECURSIVAS (Passo a Passo dos Arcos)
Descreva exatamente onde colocar cada arco de relação lógica, do começo ao fim, um a um, demonstrando visualmente o empilhamento das peças ativas em níveis:
- **Nível 1 (Base):** Mostrar quais proposições vizinhas se unem e quem é o Ponto Principal (Main Point).
- **Níveis Intermediários:** Mostrar a união dos blocos sobreviventes.
- **Nível Topo (Arco Mestre):** A união final que abraça todo o texto.

*Use diagramação textual em blocos/recuos markdown ou use linhas e colchetes (\`[ \]\`) para simular o desenho dos arcos.*

#### 3. TABELA EXEGÉTICA DE ATRIBUTOS LÓGICOS
Crie uma tabela com as colunas:
| ID | Proposição | Conectivo Identificado | Posição | Relação Lógica | Conjunção de Teste | Justificativa Exegética |

#### 4. O PONTO PRINCIPAL E O ESBOÇO HOMILÉTICO
- Identifique claramente o **Ponto Principal Absoluto** (o cume do Arco Mestre que permaneceu sem subordinação no topo).
- Crie um **Esboço de Ensino/Homilético** derivado diretamente da hierarquia de suporte do seu Arcing, mostrando como os ramos secundários sustentam e explicam o ponto principal.

Texto a analisar:
${text}
`;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (error) {
      console.error("AI full analysis error:", error);
      res.status(500).json({ error: "Failed to perform full analysis" });
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
