import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SignOut from '@/components/SignOut';

export default async function Nav() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let username = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();
    username = data?.username;
  }
  return (
    <nav className="nav">
      <Link href="/" className="logo"><span className="lens" />aperture</Link>
      <div className="links">
        <Link href="/#gallery">Gallery</Link>
        <Link href="/?tab=following#gallery">Following</Link>
      </div>
      <div className="acct">
        {user ? (<><span className="who">{username}</span><SignOut /></>) : (<Link href="/login" className="btn pri sm">Log in →</Link>)}
      </div>
    </nav>
  );
}
