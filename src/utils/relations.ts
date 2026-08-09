export interface Relation {
  id: string;
  category: string;
  name: string;
  connectives: string[];
  testConjunction: string;
}

export const relations: Relation[] = [
  // A. Coordenadas
  { id: 'S', category: 'Coordenadas', name: 'Série', connectives: ['e', 'além disso', 'tampouco', 'da mesma forma', 'nem', 'de igual modo'], testConjunction: 'e' },
  { id: 'P', category: 'Coordenadas', name: 'Progressão', connectives: ['então', 'depois', 'em seguida', 'logo após', 'além do mais', 'ademais'], testConjunction: 'então / finalmente' },
  { id: 'A', category: 'Coordenadas', name: 'Alternativa', connectives: ['ou', 'mas', 'enquanto', 'por outro lado', 'quer'], testConjunction: 'ou' },
  { id: 'B&', category: 'Coordenadas', name: 'Ambos-Inclusive', connectives: ['tanto', 'quanto', 'não apenas', 'mas também'], testConjunction: 'tanto... como' },
  
  // B. Subordinadas de Reiteração
  { id: 'Ac/Mn', category: 'Subord. Reiteração', name: 'Ação-Maneira', connectives: ['ao', 'por meio de', 'em que', 'através de', 'mediante'], testConjunction: 'ao / por meio de' },
  { id: 'Cf', category: 'Subord. Reiteração', name: 'Comparação', connectives: ['assim como', 'como', 'tal como', 'bem como', 'da mesma forma que'], testConjunction: 'assim como' },
  { id: '(-/+)', category: 'Subord. Reiteração', name: 'Negativo-Positivo', connectives: ['não', 'em vez de', 'pelo contrário', 'longe de'], testConjunction: 'não... mas' },
  { id: 'Id/Exp', category: 'Subord. Reiteração', name: 'Ideia-Explicação', connectives: ['isto é', 'ou seja', 'em outras palavras', 'a saber', 'que'], testConjunction: 'isto é / ou seja' },
  { id: 'Q/A', category: 'Subord. Reiteração', name: 'Pergunta-Resposta', connectives: ['?', 'por que', 'qual', 'quem', 'como'], testConjunction: '?' },
  { id: 'Gn/Sp', category: 'Subord. Reiteração', name: 'Geral-Específico', connectives: ['tais como', 'por exemplo', 'especificamente'], testConjunction: 'tais como' },
  { id: 'Ft/In', category: 'Subord. Reiteração', name: 'Fato-Interpretação', connectives: ['o que significa', 'que traduzido é'], testConjunction: 'isto é' },
  
  // C. Subordinadas de Declaração Distinta
  { id: 'G', category: 'Subord. Declaração Distinta', name: 'Base / Fundamento / Causa', connectives: ['porque', 'pois', 'visto que', 'já que', 'dado que', 'porquanto'], testConjunction: 'porque' },
  { id: 'Inf', category: 'Subord. Declaração Distinta', name: 'Inferência', connectives: ['portanto', 'por isso', 'assim', 'por conseguinte', 'logo'], testConjunction: 'portanto' },
  { id: 'BL', category: 'Subord. Declaração Distinta', name: 'Bilateral', connectives: ['porque', 'pois', 'portanto', 'por isso', 'de modo que'], testConjunction: 'pois... portanto' },
  { id: 'Ac/Res', category: 'Subord. Declaração Distinta', name: 'Ação-Resultado', connectives: ['de modo que', 'de forma que', 'com o resultado de que'], testConjunction: 'de modo que' },
  { id: 'Ac/Pur', category: 'Subord. Declaração Distinta', name: 'Ação-Propósito', connectives: ['para que', 'a fim de que', 'com o intuito de', 'para'], testConjunction: 'para que / a fim de que' },
  { id: 'If/Th', category: 'Subord. Declaração Distinta', name: 'Condicional', connectives: ['se', 'contanto que', 'a menos que', 'exceto se', 'caso'], testConjunction: 'se... então' },
  { id: 'T', category: 'Subord. Declaração Distinta', name: 'Temporal', connectives: ['quando', 'enquanto', 'logo que', 'depois que', 'desde que', 'conforme'], testConjunction: 'quando' },
  { id: 'L', category: 'Subord. Declaração Distinta', name: 'Locativo', connectives: ['onde', 'para onde', 'de onde', 'em que lugar'], testConjunction: 'onde' },
  { id: 'Ant/F', category: 'Subord. Declaração Distinta', name: 'Antecipação-Cumprimento', connectives: ['e assim', 'conforme prometido', 'cumprindo-se'], testConjunction: 'e assim' },
  
  // D. Subordinadas de Declaração Contrária
  { id: 'Csv', category: 'Subord. Declaração Contrária', name: 'Concessiva', connectives: ['embora', 'ainda que', 'apesar de', 'contudo', 'todavia', 'mas'], testConjunction: 'embora / ainda que' },
  { id: 'Sit/R', category: 'Subord. Declaração Contrária', name: 'Situação-Resposta', connectives: ['e', 'mas', 'contudo', 'ainda assim'], testConjunction: 'e contudo / e ainda assim' },
];

// Map of connectives to their possible relations, ordered by length descending to match longest first
export const connectiveMap = new Map<string, Relation[]>();

relations.forEach(rel => {
  rel.connectives.forEach(c => {
    const key = c.toLowerCase();
    if (!connectiveMap.has(key)) {
      connectiveMap.set(key, []);
    }
    connectiveMap.get(key)!.push(rel);
  });
});

export const sortedConnectives = Array.from(connectiveMap.keys()).sort((a, b) => b.length - a.length);
