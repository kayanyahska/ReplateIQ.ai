import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeCarbonFootprint } from '../../services/geminiService';

// Mock the Google GenAI SDK
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            apiKey: any;
            constructor(config: any) {
                this.apiKey = config.apiKey;
            }
            get models() {
                return {
                    generateContent: mockGenerateContent
                };
            }
        },
        Type: { OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', ARRAY: 'ARRAY', BOOLEAN: 'BOOLEAN' }
    };
});

describe('Gemini Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should parse valid AI response correctly', async () => {
        // Mock success response
        mockGenerateContent.mockResolvedValue({
            text: JSON.stringify({
                dishName: 'Pasta',
                quantity: 2,
                scenarios: [],
                recommendation: 'Eat it',
                impactSummary: 'Low impact'
            })
        });

        const result = await analyzeCarbonFootprint('Pasta', 2, 'Home');

        expect(mockGenerateContent).toHaveBeenCalled();
        expect(result.dishName).toBe('Pasta');
        expect(result.recommendation).toBe('Eat it');
    });

    it('should throw error when AI returns empty response', async () => {
        // Mock empty response
        mockGenerateContent.mockResolvedValue({ text: '' });

        await expect(analyzeCarbonFootprint('Pasta', 2, 'Home'))
            .rejects
            .toThrow('Failed to analyze carbon footprint.');
    });
});
