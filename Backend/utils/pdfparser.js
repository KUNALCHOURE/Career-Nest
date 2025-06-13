// pdfTextExtractor.js

import pdfParse from 'pdf-parse';

export class PDFTextExtractor {
  static async extractText(buffer) {
    try {
      const data = await pdfParse(buffer);

      // Clean and structure the extracted text
      const cleanedText = this.cleanText(data.text);

      return {
        rawText: data.text,
        cleanedText: cleanedText,
        metadata: {
          pages: data.numpages,
          info: data.info
        }
      };
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  static cleanText(text) {
    let cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/^\s+|\s+$/gm, '')
      .trim();

    return cleaned;
  }

  static formatForAI(extractedData) {
    const { cleanedText, metadata } = extractedData;

    return {
      content: cleanedText,
      instruction: "Please analyze this resume and extract the following information in JSON format:",
      context: {
        documentType: "resume",
        pages: metadata.pages,
        extractedAt: new Date().toISOString()
      }
    };
  }
}
