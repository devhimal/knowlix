import { createBrowserClient } from '@supabase/ssr'; 


// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase URL or Anon Key. Please check your environment variables in .env.local');
}

const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true, 
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    
    cookies: {
      get(name: string) {
        if (typeof document !== 'undefined') { // Check if running in browser
          const cookie = document.cookie.split(';').find(row => row.trim().startsWith(`${name}=`));
          if (!cookie) return undefined;
          return decodeURIComponent(cookie.trim().split('=')[1]);
        }
        return undefined; 
      },
      set(name: string, value: string, options: any) {
        if (typeof document !== 'undefined') { 
          document.cookie = `${name}=${value}; Max-Age=${options.maxAge}; Path=${options.path || '/'}; ${options.domain ? `Domain=${options.domain};` : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`;
        }
      },
      remove(name: string, options: any) {
        if (typeof document !== 'undefined') { 
          document.cookie = `${name}=; Max-Age=0; Path=${options.path || '/'}; ${options.domain ? `Domain=${options.domain};` : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`;
        }
      }
      },
  }
);


export async function getDownloadUrl(filePath: string, fileName: string, expiresIn: number = 60): Promise<string | null> {
  
  
  
  
  
  
  

  
  
  
  

  
  
  

  
  
  
  

  
  
  
  

  
  
  
  

  
  
  
  
  const bucketName = 'resource_files';
  const urlParts = filePath.split(`/${bucketName}/`);
  let internalBucketPath = filePath;
  if (urlParts.length > 1) {
    internalBucketPath = urlParts[1];
  } else {
    
    
    
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
