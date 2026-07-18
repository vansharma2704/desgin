const API_URL = '/api/campaigns';

export const campaignService = {
  async getCampaigns(brandId = '') {
    const url = brandId ? `${API_URL}?brandId=${brandId}` : API_URL;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch campaigns');
    }
    return data;
  },

  async createCampaign(campaignData) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create campaign');
    }
    return data;
  },

  async updateCampaign(id, campaignData) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update campaign');
    }
    return data;
  },

  async deleteCampaign(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete campaign');
    }
    return data;
  }
};
export default campaignService;
