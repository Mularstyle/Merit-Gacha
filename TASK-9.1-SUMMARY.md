# Task 9.1 Summary: Create POST /api/pray Route

## Implementation Complete ✅

### Files Created

1. **`app/api/pray/route.ts`** - Main API route handler
   - Validates user authentication (returns 401 if not authenticated)
   - Validates request body (wish and offering present)
   - Validates image file size (<10MB) and format (JPEG, PNG, WebP)
   - Uploads image to Supabase Storage with unique identifier
   - Gets public URL for uploaded image
   - Calls Gemini evaluator with wish and image
   - Parses AI response with error handling
   - Inserts prayer record into database
   - Returns evaluation result with HTTP 200
   - Comprehensive error handling with Thai messages

2. **`app/api/pray/route.test.ts`** - Comprehensive unit tests
   - 20 test cases covering all functionality
   - Authentication validation tests
   - Request body validation tests
   - Image file validation tests (size and format)
   - Image upload tests
   - AI evaluation integration tests
   - Database persistence tests
   - Error handling tests with Thai messages
   - All tests passing ✅

### Key Features Implemented

#### 1. Authentication Validation (Requirement 11.2)
- Checks user authentication using Supabase server client
- Returns 401 with Thai error message if not authenticated
- Extracts user ID for subsequent operations

#### 2. Request Body Validation (Requirement 11.3)
- Parses FormData from request
- Validates both wish and offering are present
- Validates wish is not empty string
- Returns 400 with appropriate Thai error messages

#### 3. Image File Validation (Requirements 3.1, 3.2)
- Validates file size is less than 10MB (returns 413 if exceeded)
- Validates file format is JPEG, PNG, or WebP (returns 400 if invalid)
- Clear Thai error messages for each validation failure

#### 4. Image Upload to Supabase Storage (Requirements 3.3, 3.4, 11.4)
- Generates unique identifier using timestamp and random string
- Organizes files by user ID (user_id/timestamp-random.ext)
- Uploads to 'offerings' bucket
- Handles upload errors with Thai error message

#### 5. Public URL Generation (Requirement 3.5)
- Gets public URL from Supabase Storage
- URL stored in database for later retrieval

#### 6. AI Evaluation Integration (Requirements 4.1, 11.5)
- Converts image to base64 for Gemini API
- Calls evaluatePrayer with wish text and base64 image
- Handles AI evaluation errors
- Detects timeout errors and returns 504 with Thai message
- Returns 500 with Thai message for other AI errors

#### 7. Database Persistence (Requirements 7.1-7.8, 11.6)
- Inserts prayer record with all fields:
  - user_id (from authenticated user)
  - wish_text (from request)
  - offering_image_url (from storage)
  - tier (from AI evaluation)
  - verdict (from AI evaluation)
  - comment (from AI evaluation)
  - created_at (automatically set by database)
- Handles database errors with Thai error message

#### 8. Success Response (Requirement 11.7)
- Returns HTTP 200 on success
- Returns evaluation result with tier, verdict, comment
- Includes prayerId for reference

#### 9. Comprehensive Error Handling (Requirements 13.1-13.5)
- All error messages in Thai language
- Specific error codes for different failure scenarios:
  - 401: Not authenticated
  - 400: Invalid request (missing fields, invalid format)
  - 413: File too large
  - 500: Server errors (storage, database, AI)
  - 504: AI timeout
- Detailed server-side logging for debugging
- User-friendly error messages

### Test Coverage

All 20 unit tests passing:

**Authentication validation (2 tests)**
- ✅ Returns 401 when user is not authenticated
- ✅ Returns 401 when auth error occurs

**Request body validation (4 tests)**
- ✅ Returns 400 when wish is missing
- ✅ Returns 400 when offering is missing
- ✅ Returns 400 when wish is empty string
- ✅ Returns 400 when FormData parsing fails

**Image file validation (5 tests)**
- ✅ Returns 413 when file size exceeds 10MB
- ✅ Returns 400 when file format is not allowed
- ✅ Accepts JPEG format
- ✅ Accepts PNG format
- ✅ Accepts WebP format

**Image upload to Supabase Storage (2 tests)**
- ✅ Returns 500 when image upload fails
- ✅ Generates unique file names for uploads

**AI evaluation integration (3 tests)**
- ✅ Returns 500 when AI evaluation fails
- ✅ Returns 504 when AI evaluation times out
- ✅ Calls evaluatePrayer with wish and base64 image

**Database persistence (2 tests)**
- ✅ Returns 500 when database insert fails
- ✅ Inserts prayer record with correct data

**Successful prayer submission (2 tests)**
- ✅ Returns 200 with evaluation result on success
- ✅ Handles all tier types correctly (SSR, SR, R, เกลือ)

### Requirements Validated

This implementation validates the following requirements:

- **11.1**: API route provided for prayer submissions
- **11.2**: User authentication validated
- **11.3**: Request body validated (401 if not authenticated)
- **11.4**: Image uploaded to storage
- **11.5**: Wish and offering sent to AI evaluator
- **11.6**: Prayer record saved to database
- **11.7**: Evaluation result returned with HTTP 200
- **3.3**: Image stored in Supabase Storage
- **3.4**: Unique identifier generated for each image
- **3.5**: Public URL stored in database
- **4.1**: AI evaluator receives wish and image
- **7.1-7.8**: Prayer record persistence with all fields
- **13.1**: Timeout error handling
- **13.2**: Upload error handling
- **13.3**: Database error handling
- **13.4**: Network error handling (implicit)
- **13.5**: All error messages in Thai

### Technical Details

**File Upload Flow:**
1. Client sends FormData with wish (string) and offering (File)
2. Server validates authentication
3. Server validates request body
4. Server validates file size and format
5. Server converts File to Buffer
6. Server uploads to Supabase Storage with unique path
7. Server gets public URL

**AI Evaluation Flow:**
1. Server converts image Buffer to base64
2. Server calls evaluatePrayer(wish, base64Image)
3. Gemini API analyzes offering vs wish
4. Server receives JSON response with tier, verdict, comment
5. Error handling for timeouts and API failures

**Database Flow:**
1. Server inserts prayer record with all fields
2. Database automatically sets created_at timestamp
3. Database enforces foreign key constraint on user_id
4. Server retrieves inserted record with ID
5. Server returns ID to client

### Error Handling Strategy

**Client-facing errors (Thai messages):**
- Authentication: "กรุณาเข้าสู่ระบบก่อนขอพร"
- Missing fields: "กรุณากรอกคำขอพรและเลือกของเซ่นไหว้"
- Empty wish: "กรุณากรอกคำขอพร"
- File too large: "ไฟล์ใหญ่เกินไป (สูงสุด 10MB)"
- Invalid format: "รองรับเฉพาะไฟล์ JPEG, PNG, WebP"
- Upload error: "ไม่สามารถอัพโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง"
- AI timeout: "เทพเจ้าไม่ตอบสนอง กรุณาลองใหม่ภายหลัง"
- AI error: "ไม่สามารถประเมินคำขอพรได้ กรุณาลองใหม่อีกครั้ง"
- Database error: "ไม่สามารถบันทึกคำขอพรได้ กรุณาลองใหม่อีกครั้ง"
- System error: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง"

**Server-side logging:**
- All errors logged with userId, error message, and timestamp
- Detailed stack traces for debugging
- No sensitive data (API keys, passwords) in logs

### Integration Points

**Supabase Server Client:**
- Authentication: `supabase.auth.getUser()`
- Storage: `supabase.storage.from('offerings').upload()`
- Database: `supabase.from('prayers').insert()`

**Gemini Evaluator:**
- Function: `evaluatePrayer(wish, base64Image)`
- Returns: `{ tier, verdict, comment }`

**TypeScript Types:**
- `ApiResponse<T>` for consistent response structure
- `EvaluationResult` for AI response
- `GachaTier` for tier validation

### Next Steps

The POST /api/pray route is now complete and ready for integration with the frontend PrayerForm component. The route handles all requirements including:

- ✅ Authentication validation
- ✅ Request validation
- ✅ Image upload
- ✅ AI evaluation
- ✅ Database persistence
- ✅ Error handling
- ✅ Thai language messages
- ✅ Comprehensive test coverage

The frontend can now call this API route to submit prayers and receive evaluation results.
