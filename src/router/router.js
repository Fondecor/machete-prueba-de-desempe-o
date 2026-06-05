import { LoginView } from '../views/login.js';
import { DashboardView } from '../views/dashboard.js';

const routes = {
  '/': LoginView,
  '/dashboard': DashboardView
};

export function navigateTo(path) {
  window.history.pushState({}, "", path);
  handleRouter();
}

export async function handleRouter() {
  const path = window.location.pathname;
  const user = JSON.parse(localStorage.getItem('currentUser'));

  // 1. Protección de rutas (Vistas privadas)
  if (path === '/dashboard' && !user) {
    navigateTo('/');
    return;
  }

  // Si ya inició sesión y quiere ir al login, mandarlo al dashboard
  if (path === '/' && user) {
    navigateTo('/dashboard');
    return;
  }

  const viewRender = routes[path] || LoginView;
  const appContainer = document.getElementById('app');
  
  // Renderizar la vista
  appContainer.innerHTML = await viewRender();
  
  // Ejecutar lógica/eventos específicos de la vista cargada
  if (viewRender.init) {
    viewRender.init();
  }
}

// Escuchar los botones de atrás/adelante del navegador
window.addEventListener('popstate', handleRouter);