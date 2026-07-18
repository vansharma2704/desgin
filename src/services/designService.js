const API_URL = '/api/designs';

export const designService = {
  async getDesigns(campaignId = '') {
    const url = campaignId ? `${API_URL}?campaignId=${campaignId}` : API_URL;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch designs');
    }
    return data;
  },

  async createDesign(designData) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(designData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create design');
    }
    return data;
  },

  async updateDesign(id, updateData) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update design');
    }
    return data;
  },

  async deleteDesign(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete design');
    }
    return data;
  }
};
export default designService;
