const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeReport = async (text) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional medical AI assistant.",
      },
      {
        role: "user",
        content: `
Analyze the following medical report.

Provide:
1. Summary
2. Abnormal values (if any)
3. Risk Level (Low/Medium/High)
4. Lifestyle suggestions
5. Add disclaimer that this is AI-generated

Medical Report:
${text}
        `,
      },
    ],
  });

  return response.choices[0].message.content;
};

module.exports = analyzeReport;
