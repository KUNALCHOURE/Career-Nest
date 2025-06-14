import mongoose, { Schema } from "mongoose";

const jobschema = new Schema({
  apijobsId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: Date,
    required: true,
  },
  hiringOrganizationName: {
    type: String,
    trim: true,
  },
  hiringOrganizationLogo: {
    type: String,
    trim: true,
    sparse: true, // Allow null or missing value without creating duplicate unique entries
  },
  website: {
    type: String,
    trim: true,
  },
  websiteId: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  region: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  // Parsed fields
  jobCode: {
    type: String,
    trim: true,
  },
  essentialFunctions: [{
    type: String,
    trim: true,
  }],
  qualifications: [{
    type: String,
    trim: true,
  }],
  preferredSkills: [{
    type: String,
    trim: true,
  }],
  salary: {
    type: String,
    trim: true,
  },
  benefits: [{
    type: String,
    trim: true,
  }],
  compliance: {
    type: Schema.Types.Mixed, // Can be string or array
    default: '',
  },
  employmentType: {
    type: String,
    trim: true,
    default: 'Full-time',
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  // Add indexes for frequently searched fields
  indexes: [
    { title: 'text', description: 'text' },
    { country: 1 },
    { city: 1 },
    { employmentType: 1 },
    { publishedAt: -1 }
  ]
});

// Add text index for search functionality
jobschema.index({ 
  title: 'text', 
  description: 'text',
  'preferredSkills': 'text',
  'qualifications': 'text',
  'essentialFunctions': 'text'
});

const Job = mongoose.model('job', jobschema);
export default Job;