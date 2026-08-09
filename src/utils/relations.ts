export interface Relation {
  id: string;
  category: string;
  name: string;
  connectives: string[];
  testConjunction: string;
  description: string;
}

export const relations: Relation[] = [
  // A. Coordenadas
  { id: 'S', category: 'Coordenadas', name: 'Série', connectives: ['e', 'além disso', 'tampouco', 'da mesma forma', 'nem', 'de igual modo'], testConjunction: 'e', description: 'Duas ou mais declarações independentes ligadas pelo mesmo assunto ou tópico, muitas vezes listando ações ou qualidades.' },
  { id: 'P', category: 'Coordenadas', name: 'Progressão', connectives: ['então', 'depois', 'em seguida', 'logo após', 'além do mais', 'ademais'], testConjunction: 'então / finalmente', description: 'Uma série de eventos ou ideias onde cada um é um passo além do anterior, frequentemente em ordem cronológica ou lógica.' },
  { id: 'A', category: 'Coordenadas', name: 'Alternativa', connectives: ['ou', 'mas', 'enquanto', 'por outro lado', 'quer'], testConjunction: 'ou', description: 'Declarações que expressam escolhas mutuamente exclusivas ou ideias opostas.' },
  { id: 'B&', category: 'Coordenadas', name: 'Ambos-Inclusive', connectives: ['tanto', 'quanto', 'não apenas', 'mas também'], testConjunction: 'tanto... como', description: 'Duas declarações que são ambas verdadeiras e relacionadas, frequentemente enfatizando a inclusão de ambas.' },
  
  // B. Subordinadas de Reiteração
  { id: 'Ac/Mn', category: 'Subord. Reiteração', name: 'Ação-Maneira', connectives: ['ao', 'por meio de', 'em que', 'através de', 'mediante'], testConjunction: 'ao / por meio de', description: 'Uma declaração descreve uma ação e a outra explica a maneira ou método pelo qual a ação é realizada.' },
  { id: 'Cf', category: 'Subord. Reiteração', name: 'Comparação', connectives: ['assim como', 'como', 'tal como', 'bem como', 'da mesma forma que'], testConjunction: 'assim como', description: 'Uma declaração descreve uma ação ou característica comparando-a com algo similar.' },
  { id: '(-/+)', category: 'Subord. Reiteração', name: 'Negativo-Positivo', connectives: ['não', 'em vez de', 'pelo contrário', 'longe de'], testConjunction: 'não... mas', description: 'Duas declarações contrastantes onde uma nega algo e a outra afirma a alternativa correta.' },
  { id: 'Id/Exp', category: 'Subord. Reiteração', name: 'Ideia-Explicação', connectives: ['isto é', 'ou seja', 'em outras palavras', 'a saber', 'que'], testConjunction: 'isto é / ou seja', description: 'Uma declaração introduz uma ideia e a outra a explica ou esclarece com outras palavras.' },
  { id: 'Q/A', category: 'Subord. Reiteração', name: 'Pergunta-Resposta', connectives: ['?', 'por que', 'qual', 'quem', 'como'], testConjunction: '?', description: 'Uma declaração faz uma pergunta e a seguinte fornece a resposta.' },
  { id: 'Gn/Sp', category: 'Subord. Reiteração', name: 'Geral-Específico', connectives: ['tais como', 'por exemplo', 'especificamente'], testConjunction: 'tais como', description: 'Uma declaração apresenta uma categoria ou princípio geral, e a outra dá um ou mais exemplos específicos.' },
  { id: 'Ft/In', category: 'Subord. Reiteração', name: 'Fato-Interpretação', connectives: ['o que significa', 'que traduzido é'], testConjunction: 'isto é', description: 'Uma declaração apresenta um fato e a seguinte dá o seu significado ou interpretação.' },
  
  // C. Subordinadas de Declaração Distinta
  { id: 'G', category: 'Subord. Declaração Distinta', name: 'Base / Fundamento / Causa', connectives: ['porque', 'pois', 'visto que', 'já que', 'dado que', 'porquanto'], testConjunction: 'porque', description: 'A segunda declaração fornece a razão, causa ou fundamento lógico para a primeira.' },
  { id: 'Inf', category: 'Subord. Declaração Distinta', name: 'Inferência', connectives: ['portanto', 'por isso', 'assim', 'por conseguinte', 'logo'], testConjunction: 'portanto', description: 'A segunda declaração é uma conclusão lógica ou resultado prático derivado da primeira.' },
  { id: 'BL', category: 'Subord. Declaração Distinta', name: 'Bilateral', connectives: ['porque', 'pois', 'portanto', 'por isso', 'de modo que'], testConjunction: 'pois... portanto', description: 'Uma declaração central apoiada por um argumento em cada lado (uma causa antes e um resultado depois, ou vice-versa).' },
  { id: 'Ac/Res', category: 'Subord. Declaração Distinta', name: 'Ação-Resultado', connectives: ['de modo que', 'de forma que', 'com o resultado de que'], testConjunction: 'de modo que', description: 'A segunda declaração descreve o resultado factual ou consequência real de uma ação.' },
  { id: 'Ac/Pur', category: 'Subord. Declaração Distinta', name: 'Ação-Propósito', connectives: ['para que', 'a fim de que', 'com o intuito de', 'para'], testConjunction: 'para que / a fim de que', description: 'A segunda declaração descreve a intenção ou o objetivo visado pela ação (mesmo que não alcançado).' },
  { id: 'If/Th', category: 'Subord. Declaração Distinta', name: 'Condicional', connectives: ['se', 'contanto que', 'a menos que', 'exceto se', 'caso'], testConjunction: 'se... então', description: 'Uma declaração apresenta uma condição que deve ser satisfeita para que a outra declaração ocorra.' },
  { id: 'T', category: 'Subord. Declaração Distinta', name: 'Temporal', connectives: ['quando', 'enquanto', 'logo que', 'depois que', 'desde que', 'conforme'], testConjunction: 'quando', description: 'Uma declaração indica o tempo ou a ocasião em que a outra declaração ocorre.' },
  { id: 'L', category: 'Subord. Declaração Distinta', name: 'Locativo', connectives: ['onde', 'para onde', 'de onde', 'em que lugar'], testConjunction: 'onde', description: 'Uma declaração indica o lugar físico ou figurativo onde a outra declaração ocorre.' },
  { id: 'Ant/F', category: 'Subord. Declaração Distinta', name: 'Antecipação-Cumprimento', connectives: ['e assim', 'conforme prometido', 'cumprindo-se'], testConjunction: 'e assim', description: 'Uma declaração menciona algo prometido ou esperado, e a outra registra o seu cumprimento.' },
  
  // D. Subordinadas de Declaração Contrária
  { id: 'Csv', category: 'Subord. Declaração Contrária', name: 'Concessiva', connectives: ['embora', 'ainda que', 'apesar de', 'contudo', 'todavia', 'mas'], testConjunction: 'embora / ainda que', description: 'A proposição principal é afirmada apesar de uma circunstância contrária ou surpreendente na proposição subordinada.' },
  { id: 'Sit/R', category: 'Subord. Declaração Contrária', name: 'Situação-Resposta', connectives: ['e', 'mas', 'contudo', 'ainda assim'], testConjunction: 'e contudo / e ainda assim', description: 'Uma resposta inesperada ou contrastante a uma situação descrita anteriormente.' },
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
