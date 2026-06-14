import { createBrowserClient } from '@supabase/ssr'; // Use createBrowserClient

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Please check your environment variables.');
}

const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true, // This tells Supabase to store the session
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    // Add cookies object at the top-level options
    cookies: {
      get(name: string) {
        if (typeof document !== 'undefined') { // Check if running in browser
          return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];
        }
        return undefined; // Or handle as appropriate for server-side
      },
      set(name: string, value: string, options: any) {
        if (typeof document !== 'undefined') { // Check if running in browser
          document.cookie = `${name}=${value}; Max-Age=${options.maxAge}; Path=${options.path || '/'}; ${options.domain ? `Domain=${options.domain};` : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`;
        }
      },
      remove(name: string, options: any) {
        if (typeof document !== 'undefined') { // Check if running in browser
          document.cookie = `${name}=; Max-Age=0; Path=${options.path || '/'}; ${options.domain ? `Domain=${options.domain};` : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`;
        }
      }
      },
  }
);

/**
 * Generates a signed URL to force download a file from Supabase Storage.
 * @param filePath The full path to the file in the bucket (e.g., 'resources/user_id/file_name.pdf').
 * @param fileName The desired filename for the download (e.g., 'MyDocument.pdf').
 * @param expiresIn Number of seconds the signed URL is valid for (default: 60 seconds).
 * @returns A promise that resolves to the signed URL string, or null if an error occurs.
 */
export async function getDownloadUrl(filePath: string, fileName: string, expiresIn: number = 60): Promise<string | null> {
  // Extract bucket name from file_path if it's a full URL.
  // Assuming file_path is already relative to the bucket or public URL is handled
  // by getPublicUrl. Here, `filePath` is expected to be the path *within* the bucket.
  
  // Need to extract the path from the full public URL if that's what resource.file_path contains.
  // The structure expected by createSignedUrl is the path inside the bucket, e.g., 'public/filename.pdf'
  // The public URL looks like: https://[project_ref].supabase.co/storage/v1/object/public/[bucket_name]/[file_path_in_bucket]

  // Assuming resource.file_path is already the path within the 'resource_files' bucket.
  // If it's a full public URL, we need to extract the path portion.
  // Let's assume for now that resource.file_path directly provides the path needed by createSignedUrl.
  // If it's the full URL, the function will need to be adjusted.

  // The documentation usually implies createSignedUrl needs the path within the bucket.
  // From upload.page.tsx: `filePath = resources/${fileName}` which is the path *within* the bucket.
  // So, `resource.file_path` will likely be the full public URL, not the bucket path.

  // Let's refine the helper to extract the path from the full URL if needed.
  // Or, ideally, the `resource` object would store the internal bucket path.
  // For simplicity, let's assume `filePath` passed to `getDownloadUrl` is the path within the bucket.
  // If `resource.file_path` is the full public URL, we'll need to parse it.

  // Re-checking upload.page.tsx:
  // `publicUrl = publicUrlData.publicUrl;` (full public URL)
  // `file_path: publicUrl,` in resource insert.
  // So, `resource.file_path` IS the full public URL.

  // We need the internal path for createSignedUrl.
  // The internal path is usually derived from `filePath` used in upload, e.g., `resources/${fileName}`.
  // The `resource` object in the DB has `file_path` (full URL) and `file_name` (original name).
  // It does NOT store the internal bucket path directly.

  // To fix this, we need the internal bucket path.
  // This means the `resource` object also needs to store the internal `bucket_file_path`.
  // Let's assume the bucket name is `resource_files` and the internal path is everything after `resource_files/`.
  
  const bucketName = 'resource_files';
  const urlParts = filePath.split(`/${bucketName}/`);
  let internalBucketPath = filePath;
  if (urlParts.length > 1) {
    internalBucketPath = urlParts[1];
  } else {
    // If it's not a full URL, it might already be the internal path.
    // This needs careful checking based on how `resource.file_path` is formed.
    // For now, assuming if it's not a full URL, it's correct.
  }

  console.log('Attempting createSignedUrl for bucket:', bucketName, 'with internal path:', internalBucketPath);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(internalBucketPath, expiresIn, {
      download: fileName,
    });

  console.log('Result from createSignedUrl - Data:', data, 'Error:', error);

  if (error) {
    console.error('Error creating signed download URL:', error);
    return null;
  }
  console.log('Generated signed URL:', data?.signedUrl);
  return data?.signedUrl || null;
}


export default supabase;
