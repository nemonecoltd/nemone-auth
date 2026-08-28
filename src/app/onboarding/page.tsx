"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Lang, detectLang, tr } from '@/utils/lang';
import LangSwitcher from '@/components/LangSwitcher';

const INTERESTS = [
  { id: 'gourmet', ko: '미식', en: 'Gourmet', zh: '美食', ja: 'グルメ', koDesc: '잊지 못할 미학적 미식 경험', enDesc: 'Unforgettable, aesthetic dining experiences', zhDesc: '难忘的美学美食体验', jaDesc: '忘れられない美的グルメ体験' },
  { id: 'artist', ko: '아티스트', en: 'Artists', zh: '艺术家', ja: 'アーティスト', koDesc: '창조적인 영감을 주는 예술가들', enDesc: 'Artists who spark creative inspiration', zhDesc: '带来创意灵感的艺术家们', jaDesc: '創造的なインスピレーションを与えるアーティストたち' },
  { id: 'space', ko: '공간', en: 'Spaces', zh: '空间', ja: '空間', koDesc: '머무는 것만으로도 가치 있는 곳', enDesc: 'Places worth visiting just to be there', zhDesc: '仅仅停留就有价值的地方', jaDesc: '滞在するだけで価値のある場所' },
  { id: 'fashion', ko: '패션', en: 'Fashion', zh: '时尚', ja: 'ファッション', koDesc: '자신만의 철학을 담은 스타일', enDesc: 'Styles that carry your own philosophy', zhDesc: '蕴含自我哲学的风格', jaDesc: '自分だけの哲学を込めたスタイル' },
  { id: 'product', ko: '프로덕트', en: 'Products', zh: '产品', ja: 'プロダクト', koDesc: '삶의 질을 높이는 감각적 도구', enDesc: 'Thoughtful tools that elevate everyday life', zhDesc: '提升生活品质的感性工具', jaDesc: '生活の質を高める感性的な道具' },
  // PLANTS 합류(2026-08-28) — 기존 항목이 전부 AIM/PACE 취향이라 식물 쪽에서 가입한
  // 사용자가 고를 게 없었음
  { id: 'plant', ko: '식물', en: 'Plants', zh: '植物', ja: '植物', koDesc: '공간에 생기를 더하는 초록 반려식물', enDesc: 'Green companions that bring a space to life', zhDesc: '为空间增添生机的绿色伴侣植物', jaDesc: '空間に生気を添えるグリーンの相棒' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [userName, setUserName] = useState('');
  const [lang, setLang] = useState<Lang>('ko');
  const t = (ko: string, en: string, zh: string, ja: string) => tr(lang, ko, en, zh, ja);

  useEffect(() => {
    setLang(detectLang(window.location.search));
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUserName(user.user_metadata?.full_name || t('멤버', 'Member', '会员', 'メンバー'));
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
    if (selected.length === 0) return alert(t(
      '최소 하나 이상의 취향을 선택해 주세요.',
      'Please select at least one interest.',
      '请至少选择一个兴趣。',
      '少なくとも1つ以上の興味を選択してください。',
    ));

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        interests: selected,
        onboarding_completed: true
      }
    });

    if (!error) {
      // 가입을 시작한 사이트(AIM/PACE/PLANTS 등)로 복귀. next가 없으면 기본적으로 메인 매거진으로 안내.
      const nextUrl = new URLSearchParams(window.location.search).get('next');
      window.location.href = (nextUrl && nextUrl.startsWith('http')) ? nextUrl : 'https://nemoneai.com';
    } else {
      alert(t(
        '저장 중 오류가 발생했습니다.',
        'An error occurred while saving.',
        '保存时发生错误。',
        '保存中にエラーが発生しました。',
      ));
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
        <div className="flex justify-center mb-8">
          <LangSwitcher lang={lang} onChange={setLang} />
        </div>

        <div className="w-20 h-20 bg-brand-gold/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-brand-gold/30">
          <Sparkles className="text-brand-gold" size={40} />
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          {t(`반가워요, ${userName}님!`, `Welcome, ${userName}!`, `欢迎, ${userName}!`, `ようこそ、${userName}さん!`)}
        </h1>
        <p className="text-[#E8DCC4] text-lg font-light mb-12">
          {t('당신을 설레게 하는 것은 무엇인가요?', 'What excites you the most?', '什么让你心动?', 'あなたをワクワクさせるものは何ですか?')}
          <br className="hidden md:block" />
          {t(
            '네모네가 유저님의 취향에 딱 맞는 영감을 준비하겠습니다.',
            "NEMONE will curate inspiration tailored to your taste.",
            'NEMONE将为您准备符合口味的灵感。',
            'NEMONEがユーザーの好みにぴったりのインスピレーションをご用意します。',
          )}
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
                  <span className={`text-xl font-bold ${isSelected ? 'text-black' : 'text-white'}`}>{t(item.ko, item.en, item.zh, item.ja)}</span>
                  {isSelected && <Check size={20} className="text-black" />}
                </div>
                <p className={`text-xs ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>{t(item.koDesc, item.enDesc, item.zhDesc, item.jaDesc)}</p>
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
            <>{t('네모네 생태계 입장하기', 'Enter the NEMONE ecosystem', '进入NEMONE生态系统', 'NEMONEエコシステムへ入る')} <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </motion.div>
    </div>
  );
}
