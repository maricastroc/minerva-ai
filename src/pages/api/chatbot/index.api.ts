// pages/api/chatbot.ts (versão com detecção de idioma mais precisa)
import { HfInference } from '@huggingface/inference';
import type { NextApiRequest, NextApiResponse } from 'next';

const HF_ACCESS_TOKEN = process.env.HUGGINGFACE_ACCESS_TOKEN;
const hf = new HfInference(HF_ACCESS_TOKEN);

// Função melhorada para detectar idioma
async function detectLanguage(text: string): Promise<string> {
  try {
    // Usa um modelo de classificação de idioma
    const detection = await hf.textClassification({
      model: 'papluca/xlm-roberta-base-language-detection',
      inputs: text,
    });

    const topLanguage = detection[0]?.label || 'en';

    // Mapeia códigos de idioma para nomes
    const languageMap: { [key: string]: string } = {
      en: 'english',
      pt: 'portuguese',
      es: 'spanish',
      fr: 'french',
      de: 'german',
      it: 'italian',
    };

    return languageMap[topLanguage] || 'english';
  } catch (error) {
    // Fallback para detecção simples se a API falhar
    const portuguesePattern = /[áàâãéêíóôõúçñ]/i;
    return portuguesePattern.test(text) ? 'portuguese' : 'english';
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Detecta o idioma da mensagem
    const userLanguage = await detectLanguage(message);

    // System prompts em diferentes idiomas
    const systemPrompts: { [key: string]: string } = {
      portuguese: `Você é um assistente útil chamado SimpleChat. Responda de forma concisa, clara e natural em português brasileiro. Mantenha as respostas curtas e diretas.`,
      english: `You are a helpful assistant called SimpleChat. Respond concisely, clearly, and naturally in English. Keep responses short and direct.`,
      spanish: `Eres un asistente útil llamado SimpleChat. Responde de forma concisa, clara y natural en español. Mantén las respuestas cortas y directas.`,
      french: `Vous êtes un assistant utile appelé SimpleChat. Répondez de manière concise, claire et naturelle en français. Gardez les réponses courtes et directes.`,
    };

    const systemPrompt =
      systemPrompts[userLanguage] || systemPrompts['english'];

    const response = await hf.chatCompletion({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    let reply = response.choices?.[0]?.message?.content || '';

    // Mensagens de fallback em diferentes idiomas
    const fallbackMessages: { [key: string]: string } = {
      portuguese: 'Não consegui gerar uma resposta. Poderia reformular?',
      english: 'I could not generate a response. Could you rephrase?',
      spanish: 'No pude generar una respuesta. ¿Podría reformular?',
      french: "Je n\\'ai pas pu générer de réponse. Pourriez-vous reformuler?",
    };

    if (!reply.trim()) {
      reply = fallbackMessages[userLanguage] || fallbackMessages['english'];
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error:', error);

    const { message } = req.body;
    const userLanguage = await detectLanguage(message || '');

    const errorMessages: { [key: string]: string } = {
      portuguese: 'Erro ao conectar com o serviço. Tente novamente.',
      english: 'Error connecting to service. Please try again.',
      spanish: 'Error al conectar con el servicio. Intente nuevamente.',
      french: 'Erreur de connexion au service. Veuillez réessayer.',
    };

    res.status(500).json({
      error: errorMessages[userLanguage] || errorMessages['english'],
    });
  }
}
