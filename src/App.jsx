import { useCallback, useEffect, useMemo, useState } from 'react';
import HeaderSection from './components/HeaderSection.jsx';
import CarouselSection, { buildDemoItems } from './components/CarouselSection.jsx';
import FileSection from './components/FileSection.jsx';
import PasswordDialog from './components/PasswordDialog.jsx';

const colors = {
  bg: '#131314',
  surface: '#1E1F22',
  text: '#ECECEC',
};

export default function App() {
  const items = useMemo(() => buildDemoItems(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [outputPath, setOutputPath] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [extracting, setExtracting] = useState(false);

  const onPrev = useCallback(() => setIndex(i => (i - 1 + items.length) % items.length), [items.length]);
  const onNext = useCallback(() => setIndex(i => (i + 1) % items.length), [items.length]);
  const onToggleSelect = useCallback((id) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);
  const onJumpTo = useCallback((i) => setIndex(i), []);

  const selectedItems = useMemo(() => items.filter(it => selected.has(it.id)), [items, selected]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'Enter') setShowPwd(true);
      if (e.key === 'Escape') setShowPwd(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPrev, onNext]);

  // Fake auto-deletion countdown
  useEffect(() => {
    if (!extracting) return;
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [extracting]);

  const handleSubmit = () => {
    setShowPwd(true);
  };

  const handleVerifiedAll = () => {
    setShowPwd(false);
    setExtracting(true);
    // Simulate success confirmation
    setTimeout(() => {
      alert('Extraction complete. Files will auto-delete after the countdown.');
    }, 500);
  };

  return (
    <div className="min-h-screen" style={{ background: colors.bg, color: colors.text }}>
      <div className="mx-auto" style={{ maxWidth: 1200, minWidth: 700, minHeight: 650 }}>
        <HeaderSection />

        <CarouselSection
          items={items}
          index={index}
          onPrev={onPrev}
          onNext={onNext}
          selectedIds={selected}
          onToggleSelect={onToggleSelect}
          onJumpTo={onJumpTo}
        />

        <FileSection
          outputPath={outputPath}
          setOutputPath={setOutputPath}
          onSubmit={handleSubmit}
          countdown={countdown}
          selectedItems={selectedItems}
          onRemove={(id) => setSelected(prev => { const n = new Set(prev); n.delete(id); return n; })}
        />
      </div>

      <PasswordDialog
        open={showPwd}
        items={selectedItems}
        onClose={() => setShowPwd(false)}
        onVerifiedAll={handleVerifiedAll}
      />

      {/* Global styles for custom scrollbars */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 999px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
