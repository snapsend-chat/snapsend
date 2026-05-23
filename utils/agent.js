const { GoogleGenAI } = require("@google/genai");
const InitializeAgent = async (app, key) => {
  const agent = new GoogleGenAI({ apiKey: key });
  const r = await mainAgentSync("hello", agent);
  console.log(r)
}

async function mainAgentSync(query, agent) {
  const response = await agent.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    }
  });
  return response.text;
}

module.exports = { InitializeAgent };