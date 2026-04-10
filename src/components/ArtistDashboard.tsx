import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Package, DollarSign, BarChart3, Upload, TrendingUp, PieChart as PieChartIcon, Award } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';

const TREND_DATA = [
  { name: 'Mon', sales: 400, revenue: 2400 },
  { name: 'Tue', sales: 300, revenue: 1398 },
  { name: 'Wed', sales: 200, revenue: 9800 },
  { name: 'Thu', sales: 278, revenue: 3908 },
  { name: 'Fri', sales: 189, revenue: 4800 },
  { name: 'Sat', sales: 239, revenue: 3800 },
  { name: 'Sun', sales: 349, revenue: 4300 },
];

const TOP_ITEMS = [
  { name: 'Cyber Samurai', sales: 120 },
  { name: 'Glitch Mode', sales: 98 },
  { name: 'Neon Oni', sales: 86 },
  { name: 'Void Walker', sales: 72 },
  { name: 'Synth Wave', sales: 45 },
];

const CATEGORY_DATA = [
  { name: 'Jerseys', value: 45, color: '#00ffcc' },
  { name: 'Hoodies', value: 30, color: '#ff00ff' },
  { name: 'T-Shirts', value: 25, color: '#00ff66' },
];

export default function ArtistDashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    inventory: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'products'), {
        ...formData,
        price: parseFloat(formData.price),
        inventory: parseInt(formData.inventory),
        category: 'skin',
        artistId: auth.currentUser.uid,
        images: ['https://picsum.photos/seed/new-skin/600/600'],
        createdAt: serverTimestamp(),
        tags: ['artist-upload']
      });
      alert('Product uploaded successfully!');
      setIsUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Artist <span className="text-brand-accent">Dashboard</span></h1>
          <p className="text-white/40 uppercase tracking-widest text-xs font-bold mt-2">Manage your digital empire</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsUploading(true)}
            className="bg-brand-accent text-white px-6 py-3 rounded-xl font-bold uppercase tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-brand-accent/20"
          >
            <Plus className="w-5 h-5" /> New Design
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Total Revenue', value: '$12,450.00', icon: DollarSign, color: 'text-brand-primary', trend: '+12.5%' },
          { label: 'Active Skins', value: '24', icon: Package, color: 'text-brand-accent', trend: '+2' },
          { label: 'Total Sales', value: '842', icon: TrendingUp, color: 'text-brand-secondary', trend: '+18%' },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded">
                {stat.trend}
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-1">{stat.label}</p>
            <p className="text-3xl font-mono font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-bg-card border border-white/5 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Sales Trend</h3>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                <button 
                  key={t}
                  onClick={() => setAnalyticsTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${analyticsTab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#404040" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#404040" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px' }}
                  itemStyle={{ color: '#00ffcc', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#00ffcc" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#00ffcc', strokeWidth: 2, stroke: '#141414' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-bg-card border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-accent/10 rounded-lg text-brand-accent">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold uppercase italic tracking-tight">Revenue Share</h3>
          </div>
          
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total</p>
                <p className="text-xl font-mono font-bold text-white">100%</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            {CATEGORY_DATA.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-medium text-white/60">{cat.name}</span>
                </div>
                <span className="text-xs font-mono font-bold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="lg:col-span-3 bg-bg-card border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-secondary/10 rounded-lg text-brand-secondary">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold uppercase italic tracking-tight">Top Performing Skins</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOP_ITEMS} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#white" 
                    fontSize={12} 
                    width={100}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px' }}
                  />
                  <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={20}>
                    {TOP_ITEMS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#00ffcc' : '#262626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {TOP_ITEMS.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black italic text-white/10 group-hover:text-brand-primary/20 transition-colors">0{i + 1}</span>
                    <div>
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Skin Series</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-brand-primary">{item.sales}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Sales</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsUploading(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-bg-card border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 uppercase italic">Upload New Skin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Design Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Description</label>
                <textarea 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors h-24"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Price ($)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Initial Stock</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
                    value={formData.inventory}
                    onChange={e => setFormData({...formData, inventory: e.target.value})}
                  />
                </div>
              </div>
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-brand-accent/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-white/20" />
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Drop your artwork here</p>
              </div>
              <button 
                type="submit"
                className="w-full bg-brand-accent text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform active:scale-95 uppercase tracking-tighter mt-4"
              >
                Publish Skin
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
