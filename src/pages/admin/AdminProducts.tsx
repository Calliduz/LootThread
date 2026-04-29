import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Product, Artist, Collection, ProductType } from '../../types/api';
import {
  getProducts, getArtists, getCollections,
  createProduct, updateProduct, deleteProduct
} from '../../api/endpoints';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Copy } from 'lucide-react';
import { SkeletonRow } from '../../components/Skeleton';
import ImageUpload from '../../components/admin/ImageUpload';
import { getAssetUrl } from '../../utils/assetHelper';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    type: 'skin' as ProductType,
    artistId: '',
    collectionId: '',
    imageUrl: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prods, arts, cols] = await Promise.all([
        getProducts(),
        getArtists(),
        getCollections(),
      ]);
      setProducts(prods);
      setArtists(arts);
      setCollections(cols);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load products data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      type: 'skin',
      artistId: '',
      collectionId: '',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || product.name || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      stockQuantity: product.stockQuantity ?? product.inventory ?? 0,
      type: product.type || product.category || 'skin',
      artistId: product.artistId || '',
      collectionId: product.collectionId || '',
      imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDuplicate = (product: Product) => {
    setEditingProduct(null);
    setFormData({
      title: `${product.title || product.name} (Copy)`,
      name: `${product.name} (Copy)`,
      description: product.description || '',
      price: product.price || 0,
      stockQuantity: 0, // Reset stock for new copy
      type: product.type || product.category || 'skin',
      artistId: product.artistId || '',
      collectionId: product.collectionId || '',
      imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
    });
    setIsModalOpen(true);
    toast.info('Adjust details for the new product.');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted.');
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Product> = {
        title: formData.title,
        name: formData.title, // sync name to title for legacy reasons
        description: formData.description,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        type: formData.type,
        artistId: formData.artistId || undefined,
        collectionId: formData.collectionId || undefined,
        imageUrl: formData.imageUrl,
        category: formData.type === 'skin' || formData.type === 'attachment' ? formData.type : undefined,
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload, ...updated } : p));
      } else {
        const created = await createProduct(payload);
        if (created) {
          setProducts(prev => [created, ...prev]);
        }
      }
      
      handleCloseModal();
      toast.success(editingProduct ? 'Product updated.' : 'Product created.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      await fetchData();
    } catch {
      toast.error('Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => <SkeletonRow key={i} cols={7} />)}
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
            Products <span className="text-brand-primary">Management</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Manage all drops, skins, and apparel</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-primary text-black px-5 py-2.5 rounded-xl font-bold uppercase text-sm hover:brightness-110 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      {/* Data Grid table */}
      <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-widest text-white/40">
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Artist</th>
                <th className="px-6 py-4 font-semibold">Collection</th>
                <th className="px-6 py-4 font-semibold text-right">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {products.map((product) => {
                const img = product.imageUrl || (product.images && product.images[0]);
                const art = artists.find(a => a.id === product.artistId)?.name || <span className="text-white/20 italic">None</span>;
                const col = collections.find(c => c.id === product.collectionId)?.name || <span className="text-white/20 italic">None</span>;
                
                return (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {img ? (
                            <img 
                              src={getAssetUrl(img) || `https://picsum.photos/seed/${product.id}/200/200`} 
                              alt={product.title} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-white/20" />
                          )}
                        </div>
                        <div className="font-bold text-white truncate max-w-[200px]" title={product.title || product.name}>
                          {product.title || product.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-white/5 text-white/50 border border-white/10 px-2.5 py-1 rounded-md text-xs uppercase font-bold tracking-wider">
                        {product.type || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70">{art}</td>
                    <td className="px-6 py-4 text-white/70">{col}</td>
                    <td className="px-6 py-4 text-right font-mono text-brand-primary">₱{product.price?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      {product.stockQuantity ?? product.inventory}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-2 hover:bg-white/10 text-white/40 hover:text-brand-primary rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ImageIcon className="w-12 h-12 text-white/10" />
                      <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No products in catalog</p>
                      <p className="text-white/20 text-xs">Click "New Product" to add your first drop.</p>
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
          
          {/* Modal Form Content */}
          <div className="relative bg-bg-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden transform animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-xl font-bold uppercase tracking-widest text-brand-primary">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Title</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50"
                      placeholder="e.g. Carbon Fiber Grip"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  
                  {/* Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Product Type</label>
                    <select
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-primary/50"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as ProductType })}
                    >
                      <option value="skin">Skin</option>
                      <option value="attachment">Attachment</option>
                      <option value="apparel">Apparel</option>
                      <option value="individual">Individual</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50 resize-y"
                    placeholder="Describe the product..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Price (₱)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50 font-mono"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Stock Quantity</label>
                    <input
                      required
                      type="number"
                      min="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50 font-mono"
                      value={formData.stockQuantity}
                      onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Artist */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Associated Artist</label>
                    <select
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-primary/50"
                      value={formData.artistId}
                      onChange={e => setFormData({ ...formData, artistId: e.target.value })}
                    >
                      <option value="">None (LootThread Original)</option>
                      {artists.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Collection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Collection / Drop</label>
                    <select
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-primary/50"
                      value={formData.collectionId}
                      onChange={e => setFormData({ ...formData, collectionId: e.target.value })}
                    >
                      <option value="">None (Evergreen)</option>
                      {collections.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <ImageUpload
                  label="Product Image"
                  value={formData.imageUrl}
                  onChange={url => setFormData({ ...formData, imageUrl: url })}
                />
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
                form="productForm"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-brand-primary text-black hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
