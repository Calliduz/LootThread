import React, { useState, useEffect } from 'react';
import { CMSContent } from '../../types/api';
import {
  getAllCMS, createCMS, updateCMS, deleteCMS
} from '../../api/endpoints';
import { Plus, Edit2, Trash2, X, Code, AlignLeft, Image as ImageIcon, Braces, FileText } from 'lucide-react';
import { SkeletonRow } from '../../components/Skeleton';
import ImageUpload from '../../components/admin/ImageUpload';
import JsonEditor from '../../components/admin/JsonEditor';
import toast from 'react-hot-toast';

export default function AdminCMS() {
  const [cmsList, setCmsList] = useState<CMSContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCms, setEditingCms] = useState<CMSContent | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    key: '',
    type: 'text' as 'text' | 'json' | 'image' | 'array',
    value: '' as any,
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllCMS();
      setCmsList(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load CMS data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCms(null);
    setFormData({
      key: '',
      type: 'text',
      value: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cms: CMSContent) => {
    setEditingCms(cms);
    
    setFormData({
      key: cms.key,
      type: cms.type,
      value: cms.value,
      isActive: cms.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCms(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this CMS content block?')) return;
    try {
      await deleteCMS(id);
      setCmsList(prev => prev.filter(c => c.id !== id));
      toast.success('CMS block deleted.');
    } catch {
      toast.error('Failed to delete CMS content.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let processedValue: any = formData.value;

    // Safety JSON Parser (only if the user managed to force it through as a string incorrectly)
    if ((formData.type === 'json' || formData.type === 'array') && typeof formData.value === 'string') {
      try {
        processedValue = JSON.parse(formData.value);
      } catch {
        toast.error('Invalid JSON format. Check your syntax and try again.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Partial<CMSContent> = {
        key: formData.key.trim().toLowerCase().replace(/\s+/g, '_'),
        type: formData.type,
        value: processedValue,
        isActive: formData.isActive,
      };

      if (editingCms) {
        await updateCMS(editingCms.id, payload);
      } else {
        await createCMS(payload);
      }
      
      handleCloseModal();
      toast.success(editingCms ? 'CMS block updated.' : 'CMS block created.');
      await fetchData();
    } catch {
      toast.error('Failed to save CMS block.');
    } finally {
      setSaving(false);
    }
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'json': return <Braces className="w-4 h-4 text-purple-400" />;
      case 'array': return <Code className="w-4 h-4 text-blue-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-green-400" />;
      case 'text': default: return <AlignLeft className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => <SkeletonRow key={i} cols={5} />)}
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
            Storefront <span className="text-brand-primary">CMS</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Manage marquees, banners, and dynamic injection slots</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-primary text-black px-5 py-2.5 rounded-xl font-bold uppercase text-sm hover:brightness-110 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Content Block
        </button>
      </div>

      {/* Data Grid table */}
      <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-widest text-white/40">
                <th className="px-6 py-4 font-semibold">Content Key</th>
                <th className="px-6 py-4 font-semibold">Data Type</th>
                <th className="px-6 py-4 font-semibold w-1/2">Preview</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {cmsList.map((item) => {
                
                // Construct a preview string cleanly
                let preview = '';
                if (item.type === 'json' || item.type === 'array') {
                  preview = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
                } else {
                  preview = String(item.value || '');
                }

                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-brand-primary font-bold">{item.key}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         {renderTypeIcon(item.type)}
                        <span className="bg-white/5 text-white/70 border border-white/10 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/50 font-mono text-xs truncate max-w-xs xl:max-w-md">
                      {preview}
                    </td>
                    <td className="px-6 py-4">
                      {item.isActive !== false ? (
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
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
              {cmsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-white/10" />
                      <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No CMS blocks configured</p>
                      <p className="text-white/20 text-xs">Create your first content key for the storefront.</p>
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
          
          <div className="relative bg-bg-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 transform animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-xl font-bold uppercase tracking-widest text-brand-primary">
                {editingCms ? 'Edit Content Block' : 'New Content Block'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="cmsForm" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Content Key / Slug</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50 font-mono"
                      placeholder="e.g. homepage_marquee"
                      value={formData.key}
                      onChange={e => setFormData({ ...formData, key: e.target.value })}
                      disabled={!!editingCms} // Cannot change key after creation usually
                    />
                  </div>

                      <option value="array">JSON Array Collection</option>
                      <option value="image">Image Asset</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Content Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Content Value</label>
                  </div>

                  {formData.type === 'image' ? (
                    <ImageUpload 
                      value={formData.value}
                      onChange={url => setFormData({ ...formData, value: url })}
                    />
                  ) : (formData.type === 'json' || formData.type === 'array') ? (
                    <div className="bg-black/20 border border-white/5 p-4 rounded-xl">
                      <JsonEditor 
                        type={formData.type}
                        value={formData.value}
                        onChange={val => setFormData({ ...formData, value: val })}
                      />
                    </div>
                  ) : (
                    <textarea
                      required
                      rows={8}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50 font-mono resize-y"
                      placeholder="Enter content text..."
                      value={formData.value}
                      onChange={e => setFormData({ ...formData, value: e.target.value })}
                    />
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
                    Active &amp; Mounted on Runtime
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
                form="cmsForm"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-brand-primary text-black hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {editingCms ? 'Save Changes' : 'Create Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
