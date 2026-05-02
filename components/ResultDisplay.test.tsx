/**
 * Unit tests for ResultDisplay component
 * Tests Requirements: 6.1, 6.6, 6.7
 */

import { render, screen, waitFor } from '@testing-library/react';
import ResultDisplay from './ResultDisplay';
import { EvaluationResult, GachaTier } from '@/lib/types';

describe('ResultDisplay Component', () => {
  // Test data for each tier
  const createMockResult = (tier: GachaTier): EvaluationResult => ({
    tier,
    verdict: `Test verdict for ${tier}`,
    comment: `Test comment for ${tier}`,
  });

  describe('Requirement 6.6: Display verdict text', () => {
    it('should display the verdict text from AI evaluator', () => {
      const result = createMockResult('SSR');
      render(<ResultDisplay result={result} />);
      
      expect(screen.getByText('Test verdict for SSR')).toBeInTheDocument();
    });

    it('should display verdict label in Thai', () => {
      const result = createMockResult('SR');
      render(<ResultDisplay result={result} />);
      
      expect(screen.getByText('คำตัดสิน')).toBeInTheDocument();
    });
  });

  describe('Requirement 6.7: Display comment text', () => {
    it('should display the comment text from AI evaluator', () => {
      const result = createMockResult('R');
      render(<ResultDisplay result={result} />);
      
      expect(screen.getByText('Test comment for R')).toBeInTheDocument();
    });

    it('should display comment label in Thai', () => {
      const result = createMockResult('เกลือ');
      render(<ResultDisplay result={result} />);
      
      expect(screen.getByText('ความเห็นจากเทพเจ้า')).toBeInTheDocument();
    });
  });

  describe('Requirement 6.1: Display tier badge with appropriate styling', () => {
    it('should render TierBadge component with SSR tier', () => {
      const result = createMockResult('SSR');
      render(<ResultDisplay result={result} />);
      
      expect(screen.getByText('SSR')).toBeInTheDocument();
    });

    it('should render TierBadge component with SR tier', () => {
      const result = createMockResult('SR');
      render(<ResultDisplay result={result} />);
      
      expect(screen.getByText('SR')).toBeInTheDocument();
    });

    it('should render TierBadge component with R tier', () => {
      const result = createMockResult('R');
      render(<ResultDisplay result={result} />);
      
      expect(screen.getByText('R')).toBeInTheDocument();
    });

    it('should render TierBadge component with เกลือ tier', () => {
      const result = createMockResult('เกลือ');
      render(<ResultDisplay result={result} />);
      
      expect(screen.getByText('เกลือ')).toBeInTheDocument();
    });
  });

  describe('Animation behavior', () => {
    it('should initially render with hidden state', () => {
      const result = createMockResult('SSR');
      const { container } = render(<ResultDisplay result={result} />);
      
      // Check for initial opacity-0 class (hidden state)
      const tierContainer = container.querySelector('.opacity-0');
      expect(tierContainer).toBeInTheDocument();
    });

    it('should show content after animation delay', async () => {
      const result = createMockResult('SR');
      render(<ResultDisplay result={result} />);
      
      // Wait for animations to complete
      await waitFor(
        () => {
          expect(screen.getByText('Test verdict for SR')).toBeVisible();
          expect(screen.getByText('Test comment for SR')).toBeVisible();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Complete evaluation result display', () => {
    it('should display all three components: tier, verdict, and comment', () => {
      const result: EvaluationResult = {
        tier: 'SSR',
        verdict: 'ศักดิ์สิทธิ์สูงสุด!',
        comment: 'เทพเจ้าพอใจมาก ขอให้สมหวังทุกประการ!',
      };
      
      render(<ResultDisplay result={result} />);
      
      // Verify all three components are present
      expect(screen.getByText('SSR')).toBeInTheDocument();
      expect(screen.getByText('ศักดิ์สิทธิ์สูงสุด!')).toBeInTheDocument();
      expect(screen.getByText('เทพเจ้าพอใจมาก ขอให้สมหวังทุกประการ!')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty verdict text', () => {
      const result: EvaluationResult = {
        tier: 'R',
        verdict: '',
        comment: 'Test comment',
      };
      
      render(<ResultDisplay result={result} />);
      
      // Should still render the structure
      expect(screen.getByText('คำตัดสิน')).toBeInTheDocument();
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });

    it('should handle empty comment text', () => {
      const result: EvaluationResult = {
        tier: 'SR',
        verdict: 'Test verdict',
        comment: '',
      };
      
      render(<ResultDisplay result={result} />);
      
      // Should still render the structure
      expect(screen.getByText('Test verdict')).toBeInTheDocument();
      expect(screen.getByText('ความเห็นจากเทพเจ้า')).toBeInTheDocument();
    });

    it('should handle long verdict text', () => {
      const longVerdict = 'ศักดิ์สิทธิ์สูงสุด! '.repeat(10);
      const result: EvaluationResult = {
        tier: 'SSR',
        verdict: longVerdict,
        comment: 'Test comment',
      };
      
      render(<ResultDisplay result={result} />);
      
      // Use a partial match since whitespace may be normalized
      expect(screen.getByText((content, element) => {
        return element?.textContent === longVerdict;
      })).toBeInTheDocument();
    });

    it('should handle long comment text', () => {
      const longComment = 'เทพเจ้าพอใจมาก '.repeat(20);
      const result: EvaluationResult = {
        tier: 'SR',
        verdict: 'Test verdict',
        comment: longComment,
      };
      
      render(<ResultDisplay result={result} />);
      
      // Use a partial match since whitespace may be normalized
      expect(screen.getByText((content, element) => {
        return element?.textContent === longComment;
      })).toBeInTheDocument();
    });
  });

  describe('Tier-specific visual effects', () => {
    it('should apply SSR tier-specific styling', () => {
      const result = createMockResult('SSR');
      const { container } = render(<ResultDisplay result={result} />);
      
      // Check for gold radiance effect (shadow-yellow-500/50)
      const tierEffect = container.querySelector('.shadow-yellow-500\\/50');
      expect(tierEffect).toBeInTheDocument();
    });

    it('should apply SR tier-specific styling', () => {
      const result = createMockResult('SR');
      const { container } = render(<ResultDisplay result={result} />);
      
      // Check for silver radiance effect (shadow-gray-400/50)
      const tierEffect = container.querySelector('.shadow-gray-400\\/50');
      expect(tierEffect).toBeInTheDocument();
    });

    it('should apply R tier-specific styling', () => {
      const result = createMockResult('R');
      const { container } = render(<ResultDisplay result={result} />);
      
      // Check for copper radiance effect (shadow-orange-500/50)
      const tierEffect = container.querySelector('.shadow-orange-500\\/50');
      expect(tierEffect).toBeInTheDocument();
    });

    it('should apply เกลือ tier-specific styling', () => {
      const result = createMockResult('เกลือ');
      const { container } = render(<ResultDisplay result={result} />);
      
      // Check for dark radiance effect (shadow-gray-800/50)
      const tierEffect = container.querySelector('.shadow-gray-800\\/50');
      expect(tierEffect).toBeInTheDocument();
    });
  });
});
