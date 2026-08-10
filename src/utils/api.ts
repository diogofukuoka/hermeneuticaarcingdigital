export const bookIdMap: Record<string, number> = {
  "gn":1,"gênesis":1,"genesis":1,"ex":2,"êxodo":2,"exodo":2,"lv":3,"levítico":3,"levitico":3,"nm":4,"números":4,"numeros":4,
  "dt":5,"deuteronômio":5,"deuteronomio":5,"js":6,"josué":6,"josue":6,"jz":7,"juízes":7,"juizes":7,"rt":8,"rute":8,
  "1sm":9,"1samuel":9,"2sm":10,"2samuel":10,"1rs":11,"1reis":11,"2rs":12,"2reis":12,"1cr":13,"1crônicas":13,"1cronicas":13,
  "2cr":14,"2crônicas":14,"2cronicas":14,"ed":15,"esdras":15,"ne":16,"neemias":16,"et":17,"ester":17,"jo":18,"jó":18,"sl":19,"salmos":19,
  "pv":20,"provérbios":20,"proverbios":20,"ec":21,"eclesiastes":21,"ct":22,"cantares":22,"is":23,"isaías":23,"isaias":23,
  "jr":24,"jeremias":24,"lm":25,"lamentações":25,"lamentacoes":25,"ez":26,"ezequiel":26,"dn":27,"daniel":27,"os":28,"oséias":28,"oseias":28,
  "jl":29,"joel":29,"am":30,"amós":30,"amos":30,"ob":31,"obadias":31,"jn":32,"jonas":32,"mq":33,"miquéias":33,"miqueias":33,
  "na":34,"naum":34,"hc":35,"habacuque":35,"sf":36,"sofonias":36,"ag":37,"ageu":37,"zc":38,"zacarias":38,"ml":39,"malaquias":39,
  "mt":40,"mateus":40,"mc":41,"marcos":41,"lc":42,"lucas":42,"joao":43,"joão":43,"at":44,"atos":44,"rm":45,"romanos":45,
  "1co":46,"1coríntios":46,"1corintios":46,"2co":47,"2coríntios":47,"2corintios":47,"gl":48,"gálatas":48,"galatas":48,
  "ef":49,"efésios":49,"efesios":49,"fp":50,"filipenses":50,"cl":51,"colossenses":51,"1ts":52,"1tessalonicenses":52,
  "2ts":53,"2tessalonicenses":53,"1tm":54,"1timóteo":54,"1timoteo":54,"2tm":55,"2timóteo":55,"2timoteo":55,"tt":56,"tito":56,
  "fm":57,"filemom":57,"hb":58,"hebreus":58,"tg":59,"tiago":59,"1pe":60,"1pedro":60,"2pe":61,"2pedro":61,
  "1jo":62,"1joão":62,"1joao":62,"2jo":63,"2joão":63,"2joao":63,"3jo":64,"3joão":64,"3joao":64,"jd":65,"judas":65,"ap":66,"apocalipse":66
};

export async function fetchBibleText(reference: string): Promise<string | null> {
  // Regex to match "Book Chapter:Verse" or "Book Chapter:Verse-Verse"
  const match = reference.trim().match(/^([1-3]?\s*[A-Za-zÀ-ÿ]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;

  let bookRaw = match[1].toLowerCase().replace(/\s+/g, '');
  let chapter = match[2];
  let startVerse = match[3] ? parseInt(match[3], 10) : null;
  let endVerse = match[4] ? parseInt(match[4], 10) : startVerse;

  const bookId = bookIdMap[bookRaw];
  if (!bookId) return null;

  try {
    const response = await fetch(`https://bolls.life/get-chapter/ACF11/${bookId}/${chapter}/`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (!Array.isArray(data)) return null;

    let filtered = data;
    if (startVerse !== null) {
      filtered = data.filter(v => v.verse >= startVerse! && v.verse <= endVerse!);
    }
    
    // Clean up HTML tags (e.g. <i>, </i>) and include verse numbers
    const text = filtered.map(v => `${v.verse} ${v.text.replace(/<[^>]+>/g, '')}`).join(' ');
    return text || null;
  } catch (err) {
    console.error('Failed to fetch bible reference:', err);
    return null;
  }
}

