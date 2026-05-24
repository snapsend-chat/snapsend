const { ChatGroq } = require("@langchain/groq");
const { z } = require("zod");
require("dotenv").config();

const InitializeAgent = async (app, key) => {
  
}
async function MainAgent() {
  const model = new ChatGroq({
    model: "llama-3.1-8b-instant",
    temperature: 0,
  });
  const schema = z.object({
    users: z.number(),
  });
  const structuredModel = model.withStructuredOutput(schema);
  try {
    const response = await structuredModel.invoke(
      "How many users signed up today? Return a realistic example."
    );
    return response;
  } catch (error) {
    return error;
  }
}

module.exports = { InitializeAgent };