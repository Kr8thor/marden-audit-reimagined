import axios from 'axios';

const fetchAuditResults = async (url) => {
  try {
    const response = await axios.post('https://marden-audit-backend-se9t.vercel.app/api/audit/page', { url });
    return response.data;
  } catch (error) {
    console.error('Error fetching audit results:', error);
    return {}; // Return an empty object in case of error
  }
};

export default fetchAuditResults;