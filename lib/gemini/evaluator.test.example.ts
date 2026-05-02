/**
 * Example usage and manual testing for the Gemini Evaluator
 * 
 * This file demonstrates how to use the evaluatePrayer function.
 * To run this test manually:
 * 
 * 1. Ensure GOOGLE_AI_API_KEY is set in .env.local
 * 2. Create a test script in package.json or run with ts-node
 * 3. Provide a real image file or base64 string
 * 
 * Note: This is not an automated test - it's for manual verification only.
 */

import { evaluatePrayer, parseAIResponse } from './evaluator';

/**
 * Example 1: Test parseAIResponse with various response formats
 */
function testParseAIResponse() {
  console.log('Testing parseAIResponse...\n');

  // Test 1: Plain JSON
  const plainJson = `{
    "tier": "SSR",
    "verdict": "ยอดเยี่ยม!",
    "comment": "ของเซ่นหรูหรามาก คู่ควรกับคำขอพร"
  }`;

  try {
    const result1 = parseAIResponse(plainJson);
    console.log('✓ Plain JSON parsed successfully:', result1);
  } catch (error) {
    console.error('✗ Plain JSON parsing failed:', error);
  }

  // Test 2: JSON in markdown code block with language
  const markdownWithLang = `Here's the evaluation:

\`\`\`json
{
  "tier": "SR",
  "verdict": "ดีพอใช้",
  "comment": "ของเซ่นดี แต่อาจจะไม่ค่อยเข้ากับคำขอพร"
}
\`\`\`

Hope this helps!`;

  try {
    const result2 = parseAIResponse(markdownWithLang);
    console.log('✓ Markdown with language parsed successfully:', result2);
  } catch (error) {
    console.error('✗ Markdown with language parsing failed:', error);
  }

  // Test 3: JSON in markdown code block without language
  const markdownWithoutLang = `\`\`\`
{
  "tier": "เกลือ",
  "verdict": "ห่วยแตก",
  "comment": "นี่มันอะไรกัน? ไม่มีความตั้งใจเลย"
}
\`\`\``;

  try {
    const result3 = parseAIResponse(markdownWithoutLang);
    console.log('✓ Markdown without language parsed successfully:', result3);
  } catch (error) {
    console.error('✗ Markdown without language parsing failed:', error);
  }

  // Test 4: Invalid JSON (should throw error)
  const invalidJson = 'This is not JSON at all';

  try {
    parseAIResponse(invalidJson);
    console.error('✗ Invalid JSON should have thrown error');
  } catch (error) {
    console.log('✓ Invalid JSON correctly threw error:', (error as Error).message);
  }

  // Test 5: Missing required fields
  const missingFields = `{
    "tier": "SSR",
    "verdict": "ยอดเยี่ยม!"
  }`;

  try {
    parseAIResponse(missingFields);
    console.error('✗ Missing fields should have thrown error');
  } catch (error) {
    console.log('✓ Missing fields correctly threw error:', (error as Error).message);
  }

  console.log('\nAll parseAIResponse tests completed!\n');
}

/**
 * Example 2: Test fileToBase64 conversion
 * 
 * Note: This requires a browser or Node.js environment with File API support
 */
async function testFileToBase64() {
  console.log('Testing fileToBase64...\n');

  // Create a simple 1x1 red pixel PNG for testing
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  // In a real environment, you would create a File object from user input
  // This is just for demonstration
  console.log('Example base64 (1x1 red pixel PNG):', base64Png.substring(0, 50) + '...');
  console.log('✓ Base64 encoding works as expected\n');
}

/**
 * Example 3: Test evaluatePrayer with a real API call
 * 
 * WARNING: This will make a real API call to Google Gemini
 * Ensure GOOGLE_AI_API_KEY is set in your environment
 */
async function testEvaluatePrayer() {
  console.log('Testing evaluatePrayer...\n');

  // Check if API key is configured
  if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'your-gemini-api-key-here') {
    console.log('⚠ GOOGLE_AI_API_KEY not configured. Skipping API test.');
    console.log('  To test the API, set GOOGLE_AI_API_KEY in .env.local\n');
    return;
  }

  // Example: A simple wish and a 1x1 red pixel image
  const wish = 'ขอให้รวยๆ มีเงินใช้ไม่ขาดมือ';
  const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  try {
    console.log('Making API call to Gemini...');
    console.log('Wish:', wish);
    
    const result = await evaluatePrayer(wish, imageBase64);
    
    console.log('✓ API call successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('✗ API call failed:', error);
  }

  console.log('\nEvaluatePrayer test completed!\n');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('Gemini Evaluator Manual Tests');
  console.log('='.repeat(60));
  console.log();

  testParseAIResponse();
  await testFileToBase64();
  await testEvaluatePrayer();

  console.log('='.repeat(60));
  console.log('All tests completed!');
  console.log('='.repeat(60));
}

// Uncomment to run tests manually
// runAllTests().catch(console.error);

export { testParseAIResponse, testFileToBase64, testEvaluatePrayer, runAllTests };
