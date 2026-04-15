import React, { useState, useEffect } from 'react';
import { Collection } from '../../types/api';
import {
  getCollections, createCollection, updateCollection, deleteCollection
} from '../../api/endpoints';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    releaseDate: '',
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load collections data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      description: '',
      releaseDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name || '',
      description: collection.description || '',
      releaseDate: collection.releaseDate 
        ? new Date(collection.releaseDate).toISOString().split('T')[0] 
        : '',
      isActive: collection.isActive !== false, // Defaults to true
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCollection(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      await deleteCollection(id);
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete collection.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Collection> = {
        name: formData.name,
        description: formData.description,
        releaseDate: formData.releaseDate ? formData.releaseDate : undefined,
        isActive: formData.isActive,
      };

      if (editingCollection) {
        await updateCollection(editingCollection.id, payload);
      } else {
        await createCollection(payload);
      }
      
      handleCloseModal();
      await fetchData(); // Refresh grid
    } catch (err) {
      console.error(err);
      alert('Failed to save collection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Loading Drops</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center space-y-4">
          <p className="text-red-400 font-bold">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight italic">
            Collections <span className="text-brand-primary">&amp; Drops</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Manage seasonal sets and collaborative collections</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-primary text-black px-5 py-2.5 rounded-xl font-bold uppercase text-sm hover:brightness-110 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      {/* Data Grid table */}
      <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-widest text-white/40">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold max-w-sm">Description</th>
                <th className="px-6 py-4 font-semibold">Release Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white uppercase tracking-wider">{col.name}</div>
                  </td>
                  <td className="px-6 py-4 max-w-sm text-white/50 truncate">
                    {col.description || <span className="italic">No description</span>}
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {col.releaseDate ? new Date(col.releaseDate).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    }) : <span className="italic text-white/30">Not set</span>}
                  </td>
                  <td className="px-6 py-4">
                    {col.isActive !== false ? (
                      <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider">
                        Active
                      </span>
                    ) : (
                      <span className="bg-white/5 text-white/40 border border-white/10 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(col)}
                        className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/30 italic">
                    No collections found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          
          <div className="relative bg-bg-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col z-10 transform animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-xl font-bold uppercase tracking-widest text-brand-primary">
                {editingCollection ? 'Edit Collection' : 'New Collection'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="collectionForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Collection Name</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50"
                    placeholder="e.g. Neon Genesis"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Description</label>
                  <textarea
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50 resize-none"
                    placeholder="Theme or background lore for this drop..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Release Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50 color-scheme-dark"
                    style={{ colorScheme: 'dark' }}
                    value={formData.releaseDate}
                    onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                  />
                </div>

                {/* Status Toggle */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                    />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide text-white/70">
                    Active &amp; Visible
                  </span>
                </label>

              </form>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="collectionForm"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-brand-primary text-black hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingCollection ? 'Save Changes' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
