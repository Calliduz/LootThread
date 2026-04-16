import React, { useState, useEffect } from 'react';
import { CMSContent } from '../../types/api';
import {
  getAllCMS, createCMS, updateCMS, deleteCMS
} from '../../api/endpoints';
import { 
  Plus, Edit2, Trash2, X, Code, AlignLeft, 
  Image as ImageIcon, Braces, FileText, Layout, 
  Twitter, Youtube, Disc as Discord, Facebook, Instagram, Share2, Megaphone 
} from 'lucide-react';
import { SkeletonRow } from '../../components/Skeleton';
import ImageUpload from '../../components/admin/ImageUpload';
import JsonEditor from '../../components/admin/JsonEditor';
import toast from 'react-hot-toast';

export default function AdminCMS() {
  const [cmsList, setCmsList] = useState<CMSContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <p className="text-white/40 text-sm mt-1">Manage scrolling marquee and footer connectivity</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Marquee Module */}
        <SimpleMarqueeCard cmsList={cmsList} onSave={fetchData} />
        
        {/* Socials Module */}
        <SimpleSocialsCard cmsList={cmsList} onSave={fetchData} />
      </div>
    </div>
  );
}

/**
 * MODULE: Simple Marquee Card
 */
function SimpleMarqueeCard({ cmsList, onSave }: { cmsList: CMSContent[], onSave: () => void }) {
  const marqueeEntry = cmsList.find(c => c.key === 'marquee_banner');
  
  // Parse initial values
  const initialData = typeof marqueeEntry?.value === 'object' ? marqueeEntry.value : { text: marqueeEntry?.value || '', speed: 30 };
  
  const [text, setText] = useState(initialData.text || '');
  const [speed, setSpeed] = useState(initialData.speed || 30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (marqueeEntry) {
      const val = typeof marqueeEntry.value === 'object' ? marqueeEntry.value : { text: marqueeEntry.value, speed: 30 };
      setText(val.text || '');
      setSpeed(val.speed || 30);
    }
  }, [marqueeEntry]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { text, speed: Number(speed) };
      if (marqueeEntry) {
        await updateCMS(marqueeEntry.id, { type: 'json', value: payload });
      } else {
        await createCMS({ key: 'marquee_banner', type: 'json', value: payload, isActive: true });
      }
      toast.success('Marquee updated');
      onSave();
    } catch {
      toast.error('Failed to update marquee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-bg-card border border-white/5 rounded-3xl p-8 space-y-6">
      <div className="flex items-center gap-4 text-brand-primary">
        <div className="p-3 bg-brand-primary/10 rounded-2xl">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold uppercase tracking-tight">Marquee Message</h3>
          <p className="text-white/30 text-xs">The scrolling text at the top of the storefront</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Scrolling Announcement</label>
          <textarea 
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-brand-primary/50 transition-all resize-none h-32"
            placeholder="e.g. LootThread 2.0 is now LIVE! // USE CODE 'GLITCH' FOR 20% OFF //"
          />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 text-center block">Speed (sec)</label>
          <div className="flex flex-col items-center justify-center h-32 bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2">
             <input 
               type="number" 
               min="5" 
               max="200"
               value={speed}
               onChange={e => setSpeed(Number(e.target.value))}
               className="bg-transparent text-2xl font-black text-brand-primary text-center w-full outline-none"
             />
             <p className="text-[9px] uppercase font-bold text-white/20">Lower = Faster</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-white/5 hover:bg-brand-primary hover:text-black border border-white/5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
      >
        {saving && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        Apply Changes
      </button>
    </div>
  );
}

/**
 * MODULE: Simple Socials Card
 */
function SimpleSocialsCard({ cmsList, onSave }: { cmsList: CMSContent[], onSave: () => void }) {
  const socialsEntry = cmsList.find(c => c.key === 'footer_socials');
  // Initialize from JSON if it exists
  const initialSocials = Array.isArray(socialsEntry?.value) ? socialsEntry.value : [];
  
  const [socials, setSocials] = useState<Record<string, string>>({
    twitter: initialSocials.find((s: any) => s.platform === 'Twitter')?.url || '',
    discord: initialSocials.find((s: any) => s.platform === 'Discord')?.url || '',
    youtube: initialSocials.find((s: any) => s.platform === 'Youtube')?.url || '',
    facebook: initialSocials.find((s: any) => s.platform === 'Facebook')?.url || '',
    instagram: initialSocials.find((s: any) => s.platform === 'Instagram')?.url || '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (socialsEntry?.value && Array.isArray(socialsEntry.value)) {
       const mapped: Record<string, string> = {};
       socialsEntry.value.forEach((s: any) => {
         mapped[s.platform.toLowerCase()] = s.url;
       });
       setSocials(prev => ({ ...prev, ...mapped }));
    }
  }, [socialsEntry]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Map back to the JSON format the Footer expects
      const formattedValue = Object.entries(socials)
        .filter(([_, url]) => (url as string).trim() !== '')
        .map(([platform, url]) => ({
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          url: (url as string).trim()
        }));

      if (socialsEntry) {
        await updateCMS(socialsEntry.id, { value: formattedValue });
      } else {
        await createCMS({ key: 'footer_socials', type: 'json', value: formattedValue, isActive: true });
      }
      toast.success('Social links updated');
      onSave();
    } catch {
      toast.error('Failed to update socials');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-bg-card border border-white/5 rounded-3xl p-8 space-y-6">
      <div className="flex items-center gap-4 text-brand-primary">
        <div className="p-3 bg-brand-primary/10 rounded-2xl">
          <Share2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold uppercase tracking-tight">Social Networks</h3>
          <p className="text-white/30 text-xs">Manage links displayed in the website footer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SocialInput 
          icon={<Twitter className="w-4 h-4" />} 
          label="X (Twitter)" 
          value={socials.twitter} 
          onChange={val => setSocials(prev => ({...prev, twitter: val}))} 
        />
        <SocialInput 
          icon={<Discord className="w-4 h-4" />} 
          label="Discord Server" 
          value={socials.discord} 
          onChange={val => setSocials(prev => ({...prev, discord: val}))} 
        />
        <SocialInput 
          icon={<Youtube className="w-4 h-4" />} 
          label="YouTube Channel" 
          value={socials.youtube} 
          onChange={val => setSocials(prev => ({...prev, youtube: val}))} 
        />
        <SocialInput 
          icon={<Facebook className="w-4 h-4" />} 
          label="Facebook Page" 
          value={socials.facebook} 
          onChange={val => setSocials(prev => ({...prev, facebook: val}))} 
        />
        <SocialInput 
          icon={<Instagram className="w-4 h-4" />} 
          label="Instagram" 
          value={socials.instagram} 
          onChange={val => setSocials(prev => ({...prev, instagram: val}))} 
        />
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-white/5 hover:bg-brand-primary hover:text-black border border-white/5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
      >
        {saving && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        Save Connectivity
      </button>
    </div>
  );
}

function SocialInput({ icon, label, value, onChange }: { icon: React.ReactNode, label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
        <span className="text-brand-primary/50">{icon}</span>
        {label}
      </label>
      <input 
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-primary/30 transition-all font-mono"
        placeholder="https://..."
      />
    </div>
  );
}
