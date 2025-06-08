import Job from '../models/job.model.js';
import ApiError from "../utils/Apierror.js";
import ApiResponse from "../utils/apiresponse.js";
import asynchandler from "../utils/asynchandler.js";


const getalljob = asynchandler(async (req, res) => {
  try {
    const { q, city, region, country, employmentType, hiringOrganizationName, skills, sortBy } = req.query;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const defaultLimit = 10; // Choose a reasonable default
    const maxAllowedLimit = 100; // Maximum allowed limit
    const limit = Math.min(parseInt(req.query.limit) || defaultLimit, maxAllowedLimit);
    const skip = (page - 1) * limit;

    // Build query object
    const query = {};

    if (q) {
      // Using $text for full-text search if you have a text index
      // Otherwise, use $or with $regex for title and description
      // Assuming you have a text index on title and description as per job.model.js
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (region) {
      query.region = { $regex: region, $options: 'i' };
    }
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }
    if (employmentType) {
      query.employmentType = { $regex: employmentType, $options: 'i' };
    }
    if (hiringOrganizationName) {
      query.hiringOrganizationName = { $regex: hiringOrganizationName, $options: 'i' };
    }
    if (skills) {
      // Match jobs that have *any* of the provided skills
      const skillArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArray };
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      // Example sortBy: 'salaryMin:asc', 'publishedAt:desc'
      const [field, order] = sortBy.split(':');
      sort[field] = order === 'asc' ? 1 : -1;
    } else {
      // Default sort by publishedAt descending
      sort.publishedAt = -1;
    }

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalJobs / limit);

    // Using ApiResponse utility for consistent response format
    res.status(200).json(
      new ApiResponse(
        200,
        { jobs, totalJobs, totalPages, currentPage: page, limit },
        "Jobs fetched successfully"
      )
    );

  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new ApiError(500, "A problem occurred while fetching jobs.", error.message);
  }
});

const fetchAndStoreJobs = asynchandler(async (req, res) => {
  try {
    // Call apijobs.dev API to fetch new jobs
    const apiResponse = await fetch('https://api.apijobs.dev/v1/job/search', {
      method: 'POST',
      headers: {
        'apikey': process.env.JOB_INFO_API,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: "Software Developer", // Example query, you might want to make this dynamic or fetch a wider range
        limit: 50 // Fetch a reasonable number of jobs from the external API
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new ApiError(apiResponse.status, `Failed to fetch jobs from external API: ${errorData.message || apiResponse.statusText}`);
    }

    const apiJobsData = await apiResponse.json();
    const fetchedJobs = apiJobsData.jobs; // Assuming the external API returns jobs in a 'jobs' array

    let newJobsCount = 0;
    let updatedJobsCount = 0;

    for (const jobData of fetchedJobs) {
      // Map external API data to your Mongoose Job model schema
      const mappedJob = {
        apijobsId: jobData.id, // Use a unique ID from the external API
        title: jobData.title,
        description: jobData.description,
        url: jobData.url,
        publishedAt: jobData.publishedAt, // Ensure this is a valid date string or Date object
        hiringOrganizationName: jobData.hiringOrganization?.name,
        website: jobData.hiringOrganization?.website,
        companyUrl: jobData.hiringOrganization?.url,
        companyLogoUrl: jobData.hiringOrganization?.logoUrl,
        country: jobData.country,
        region: jobData.region,
        city: jobData.city,
        remote: jobData.remote || false,
        employmentType: jobData.employmentType,
        salaryMin: jobData.salary?.min,
        salaryMax: jobData.salary?.max,
        salaryCurrency: jobData.salary?.currency,
        salaryPeriod: jobData.salary?.period,
        // Assuming skills come as an array of strings, or you might need to parse them
        skills: jobData.skills || [], 
        industry: jobData.industry,
        jobTags: jobData.jobTags || []
      };

      // Find and update, or insert if not found (upsert)
      const result = await Job.findOneAndUpdate(
        { apijobsId: mappedJob.apijobsId }, // Find by apijobsId to avoid duplicates
        { $set: mappedJob }, // Update with new data
        { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not exists, return new doc
      );
      
      if (result && result._id) {
        
        if (result.createdAt.getTime() === result.updatedAt.getTime()) { 
            newJobsCount++;
        } else {
            updatedJobsCount++;
        }
      }
    }

    res.status(200).json(
      new ApiResponse(
        200,
        { newJobs: newJobsCount, updatedJobs: updatedJobsCount, totalFetched: fetchedJobs.length },
        `Successfully fetched and stored ${newJobsCount} new jobs and updated ${updatedJobsCount} jobs.`
      )
    );

  } catch (error) {
    console.error('Error fetching and storing jobs:', error);
    throw new ApiError(500, "A problem occurred while fetching and storing jobs from external API.", error.message);
  }
});

export { getalljob, fetchAndStoreJobs };
