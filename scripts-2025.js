(function(){
	function buildUnifiedHeader() {
		const header = document.querySelector('.header');
		if (!header) return;

		const inBlog = /\/blog\//.test(location.pathname);
		const base = inBlog ? '../' : '';
		const path = location.pathname.replace(/^.*\//,'');

		function isActive(slug){
			switch(slug){
				case 'index.html': return path === '' || /index\.html$/i.test(path);
				case 'news-2025.html': return /news-2025\.html$/i.test(path) || inBlog;
				case 'societa-2025.html': return /societa-2025\.html$/i.test(path);
				case 'prima-squadra-2025.html': return /prima-squadra-2025\.html$/i.test(path);
				case 'under-2025.html': return /under-2025\.html$/i.test(path);
				case 'sponsor-2025.html': return /sponsor-2025\.html$/i.test(path);
				case 'trasparenza-2025.html': return /trasparenza-2025\.html$/i.test(path);
				case 'galleria-2025.html': return /galleria-2025\.html$/i.test(path);
				default: return false;
			}
		}

		const links = [
			{href: 'index.html', label: 'Home'},
			{href: 'news-2025.html', label: 'News'},
			{href: 'societa-2025.html', label: 'Società'},
			{href: 'prima-squadra-2025.html', label: '1a Squadra'},
			{href: 'under-2025.html', label: 'Under 21/19'},
			{href: 'sponsor-2025.html', label: 'Sponsor'},
			{href: 'trasparenza-2025.html', label: 'Trasparenza'},
			{href: 'galleria-2025.html', label: 'Galleria'}
		];

		const desktopNav = links.map(l => `<a href="${base}${l.href}"${isActive(l.href)?' class="active"':''}>${l.label}</a>`).join('');
		const mobileNav = links.map(l => `<a href="${base}${l.href}"${isActive(l.href)?' class="active"':''}>${l.label}</a>`).join('');

		header.innerHTML = `
			<div class="container nav">
				<a class="brand" href="${base}index.html" aria-label="C5 Manzano 1988">
					<img src="${base}images/Manzanologo.png" alt="Logo C5 Manzano 1988" />
					<span>C5 Manzano 1988</span>
				</a>
				<nav class="menu" aria-label="Navigazione principale">${desktopNav}</nav>
				<button class="burger" id="burger" aria-label="Apri menu" aria-controls="mobile-panel" aria-expanded="false"><span></span></button>
			</div>
			<div class="mobile-panel" id="mobile-panel" aria-hidden="true">
				<div class="mobile-drawer">
					<nav class="mobile-menu" aria-label="Menu mobile">${mobileNav}</nav>
				</div>
			</div>`;

		const panel = header.querySelector('#mobile-panel');
		if (panel) {
			document.body.appendChild(panel);
		}
	}

	function setupHeaderBehaviors(){
		const header = document.querySelector('.header');
		if (!header) return;
		const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		const burger = document.getElementById('burger');
		const panel = document.getElementById('mobile-panel');
		if (burger && panel) {
			burger.addEventListener('click', () => {
				const isOpen = panel.classList.toggle('open');
				burger.setAttribute('aria-expanded', String(isOpen));
				panel.setAttribute('aria-hidden', String(!isOpen));
				document.body.classList.toggle('menu-open', isOpen);
			});
			panel.addEventListener('click', (e) => {
				if (e.target === panel) {
					panel.classList.remove('open');
					burger.setAttribute('aria-expanded', 'false');
					panel.setAttribute('aria-hidden', 'true');
					document.body.classList.remove('menu-open');
				}
			});
			panel.querySelectorAll('a').forEach(link => {
				link.addEventListener('click', () => {
					panel.classList.remove('open');
					burger.setAttribute('aria-expanded', 'false');
					panel.setAttribute('aria-hidden', 'true');
					document.body.classList.remove('menu-open');
				});
			});
		}
	}

	function initGalleryLoadMore(){
		if (!/galleria-2025\.html$/i.test(location.pathname)) return;
		const grid = document.querySelector('.gallery-grid');
		if (!grid) return;
		const items = Array.from(grid.querySelectorAll('.gallery-item'));
		const INITIAL = 24;
		const STEP = 12;
		if (items.length <= INITIAL) return;
		items.forEach((item, idx) => {
			if (idx >= INITIAL) item.classList.add('is-hidden');
		});
		const wrapper = document.createElement('div');
		wrapper.className = 'gallery-load-more-wrapper';
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'gallery-load-more';
		button.textContent = 'Mostra altre foto';
		button.addEventListener('click', () => {
			const hidden = items.filter(item => item.classList.contains('is-hidden'));
			hidden.slice(0, STEP).forEach(item => item.classList.remove('is-hidden'));
			if (hidden.length <= STEP) {
				button.remove();
			}
		});
		wrapper.appendChild(button);
		grid.parentNode.appendChild(wrapper);
	}

	function initGalleryLazyLoad(){
		const images = Array.from(document.querySelectorAll('.gallery-grid img[data-src]'));
		if (!images.length) return;
		const loadImage = (img) => {
			if (!img || img.dataset.loaded) return;
			const src = img.dataset.src;
			if (src) {
				img.src = src;
				img.removeAttribute('data-src');
				img.dataset.loaded = 'true';
				img.classList.add('is-loaded');
			}
		};
		if ('IntersectionObserver' in window) {
			const io = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						loadImage(entry.target);
						io.unobserve(entry.target);
					}
				});
			}, { rootMargin: '200px 0px' });
			images.forEach(img => io.observe(img));
		} else {
			images.forEach(loadImage);
		}
	}

	function initGalleryLightbox(){
		const allImages = Array.from(document.querySelectorAll('.gallery-grid img'));
		if (!allImages.length) return;

		const overlay = document.createElement('div');
		overlay.className = 'gallery-lightbox';
		overlay.innerHTML = `
			<div class="gallery-lightbox__backdrop" data-lightbox-close></div>
			<div class="gallery-lightbox__content" role="dialog" aria-modal="true">
				<button class="gallery-lightbox__close" type="button" aria-label="Chiudi galleria" data-lightbox-close>&times;</button>
				<button class="gallery-lightbox__nav gallery-lightbox__prev" type="button" aria-label="Foto precedente">&#10094;</button>
				<figure class="gallery-lightbox__figure">
					<img class="gallery-lightbox__img" alt="" />
					<figcaption class="gallery-lightbox__caption"></figcaption>
				</figure>
				<button class="gallery-lightbox__nav gallery-lightbox__next" type="button" aria-label="Foto successiva">&#10095;</button>
			</div>`;

		document.body.appendChild(overlay);
		const figureImg = overlay.querySelector('.gallery-lightbox__img');
		const caption = overlay.querySelector('.gallery-lightbox__caption');
		const prevBtn = overlay.querySelector('.gallery-lightbox__prev');
		const nextBtn = overlay.querySelector('.gallery-lightbox__next');
		const closeElements = overlay.querySelectorAll('[data-lightbox-close]');

		let currentIndex = -1;

		const ensureLoaded = (img) => {
			if (img && img.dataset && img.dataset.src && !img.dataset.loaded) {
				img.src = img.dataset.src;
				img.removeAttribute('data-src');
				img.dataset.loaded = 'true';
				img.classList.add('is-loaded');
			}
		};

		const open = (index) => {
			if (index < 0 || index >= allImages.length) return;
			currentIndex = index;
			const target = allImages[currentIndex];
			ensureLoaded(target);
			const full = target.dataset.full || target.currentSrc || target.src;
			figureImg.src = full;
			figureImg.alt = target.alt || '';
			caption.textContent = target.alt || '';
			overlay.classList.add('open');
			document.body.classList.add('lightbox-open');
			nextBtn.disabled = allImages.length <= 1;
			prevBtn.disabled = allImages.length <= 1;
		};

		const close = () => {
			overlay.classList.remove('open');
			document.body.classList.remove('lightbox-open');
			currentIndex = -1;
		};

		const step = (delta) => {
			if (currentIndex === -1) return;
			let next = currentIndex + delta;
			if (next < 0) next = allImages.length - 1;
			if (next >= allImages.length) next = 0;
			open(next);
		};

		allImages.forEach((img, idx) => {
			img.addEventListener('click', (e) => {
				e.preventDefault();
				open(idx);
			});
			img.style.cursor = 'zoom-in';
		});

		prevBtn.addEventListener('click', () => step(-1));
		nextBtn.addEventListener('click', () => step(1));
		closeElements.forEach(el => el.addEventListener('click', close));

		document.addEventListener('keydown', (event) => {
			if (!overlay.classList.contains('open')) return;
			if (event.key === 'Escape') {
				close();
			} else if (event.key === 'ArrowLeft') {
				step(-1);
			} else if (event.key === 'ArrowRight') {
				step(1);
			}
		});

		overlay.addEventListener('wheel', (event) => {
			if (!overlay.classList.contains('open')) return;
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
				event.preventDefault();
				if (event.deltaX > 0) {
					step(1);
				} else if (event.deltaX < 0) {
					step(-1);
				}
			}
		}, { passive: false });
	}

	function initCookieConsent(){
		const STORAGE_KEY = 'c5m-cookie-consent-v1';
		const defaults = { necessary: true, analytics: false };
		const readConsent = () => {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				return { ...defaults, ...parsed };
			} catch (err) {
				console.warn('Cookie consent: unable to read stored preferences', err);
				return null;
			}
		};
		const storedConsent = readConsent();
		let consent = storedConsent || { ...defaults };
		let bannerEl = null;
		let modalEl = null;
		let analyticsToggle = null;
		let modalState = { ...consent };

		const applyConsent = () => {
			document.documentElement.setAttribute('data-analytics-consent', consent.analytics ? 'granted' : 'denied');
			window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: { ...consent } }));
			if (consent.analytics && typeof window.enableAnalytics === 'function') {
				window.enableAnalytics();
			}
			if (!consent.analytics && typeof window.disableAnalytics === 'function') {
				window.disableAnalytics();
			}
		};

		const saveConsent = () => {
			const payload = { ...consent, timestamp: new Date().toISOString() };
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
			} catch (err) {
				console.warn('Cookie consent: unable to persist preferences', err);
			}
		};

		const hideBanner = () => {
			if (bannerEl) {
				bannerEl.remove();
				bannerEl = null;
			}
		};

		const closeModal = () => {
			if (modalEl) {
				modalEl.classList.remove('open');
				document.body.classList.remove('cookie-modal-open');
			}
		};

		const storeAndApply = () => {
			saveConsent();
			applyConsent();
			hideBanner();
			closeModal();
		};

		const openPreferences = () => {
			if (!modalEl) {
				modalEl = document.createElement('div');
				modalEl.className = 'cookie-modal';
				modalEl.innerHTML = `
					<div class="cookie-modal__overlay" data-consent-close></div>
					<div class="cookie-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title" tabindex="-1">
						<button class="cookie-modal__close" type="button" aria-label="Chiudi preferenze cookie" data-consent-close>&times;</button>
						<h2 class="cookie-modal__title" id="cookie-modal-title">Preferenze cookie</h2>
						<p class="cookie-modal__intro">Scegli quali categorie di cookie desideri attivare. Puoi modificare la scelta in qualsiasi momento.</p>
						<div class="cookie-modal__option cookie-modal__option--essential">
							<div>
								<h3>Cookie essenziali</h3>
								<p>Necessari per garantire il funzionamento del sito e la sicurezza delle pagine. Sono sempre attivi e non memorizzano dati personali.</p>
							</div>
							<span class="cookie-badge">Sempre attivi</span>
						</div>
						<div class="cookie-modal__option">
							<div>
								<h3>Cookie analitici</h3>
								<p>Ci aiutano a misurare il traffico e migliorare i contenuti. Vengono impostati solo con il tuo consenso.</p>
							</div>
							<label class="cookie-switch">
								<input type="checkbox" data-consent-toggle="analytics" />
								<span class="cookie-switch__slider" aria-hidden="true"></span>
								<span class="cookie-switch__label">Facoltativi</span>
							</label>
						</div>
						<div class="cookie-modal__actions">
							<button type="button" class="cookie-btn" data-consent-close>Annulla</button>
							<button type="button" class="cookie-btn cookie-btn--primary" data-consent-save>Salva preferenze</button>
						</div>
					</div>`;
				document.body.appendChild(modalEl);
				const closeTargets = modalEl.querySelectorAll('[data-consent-close]');
				closeTargets.forEach(el => el.addEventListener('click', closeModal));
				const saveBtn = modalEl.querySelector('[data-consent-save]');
				saveBtn.addEventListener('click', () => {
					consent.analytics = !!modalState.analytics;
					storeAndApply();
				});
				analyticsToggle = modalEl.querySelector('[data-consent-toggle="analytics"]');
				analyticsToggle.addEventListener('change', () => {
					modalState.analytics = analyticsToggle.checked;
				});
			}
			modalState = { ...consent };
			if (analyticsToggle) {
				analyticsToggle.checked = !!modalState.analytics;
			}
			modalEl.classList.add('open');
			document.body.classList.add('cookie-modal-open');
			const dialog = modalEl.querySelector('.cookie-modal__dialog');
			if (dialog) {
				dialog.focus({ preventScroll: true });
			}
		};

		const createBanner = () => {
			if (bannerEl) return;
			bannerEl = document.createElement('div');
			bannerEl.className = 'cookie-banner';
			bannerEl.innerHTML = `
				<div class="cookie-banner__inner">
					<div class="cookie-banner__text">
						<h2>Il rispetto della tua privacy</h2>
						<p>Usiamo cookie essenziali per far funzionare il sito e cookie facoltativi per analisi e miglioramenti. I secondi sono disattivati finché non li accetti.</p>
						<p><a href="cookie-policy.html">Leggi la cookie policy</a> per maggiori dettagli.</p>
					</div>
					<div class="cookie-banner__actions">
						<button type="button" class="cookie-btn" data-consent-action="reject">Solo essenziali</button>
						<button type="button" class="cookie-btn cookie-btn--ghost" data-consent-action="customize">Personalizza</button>
						<button type="button" class="cookie-btn cookie-btn--primary" data-consent-action="accept">Accetta tutti</button>
					</div>
				</div>`;
			document.body.appendChild(bannerEl);
			const actions = bannerEl.querySelectorAll('[data-consent-action]');
			actions.forEach(btn => {
				btn.addEventListener('click', (event) => {
					const action = event.currentTarget.getAttribute('data-consent-action');
					if (action === 'accept') {
						consent.analytics = true;
						storeAndApply();
					} else if (action === 'reject') {
						consent.analytics = false;
						storeAndApply();
					} else if (action === 'customize') {
						openPreferences();
					}
				});
			});
		};

		applyConsent();

		if (!storedConsent) {
			createBanner();
		}

		return {
			openPreferences,
			showBanner: () => createBanner(),
			getConsent: () => ({ ...consent })
		};
	}

	function ensureLegalLinks(cookieApi){
		const containers = document.querySelectorAll('.footer .container');
		containers.forEach(container => {
			if (container.querySelector('.legal-links')) return;
			const legal = document.createElement('div');
			legal.className = 'legal-links';
			const policy = document.createElement('a');
			policy.href = 'cookie-policy.html';
			policy.textContent = 'Cookie policy';
			legal.appendChild(policy);
			const manage = document.createElement('button');
			manage.type = 'button';
			manage.className = 'cookie-settings-link';
			manage.textContent = 'Gestisci preferenze cookie';
			manage.addEventListener('click', (event) => {
				event.preventDefault();
				if (cookieApi && typeof cookieApi.openPreferences === 'function') {
					cookieApi.openPreferences();
				} else if (typeof window.openCookieSettings === 'function') {
					window.openCookieSettings();
				}
			});
			legal.appendChild(manage);
			const copyright = container.querySelector('.copyright');
			if (copyright) {
				container.insertBefore(legal, copyright);
			} else {
				container.appendChild(legal);
			}
		});
	}

	document.addEventListener('DOMContentLoaded', function(){
		buildUnifiedHeader();
		setupHeaderBehaviors();
		initGalleryLoadMore();
		initGalleryLazyLoad();
		initGalleryLightbox();
		const consentApi = initCookieConsent();
		if (consentApi && typeof consentApi.openPreferences === 'function') {
			window.openCookieSettings = consentApi.openPreferences;
		}
		ensureLegalLinks(consentApi);
	});
})();
