(function () {
  if (window.__blogShareLoaded) return;
  window.__blogShareLoaded = true;
  document.addEventListener('DOMContentLoaded', initShareBar);

  function initShareBar() {
    const canonical = document.querySelector('link[rel="canonical"]');
    const shareUrl = (canonical ? canonical.href : window.location.href.split('?')[0]).trim();
    if (!shareUrl) return;
    const shareTitle = (document.querySelector('h1')?.textContent || document.title || 'Calcetto Manzano').trim();
    const meta = document.querySelector('.meta');
    const content = document.querySelector('.content');
    const container = document.createElement('div');
    container.className = 'share-bar';

    const label = document.createElement('span');
    label.className = 'share-label';
    label.textContent = 'Condividi';
    container.appendChild(label);

    const copyBtn = createButton('Copia link');
    copyBtn.addEventListener('click', () => copyLink(shareUrl));
    container.appendChild(copyBtn);

    const facebook = document.createElement('a');
    facebook.className = 'share-btn share-facebook';
    facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    facebook.target = '_blank';
    facebook.rel = 'noopener';
    facebook.textContent = 'Facebook';
    container.appendChild(facebook);

    const whatsapp = document.createElement('a');
    whatsapp.className = 'share-btn share-whatsapp';
    whatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`;
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener';
    whatsapp.textContent = 'WhatsApp';
    container.appendChild(whatsapp);

    const instagram = createButton('Instagram');
    instagram.classList.add('share-instagram');
    instagram.addEventListener('click', () => shareOnInstagram(shareTitle, shareUrl));
    container.appendChild(instagram);

    if (meta) {
      meta.insertAdjacentElement('afterend', container);
    } else if (content) {
      content.prepend(container);
    } else if (document.body.firstChild) {
      document.body.insertBefore(container, document.body.firstChild);
    } else {
      document.body.appendChild(container);
    }

    injectStyles();
  }

  function createButton(label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'share-btn';
    btn.textContent = label;
    return btn;
  }

  async function copyLink(url) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        fallbackCopy(url);
      }
      showToast('Link copiato');
    } catch (err) {
      fallbackCopy(url);
      showToast('Impossibile copiare automaticamente, link selezionato');
    }
  }

  function fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
  }

  async function shareOnInstagram(title, url) {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    await copyLink(url);
    window.open('https://www.instagram.com/', '_blank');
    showToast('Apri Instagram e incolla il link');
  }

  function showToast(message) {
    let toast = document.querySelector('.share-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'share-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 2200);
  }

  function injectStyles() {
    if (document.getElementById('share-bar-styles')) return;
    const styles = document.createElement('style');
    styles.id = 'share-bar-styles';
    styles.textContent = `
      .share-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        margin: 1.5rem 0 2rem;
        padding: 0.75rem 1rem;
        border: 1px solid var(--c-border, #e5e7eb);
        border-radius: 999px;
        background: #f8fafc;
        font-size: 0.95rem;
      }
      .share-label {
        font-weight: 600;
        color: var(--c-primary, #0b3f91);
        margin-right: 0.25rem;
      }
      .share-btn {
        border: none;
        background: #1d4ed8;
        color: #fff;
        padding: 0.4rem 0.9rem;
        border-radius: 999px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        text-decoration: none;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .share-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 12px rgba(15, 23, 42, 0.15); }
      .share-btn:focus { outline: 2px solid rgba(29, 78, 216, 0.3); outline-offset: 2px; }
      .share-facebook { background: #1877f2; }
      .share-whatsapp { background: #22c55e; }
      .share-instagram { background: linear-gradient(120deg, #f77737, #e1306c, #c13584); }
      .share-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(100%);
        background: #0f172a;
        color: #fff;
        padding: 0.6rem 1.2rem;
        border-radius: 999px;
        font-size: 0.9rem;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
        opacity: 0;
        transition: opacity 0.2s ease, transform 0.2s ease;
        z-index: 9999;
      }
      .share-toast.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      @media (max-width: 640px) {
        .share-bar {
          border-radius: 16px;
          justify-content: center;
        }
        .share-btn {
          flex: 1 1 calc(50% - 0.5rem);
        }
        .share-label {
          width: 100%;
          text-align: center;
          margin-bottom: 0.25rem;
        }
      }
    `;
    document.head.appendChild(styles);
  }
})();
