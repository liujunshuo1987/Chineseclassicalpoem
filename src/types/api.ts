export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreditDeductionResult {
  success: boolean;
  transaction_id?: number;
  new_balance?: number;
  amount_deducted?: number;
  error?: string;
  message?: string;
  current_balance?: number;
  required?: number;
}

export interface OCRRequest {
  image: string;
}

export interface OCRResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface AnalysisRequest {
  text: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: any;
  error?: string;
}

export interface PoetryRequest {
  keywords: string;
  style: string;
}

export interface PoetryResponse {
  success: boolean;
  poetry?: {
    content: string;
    explanation?: string;
    style_analysis?: string;
  };
  error?: string;
}

export interface StripeCheckoutRequest {
  package_id: number;
}

export interface StripeCheckoutResponse {
  success: boolean;
  session_id?: string;
  url?: string;
  error?: string;
}
