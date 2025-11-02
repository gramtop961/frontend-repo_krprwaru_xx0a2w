import { memo } from 'react';
import Spline from '@splinetool/react-spline';

const colors = {
  bg: '#131314',
  surface: '#1E1F22',
  text: '#ECECEC',
  subtext: 'rgba(236,236,236,0.7)'
};

function HeaderSection() {
  return (
    <div className="relative w-full" style={{ minHeight: 220 }}>
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/hinHjJppKaZFIbCr/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Gradient overlay to improve text contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/70" />

      <div className="relative z-10 flex items-center gap-4 px-6 py-6">
        <div className="shrink-0 w-16 h-16 rounded-xl bg-[rgba(30,31,34,0.8)] backdrop-blur border border-white/10 flex items-center justify-center">
          {/* 64x64 Icon block */}
          <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-400/40" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate" style={{ color: colors.text, fontFamily: 'Segoe UI, Inter, system-ui, -apple-system, sans-serif', fontWeight: 800, fontSize: 24 }}>
            Steam-RawAccess
          </h1>
          <p className="mt-1" style={{ color: colors.subtext, fontFamily: 'Segoe UI, Inter, system-ui, -apple-system, sans-serif' }}>
            By DraggiS
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(HeaderSection);
