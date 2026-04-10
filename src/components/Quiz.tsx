import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, Shield, Crosshair, X } from 'lucide-react';

const questions = [
  {
    id: 1,
    text: "What's your primary game genre?",
    options: [
      { id: 'fps', label: 'FPS (Valorant, CS2, Apex)', icon: Crosshair },
      { id: 'moba', label: 'MOBA (LoL, Dota 2)', icon: Zap },
      { id: 'rpg', label: 'RPG / Open World', icon: Shield },
      { id: 'creative', label: 'Creative / Sandbox', icon: Target },
    ]
  },
  {
    id: 2,
    text: "How do you handle your mouse?",
    options: [
      { id: 'palm', label: 'Palm Grip (Full contact)' },
      { id: 'claw', label: 'Claw Grip (Arched fingers)' },
      { id: 'fingertip', label: 'Fingertip (Minimal contact)' },
    ]
  },
  {
    id: 3,
    text: "What's your sensitivity preference?",
    options: [
      { id: 'low', label: 'Low (Large arm movements)' },
      { id: 'high', label: 'High (Small wrist flicks)' },
    ]
  }
];

export default function Quiz({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answerId: string) => {
    const newAnswers = { ...answers, [questions[step].id]: answerId };
    setAnswers(newAnswers);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-xl bg-bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-12">
          {!showResult ? (
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-white/40 uppercase">Step {step + 1}/{questions.length}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                >
                  <h2 className="text-3xl font-bold tracking-tight mb-8">
                    {questions[step].text}
                  </h2>

                  <div className="grid gap-4">
                    {questions[step].options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswer(opt.id)}
                        className="group flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all text-left"
                      >
                        {opt.icon && (
                          <div className="p-3 bg-white/5 rounded-xl group-hover:bg-brand-primary group-hover:text-black transition-colors">
                            <opt.icon className="w-5 h-5" />
                          </div>
                        )}
                        <span className="font-bold text-lg">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-brand-primary animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Your Loadout is Ready</h2>
              <p className="text-white/60 mb-8">Based on your {answers[1]} playstyle and {answers[2]} grip, we recommend these attachments:</p>
              
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center text-black">
                    <Crosshair className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Viper V3 Pro</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest">Recommended Mouse</p>
                  </div>
                </div>
                <p className="text-sm text-white/60">Ultralight 54g design perfect for your {answers[3]} sensitivity flicks.</p>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-brand-primary text-black font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 uppercase tracking-tighter"
              >
                View Recommended Gear
              </button>
              <button 
                onClick={reset}
                className="mt-4 text-xs text-white/40 hover:text-white uppercase font-bold tracking-widest"
              >
                Retake Quiz
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
