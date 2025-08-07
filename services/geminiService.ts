

import type { CoachingTip } from "../types";

export const generateCoachingTip = async (): Promise<CoachingTip | null> => {
  try {
    const response = await fetch('/api/generateCoachingTip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // No data needed anymore
    });

    if (!response.ok) {
      console.error("API proxy error:", await response.text());
      return null;
    }
    
    return await response.json();

  } catch (error) {
    console.error("Error calling coaching tip proxy:", error);
    return null;
  }
};


export const moderateImage = async (base64Image: string): Promise<'SAFE' | 'UNSAFE' | 'ERROR'> => {
  try {
    const response = await fetch('/api/moderateImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
        console.error("Image moderation proxy error:", await response.text());
        return 'ERROR';
    }
    
    const decision = await response.text();
    if (decision === 'SAFE' || decision === 'UNSAFE') {
        return decision as 'SAFE' | 'UNSAFE';
    }
    
    // Default to unsafe if the response is not what we expect
    console.warn(`Unexpected response from image moderation proxy: ${decision}`);
    return 'UNSAFE';
  } catch (error) {
    console.error("Error calling image moderation proxy:", error);
    return 'ERROR';
  }
};
