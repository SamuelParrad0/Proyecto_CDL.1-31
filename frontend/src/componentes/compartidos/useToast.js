import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [estado, setEstado] = useState({ mensaje: '', visible: false });
  const temporizador = useRef(null);

  const mostrar = useCallback((mensaje) => {
    clearTimeout(temporizador.current);
    setEstado({ mensaje, visible: true });
    temporizador.current = setTimeout(() => {
      setEstado((prev) => ({ ...prev, visible: false }));
    }, 3500);
  }, []);

  return { toastMensaje: estado.mensaje, toastVisible: estado.visible, mostrarToast: mostrar };
}
