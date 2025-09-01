// /api/chatbot/index.api.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

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

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (error: any) {
    console.error('Gemini API error:', error);

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-pro',
      });

      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      res.status(200).json({ reply: text });
    } catch (fallbackError: any) {
      console.error('Fallback also failed:', fallbackError);

      res.status(200).json({
        reply:
          'Estou com dificuldades técnicas no momento. Por favor, tente novamente mais tarde.',
      });
    }
  }
}
