const BASE_URL = 'http://localhost:3000';

export const apiService = {
  // Autenticación
// Autenticación robusta
  async login(email, password) {
    const response = await fetch(`${BASE_URL}/users`);
    if (!response.ok) throw new Error('Error en el servidor');
    
    const users = await response.json();
    
    // Buscamos manualmente el usuario ignorando espacios en blanco o problemas de tipo
    const foundUser = users.find(u => 
      u.email.trim().toLowerCase() === email.trim().toLowerCase() && 
      String(u.password) === String(password)
    );

    return foundUser || null;
  },

  // Proyectos
  async getProjects() {
    const response = await fetch(`${BASE_URL}/projects`);
    if (!response.ok) throw new Error('No se pudieron obtener los proyectos');
    return await response.json();
  },

  async getProjectsByCollaborator(userId) {
    const response = await fetch(`${BASE_URL}/projects?assignedTo=${userId}`);
    if (!response.ok) throw new Error('No se pudieron obtener tus proyectos');
    return await response.json();
  },

  async createProject(projectData) {
    const response = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...projectData, createdAt: new Date().toISOString().split('T')[0] })
    });
    return await response.json();
  },

  async updateProject(id, projectData) {
    const response = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    return await response.json();
  },

  async deleteProject(id) {
    const response = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  },

  // Usuarios (Para asignación en el formulario de creación)
  async getUsers() {
    const response = await fetch(`${BASE_URL}/users`);
    return await response.json();
  }
};