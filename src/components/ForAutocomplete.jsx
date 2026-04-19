import React, { useState, useEffect, useRef } from 'react';
import { initials, avClass, buildAcHint } from '../utils/helpers';

export default function ForAutocomplete({ customer, value, onChange, onSelect }) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const wrapRef = useRef(null);

  const knownNames = React.useMemo(() => {
    if (!customer) return [];
    const sz = customer.Sizes || {};
    return [...new Set([...Object.keys(sz.Shirts || {}), ...Object.keys(sz.Pants || {})])];
  }, [customer]);

  const matches = value
    ? knownNames.filter(n => n.toLowerCase().includes(value.toLowerCase()))
    : knownNames;

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(name) {
    onChange(name);
    onSelect(name);
    setOpen(false);
    setFocusIdx(-1);
  }

  function handleKeyDown(e) {
    if (!open || !matches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx(i => Math.min(i + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && focusIdx >= 0) {
      e.preventDefault();
      handleSelect(matches[focusIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showDropdown = open && (matches.length > 0 || value.trim());

  return (
    <div className="ac-wrap" ref={wrapRef}>
      <input
        type="text"
        value={value}
        placeholder="e.g. Ajit, Sagar…"
        autoComplete="off"
        onChange={e => { onChange(e.target.value); setOpen(true); setFocusIdx(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {showDropdown && (
        <div className="ac-dropdown">
          {matches.length > 0
            ? matches.map((name, i) => (
                <div
                  key={name}
                  className={`ac-item${i === focusIdx ? ' focused' : ''}`}
                  onMouseDown={() => handleSelect(name)}
                >
                  <div className={`ac-avatar ${avClass(name)}`}>{initials(name)}</div>
                  <div>
                    <div className="ac-name">{name}</div>
                    <div className="ac-hint">{buildAcHint(customer, name)}</div>
                  </div>
                </div>
              ))
            : <div className="ac-new">New profile — sizes will be saved</div>
          }
        </div>
      )}
    </div>
  );
}
