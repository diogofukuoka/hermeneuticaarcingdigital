import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

Abaixo está o texto para analisar:
${text}`;

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
    const isQuotaError = 
       error?.status === 429 || 
       error?.status === "RESOURCE_EXHAUSTED" ||
      (error?.message && error.message.includes("quota"));
    
    if (isQuotaError) {
      console.warn("Gemini API quota exceeded.");
      return res.status(429).json({ error: "Gemini API quota exceeded." });
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
*Use diagramação textual em blocos/recuos markdown ou use linhas e colchetes (\`[ ]\`) para simular o desenho dos arcos.*
#### 3. TABELA EXEGÉTICA DE ATRIBUTOS LÓGICOS
Crie uma tabela com as colunas:
| ID | Proposição | Conectivo Identificado | Posição | Relação Lógica | Conjunção de Teste | Justificativa Exegética |
#### 4. O PONTO PRINCIPAL E O ESBOÇO HOMILÉTICO
- Identifique claramente o **Ponto Principal Absoluto** (o cume do Arco Mestre que permaneceu sem subordinação no topo).
- Crie um **Esboço de Ensino/Homilético** derivado diretamente da hierarquia de suporte do seu Arcing, mostrando como os ramos secundários sustentam e explicam o ponto principal.

Texto a analisar:
${text}`;

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

export default app;
