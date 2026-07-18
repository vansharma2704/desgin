const API_URL = '/api/prompts';

export const promptService = {
  async getPrompts() {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch prompts');
    }
    return data;
  },

  async createPrompt(promptData) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save prompt');
    }
    return data;
  },

  async updatePrompt(id, updateData) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update prompt');
    }
    return data;
  },

  async deletePrompt(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete prompt');
    }
    return data;
  }
};
export default promptService;
