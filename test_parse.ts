import { parseText } from './src/utils/parser.ts';
const text = "[1] Portanto, se há algum conforto em Cristo, se alguma consolação de amor, [2] Completai o meu gozo,";
console.log(JSON.stringify(parseText(text), null, 2));
