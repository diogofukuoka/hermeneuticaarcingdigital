const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.1-flash-lite',
      contents: "hello",
    });
    for await (const chunk of responseStream) {
      console.log(chunk.text);
    }
  } catch(e) {
    console.error(e);
  }
}
test();
