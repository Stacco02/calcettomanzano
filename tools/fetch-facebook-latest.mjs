import fs from 'fs/promises';

async function main() {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_ACCESS_TOKEN;
  if (!pageId || !token) {
    console.error('Missing FB_PAGE_ID or FB_ACCESS_TOKEN');
    process.exit(1);
  }

  const fields = 'permalink_url,created_time,full_picture,message';
  const url = `https://graph.facebook.com/v19.0/${pageId}/posts?limit=5&fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Facebook API error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const posts = Array.isArray(data?.data) ? data.data : [];
  const post = posts.find(p => p.full_picture) || posts[0];
  if (!post) throw new Error('No posts returned by Facebook API');

  await fs.mkdir('calcettomanzano/social', { recursive: true });

  // Download image locally for stable display
  if (post.full_picture) {
    const imgRes = await fetch(post.full_picture);
    if (imgRes.ok) {
      const buf = Buffer.from(await imgRes.arrayBuffer());
      await fs.writeFile('calcettomanzano/social/facebook-latest.jpg', buf);
    }
  }

  const payload = {
    updated_at: new Date().toISOString(),
    url: post.permalink_url || '',
    image: 'social/facebook-latest.jpg',
    text: (post.message || '').trim(),
    time: post.created_time || ''
  };
  await fs.writeFile('calcettomanzano/social/facebook.json', JSON.stringify(payload, null, 2));
  console.log('Wrote calcettomanzano/social/facebook.json');
}

main().catch(err => { console.error(err); process.exit(1); });

