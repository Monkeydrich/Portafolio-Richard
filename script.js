
document.documentElement.classList.add('js');

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1. Año dinámico en el footer ---------- */
  const anio = $('#anio');
  if (anio) anio.textContent = new Date().getFullYear();

  /* ---------- 2. Fondo de la barra al hacer scroll ---------- */
  const nav = $('#nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 3. Menú móvil ---------- */
  const toggle = $('#nav-toggle');
  const navLinks = $('#nav-links');

  const cerrarMenu = () => {
    document.body.classList.remove('nav-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    }
  };

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const abierto = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(abierto));
      toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cerrar al elegir una sección o al presionar Escape
    $$('a', navLinks).forEach((link) => link.addEventListener('click', cerrarMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) cerrarMenu();
    });
  }

  /* ---------- 4. Scroll-spy: resalta la sección activa ---------- */
  const secciones = $$('main section[id]');
  const enlaces = $$('.nav-link');

  if ('IntersectionObserver' in window && secciones.length && enlaces.length) {
    const marcarActivo = (id) => {
      enlaces.forEach((link) => {
        const activo = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', activo);
        if (activo) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    const spy = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) marcarActivo(entrada.target.id);
        });
      },
      // Banda central de la pantalla: la sección que la cruza es la activa
      { rootMargin: '-40% 0px -55% 0px' }
    );

    secciones.forEach((seccion) => spy.observe(seccion));
  }

  /* ---------- 5. Aparición al hacer scroll ---------- */
  const revelables = $$('[data-reveal]');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    // Sin soporte o con movimiento reducido: mostrar todo de inmediato
    revelables.forEach((el) => el.classList.add('revealed'));
  } else {
    // Escalonado suave: cada elemento hereda un pequeño retraso
    // según su orden dentro de la sección (variable CSS --i)
    secciones.forEach((seccion) => {
      $$('[data-reveal]', seccion).forEach((el, i) => {
        el.style.setProperty('--i', Math.min(i, 5));
      });
    });

    const revelador = new IntersectionObserver(
      (entradas, observer) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('revealed');
            observer.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revelables.forEach((el) => revelador.observe(el));
  }

  /* ---------- 6. Línea de estado con tipeo (firma del hero) ---------- */
  const statusText = $('#statusline-text');

  // Datos reales del perfil, en formato de comando
  const lineas = [
    'status --producción → toursmaran.com.mx · 200 OK',
    'stack → node.js · angular · c# · sql server',
    'pagos → stripe & stripe connect · deploy en azure',
    'ahora → ing. en computación @ IPN · CDMX',
  ];

  if (statusText && !reduceMotion) {
    const ESCRIBIR = 38; // ms por carácter al escribir
    const BORRAR = 16; // ms por carácter al borrar
    const PAUSA = 2400; // ms con la línea completa en pantalla
    let indice = 0;

    const escribir = (texto, pos = 0) => {
      statusText.textContent = texto.slice(0, pos);
      if (pos <= texto.length) {
        setTimeout(() => escribir(texto, pos + 1), ESCRIBIR);
      } else {
        setTimeout(() => borrar(texto, texto.length), PAUSA);
      }
    };

    const borrar = (texto, pos) => {
      statusText.textContent = texto.slice(0, pos);
      if (pos > 0) {
        setTimeout(() => borrar(texto, pos - 1), BORRAR);
      } else {
        indice = (indice + 1) % lineas.length;
        escribir(lineas[indice]);
      }
    };

    // Deja leer la primera línea (ya en el HTML) antes de rotar
    setTimeout(() => borrar(lineas[0], lineas[0].length), PAUSA + 800);
  }

  /* ---------- 7. Filtros de proyectos ---------- */
  const botonesFiltro = $$('.filter-btn');
  const proyectos = $$('.project');

  if (botonesFiltro.length && proyectos.length) {
    botonesFiltro.forEach((boton) => {
      boton.addEventListener('click', () => {
        const filtro = boton.dataset.filter;

        botonesFiltro.forEach((b) =>
          b.setAttribute('aria-pressed', String(b === boton))
        );

        proyectos.forEach((proyecto) => {
          const coincide =
            filtro === 'todos' || proyecto.dataset.category === filtro;
          proyecto.classList.toggle('is-hidden', !coincide);
          // Al reaparecer, asegurarse de que sea visible aunque
          // el observador ya lo haya procesado antes
          if (coincide) proyecto.classList.add('revealed');
        });
      });
    });
  }
});