// Smooth scroll para los botones CTA
document.addEventListener('DOMContentLoaded', function() {
    // Animación de typing para el comando en el terminal
    const commandElement = document.querySelector('.command');
    if (commandElement) {
        const originalText = commandElement.textContent;
        commandElement.textContent = '';
        let index = 0;

        function typeWriter() {
            if (index < originalText.length) {
                commandElement.textContent += originalText.charAt(index);
                index++;
                setTimeout(typeWriter, 100);
            }
        }

        // Iniciar la animación después de un breve delay
        setTimeout(typeWriter, 500);
    }

    // Funcionalidad del botón de play en el terminal
    const playButton = document.querySelector('.terminal-play');
    const outputLines = document.querySelectorAll('.output-line');

    if (playButton) {
        playButton.addEventListener('click', function() {
            // Reset animations
            outputLines.forEach(line => {
                line.style.animation = 'none';
                line.offsetHeight; // Trigger reflow
                line.style.animation = null;
            });

            // Reset command typing
            if (commandElement) {
                const text = 'claude help';
                commandElement.textContent = '';
                let i = 0;

                function retype() {
                    if (i < text.length) {
                        commandElement.textContent += text.charAt(i);
                        i++;
                        setTimeout(retype, 100);
                    }
                }

                retype();
            }
        });
    }

    // Smooth scroll para navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animación al hacer scroll para los módulos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    entry.target.style.transition = 'all 0.5s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, entry.target.dataset.delay || 0);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar módulos del curso
    document.querySelectorAll('.module-item').forEach((item, index) => {
        item.dataset.delay = index * 100;
        observer.observe(item);
    });

    // Efecto parallax suave en el hero
    let ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const scrolled = window.pageYOffset;
                const heroRight = document.querySelector('.hero-right');

                if (heroRight && scrolled < window.innerHeight) {
                    heroRight.style.transform = `translateY(${scrolled * 0.1}px)`;
                }

                ticking = false;
            });

            ticking = true;
        }
    });

    // Añadir efecto de hover mejorado a los botones
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                transform: translate(-50%, -50%) scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Añadir animación CSS para el ripple
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: translate(-50%, -50%) scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Stats counter animation (si quisieras añadir contadores)
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Añadir efecto de pulso al badge de oferta
    const badgeOffer = document.querySelector('.badge-offer');
    if (badgeOffer) {
        setInterval(() => {
            badgeOffer.style.transform = 'scale(1.05)';
            setTimeout(() => {
                badgeOffer.style.transform = 'scale(1)';
            }, 200);
        }, 3000);
        badgeOffer.style.transition = 'transform 0.2s ease';
    }

    // Click handlers para los botones principales
    const btnPrimary = document.querySelector('.btn-primary');
    const btnDemo = document.querySelector('.btn-secondary');

    if (btnPrimary) {
        btnPrimary.addEventListener('click', function() {
            // Aquí puedes añadir la lógica para redirigir a la página de inscripción
            console.log('Empezar ahora clicked');
            // window.location.href = '/registro';
        });
    }

    if (btnDemo) {
        btnDemo.addEventListener('click', function() {
            // Aquí puedes añadir la lógica para mostrar el demo
            console.log('Ver demo clicked');
            // Puedes abrir un modal o redirigir a una página de demo
        });
    }

    // Añadir efecto de brillo al pasar el mouse sobre el título principal
    const heroTitle = document.querySelector('.hero-title .highlight');
    if (heroTitle) {
        heroTitle.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 20px rgba(79, 111, 255, 0.5)';
            this.style.transition = 'text-shadow 0.3s ease';
        });

        heroTitle.addEventListener('mouseleave', function() {
            this.style.textShadow = 'none';
        });
    }

    // Preload optimization: añadir lazy loading a imágenes futuras
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }

    // Form submission handler
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Obtener el botón de envío para mostrar estado de carga
            const submitButton = contactForm.querySelector('.btn-submit');
            const originalButtonText = submitButton.querySelector('.btn-text').textContent;

            // Deshabilitar el botón y cambiar texto
            submitButton.disabled = true;
            submitButton.querySelector('.btn-text').textContent = 'Enviando...';

            // Obtener los datos del formulario
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                role: document.getElementById('role').value,
                newsletter: document.querySelector('input[name="newsletter"]').checked,
                timestamp: new Date().toISOString(),
                source: 'Landing Curso Claude Code'
            };

            // Enviar datos al webhook de Make.com
            fetch('https://hook.eu1.make.com/m5giqo7woobk5hxacakkv91sfd2q6sym', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.text(); // Make.com puede devolver texto o JSON
            })
            .then(data => {
                // Mostrar mensaje de éxito
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';

                // Scroll suave al mensaje de éxito
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Opcional: Enviar a Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        'event_category': 'Lead',
                        'event_label': 'Waitlist Sign Up'
                    });
                }

                console.log('✅ Formulario enviado exitosamente:', formData);
            })
            .catch(error => {
                console.error('❌ Error al enviar formulario:', error);

                // Restaurar el botón
                submitButton.disabled = false;
                submitButton.querySelector('.btn-text').textContent = originalButtonText;

                // Mostrar mensaje de error al usuario
                alert('Hubo un error al enviar el formulario. Por favor, intenta de nuevo o contáctanos directamente.');
            });
        });
    }

    // Animación de fade-in para las cards de beneficios
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
    });

    const benefitObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                benefitObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    benefitCards.forEach(card => benefitObserver.observe(card));

    // Animación para testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
    });

    const testimonialObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
                testimonialObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    testimonialCards.forEach(card => testimonialObserver.observe(card));

    // Validación de email en tiempo real
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailPattern.test(this.value)) {
                this.style.borderColor = 'var(--danger)';
                this.setCustomValidity('Por favor, ingresa un email válido');
            } else {
                this.style.borderColor = '';
                this.setCustomValidity('');
            }
        });

        emailInput.addEventListener('input', function() {
            this.style.borderColor = '';
            this.setCustomValidity('');
        });
    }

    // Contador de caracteres para el textarea
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        const maxLength = 500;
        const counter = document.createElement('div');
        counter.style.cssText = 'font-size: 0.75rem; color: var(--text-muted); text-align: right; margin-top: 0.25rem;';
        messageTextarea.parentElement.appendChild(counter);

        function updateCounter() {
            const remaining = maxLength - messageTextarea.value.length;
            counter.textContent = `${messageTextarea.value.length}/${maxLength} caracteres`;
            counter.style.color = remaining < 50 ? 'var(--warning)' : 'var(--text-muted)';
        }

        messageTextarea.setAttribute('maxlength', maxLength);
        messageTextarea.addEventListener('input', updateCounter);
        updateCounter();
    }

    // Smooth scroll para los enlaces del footer
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Floating CTA Button - Show/Hide on scroll
    const floatingCTA = document.getElementById('floatingCTA');
    const formSection = document.getElementById('formulario');
    const heroCTA = document.querySelector('.cta-buttons');

    if (floatingCTA && formSection && heroCTA) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            const formPosition = formSection.offsetTop;
            const formBottom = formPosition + formSection.offsetHeight;

            // Obtener la posición del botón CTA del hero
            const heroCTABottom = heroCTA.getBoundingClientRect().bottom;

            // Mostrar el CTA flotante solo cuando:
            // 1. El CTA del hero ha salido del viewport (heroCTABottom < 0)
            // 2. El usuario NO está en la sección del formulario
            if (heroCTABottom < 0 && (currentScroll < formPosition - 200 || currentScroll > formBottom + 200)) {
                floatingCTA.classList.add('visible');
            } else {
                floatingCTA.classList.remove('visible');
            }
        });

        // Smooth scroll cuando se hace clic en el CTA flotante
        floatingCTA.addEventListener('click', function(e) {
            e.preventDefault();
            formSection.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        });
    }

    // Smooth scroll para todos los enlaces que apuntan a #formulario
    document.querySelectorAll('a[href="#formulario"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector('#formulario');
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });
});

// Función para detectar si el usuario está en mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Ajustar animaciones según el dispositivo
if (isMobile()) {
    // Reducir animaciones en mobile para mejor performance
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
} else {
    document.documentElement.style.setProperty('--animation-duration', '0.5s');
}

// Event listener para cambios en el tamaño de ventana
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (isMobile()) {
            document.documentElement.style.setProperty('--animation-duration', '0.3s');
        } else {
            document.documentElement.style.setProperty('--animation-duration', '0.5s');
        }
    }, 250);
});
