"use client";

import { Lang, saveLang } from '@/utils/lang';

const LANGS: Lang[] = ['ko', 'en', 'zh', 'ja'];

export default function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return (
    <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-lg gap-0.5">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => {
            saveLang(l);
            onChange(l);
          }}
          className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${
            lang === l ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
