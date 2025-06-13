// pdfParser.js
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const resumePath = 'C:/Users/Kunal/Desktop/JOB_BOARD/backend/utils/resume.pdf';

async function parseResume(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer); // This is where the error happens if pdfParse isn't loaded correctly
  console.log("✅ PDF text:\n", data.text);
}

parseResume(resumePath).catch((err) => {
  console.error("❌ Parsing error:", err);
});
