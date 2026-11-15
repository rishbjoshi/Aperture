'use client';
import { useEffect, useMemo, useState } from 'react';
import PostDetail from './PostDetail';

export default function Gallery({ posts, me, followIds }) {
  const [cat, setCat] = useState('All');
  const [openId, setOpenId] = useState(null);
  const cats = useMemo(() => ['All', ...new Set(posts.map((p) => p.category))], [posts]);
  const shown = cat === 'All' ? posts : posts.filter((p) => p.category === cat);
  const open = posts.find((p) => p.id === openId);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpenId(null);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {cats.length > 2 && (
        <div className="chips">
          {cats.map((c) => (
            <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      )}

      {shown.length === 0 && <p className="empty">No frames here yet. Share the first one.</p>}

      <div className="wall">
        {shown.map((p) => {
          const sug = p.comments.filter((c) => c.kind === 'suggestion').length;
          return (
            <button key={p.id} className="tile" onClick={() => setOpenId(p.id)} aria-label={`Open ${p.title}`}>
              <span className="frame">
                <img src={p.imageUrl} alt={p.title} loading="lazy" />
                {sug > 0 && <span className="note-badge">{sug} {sug === 1 ? 'suggestion' : 'suggestions'}</span>}
                <span className="cap">
                  <span className="cap-l"><b>{p.title}</b><span>{p.profiles?.username || 'unknown'}</span></span>
                  <span className="cap-r">♥ {p.likes.length}</span>
                </span>
              </span>
              <span className="edge"><i>▶ {p.id}A</i><i>{p.category}</i></span>
            </button>
          );
        })}
      </div>

      {open && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setOpenId(null)}>
          <PostDetail post={open} me={me} isFollowing={followIds.includes(open.user_id)} onClose={() => setOpenId(null)} />
        </div>
      )}
    </>
  );
}
