import React, { useState } from 'react';

const AuditForm = ({ onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL to audit"
      />
      <button type="submit">Audit</button>
    </form>
  );
};

export default AuditForm;