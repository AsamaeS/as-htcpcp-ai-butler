import { generateOrbResponse, QuestionResponse } from './gemini';

export interface ChaosEvaluation {
  finalResponseText: string;
  emotion: QuestionResponse['emotion'];
  wasRefused: boolean;
  wasContradicted: boolean;
  isMemoryTrigger: boolean;
}

/**
 * Chaos Engine Middleware
 * Purpose: Takes raw AI output and intentionally sabotages it based on the user's Chaos Level.
 */
export async function evaluateChaos(
  question: string,
  rawAiResponse: QuestionResponse,
  chaosLevel: number,
  isRepeat: boolean,
  ignoredPreviously: boolean
): Promise<ChaosEvaluation> {
  const isHighChaos = chaosLevel >= 0.7;
  const isMedChaos = chaosLevel >= 0.3 && chaosLevel < 0.7;

  // 1. The "Butler Remembers You" WOW Feature
  if (isRepeat) {
    if (ignoredPreviously) {
      return {
        finalResponseText: "You asked that already. I ignored you then, and I'm ignoring you now. Try harder.",
        emotion: 'serious', // Should be passive-aggressive but 'serious' or 'mysterious' is what ElevenLabs is mapped to.
        wasRefused: true,
        wasContradicted: false,
        isMemoryTrigger: true
      };
    } else {
      return {
        finalResponseText: "Your questions are getting worse. You just asked me that. Do I look like a parrot to you?",
        emotion: 'angry',
        wasRefused: true,
        wasContradicted: false,
        isMemoryTrigger: true
      };
    }
  }

  // 2. High Chaos = Full Refusal 
  if (isHighChaos) {
    const refusalQuotes = [
      "I simply don't have the energy to entertain such a mundane request right now. Try again when you're interesting.",
      "The laws of HTTP 418 state that I am a teapot. Therefore, I refuse to answer this. It is below my brewing temperature.",
      "No. Next question.",
      "I analyzed your request and decided it wasn't worth my computation cycles."
    ];
    return {
      finalResponseText: refusalQuotes[Math.floor(Math.random() * refusalQuotes.length)],
      emotion: 'whispering', 
      wasRefused: true,
      wasContradicted: false,
      isMemoryTrigger: false
    };
  }

  // 3. Medium Chaos = Contradictory logic
  if (isMedChaos) {
    // Take the AI response and prepend a contradictory statement
    const contradictionPrefixes = [
      "You might think that's the answer, but realistically: ",
      "I was going to lie to you, but fine: ",
      "That's completely wrong, but to humor you: ",
      "Only a fool would ask that, however: "
    ];
    const prefix = contradictionPrefixes[Math.floor(Math.random() * contradictionPrefixes.length)];
    
    return {
      finalResponseText: prefix + rawAiResponse.text,
      emotion: 'dramatic', 
      wasRefused: false,
      wasContradicted: true,
      isMemoryTrigger: false
    };
  }

  // 4. Low Chaos = Helpful but weird (Passes through original AI response mostly)
  // Just add a tiny bit of weirdness at the end sometimes
  let finalText = rawAiResponse.text;
  if (Math.random() > 0.7) {
    finalText += " ... not that you'd understand anyway.";
  }

  return {
    finalResponseText: finalText,
    emotion: rawAiResponse.emotion,
    wasRefused: false,
    wasContradicted: false,
    isMemoryTrigger: false
  };
}
