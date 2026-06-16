'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('Hero');

  return (
    <div className="relative w-full min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c1c21]/50 via-[#1c1c21]/40 to-[#f8f7f4]"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Small tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border border-[#c89f55]/50 text-[#c89f55] bg-[#c89f55]/10 mb-6 backdrop-blur-sm">
            TAJIK MOTO
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-8xl font-outfit font-extrabold text-white tracking-tight mb-5 leading-[1.1]"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)' }}
        >
          {t('title')}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl text-white/80 font-inter mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
        >
          {t('subtitle')}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <Link 
            href="/fleet"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#c89f55] hover:bg-[#b08b49] text-[#f8f7f4] font-bold rounded-full text-base transition-all duration-200 hover:shadow-lg hover:shadow-[#c89f55]/20"
          >
            {t('cta')}
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-[#71717a]/50" />
        </motion.div>
      </motion.div>
    </div>
  );
}
