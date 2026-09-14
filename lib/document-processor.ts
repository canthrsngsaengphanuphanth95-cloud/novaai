import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface DocumentContent {
  filename: string;
  type: 'pdf' | 'image' | 'text';
  content: string;
  extractedSkills: string[];
  pageCount?: number;
  createdAt: string;
}

/**
 * Extract text from PDF using pdf.js
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }
  
  return fullText;
}

/**
 * Extract text from image using Tesseract OCR
 */
export async function extractTextFromImage(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      try {
        const { data } = await Tesseract.recognize(
          e.target?.result as string,
          'eng',
          {
            logger: (m) => console.log('OCR Progress:', m.progress),
          }
        );
        resolve(data.text);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Process document (PDF or image) and extract content
 */
export async function processDocument(file: File): Promise<DocumentContent> {
  let content = '';
  let type: 'pdf' | 'image' | 'text' = 'text';

  if (file.type === 'application/pdf') {
    type = 'pdf';
    content = await extractTextFromPDF(file);
  } else if (file.type.startsWith('image/')) {
    type = 'image';
    content = await extractTextFromImage(file);
  } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
    type = 'text';
    content = await file.text();
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const extractedSkills = await extractSkillsFromContent(content);

  return {
    filename: file.name,
    type,
    content,
    extractedSkills,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Extract skills from document content using NLP patterns
 */
export async function extractSkillsFromContent(
  content: string
): Promise<string[]> {
  // Simple keyword-based extraction (can be enhanced with ML later)
  const skillPatterns = [
    /(?:skill|ability|competency)[:\s]+([^\n]+)/gi,
    /can\s+([a-z\s]+)/gi,
    /proficient\s+in\s+([^\n,]+)/gi,
    /expert[\s]*(?:in|at)\s+([^\n,]+)/gi,
  ];

  const extractedSkills = new Set<string>();

  for (const pattern of skillPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const skill = match[1]?.trim().toLowerCase();
      if (skill && skill.length > 2) {
        extractedSkills.add(skill);
      }
    }
  }

  return Array.from(extractedSkills).slice(0, 50); // Limit to 50 skills
}
