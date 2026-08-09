import { fetchBibleText } from './src/utils/api';

async function run() {
  console.log("Testing Ef 2:8-9");
  console.log(await fetchBibleText("Ef 2:8-9"));
  
  console.log("\nTesting 1 João 3:16");
  console.log(await fetchBibleText("1 João 3:16"));

  console.log("\nTesting Pv 16:3");
  console.log(await fetchBibleText("Pv 16:3"));
}
run();
