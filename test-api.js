fetch('http://localhost:3000/api/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: "1 Rogo-vos, pois, irmãos, pelas misericórdias de Deus, que apresenteis o vosso corpo por sacrifício vivo, santo e agradável a Deus, que é o vosso culto racional." })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(e => console.error(e));
