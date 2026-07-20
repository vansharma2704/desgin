const API_URL = '/api/ai';

export const aiService = {
  /**
   * Analyze reference images to extract Style Memory properties
   * @param {Array<string>} imageUrls - list of urls or base64 data urls
   * @param {string} brandId - optional brand reference
   * @param {string} campaignId - optional campaign reference
   */
  async analyzeStyle(imageUrls, brandId = '', campaignId = '') {
    const response = await fetch(`${API_URL}/analyze-style`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrls, brandId, campaignId })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to analyze style memory');
    }
    return data;
  },

  /**
   * Generate design image using the complete pipeline
   */
  async generateDesignPipeline(payload) {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate design via pipeline');
    }
    return data;
  }
};

export default aiService;
