import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

const BRAIN_GYM_LOCAL_KEY = 'edubite.braingym.v1';

export async function deleteMyEdubiteAccount(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.rpc('edubite_delete_my_account');
  if (error) {
    return { ok: false, error: error.message };
  }
  try {
    await AsyncStorage.removeItem(`${BRAIN_GYM_LOCAL_KEY}:user:${userId}`);
  } catch {
    /* local cache is optional after the server delete */
  }
  return { ok: true };
}
