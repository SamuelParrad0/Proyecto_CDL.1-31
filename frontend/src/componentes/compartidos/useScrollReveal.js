import { useEffect } from 'react';

export function useScrollReveal(selector = '.animar-entrada') {
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observador.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const elementos = document.querySelectorAll(selector + ':not(.visible)');
    elementos.forEach((el) => observador.observe(el));

    return () => observador.disconnect();
  });
}

export function usePaquetesReveal() {
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 220);
            observador.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const filas = document.querySelectorAll('.paquete-fila');
    filas.forEach((el) => observador.observe(el));

    return () => observador.disconnect();
  });
}
