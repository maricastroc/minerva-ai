/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private readonly PRIORITY_MODELS = [
    'models/gemini-1.5-flash-002',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-flash-8b',
    'models/gemini-1.5-pro-002',
    'models/gemini-1.5-pro',
  ];

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generateResponse(prompt: string): Promise<string> {
    const errors: any[] = [];

    for (const modelName of this.PRIORITY_MODELS) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        text = text.replace(/^Assistant:?\s*/i, '').trim();
        return text;
      } catch (error: any) {
        errors.push({ model: modelName, error: error.message });
        continue;
      }
    }

    throw new Error(`All models failed: ${JSON.stringify(errors)}`);
  }

  async generateTitle(message: string): Promise<string> {
    const titleModels = [
      'models/gemini-1.5-flash-002',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-flash-8b',
    ];

    for (const modelName of titleModels) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 50,
          },
        });

        const prompt = `Generate a short title for this message: "${message}". Reply with title only, no quotes or explanations.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let title = response.text().trim();

        title = title.replace(/["'.]/g, '');
        return (
          title.split(' ').slice(0, 5).join(' ') ||
          message.substring(0, 25) + '...'
        );
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    const meaningfulWords = message
      .split(' ')
      .filter((word) => word.length > 3)
      .slice(0, 4)
      .join(' ');
    return meaningfulWords || message.substring(0, 25) + '...';
  }
}
