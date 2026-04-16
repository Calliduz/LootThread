import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit2, Trash2, Tag, RefreshCw, CheckCircle, XCircle,
  AlertTriangle, Loader2, ToggleLeft, ToggleRight, BadgePercent, Shield, Clock, Users, Zap,
} from 'lucide-react';
import { getAllPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from '../../api/endpoints';
import { PromoCode } from '../../types/api';
import toast from 'react-hot-toast';

// ─── Empty Form State ─────────────────────────────────────────────────────────
const emptyForm = (): Partial<PromoCode> => ({
  code: '',
  description: '',
  discountPercent: 10,
  minLevel: 0,
  expiryDate: null,
  usageLimit: null,
  isActive: true,
});

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ code }: { code: PromoCode }) {
  const isExpired = code.expiryDate && new Date(code.expiryDate) < new Date();
  const isExhausted = code.usageLimit !== null && code.usedCount >= (code.usageLimit ?? Infinity);
  if (!code.isActive) return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/5 text-white/30 border border-white/10 px-2.5 py-1 rounded-lg"><XCircle className="w-3 h-3" />Inactive</span>;
  if (isExpired) return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg"><Clock className="w-3 h-3" />Expired</span>;
  if (isExhausted) return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-lg"><AlertTriangle className="w-3 h-3" />Limit Reached</span>;
  return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-lg"><CheckCircle className="w-3 h-3" />Active</span>;
}

// ─── Edit / Create Modal ───────────────────────────────────────────────────────
function PromoModal({ initial, onClose, onSave }: {
  initial: Partial<PromoCode> | null;
  onClose: () => void;
  onSave: (data: Partial<PromoCode>) => Promise<void>;
}) {
  const isNew = !initial?.id;
  const [form, setForm] = useState<Partial<PromoCode>>(initial ? { ...initial } : emptyForm());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 placeholder-white/20 transition-all";
  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="bg-bg-card border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-brand-primary/10 border border-brand-primary/20 rounded-xl flex items-center justify-center">
            <BadgePercent className="w-4 h-4 text-brand-primary" />
          </div>
          <h2 className="text-base font-black uppercase italic tracking-tighter text-white">
            {isNew ? 'Create Promo Code' : `Edit — ${initial?.code}`}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Code *</label>
              <input
                required value={form.code ?? ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. LOOT20" className={`${inputCls} font-mono tracking-widest uppercase`}
                disabled={!isNew}
              />
            </div>
            <div>
              <label className={labelCls}>Discount % *</label>
              <input
                required type="number" min={1} max={100} value={form.discountPercent ?? 10}
                onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description (Admin Notes)</label>
            <input
              value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Level 5 reward for loyal customers" className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls + ' flex items-center gap-1'}><Zap className="w-3 h-3 text-brand-primary" />Min. Level Required</label>
              <input
                type="number" min={0} value={form.minLevel ?? 0}
                onChange={e => setForm({ ...form, minLevel: Number(e.target.value) })}
                className={inputCls}
              />
              <p className="text-[9px] text-white/20 mt-1">0 = anyone can use</p>
            </div>
            <div>
              <label className={labelCls + ' flex items-center gap-1'}><Users className="w-3 h-3 text-brand-primary" />Usage Limit</label>
              <input
                type="number" min={1} value={form.usageLimit ?? ''}
                onChange={e => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })}
                placeholder="Unlimited" className={inputCls}
              />
              <p className="text-[9px] text-white/20 mt-1">Leave blank for unlimited</p>
            </div>
          </div>

          <div>
            <label className={labelCls + ' flex items-center gap-1'}><Clock className="w-3 h-3 text-brand-primary" />Expiry Date</label>
            <input
              type="datetime-local"
              value={form.expiryDate ? new Date(form.expiryDate).toISOString().slice(0, 16) : ''}
              onChange={e => setForm({ ...form, expiryDate: e.target.value || null })}
              className={inputCls}
              style={{ colorScheme: 'dark' }}
            />
            <p className="text-[9px] text-white/20 mt-1">Leave blank for no expiry</p>
          </div>

          <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">Active</p>
              <p className="text-[10px] text-white/30">Enable or disable this code</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className="text-brand-primary hover:opacity-80 transition-opacity"
            >
              {form.isActive
                ? <ToggleRight className="w-8 h-8 text-brand-primary" />
                : <ToggleLeft className="w-8 h-8 text-white/20" />}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 bg-brand-primary text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {isNew ? 'Create Code' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDiscounts() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing: Partial<PromoCode> | null }>({ open: false, editing: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCodes = useCallback(() => {
    setLoading(true);
    getAllPromoCodes()
      .then(data => setCodes(data))
      .catch(() => setError('Failed to load promo codes.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const handleSave = async (data: Partial<PromoCode>) => {
    if (modal.editing?.id) {
      const updated = await updatePromoCode(modal.editing.id, data);
      setCodes(prev => prev.map(c => c.id === modal.editing!.id ? updated : c));
      toast.success('Promo code updated.');
    } else {
      const created = await createPromoCode(data);
      setCodes(prev => [created, ...prev]);
      toast.success(`Code "${created.code}" created!`);
    }
  };

  const handleToggle = async (code: PromoCode) => {
    try {
      const updated = await updatePromoCode(code.id, { isActive: !code.isActive });
      setCodes(prev => prev.map(c => c.id === code.id ? updated : c));
      toast.success(`${code.code} ${updated.isActive ? 'activated' : 'deactivated'}.`);
    } catch { toast.error('Toggle failed.'); }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!window.confirm(`Delete code "${codeName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deletePromoCode(id);
      setCodes(prev => prev.filter(c => c.id !== id));
      toast.success(`Code "${codeName}" deleted.`);
    } catch { toast.error('Delete failed.'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
            Discount <span className="text-brand-primary">Manager</span>
          </h1>
          <p className="text-white/30 text-sm mt-1">{codes.length} promo code{codes.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchCodes} disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setModal({ open: true, editing: null })}
            className="flex items-center gap-2 bg-brand-primary text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" /> New Code
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Loyalty-Gated Codes</p>
          <p className="text-[11px] text-white/40 leading-relaxed">
            Set a <strong className="text-white/60">Min. Level</strong> to restrict codes to high-loyalty customers. 
            Users earn XP by spending (1 XP per ₱1). They level up every 5,000 XP.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-5 animate-pulse">
              <div className="h-8 w-28 bg-white/5 rounded-lg" />
              <div className="h-4 flex-1 bg-white/5 rounded-lg" />
              <div className="h-6 w-16 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && codes.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Tag className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No promo codes yet</p>
          <button onClick={() => setModal({ open: true, editing: null })} className="text-brand-primary text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create your first code
          </button>
        </div>
      )}

      {/* Codes Table */}
      {!loading && codes.length > 0 && (
        <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-white/5">
            {['Code', 'Description', 'Discount', 'Min. Level', 'Uses', 'Expiry', 'Status', ''].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-white/30">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence initial={false}>
              {codes.map(code => (
                <motion.div
                  key={code.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 lg:gap-4 items-center px-6 py-5 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Code */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-0.5">Code</p>
                    <span className="font-mono font-black text-sm text-brand-primary tracking-widest">{code.code}</span>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-0.5">Description</p>
                    <p className="text-xs text-white/50 truncate">{code.description || '—'}</p>
                  </div>

                  {/* Discount */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-0.5">Discount</p>
                    <span className="text-sm font-black text-white">{code.discountPercent}%</span>
                  </div>

                  {/* Min Level */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-0.5">Min. Level</p>
                    <span className="text-xs font-bold text-white/60">
                      {code.minLevel > 0 ? (
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-brand-primary" />Lvl {code.minLevel}+</span>
                      ) : 'Anyone'}
                    </span>
                  </div>

                  {/* Uses */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-0.5">Uses</p>
                    <span className="text-xs font-bold text-white/60">
                      {code.usedCount}/{code.usageLimit ?? '∞'}
                    </span>
                  </div>

                  {/* Expiry */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-0.5">Expiry</p>
                    <span className="text-[11px] font-mono text-white/40">
                      {code.expiryDate ? new Date(code.expiryDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-0.5">Status</p>
                    <StatusBadge code={code} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(code)}
                      title={code.isActive ? 'Deactivate' : 'Activate'}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:border-brand-primary/30 hover:text-brand-primary text-white/30"
                    >
                      {code.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setModal({ open: true, editing: code })}
                      title="Edit"
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:border-brand-primary/30 hover:text-brand-primary text-white/30"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(code.id, code.code)}
                      title="Delete"
                      disabled={deletingId === code.id}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 flex items-center justify-center transition-all text-white/20 hover:text-red-400 disabled:opacity-50"
                    >
                      {deletingId === code.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <PromoModal
            initial={modal.editing}
            onClose={() => setModal({ open: false, editing: null })}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
