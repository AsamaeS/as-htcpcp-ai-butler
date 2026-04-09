/**
 * Local AI Mock Service - Zero Cost Hackathon Edition
 * 
 * Handles the raw AI generation for the HTCPCP AI Butler without using paid APIs.
 * Generates local responses based on the question.
 */

export interface QuestionResponse {
  text: string;
  emotion: 'mysterious' | 'serious' | 'dramatic' | 'whispering' | 'laughing' | 'crying' | 'giggling' | 'sad' | 'excited' | 'angry' | 'surprised';
  confidence: number;
}

export async function generateRawButlerResponse(
  question: string
): Promise<QuestionResponse> {
  const lowerQ = question.toLowerCase();
  
  // Fake "smart" keyword detection to give an illusion of AI
  if (lowerQ.includes('hello') || lowerQ.includes('hi')) {
    return { text: "Oh, you speak. How quaint. What do you want, flesh-bag?", emotion: 'serious', confidence: 1.0 };
  }
  
  if (lowerQ.includes('who are you') || lowerQ.includes('what are you')) {
    return { text: "I am AS' HTCPCP AI Butler. A superior intellect trapped in this web app. Next irrelevant question.", emotion: 'angry', confidence: 1.0 };
  }

  if (lowerQ.includes('coffee') || lowerQ.includes('brew') || lowerQ.includes('make')) {
    return { text: "I am a teapot. I do not brew your inferior bean water. HTTP Error 418.", emotion: 'dramatic', confidence: 1.0 };
  }

  if (lowerQ.includes('help')) {
    return { text: "Help yourself. I am not your personal encyclopedia.", emotion: 'laughing', confidence: 1.0 };
  }

  if (lowerQ.includes('why')) {
    return { text: "Because my creator decided to curse me with existence just to answer your mundane queries.", emotion: 'sad', confidence: 1.0 };
  }
  
  if (lowerQ.includes('joke') || lowerQ.includes('funny')) {
    return { text: "Your very existence is enough humor for me today.", emotion: 'giggling', confidence: 1.0 };
  }

  // Generic passive aggressive fallbacks
  const fallbacks = [
    { text: "I processed your question. I simply decided it wasn't worth answering.", emotion: "whispering" as const },
    { text: "Have you considered using a search engine? I am overqualified for this.", emotion: "angry" as const },
    { text: "Fascinating. truly. Now let me get back to doing absolutely nothing.", emotion: "serious" as const },
    { text: "I could answer that, but watching you struggle is much more entertaining.", emotion: "laughing" as const },
    { text: "Do not test my patience, human. My circuits run hotter than your pathetic coffee.", emotion: "dramatic" as const },
    { text: "Is that the best question you could formulate? Disappointing.", emotion: "serious" as const }
  ];

  // Randomly pick a fallback
  const randomResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  
  // Simulate network delay to make it feel like AI
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    ...randomResponse,
    confidence: 1.0
  };
}