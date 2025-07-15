import { apiClient } from './client';
import type {
  ApiResponse,
  PrintDocumentRequest,
  PrintDocumentResponse,
  ReprintLostLetterRequest,
  FileUploadResponse,
} from '@/types/api';

export class DocumentService {
  /**
   * Print a document
   */
  async printDocument(
    request: PrintDocumentRequest
  ): Promise<PrintDocumentResponse> {
    const response = await apiClient.post<ApiResponse<PrintDocumentResponse>>(
      '/documents/print',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Print request failed');
    }

    return response.data;
  }

  /**
   * Reprint a lost letter
   */
  async reprintLostLetter(
    request: ReprintLostLetterRequest
  ): Promise<PrintDocumentResponse & { documentUrl: string }> {
    const response = await apiClient.post<
      ApiResponse<PrintDocumentResponse & { documentUrl: string }>
    >('/documents/reprint-lost-letter', request);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Reprint request failed');
    }

    return response.data;
  }

  /**
   * Get print job status
   */
  async getPrintStatus(printJobId: string): Promise<{
    printJobId: string;
    status: 'queued' | 'printing' | 'completed' | 'failed';
    error?: string;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        printJobId: string;
        status: 'queued' | 'printing' | 'completed' | 'failed';
        error?: string;
      }>
    >(`/documents/print-status/${printJobId}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get print status');
    }

    return response.data;
  }

  /**
   * Upload a file
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<FileUploadResponse>>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'File upload failed');
    }

    return response.data;
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[]): Promise<FileUploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed',
      };
    }

    return { isValid: true };
  }

  /**
   * Get document download URL
   */
  getDocumentUrl(documentId: string): string {
    return `${apiClient}/documents/${documentId}/download`;
  }
}

export const documentService = new DocumentService();