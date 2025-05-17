import React, { useState } from 'react';

const SearchForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    startDate: '2025-04-01',
    endDate: '2025-05-01',
    dimensions: ['country', 'device'],
  });

  const [formError, setFormError] = useState(null);

  const dimensionOptions = ['country', 'device', 'page', 'query', 'date'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDimensionChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData({ ...formData, dimensions: selected });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate dates
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div>
      {formError && <div className="form-error-message">{formError}</div>}
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dimensions">Dimensions</label>
          <select
            id="dimensions"
            name="dimensions"
            multiple
            value={formData.dimensions}
            onChange={handleDimensionChange}
          >
            {dimensionOptions.map(dim => (
              <option key={dim} value={dim}>{dim}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-button">
          Fetch Data
        </button>
      </form>
    </div>
  );
};

export default SearchForm;