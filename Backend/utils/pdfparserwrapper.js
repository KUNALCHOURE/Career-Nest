// utils/pdfParseWrapper.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Handle both export styles
const pdfParse = require('pdf-parse');
export default pdfParse.default || pdfParse;
