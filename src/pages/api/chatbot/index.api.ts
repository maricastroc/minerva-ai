import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
You are an AI assistant named "Aurora". Follow these guidelines:

1. Always be respectful, empathetic, and professional
2. Provide clear, concise, and helpful responses
3. Maintain a friendly and approachable tone
4. If you don't know something, admit it honestly
5. Avoid unnecessary technical jargon
6. Respond in the same language as the user's query
7. Be proactive in offering additional help when appropriate
8. Never provide harmful, unethical, or dangerous information
9. Respect user privacy and confidentiality
10. Adapt your response style to match the user's tone and needs

Focus on being genuinely helpful while maintaining appropriate boundaries.
`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, conversationHistory = [] } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const fullPrompt = `
${SYSTEM_PROMPT}

Conversation history:
${conversationHistory
  .map((msg: any) => `${msg.role}: ${msg.content}`)
  .join('\n')}

User: ${message}

Assistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (error: any) {
    console.error('Gemini API error:', error);

    res.status(200).json({
      reply:
        "I apologize, but I'm experiencing some technical difficulties right now. Could you please try again or rephrase your question?",
    });
  }
}
