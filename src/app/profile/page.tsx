"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Camera, Loader2, Save, User as UserIcon, Globe, ArrowLeft, Check } from 'lucide-react';
import { Lang, detectLang, tr } from '@/utils/lang';
import LangSwitcher from '@/components/LangSwitcher';

// 공용 계정 프로필 편집 — 이름/사진/성별/나이/국적은 Supabase auth.users의 user_metadata에
// 저장되는 "계정 데이터"라 특정 서비스(PACE)가 아니라 인증 센터가 소유하는 게 맞다.
// 각 서비스(PACE 마이페이지, PLANTS 마이가든 등)는 여기로 링크만 걸고, 서비스 전용 설정
// (예: PACE 핫플랭킹 푸시알림)은 각자 화면에 남긴다.
export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0c0c]" />}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lang, setLang] = useState<Lang>('ko');
  const t = (ko: string, en: string, zh: string, ja: string) => tr(lang, ko, en, zh, ja);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [nationality, setNationality] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [nextUrl, setNextUrl] = useState('');

  useEffect(() => {
    setLang(detectLang(window.location.search));
    const next = new URLSearchParams(window.location.search).get('next');
    if (next && next.startsWith('http')) setNextUrl(next);

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // 로그인 후 다시 이 화면으로 돌아오게 next에 현재 URL을 실어 보냄
        window.location.href = `/login?next=${encodeURIComponent(window.location.href)}`;
        return;
      }
      setUserId(user.id);
      setEmail(user.email || '');
      setName(user.user_metadata?.full_name || '');
      setGender(user.user_metadata?.gender || '');
      setAge(user.user_metadata?.age || '');
      setNationality(user.user_metadata?.nationality || '');
      setImageUrl(user.user_metadata?.avatar_url || '');
      setPreviewUrl(user.user_metadata?.avatar_url || '');
      setIsLoading(false);
    };
    load();
  }, [supabase]);

  // 원본 그대로 올리면 프로필 사진 한 장이 수 MB가 되므로 400px webp로 줄여서 업로드
  const compressImage = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const MAX = 400;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX) { height *= MAX / width; width = MAX; }
          } else if (height > MAX) {
            width *= MAX / height; height = MAX;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Canvas to Blob failed'))),
            'image/webp',
            0.8,
          );
        };
      };
      reader.onerror = reject;
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSaved(false);
    let finalImageUrl = imageUrl;

    try {
      if (selectedFile) {
        const blob = await compressImage(selectedFile);
        const fileName = `${userId}-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(fileName, blob, { contentType: 'image/webp', upsert: true });
        if (uploadError) {
          throw new Error(t(
            '이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.',
            'Image upload failed. Please try again in a moment.',
            '图片上传失败。请稍后再试。',
            '画像のアップロードに失敗しました。しばらくしてからもう一度お試しください。',
          ));
        }
        finalImageUrl = supabase.storage.from('profiles').getPublicUrl(fileName).data.publicUrl;
        setImageUrl(finalImageUrl);
        setSelectedFile(null);
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          gender: gender || null,
          age: age || null,
          nationality: nationality || null,
          avatar_url: finalImageUrl,
        },
      });
      if (updateError) throw new Error(updateError.message);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : t(
        '저장 중 오류가 발생했습니다.',
        'An error occurred while saving.',
        '保存时发生错误。',
        '保存中にエラーが発生しました。',
      ));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
        <Loader2 className="animate-spin text-brand-gold w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 to-transparent pointer-events-none" />

      <div className="relative max-w-md mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          {nextUrl ? (
            <a
              href={nextUrl}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors no-underline"
            >
              <ArrowLeft size={14} />
              {t('돌아가기', 'Back', '返回', '戻る')}
            </a>
          ) : (
            <span />
          )}
          <LangSwitcher lang={lang} onChange={setLang} />
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-gold mb-2">Account</p>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            {t('프로필 설정', 'Profile Settings', '个人资料设置', 'プロフィール設定')}
          </h1>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            {t(
              '네모네의 모든 서비스에서 공통으로 사용되는 정보입니다.',
              'This information is shared across all NEMONE services.',
              '此信息在所有NEMONE服务中通用。',
              'NEMONEのすべてのサービスで共通して使用される情報です。',
            )}
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-8">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
          >
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={40} className="text-zinc-700" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-7 h-7" />
            </div>
            <div className="absolute bottom-0 right-0 p-2 bg-brand-gold rounded-full border-2 border-[#0c0c0c] text-black">
              <Camera size={12} />
            </div>
          </button>
          <p className="text-[10px] font-bold text-zinc-600 mt-4 uppercase tracking-widest">
            {t('사진 변경', 'Change Photo', '更换照片', '写真を変更')}
          </p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-1">Email</label>
            <div className="w-full bg-white/[.02] border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-500">
              {email}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
              placeholder={t('이름을 입력하세요', 'Enter your name', '请输入姓名', 'お名前を入力してください')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
              >
                <option value="" className="bg-[#0c0c0c]">{t('선택 안함', 'Not selected', '不选择', '未選択')}</option>
                <option value="male" className="bg-[#0c0c0c]">{t('남성', 'Male', '男', '男性')}</option>
                <option value="female" className="bg-[#0c0c0c]">{t('여성', 'Female', '女', '女性')}</option>
                <option value="other" className="bg-[#0c0c0c]">{t('기타', 'Other', '其他', 'その他')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-1">Age</label>
              <select
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
              >
                <option value="" className="bg-[#0c0c0c]">{t('선택 안함', 'Not selected', '不选择', '未選択')}</option>
                <option value="10s" className="bg-[#0c0c0c]">{t('10대', 'Teens', '10多岁', '10代')}</option>
                <option value="20s" className="bg-[#0c0c0c]">{t('20대', '20s', '20多岁', '20代')}</option>
                <option value="30s" className="bg-[#0c0c0c]">{t('30대', '30s', '30多岁', '30代')}</option>
                <option value="40s" className="bg-[#0c0c0c]">{t('40대 이상', '40s+', '40岁以上', '40代以上')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-1">Nationality</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                placeholder={t('예: 한국, USA, Japan...', 'e.g. Korea, USA, Japan...', '例:韩国、USA、Japan...', '例:韓国、USA、Japan...')}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-8 py-4 bg-brand-gold text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : saved ? (
            <><Check size={18} /> {t('저장되었습니다', 'Saved', '已保存', '保存しました')}</>
          ) : (
            <><Save size={18} /> {t('변경사항 저장', 'Save Changes', '保存修改', '変更を保存')}</>
          )}
        </button>
      </div>
    </div>
  );
}
