/**
 * Google Gemini AI Evaluator Service
 * 
 * This service integrates with Google's Gemini Vision API to evaluate
 * prayer offerings against wishes. The AI acts as a humorous Thai deity
 * that judges the worthiness of offerings in a gacha-style tier system.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 13.1
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationResult } from '../types';

/**
 * Get or create the Google Generative AI client
 * Uses the API key from environment variables
 */
function getGenAI(): GoogleGenerativeAI {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
}

/**
 * Evaluates a prayer by analyzing the offering image against the wish text
 * 
 * The AI deity considers:
 * - Quality and effort of the offering image
 * - Appropriateness of the offering relative to the wish magnitude
 * - Humor and entertainment value
 * 
 * @param wish - The user's wish text in Thai or English
 * @param imageBase64 - Base64-encoded image data (without data URL prefix)
 * @returns Promise resolving to the evaluation result with tier, verdict, and comment
 * @throws Error if the API call fails or response is invalid
 * 
 * @example
 * ```typescript
 * const result = await evaluatePrayer(
 *   "ขอให้รวยๆ",
 *   "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
 * );
 * console.log(result.tier); // "SSR" | "SR" | "R" | "เกลือ"
 * ```
 */
export async function evaluatePrayer(
  wish: string,
  imageBase64: string
): Promise<EvaluationResult> {
  // Validate environment variable and get client
  const genAI = getGenAI();

  // Configure the Gemini 2.5 Flash model
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Create the Thai deity persona prompt
  const prompt = `คุณคือเจ้าที่ศาลพระภูมิที่มีอารมณ์ขัน ใช้คำว่า "ข้า" แทนตัวเอง และเรียกคนไหว้ว่า "เจ้า" ประเมินคำขอพรและของเซ่นไหว้ต่อไปนี้:

คำขอพร: "${wish}"

ให้คะแนนความเหมาะสมของของเซ่นไหว้เทียบกับความใหญ่โตของคำขอพร:
- SSR (ศักดิ์สิทธิ์สูงสุด): ของเซ่นหรูหรา มีความตั้งใจสูง คู่ควรกับคำขอ
- SR (ศักดิ์สิทธิ์): ของเซ่นดี พอใช้ได้
- R (ธรรมดา): ของเซ่นธรรมดา หรือไม่ค่อยเข้ากับคำขอ
- เกลือ (ไร้ค่า): ของเซ่นห่วยแตก ไม่มีความตั้งใจ หรือไม่เหมาะสมอย่างยิ่ง

ตอบกลับในรูปแบบ JSON เท่านั้น โดยใช้คำว่า "ข้า" และ "เจ้า" ในความคิดเห็น:
{
  "tier": "SSR" | "SR" | "R" | "เกลือ",
  "verdict": "คำตัดสิน (สั้นๆ)",
  "comment": "ความคิดเห็นแบบเจ้าที่ขี้เล่น (1-2 ประโยค) ใช้คำว่า 'ข้า' แทนตัวเอง และ 'เจ้า' เรียกคนไหว้"
}`;

  try {
    // Create a timeout promise that rejects after 30 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('AI evaluation timeout after 30 seconds'));
      }, 30000); // 30 seconds
    });

    // Race between the API call and the timeout
    const apiCallPromise = model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    // Wait for whichever completes first
    const result = await Promise.race([apiCallPromise, timeoutPromise]);

    // Get the response text
    const response = result.response.text();

    // Parse the JSON response with markdown code block extraction
    const evaluationResult = parseAIResponse(response);

    return evaluationResult;
  } catch (error) {
    // Log the error for debugging
    console.error('[Gemini Evaluator Error] AI API call failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestDetails: {
        wishText: wish.substring(0, 100), // Truncate to first 100 chars for logging
        wishLength: wish.length,
        imageSize: imageBase64.length,
      },
    });

    // Re-throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Parses the AI response text to extract the JSON evaluation result
 * 
 * Handles various response formats:
 * - Plain JSON: { "tier": "SSR", ... }
 * - Markdown code block: ```json\n{ "tier": "SSR", ... }\n```
 * - Markdown code block without language: ```\n{ "tier": "SSR", ... }\n```
 * 
 * @param response - Raw text response from the AI
 * @returns Parsed evaluation result
 * @throws Error if JSON cannot be extracted or parsed
 * 
 * @internal
 */
export function parseAIResponse(response: string): EvaluationResult {
  // Try to extract JSON from markdown code blocks first
  // Pattern matches: ```json\n{...}\n``` or ```\n{...}\n```
  const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  
  let jsonText: string;
  
  if (codeBlockMatch) {
    // Extract JSON from code block
    jsonText = codeBlockMatch[1].trim();
  } else {
    // Try to find JSON object directly in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response');
    }
    
    jsonText = jsonMatch[0];
  }

  try {
    // Parse the JSON
    const parsed = JSON.parse(jsonText);

    // Validate the structure
    if (!parsed.tier || !parsed.verdict || !parsed.comment) {
      throw new Error('Missing required fields in AI response');
    }

    // Validate tier value
    const validTiers = ['SSR', 'SR', 'R', 'เกลือ'];
    if (!validTiers.includes(parsed.tier)) {
      throw new Error(`Invalid tier value: ${parsed.tier}`);
    }

    return {
      tier: parsed.tier,
      verdict: parsed.verdict,
      comment: parsed.comment,
    };
  } catch (error) {
    // Log parsing error
    console.error('[AI Response Parse Error] Failed to parse AI response:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responsePreview: response.substring(0, 200), // Log first 200 chars
      responseLength: response.length,
    });

    // Re-throw the original error to preserve the error message
    throw error;
  }
}

/**
 * Converts a File object to a base64-encoded string
 * 
 * This utility function is used to prepare images for the Gemini API,
 * which requires base64-encoded image data.
 * 
 * @param file - The image file to encode
 * @returns Promise resolving to base64 string (without data URL prefix)
 * @throws Error if file reading fails
 * 
 * @example
 * ```typescript
 * const file = new File([blob], 'offering.jpg', { type: 'image/jpeg' });
 * const base64 = await fileToBase64(file);
 * // base64 is now ready to pass to evaluatePrayer
 * ```
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file as base64'));
    };

    reader.readAsDataURL(file);
  });
}
