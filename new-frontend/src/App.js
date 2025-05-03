import React, { useState } from 'react';
import AuditForm from './components/AuditForm';
import AuditResults from './components/AuditResults';
import fetchAuditResults from './services/api';

function App() {
  const [results, setResults] = useState({});

  const handleSubmit = async (url) => {

    const auditResults = await fetchAuditResults(url);
    setResults(auditResults);
  };

  return (
    <div className="App">
      <AuditForm onSubmit={handleSubmit} />
      <AuditResults results={results} />
    </div>
  );
}

export default App;
