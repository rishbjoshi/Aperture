'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const hue = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

export default function PostDetail({ post, me, isFollowing, onClose }) {
  const supabase = createClient();
  const router = useRouter();
  const [kind, setKind] = useState('suggestion');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const liked = me && post.likes.some((l) => l.user_id === me);
  const mine = me === post.user_id;
  const author = post.profiles || post.profiles_posts_user_id_fkey;
  const name = author?.username || 'unknown';

  const needLogin = () => { if (!me) { router.push('/login'); return true; } return false; };
  async function run(fn) { setBusy(true); await fn(); setBusy(false); router.refresh(); }

  const toggleLike = () => needLogin() || run(() => liked
    ? supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', me)
    : supabase.from('likes').insert({ post_id: post.id, user_id: me }));

  const toggleFollow = () => needLogin() || run(() => isFollowing
    ? supabase.from('follows').delete().eq('follower_id', me).eq('following_id', post.user_id)
    : supabase.from('follows').insert({ follower_id: me, following_id: post.user_id }));

  const send = (e) => {
    e.preventDefault();
    if (needLogin() || !text.trim()) return;
    run(async () => { await supabase.from('comments').insert({ post_id: post.id, user_id: me, kind, body: text.trim() }); setText(''); });
  };

  const comments = [...post.comments].sort((a, b) => a.id - b.id);

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label={post.title}>
      <div className="stage"><img src={post.imageUrl} alt={post.title} /></div>
      <div className="side">
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        <div className="who-row">
          <span className="av" style={{ background: `hsl(${hue(name)} 55% 42%)` }}>{name[0].toUpperCase()}</span>
          <div className="grow"><b>{name}</b><br /><small className="mut">{post.category}</small></div>
          {!mine && <button className="btn sm" onClick={toggleFollow} disabled={busy}>{isFollowing ? 'Following' : 'Follow'}</button>}
        </div>
        <h2>{post.title}</h2>
        <button className={'btn' + (liked ? ' pri' : '')} onClick={toggleLike} disabled={busy}>{liked ? '♥' : '♡'} {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</button>

        <div className="thread">
          {comments.length === 0 && <p className="mut">No feedback yet. Be the first to leave a note.</p>}
          {comments.map((c) => (
            <div key={c.id} className={'cm ' + c.kind}>
              <small>{c.profiles?.username} {c.kind === 'suggestion' ? 'suggests' : 'appreciates'}</small>
              <p>{c.body}</p>
            </div>
          ))}
        </div>

        <form className="compose" onSubmit={send}>
          <div className="seg">
            <button type="button" className={kind === 'suggestion' ? 'on' : ''} onClick={() => setKind('suggestion')}>Suggest</button>
            <button type="button" className={kind === 'appreciation' ? 'on' : ''} onClick={() => setKind('appreciation')}>Appreciate</button>
          </div>
          <textarea rows={3} maxLength={300} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={kind === 'suggestion' ? 'What would you try differently?' : 'What works in this frame?'} />
          <button className="btn pri" disabled={busy || !text.trim()}>Send feedback</button>
        </form>
      </div>
    </div>
  );
}
