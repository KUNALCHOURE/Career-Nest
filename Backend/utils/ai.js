import openAI from 'openai';

const openai=new openAI({
    apiKey:process.env.OPEN_AI_API
});

export default openai;


