interface OCRResponse {
  ParsedResults: {
    TextOverlay: {
      Lines: {
        LineText: string;
        Words: {
          WordText: string;
          Left: number;
          Top: number;
          Height: number;
          Width: number;
        }[];
      }[];
    };
    ParsedText: string;
  }[];
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string;
}

class OCRService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OCR_API_KEY || '30a87186a0d26670b6e9558515b25f';
    this.apiUrl = import.meta.env.VITE_OCR_API_URL || 'https://api.ocr.space/parse/image';
  }

  async processImage(imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('apikey', this.apiKey);
    formData.append('language', 'chs'); // Chinese Simplified
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 is better for Asian languages

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status}`);
      }

      const data: OCRResponse = await response.json();

      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage || 'OCR processing failed');
      }

      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        throw new Error('No text found in image');
      }

      return data.ParsedResults[0].ParsedText || '';
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('Failed to process image with OCR');
    }
  }
}

export const ocrService = new OCRService();