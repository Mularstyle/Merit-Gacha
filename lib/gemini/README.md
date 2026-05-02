# Gemini Evaluator Service

This directory contains the Google Gemini AI integration for evaluating prayer offerings in the Merit Gacha application.

## Overview

The evaluator service uses Google's Gemini 1.5 Flash model to analyze offering images against wish texts. The AI acts as a humorous Thai deity that judges the worthiness of offerings in a gacha-style tier system.

## Files

- **`evaluator.ts`** - Main evaluator service with API integration
- **`evaluator.test.example.ts`** - Example usage and manual testing guide

## Setup

### Prerequisites

1. Get a Google AI Studio API key from: https://aistudio.google.com/app/apikey
2. Add the API key to your `.env.local` file:

```bash
GOOGLE_AI_API_KEY=your-actual-api-key-here
```

## Usage

### Basic Usage

```typescript
import { evaluatePrayer, fileToBase64 } from '@/lib/gemini/evaluator';

// Convert image file to base64
const imageFile = // ... get File from user input
const imageBase64 = await fileToBase64(imageFile);

// Evaluate the prayer
const result = await evaluatePrayer(
  'ขอให้รวยๆ มีเงินใช้ไม่ขาดมือ',
  imageBase64
);

console.log(result);
// {
//   tier: 'SSR',
//   verdict: 'ยอดเยี่ยม!',
//   comment: 'ของเซ่นหรูหรามาก คู่ควรกับคำขอพร'
// }
```

### In API Routes

```typescript
import { evaluatePrayer } from '@/lib/gemini/evaluator';

export async function POST(request: Request) {
  const formData = await request.formData();
  const wish = formData.get('wish') as string;
  const imageFile = formData.get('offering') as File;

  // Convert to base64
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  // Evaluate
  const result = await evaluatePrayer(wish, base64);

  return Response.json({ success: true, data: result });
}
```

## API Reference

### `evaluatePrayer(wish: string, imageBase64: string): Promise<EvaluationResult>`

Evaluates a prayer by analyzing the offering image against the wish text.

**Parameters:**
- `wish` - The user's wish text (Thai or English)
- `imageBase64` - Base64-encoded image data (without data URL prefix)

**Returns:**
- Promise resolving to `EvaluationResult` with `tier`, `verdict`, and `comment`

**Throws:**
- Error if API key is not configured
- Error if API call fails
- Error if response cannot be parsed

### `parseAIResponse(response: string): EvaluationResult`

Parses the AI response text to extract the JSON evaluation result. Handles various response formats including plain JSON and markdown code blocks.

**Parameters:**
- `response` - Raw text response from the AI

**Returns:**
- Parsed `EvaluationResult`

**Throws:**
- Error if JSON cannot be extracted or parsed
- Error if required fields are missing
- Error if tier value is invalid

### `fileToBase64(file: File): Promise<string>`

Converts a File object to a base64-encoded string for use with the Gemini API.

**Parameters:**
- `file` - The image file to encode

**Returns:**
- Promise resolving to base64 string (without data URL prefix)

**Throws:**
- Error if file reading fails

## Tier System

The AI evaluates offerings on a 4-tier gacha system:

- **SSR (ศักดิ์สิทธิ์สูงสุด)** - Most Sacred: Luxurious offerings worthy of the wish
- **SR (ศักดิ์สิทธิ์)** - Sacred: Good offerings, acceptable
- **R (ธรรมดา)** - Regular: Ordinary offerings, not quite matching the wish
- **เกลือ (ไร้ค่า)** - Worthless/Salt: Poor offerings, inappropriate or low-effort

## Error Handling

The evaluator includes comprehensive error handling:

1. **Environment validation** - Checks if API key is configured
2. **API errors** - Logs and re-throws API call failures
3. **Parse errors** - Logs and throws errors for invalid responses
4. **Validation errors** - Validates tier values and required fields

All errors are logged with context for debugging:

```typescript
console.error('[Gemini Evaluator Error]', {
  error: error.message,
  wish: wish.substring(0, 50),
  timestamp: new Date().toISOString(),
});
```

## Testing

See `evaluator.test.example.ts` for manual testing examples. The file includes:

1. **parseAIResponse tests** - Various response format handling
2. **fileToBase64 tests** - Base64 encoding verification
3. **evaluatePrayer tests** - Real API call examples (requires API key)

To run manual tests:

```typescript
import { runAllTests } from '@/lib/gemini/evaluator.test.example';

// Uncomment the last line in the test file and run:
// npx ts-node lib/gemini/evaluator.test.example.ts
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **4.1** - AI evaluator receives wish text and offering image
- **4.2** - AI analyzes offering content against wish magnitude
- **4.3** - AI returns JSON response with tier, verdict, and comment
- **4.4** - AI assigns one of four gacha tiers
- **4.7** - AI generates responses in Thai language with deity persona

## Notes

- The evaluator uses Gemini 1.5 Flash model for fast, cost-effective evaluations
- Images are sent as base64-encoded JPEG (mime type: image/jpeg)
- The Thai deity persona is defined in the prompt for consistent character
- Response parsing handles both plain JSON and markdown code blocks
- All errors are logged for debugging while being re-thrown for caller handling
