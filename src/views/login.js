import { apiService } from '../services/api.js';

export const LoginView = async () => {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Gestión de Proyectos - Riwi</h2>
        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input type="email" id="email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" id="password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div id="error-message" class="text-red-500 text-sm hidden"></div>
          <button type="submit" class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  `;
};

LoginView.init = () => {
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('error-message');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const user = await apiService.login(email, password);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Importación dinámica limpia para evitar errores cíclicos en Vite
        const routerModule = await import('../router/router.js');
        routerModule.navigateTo('/dashboard');
      } else {
        errorDiv.textContent = "Credenciales incorrectas.";
        errorDiv.classList.remove('hidden');
      }
    } catch (err) {
      errorDiv.textContent = "Error al conectar con el servidor.";
      errorDiv.classList.remove('hidden');
    }
  });
};