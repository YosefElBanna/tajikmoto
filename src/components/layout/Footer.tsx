import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  return (
    <footer className="bg-[#f8f7f4] border-t border-[#e4e4e1]/40 py-10 text-[#71717a]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-start">
           <span className="text-lg font-outfit font-bold text-[#1c1c21] tracking-wide">
             TAJIK<span className="text-[#c89f55]">MOTO</span>
           </span>
           <p className="mt-1.5 text-sm text-[#71717a]">{t('tagline')}</p>
        </div>
        <div className="text-sm text-[#71717a]/60">
           &copy; {new Date().getFullYear()} TAJIKMOTO
        </div>
      </div>
    </footer>
  );
}
