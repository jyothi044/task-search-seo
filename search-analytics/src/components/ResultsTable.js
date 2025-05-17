import React from 'react';

const ResultsTable = ({ results, dimensions }) => {
  // Ensure dimensions and results are valid
  if (!results || results.length === 0 || !dimensions || dimensions.length === 0) {
    return null;
  }

  return (
    <div className="results-table-container">
      <h2>Results</h2>
      <table className="results-table">
        <thead>
          <tr>
            {dimensions.map((_, index) => (
              <th key={index}>{dimensions[index]}</th>
            ))}
            <th>Clicks</th>
            <th>Impressions</th>
            <th>CTR</th>
            <th>Position</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => (
            <tr key={index}>
              {row.keys.map((key, i) => (
                <td key={i}>{key}</td>
              ))}
              <td>{row.clicks ?? 'N/A'}</td>
              <td>{row.impressions ?? 'N/A'}</td>
              <td>{row.ctr ? `${(row.ctr * 100).toFixed(2)}%` : 'N/A'}</td>
              <td>{row.position ? row.position.toFixed(2) : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;