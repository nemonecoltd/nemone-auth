"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const INTERESTS = [
  { id: 'gourmet', label: '미식', desc: '잊지 못할 미학적 미식 경험' },
  { id: 'artist', label: '아티스트', desc: '창조적인 영감을 주는 예술가들' },
  { id: 'space', label: '공간', desc: '머무는 것만으로도 가치 있는 곳' },
  { id: 'fashion', label: '패션', desc: '자신만의 철학을 담은 스타일' },
  { id: 'product', label: '프로덕트', desc: '삶의 질을 높이는 감각적 도구' }
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUserName(user.user_metadata?.full_name || '멤버');
      }
    };
    checkUser();
  }, [supabase, router]);

  const toggleInterest = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (selected.length === 0) return alert('최소 하나 이상의 취향을 선택해 주세요.');
    
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { 
        interests: selected,
        onboarding_completed: true 
      }
    });

    if (!error) {
      // 가입 완료 후 "지금여기"나 "네모네AIM" 중 한 곳으로 리다이렉트
      // 여기서는 기본적으로 메인 매거진으로 안내합니다.
      router.push('https://nemoneai.com');
    } else {
      alert('저장 중 오류가 발생했습니다.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0c0c0c] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 to-transparent"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[600px] z-10 text-center"
      >
        <div className="w-20 h-20 bg-brand-gold/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-brand-gold/30">
          <Sparkles className="text-brand-gold" size={40} />
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          반가워요, {userName}님!
        </h1>
        <p className="text-[#E8DCC4] text-lg font-light mb-12">
          당신을 설레게 하는 것은 무엇인가요?<br className="hidden md:block" />
          네모네가 유저님의 취향에 딱 맞는 영감을 준비하겠습니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {INTERESTS.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleInterest(item.id)}
                className={`p-6 rounded-[32px] border-2 text-left transition-all duration-300 ${
                  isSelected 
                    ? 'bg-brand-gold border-brand-gold text-black shadow-[0_0_30px_rgba(212,175,55,0.3)]' 
                    : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xl font-bold ${isSelected ? 'text-black' : 'text-white'}`}>{item.label}</span>
                  {isSelected && <Check size={20} className="text-black" />}
                </div>
                <p className={`text-xs ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>{item.desc}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleComplete}
          disabled={selected.length === 0 || isSaving}
          className="w-full md:w-auto px-12 py-5 bg-white text-black rounded-full font-bold flex items-center justify-center gap-3 hover:bg-brand-emerald hover:text-white transition-all shadow-2xl disabled:opacity-30 mx-auto"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>네모네 생태계 입장하기 <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </motion.div>
    </div>
  );
}
