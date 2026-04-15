import React, { useState, useEffect } from 'react';
import { Artist } from '../../types/api';
import {
  getArtists, createArtist, updateArtist, deleteArtist
} from '../../api/endpoints';
import { Plus, Edit2, Trash2, X, User as UserIcon } from 'lucide-react';
import { SkeletonRow } from '../../components/Skeleton';
import toast from 'react-hot-toast';

export default function AdminArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    imageUrl: '',
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getArtists();
      setArtists(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load artists data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingArtist(null);
    setFormData({
      name: '',
      bio: '',
      imageUrl: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setFormData({
      name: artist.name || '',
      bio: artist.bio || '',
      imageUrl: artist.imageUrl || artist.avatar || '',
      isActive: artist.isActive !== false, // Defaults to true if undefined
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArtist(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this artist?')) return;
    try {
      await deleteArtist(id);
      setArtists(prev => prev.filter(a => a.id !== id));
      toast.success('Artist deleted.');
    } catch {
      toast.error('Failed to delete artist.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Artist> = {
        name: formData.name,
        bio: formData.bio,
        imageUrl: formData.imageUrl,
        isActive: formData.isActive,
      };

      if (editingArtist) {
        await updateArtist(editingArtist.id, payload);
      } else {
        await createArtist(payload);
      }
      
      handleCloseModal();
      toast.success(editingArtist ? 'Artist updated.' : 'Artist created.');
      await fetchData();
    } catch {
      toast.error('Failed to save artist.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => <SkeletonRow key={i} cols={5} />)}
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
            Artists <span className="text-brand-primary">Roster</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Manage partner creators and designers</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-primary text-black px-5 py-2.5 rounded-xl font-bold uppercase text-sm hover:brightness-110 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Artist
        </button>
      </div>

      {/* Data Grid table */}
      <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-widest text-white/40">
                <th className="px-6 py-4 font-semibold w-16">Profile</th>
                <th className="px-6 py-4 font-semibold">Artist</th>
                <th className="px-6 py-4 font-semibold max-w-xs">Bio</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {artists.map((artist) => {
                const img = artist.imageUrl || artist.avatar;
                return (
                  <tr key={artist.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {img ? (
                          <img src={img} alt={artist.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white truncate">{artist.name}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-white/50 truncate">
                      {artist.bio || <span className="italic">No bio provided</span>}
                    </td>
                    <td className="px-6 py-4">
                      {artist.isActive !== false ? (
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
                          onClick={() => handleOpenEdit(artist)}
                          className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(artist.id)}
                          className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {artists.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UserIcon className="w-12 h-12 text-white/10" />
                      <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No artists in roster</p>
                      <p className="text-white/20 text-xs">Add your first creator to get started.</p>
                    </div>
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
                {editingArtist ? 'Edit Artist' : 'New Artist'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="artistForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Artist Name</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50"
                    placeholder="e.g. NeonWeave"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Biography</label>
                  <textarea
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50 resize-none"
                    placeholder="Artist background or signature style..."
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Avatar Image URL</label>
                  <input
                    type="url"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  {formData.imageUrl && (
                    <div className="mt-4 w-16 h-16 rounded-full overflow-hidden border border-white/10">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
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
                    Active on Storefront
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
                form="artistForm"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-brand-primary text-black hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {editingArtist ? 'Save Changes' : 'Create Artist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
