import { createWorker } from 'tesseract.js';

export async function performOCR(imagePath: string) {
  const worker = await createWorker('por'); // Portuguese for this dashboard
  const { data: { text } } = await worker.recognize(imagePath);
  await worker.terminate();
  return text;
}
