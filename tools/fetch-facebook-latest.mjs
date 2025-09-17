import fs from 'fs/promises';

async function main() {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_ACCESS_TOKEN;
  if (!pageId || !token) {
    console.error('Missing FB_PAGE_ID or FB_ACCESS_TOKEN');
    process.exit(1);
  }

  const fields = 'permalink_url,created_time,message,full_picture,attachments{media_type,media,url,subattachments}';
  const url = `https://graph.facebook.com/v19.0/${pageId}/posts?limit=5&fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Facebook API error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const posts = Array.isArray(data?.data) ? data.data : [];
  function pickImageFrom(post){
    if (post.full_picture) return post.full_picture;
    const atts = post.attachments?.data || [];
    for (const a of atts) {
      if (a.media?.image?.src) return a.media.image.src;
      const subs = a.subattachments?.data || [];
      for (const s of subs) {
        if (s.media?.image?.src) return s.media.image.src;
      }
    }
    return null;
  }
  let post = posts[0] || null;
  // Prefer the most recent post that yields an image
  for (const p of posts) {
    if (pickImageFrom(p)) { post = p; break; }
  }
  if (!post) throw new Error('No posts returned by Facebook API');

  await fs.mkdir('calcettomanzano/social', { recursive: true });

  // Download image locally for stable display
  const imageUrl = pickImageFrom(post);
  if (imageUrl) {
    const imgRes = await fetch(imageUrl);
    if (imgRes.ok) {
      const buf = Buffer.from(await imgRes.arrayBuffer());
      await fs.writeFile('calcettomanzano/social/facebook-latest.jpg', buf);
    }
  }

  const payload = {
    updated_at: new Date().toISOString(),
    url: post.permalink_url || '',
    image: imageUrl ? 'social/facebook-latest.jpg' : 'images/Manzanologo.png',
    text: (post.message || '').trim(),
    time: post.created_time || ''
  };
  await fs.writeFile('calcettomanzano/social/facebook.json', JSON.stringify(payload, null, 2));
  console.log('Wrote calcettomanzano/social/facebook.json');
}

main().catch(err => { console.error(err); process.exit(1); });
