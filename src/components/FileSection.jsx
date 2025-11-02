import { FolderOpen, Play, Info, X } from 'lucide-react';

const colors = {
  bg: '#131314',
  surface: '#1E1F22',
  text: '#ECECEC',
};

export default function FileSection({ outputPath, setOutputPath, onSubmit, countdown, selectedItems, onRemove }) {
  return (
    <div className="px-6 pb-6" style={{ color: colors.text }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* File management */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 p-4" style={{ background: colors.surface }}>
          <div className="text-sm text-white/70 mb-2">Current output path</div>
          <div className="flex items-center gap-2">
            <input
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
              placeholder="Choose a folder..."
              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none placeholder-white/30"
            />
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">
              <FolderOpen className="w-4 h-4" />
              Browse
            </button>
            <button
              onClick={onSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white border border-red-400/50 shadow"
            >
              <Play className="w-4 h-4" />
              Submit & Extract
            </button>
          </div>
          <div className="mt-2 text-xs text-white/60 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            Auto-delete after: {countdown}s
          </div>
        </div>

        {/* Selected items */}
        <div className="rounded-xl border border-white/10 p-4" style={{ background: colors.surface }}>
          <details open>
            <summary className="cursor-pointer text-sm text-white/80">Selected Games ({selectedItems.length})</summary>
            <div className="mt-3 max-h-48 overflow-auto space-y-2 custom-scroll">
              {selectedItems.length === 0 && (
                <div className="text-white/40 text-sm">Nothing selected yet.</div>
              )}
              {selectedItems.map((it) => (
                <div key={it.id} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 border border-white/10">
                  <div className="truncate text-sm">{it.title}</div>
                  <button onClick={() => onRemove(it.id)} className="ml-2 p-1 rounded-md hover:bg-white/10">
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
