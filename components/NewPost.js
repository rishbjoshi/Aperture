'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CATS } from '@/lib/categories';

export default function NewPost({ userId }) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState(CATS[0].name);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function pick(f) {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return setErr('Photo must be under 10 MB.');
    setErr(''); setFile(f); setPreview(URL.createObjectURL(f));
  }
  function close() { setOpen(false); setFile(null); setPreview(''); setTitle(''); setErr(''); }

  async function submit(e) {
    e.preventDefault();
    if (!file) return setErr('Choose a photo first.');
    setBusy(true); setErr('');
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${Date.now()}-${safe}`;
    const up = await supabase.storage.from('photos').upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); return setErr(up.error.message); }
    const ins = await supabase.from('posts').insert({ user_id: userId, title: title.trim(), category: cat, image_path: path });
    setBusy(false);
    if (ins.error) return setErr(ins.error.message);
    close(); router.refresh();
  }

  if (!open) return <button className="btn pri" onClick={() => setOpen(true)}>+ Share a photo</button>;
  return (
    <form className="card auth" onSubmit={submit}>
      <label className="drop">
        {preview ? <img src={preview} alt="Preview" /> : <span>📷 Click to choose a photo</span>}
        <input type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
      </label>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={80} />
      <div className="chips">
        {CATS.map((c) => (
          <button type="button" key={c.name} className={'chip' + (c.name === cat ? ' on' : '')} onClick={() => setCat(c.name)}>{c.icon} {c.name}</button>
        ))}
      </div>
      {err && <p className="err">{err}</p>}
      <div className="row">
        <button type="button" className="btn" onClick={close}>Cancel</button>
        <button className="btn pri" disabled={busy}>{busy ? 'Uploading…' : 'Post'}</button>
      </div>
    </form>
  );
}
