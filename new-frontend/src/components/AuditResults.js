import React from 'react';

const AuditResults = ({ results }) => {
  return (
    <div>
      {results ? (
        <pre>{JSON.stringify(results, null, 2)}</pre>
      ) : (
        <p>No results yet.</p>
      )}
    </div>
  );
};

export default AuditResults;