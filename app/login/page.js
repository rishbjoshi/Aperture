'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username: username.trim() } } });
      if (error) setMsg(error.message);
      else if (data.session) { router.push('/'); router.refresh(); }
      else setMsg('Account created. Check your email to confirm, then log in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else { router.push('/'); router.refresh(); }
    }
    setBusy(false);
  }

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Welcome back' : 'Join Aperture'}</h2>
      {mode === 'signup' && <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={24} />}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      <button className="btn pri" disabled={busy}>{mode === 'login' ? 'Log in' : 'Create account'}</button>
      {msg && <p className="mut">{msg}</p>}
      <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
      </button>
    </form>
  );
}
