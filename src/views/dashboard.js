import { apiService } from '../services/api.js';
import { navigateTo } from '../router/router.js';

export const DashboardView = async () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  let projects = [];
  
  if (user.role === 'manager') {
    projects = await apiService.getProjects();
  } else {
    projects = await apiService.getProjectsByCollaborator(user.id);
  }

  // Cálculos de métricas según requerimientos [cite: 113, 126]
  const total = projects.length;
  const activos = projects.filter(p => p.status === 'In Progress').length;
  const finalizados = projects.filter(p => p.status === 'Completed').length;

  return `
    <nav class="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
      <h1 class="text-xl font-bold">Riwi Project Manager</h1>
      <div class="flex items-center gap-4">
        <span>Hola, <strong>${user.name}</strong> (${user.role.toUpperCase()})</span>
        <button id="logout-btn" class="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition">Cerrar Sesión</button>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
          <p class="text-sm text-gray-500 font-medium">Total Proyectos</p>
          <p class="text-2xl font-bold">${total}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <p class="text-sm text-gray-500 font-medium">${user.role === 'manager' ? 'Activos' : 'Tus Proyectos'}</p>
          <p class="text-2xl font-bold">${user.role === 'manager' ? activos : total}</p>
        </div>
        ${user.role === 'manager' ? `
        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <p class="text-sm text-gray-500 font-medium">Finalizados</p>
          <p class="text-2xl font-bold">${finalizados}</p>
        </div>` : ''}
      </div>

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">Listado de Proyectos</h2>
        ${user.role === 'manager' ? '<button id="open-create-modal" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm">Nuevo Proyecto</button>' : ''}
      </div>

      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody id="projects-table-body" class="divide-y divide-gray-200 text-sm">
            ${projects.map(p => `
              <tr data-id="${p.id}">
                <td class="px-6 py-4 font-semibold">${p.name}</td>
                <td class="px-6 py-4 text-gray-600">${p.description}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded text-xs font-bold ${p.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${p.status}
                  </span>
                </td>
                <td class="px-6 py-4">${p.assignedToName || 'No asignado'}</td>
                <td class="px-6 py-4 space-x-2">
                  <button class="action-edit text-indigo-600 hover:text-indigo-900 font-medium">Editar</button>
                  ${user.role === 'manager' ? '<button class="action-delete text-red-600 hover:text-red-900 font-medium">Eliminar</button>' : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div id="project-modal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center hidden z-50">
      <div class="bg-white p-6 rounded-lg max-w-md w-full shadow-lg mx-4">
        <h3 id="modal-title" class="text-lg font-bold mb-4">Proyecto</h3>
        <form id="project-form" class="space-y-4">
          <input type="hidden" id="project-id">
          
          <div class="manager-field">
            <label class="block text-sm font-medium">Nombre</label>
            <input type="text" id="p-name" class="w-full border p-2 rounded mt-1">
          </div>
          <div class="manager-field">
            <label class="block text-sm font-medium">Descripción</label>
            <textarea id="p-desc" class="w-full border p-2 rounded mt-1"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium">Estado</label>
            <select id="p-status" class="w-full border p-2 rounded mt-1">
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div class="manager-field">
            <label class="block text-sm font-medium">Responsable</label>
            <select id="p-assigned" class="w-full border p-2 rounded mt-1">
              </select>
          </div>
          
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" id="close-modal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  `;
};

DashboardView.init = async () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  
  // Evento Logout [cite: 135]
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    navigateTo('/');
  });

  const modal = document.getElementById('project-modal');
  const projectForm = document.getElementById('project-form');
  const modalTitle = document.getElementById('modal-title');
  
  // Cargar lista de usuarios colaboradores si es manager para el Selector
  let usersList = [];
  if (user.role === 'manager') {
    usersList = await apiService.getUsers();
    const selectAssigned = document.getElementById('p-assigned');
    selectAssigned.innerHTML = usersList.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
  }

  // Deshabilitar campos si el rol es colaborador [cite: 64]
  if (user.role !== 'manager') {
    document.querySelectorAll('.manager-field input, .manager-field textarea, .manager-field select').forEach(elem => {
      elem.setAttribute('disabled', 'true');
    });
  }

  // Botón Abrir Modal Creación (Solo Manager)
  const openCreateBtn = document.getElementById('open-create-modal');
  if (openCreateBtn) {
    openCreateBtn.addEventListener('click', () => {
      projectForm.reset();
      document.getElementById('project-id').value = '';
      modalTitle.textContent = "Crear Nuevo Proyecto";
      modal.classList.remove('hidden');
    });
  }

  // Cerrar Modal
  document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));

  // Manejo de eventos delegados en la Tabla (Editar / Eliminar) [cite: 183]
  document.getElementById('projects-table-body').addEventListener('click', async (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const projectId = row.dataset.id;

    // Acción Eliminar (Solo Manager) [cite: 58]
    if (e.target.classList.contains('action-delete')) {
      if (confirm('¿Estás seguro de eliminar este proyecto?')) {
        const success = await apiService.deleteProject(projectId);
        if (success) {
          row.remove();
          alert('Proyecto eliminado exitosamente.');
        }
      }
    }

    // Acción Editar (Manager todo, Collaborator solo Estado) [cite: 57, 64]
    if (e.target.classList.contains('action-edit')) {
      const projects = user.role === 'manager' ? await apiService.getProjects() : await apiService.getProjectsByCollaborator(user.id);
      const targetProject = projects.find(p => p.id == projectId);

      if (targetProject) {
        document.getElementById('project-id').value = targetProject.id;
        document.getElementById('p-name').value = targetProject.name;
        document.getElementById('p-desc').value = targetProject.description;
        document.getElementById('p-status').value = targetProject.status;
        if(user.role === 'manager') document.getElementById('p-assigned').value = targetProject.assignedTo;
        
        modalTitle.textContent = user.role === 'manager' ? "Editar Proyecto" : "Actualizar Estado del Proyecto";
        modal.classList.remove('hidden');
      }
    }
  });

  // Guardar datos del Formulario (Submit) [cite: 77, 85]
  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const status = document.getElementById('p-status').value;

    try {
      if (user.role === 'manager') {
        const name = document.getElementById('p-name').value;
        const description = document.getElementById('p-desc').value;
        const assignedTo = document.getElementById('p-assigned').value;
        const uName = usersList.find(u => u.id == assignedTo)?.name || '';

        const bodyData = { name, description, status, assignedTo, assignedToName: uName };

        if (id) {
          await apiService.updateProject(id, bodyData);
        } else {
          await apiService.createProject(bodyData);
        }
      } else {
        // Si es colaborador, solo se envía e impacta el estado [cite: 64]
        await apiService.updateProject(id, { status });
      }

      modal.classList.add('hidden');
      // Recargar la SPA de manera reactiva para actualizar el DOM
      const { handleRouter } = await import('../router/router.js');
      handleRouter();
    } catch (err) {
      alert('Error al guardar cambios.');
    }
  });
};