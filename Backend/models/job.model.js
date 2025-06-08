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
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Job = mongoose.model('job', jobschema);
export default Job;