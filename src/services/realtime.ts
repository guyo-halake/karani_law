import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type RealtimeTable =
  | 'clients'
  | 'matters'
  | 'fee_notes'
  | 'documents'
  | 'messages'
  | 'notifications'
  | 'activity_logs';

export interface RealtimeChange {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}

export type RealtimeChangeHandler = (change: RealtimeChange) => void;

const subscribe = (
  channelName: string,
  table: RealtimeTable,
  filter: string,
  onChange: RealtimeChangeHandler
): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter },
      payload => onChange(payload as unknown as RealtimeChange)
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};

export const subscribeToFirmTable = (
  firmId: string,
  table: RealtimeTable,
  onChange: RealtimeChangeHandler
): (() => void) => subscribe(`firm:${firmId}:${table}`, table, `firm_id=eq.${firmId}`, onChange);

export const subscribeToUserNotifications = (
  userId: string,
  onChange: RealtimeChangeHandler
): (() => void) => subscribe(`user:${userId}:notifications`, 'notifications', `user_id=eq.${userId}`, onChange);