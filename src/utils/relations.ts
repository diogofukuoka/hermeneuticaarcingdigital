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
  {
    id: 'S',
    category: 'Coordenadas',
    name: 'Série',
    connectives: ['e', 'além disso', 'tampouco', 'da mesma forma', 'nem', 'de igual modo'],
    testConjunction: 'e',
    description: 'Duas ou mais proposições independentes que coexistem de forma paralela, onde cada uma faz sua contribuição independente para a constituição de um todo comum.'
  },
  {
    id: 'P',
    category: 'Coordenadas',
    name: 'Progressão',
    connectives: ['então', 'depois', 'finalmente', 'em seguida', 'logo após', 'além do mais', 'ademais'],
    testConjunction: 'então / depois / finalmente',
    description: 'Semelhante à Série, mas as proposições descrevem etapas sucessivas, lógicas ou cronológicas que caminham em direção a um clímax ou ponto de culminação.'
  },
  {
    id: 'A',
    category: 'Coordenadas',
    name: 'Alternativa',
    connectives: ['ou', 'mas', 'enquanto', 'por outro lado', 'quer'],
    testConjunction: 'ou / mas',
    description: 'Proposições que representam caminhos ou possibilidades distintas e às vezes excludentes surgidas a partir de uma mesma circunstância.'
  },
  {
    id: 'B&',
    category: 'Coordenadas',
    name: 'Ambos-Inclusive',
    connectives: ['tanto', 'quanto', 'não apenas', 'mas também', 'nem'],
    testConjunction: 'tanto... como / não apenas... mas também / nem... nem',
    description: 'Enfatiza a veracidade ou falsidade simultânea de ambas as proposições coordenadas. Usada quando há uma ênfase especial na coexistência.'
  },
  
  // B. Subordinadas de Reiteração
  {
    id: 'Ac/Mn',
    category: 'Subord. Reiteração',
    name: 'Ação-Maneira',
    connectives: ['ao', 'por meio de', 'em que', 'através de', 'mediante'],
    testConjunction: 'ao / por meio de',
    description: 'Descreve os meios, o método, o instrumento ou o modo preciso por meio dos quais a ação da proposição principal é efetuada.'
  },
  {
    id: 'Cf',
    category: 'Subord. Reiteração',
    name: 'Comparação',
    connectives: ['assim como', 'como', 'tal como', 'bem como', 'da mesma forma que'],
    testConjunction: 'assim como... assim também / como',
    description: 'Esclarece o teor de uma ação principal ao traçar uma analogia de semelhança com outro cenário que funciona como padrão.'
  },
  {
    id: '(-/+)',
    category: 'Subord. Reiteração',
    name: 'Negativo-Positivo',
    connectives: ['não', 'em vez de', 'pelo contrário', 'longe de', 'mas'],
    testConjunction: 'não... mas',
    description: 'Apresenta duas alternativas das quais uma é expressamente negada para que a outra seja afirmada com maior vigor e ênfase.'
  },
  {
    id: 'Id/Exp',
    category: 'Subord. Reiteração',
    name: 'Ideia-Explicação',
    connectives: ['ou seja', 'isto é', 'em outras palavras', 'a saber', 'que'],
    testConjunction: 'ou seja / isto é',
    description: 'Uma proposição subsequente esclarece, define ou detalha o significado abstrato ou específico de uma palavra ou do todo da proposição anterior.'
  },
  {
    id: 'Q/A',
    category: 'Subord. Reiteração',
    name: 'Pergunta-Resposta',
    connectives: ['?', 'por que', 'qual', 'quem', 'como'],
    testConjunction: '?',
    description: 'Formula uma interrogação direta ou retórica e fornece na proposição seguinte a sua elucidação ou resposta lógica.'
  },
  {
    id: 'Gn/Sp',
    category: 'Subord. Reiteração',
    name: 'Geral-Específico',
    connectives: ['especificamente', 'tais como', 'por exemplo'],
    testConjunction: 'especificamente / tais como / por exemplo',
    description: 'Uma declaração abstrata ampla (o todo/geral) é desmembrada em suas partes constituintes ou exemplificativas nas proposições seguintes.'
  },
  {
    id: 'Ft/In',
    category: 'Subord. Reiteração',
    name: 'Fato-Interpretação',
    connectives: ['o que significa', 'isto é', 'que traduzido é'],
    testConjunction: 'o que significa / isto é',
    description: 'Liga um acontecimento factual ou histórico ao seu significado espiritual, teológico ou espiritual subjacente.'
  },
  
  // C. Subordinadas de Declaração Distinta
  {
    id: 'G',
    category: 'Subord. Declaração Distinta',
    name: 'Base / Fundamento / Causa',
    connectives: ['porque', 'pois', 'visto que', 'já que', 'dado que', 'porquanto'],
    testConjunction: 'porque / pois / visto que',
    description: 'A proposição de suporte vem depois da principal, trazendo o argumento lógico ou a razão teológica que a valida sintaticamente.'
  },
  {
    id: 'Inf',
    category: 'Subord. Declaração Distinta',
    name: 'Inferência',
    connectives: ['portanto', 'por isso', 'por conseguinte', 'assim', 'logo'],
    testConjunction: 'portanto / por isso / por conseguinte',
    description: 'É a lógica inversa da Base. A premissa ou razão teológica é enunciada primeiro, e a proposição subsequente extrai a conclusão prática resultante.'
  },
  {
    id: 'BL',
    category: 'Subord. Declaração Distinta',
    name: 'Bilateral',
    connectives: ['porque', 'pois', 'portanto', 'por isso', 'de modo que'],
    testConjunction: 'pois... portanto',
    description: 'Uma estrutura trilateral na qual uma proposição intermediária serve simultaneamente de fundamento lógico para o segmento anterior e para o posterior.'
  },
  {
    id: 'Ac/Res',
    category: 'Subord. Declaração Distinta',
    name: 'Ação-Resultado',
    connectives: ['de modo que', 'de sorte que', 'de forma que', 'com o resultado de que'],
    testConjunction: 'de modo que / de sorte que',
    description: 'Indica um evento e a sua consequência factual/efeito concreto e involuntário que o acompanha historicamente na realidade.'
  },
  {
    id: 'Ac/Pur',
    category: 'Subord. Declaração Distinta',
    name: 'Ação-Propósito',
    connectives: ['para que', 'a fim de que', 'com o intuito de', 'para'],
    testConjunction: 'para que / a fim de que',
    description: 'Expressa a intenção final voluntária, a finalidade desejada ou o desígnio consciente que motivou a realização da ação principal.'
  },
  {
    id: 'If/Th',
    category: 'Subord. Declaração Distinta',
    name: 'Condicional',
    connectives: ['se', 'contanto que', 'a menos que', 'exceto se', 'caso', 'então'],
    testConjunction: 'se... então',
    description: 'Apresenta uma premissa estritamente hipotética ou potencial cujo cumprimento fático é indispensável para que a principal se realize.'
  },
  {
    id: 'T',
    category: 'Subord. Declaração Distinta',
    name: 'Temporal',
    connectives: ['quando', 'depois que', 'enquanto', 'logo que', 'desde que', 'conforme'],
    testConjunction: 'quando / depois que / enquanto',
    description: 'Circunscreve o momento, a ocasião cronológica ou o limite de tempo em que a proposição principal se realiza ou é verdadeira.'
  },
  {
    id: 'L',
    category: 'Subord. Declaração Distinta',
    name: 'Locativo',
    connectives: ['onde', 'aonde', 'para onde', 'de onde', 'em que lugar'],
    testConjunction: 'onde / aonde',
    description: 'Indica as coordenadas espaciais, o local ou a esfera de realidade aplicável à proposição principal.'
  },
  {
    id: 'Ant/F',
    category: 'Subord. Declaração Distinta',
    name: 'Antecipação-Cumprimento',
    connectives: ['e assim', 'conforme prometido', 'cumprindo-se'],
    testConjunction: 'e assim',
    description: 'Vincula e sela uma declaração de caráter preditivo (uma promessa) à sua respectiva realização fática ao longo da história.'
  },
  
  // D. Subordinadas de Declaração Contrária
  {
    id: 'Csv',
    category: 'Subord. Declaração Contrária',
    name: 'Concessiva',
    connectives: ['embora', 'ainda que', 'apesar de', 'contudo', 'todavia', 'mas'],
    testConjunction: 'embora / ainda que',
    description: 'Declara que a proposição principal permanece de pé, válida e inalterada a despeito de um obstáculo real, barreira ou contra-argumento apresentado.'
  },
  {
    id: 'Sit/R',
    category: 'Subord. Declaração Contrária',
    name: 'Situação-Resposta',
    connectives: ['e contudo', 'e ainda assim', 'e', 'mas', 'contudo'],
    testConjunction: 'e contudo / e ainda assim',
    description: 'Apresenta um cenário ou situação fática de fundo (frequente em narrativas) e aponta a reação subsequente, que costuma ser surpreendente, inesperada ou contraintuitiva.'
  }
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

