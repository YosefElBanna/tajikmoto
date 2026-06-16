import {useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import Hero from '@/components/home/Hero';
import MotorcycleCard from '@/components/fleet/MotorcycleCard';
import { supabase } from '@/lib/supabase';
import { MotorcycleWithCover } from '@/types';
import { Link } from '@/i18n/routing';
import { mockMotorcycles } from '@/lib/mockData';
import { ArrowRight } from 'lucide-react';

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  setRequestLocale(locale);

  const { data: motorcycles } = await supabase
    .from('motorcycles')
    .select(`
      *,
      motorcycle_images (image_url, is_cover)
    `)
    .limit(3);

  let featuredFleet: MotorcycleWithCover[] = (motorcycles || []).map((m: any) => {
    const coverImage = m.motorcycle_images?.find((img: any) => img.is_cover)?.image_url 
      || m.motorcycle_images?.[0]?.image_url;
    return { ...m, cover_image: coverImage };
  });

  if (featuredFleet.length === 0) {
    featuredFleet = mockMotorcycles;
  }

  const t = await getTranslations('Home');

  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      
      {/* Featured Section */}
      <section className="w-full py-16 sm:py-24 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10 sm:mb-14">
          <div>
            <span className="text-[#c89f55] text-xs font-bold tracking-[0.15em] uppercase mb-3 block">{t('collection')}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-outfit font-bold text-[#1c1c21]">{t('featured')}</h2>
          </div>
          <Link href="/fleet" className="hidden md:inline-flex items-center gap-2 text-[#71717a] hover:text-[#c89f55] text-sm font-medium transition-colors">
            {t('view_all')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {featuredFleet.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featuredFleet.map(motorcycle => (
              <MotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#ffffff] rounded-2xl border border-[#e4e4e1]">
            <p className="text-[#71717a]">{t('empty')}</p>
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link href="/fleet" className="inline-flex items-center gap-2 px-6 py-3 border border-[#e4e4e1] rounded-xl text-[#4a4a52] hover:text-[#1c1c21] hover:border-[#d4d4d0] transition-colors text-sm font-medium">
            {t('view_all_mobile')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </main>
  );
}
