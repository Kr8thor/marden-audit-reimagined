import { createJob, updateJob, setJobCompleted, setJobResults } from '../_lib/storage.mjs';
import { generateId } from '../_lib/id.mjs';
import { auditWebsite } from '../audit.mjs';
  
export default async function handler(req, res) {
    // Check request method
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    // Get the URL and options from the request body
    const { url, options } = req.body;

    // Validate URL
    try {
        new URL(url);
    } catch (error) {
        return res.status(400).json({ status: 'error', message: 'Invalid URL provided' });
    }

    // Create job ID
    const jobId = generateId();
    const jobData = {
        id: jobId,
        type: 'page_audit',
        url,
        options: options || {},
        status: 'processing', // Changed status to 'processing'
        created: new Date().toISOString(),
    };

    try {
        // Create the job in Redis
        await createJob(jobData);

        // Return success response immediately
        res.status(202).json({
            status: 'success',
            message: 'Page audit job created',
            jobId,
            url,
        });

        // Execute the audit and update the job with results
        try {
            // Update job status to processing
            await updateJob(jobId, { status: 'processing' });

            // Perform the audit
            const auditResults = await auditWebsite(url, options);

            // Check for errors in audit results (optional)
            if (auditResults.status === 'error') {
                console.error('Audit failed:', auditResults.message);
                await updateJob(jobId, { status: 'failed', error: auditResults.message });
                return;
            }

            // Save the audit results
            await setJobResults(jobId, auditResults);

            // Mark the job as completed
            await setJobCompleted(jobId);

            console.log(`Audit completed successfully for job ${jobId}`);
        } catch (auditError) {
            console.error('Error during audit execution:', auditError);
            // Update the job with the error
            await updateJob(jobId, { status: 'failed', error: auditError.message });
        }

    } catch (error) {
        console.error('Error creating page audit job:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create page audit job',
            error: error.message,
        });
    }
}