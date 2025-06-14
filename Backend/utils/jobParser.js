import nlp from 'compromise';

/**
 * Fallback mechanism using compromise NLP to extract missing fields
 * @param {string} raw - Raw job description text
 * @param {Object} result - Current parsing result
 * @returns {Object} Updated result with missing fields filled
 */
const fallbackWithCompromise = (raw, result) => {
  const doc = nlp(raw);

  // Fallback for job title
  if (!result.jobTitle) {
    // Get first 3 sentences and look for noun phrases
    const firstThreeSentences = doc.sentences().slice(0, 3).text();
    const titleDoc = nlp(firstThreeSentences);
    const nouns = titleDoc.nouns().out('array');
    if (nouns.length > 0) {
      // Take the first noun phrase that looks like a job title
      const potentialTitle = nouns.find(noun => 
        noun.length > 3 && 
        !['job', 'position', 'role', 'work'].includes(noun.toLowerCase())
      );
      if (potentialTitle) {
        result.jobTitle = potentialTitle;
      }
    }
  }

  // Fallback for location
  if (!result.location) {
    // Look for geographic entities
    const places = doc.places().out('array');
    if (places.length > 0) {
      result.location = places[0];
    } else {
      // Look for lines with location markers
      const locationMarkers = ['location:', 'based in', 'located in', 'office in'];
      const lines = raw.split('\n');
      for (const line of lines) {
        const hasMarker = locationMarkers.some(marker => 
          line.toLowerCase().includes(marker)
        );
        if (hasMarker) {
          const locationDoc = nlp(line);
          const place = locationDoc.places().out('array')[0];
          if (place) {
            result.location = place;
            break;
          }
        }
      }
    }
  }

  // Fallback for salary
  if (!result.salary) {
    // Look for money values
    const moneyPatterns = [
      /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g,  // $50,000.00
      /\$\d{1,3}k/i,                        // $50k
      /₹\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g,  // ₹50,000.00
      /₹\d{1,3}\s*LPA/i,                    // ₹10 LPA
      /\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|INR)/i  // 50,000 USD
    ];

    for (const pattern of moneyPatterns) {
      const matches = raw.match(pattern);
      if (matches && matches.length > 0) {
        result.salary = matches[0];
        break;
      }
    }
  }

  // Fallback for company
  if (!result.company) {
    // Look for organizations near hiring phrases
    const hiringPhrases = ['is hiring', 'is seeking', 'is proud to be', 'is looking for'];
    const lines = raw.split('\n');
    
    for (const line of lines) {
      const hasHiringPhrase = hiringPhrases.some(phrase => 
        line.toLowerCase().includes(phrase)
      );
      
      if (hasHiringPhrase) {
        const orgDoc = nlp(line);
        const orgs = orgDoc.organizations().out('array');
        if (orgs.length > 0) {
          result.company = orgs[0];
          break;
        }
      }
    }

    // If still not found, try to find any organization in the first paragraph
    if (!result.company) {
      const firstParagraph = raw.split('\n\n')[0];
      const orgDoc = nlp(firstParagraph);
      const orgs = orgDoc.organizations().out('array');
      if (orgs.length > 0) {
        result.company = orgs[0];
      }
    }
  }

  // Fallback for description
  if (!result.description) {
    // Find the first paragraph with more than 50 words
    const paragraphs = raw.split('\n\n');
    for (const paragraph of paragraphs) {
      const wordCount = paragraph.split(/\s+/).length;
      if (wordCount > 50) {
        result.description = paragraph.trim();
        break;
      }
    }
  }

  return result;
};

/**
 * Parse job description using regex and NLP fallback
 * @param {string} jobDescription - Raw job description text
 * @returns {Object} Parsed job information
 */
const parseJobDescription = (jobDescription) => {
  const result = {
    jobTitle: '',
    jobCode: '',
    location: '',
    description: '',
    essentialFunctions: [],
    qualifications: [],
    preferredSkills: [],
    salary: '',
    benefits: [],
    company: '',
    compliance: []
  };

  // Regex patterns for initial parsing
  const patterns = {
    jobTitle: /(?:job title|position|role):\s*([^\n]+)/i,
    jobCode: /(?:job code|req|requisition)(?:\s*#|\s*id)?:\s*([^\n]+)/i,
    location: /(?:location|work location|job location):\s*([^\n]+)/i,
    description: /(?:job description|about the role):\s*([^\n]+)/i,
    salary: /(?:salary|compensation|pay)(?:\s*range)?:\s*([^\n]+)/i,
    company: /(?:company|organization|employer):\s*([^\n]+)/i
  };

  // Extract fields using regex
  for (const [field, pattern] of Object.entries(patterns)) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      result[field] = match[1].trim();
    }
  }

  // Extract lists using regex
  const listPatterns = {
    essentialFunctions: /(?:essential functions|key responsibilities|duties):\s*([\s\S]*?)(?=\n\n|\n(?:[A-Z][a-z]+:)|$)/i,
    qualifications: /(?:qualifications|requirements|required skills):\s*([\s\S]*?)(?=\n\n|\n(?:[A-Z][a-z]+:)|$)/i,
    preferredSkills: /(?:preferred skills|nice to have|additional skills):\s*([\s\S]*?)(?=\n\n|\n(?:[A-Z][a-z]+:)|$)/i,
    benefits: /(?:benefits|perks|what we offer):\s*([\s\S]*?)(?=\n\n|\n(?:[A-Z][a-z]+:)|$)/i,
    compliance: /(?:compliance|legal|regulatory):\s*([\s\S]*?)(?=\n\n|\n(?:[A-Z][a-z]+:)|$)/i
  };

  for (const [field, pattern] of Object.entries(listPatterns)) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      result[field] = match[1]
        .split('\n')
        .map(item => item.trim())
        .filter(item => item && !item.startsWith('-') && !item.startsWith('•'))
        .map(item => item.replace(/^[-•]\s*/, ''));
    }
  }

  // Use compromise NLP as fallback for empty fields
  return fallbackWithCompromise(jobDescription, result);
};

export {
  parseJobDescription
}; 