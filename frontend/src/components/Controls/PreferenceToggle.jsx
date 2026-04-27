import './PreferenceToggle.css'

function PreferenceToggle({ value, onChange, disabled }) {
  const options = [
    { value: 'no_preference', label: 'No Preference', icon: '🚶' },
    { value: 'stairs', label: 'Prefer Stairs', icon: '🪜' },
    { value: 'elevator', label: 'Prefer Elevator', icon: '🛗' }
  ]

  return (
    <div className="preference-toggle">
      <label className="preference-label">
        Movement Preference
      </label>
      <p className="preference-description">
        Choose your preferred method for floor transitions
      </p>

      <div className="preference-options">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            className={`preference-option ${value === option.value ? 'active' : ''}`}
            onClick={() => onChange(option.value)}
            disabled={disabled}
          >
            <span className="preference-icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="preference-label-text">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PreferenceToggle
