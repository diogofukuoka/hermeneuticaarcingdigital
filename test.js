const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const prompt = "Porque Deus amou o mundo";
  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    for await (const chunk of responseStream) {
      console.log(chunk.text);
    }
  } catch(e) {
    console.error(e);
  }
}
test();
