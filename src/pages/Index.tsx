<CODE_BLOCK>
import React, { useState } from 'react';
import { useAuditNew } from '../hooks/useAuditNew';
import { CircularProgress } from '../components/CircularProgress'; 

const IndexPage: React.FC = () => {
  const { results, status, error, runAudit } = useAuditNew();
  const [url, setUrl] = useState('');

  const handlePageAudit = () => {
    console.log(`handlePageAudit - URL: ${url}, type: page`);
    runAudit(url, "page");
  };

  const handleSiteAudit = () => {
    console.log(`handleSiteAudit - URL: ${url}, type: site`);
    runAudit(url, "site");
  };

  return (
    <div>
      <h1>SEO Audit</h1>
      <form>
        <div>
          <label htmlFor="url">URL:</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
          />
        </div>
        <div>
          <button type="button" onClick={handlePageAudit}>
            Audit Page
          </button>
          <button type="button" onClick={handleSiteAudit}>
            Audit Site
          </button>
        </div>
      </form>

      {status === 'loading' && (
        <div>
          <CircularProgress />
          <p>Loading...</p>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p>Error: {error?.toString()}</p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <h2>Results:</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
</CODE_BLOCK>