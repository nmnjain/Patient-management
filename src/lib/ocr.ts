import Tesseract from 'tesseract.js';

export async function extractTextFromImage(file: File): Promise<string> {
  console.log('Starting OCR process for file:', file.name);
  
  try {
    // Convert File to image data URL
    const imageUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    // Use Tesseract.recognize directly
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      {
        logger: m => console.log(m)
      }
    );

    console.log('OCR completed successfully');
    return result.data.text;
    
  } catch (error) {
    console.error('Error in OCR process:', error);
    throw error;
  }
}