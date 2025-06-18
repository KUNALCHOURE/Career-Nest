import Job from '../models/job.model.js';
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asynchandler from "../utils/asynchandler.js";
import { parseJobDescription } from "../utils/jobParser.js";


const getalljob = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const andConditions = [];
    
    // Enhanced text search with better handling of software development queries
    if (req.query.q) {
      const searchTerms = req.query.q.toLowerCase().split(' ').filter(term => term.length > 0);
      
      // Common variations and synonyms for software development
      const roleVariations = {
        'software': ['software', 'sw', 's/w', 'soft'],
        'development': ['development', 'dev', 'developing', 'developer'],
        'engineer': ['engineer', 'engineering', 'eng', 'engg'],
        'programming': ['programming', 'programmer', 'program', 'prog'],
        'developer': ['developer', 'dev', 'developing', 'development'],
        'fullstack': ['fullstack', 'full-stack', 'full stack', 'full stack developer'],
        'frontend': ['frontend', 'front-end', 'front end', 'front end developer'],
        'backend': ['backend', 'back-end', 'back end', 'back end developer'],
        'web': ['web', 'web developer', 'web development'],
        'mobile': ['mobile', 'mobile developer', 'mobile development'],
        'application': ['application', 'app', 'applications', 'apps']
      };

      // Generate search conditions for each term
      const searchConditions = searchTerms.map(term => {
        const variations = roleVariations[term] || [term];
        return {
          $or: [
            { title: { $regex: variations.join('|'), $options: 'i' } },
            { description: { $regex: variations.join('|'), $options: 'i' } },
            { qualifications: { $regex: variations.join('|'), $options: 'i' } },
            { essentialFunctions: { $regex: variations.join('|'), $options: 'i' } },
            { preferredSkills: { $regex: variations.join('|'), $options: 'i' } },
            { hiringOrganizationName: { $regex: variations.join('|'), $options: 'i' } }
          ]
        };
      });

      andConditions.push({ $and: searchConditions });
    }

    // Enhanced location filters with hierarchical matching
    if (req.query.city || req.query.region || req.query.country) {
      const locationConditions = [];
      
      if (req.query.city) {
        const cities = req.query.city.split(',').map(city => city.trim());
        locationConditions.push({
          $or: cities.map(city => ({
            city: { $regex: city, $options: 'i' }
          }))
        });
      }

      if (req.query.region) {
        const regions = req.query.region.split(',').map(region => region.trim());
        locationConditions.push({
          $or: regions.map(region => ({
            region: { $regex: region, $options: 'i' }
          }))
        });
      }

      if (req.query.country) {
        const countries = req.query.country.split(',').map(country => country.trim());
        locationConditions.push({
          $or: countries.map(country => ({
            country: { $regex: country, $options: 'i' }
          }))
        });
      }

      if (locationConditions.length > 0) {
        andConditions.push({ $and: locationConditions });
      }
    }

    // Enhanced employment type filter
    if (req.query.employmentType) {
      const types = req.query.employmentType.split(',').map(type => type.trim());
      const employmentTypes = types.map(type => {
        switch(type.toLowerCase()) {
          case 'fulltime':
          case 'full-time':
            return 'Full-time';
          case 'parttime':
          case 'part-time':
            return 'Part-time';
          case 'contract':
            return 'Contract';
          case 'internship':
            return 'Internship';
          default:
            return type;
        }
      });
      andConditions.push({ employmentType: { $in: employmentTypes } });
    }

    // Workplace type filter
    if (req.query.workplaceType) {
      const types = req.query.workplaceType.split(',').map(type => type.trim());
      andConditions.push({
        $or: types.map(type => ({
          workplaceType: { $regex: type, $options: 'i' }
        }))
      });
    }

    // Enhanced salary range filter
    if (req.query.minSalary || req.query.maxSalary || req.query.salaryCurrency) {
      const salaryFilter = {};
      
      if (req.query.minSalary) {
        const minSalary = parseInt(req.query.minSalary.replace(/[^0-9]/g, ''));
        if (!isNaN(minSalary)) {
          salaryFilter.$gte = minSalary;
        }
      }
      
      if (req.query.maxSalary) {
        const maxSalary = parseInt(req.query.maxSalary.replace(/[^0-9]/g, ''));
        if (!isNaN(maxSalary)) {
          salaryFilter.$lte = maxSalary;
        }
      }

      if (req.query.salaryCurrency) {
        salaryFilter.currency = req.query.salaryCurrency.toUpperCase();
      }

      if (Object.keys(salaryFilter).length > 0) {
        andConditions.push({ salary: salaryFilter });
      }
    }

    // Experience level filter
    if (req.query.experienceLevel) {
      const levels = req.query.experienceLevel.split(',').map(level => level.trim());
      andConditions.push({
        $or: levels.map(level => ({
          experienceLevel: { $regex: level, $options: 'i' }
        }))
      });
    }

    // Education level filter
    if (req.query.educationLevel) {
      const levels = req.query.educationLevel.split(',').map(level => level.trim());
      andConditions.push({
        $or: levels.map(level => ({
          educationLevel: { $regex: level, $options: 'i' }
        }))
      });
    }

    // Industry sector filter
    if (req.query.industry) {
      const industries = req.query.industry.split(',').map(industry => industry.trim());
      andConditions.push({
        $or: industries.map(industry => ({
          industry: { $regex: industry, $options: 'i' }
        }))
      });
    }

    // Company filter
    if (req.query.company) {
      const companies = req.query.company.split(',').map(company => company.trim());
      andConditions.push({
        $or: companies.map(company => ({
          hiringOrganizationName: { $regex: company, $options: 'i' }
        }))
      });
    }

    // Date posted filter
    if (req.query.postedWithin) {
      const days = parseInt(req.query.postedWithin.replace(/[^0-9]/g, ''));
      if (!isNaN(days)) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        andConditions.push({ publishedAt: { $gte: dateThreshold } });
      }
    }

    // Combine all conditions with $and
    const finalFilter = andConditions.length > 0 ? { $and: andConditions } : {};

    // Enhanced sorting options
    const sortOptions = {
      salary: { salary: 1 },
      publishedAt: { publishedAt: -1 },
      experience: { 'experienceRequired.min': 1 },
      relevance: { score: { $meta: "textScore" } }
    };

    const sortBy = req.query.sortBy || 'relevance';
    const order = req.query.order === 'asc' ? 1 : -1;
    const sort = sortOptions[sortBy] 
      ? { ...sortOptions[sortBy], [Object.keys(sortOptions[sortBy])[0]]: order } 
      : sortOptions.relevance;

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalJobs / limit);

    // Get jobs with filters, sorting, and pagination
    const jobs = await Job.find(finalFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Prepare facets for aggregation
    const facets = {
      employmentTypes: await Job.distinct('employmentType', finalFilter),
      locations: await Job.distinct('city', finalFilter),
      companies: await Job.distinct('hiringOrganizationName', finalFilter),
      industries: await Job.distinct('industry', finalFilter)
    };

    res.status(200).json(new ApiResponse(200, {
      jobs,
      currentPage: page,
      totalPages,
      totalJobs,
      facets,
      filters: {
        applied: Object.keys(req.query).length > 0 ? req.query : null,
        totalResults: totalJobs
      }
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

const getJobById = asynchandler(async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw new ApiError(400, "Job ID is required");
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  res.status(200).json(
    new ApiResponse(200, job, "Job fetched successfully")
  );
});

export { getalljob, fetchAndStoreJobs, getJobById };
