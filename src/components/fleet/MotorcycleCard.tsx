'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MotorcycleWithCover } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MotorcycleCard({ motorcycle }: { motorcycle: MotorcycleWithCover }) {
  const t = useTranslations('Fleet');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  
  const isAvailable = !motorcycle.is_blocked_today;

  const images = motorcycle.images && motorcycle.images.length > 0 
    ? motorcycle.images 
    : (motorcycle.cover_image ? [motorcycle.cover_image] : []);

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link href={`/fleet/${motorcycle.id}`} className="block h-full">
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="group relative bg-[#ffffff] rounded-2xl overflow-hidden border border-[#e4e4e1] shadow-sm hover:shadow-md hover:border-[#d4d4d0] transition-all duration-300 flex flex-col h-full"
      >
        {/* Image Carousel */}
        <div className="relative aspect-[16/10] bg-[#f0eee9] overflow-hidden">
          {images.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImageIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={images[currentImageIdx]} 
                alt={`${motorcycle.name} - ${currentImageIdx + 1}`} 
                className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#71717a]">
              {t('no_image')}
            </div>
          )}
          
          {/* Carousel Controls */}
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute top-1/2 -translate-y-1/2 ltr:left-2 rtl:right-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute top-1/2 -translate-y-1/2 ltr:right-2 rtl:left-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-20">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentImageIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#ffffff] to-transparent z-10 pointer-events-none"></div>

          {/* Availability Badge */}
          <div className="absolute top-3 ltr:right-3 rtl:left-3 z-10">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
                isAvailable
                  ? 'bg-[#4ade80]/90 text-white'
                  : 'bg-[#f87171]/90 text-white'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white' : 'bg-white'} animate-pulse`}></span>
                {isAvailable ? t('available') : t('busy')}
              </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex-grow">
            <p className="text-[#c89f55] text-[11px] font-bold tracking-[0.15em] uppercase mb-1.5">{motorcycle.brand}</p>
            <h3 className="text-xl font-bold font-outfit text-[#1c1c21] mb-4 group-hover:text-[#c89f55] transition-colors leading-snug">{motorcycle.name}</h3>

            {/* Pricing row */}
            <div className="grid grid-cols-3 gap-2">
              {motorcycle.price_daily > 0 && (
                <div className="bg-[#f8f7f4] rounded-xl p-2.5 text-center border border-[#e4e4e1]/40">
                  <p className="text-[10px] text-[#71717a] mb-0.5">{t('daily')}</p>
                  <p className="text-sm font-bold text-[#1c1c21]">{motorcycle.price_daily}<span className="text-[9px] text-[#71717a] font-normal mx-1">{t('currency')}</span></p>
                </div>
              )}
              {motorcycle.price_weekly > 0 && (
                <div className="bg-[#f8f7f4] rounded-xl p-2.5 text-center border border-[#e4e4e1]/40">
                  <p className="text-[10px] text-[#71717a] mb-0.5">{t('weekly')}</p>
                  <p className="text-sm font-bold text-[#1c1c21]">{motorcycle.price_weekly}<span className="text-[9px] text-[#71717a] font-normal mx-1">{t('currency')}</span></p>
                </div>
              )}
              {motorcycle.price_monthly > 0 && (
                <div className="bg-[#f8f7f4] rounded-xl p-2.5 text-center border border-[#e4e4e1]/40">
                  <p className="text-[10px] text-[#71717a] mb-0.5">{t('monthly')}</p>
                  <p className="text-sm font-bold text-[#1c1c21]">{motorcycle.price_monthly}<span className="text-[9px] text-[#71717a] font-normal mx-1">{t('currency')}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-5 pt-4 border-t border-[#e4e4e1]/60 flex items-center justify-between">
            <span className="text-sm text-[#71717a] group-hover:text-[#4a4a52] transition-colors">{t('view_details')}</span>
            <div className="w-8 h-8 rounded-full bg-[#f0eee9] group-hover:bg-[#c89f55] flex items-center justify-center transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-[#71717a] group-hover:text-[#f8f7f4] transition-colors rtl:rotate-180" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
