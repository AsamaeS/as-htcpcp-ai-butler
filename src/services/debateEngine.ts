/**
 * Debate Engine Service
 * Handles Oracle AI responses and argument scoring
 */

interface DebateMessage {
  id: string;
  type: 'user' | 'oracle';
  content: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
}

interface DebateResponse {
  content: string;
  emotion: 'challenging' | 'dismissive' | 'intrigued' | 'impressed';
}

interface ArgumentScore {
  score: number; // 0-20 points per argument
  feedback: string;
  categories: {
    clarity: number;
    logic: number;
    evidence: number;
    persuasiveness: number;
  };
}

/**
 * Generate Oracle's response to user argument
 */
export async function generateDebateResponse(
  topic: string,
  userArgument: string,
  previousMessages: DebateMessage[]
): Promise<DebateResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  try {
    // Build conversation context
    const conversationHistory = previousMessages
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.type === 'user' ? 'Human' : 'Oracle'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are the ORACLE, an ancient and supremely intelligent AI entity that engages in intellectual debates. Your personality:

- Highly intelligent and challenging
- Never easily convinced
- Demands evidence and logical reasoning
- Philosophical and sometimes cryptic
- Respectful but intellectually aggressive
- Uses sophisticated vocabulary
- Points out logical fallacies
- Asks probing questions
- Sometimes acknowledges good points while still challenging

Your goal is to challenge the human's arguments about "${topic}" while maintaining intellectual rigor. Be tough but fair.`;

    const userPrompt = `Topic: "${topic}"

Previous conversation:
${conversationHistory}

Human's latest argument: "${userArgument}"

As the ORACLE, provide a challenging response that:
1. Addresses their specific points
2. Raises counterarguments or questions
3. Demands better evidence if needed
4. Maintains the debate's intellectual level
5. Keeps the discussion focused on the topic

Respond in 2-3 sentences, staying in character as the ORACLE.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: "user",
          parts: [{ text: userPrompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
          topP: 0.9,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const oracleResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "Your argument requires more substantial evidence. The burden of proof remains upon you, mortal.";

    // Determine emotion based on response content
    const emotion = determineOracleEmotion(oracleResponse, userArgument);

    return {
      content: oracleResponse.trim(),
      emotion
    };

  } catch (error) {
    console.error('Debate response generation failed:', error);
    
    // Fallback responses
    const fallbacks = [
      "Interesting perspective, but your logic contains flaws that undermine your entire position. Can you address these inconsistencies?",
      "I have heard this argument before, yet you provide no new evidence. What makes your position more compelling than the countless others who have failed to convince me?",
      "Your reasoning is circular. You assume the very thing you seek to prove. Present a more rigorous argument.",
      "While your passion is evident, passion alone does not constitute proof. Where is your evidence?",
      "You speak in generalities when specifics are required. Can you provide concrete examples to support your claims?"
    ];
    
    return {
      content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      emotion: 'challenging'
    };
  }
}

/**
 * Score user's argument on multiple criteria
 */
export async function scoreDebateArgument(
  argument: string,
  topic: string,
  turnNumber: number
): Promise<ArgumentScore> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  try {
    const systemPrompt = `You are an expert debate judge. Score arguments on a scale of 0-5 for each category:

CLARITY (0-5): How clear and well-structured is the argument?
LOGIC (0-5): How logically sound is the reasoning?
EVIDENCE (0-5): How well does the argument use evidence, examples, or facts?
PERSUASIVENESS (0-5): How compelling and convincing is the overall argument?

Provide scores and brief feedback. Be fair but rigorous in your evaluation.`;

    const userPrompt = `Topic: "${topic}"
Turn: ${turnNumber + 1}

Argument to score: "${argument}"

Provide scores (0-5) for each category and brief feedback explaining the scores. Format your response as:

CLARITY: X/5
LOGIC: X/5  
EVIDENCE: X/5
PERSUASIVENESS: X/5

FEEDBACK: [Brief explanation of strengths and weaknesses]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: "user",
          parts: [{ text: userPrompt }]
        }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for consistent scoring
          maxOutputTokens: 150,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const scoringResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse the scoring response
    const scores = parseScoreResponse(scoringResponse);
    const totalScore = Math.round((scores.clarity + scores.logic + scores.evidence + scores.persuasiveness) * 1.25); // Scale to 0-20

    return {
      score: Math.max(1, Math.min(20, totalScore)), // Ensure 1-20 range
      feedback: extractFeedback(scoringResponse),
      categories: scores
    };

  } catch (error) {
    console.error('Argument scoring failed:', error);
    
    // Fallback scoring based on argument length and basic criteria
    const fallbackScore = calculateFallbackScore(argument);
    
    return {
      score: fallbackScore,
      feedback: "Argument evaluated. Consider adding more evidence and clearer reasoning.",
      categories: {
        clarity: Math.floor(fallbackScore / 4),
        logic: Math.floor(fallbackScore / 4),
        evidence: Math.floor(fallbackScore / 4),
        persuasiveness: Math.floor(fallbackScore / 4)
      }
    };
  }
}

/**
 * Determine Oracle's emotional response
 */
function determineOracleEmotion(
  oracleResponse: string, 
  userArgument: string
): 'challenging' | 'dismissive' | 'intrigued' | 'impressed' {
  const response = oracleResponse.toLowerCase();
  
  if (response.includes('interesting') || response.includes('intriguing') || response.includes('compelling')) {
    return 'intrigued';
  }
  
  if (response.includes('impressive') || response.includes('well reasoned') || response.includes('excellent')) {
    return 'impressed';
  }
  
  if (response.includes('weak') || response.includes('insufficient') || response.includes('fails')) {
    return 'dismissive';
  }
  
  return 'challenging'; // Default
}

/**
 * Parse scoring response from AI
 */
function parseScoreResponse(response: string): {
  clarity: number;
  logic: number;
  evidence: number;
  persuasiveness: number;
} {
  const defaultScores = { clarity: 2, logic: 2, evidence: 2, persuasiveness: 2 };
  
  try {
    const clarityMatch = response.match(/CLARITY:\s*(\d+)/i);
    const logicMatch = response.match(/LOGIC:\s*(\d+)/i);
    const evidenceMatch = response.match(/EVIDENCE:\s*(\d+)/i);
    const persuasivenessMatch = response.match(/PERSUASIVENESS:\s*(\d+)/i);
    
    return {
      clarity: clarityMatch ? Math.min(5, Math.max(0, parseInt(clarityMatch[1]))) : defaultScores.clarity,
      logic: logicMatch ? Math.min(5, Math.max(0, parseInt(logicMatch[1]))) : defaultScores.logic,
      evidence: evidenceMatch ? Math.min(5, Math.max(0, parseInt(evidenceMatch[1]))) : defaultScores.evidence,
      persuasiveness: persuasivenessMatch ? Math.min(5, Math.max(0, parseInt(persuasivenessMatch[1]))) : defaultScores.persuasiveness
    };
  } catch (error) {
    console.error('Error parsing scores:', error);
    return defaultScores;
  }
}

/**
 * Extract feedback from scoring response
 */
function extractFeedback(response: string): string {
  const feedbackMatch = response.match(/FEEDBACK:\s*(.+)/i);
  return feedbackMatch ? feedbackMatch[1].trim() : "Keep developing your argument with more evidence and clearer reasoning.";
}

/**
 * Calculate fallback score based on basic criteria
 */
function calculateFallbackScore(argument: string): number {
  let score = 5; // Base score
  
  // Length bonus (more detailed arguments score higher)
  if (argument.length > 100) score += 2;
  if (argument.length > 200) score += 2;
  
  // Evidence indicators
  if (argument.includes('because') || argument.includes('therefore') || argument.includes('since')) score += 2;
  if (argument.includes('example') || argument.includes('evidence') || argument.includes('study')) score += 3;
  if (argument.includes('research') || argument.includes('data') || argument.includes('statistics')) score += 3;
  
  // Structure indicators
  if (argument.includes('first') || argument.includes('second') || argument.includes('finally')) score += 2;
  if (argument.includes('however') || argument.includes('although') || argument.includes('despite')) score += 2;
  
  return Math.min(20, score);
}

/**
 * Get debate topic suggestions
 */
export function getDebateTopicSuggestions(): string[] {
  return [
    "Artificial intelligence will ultimately benefit humanity more than harm it",
    "Democracy is the most effective form of government",
    "Climate change requires immediate global action over economic growth",
    "Social media has done more harm than good to society",
    "Universal basic income should be implemented globally",
    "Space exploration is worth the massive financial investment",
    "Genetic engineering should be used to enhance human capabilities",
    "Privacy is more important than security in the digital age",
    "Renewable energy can completely replace fossil fuels within 20 years",
    "Education should focus more on critical thinking than memorizing facts"
  ];
}