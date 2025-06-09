import Job from '../models/job.model.js';
import ApiError from "../utils/Apierror.js";
import ApiResponse from "../utils/apiresponse.js";
import asynchandler from "../utils/asynchandler.js";


const getalljob = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object based on query parameters
    const filter = {};
    
    // Search query (title or description)
    if (req.query.q) {
      filter.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } }
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

      // Match against title or description
      filter.$or = [
        { title: { $in: roleVariations.map(role => new RegExp(role, 'i')) } },
        { description: { $in: roleVariations.map(role => new RegExp(role, 'i')) } }
      ];

      // If we already have a search query, combine it with role filter
      if (req.query.q) {
        filter.$and = [
          { $or: [
            { title: { $regex: req.query.q, $options: 'i' } },
            { description: { $regex: req.query.q, $options: 'i' } }
          ]},
          { $or: [
            { title: { $in: roleVariations.map(role => new RegExp(role, 'i')) } },
            { description: { $in: roleVariations.map(role => new RegExp(role, 'i')) } }
          ]}
        ];
      }
    }

    // Skills filter
    if (req.query.skills) {
      const skillsArray = req.query.skills.split(',').map(skill => skill.trim());
      filter.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
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
        q: "Software Developer", // Example query, you might want to make this dynamic or fetch a wider range
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text(); // Get raw error text
      console.error(`External API responded with status ${apiResponse.status}: ${errorText}`);
      throw new ApiError(apiResponse.status, `Failed to fetch jobs from external API. Status: ${apiResponse.status}, Message: ${errorText.substring(0, 100)}...`);
    }
   // console.log(apiResponse);

    const apiJobsData = await apiResponse.json();
    // await fs.writeFile('api_response_debug.json', JSON.stringify(apiJobsData, null, 2)); // Remove fs.writeFile
    // console.log('Current Working Directory:', process.cwd()); // Remove cwd log
    // console.log('Full API response written to Backend/api_response_debug.json');
    console.log(`Successfully fetched ${apiJobsData.hits?.length || 0} jobs from external API.`);
    //console.log(apiJobsData.jobs);
    if (!apiJobsData.hits || !Array.isArray(apiJobsData.hits)) {
      // console.error('Debug: apiJobsData.jobs is:', apiJobsData.jobs);
      // console.error('Debug: Array.isArray(apiJobsData.jobs) is:', Array.isArray(apiJobsData.jobs));
      console.error('Invalid API response format:', JSON.stringify(apiJobsData, null, 2));
      throw new ApiError(500, 'Invalid data format from external API.');
    }
    
    const fetchedJobs = apiJobsData.hits;
    let newJobsCount = 0;
    let updatedJobsCount = 0;
    let errorCount = 0;

    for (const jobData of fetchedJobs) {
      try {
        console.log('Processing job:', jobData.id);
        
        // Map external API data (snake_case) to Mongoose Job model schema (camelCase)
        const mappedJob = {
          apijobsId: jobData.id,
          title: jobData.title,
          description: jobData.description,
          url: jobData.url,
          publishedAt: jobData.published_at,
          hiringOrganizationName: jobData.hiring_organization_name,
          hiringOrganizationLogo: jobData.hiring_organization_logo,
          website: jobData.website,
          websiteId: jobData.website_id,
          country: jobData.country,
          region: jobData.region,
          city: jobData.city,
          createdAt: jobData.created_at
        };

        console.log('Mapped job data:', JSON.stringify(mappedJob, null, 2));

        // Find and update, or insert if not found (upsert)
        const result = await Job.findOneAndUpdate(
          { apijobsId: mappedJob.apijobsId },
          { $set: mappedJob },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        if (result && result._id) {
          if (result.createdAt.getTime() === result.updatedAt.getTime()) {
            newJobsCount++;
            console.log(`Created new job with ID: ${result._id}`);
          } else {
            updatedJobsCount++;
            console.log(`Updated existing job with ID: ${result._id}`);
          }
        }
      } catch (innerError) {
        errorCount++;
        console.error(`Error processing job ${jobData.id}:`, innerError);
        console.error('Job data that caused error:', JSON.stringify(jobData, null, 2));
      }
    }

    console.log(`Job processing complete. New: ${newJobsCount}, Updated: ${updatedJobsCount}, Errors: ${errorCount}`);

    res.status(200).json(
      new ApiResponse(
        200,
        { 
          newJobs: newJobsCount, 
          updatedJobs: updatedJobsCount, 
          errorCount,
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
