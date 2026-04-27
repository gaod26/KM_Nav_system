import { useState, useRef, useEffect } from 'react'
import './LocationInput.css'

function LocationInput({ label, value, onChange, rooms, placeholder, disabled }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredRooms, setFilteredRooms] = useState([])
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRooms(rooms)
    } else {
      const filtered = rooms.filter(room =>
        room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredRooms(filtered)
    }
  }, [searchTerm, rooms])

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (roomId) => {
    onChange(roomId)
    setSearchTerm('')
    setShowDropdown(false)
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
  }

  const selectedRoom = rooms.find(r => r.id === value)

  return (
    <div className="location-input">
      <label className="location-label">
        {label}
      </label>

      {!value ? (
        <div className="location-search">
          <input
            ref={inputRef}
            type="text"
            className="location-input-field"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            disabled={disabled}
          />

          {showDropdown && filteredRooms.length > 0 && (
            <div ref={dropdownRef} className="location-dropdown">
              {filteredRooms.map(room => (
                <button
                  key={room.id}
                  className="location-option"
                  onClick={() => handleSelect(room.id)}
                  type="button"
                >
                  <span className="room-id">{room.id}</span>
                  <span className="room-name">{room.name}</span>
                  <span className={`room-type type-${room.type}`}>
                    {room.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="location-selected">
          <div className="selected-room">
            <span className="selected-id">{selectedRoom?.id}</span>
            <span className="selected-name">{selectedRoom?.name}</span>
          </div>
          <button
            className="clear-button"
            onClick={handleClear}
            disabled={disabled}
            type="button"
            aria-label="Clear selection"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

export default LocationInput
