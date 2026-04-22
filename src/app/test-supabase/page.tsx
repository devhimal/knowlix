"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('Connecting to Supabase...');

  useEffect(() => {
    async function checkConnection() {
      try {
        // Attempt to fetch from the resources table
        const { data, error } = await supabase.from('resources').select('id').limit(1);
        
        if (error) {
          setStatus('error');
          setMessage(`Connection failed: ${error.message}. Ensure you have created the 'resources' table.`);
        } else {
          setStatus('success');
          setMessage('Successfully connected to Supabase!');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(`Error: ${err.message}`);
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="p-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className={`p-4 rounded-lg inline-block ${
        status === 'testing' ? 'bg-blue-100 text-blue-700' :
        status === 'success' ? 'bg-green-100 text-green-700' :
        'bg-red-100 text-red-700'
      }`}>
        {message}
      </div>
      <div className="mt-8 text-sm text-gray-500">
        <p>If you see an error about "API key not found", check your .env.local file.</p>
        <p>If you see an error about "relation not found", check if you ran the SQL scripts.</p>
      </div>
    </div>
  );
}
