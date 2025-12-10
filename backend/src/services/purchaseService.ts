import { supabase } from '../config/supabase';
import {
  DatabasePurchase,
  Purchase,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
} from '../types';

// Transform database purchase to API format
const transformPurchase = (db: DatabasePurchase): Purchase => ({
  id: db.id,
  description: db.description,
  brand: db.brand,
  model: db.model,
  specifications: db.specifications,
  location: db.location,
  urgency: db.urgency,
  status: db.status,
  requestedBy: db.requested_by,
  requestDate: db.request_date,
  expectedDate: db.expected_date,
  supplier: db.supplier,
  observations: db.observations,
  approvedBy: db.approved_by,
  approvalDate: db.approval_date,
  rejectionReason: db.rejection_reason,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

// Create history entry for purchases
const createHistoryEntry = async (
  purchaseId: string,
  userName: string,
  changeType: string,
  field?: string,
  oldValue?: string,
  newValue?: string
) => {
  await supabase.from('history_entries').insert({
    equipment_id: null,
    entity_type: 'purchase',
    entity_id: purchaseId,
    user_name: userName,
    change_type: changeType,
    field,
    old_value: oldValue,
    new_value: newValue,
  });
};

export const purchaseService = {
  // Get all purchases
  async getAll(): Promise<Purchase[]> {
    const { data, error } = await supabase
      .from('equipment_purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(transformPurchase);
  },

  // Get purchase by ID
  async getById(id: string): Promise<Purchase | null> {
    const { data, error } = await supabase
      .from('equipment_purchases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return transformPurchase(data);
  },

  // Create purchase
  async create(req: CreatePurchaseRequest): Promise<Purchase> {
    const { data, error } = await supabase
      .from('equipment_purchases')
      .insert({
        description: req.description,
        brand: req.brand || null,
        model: req.model || null,
        specifications: req.specifications || null,
        location: req.location || null,
        urgency: req.urgency,
        status: 'pendente',
        requested_by: req.requestedBy,
        request_date: req.requestDate,
        expected_date: req.expectedDate || null,
        supplier: req.supplier || null,
        observations: req.observations || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(data.id, req.userName, 'criou');

    return transformPurchase(data);
  },

  // Update purchase
  async update(id: string, req: UpdatePurchaseRequest): Promise<Purchase> {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (req.description !== undefined) updates.description = req.description;
    if (req.brand !== undefined) updates.brand = req.brand;
    if (req.model !== undefined) updates.model = req.model;
    if (req.specifications !== undefined) updates.specifications = req.specifications;
    if (req.location !== undefined) updates.location = req.location;
    if (req.urgency !== undefined) updates.urgency = req.urgency;
    if (req.expectedDate !== undefined) updates.expected_date = req.expectedDate;
    if (req.supplier !== undefined) updates.supplier = req.supplier;
    if (req.observations !== undefined) updates.observations = req.observations;

    const { data, error } = await supabase
      .from('equipment_purchases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(id, req.userName, 'editou');

    return transformPurchase(data);
  },

  // Delete purchase
  async delete(id: string, userName: string): Promise<void> {
    const { error } = await supabase.from('equipment_purchases').delete().eq('id', id);

    if (error) throw new Error(error.message);

    await createHistoryEntry(id, userName, 'excluiu');
  },

  // Approve purchase
  async approve(id: string, userName: string): Promise<Purchase> {
    const { data, error } = await supabase
      .from('equipment_purchases')
      .update({
        status: 'aprovado',
        approved_by: userName,
        approval_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(id, userName, 'alterou status', 'status', 'pendente', 'aprovado');

    return transformPurchase(data);
  },

  // Reject purchase
  async reject(id: string, reason: string, userName: string): Promise<Purchase> {
    const { data, error } = await supabase
      .from('equipment_purchases')
      .update({
        status: 'rejeitado',
        rejection_reason: reason,
        approved_by: userName,
        approval_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(id, userName, 'alterou status', 'status', 'pendente', 'rejeitado');

    return transformPurchase(data);
  },

  // Mark as acquired
  async markAsAcquired(id: string, userName: string): Promise<Purchase> {
    const { data, error } = await supabase
      .from('equipment_purchases')
      .update({
        status: 'adquirido',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await createHistoryEntry(id, userName, 'alterou status', 'status', 'aprovado', 'adquirido');

    return transformPurchase(data);
  },

  // Get purchase statistics
  async getStats() {
    const { data, error } = await supabase.from('equipment_purchases').select('status');

    if (error) throw new Error(error.message);

    return {
      total: data?.length || 0,
      pending: data?.filter((p) => p.status === 'pendente').length || 0,
      approved: data?.filter((p) => p.status === 'aprovado').length || 0,
      rejected: data?.filter((p) => p.status === 'rejeitado').length || 0,
      acquired: data?.filter((p) => p.status === 'adquirido').length || 0,
    };
  },
};
