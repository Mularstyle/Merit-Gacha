# Task 12.1 Summary: Implement Timeout Handling for AI API

## Task Description
Add 30-second timeout to Gemini API calls and display Thai timeout error message.

**Requirements**: 13.1

## Implementation Details

### 1. Timeout Implementation in Evaluator (`lib/gemini/evaluator.ts`)

Added a 30-second timeout to the `evaluatePrayer` function using `Promise.race()`:

```typescript
// Create a timeout promise that rejects after 30 seconds
const timeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => {
    reject(new Error('AI evaluation timeout after 30 seconds'));
  }, 30000); // 30 seconds
});

// Race between the API call and the timeout
const apiCallPromise = model.generateContent([...]);

// Wait for whichever completes first
const result = await Promise.race([apiCallPromise, timeoutPromise]);
```

**Key Changes**:
- Timeout triggers after exactly 30 seconds
- Error message: "AI evaluation timeout after 30 seconds"
- Timeout error is logged and re-thrown to be handled by the API route

### 2. Error Handling in API Route (`app/api/pray/route.ts`)

The API route already had timeout error handling in place:

```typescript
catch (error) {
  // Check if it's a timeout error (Requirement 13.1)
  const errorMessage = error instanceof Error ? error.message : '';
  if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'เทพเจ้าไม่ตอบสนอง กรุณาลองใหม่ภายหลัง', // "Deity not responding, please try again later"
      },
      { status: 504 }
    );
  }
  // ... other error handling
}
```

**Thai Error Message**: "เทพเจ้าไม่ตอบสนอง กรุณาลองใหม่ภายหลัง"
- Translation: "Deity not responding, please try again later"
- HTTP Status: 504 Gateway Timeout

### 3. Refactoring for Testability

Refactored the evaluator to use a factory pattern for better testability:

**Before**:
```typescript
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
```

**After**:
```typescript
function getGenAI(): GoogleGenerativeAI {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
}
```

This allows the GoogleGenerativeAI instance to be created at runtime rather than module load time, making it easier to mock in tests.

### 4. Comprehensive Test Coverage

Created `lib/gemini/evaluator.test.ts` with 17 test cases covering:

**parseAIResponse Tests** (8 tests):
- Plain JSON parsing
- Markdown code block parsing (with and without language)
- All tier types (SSR, SR, R, เกลือ)
- Error cases: no JSON, invalid JSON, missing fields, invalid tier

**evaluatePrayer Tests** (8 tests):
- Successful evaluation
- Missing API key error
- **Timeout after 30 seconds** ✓
- Successful completion before timeout
- API errors
- Invalid JSON response
- Prompt includes wish text
- Base64 image data passed correctly

**API Route Integration Test** (1 test):
- Timeout error message recognition

### 5. Test Results

All tests passing:
- ✓ `lib/gemini/evaluator.test.ts`: 17/17 tests passed
- ✓ `app/api/pray/route.test.ts`: 20/20 tests passed (including existing timeout test)

## Files Modified

1. **lib/gemini/evaluator.ts**
   - Added 30-second timeout using Promise.race()
   - Refactored to use factory pattern for GoogleGenerativeAI
   - Updated error handling to preserve original error messages

2. **lib/gemini/evaluator.test.ts** (NEW)
   - Created comprehensive test suite
   - 17 test cases covering all functionality
   - Includes timeout test using Jest fake timers

## Verification

The implementation satisfies **Requirement 13.1**:
> "WHEN the AI_Evaluator fails to respond within 30 seconds, THE Merit_Gacha_System SHALL display a timeout error message to the User"

**Verification Steps**:
1. ✓ Timeout triggers after exactly 30 seconds
2. ✓ Timeout error is caught and logged
3. ✓ API route detects timeout error by message content
4. ✓ Thai error message is returned to user
5. ✓ HTTP 504 status code is returned
6. ✓ All tests pass

## User Experience

When a timeout occurs:
1. User submits prayer with wish and offering image
2. API call to Gemini takes longer than 30 seconds
3. Timeout error is thrown: "AI evaluation timeout after 30 seconds"
4. API route catches the error and returns:
   - Status: 504 Gateway Timeout
   - Message: "เทพเจ้าไม่ตอบสนอง กรุณาลองใหม่ภายหลัง"
5. User sees the Thai error message and can try again

## Notes

- The timeout is implemented at the evaluator level, not the API route level
- This ensures the timeout applies to the actual AI API call
- The error message check in the API route is flexible (checks for "timeout" or "ETIMEDOUT")
- All error messages are in Thai as per Requirement 13.5
- The implementation is fully tested and production-ready
