'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { iconFor } from '@/lib/categories';

export default function PostCard({ post, imageUrl, me, isFollowing }) {
  const supabase = createClient();
  const router = useRouter();
  const [kind, setKind] = useState('appreciation');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const liked = me && post.likes.some((l) => l.user_id === me);
  const mine = me === post.user_id;

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
  const author = post.profiles || post.profiles_posts_user_id_fkey;
  const name = author?.username || 'unknown';
  const date = new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

  return (
    <article className="card post">
      <div className="ph">
        <div className="av">{name[0].toUpperCase()}</div>
        <div className="n"><b>{name}</b><br /><small className="mut">{iconFor(post.category)} {post.category}</small></div>
        {!mine && <button className="btn" onClick={toggleFollow} disabled={busy}>{isFollowing ? 'Following' : 'Follow'}</button>}
      </div>

      <div className="shot"><img src={imageUrl} alt={post.title} /></div>
      <div className="edge"><i>▶ {post.id}A</i><i>{post.category}</i><i>{date}</i></div>

      <div className="pb">
        <h3>{post.title}</h3>
        <button className={'btn' + (liked ? ' pri' : '')} onClick={toggleLike} disabled={busy}>{liked ? '♥' : '♡'} {post.likes.length}</button>
        {comments.map((c) => (
          <div key={c.id} className={'cm ' + c.kind}>
            <b>{c.profiles?.username}</b><em>{c.kind === 'suggestion' ? 'Suggestion' : 'Appreciation'}</em><br />{c.body}
          </div>
        ))}
        <form className="add" onSubmit={send}>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="appreciation">Appreciate</option>
            <option value="suggestion">Suggest</option>
          </select>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something helpful or kind…" maxLength={300} />
          <button className="btn" disabled={busy}>Send</button>
        </form>
      </div>
    </article>
  );
}
