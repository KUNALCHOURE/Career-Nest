import fs from 'fs';
import pdfParse from 'pdf-parse';

export const extractTextFromPdf = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
    }

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer); // This is the core parsing call
        return data.text; // 'data.text' contains the extracted plain text
    } catch (error) {
        console.error(`Error parsing PDF at ${filePath}:`, error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};