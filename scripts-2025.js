(function(){
	// Sticky header
	const header = document.querySelector('.header');
	const onScroll = () => {
		if (!header) return;
		header.classList.toggle('scrolled', window.scrollY > 10);
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	// Mobile menu
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

	// Simple lightbox
	const links = document.querySelectorAll('[data-lightbox]');
	if (links.length) {
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
})();
