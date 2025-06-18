import pkg from 'pdfjs-dist/legacy/build/pdf.js';
const { getDocument, GlobalWorkerOptions } = pkg;
import mammoth from 'mammoth';
import ApiError from './ApiError.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize PDF.js worker
GlobalWorkerOptions.workerSrc = path.join(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.js');

class PDFTextExtractor {
  static async extractText(buffer) {
    try {
      const pdf = await getDocument(buffer).promise;
      let fullText = '';
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      const cleanedText = this.cleanText(fullText);
      
      return {
        rawText: fullText,
        cleanedText: cleanedText,
        metadata: {
          pages: pdf.numPages,
          info: await pdf.getMetadata().catch(() => ({})),
          extractedAt: new Date().toISOString(),
          fileType: 'pdf'
        }
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new ApiError(500, `Failed to parse PDF: ${error.message}`);
    }
  }

  // Add DOCX support
  static async extractDOCX(buffer) {
    try {
      const result = await mammoth.extractRawText({buffer: buffer});
      const cleanedText = this.cleanText(result.value);
      
      return {
        rawText: result.value,
        cleanedText: cleanedText,
        metadata: {
          pages: 1, // DOCX doesn't have clear page count
          info: {},
          extractedAt: new Date().toISOString(),
          fileType: 'docx'
        }
      };
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new ApiError(500, `Failed to parse DOCX: ${error.message}`);
    }
  }

  static cleanText(text) {
    if (!text) return '';
    
    try {
      let cleaned = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/^\s+|\s+$/gm, '')
        .trim();

      return cleaned;
    } catch (error) {
      console.error('Text cleaning error:', error);
      return text || '';
    }
  }

  static formatForAI(extractedData) {
    const { cleanedText, metadata } = extractedData;
    
    return {
      content: cleanedText,
      aiPrompt: `Please analyze this resume and extract the following information in JSON format:

{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedIn": "",
    "portfolio": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "duration": "",
      "description": "",
      "achievements": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "graduationYear": "",
      "gpa": ""
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "languages": []
  },
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "link": ""
    }
  ],
  "certifications": [],
  "awards": []
}

Resume Content:
${cleanedText}`,
      context: {
        documentType: "resume",
        fileType: metadata.fileType,
        pages: metadata.pages,
        extractedAt: metadata.extractedAt
      }
    };
  }
}

// // Test function
// async function testPDFParser() {
//   try {
//     // Path to your test PDF file
//     const testPdfPath = path.join(__dirname, 'resume.pdf');
    
//     if (!fs.existsSync(testPdfPath)) {
//       console.log('Please place a test.pdf file in the same directory as this script');
//       return;
//     }

//     console.log('Reading PDF file...');
//     const pdfBuffer = fs.readFileSync(testPdfPath);
    
//     console.log('Extracting text...');
//     const result = await PDFTextExtractor.extractText(pdfBuffer);
    
//     console.log('\n=== PDF Parsing Results ===');
//     console.log('\nMetadata:');
//     console.log(JSON.stringify(result.metadata, null, 2));
    
//     console.log('\nCleaned Text Preview (first 500 characters):');
//     console.log(result.cleanedText.substring(0,10000) + '...');
    
//     console.log('\nAI Format Preview:');
//     const aiFormat = PDFTextExtractor.formatForAI(result);
//     console.log(JSON.stringify(aiFormat.context, null, 2));
    
//   } catch (error) {
//     console.error('Test failed:', error);
//   }
// }

// // Run the test
// testPDFParser();

export default PDFTextExtractor;
