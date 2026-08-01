import React from 'react';
import { Link } from 'react-router-dom';

export default function RedesSocialesFlotantes() {
  return (
    <div className="redes-flotantes-contenedor">
      <div className="redes-flotantes-interior">
        <div className="redes-boton-principal">
          <Link to="/personalizado"><span><i className="fa-solid fa-share-nodes"></i></span></Link>
        </div>
        <div className="red-social-item facebook">
          <a href="https://www.facebook.com/share/1EnQZv6zX4/" target="_blank" rel="noreferrer">
            <div className="red-social-etiqueta">Facebook</div>
            <span><i className="fa-brands fa-facebook" style={{color:'#3b5998'}}></i></span>
          </a>
        </div>
        <div className="red-social-item youtube">
          <a href="https://youtube.com/@davidrobertoramirezrodrigu2133" target="_blank" rel="noreferrer">
            <div className="red-social-etiqueta">YouTube</div>
            <span><i className="fa-brands fa-youtube" style={{color:'#c4302b'}}></i></span>
          </a>
        </div>
        <div className="red-social-item tiktok">
          <a href="https://tiktok.com/@communicating.des" target="_blank" rel="noreferrer">
            <div className="red-social-etiqueta">TikTok</div>
            <span><i className="fa-brands fa-tiktok" style={{color:'#fff'}}></i></span>
          </a>
        </div>
        <div className="red-social-item instagram">
          <a href="https://www.instagram.com/communicatingdesignlion" target="_blank" rel="noreferrer">
            <div className="red-social-etiqueta">Instagram</div>
            <span><i className="fa-brands fa-instagram" style={{color:'#e1306c'}}></i></span>
          </a>
        </div>
        <div className="red-social-item whatsapp">
          <a href="https://wa.me/573132741001" target="_blank" rel="noreferrer">
            <div className="red-social-etiqueta">WhatsApp</div>
            <span><i className="fa-brands fa-whatsapp" style={{color:'#25d366'}}></i></span>
          </a>
        </div>
      </div>
    </div>
  );
}
