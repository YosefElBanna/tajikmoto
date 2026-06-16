import { setRequestLocale } from 'next-intl/server';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import BookingForm from '@/components/fleet/BookingForm';
import { Motorcycle, MotorcycleImage } from '@/types';
import { mockMotorcycles } from '@/lib/mockData';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default async function MotorcycleDetailsPage({
  params
}: {
  params: Promise<{locale: string, id: string}>;
}) {
  const resolvedParams = await params;
  const { locale, id } = resolvedParams;
  setRequestLocale(locale);

  const t = await getTranslations('Booking');

  // Fetch motorcycle details
  let { data: motorcycle, error } = await supabase
    .from('motorcycles')
    .select(`*, motorcycle_images (id, image_url, is_cover, display_order)`)
    .eq('id', id)
    .single();

  if (error || !motorcycle) {
    motorcycle = mockMotorcycles.find(m => m.id === id) as any;
    if (!motorcycle) {
      notFound();
    }
  }

  // Fetch blocked dates
  const { data: blocks } = await supabase
    .from('booking_requests')
    .select('start_date, end_date')
    .eq('motorcycle_id', id)
    .eq('status', 'approved');

  const activeBlocks = blocks || [];

  // Sort images
  const images = (motorcycle.motorcycle_images as MotorcycleImage[] || [])
    .sort((a, b) => {
      if (a.is_cover) return -1;
      if (b.is_cover) return 1;
      return (a.display_order || 0) - (b.display_order || 0);
    });

  const isAvailable = !motorcycle.busy_until || new Date(motorcycle.busy_until) < new Date();

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Back link */}
      <Link href="/fleet" className="inline-flex items-center gap-2 text-[#71717a] hover:text-[#1c1c21] text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        Back to motorcycles
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Left Column: Images and Details — 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main image */}
          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#ffffff] border border-[#e4e4e1]/60">
            {images.length > 0 ? (
              <img src={images[0].image_url} alt={motorcycle.name} className="w-full h-full object-cover" />
            ) : motorcycle.cover_image ? (
              <img src={motorcycle.cover_image} alt={motorcycle.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#71717a]">No Image Available</div>
            )}
          </div>
          
          {/* Thumbnail gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1, 5).map(img => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-[#ffffff] border border-[#e4e4e1]/60 hover:border-[#d4d4d0] transition-colors">
                   <img src={img.image_url} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Motorcycle info */}
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[#c89f55] text-xs font-bold tracking-[0.15em] uppercase">{motorcycle.brand}</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                isAvailable 
                  ? 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20' 
                  : 'bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[#4ade80]' : 'bg-[#f87171]'}`}></span>
                {isAvailable ? 'Available' : `Busy until ${new Date(motorcycle.busy_until!).toLocaleDateString()}`}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-outfit font-bold text-[#1c1c21] mb-2">{motorcycle.name}</h1>
            <div className="flex items-center gap-2 text-[#71717a] text-sm mb-6">
              <span>{motorcycle.engine_size_cc}cc</span>
              <span className="w-1 h-1 rounded-full bg-[#d4d4d0]"></span>
              <span>{motorcycle.model_year}</span>
            </div>
            
            {motorcycle.short_description && (
              <p className="text-[#4a4a52] leading-relaxed text-[15px]">{motorcycle.short_description}</p>
            )}
          </div>

          {/* Requirements Notice */}
          <div className="flex gap-4 p-5 bg-[#c89f55]/5 border border-[#c89f55]/15 rounded-2xl">
            <Shield className="w-5 h-5 text-[#c89f55] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[#c89f55] mb-1">{t('requirements_title')}</h3>
              <p className="text-sm text-[#4a4a52] leading-relaxed">{t('requirements_note')}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Form — 2 cols */}
        <div className="lg:col-span-2">
           <div className="lg:sticky lg:top-24">
             <BookingForm motorcycle={motorcycle as Motorcycle} activeBlocks={activeBlocks} />
           </div>
        </div>
      </div>
    </div>
  );
}
