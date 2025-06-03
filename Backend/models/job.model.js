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
  website: {
    type: String,
    trim: true,
  },
  companyUrl: {
    type: String,
    trim: true,
  },
  companyLogoUrl: {
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
  remote: {
    type: Boolean,
    default: false,
  },
  employmentType: {
    type: String,
    trim: true,
    lowercase: true,
  },
  salaryMin: {
    type: Number,
  },
  salaryMax: {
    type: Number,
  },
  salaryCurrency: {
    type: String,
    trim: true,
  },
  salaryPeriod: {
    type: String,
    trim: true,
  },
  jobEmbedding: {
    type: [Number],
  },
  embeddingStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'NONE'],
    default: 'NONE',
  },
  embeddingError: {
    type: String,
  },
  requiredExperience: {
    type: String,
    trim: true,
  },
  requiredEducation: {
    type: String,
    trim: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  industry: {
    type: String,
    trim: true,
  },
  jobTags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Job =mongoose.model('job',jobschema);
export default Job;