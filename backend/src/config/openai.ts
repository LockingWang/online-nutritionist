import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY 未設定，AI 功能將無法使用');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
