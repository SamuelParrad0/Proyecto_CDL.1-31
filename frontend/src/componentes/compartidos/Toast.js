import React, { useEffect, useRef } from 'react';

let mostrarToastGlobal = null;

export function usarToast() {
  return mostrarToastGlobal;
}

function Toast({ mensaje, visible }) {
  return (
    <div className={`notificacion-emergente${visible ? ' show' : ''}`} id="notificacionEmergente">
      <span className="notificacion-icono">✅</span>
      <span className="notificacion-mensaje">{mensaje}</span>
      <div className="notificacion-progreso"></div>
    </div>
  );
}

export default Toast;
