import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = {
  bg: '#131314',
  surface: '#1E1F22',
  text: '#ECECEC',
  subtext: 'rgba(236,236,236,0.8)'
};

// Tiny base64 PNG placeholders representing game images
const sampleImages = [
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABeCAYAAACk8v2kAAAACXBIWXMAAAsSAAALEgHS3X78AAABxUlEQVR4nO3aMWrCQBCF4RQJfQqzqgJ9gH3gF7gLkqfBL4N0I3i2Wl0q5M2R4s0h4Gk6VqG1n0lG2m0Vt8b8e6i9k1h0qf1hDv3X2Oe7x9d3cZy8s3C3VgAAw3x9w0m9m8o6uA1m4bq0o9kWm0yq4vJr0l4b1Q3a6pV4u7kqv4e8Vv1p7zGv3b8Q0g9s+q1n8S0f4Yh5m+Qv1V5Vq1q6Wj4rGv9D5wz+2m2cJkq2UuN5sJxk9c5M1cW2Y0Qk2QbG3sQyH6l8qf9CqC1A6Jg9Vg8xv3mCw7kqz4sS2cZkqkX7c3bHqKq+oPaYbYk3vQJ6x9x6m7j3n3cKz0gGfEwqkqgkqgkqgkqgkqgkqgkqgkqgkpgbf0e5w2wcz0l8s2mQY0wXf2jzHkR5Q9i5qS1y3Xl5z5Gxj9X4d8k0m2Uzr0a6q9b2s1m0Y6k8Pj9k2v3r8wYq8I9wq0S8G+5v2Wl+o2z7m8qf8m6j9Yx0a0j0C8vWlv2y8f0gAHL8H4w9m3b0RblS5k+f8AAK4i3y5Zgkz8H5XvW1y8kY8xk5bAAAAAElFTkSuQmCC',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABeCAYAAACk8v2kAAAACXBIWXMAAAsSAAALEgHS3X78AAABj0lEQVR4nO3aMQ6CMBQF0b6h2z2D0gR0gqk6kK4gq6S0bqC1iUuLQz2C6d4Q8Qm6oB9c3b9l0mYp7Qq9n6K2Vv7z6f4d1tQAAw6oQy5r3z6rQ8o0b6qF7m3x8QbF8cQe9b1o8l6Sg9iKk2VJz4mQxUe8cYc5b0n8e0x5a0q6t5bGx8fV0f6Ew5Z1c1Yk7s6b8v6u9m4CkqgkqgkqgkqgkqgkqgkqgkqgkqgkrgJv7yWlS53wTg6o8d9p5m6wzq8m8Ybq9f7b8V4x5S0k2mU1b0b4z6o0k9m8c7Zk2n+J7f9U6q9E7Q5Zp8t+o7k2n4QKq3JkS2G3b0c3l7q2k2j8b9a8w6AAB2yV8g9eQ1p6sG3+AAA2g1S6r7V8U2Xn8cAAAAASUVORK5CYII=',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABeCAYAAACk8v2kAAAACXBIWXMAAAsSAAALEgHS3X78AAABmUlEQVR4nO3aS27CMBQF0b5QvQ5qYJQgqk6gR0gqE6gS6gqE6gO2O4Q8QXG8zGqS9m0b0o4bKV4W8p4tqz+e2H7t0AAIMrIStf/7vT0k2b1K3bQeVbK2o5zvD4x0l9qj9qU5b6k9mE0Z0b4Uq3mU1aY6k8g7n8m8k6a+T4VGQb2u7m3cY0k7m8l9z8a2u8b0gkqgkqgkqgkqgkqgkqgkqgkqgkqgksgG/5y3bXo4pW7b1w6m8r9b5l6a8c7b8m8o7a6p5Z4m2T6k0V6o9m3b7k4KpY7c6c6a6V5a3n8U6a0Q6o3E6YwY6k9P7c8Y0AAB6bH8g1fD3d7Q2rAAAEcT1S2a9k7j8bAAAAAElFTkSuQmCC'
];

function createNGrams(str, n = 2) {
  const s = str.toLowerCase();
  const grams = new Set();
  for (let i = 0; i < s.length - n + 1; i++) grams.add(s.slice(i, i + n));
  return grams;
}

function fuzzyScore(query, target) {
  // Prefix boost + ngram overlap + substring check
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 0;
  let score = 0;
  if (t.startsWith(q)) score += q.length * 2;
  if (t.includes(q)) score += q.length;
  const qg = createNGrams(q);
  const tg = createNGrams(t);
  let overlap = 0;
  qg.forEach(g => { if (tg.has(g)) overlap++; });
  score += overlap;
  return score;
}

export default function CarouselSection({ items, index, onPrev, onNext, selectedIds, onToggleSelect, onJumpTo }) {
  const [loading, setLoading] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const listRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    return items
      .map((it, i) => ({ ...it, i, score: fuzzyScore(debounced, it.title) }))
      .filter(r => debounced ? r.score > 0 : true)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }, [items, debounced]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.addEventListener('wheel', (e) => { e.stopPropagation(); }, { passive: true });
  }, []);

  const curr = items[index] || items[0];

  return (
    <div className="px-6 py-5" style={{ color: colors.text }}>
      {/* Image preview area */}
      <div className="relative mx-auto" style={{ maxWidth: 900 }}>
        <div className="relative mx-auto flex items-center justify-center overflow-hidden rounded-xl border border-white/10" style={{ background: colors.surface, height: 300 }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={curr.id}
              src={curr.image}
              alt={curr.title}
              className="object-contain max-h-full"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </AnimatePresence>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white/70" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button onClick={onPrev} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          <div className="text-sm text-white/70">{index + 1} / {items.length}</div>
          <button onClick={onNext} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
            <ChevronRight className="w-4 h-4" />
            <span>Next</span>
          </button>
        </div>

        {/* Carousel actions */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            onClick={() => onToggleSelect(curr.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${selectedIds.has(curr.id) ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'}`}
          >
            {selectedIds.has(curr.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {selectedIds.has(curr.id) ? 'Selected' : 'Select'}
          </button>
          <button
            onClick={() => setOpenSearch(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white"
          >
            <ChevronDown className="w-4 h-4" />
            <span>Open Search</span>
          </button>
        </div>

        {/* Search Popover */}
        <AnimatePresence>
          {openSearch && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mt-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl"
              style={{ background: colors.surface }}
            >
              <div className="px-3 py-2 border-b border-white/10">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search games..."
                  className="w-full bg-transparent outline-none text-sm placeholder-white/40"
                  style={{ color: colors.text }}
                />
              </div>
              <div ref={listRef} className="max-h-72 overflow-auto custom-scroll">
                {results.slice(0, 200).map((r) => {
                  const isSel = selectedIds.has(r.id);
                  const s = Math.min(1, r.score / 10);
                  const highlight = `rgba(255, 99, 99, ${0.1 + s * 0.4})`;
                  return (
                    <div
                      key={r.id}
                      onClick={() => { onJumpTo(r.i); setOpenSearch(false); }}
                      onContextMenu={(e) => { e.preventDefault(); onToggleSelect(r.id); }}
                      className="flex items-center justify-between px-3 py-2 cursor-pointer select-none border-b border-white/5 hover:bg-white/5"
                      style={{ background: isSel ? 'rgba(16,185,129,0.12)' : undefined }}
                      title="Left click: navigate • Right click: toggle selection"
                    >
                      <div className="min-w-0">
                        <div className="truncate" style={{ color: colors.text }}>
                          <span className="rounded px-1 mr-2" style={{ background: highlight }}>#{r.i + 1}</span>
                          {r.title}
                        </div>
                        <div className="text-xs text-white/40">Score: {r.score}</div>
                      </div>
                      <div className={`ml-2 w-6 h-6 rounded-md border flex items-center justify-center ${isSel ? 'border-green-400/50 bg-green-400/20' : 'border-white/15'}`}>
                        {isSel && <Check className="w-4 h-4 text-green-300" />}
                      </div>
                    </div>
                  );
                })}
                {results.length === 0 && (
                  <div className="px-3 py-6 text-center text-white/50 text-sm">No matches</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper to generate demo items
export function buildDemoItems() {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: `game-${i + 1}`,
    title: `Game ${i + 1}`,
    image: sampleImages[i % sampleImages.length]
  }));
}
