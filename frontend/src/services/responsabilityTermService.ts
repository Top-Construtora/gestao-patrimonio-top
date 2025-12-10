import apiClient from './apiClient';
import { ResponsibilityTerm } from '../types';

// API response types
interface ApiResponsibilityTerm {
  id: string;
  equipmentId: string;
  responsiblePerson: string;
  responsibleEmail: string;
  responsiblePhone: string;
  responsibleDepartment: string;
  termDate: string;
  observations: string | null;
  pdfUrl: string | null;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  manualSignature: string | null;
  createdAt: string;
  updatedAt: string;
}

// Transform API term to frontend format
const transformTerm = (api: ApiResponsibilityTerm): ResponsibilityTerm => ({
  id: api.id,
  equipmentId: api.equipmentId,
  responsiblePerson: api.responsiblePerson,
  responsibleEmail: api.responsibleEmail,
  responsiblePhone: api.responsiblePhone,
  responsibleDepartment: api.responsibleDepartment,
  termDate: api.termDate,
  status: api.status,
  observations: api.observations || undefined,
  manualSignature: api.manualSignature || undefined,
  pdfUrl: api.pdfUrl || undefined,
});

class ResponsibilityTermService {
  // Create term
  async createTerm(termData: Omit<ResponsibilityTerm, 'id'>): Promise<ResponsibilityTerm> {
    const response = await apiClient.post<ApiResponsibilityTerm>('/responsibility-terms', {
      equipmentId: termData.equipmentId,
      responsiblePerson: termData.responsiblePerson,
      responsibleEmail: termData.responsibleEmail,
      responsiblePhone: termData.responsiblePhone,
      responsibleDepartment: termData.responsibleDepartment,
      termDate: termData.termDate,
      observations: termData.observations,
      manualSignature: termData.manualSignature,
      userName: termData.responsiblePerson,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create term');
    }

    return transformTerm(response.data);
  }

  // Get terms by equipment
  async getTermsByEquipment(equipmentId: string): Promise<ResponsibilityTerm[]> {
    const response = await apiClient.get<ApiResponsibilityTerm[]>(
      `/responsibility-terms/equipment/${equipmentId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get terms');
    }

    return response.data.map(transformTerm);
  }

  // Create term with PDF attachment
  async createTermWithAttachment(
    termData: Omit<ResponsibilityTerm, 'id'>,
    pdfBase64: string
  ): Promise<ResponsibilityTerm> {
    const response = await apiClient.post<ApiResponsibilityTerm>('/responsibility-terms', {
      equipmentId: termData.equipmentId,
      responsiblePerson: termData.responsiblePerson,
      responsibleEmail: termData.responsibleEmail,
      responsiblePhone: termData.responsiblePhone,
      responsibleDepartment: termData.responsibleDepartment,
      termDate: termData.termDate,
      observations: termData.observations,
      manualSignature: termData.manualSignature,
      pdfBase64,
      userName: termData.responsiblePerson,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create term with attachment');
    }

    return transformTerm(response.data);
  }

  // Update term status
  async updateTermStatus(
    id: string,
    status: 'draft' | 'sent' | 'signed' | 'cancelled',
    userName: string
  ): Promise<ResponsibilityTerm> {
    const response = await apiClient.patch<ApiResponsibilityTerm>(
      `/responsibility-terms/${id}/status`,
      { status, userName }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update term status');
    }

    return transformTerm(response.data);
  }

  // Delete term
  async deleteTerm(id: string, userName: string): Promise<void> {
    const response = await apiClient.delete(`/responsibility-terms/${id}`, { userName });
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete term');
    }
  }
}

// Export singleton instance
export const responsibilityTermService = new ResponsibilityTermService();
export default ResponsibilityTermService;
