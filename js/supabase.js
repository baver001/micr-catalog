
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ymxcxqxohgyhyatnkpmg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlteGN4cXhvaGd5aHlhdG5rcG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDYwMjMsImV4cCI6MjA4MTM4MjAyM30.uuQjMXyd3Sp4tFNY7lDD_Iq94C_JgTPbhyjUMfE3B0o'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helpers
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}

// Get all published apps
export async function getApps() {
    console.log('Supabase: Fetching apps...');
    const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('status', 'published')
        .order('views', { ascending: false });

    if (error) {
        console.error('Error fetching apps:', error);
        return [];
    }
    console.log('Supabase: Apps fetched:', data);
    return data;
}

// Increment view count
export async function incrementViews(appId) {
    // We need an RPC function for atomic increment, or we just do a read-update-write (less safe but okay for now)
    // Or we create the RPC function.
    // For now let's just ignore view/increments or try to use a simple update if we have policies.
    // Since we only enabled select for anon, update will fail.
    // I need to create the RPC function 'increment_views'.

    /*
    create or replace function increment_views(app_id uuid)
    returns void as $$
    begin
      update apps
      set views = views + 1
      where id = app_id;
    end;
    $$ language plpgsql security definer;
    */

    const { error } = await supabase.rpc('increment_views', { app_id: appId });
    if (error) console.error('Error incrementing views:', error);
}

// Submit an app
export async function submitApp(submission) {
    const { data, error } = await supabase
        .from('submissions')
        .insert([submission])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Get all submissions
export async function getSubmissions() {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

    if (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }
    return data;
}

// Update submission status
export async function updateSubmissionStatus(id, status) {
    const { data, error } = await supabase
        .from('submissions')
        .update({ status: status, reviewed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Delete submission
export async function deleteSubmission(id) {
    const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}
