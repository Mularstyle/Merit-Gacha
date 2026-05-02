/**
 * Unit tests for PrayerForm component
 * Tests form validation, submission, and user interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrayerForm from './PrayerForm';
import { EvaluationResult } from '@/lib/types';

// Mock ImageUpload component
jest.mock('./ImageUpload', () => {
  return function MockImageUpload({
    onImageSelect,
  }: {
    onImageSelect: (file: File) => void;
  }) {
    return (
      <div data-testid="image-upload">
        <button
          onClick={() => {
            const mockFile = new File(['test'], 'test.jpg', {
              type: 'image/jpeg',
            });
            onImageSelect(mockFile);
          }}
        >
          Select Image
        </button>
      </div>
    );
  };
});

describe('PrayerForm', () => {
  let mockOnSubmitSuccess: jest.Mock;
  let mockOnSubmitError: jest.Mock;

  beforeEach(() => {
    mockOnSubmitSuccess = jest.fn();
    mockOnSubmitError = jest.fn();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Rendering', () => {
    it('should render wish input with Thai label', () => {
      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      expect(screen.getByText('ท่านต้องการสิ่งใด?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...')).toBeInTheDocument();
    });

    it('should render image upload with Thai label', () => {
      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      expect(screen.getByText('จงวางของเซ่นไหว้ลงตรงนี้')).toBeInTheDocument();
      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });

    it('should render submit button with Thai text', () => {
      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      expect(screen.getByRole('button', { name: 'ส่งคำขอพร' })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is empty', () => {
      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when only wish is filled', () => {
      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when only image is selected', () => {
      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when both fields are filled', () => {
      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill wish
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      // Select image
      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable submit button when wish is only whitespace', () => {
      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill wish with whitespace
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: '   ' } });

      // Select image
      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should show loading indicator during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  data: {
                    tier: 'SSR',
                    verdict: 'ยอดเยี่ยม',
                    comment: 'ของเซ่นดีมาก',
                  },
                }),
              });
            }, 100);
          })
      );

      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill form
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      fireEvent.click(submitButton);

      // Check loading state
      expect(screen.getByText('กำลังส่งกระแสจิต...')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockOnSubmitSuccess).toHaveBeenCalled();
      });
    });

    it('should call API with correct data on submission', async () => {
      const mockResult: EvaluationResult = {
        tier: 'SSR',
        verdict: 'ยอดเยี่ยม',
        comment: 'ของเซ่นดีมาก',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockResult,
        }),
      });

      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill form
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/pray', {
          method: 'POST',
          body: expect.any(FormData),
        });
      });

      // Verify FormData contents
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const formData = fetchCall[1].body as FormData;
      expect(formData.get('wish')).toBe('ขอให้รวย');
      expect(formData.get('offering')).toBeInstanceOf(File);
    });

    it('should call onSubmitSuccess with result on successful submission', async () => {
      const mockResult: EvaluationResult = {
        tier: 'SR',
        verdict: 'ดีพอใช้',
        comment: 'ของเซ่นพอใช้ได้',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockResult,
        }),
      });

      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill and submit form
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmitSuccess).toHaveBeenCalledWith(mockResult);
      });
    });

    it('should call onSubmitError on failed submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: 'ไม่สามารถบันทึกคำขอพรได้',
        }),
      });

      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill and submit form
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmitError).toHaveBeenCalledWith(
          'ไม่สามารถบันทึกคำขอพรได้'
        );
      });
    });

    it('should reset form after successful submission', async () => {
      const mockResult: EvaluationResult = {
        tier: 'R',
        verdict: 'ธรรมดา',
        comment: 'ของเซ่นธรรมดา',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockResult,
        }),
      });

      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill and submit form
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...') as HTMLTextAreaElement;
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmitSuccess).toHaveBeenCalled();
      });

      // Check form is reset
      expect(wishInput.value).toBe('');
      expect(submitButton).toBeDisabled();
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill and submit form
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmitError).toHaveBeenCalledWith('ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต');
      });

      // Verify network error message is displayed
      expect(screen.getByText('ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต')).toBeInTheDocument();
      
      // Verify retry button is displayed
      expect(screen.getByText('ลองอีกครั้ง')).toBeInTheDocument();
    });

    it('should retry submission when retry button is clicked', async () => {
      // First call fails with network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill and submit form
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      fireEvent.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('ลองอีกครั้ง')).toBeInTheDocument();
      });

      // Mock successful response for retry
      const mockResult: EvaluationResult = {
        tier: 'SSR',
        verdict: 'ยอดเยี่ยม',
        comment: 'ของเซ่นดีมาก',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockResult,
        }),
      });

      // Click retry button
      const retryButton = screen.getByText('ลองอีกครั้ง');
      fireEvent.click(retryButton);

      // Verify success callback is called
      await waitFor(() => {
        expect(mockOnSubmitSuccess).toHaveBeenCalledWith(mockResult);
      });

      // Verify error message is cleared
      expect(screen.queryByText('ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable wish input during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  data: {
                    tier: 'SSR',
                    verdict: 'ยอดเยี่ยม',
                    comment: 'ของเซ่นดีมาก',
                  },
                }),
              });
            }, 100);
          })
      );

      render(
        <PrayerForm
          onSubmitSuccess={mockOnSubmitSuccess}
          onSubmitError={mockOnSubmitError}
        />
      );

      // Fill form
      const wishInput = screen.getByPlaceholderText('กรุณาระบุคำขอพรของท่าน...');
      fireEvent.change(wishInput, { target: { value: 'ขอให้รวย' } });

      const selectImageButton = screen.getByText('Select Image');
      fireEvent.click(selectImageButton);

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'ส่งคำขอพร' });
      fireEvent.click(submitButton);

      // Check wish input is disabled
      expect(wishInput).toBeDisabled();

      await waitFor(() => {
        expect(mockOnSubmitSuccess).toHaveBeenCalled();
      });
    });
  });
});
