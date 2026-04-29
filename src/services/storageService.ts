import { supabase } from './supabase'

export const storageService = {

  uploadCourseCover: async (file: File): Promise<string> => {
    try {

      // 1. Get session — same as interceptor logic
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        localStorage.setItem('session_expired', 'true');
        window.location.href = '/auth/login';
        throw new Error('Not authenticated');
      }

      // 2. Try refresh if session exists but token expired
      if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !refreshData.session) {
          localStorage.setItem('session_expired', 'true');
          window.location.href = '/auth/login';
          throw new Error('Session expired');
        }
      }

      // 3. Build file path
      const ext = file.name.split('.').pop();
      const path = `covers/${crypto.randomUUID()}.${ext}`;

      // 4. Upload — supabase client auto uses active session
      // No need to pass Authorization header manually
      // supabase client handles it internally ✅
      const { error: uploadError } = await supabase.storage
        .from('course-covers')
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      // 5. Get public URL
      const { data } = supabase.storage
        .from('course-covers')
        .getPublicUrl(path);

      return data.publicUrl;

    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  deleteCourseCover: async (path: string): Promise<void> => {
    const { error } = await supabase.storage
      .from('course-covers')
      .remove([path])

    if (error) throw new Error(error.message)
  },

}
