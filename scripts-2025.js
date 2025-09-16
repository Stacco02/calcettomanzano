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
				case 'safeguarding-2025.html': return /safeguarding-2025\.html$/i.test(path);
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
			{href: 'safeguarding-2025.html', label: 'Safeguarding'}
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
		}
	}

	function setupLightbox(){
		const links = document.querySelectorAll('[data-lightbox]');
		if (!links.length) return;
		const overlay = document.createElement('div');
		overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);display:none;align-items:center;justify-content:center;z-index:2000;';
		const img = document.createElement('img');
		img.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.6)';
		overlay.appendChild(img);
		document.body.appendChild(overlay);
		const close = () => overlay.style.display = 'none';
		overlay.addEventListener('click', close);
		links.forEach(a => a.addEventListener('click', (e) => {
			e.preventDefault();
			img.src = a.getAttribute('href');
			overlay.style.display = 'flex';
		}));
	}

	document.addEventListener('DOMContentLoaded', function(){
		buildUnifiedHeader();
		setupHeaderBehaviors();
		setupLightbox();
	});
})();
