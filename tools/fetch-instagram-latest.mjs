import fs from 'fs/promises';

async function resolveCarouselCover(id, token) {
  const url = `https://graph.facebook.com/v19.0/${id}/children?fields=media_type,media_url,thumbnail_url&limit=5&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const items = Array.isArray(data?.data) ? data.data : [];
  for (const item of items) {
    if (item.media_type === 'IMAGE' && item.media_url) return item.media_url;
    if (item.thumbnail_url) return item.thumbnail_url;
  }
  return null;
}

async function pickImage(media, token) {
  if (!media) return null;
  if (media.media_type === 'IMAGE') return media.media_url || null;
  if (media.media_type === 'VIDEO') return media.thumbnail_url || media.media_url || null;
  if (media.media_type === 'CAROUSEL_ALBUM') {
    const direct = media.media_url || media.thumbnail_url;
    if (direct) return direct;
    return await resolveCarouselCover(media.id, token);
  }
  return media.media_url || media.thumbnail_url || null;
}

async function main() {
  const userId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  if (!userId || !token) {
    console.error('Missing IG_USER_ID or IG_ACCESS_TOKEN');
    process.exit(1);
  }

  const fields = 'id,permalink,caption,media_type,media_url,thumbnail_url,timestamp';
  const url = `https://graph.facebook.com/v19.0/${userId}/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${encodeURIComponent(token)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Instagram API error ${res.status}: ${txt}`);
  }
  const json = await res.json();
  const items = Array.isArray(json?.data) ? json.data : [];
  if (!items.length) throw new Error('No media returned from Instagram API');

  let media = items[0];
  for (const item of items) {
    if (item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM') {
      media = item;
      break;
    }
  }

  const imageUrl = await pickImage(media, token);
  await fs.mkdir('calcettomanzano/social', { recursive: true });

  let imagePath = 'images/Manzanologo.png';
  if (imageUrl) {
    const imgRes = await fetch(imageUrl);
    if (imgRes.ok) {
      const buf = Buffer.from(await imgRes.arrayBuffer());
      await fs.writeFile('calcettomanzano/social/instagram-latest.jpg', buf);
      imagePath = 'social/instagram-latest.jpg';
    }
  }

  const payload = {
    updated_at: new Date().toISOString(),
    url: media?.permalink || 'https://www.instagram.com/c5manzano1988/',
    image: imagePath,
    text: (media?.caption || '').trim(),
    time: media?.timestamp || ''
  };

  await fs.writeFile('calcettomanzano/social/instagram.json', JSON.stringify(payload, null, 2));
  console.log('Wrote calcettomanzano/social/instagram.json');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
