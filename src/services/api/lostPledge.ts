import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { LostPledgeFormData } from '@/schemas/lost-pledge-schema';

export interface LostPledgeSubmissionResponse {
  reportId: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  estimatedProcessingTime: string;
  referenceNumber: string;
  requiredDocuments: string[];
}

export interface LostPledgeStatusResponse {
  reportId: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  submittedAt: string;
  lastUpdated: string;
  progress: {
    submitted: boolean;
    documentsVerified: boolean;
    approved: boolean;
    completed: boolean;
  };
  notes?: string;
}

export class LostPledgeService {
  /**
   * Submit a lost pledge report
   */
  async submitReport(
    reportData: LostPledgeFormData
  ): Promise<LostPledgeSubmissionResponse> {
    const response = await apiClient.post<
      ApiResponse<LostPledgeSubmissionResponse>
    >('/lost-pledge/submit', reportData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to submit lost pledge report');
    }

    return response.data;
  }

  /**
   * Get status of a lost pledge report
   */
  async getReportStatus(reportId: string): Promise<LostPledgeStatusResponse> {
    const response = await apiClient.get<ApiResponse<LostPledgeStatusResponse>>(
      `/lost-pledge/status/${reportId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get report status');
    }

    return response.data;
  }

  /**
   * Get all lost pledge reports for current user
   */
  async getUserReports(): Promise<LostPledgeStatusResponse[]> {
    const response = await apiClient.get<
      ApiResponse<LostPledgeStatusResponse[]>
    >('/lost-pledge/reports');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user reports');
    }

    return response.data;
  }

  /**
   * Update a lost pledge report (if still in draft/submitted status)
   */
  async updateReport(
    reportId: string,
    reportData: Partial<LostPledgeFormData>
  ): Promise<LostPledgeStatusResponse> {
    const response = await apiClient.put<ApiResponse<LostPledgeStatusResponse>>(
      `/lost-pledge/reports/${reportId}`,
      reportData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update report');
    }

    return response.data;
  }

  /**
   * Cancel a lost pledge report (if allowed)
   */
  async cancelReport(
    reportId: string,
    reason: string
  ): Promise<{ success: boolean }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      `/lost-pledge/reports/${reportId}/cancel`,
      { reason }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to cancel report');
    }

    return response.data;
  }

  /**
   * Get required documents for specific circumstances
   */
  getRequiredDocuments(circumstances: string): string[] {
    switch (circumstances) {
      case 'stolen':
        return [
          'Police Report (mandatory)',
          'Original receipt (if available)',
          'Photo identification',
        ];
      case 'lost':
        return [
          'Statutory Declaration',
          'Original receipt (if available)',
          'Photo identification',
        ];
      case 'damaged':
        return [
          'Photos of damage',
          'Incident report (if applicable)',
          'Original receipt',
        ];
      case 'destroyed':
        return [
          'Evidence of destruction',
          'Insurance report (if applicable)',
          'Original receipt',
        ];
      default:
        return [
          'Supporting documentation',
          'Original receipt (if available)',
          'Photo identification',
        ];
    }
  }

  /**
   * Validate report before submission
   */
  validateReport(reportData: LostPledgeFormData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!reportData.selectedTickets || reportData.selectedTickets.length === 0) {
      errors.push('At least one ticket must be selected');
    }

    if (!reportData.lossDescription || reportData.lossDescription.length < 20) {
      errors.push('Loss description must be at least 20 characters');
    }

    if (reportData.lossCircumstances === 'stolen') {
      if (!reportData.policeReportNumber) {
        errors.push('Police report number is required for stolen items');
      }
      if (!reportData.policeStation) {
        errors.push('Police station is required for stolen items');
      }
    }

    if (reportData.hasInsurance && !reportData.insuranceCompany) {
      errors.push('Insurance company details are required when claiming insurance');
    }

    if (reportData.supportingDocuments.length === 0) {
      warnings.push('At least one supporting document is recommended');
    }

    // Priority level validation
    if (reportData.priority === 'high' || reportData.priority === 'urgent') {
      if (!reportData.supervisorCode) {
        errors.push('Supervisor approval is required for high priority reports');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate estimated processing time
   */
  getEstimatedProcessingTime(
    circumstances: string,
    priority: string,
    hasCompleteDocumentation: boolean
  ): string {
    if (!hasCompleteDocumentation) {
      return '5-10 business days (pending documentation)';
    }

    switch (priority) {
      case 'urgent':
        return '1-2 business days';
      case 'high':
        return '2-3 business days';
      case 'medium':
        return circumstances === 'stolen' ? '3-5 business days' : '2-4 business days';
      case 'low':
      default:
        return '5-7 business days';
    }
  }
}

export const lostPledgeService = new LostPledgeService();