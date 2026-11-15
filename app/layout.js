import './globals.css';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SignOut from '@/components/SignOut';

export const metadata = { title: 'Aperture – Photography Community', description: 'Share your photography and get feedback from other photographers.' };

export default async function RootLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let username = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();
    username = data?.username;
  }
  return (
    <html lang="en">
      <body>
        <header>
          <div className="bar">
            <Link href="/" className="logo"><i className="iris" />Aper<span>ture</span></Link>
            {user ? (
              <>
                <small className="mut">Signed in as <b>{username}</b></small>
                <SignOut />
              </>
            ) : (
              <Link href="/login" className="btn pri">Log in / Sign up</Link>
            )}
          </div>
          <div className="sprockets" aria-hidden="true" />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
