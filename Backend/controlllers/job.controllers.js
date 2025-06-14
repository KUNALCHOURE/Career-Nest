import Job from '../models/job.model.js';
import ApiError from "../utils/Apierror.js";
import ApiResponse from "../utils/Apiresponse.js";
import asynchandler from "../utils/asynchandler.js";
import { parseJobDescription } from "../utils/jobParser.js";


const getalljob = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object based on query parameters
    const filter = {};
    
    // Search query (title, description, and parsed fields)
    if (req.query.q) {
      filter.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } },
        { qualifications: { $regex: req.query.q, $options: 'i' } },
        { essentialFunctions: { $regex: req.query.q, $options: 'i' } },
        { preferredSkills: { $regex: req.query.q, $options: 'i' } }
      ];
    }

    // Location filters
    if (req.query.city) {
      filter.city = { $regex: req.query.city, $options: 'i' };
    }
    if (req.query.country) {
      filter.country = { $regex: req.query.country, $options: 'i' };
    }

    // Role filter - Improved matching
    if (req.query.role) {
      // Create an array of common variations for the role
      const roleVariations = [
        req.query.role,
        req.query.role.toLowerCase(),
        req.query.role.toUpperCase(),
        req.query.role.replace(/\s+/g, ''),
        req.query.role.replace(/\s+/g, '-'),
        req.query.role.replace(/\s+/g, '_')
      ];

      // Match against title, description, and parsed fields
      filter.$or = [
        { title: { $in: roleVariations.map(role => new RegExp(role, 'i')) } },
        { description: { $in: roleVariations.map(role => new RegExp(role, 'i')) } },
        { essentialFunctions: { $in: roleVariations.map(role => new RegExp(role, 'i')) } }
      ];

      // If we already have a search query, combine it with role filter
      if (req.query.q) {
        filter.$and = [
          { $or: [
            { title: { $regex: req.query.q, $options: 'i' } },
            { description: { $regex: req.query.q, $options: 'i' } },
            { qualifications: { $regex: req.query.q, $options: 'i' } },
            { essentialFunctions: { $regex: req.query.q, $options: 'i' } },
            { preferredSkills: { $regex: req.query.q, $options: 'i' } }
          ]},
          { $or: [
            { title: { $in: roleVariations.map(role => new RegExp(role, 'i')) } },
            { description: { $in: roleVariations.map(role => new RegExp(role, 'i')) } },
            { essentialFunctions: { $in: roleVariations.map(role => new RegExp(role, 'i')) } }
          ]}
        ];
      }
    }

    // Skills filter - Now includes both API skills and parsed skills
    if (req.query.skills) {
      const skillsArray = req.query.skills.split(',').map(skill => skill.trim());
      filter.$or = [
        { skills: { $in: skillsArray.map(skill => new RegExp(skill, 'i')) } },
        { preferredSkills: { $in: skillsArray.map(skill => new RegExp(skill, 'i')) } },
        { qualifications: { $in: skillsArray.map(skill => new RegExp(skill, 'i')) } }
      ];
    }

    // Salary range filter
    if (req.query.minSalary || req.query.maxSalary) {
      filter.salary = {};
      if (req.query.minSalary) {
        filter.salary.$gte = parseInt(req.query.minSalary);
      }
      if (req.query.maxSalary) {
        filter.salary.$lte = parseInt(req.query.maxSalary);
      }
    }

    // Employment type filter
    if (req.query.employmentType) {
      filter.employmentType = { $regex: req.query.employmentType, $options: 'i' };
    }

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limit);

    // Get jobs with filters and pagination
    const jobs = await Job.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(new ApiResponse(200, {
      jobs,
      currentPage: page,
      totalPages,
      totalJobs
    }, "Jobs fetched successfully"));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new ApiError(500, "Error fetching jobs from database");
  }
};

const fetchAndStoreJobs = asynchandler(async (req, res) => {
  console.log('Attempting to fetch and store jobs...');
  try {
    if (!process.env.JOB_INFO_API) {
      console.error('JOB_INFO_API environment variable is not set.');
      throw new ApiError(400, 'API Key for external job service is missing.');
    }

    const apiResponse = await fetch('https://api.apijobs.dev/v1/job/search', {
      method: 'POST',
      headers: {
        'apikey': process.env.JOB_INFO_API,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: "Software Developer",
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`External API responded with status ${apiResponse.status}: ${errorText}`);
      throw new ApiError(apiResponse.status, `Failed to fetch jobs from external API. Status: ${apiResponse.status}, Message: ${errorText.substring(0, 100)}...`);
    }

    const apiJobsData = await apiResponse.json();
    console.log(`Successfully fetched ${apiJobsData.hits?.length || 0} jobs from external API.`);

    if (!apiJobsData.hits || !Array.isArray(apiJobsData.hits)) {
      console.error('Invalid API response format:', JSON.stringify(apiJobsData, null, 2));
      throw new ApiError(500, 'Invalid data format from external API.');
    }
    
    const fetchedJobs = apiJobsData.hits;
    let newJobsCount = 0;
    let updatedJobsCount = 0;
    let errorCount = 0;
    let validationErrors = [];

    for (const jobData of fetchedJobs) {
      try {
        console.log('Processing job:', jobData.id);
        
        // Validate required fields from API
        if (!jobData.id || !jobData.title || !jobData.description) {
          console.warn(`Skipping job ${jobData.id} - Missing required fields`);
          validationErrors.push({
            jobId: jobData.id,
            error: 'Missing required fields'
          });
          continue;
        }

        // Parse the job description
        const parsedJob = parseJobDescription(jobData.description);
        
        // Log parsed data for verification
        console.log('Parsed job data:', {
          jobCode: parsedJob.jobCode,
          essentialFunctions: parsedJob.essentialFunctions?.length,
          qualifications: parsedJob.qualifications?.length,
          preferredSkills: parsedJob.preferredSkills?.length
        });

        // Create the job document with proper formatting and validation
        const jobDocument = {
          // Required fields from API
          apijobsId: jobData.id,
          title: jobData.title?.trim() || 'Untitled Position',
          description: jobData.description?.trim() || '',
          url: jobData.url || '',
          publishedAt: jobData.published_at ? new Date(jobData.published_at) : new Date(),
          
          // Optional fields from API
          hiringOrganizationName: jobData.hiring_organization_name?.trim() || 'Unknown Company',
          hiringOrganizationLogo: jobData.hiring_organization_logo || '',
          website: jobData.website || '',
          websiteId: jobData.website_id || '',
          country: jobData.country?.trim() || '',
          region: jobData.region?.trim() || '',
          city: jobData.city?.trim() || '',
          
          // Parsed fields with proper validation
          jobCode: parsedJob.jobCode?.trim() || '',
          essentialFunctions: Array.isArray(parsedJob.essentialFunctions) 
            ? parsedJob.essentialFunctions
                .map(fn => fn.trim())
                .filter(Boolean)
            : [],
          qualifications: Array.isArray(parsedJob.qualifications)
            ? parsedJob.qualifications
                .map(q => q.trim())
                .filter(Boolean)
            : [],
          preferredSkills: Array.isArray(parsedJob.preferredSkills)
            ? parsedJob.preferredSkills
                .map(skill => skill.trim())
                .filter(Boolean)
            : [],
          salary: parsedJob.salary?.trim() || '',
          benefits: Array.isArray(parsedJob.benefits)
            ? parsedJob.benefits
                .map(benefit => benefit.trim())
                .filter(Boolean)
            : [],
          compliance: typeof parsedJob.compliance === 'string' 
            ? parsedJob.compliance.trim() 
            : Array.isArray(parsedJob.compliance)
              ? parsedJob.compliance.map(c => c.trim()).filter(Boolean)
              : '',
          employmentType: jobData.employment_type?.trim() || parsedJob.employmentType?.trim() || 'Full-time',
          
          // Timestamps
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Validate the document before saving
        const validationErrors = [];
        
        // Check required fields
        if (!jobDocument.apijobsId) validationErrors.push('Missing apijobsId');
        if (!jobDocument.title) validationErrors.push('Missing title');
        if (!jobDocument.description) validationErrors.push('Missing description');
        if (!jobDocument.url) validationErrors.push('Missing url');
        if (!jobDocument.publishedAt) validationErrors.push('Missing publishedAt');

        // Log validation errors if any
        if (validationErrors.length > 0) {
          console.error('Validation errors for job:', {
            apijobsId: jobDocument.apijobsId,
            errors: validationErrors
          });
          errorCount++;
          continue;
        }

        // First check if job exists
        const existingJob = await Job.findOne({ apijobsId: jobDocument.apijobsId });

        if (existingJob) {
          // Log the differences before update
          console.log('Updating existing job:', {
            id: existingJob._id,
            changes: {
              title: existingJob.title !== jobDocument.title,
              description: existingJob.description !== jobDocument.description,
              skills: existingJob.preferredSkills?.length !== jobDocument.preferredSkills?.length,
              parsedFields: {
                jobCode: existingJob.jobCode !== jobDocument.jobCode,
                essentialFunctions: existingJob.essentialFunctions?.length !== jobDocument.essentialFunctions?.length,
                qualifications: existingJob.qualifications?.length !== jobDocument.qualifications?.length,
                preferredSkills: existingJob.preferredSkills?.length !== jobDocument.preferredSkills?.length,
                benefits: existingJob.benefits?.length !== jobDocument.benefits?.length
              }
            }
          });

          // Update existing job
          const updatedJob = await Job.findByIdAndUpdate(
            existingJob._id,
            { 
              $set: {
                ...jobDocument,
                updatedAt: new Date()
              }
            },
            { 
              new: true,
              runValidators: true
            }
          );
          
          if (updatedJob) {
            updatedJobsCount++;
            console.log(`Successfully updated job with ID: ${updatedJob._id}`);
          } else {
            console.error(`Failed to update job ${existingJob._id}`);
            errorCount++;
          }
        } else {
          // Create new job
          const newJob = await Job.create(jobDocument);
          if (newJob) {
            newJobsCount++;
            console.log(`Successfully created new job with ID: ${newJob._id}`);
          } else {
            console.error(`Failed to create new job for ${jobDocument.apijobsId}`);
            errorCount++;
          }
        }
      } catch (innerError) {
        errorCount++;
        console.error(`Error processing job ${jobData.id}:`, innerError);
        console.error('Job data that caused error:', JSON.stringify(jobData, null, 2));
      }
    }

    console.log(`Job processing complete. New: ${newJobsCount}, Updated: ${updatedJobsCount}, Errors: ${errorCount}, Validation Errors: ${validationErrors.length}`);

    res.status(200).json(
      new ApiResponse(
        200,
        { 
          newJobs: newJobsCount, 
          updatedJobs: updatedJobsCount, 
          errorCount,
          validationErrors,
          totalFetched: fetchedJobs.length 
        },
        `Successfully processed jobs. New: ${newJobsCount}, Updated: ${updatedJobsCount}, Errors: ${errorCount}`
      )
    );

  } catch (error) {
    console.error('Fatal error in fetchAndStoreJobs:', error);
    console.error('Error stack:', error.stack);
    throw new ApiError(
      error.statusCode || 500, 
      error.message || "A problem occurred while fetching and storing jobs from external API.",
      error
    );
  }
});

export { getalljob, fetchAndStoreJobs };
