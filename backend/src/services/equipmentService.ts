import { supabase, STORAGE_BUCKET } from '../config/supabase';
import {
  DatabaseEquipment,
  DatabaseAttachment,
  Equipment,
  Attachment,
  CreateEquipmentRequest,
  UpdateEquipmentRequest,
  TransferEquipmentRequest,
  EquipmentStats,
} from '../types';

// Transform database equipment to API format
const transformEquipment = (db: DatabaseEquipment): Equipment => ({
  id: db.id,
  assetNumber: db.asset_number,
  description: db.description,
  brand: db.brand,
  model: db.model,
  specs: db.specs,
  status: db.status,
  location: db.location,
  responsible: db.responsible,
  acquisitionDate: db.acquisition_date,
  invoiceDate: db.invoice_date,
  value: db.value,
  maintenanceDescription: db.maintenance_description,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

// Transform attachment to API format
const transformAttachment = (db: DatabaseAttachment): Attachment => {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(db.file_path);
  return {
    id: db.id,
    equipmentId: db.equipment_id,
    name: db.name,
    size: db.size,
    type: db.type,
    filePath: db.file_path,
    url: data.publicUrl,
    uploadedBy: db.uploaded_by,
    uploadedAt: db.uploaded_at,
    createdAt: db.created_at,
  };
};

// Create history entry
const createHistoryEntry = async (
  equipmentId: string | null,
  userName: string,
  changeType: string,
  field?: string,
  oldValue?: string,
  newValue?: string
) => {
  await supabase.from('history_entries').insert({
    equipment_id: equipmentId,
    entity_type: 'equipment',
    entity_id: equipmentId,
    user_name: userName,
    change_type: changeType,
    field,
    old_value: oldValue,
    new_value: newValue,
  });
};

export const equipmentService = {
  // Get all equipment
  async getAll(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(transformEquipment);
  },

  // Get equipment by ID with attachments
  async getById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    const equipment = transformEquipment(data);

    // Get attachments
    const { data: attachments } = await supabase
      .from('attachments')
      .select('*')
      .eq('equipment_id', id);

    equipment.attachments = (attachments || []).map(transformAttachment);

    return equipment;
  },

  // Get next asset number
  async getNextAssetNumber(): Promise<string> {
    const { data } = await supabase
      .from('equipments')
      .select('asset_number')
      .order('asset_number', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return 'TOP-0001';

    const lastNumber = data[0].asset_number;
    const match = lastNumber.match(/TOP-(\d+)/);
    if (!match) return 'TOP-0001';

    const nextNumber = parseInt(match[1], 10) + 1;
    return `TOP-${nextNumber.toString().padStart(4, '0')}`;
  },

  // Get equipment statistics
  async getStats(): Promise<EquipmentStats> {
    const { data, error } = await supabase.from('equipments').select('status, value');

    if (error) throw new Error(error.message);

    const stats: EquipmentStats = {
      total: data?.length || 0,
      active: 0,
      maintenance: 0,
      inactive: 0,
      totalValue: 0,
    };

    data?.forEach((eq) => {
      stats.totalValue += Number(eq.value) || 0;
      if (eq.status === 'ativo') stats.active++;
      else if (eq.status === 'manutenção') stats.maintenance++;
      else if (eq.status === 'desativado') stats.inactive++;
    });

    return stats;
  },

  // Create equipment
  async create(req: CreateEquipmentRequest): Promise<Equipment> {
    const assetNumber = req.assetNumber || (await this.getNextAssetNumber());

    const { data, error } = await supabase
      .from('equipments')
      .insert({
        asset_number: assetNumber,
        description: req.description,
        brand: req.brand,
        model: req.model,
        specs: req.specs || null,
        status: req.status || 'ativo',
        location: req.location,
        responsible: req.responsible,
        acquisition_date: req.acquisitionDate,
        invoice_date: req.invoiceDate || null,
        value: req.value,
        maintenance_description: req.maintenanceDescription || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(data.id, req.userName, 'criou');

    return transformEquipment(data);
  },

  // Update equipment
  async update(id: string, req: UpdateEquipmentRequest): Promise<Equipment> {
    // Get current equipment for history
    const { data: current } = await supabase
      .from('equipments')
      .select('*')
      .eq('id', id)
      .single();

    if (!current) throw new Error('Equipment not found');

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    // Build updates and track changes
    const changes: { field: string; oldValue: string; newValue: string }[] = [];

    if (req.description !== undefined && req.description !== current.description) {
      updates.description = req.description;
      changes.push({ field: 'descrição', oldValue: current.description, newValue: req.description });
    }
    if (req.brand !== undefined && req.brand !== current.brand) {
      updates.brand = req.brand;
      changes.push({ field: 'marca', oldValue: current.brand, newValue: req.brand });
    }
    if (req.model !== undefined && req.model !== current.model) {
      updates.model = req.model;
      changes.push({ field: 'modelo', oldValue: current.model, newValue: req.model });
    }
    if (req.specs !== undefined && req.specs !== current.specs) {
      updates.specs = req.specs;
      changes.push({ field: 'especificações', oldValue: current.specs || '', newValue: req.specs || '' });
    }
    if (req.status !== undefined && req.status !== current.status) {
      updates.status = req.status;
      changes.push({ field: 'status', oldValue: current.status, newValue: req.status });
    }
    if (req.location !== undefined && req.location !== current.location) {
      updates.location = req.location;
      changes.push({ field: 'localização', oldValue: current.location, newValue: req.location });
    }
    if (req.responsible !== undefined && req.responsible !== current.responsible) {
      updates.responsible = req.responsible;
      changes.push({ field: 'responsável', oldValue: current.responsible, newValue: req.responsible });
    }
    if (req.acquisitionDate !== undefined && req.acquisitionDate !== current.acquisition_date) {
      updates.acquisition_date = req.acquisitionDate;
      changes.push({ field: 'data de aquisição', oldValue: current.acquisition_date, newValue: req.acquisitionDate });
    }
    if (req.invoiceDate !== undefined && req.invoiceDate !== current.invoice_date) {
      updates.invoice_date = req.invoiceDate;
      changes.push({ field: 'data da nota fiscal', oldValue: current.invoice_date || '', newValue: req.invoiceDate || '' });
    }
    if (req.value !== undefined && req.value !== current.value) {
      updates.value = req.value;
      changes.push({ field: 'valor', oldValue: String(current.value), newValue: String(req.value) });
    }
    if (req.maintenanceDescription !== undefined && req.maintenanceDescription !== current.maintenance_description) {
      updates.maintenance_description = req.maintenanceDescription;
      changes.push({ field: 'descrição de manutenção', oldValue: current.maintenance_description || '', newValue: req.maintenanceDescription || '' });
    }

    const { data, error } = await supabase
      .from('equipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Create history entries for each change
    for (const change of changes) {
      await createHistoryEntry(id, req.userName, 'editou', change.field, change.oldValue, change.newValue);
    }

    return transformEquipment(data);
  },

  // Delete equipment
  async delete(id: string, userName: string): Promise<void> {
    // Delete attachments from storage
    const { data: attachments } = await supabase
      .from('attachments')
      .select('file_path')
      .eq('equipment_id', id);

    if (attachments && attachments.length > 0) {
      const filePaths = attachments.map((a) => a.file_path);
      await supabase.storage.from(STORAGE_BUCKET).remove(filePaths);
    }

    // Delete related records
    await supabase.from('attachments').delete().eq('equipment_id', id);
    await supabase.from('responsibility_terms').delete().eq('equipment_id', id);
    await supabase.from('history_entries').delete().eq('equipment_id', id);

    // Get equipment info for history
    const { data: equipment } = await supabase
      .from('equipments')
      .select('asset_number, description')
      .eq('id', id)
      .single();

    // Delete equipment
    const { error } = await supabase.from('equipments').delete().eq('id', id);

    if (error) throw new Error(error.message);

    // Create history entry
    await createHistoryEntry(
      null,
      userName,
      'excluiu',
      'equipamento',
      equipment ? `${equipment.asset_number} - ${equipment.description}` : id,
      ''
    );
  },

  // Transfer equipment
  async transfer(id: string, req: TransferEquipmentRequest): Promise<Equipment> {
    const { data: current } = await supabase
      .from('equipments')
      .select('location, responsible')
      .eq('id', id)
      .single();

    if (!current) throw new Error('Equipment not found');

    const { data, error } = await supabase
      .from('equipments')
      .update({
        location: req.location,
        responsible: req.responsible,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Create history entries
    if (current.location !== req.location) {
      await createHistoryEntry(id, req.userName, 'editou', 'localização', current.location, req.location);
    }
    if (current.responsible !== req.responsible) {
      await createHistoryEntry(id, req.userName, 'editou', 'responsável', current.responsible, req.responsible);
    }

    return transformEquipment(data);
  },

  // Register maintenance
  async registerMaintenance(id: string, description: string, userName: string): Promise<Equipment> {
    const { data, error } = await supabase
      .from('equipments')
      .update({
        status: 'manutenção',
        maintenance_description: description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(id, userName, 'manutenção', 'descrição', '', description);

    return transformEquipment(data);
  },

  // Get equipment history
  async getHistory(equipmentId: string) {
    const { data, error } = await supabase
      .from('history_entries')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('timestamp', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((h) => ({
      id: h.id,
      equipmentId: h.equipment_id,
      entityType: h.entity_type,
      entityId: h.entity_id,
      userName: h.user_name,
      changeType: h.change_type,
      field: h.field,
      oldValue: h.old_value,
      newValue: h.new_value,
      timestamp: h.timestamp,
      createdAt: h.created_at,
    }));
  },

  // Get attachments
  async getAttachments(equipmentId: string): Promise<Attachment[]> {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('equipment_id', equipmentId);

    if (error) throw new Error(error.message);

    return (data || []).map(transformAttachment);
  },

  // Upload attachment
  async uploadAttachment(
    equipmentId: string,
    file: Express.Multer.File,
    userName: string
  ): Promise<Attachment> {
    const filePath = `attachments/${equipmentId}_${Date.now()}_${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data, error } = await supabase
      .from('attachments')
      .insert({
        equipment_id: equipmentId,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        file_path: filePath,
        uploaded_by: userName,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(equipmentId, userName, 'anexou arquivo', 'arquivo', '', file.originalname);

    return transformAttachment(data);
  },

  // Delete attachment
  async deleteAttachment(attachmentId: string, userName: string): Promise<void> {
    const { data: attachment } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (!attachment) throw new Error('Attachment not found');

    await supabase.storage.from(STORAGE_BUCKET).remove([attachment.file_path]);

    const { error } = await supabase.from('attachments').delete().eq('id', attachmentId);

    if (error) throw new Error(error.message);

    await createHistoryEntry(
      attachment.equipment_id,
      userName,
      'removeu arquivo',
      'arquivo',
      attachment.name,
      ''
    );
  },
};
