import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  type: 'json' | 'array';
}

export default function JsonEditor({ value, onChange, type }: JsonEditorProps) {
  
  // Ensure we have a valid object/array to work with
  const data = React.useMemo(() => {
    if (type === 'json') {
      return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
    } else {
      return Array.isArray(value) ? value : [];
    }
  }, [value, type]);

  const handleUpdateObject = (key: string, newValue: any) => {
    onChange({ ...data, [key]: newValue });
  };

  const handleRenameKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    const newData = { ...data };
    newData[newKey] = newData[oldKey];
    delete newData[oldKey];
    onChange(newData);
  };

  const handleRemoveKey = (key: string) => {
    const newData = { ...data };
    delete newData[key];
    onChange(newData);
  };

  const handleAddKey = () => {
    const newKey = `new_key_${Object.keys(data).length}`;
    onChange({ ...data, [newKey]: "" });
  };

  const handleUpdateArray = (index: number, newValue: any) => {
    const newData = [...data];
    newData[index] = newValue;
    onChange(newData);
  };

  const handleRemoveArrayItem = (index: number) => {
    const newData = data.filter((_: any, i: number) => i !== index);
    onChange(newData);
  };

  const handleAddArrayItem = () => {
    onChange([...data, ""]);
  };

  if (type === 'json') {
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="flex gap-2 items-center group animate-in slide-in-from-left-2 duration-200">
            <div className="text-white/20">
              <GripVertical className="w-4 h-4" />
            </div>
            <input 
              type="text"
              value={key}
              onBlur={(e) => handleRenameKey(key, e.target.value)}
              className="w-1/3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-brand-primary outline-none focus:border-brand-primary/40"
              placeholder="key"
            />
            <input 
              type="text"
              value={String(val)}
              onChange={(e) => handleUpdateObject(key, e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 outline-none focus:border-brand-primary/40"
              placeholder="value"
            />
            <button 
              type="button"
              onClick={() => handleRemoveKey(key)}
              className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddKey}
          className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[10px] uppercase font-bold tracking-widest text-white/30 hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-3 h-3" />
          Add Property
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item: any, index: number) => (
        <div key={index} className="flex gap-2 items-center group animate-in slide-in-from-left-2 duration-200">
          <div className="text-white/20">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="w-8 text-[10px] font-mono text-white/20">{index}</div>
          <input 
            type="text"
            value={String(item)}
            onChange={(e) => handleUpdateArray(index, e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 outline-none focus:border-brand-primary/40"
            placeholder="Value..."
          />
          <button 
            type="button"
            onClick={() => handleRemoveArrayItem(index)}
            className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddArrayItem}
        className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[10px] uppercase font-bold tracking-widest text-white/30 hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-3 h-3" />
        Add Item
      </button>
    </div>
  );
}
