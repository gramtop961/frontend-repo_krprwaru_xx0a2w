import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const colors = {
  surface: '#1E1F22',
  text: '#ECECEC',
};

export default function PasswordDialog({ open, items, onClose, onVerifiedAll }) {
  const [values, setValues] = useState({});
  const [verified, setVerified] = useState({});

  useEffect(() => {
    if (open) {
      setValues({});
      setVerified({});
    }
  }, [open]);

  const allOk = items.length > 0 && items.every(it => verified[it.id]);

  const handleVerify = (id) => {
    // Fake real-time validation: accept non-empty with length >= 4
    const ok = (values[id] || '').length >= 4;
    setVerified(v => ({ ...v, [id]: ok }));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="w-[min(720px,92vw)] max-h-[80vh] rounded-xl border border-white/10 overflow-hidden"
            style={{ background: colors.surface, color: colors.text }}
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="font-semibold">Password Verification</div>
              <div className="text-sm text-white/70">{Object.values(verified).filter(Boolean).length} / {items.length} verified</div>
            </div>
            <div className="p-5 space-y-3 overflow-auto max-h-[56vh] custom-scroll">
              {items.map((it) => {
                const ok = !!verified[it.id];
                return (
                  <div key={it.id} className={`rounded-lg border px-3 py-3 ${ok ? 'border-green-400/40 bg-green-400/10' : 'border-white/10 bg-black/20'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{it.title}</div>
                        <div className="text-xs text-white/60">Enter password for this item</div>
                      </div>
                      <div>
                        {ok ? <ShieldCheck className="w-5 h-5 text-green-300" /> : <ShieldAlert className="w-5 h-5 text-yellow-300" />}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        disabled={ok}
                        value={values[it.id] || ''}
                        onChange={(e) => setValues(v => ({ ...v, [it.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(it.id); }}
                        type="password"
                        placeholder="Enter password"
                        className={`flex-1 bg-black/30 border rounded-lg px-3 py-2 outline-none placeholder-white/30 ${ok ? 'border-green-500/40 text-green-200' : 'border-white/10'}`}
                      />
                      <button
                        disabled={ok}
                        onClick={() => handleVerify(it.id)}
                        className={`px-3 py-2 rounded-lg border ${ok ? 'border-green-400/50 bg-green-500/20 text-green-200' : 'border-white/10 bg-white/5 hover:bg-white/10 text-white'}`}
                      >
                        {ok ? <span className="inline-flex items-center gap-1"><Check className="w-4 h-4" /> Verified</span> : 'Verify'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">Cancel</button>
              <button
                onClick={onVerifiedAll}
                disabled={!allOk}
                className={`px-4 py-2 rounded-lg border ${allOk ? 'bg-red-500 hover:bg-red-600 text-white border-red-400/50' : 'bg-white/5 text-white/60 border-white/10 cursor-not-allowed'}`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
