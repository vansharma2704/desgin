const API_URL = '/api/brands';

export const brandService = {
  async getBrands() {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch brands');
    }
    return data;
  },

  async getBrandById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch brand details');
    }
    return data;
  },

  async createBrand(brandData) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create brand');
    }
    return data;
  },

  async updateBrand(id, brandData) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update brand');
    }
    return data;
  },

  async deleteBrand(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete brand');
    }
    return data;
  }
};
export default brandService;
