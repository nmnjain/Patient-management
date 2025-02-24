import Tesseract from 'tesseract.js';

export async function extractTextFromImage(file: File): Promise<string> {
  try {
    const imageUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      {
        logger: m => {/* Suppress logging */}
      }
    );

    return result.data.text;
    
  } catch (error) {
    throw error;
  }
}