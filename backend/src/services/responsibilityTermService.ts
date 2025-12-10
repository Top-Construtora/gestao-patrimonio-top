import { supabase, STORAGE_BUCKET } from '../config/supabase';
import {
  DatabaseResponsibilityTerm,
  ResponsibilityTerm,
  CreateResponsibilityTermRequest,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// Transform database term to API format
const transformTerm = (db: DatabaseResponsibilityTerm): ResponsibilityTerm => ({
  id: db.id,
  equipmentId: db.equipment_id,
  responsiblePerson: db.responsible_person,
  responsibleEmail: db.responsible_email,
  responsiblePhone: db.responsible_phone,
  responsibleDepartment: db.responsible_department,
  termDate: db.term_date,
  observations: db.observations,
  pdfUrl: db.pdf_url,
  status: db.status,
  manualSignature: db.manual_signature,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

// Create history entry
const createHistoryEntry = async (
  equipmentId: string,
  userName: string,
  changeType: string,
  field?: string,
  oldValue?: string,
  newValue?: string
) => {
  await supabase.from('history_entries').insert({
    equipment_id: equipmentId,
    entity_type: 'responsibility_term',
    entity_id: equipmentId,
    user_name: userName,
    change_type: changeType,
    field,
    old_value: oldValue,
    new_value: newValue,
  });
};

export const responsibilityTermService = {
  // Get all terms for an equipment
  async getByEquipment(equipmentId: string): Promise<ResponsibilityTerm[]> {
    const { data, error } = await supabase
      .from('responsibility_terms')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(transformTerm);
  },

  // Get term by ID
  async getById(id: string): Promise<ResponsibilityTerm | null> {
    const { data, error } = await supabase
      .from('responsibility_terms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return transformTerm(data);
  },

  // Create term with optional PDF
  async create(req: CreateResponsibilityTermRequest): Promise<ResponsibilityTerm> {
    let pdfUrl: string | null = null;

    // If PDF base64 provided, upload it
    if (req.pdfBase64) {
      const pdfBuffer = Buffer.from(req.pdfBase64, 'base64');
      const fileName = `termo_${req.equipmentId}_${Date.now()}.pdf`;
      const filePath = `terms/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      pdfUrl = urlData.publicUrl;

      // Create attachment record
      await supabase.from('attachments').insert({
        equipment_id: req.equipmentId,
        name: fileName,
        size: pdfBuffer.length,
        type: 'application/pdf',
        file_path: filePath,
        uploaded_by: req.userName,
      });
    }

    const { data, error } = await supabase
      .from('responsibility_terms')
      .insert({
        equipment_id: req.equipmentId,
        responsible_person: req.responsiblePerson,
        responsible_email: req.responsibleEmail,
        responsible_phone: req.responsiblePhone,
        responsible_department: req.responsibleDepartment,
        term_date: req.termDate,
        observations: req.observations || null,
        manual_signature: req.manualSignature || null,
        pdf_url: pdfUrl,
        status: 'signed',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(
      req.equipmentId,
      req.userName,
      'criou',
      'termo de responsabilidade',
      '',
      req.responsiblePerson
    );

    return transformTerm(data);
  },

  // Update term status
  async updateStatus(
    id: string,
    status: 'draft' | 'sent' | 'signed' | 'cancelled',
    userName: string
  ): Promise<ResponsibilityTerm> {
    const { data: current } = await supabase
      .from('responsibility_terms')
      .select('equipment_id, status')
      .eq('id', id)
      .single();

    if (!current) throw new Error('Term not found');

    const { data, error } = await supabase
      .from('responsibility_terms')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(
      current.equipment_id,
      userName,
      'alterou status',
      'status do termo',
      current.status,
      status
    );

    return transformTerm(data);
  },

  // Delete term
  async delete(id: string, userName: string): Promise<void> {
    const { data: term } = await supabase
      .from('responsibility_terms')
      .select('equipment_id, pdf_url')
      .eq('id', id)
      .single();

    if (!term) throw new Error('Term not found');

    // Delete PDF from storage if exists
    if (term.pdf_url) {
      const urlParts = term.pdf_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `terms/${fileName}`;
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    }

    const { error } = await supabase.from('responsibility_terms').delete().eq('id', id);

    if (error) throw new Error(error.message);

    await createHistoryEntry(
      term.equipment_id,
      userName,
      'excluiu',
      'termo de responsabilidade',
      '',
      ''
    );
  },
};
