import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PostCard from '@/components/PostCard';
import NewPost from '@/components/NewPost';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const onlyFollowing = searchParams?.tab === 'following';

  let followIds = [];
  if (user) {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
    followIds = (data || []).map((r) => r.following_id);
  }

  let posts = [];
  if (!onlyFollowing || user) {
    let q = supabase
      .from('posts')
      .select('id,title,category,image_path,user_id,created_at,profiles!posts_user_id_fkey(username),likes(user_id),comments(id,kind,body,profiles!comments_user_id_fkey(username))')
      .order('created_at', { ascending: false })
      .limit(50);
    if (onlyFollowing) q = q.in('user_id', [...followIds, user.id]);
    const { data, error } = await q;
    if (error) return <p className="empty">Feed error: {error.message}</p>;
    posts = data || [];
  }

  const urlFor = (p) => supabase.storage.from('photos').getPublicUrl(p).data.publicUrl;

  return (
    <div className="col">
      <div className="tabs">
        <Link href="/" className={'btn' + (!onlyFollowing ? ' on' : '')}>Everyone</Link>
        <Link href="/?tab=following" className={'btn' + (onlyFollowing ? ' on' : '')}>Following</Link>
      </div>
      {user ? <NewPost userId={user.id} /> : <p className="mut">Log in to share your photos, like, and give feedback.</p>}
      {onlyFollowing && !user && <p className="empty">Log in to see photographers you follow.</p>}
      {posts.length === 0 && (!onlyFollowing || user) && <p className="empty">No frames yet. Be the first to share one.</p>}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} imageUrl={urlFor(p.image_path)} me={user?.id || null} isFollowing={followIds.includes(p.user_id)} />
      ))}
    </div>
  );
}
