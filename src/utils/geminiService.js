/**
 * src/utils/geminiService.js
 * API caller for SketchLens Gemini Proxy
 */

export const getInstructionsForSteps = async (images, artStyle = 'Standard') => {
  try {
    // VITE_API_URL is defined in .env.local
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${apiUrl}/api/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ images, artStyle }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze images');
    }

    const data = await response.json();
    return data.instructions; // Expected: array of strings
  } catch (error) {
    console.error('Error fetching instructions from Gemini:', error);
    throw error;
  }
};
