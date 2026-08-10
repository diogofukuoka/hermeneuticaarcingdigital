const propositions = [{id: '1a'}, {id: '1b'}, {id: '1c'}];
const nodes = [
  {
    type: 'group',
    children: [
      {
        type: 'group',
        children: [
          { type: 'leaf', proposition: propositions[0] },
          { type: 'leaf', proposition: propositions[1] }
        ]
      },
      { type: 'leaf', proposition: propositions[2] }
    ]
  }
];
console.log(JSON.stringify(nodes, null, 2));
