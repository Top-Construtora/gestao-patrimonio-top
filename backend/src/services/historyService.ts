import { supabase } from '../config/supabase';
import { HistoryEntry } from '../types';

// Transform database history to API format
const transformHistory = (db: Record<string, unknown>): HistoryEntry => ({
  id: db.id as string,
  equipmentId: db.equipment_id as string | null,
  entityType: db.entity_type as string,
  entityId: db.entity_id as string | null,
  userName: db.user_name as string,
  changeType: db.change_type as string,
  field: db.field as string | null,
  oldValue: db.old_value as string | null,
  newValue: db.new_value as string | null,
  timestamp: db.timestamp as string,
  createdAt: db.created_at as string,
});

export const historyService = {
  // Get recent activities
  async getRecent(limit: number = 10): Promise<HistoryEntry[]> {
    const { data, error } = await supabase
      .from('history_entries')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data || []).map(transformHistory);
  },

  // Get all history
  async getAll(): Promise<HistoryEntry[]> {
    const { data, error } = await supabase
      .from('history_entries')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(transformHistory);
  },

  // Get history by equipment
  async getByEquipment(equipmentId: string): Promise<HistoryEntry[]> {
    const { data, error } = await supabase
      .from('history_entries')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('timestamp', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(transformHistory);
  },

  // Get history by entity type
  async getByEntityType(entityType: string): Promise<HistoryEntry[]> {
    const { data, error } = await supabase
      .from('history_entries')
      .select('*')
      .eq('entity_type', entityType)
      .order('timestamp', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(transformHistory);
  },

  // Create history entry
  async create(entry: {
    equipmentId?: string;
    entityType: string;
    entityId?: string;
    userName: string;
    changeType: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
  }): Promise<HistoryEntry> {
    const { data, error } = await supabase
      .from('history_entries')
      .insert({
        equipment_id: entry.equipmentId || null,
        entity_type: entry.entityType,
        entity_id: entry.entityId || null,
        user_name: entry.userName,
        change_type: entry.changeType,
        field: entry.field || null,
        old_value: entry.oldValue || null,
        new_value: entry.newValue || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return transformHistory(data);
  },
};
