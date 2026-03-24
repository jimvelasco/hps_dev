import axios from 'axios';

const PLATE_RECOGNIZER_URL = 'https://api.platerecognizer.com/v1/plate-reader/';
const PLATE_RECOGNIZER_TOKEN = import.meta.env.VITE_PLATE_RECOGNIZER_TOKEN;

/**
 * Calls Plate Recognizer API to perform OCR and MMC on an image.
 * @param {Blob|File|string} image - The image to process (Blob/File or Base64 string)
 * @returns {Promise<Object>} - The recognition results
 */
export const lookupPlate = async (image) => {
  if (!PLATE_RECOGNIZER_TOKEN) {
    console.error('Plate Recognizer API token is missing. Please add VITE_PLATE_RECOGNIZER_TOKEN to your .env file.');
    throw new Error('API token missing');
  }

  const formData = new FormData();
  
  if (typeof image === 'string' && image.startsWith('data:')) {
    // Convert base64 to blob if needed, but Plate Recognizer supports base64 too if sent correctly.
    // However, sending as multipart/form-data with a blob is generally more reliable.
    const response = await fetch(image);
    const blob = await response.blob();
    formData.append('upload', blob, 'plate.jpg');
  } else {
    formData.append('upload', image);
  }

  // Request make, model, color and orientation (type)
  formData.append('mmc', 'true');

  try {
    const response = await axios.post(PLATE_RECOGNIZER_URL, formData, {
      headers: {
        'Authorization': `Token ${PLATE_RECOGNIZER_TOKEN}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const mmc = result.vehicle || {};
      
      return {
        plate: result.plate.toUpperCase(),
        make: mmc.make ? mmc.make[0].make : '',
        model: mmc.model ? mmc.model[0].model : '',
        color: mmc.color ? mmc.color[0].color : '',
        type: mmc.type ? mmc.type[0].type : '',
        score: result.score,
        dscore: result.dscore,
      };
    } else {
      throw new Error('No plate detected');
    }
  } catch (error) {
    console.error('Error calling Plate Recognizer API:', error);
    throw error;
  }
};
