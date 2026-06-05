import { handleRouter } from './router/router.js';
import './style.css';

// Arrancar el enrutador al cargar el DOM de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  handleRouter();
});