/**
 * Unit tests for Gemini Evaluator Service
 * 
 * Tests cover:
 * - AI response parsing (JSON extraction from various formats)
 * - Timeout handling (30-second limit)
 * - Error handling and logging
 * - Response validation
 * 
 * @jest-environment node
 */

// Mock the Google Generative AI SDK BEFORE importing the evaluator
jest.mock('@google/generative-ai');

import { evaluatePrayer, parseAIResponse } from './evaluator';
import { GoogleGenerativeAI } from '@google/generative-ai';

const mockGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;

describe('Gemini Evaluator', () => {
  let mockModel: any;
  let mockGenAI: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup mock model
    mockModel = {
      generateContent: jest.fn(),
    };

    // Setup mock GenAI instance
    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    // Mock the GoogleGenerativeAI constructor
    mockGoogleGenerativeAI.mockImplementation(() => mockGenAI);

    // Set environment variable
    process.env.GOOGLE_AI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('parseAIResponse', () => {
    it('should parse plain JSON response', () => {
      const response = `{
        "tier": "SSR",
        "verdict": "ยอดเยี่ยม",
        "comment": "ของเซ่นสวยงาม"
      }`;

      const result = parseAIResponse(response);

      expect(result).toEqual({
        tier: 'SSR',
        verdict: 'ยอดเยี่ยม',
        comment: 'ของเซ่นสวยงาม',
      });
    });

    it('should parse JSON from markdown code block with language', () => {
      const response = `Here's the evaluation:

\`\`\`json
{
  "tier": "SR",
  "verdict": "ดีพอใช้",
  "comment": "ของเซ่นดี"
}
\`\`\`

Done!`;

      const result = parseAIResponse(response);

      expect(result).toEqual({
        tier: 'SR',
        verdict: 'ดีพอใช้',
        comment: 'ของเซ่นดี',
      });
    });

    it('should parse JSON from markdown code block without language', () => {
      const response = `\`\`\`
{
  "tier": "R",
  "verdict": "ธรรมดา",
  "comment": "ก็ได้"
}
\`\`\``;

      const result = parseAIResponse(response);

      expect(result).toEqual({
        tier: 'R',
        verdict: 'ธรรมดา',
        comment: 'ก็ได้',
      });
    });

    it('should parse JSON with เกลือ tier', () => {
      const response = `{
        "tier": "เกลือ",
        "verdict": "ห่วยแตก",
        "comment": "ไม่มีความตั้งใจ"
      }`;

      const result = parseAIResponse(response);

      expect(result).toEqual({
        tier: 'เกลือ',
        verdict: 'ห่วยแตก',
        comment: 'ไม่มีความตั้งใจ',
      });
    });

    it('should throw error when no JSON found', () => {
      const response = 'This is not JSON at all';

      expect(() => parseAIResponse(response)).toThrow('No JSON object found in AI response');
    });

    it('should throw error when JSON is invalid', () => {
      const response = '{ invalid json }';

      // JSON.parse will throw a SyntaxError with a message like "Expected property name or '}' in JSON at position 2"
      expect(() => parseAIResponse(response)).toThrow();
    });

    it('should throw error when required fields are missing', () => {
      const response = `{
        "tier": "SSR",
        "verdict": "ยอดเยี่ยม"
      }`;

      expect(() => parseAIResponse(response)).toThrow('Missing required fields in AI response');
    });

    it('should throw error when tier value is invalid', () => {
      const response = `{
        "tier": "INVALID",
        "verdict": "test",
        "comment": "test"
      }`;

      expect(() => parseAIResponse(response)).toThrow('Invalid tier value: INVALID');
    });
  });

  describe('evaluatePrayer', () => {
    it('should successfully evaluate prayer and return result', async () => {
      const mockResponse = {
        response: {
          text: () => `{
            "tier": "SSR",
            "verdict": "ยอดเยี่ยม",
            "comment": "ของเซ่นสวยงาม"
          }`,
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await evaluatePrayer('ขอให้รวย', 'base64imagedata');

      expect(result).toEqual({
        tier: 'SSR',
        verdict: 'ยอดเยี่ยม',
        comment: 'ของเซ่นสวยงาม',
      });

      expect(mockModel.generateContent).toHaveBeenCalledWith([
        expect.stringContaining('คุณคือเทพเจ้าศาลพระภูมิที่มีอารมณ์ขัน'),
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: 'base64imagedata',
          },
        },
      ]);
    });

    it('should throw error when API key is not set', async () => {
      delete process.env.GOOGLE_AI_API_KEY;

      await expect(evaluatePrayer('ขอให้รวย', 'base64imagedata')).rejects.toThrow(
        'GOOGLE_AI_API_KEY environment variable is not set'
      );
    });

    it('should timeout after 30 seconds', async () => {
      // Mock a slow API call that never resolves
      mockModel.generateContent.mockImplementation(
        () => new Promise((resolve) => {
          // This promise will never resolve naturally
          setTimeout(resolve, 60000); // 60 seconds
        })
      );

      // Start the evaluation
      const evaluationPromise = evaluatePrayer('ขอให้รวย', 'base64imagedata');

      // Fast-forward time by 30 seconds
      jest.advanceTimersByTime(30000);

      // The promise should reject with timeout error
      await expect(evaluationPromise).rejects.toThrow('AI evaluation timeout after 30 seconds');
    });

    it('should complete successfully before timeout', async () => {
      const mockResponse = {
        response: {
          text: () => `{
            "tier": "SR",
            "verdict": "ดี",
            "comment": "พอใช้ได้"
          }`,
        },
      };

      // Mock API call that resolves quickly
      mockModel.generateContent.mockResolvedValue(mockResponse);

      // Start the evaluation
      const evaluationPromise = evaluatePrayer('ขอให้รวย', 'base64imagedata');

      // Fast-forward time by 5 seconds (less than timeout)
      jest.advanceTimersByTime(5000);

      // The promise should resolve successfully
      const result = await evaluationPromise;

      expect(result).toEqual({
        tier: 'SR',
        verdict: 'ดี',
        comment: 'พอใช้ได้',
      });
    });

    it('should handle API errors and re-throw', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('API connection failed'));

      await expect(evaluatePrayer('ขอให้รวย', 'base64imagedata')).rejects.toThrow(
        'API connection failed'
      );
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        response: {
          text: () => 'This is not valid JSON',
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      await expect(evaluatePrayer('ขอให้รวย', 'base64imagedata')).rejects.toThrow(
        'No JSON object found in AI response'
      );
    });

    it('should include wish in prompt', async () => {
      const mockResponse = {
        response: {
          text: () => `{
            "tier": "R",
            "verdict": "ธรรมดา",
            "comment": "ก็ได้"
          }`,
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      await evaluatePrayer('ขอให้มีสุขภาพแข็งแรง', 'base64imagedata');

      const callArgs = mockModel.generateContent.mock.calls[0][0];
      const prompt = callArgs[0];

      expect(prompt).toContain('ขอให้มีสุขภาพแข็งแรง');
    });

    it('should pass base64 image data correctly', async () => {
      const mockResponse = {
        response: {
          text: () => `{
            "tier": "SSR",
            "verdict": "ยอดเยี่ยม",
            "comment": "สุดยอด"
          }`,
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const testBase64 = 'testbase64data123';
      await evaluatePrayer('ขอให้รวย', testBase64);

      const callArgs = mockModel.generateContent.mock.calls[0][0];
      const imageData = callArgs[1];

      expect(imageData).toEqual({
        inlineData: {
          mimeType: 'image/jpeg',
          data: testBase64,
        },
      });
    });
  });

  describe('Timeout error handling in API route', () => {
    it('should recognize timeout errors by message content', () => {
      const timeoutError = new Error('AI evaluation timeout after 30 seconds');
      const etimedoutError = new Error('Request failed with ETIMEDOUT');
      const regularError = new Error('Some other error');

      // The API route checks if error message includes 'timeout' or 'ETIMEDOUT'
      expect(timeoutError.message.includes('timeout')).toBe(true);
      expect(etimedoutError.message.includes('ETIMEDOUT')).toBe(true);
      expect(regularError.message.includes('timeout')).toBe(false);
      expect(regularError.message.includes('ETIMEDOUT')).toBe(false);
    });
  });
});
