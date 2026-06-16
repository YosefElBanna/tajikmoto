'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Globe, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCALES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'عربي',    short: 'AR' },
  { code: 'ru', label: 'Русский', short: 'RU' },
];

export default function Navbar() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const currentLocale = LOCALES.find(l => l.code === locale) || LOCALES[0];

  const switchLocale = (code: string) => {
    router.replace(pathname, { locale: code });
    setIsLangOpen(false);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { name: t('home'), href: '/' },
    { name: t('fleet'), href: '/fleet' },
    { name: t('admin'), href: '/admin' }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#f8f7f4]/85 border-b border-[#e4e4e1]/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-outfit font-bold text-[#1c1c21] tracking-wide">
            TAJIK<span className="text-[#c89f55]">MOTO</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#c89f55] bg-[#c89f55]/10'
                      : 'text-[#71717a] hover:text-[#1c1c21] hover:bg-[#f0eee9]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="w-px h-5 bg-[#e4e4e1] mx-2"></div>
            {/* Desktop lang dropdown */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setIsLangOpen(v => !v)}
                className="flex items-center gap-2 text-[#1c1c21] bg-[#f0eee9] hover:bg-[#e4e4e1] px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ltr:ml-2 rtl:mr-2"
              >
                <Globe className="w-4 h-4 text-[#71717a]" />
                <span>{currentLocale.short}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#71717a] transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-36 bg-white border border-[#e4e4e1] rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    {LOCALES.map(loc => (
                      <button
                        key={loc.code}
                        onClick={() => switchLocale(loc.code)}
                        className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium transition-colors ${
                          locale === loc.code
                            ? 'bg-[#c89f55]/10 text-[#c89f55]'
                            : 'text-[#4a4a52] hover:bg-[#f0eee9] hover:text-[#1c1c21]'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setIsLangOpen(v => !v)}
              className="flex items-center justify-center text-xs font-bold text-[#1c1c21] bg-[#f0eee9] hover:bg-[#e4e4e1] px-3 py-1.5 rounded-lg transition-colors shadow-sm gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-[#71717a]" />
              <span>{currentLocale.short}</span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#71717a] hover:text-[#1c1c21] hover:bg-[#f0eee9] transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {/* Mobile lang dropdown overlay */}
          <AnimatePresence>
            {isLangOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-16 ltr:right-4 rtl:left-4 md:hidden w-40 bg-white border border-[#e4e4e1] rounded-xl shadow-lg overflow-hidden z-50"
              >
                {LOCALES.map(loc => (
                  <button
                    key={loc.code}
                    onClick={() => switchLocale(loc.code)}
                    className={`flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium transition-colors ${
                      locale === loc.code
                        ? 'bg-[#c89f55]/10 text-[#c89f55]'
                        : 'text-[#4a4a52] hover:bg-[#f0eee9] hover:text-[#1c1c21]'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-[#ffffff] border-b border-[#e4e4e1]"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? 'text-[#c89f55] bg-[#c89f55]/8'
                        : 'text-[#4a4a52] hover:text-[#1c1c21] hover:bg-[#f0eee9]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              {LOCALES.filter(loc => loc.code !== locale).map(loc => (
                <button
                  key={loc.code}
                  onClick={() => switchLocale(loc.code)}
                  className="flex w-full items-center gap-3 text-[#4a4a52] hover:text-[#1c1c21] px-4 py-3 rounded-xl text-base font-medium transition-colors hover:bg-[#f0eee9]"
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
