import {setRequestLocale, getTranslations} from 'next-intl/server';
import { supabase } from '@/lib/supabase';
import MotorcycleCard from '@/components/fleet/MotorcycleCard';
import { MotorcycleWithCover } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function FleetPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  setRequestLocale(locale);
  
  const t = await getTranslations('Fleet');

  const { data: motorcycles } = await supabase
    .from('motorcycles')
    .select(`*, motorcycle_images (image_url, is_cover), booking_requests (start_date, end_date, status)`)
    .order('created_at', { ascending: false });

  let fleet: MotorcycleWithCover[] = (motorcycles || []).map((m: any) => {
    const sortedImages = m.motorcycle_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
    const coverImage = sortedImages.find((img: any) => img.is_cover)?.image_url 
      || sortedImages[0]?.image_url;
    const images = sortedImages.map((img: any) => img.image_url);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const active_blocks = m.booking_requests?.filter((b: any) => b.status === 'approved') || [];
    let blocked_until = null;
    
    for (const b of active_blocks) {
      const start = new Date(b.start_date); start.setHours(0,0,0,0);
      const end = new Date(b.end_date); end.setHours(23,59,59,999);
      if (today >= start && today <= end) {
        blocked_until = b.end_date;
        break;
      }
    }

    return { ...m, cover_image: coverImage, images, blocked_until };
  });


  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-24">
      <div className="mb-10 sm:mb-14">
        <span className="text-[#c89f55] text-xs font-bold tracking-[0.15em] uppercase mb-3 block">{t('browse')}</span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-[#1c1c21]">{t('page_title')}</h1>
        <p className="text-[#71717a] mt-3 max-w-lg">{t('page_desc')}</p>
      </div>
      
      {fleet.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {fleet.map(motorcycle => (
            <MotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#ffffff] rounded-2xl border border-[#e4e4e1]">
          <p className="text-[#71717a]">{t('empty')}</p>
        </div>
      )}
    </div>
  );
}
