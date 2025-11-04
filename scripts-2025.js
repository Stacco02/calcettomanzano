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

	document.addEventListener('DOMContentLoaded', function(){
		buildUnifiedHeader();
		setupHeaderBehaviors();
		initGalleryLoadMore();
		initGalleryLazyLoad();
		initGalleryLightbox();
	});
})();
