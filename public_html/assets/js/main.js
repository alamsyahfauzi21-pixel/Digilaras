// Bulletproof fetch setter patch to prevent Uncaught TypeError on Window.fetch
(function() {
    try {
        var originalFetch = window.fetch;
        var currentFetch = originalFetch;
        Object.defineProperty(window, 'fetch', {
            configurable: true,
            enumerable: true,
            get: function() { return currentFetch; },
            set: function(val) { currentFetch = val; }
        });
    } catch (e) {
        // Safe fallback
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    // Dynamically calculate base path for subdirectories (e.g. local XAMPP/Apache)
    let basePath = '';
    const isNodeDev = window.location.hostname.includes('ais-dev') || 
                      window.location.hostname.includes('ais-pre') || 
                      window.location.port === '3000';
                      
    if (!isNodeDev) {
        // If served under a subdirectory like /digilaras/public_html/
        const pathname = window.location.pathname;
        const index = pathname.toLowerCase().indexOf('/artikel');
        if (index !== -1) {
            basePath = pathname.substring(0, index);
        } else {
            // Check if served inside a subdirectory of localhost without /artikel
            // e.g. /digilaras/public_html/index.html
            const htdocsIndex = pathname.toLowerCase().indexOf('/public_html');
            if (htdocsIndex !== -1) {
                basePath = pathname.substring(0, htdocsIndex + 12); // include '/public_html'
            }
        }
    }

    Promise.all([
        headerPlaceholder ? fetch(`${basePath}/components/header.html`).then(res => res.text()) : Promise.resolve(null),
        footerPlaceholder ? fetch(`${basePath}/components/footer.html`).then(res => res.text()) : Promise.resolve(null)
    ]).then(([headerHtml, footerHtml]) => {
        if (headerHtml && headerPlaceholder) {
            headerPlaceholder.outerHTML = headerHtml;
        }
        if (footerHtml && footerPlaceholder) {
            footerPlaceholder.outerHTML = footerHtml;
        }
        
        initApp();
    }).catch(err => {
        console.error('Error loading components:', err);
        initApp(); // fallback init
    });
});

function initApp() {
    // 1. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => { 
            mobileMenu.classList.toggle('hidden'); 
        });
        mobileLinks.forEach(link => { 
            link.addEventListener('click', () => { 
                mobileMenu.classList.add('hidden'); 
            }); 
        });
    }

    // 2. Active Menu Highlighting
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const navLinks = document.querySelectorAll('header nav a, #mobile-menu a');
    
    navLinks.forEach(link => {
        if (!link.href) return;
        let linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
        
        // Remove existing active states
        if (link.classList.contains('mobile-link')) {
            link.classList.remove('bg-white/5', 'text-agency-500');
            if(!link.classList.contains('text-white') && !link.classList.contains('bg-agency-600')) {
                link.classList.add('text-slate-300');
            }
        } else {
            link.classList.remove('text-agency-500', 'border-b-2', 'border-agency-500');
            if(!link.classList.contains('text-white') && !link.classList.contains('bg-agency-600') && !link.classList.contains('bg-[#25D366]')) {
                link.classList.add('text-slate-300');
            }
        }

        // Apply active state if matched
        if (linkPath === currentPath) {
            if (link.classList.contains('mobile-link')) {
                // Don't apply to the CTA button which might be a mobile link
                if(!link.classList.contains('bg-agency-600')) {
                    link.classList.add('bg-white/5', 'text-agency-500');
                    link.classList.remove('text-slate-300');
                }
            } else {
                // Don't apply to the CTA button
                if(!link.classList.contains('bg-agency-600') && !link.classList.contains('bg-[#25D366]')) {
                    link.classList.add('text-agency-500', 'border-b-2', 'border-agency-500');
                    link.classList.remove('text-slate-300');
                }
            }
        }
    });

    const navParents = document.querySelectorAll('.nav-parent');
    navParents.forEach(parent => {
        const prefix = parent.getAttribute('data-active-prefix');
        if (prefix && currentPath.startsWith(prefix)) {
            if (parent.closest('#mobile-menu')) {
                parent.classList.add('bg-white/5', 'text-agency-500');
                parent.classList.remove('text-slate-300');
                
                const submenu = parent.nextElementSibling;
                if (submenu && submenu.id === 'mobile-submenu') {
                    submenu.classList.remove('hidden');
                    const icon = parent.querySelector('i');
                    if(icon) icon.classList.add('rotate-180');
                }
            } else {
                parent.classList.add('text-agency-500', 'border-b-2', 'border-agency-500');
                parent.classList.remove('text-slate-300');
            }
        } else {
            if (parent.closest('#mobile-menu')) {
                parent.classList.remove('bg-white/5', 'text-agency-500');
                parent.classList.add('text-slate-300');
            } else {
                parent.classList.remove('text-agency-500', 'border-b-2', 'border-agency-500');
                parent.classList.add('text-slate-300');
            }
        }
    });

    // 3. Intersection Observer for Scroll Reveal Animations
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) { 
                entry.target.classList.add('active'); 
            } 
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 4. Form Submit via AJAX (FormSubmit.co)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const btnText = document.getElementById('btn-text');
            const successMsg = document.getElementById('success-msg');
            
            // Set Loading State
            submitBtn.disabled = true;
            const originalText = btnText.innerHTML;
            btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengirim...';
            
            const formData = new FormData(contactForm);

            // Kirim form via AJAX ke email halo@digilaras.com
            fetch("https://formsubmit.co/ajax/halo@digilaras.com", {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || "Gagal mengirim pesan");
                    }).catch(() => {
                        throw new Error("Gagal mengirim pesan");
                    });
                }
                return response.json();
            })
            .then(data => {
                successMsg.classList.remove('hidden');
                contactForm.reset();
                btnText.innerHTML = originalText;
                submitBtn.disabled = false;
                setTimeout(() => {
                    successMsg.classList.add('hidden');
                }, 7000);
            })
            .catch(error => {
                console.error("AJAX submission failed:", error);
                btnText.innerHTML = 'Gagal, Coba Lagi';
                submitBtn.disabled = false;
                alert("Maaf, layanan pengiriman pesan sedang gangguan dari server pusat (FormSubmit). Silakan hubungi kami langsung via WhatsApp untuk sementara waktu.");
            });
        });
    }
}
