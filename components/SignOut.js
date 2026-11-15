'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOut() {
  const router = useRouter();
  return (
    <button className="btn sm" onClick={async () => { await createClient().auth.signOut(); router.refresh(); }}>Log out</button>
  );
}
