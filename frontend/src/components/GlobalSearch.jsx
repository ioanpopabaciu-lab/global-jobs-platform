import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, Building2, Briefcase, FolderKanban, FileText, Globe, Loader2 } from 'lucide-react';

const CATEGORY_CONFIG = {
  candidates: { label: 'Candidati', icon: Users, color: 'text-blue-600 bg-blue-50' },
  employers: { label: 'Angajatori', icon: Building2, color: 'text-purple-600 bg-purple-50' },
  jobs: { label: 'Joburi', icon: Briefcase, color: 'text-green-600 bg-green-50' },
  placements: { label: 'Plasamente', icon: FolderKanban, color: 'text-orange-600 bg-orange-50' },
  migration_clients: { label: 'Clienti Migratie', icon: Globe, color: 'text-teal-600 bg-teal-50' },
  migration_cases: { label: 'Dosare Migratie', icon: Globe, color: 'text-cyan-600 bg-cyan-50' },
  documents: { label: 'Documente', icon: FileText, color: 'text-gray-600 bg-gray-50' },
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Flatten results for keyboard navigation
  const flatResults = results
    ? Object.entries(results).flatMap(([cat, items]) =>
        items.map((item) => ({ ...item, category: cat }))
      )
    : [];

  // Ctrl+K to focus
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  const doSearch = useCallback(
    async (q) => {
      if (q.length < 2) {
        setResults(null);
        setLoading(false);
        return;
      }

      // Cancel previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/admin/search?q=${encodeURIComponent(q)}&limit=5`,
          { credentials: 'include', signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
          setSelectedIndex(-1);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open || flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i < flatResults.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const item = flatResults[selectedIndex];
      if (item?.link) {
        navigate(item.link);
        setOpen(false);
        setQuery('');
      }
    }
  };

  const handleItemClick = (item) => {
    if (item?.link) {
      navigate(item.link);
      setOpen(false);
      setQuery('');
    }
  };

  const totalResults = flatResults.length;

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xl">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cauta in tot CRM-ul... (Ctrl+K)"
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     shadow-sm placeholder:text-gray-400"
        />
        {loading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 max-h-[70vh] overflow-y-auto z-50">
          {totalResults === 0 && !loading && (
            <div className="p-6 text-center text-gray-500 text-sm">
              Niciun rezultat pentru „{query}"
            </div>
          )}

          {results &&
            Object.entries(results).map(([category, items]) => {
              const config = CATEGORY_CONFIG[category] || {
                label: category,
                icon: Search,
                color: 'text-gray-600 bg-gray-50',
              };
              const Icon = config.icon;

              return (
                <div key={category}>
                  {/* Category header */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color.split(' ')[0]}`} />
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400">({items.length})</span>
                  </div>

                  {/* Items */}
                  {items.map((item) => {
                    const flatIdx = flatResults.findIndex(
                      (f) => f.id === item.id && f.category === category
                    );
                    const isSelected = flatIdx === selectedIndex;

                    return (
                      <button
                        key={`${category}-${item.id}`}
                        onClick={() => handleItemClick(item)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-50 transition-colors
                          ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-lg ${config.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {highlightMatch(item.title, query)}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        {item.status && (
                          <StatusBadge status={item.status} />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}

          {/* Footer hint */}
          {totalResults > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>{totalResults} rezultate</span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">↑↓</kbd>{' '}
                navigare{' '}
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">Enter</kbd>{' '}
                deschide{' '}
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">Esc</kbd>{' '}
                inchide
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Highlight matching text
function highlightMatch(text, query) {
  if (!text || !query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-gray-900 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// Status badge
function StatusBadge({ status }) {
  const colors = {
    validated: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    pending_validation: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-red-100 text-red-600',
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-orange-100 text-orange-700',
    filled: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  };
  const c = colors[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${c}`}>
      {status}
    </span>
  );
}
