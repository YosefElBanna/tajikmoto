'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MotorcycleWithCover } from '@/types';
import { format, isWithinInterval } from 'date-fns';
import { ArrowLeft, Loader2, Plus, X, Image as ImageIcon, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

import { useRouter } from '@/i18n/routing';

export default function AdminFleetPage() {
  const router = useRouter();
  const t = useTranslations('Admin');
  const [fleet, setFleet] = useState<(MotorcycleWithCover & { active_blocks?: any[] })[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<MotorcycleWithCover | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calendar State
  const [calendarBikeId, setCalendarBikeId] = useState<string | null>(null);
  const [blockedRanges, setBlockedRanges] = useState<{ id: string, from: Date, to: Date }[]>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    brand: '',
    name: '',
    price_hourly: 0,
    price_daily: 0,
    price_weekly: 0,
    price_monthly: 0,
    short_description: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.replace('/admin');
      return;
    }
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('motorcycles')
      .select('*, motorcycle_images(image_url, is_cover, display_order)')
      .order('created_at', { ascending: false });

    // Fetch active blocks for all motorcycles
    const { data: blocks } = await supabase
      .from('booking_requests')
      .select('id, motorcycle_id, start_date, end_date')
      .eq('status', 'approved');

    if (data && data.length > 0) {
      const mapped = data.map((m: any) => {
        const sortedImages = m.motorcycle_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
        const coverImage = sortedImages.find((img: any) => img.is_cover)?.image_url || sortedImages[0]?.image_url;
        const images = sortedImages.map((img: any) => img.image_url);
        const active_blocks = blocks?.filter(b => b.motorcycle_id === m.id) || [];
        return { ...m, cover_image: coverImage, images, active_blocks };
      });
      setFleet(mapped);
    } else {
      setFleet([]);
    }
    setLoading(false);
  };

  // --- Modal Handlers ---
  const openAddModal = () => {
    setEditingBike(null);
    setFormData({
      brand: '', name: '', 
      price_hourly: 0, price_daily: 0, price_weekly: 0, price_monthly: 0, short_description: ''
    });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (bike: MotorcycleWithCover) => {
    setEditingBike(bike);
    setFormData({
      brand: bike.brand,
      name: bike.name,
      price_hourly: bike.price_hourly || 0,
      price_daily: bike.price_daily,
      price_weekly: bike.price_weekly,
      price_monthly: bike.price_monthly,
      short_description: bike.short_description || '',
    });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let motorcycleId = editingBike?.id;
    const dataToSave = { ...formData, model_year: 0, engine_size_cc: 0 };

    if (editingBike) {
      const { error } = await supabase.from('motorcycles').update(dataToSave).eq('id', editingBike.id);
      if (error) { alert(error.message); setIsSaving(false); return; }
    } else {
      const { data, error } = await supabase.from('motorcycles').insert([dataToSave]).select().single();
      if (error) { alert(error.message); setIsSaving(false); return; }
      motorcycleId = data.id;
    }

    if (selectedFiles.length > 0 && motorcycleId) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${motorcycleId}/${Date.now()}_${i}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('motorcycles').upload(fileName, file);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('motorcycles').getPublicUrl(fileName);
          await supabase.from('motorcycle_images').insert({
            motorcycle_id: motorcycleId,
            image_url: publicUrl,
            is_cover: i === 0 && !editingBike?.cover_image,
            display_order: i
          });
        }
      }
    }

    setIsModalOpen(false);
    fetchFleet();
    setIsSaving(false);
  };

  // --- Calendar Handlers ---
  const openCalendar = async (bikeId: string) => {
    setCalendarBikeId(bikeId);
    setIsCalendarLoading(true);
    const { data } = await supabase.from('booking_requests')
      .select('*')
      .eq('motorcycle_id', bikeId)
      .eq('status', 'approved');
      
    if (data) {
      setBlockedRanges(data.map(d => ({
        id: d.id,
        from: new Date(d.start_date),
        to: new Date(d.end_date)
      })));
    }
    setSelectedRange(undefined);
    setIsCalendarLoading(false);
  };

  const saveBlock = async () => {
    if (!selectedRange?.from || !selectedRange?.to || !calendarBikeId) return;
    setIsSaving(true);
    
    // Add time component to avoid timezone shifting issues
    const startObj = new Date(selectedRange.from);
    const endObj = new Date(selectedRange.to);
    
    const { error } = await supabase.from('booking_requests').insert({
      motorcycle_id: calendarBikeId,
      customer_name: 'Admin Block',
      customer_phone: 'N/A',
      start_date: format(startObj, 'yyyy-MM-dd'),
      end_date: format(endObj, 'yyyy-MM-dd'),
      duration_type: 'admin_block',
      total_price: 0,
      status: 'approved'
    });

    if (error) alert(error.message);
    else {
      openCalendar(calendarBikeId);
      fetchFleet(); // Update list
    }
    setIsSaving(false);
  };

  const deleteBlock = async (id: string) => {
    setIsSaving(true);
    const { error } = await supabase.from('booking_requests').delete().eq('id', id);
    if (!error) {
      openCalendar(calendarBikeId!);
      fetchFleet();
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete_bike_confirm'))) return;
    const { error } = await supabase.from('motorcycles').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchFleet();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#c89f55] animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full bg-[#f8f7f4] border border-[#e4e4e1] rounded-xl px-4 py-2.5 text-[#1c1c21] text-sm focus:outline-none focus:border-[#c89f55]/50 transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[#71717a] hover:text-[#1c1c21] text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t('back')}
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-[#1c1c21]">{t('fleet_title')}</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#c89f55] hover:bg-[#b08b49] text-[#f8f7f4] px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('add_motorcycle')}</span>
        </button>
      </div>

      <div className="space-y-3">
        {fleet.map(bike => {
          // Check if bike is currently blocked today
          const today = new Date();
          const isBlockedToday = bike.active_blocks?.some(b => 
            isWithinInterval(today, { start: new Date(b.start_date), end: new Date(b.end_date) })
          );
          
          return (
            <div key={bike.id} className="bg-[#ffffff] border border-[#e4e4e1] rounded-xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                  {bike.cover_image ? (
                    <img src={bike.cover_image} alt={bike.name} className="w-16 h-12 object-cover rounded-lg border border-[#e4e4e1]" />
                  ) : (
                    <div className="w-16 h-12 bg-[#f8f7f4] rounded-lg border border-[#e4e4e1] flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-[#d4d4d0]" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-[#1c1c21]">{bike.brand} {bike.name}</h3>
                    <p className="text-xs text-[#71717a] mt-0.5">{bike.images?.length || 0} {t('images').toLowerCase()}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                  !isBlockedToday
                    ? 'bg-[#4ade80]/10 text-[#4ade80]'
                    : 'bg-[#f87171]/10 text-[#f87171]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${!isBlockedToday ? 'bg-[#4ade80]' : 'bg-[#f87171]'}`}></span>
                  {!isBlockedToday ? t('available') : t('busy_today')}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#e4e4e1]/60">
                <button onClick={() => openCalendar(bike.id)} className="flex items-center gap-1.5 text-[#1c1c21] text-sm font-bold px-4 py-2 bg-[#f0eee9] hover:bg-[#e4e4e1] rounded-lg transition-colors border border-[#d4d4d0]">
                  <CalendarIcon className="w-4 h-4" />
                  {t('calendar')}
                </button>
                <div className="flex gap-2 ltr:ml-auto rtl:mr-auto">
                  <button onClick={() => openEditModal(bike as any)} className="text-[#60a5fa] text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[#60a5fa]/10 transition-colors">{t('edit')}</button>
                  <button onClick={() => handleDelete(bike.id)} className="text-[#f87171] text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[#f87171]/10 transition-colors">{t('delete')}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Modal */}
      {calendarBikeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1c21]/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#ffffff] rounded-2xl w-full max-w-lg my-auto overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#e4e4e1] bg-[#f8f7f4]">
              <h2 className="text-xl font-bold text-[#1c1c21]">{t('manage_availability')}</h2>
              <button onClick={() => setCalendarBikeId(null)} className="text-[#71717a] hover:text-[#1c1c21] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5">
              {isCalendarLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[#c89f55] animate-spin" /></div>
              ) : (
                <div className="flex flex-col items-center">
                  <Calendar
                    mode="range"
                    selected={selectedRange}
                    onSelect={setSelectedRange}
                    numberOfMonths={1}
                    disabled={[{ before: new Date() }, ...blockedRanges]}
                    className="mb-4"
                  />
                  
                  {selectedRange?.from && selectedRange?.to && (
                    <button 
                      onClick={saveBlock}
                      disabled={isSaving}
                      className="w-full bg-[#1c1c21] hover:bg-[#33333b] text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      {isSaving ? t('saving') : `${t('block_out')} ${format(selectedRange.from, 'MMM d')} → ${format(selectedRange.to, 'MMM d')}`}
                    </button>
                  )}

                  {blockedRanges.length > 0 && (
                    <div className="w-full mt-6 pt-6 border-t border-[#e4e4e1]">
                      <h4 className="text-sm font-bold text-[#1c1c21] mb-3">{t('blocked_dates')}</h4>
                      <div className="space-y-2">
                        {blockedRanges.map(block => (
                          <div key={block.id} className="flex items-center justify-between bg-[#f8f7f4] p-3 rounded-lg border border-[#e4e4e1]">
                            <span className="text-sm text-[#4a4a52] font-medium">
                              {format(block.from, 'MMM d, yyyy')} - {format(block.to, 'MMM d, yyyy')}
                            </span>
                            <button 
                              onClick={() => deleteBlock(block.id)}
                              disabled={isSaving}
                              className="text-[#f87171] hover:bg-[#f87171]/10 p-1.5 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal ... (Code remains largely the same for this block, just simplified to fit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1c21]/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#ffffff] rounded-2xl w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#e4e4e1]">
              <h2 className="text-xl font-bold text-[#1c1c21]">{editingBike ? t('edit_motorcycle') : t('add_motorcycle')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#71717a] hover:text-[#1c1c21] p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">{t('brand')}</label>
                  <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">{t('name')}</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">{t('price_hourly')}</label>
                  <input type="number" required value={formData.price_hourly} onChange={e => setFormData({...formData, price_hourly: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">{t('price_daily')}</label>
                  <input type="number" required value={formData.price_daily} onChange={e => setFormData({...formData, price_daily: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">{t('price_weekly')}</label>
                  <input type="number" required value={formData.price_weekly} onChange={e => setFormData({...formData, price_weekly: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">{t('price_monthly')}</label>
                  <input type="number" required value={formData.price_monthly} onChange={e => setFormData({...formData, price_monthly: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">{t('images')}</label>
                  <label className="flex flex-col items-center justify-center w-full h-[42px] bg-[#f8f7f4] border border-dashed border-[#c89f55] rounded-xl cursor-pointer hover:bg-[#f0eee9] transition-colors relative overflow-hidden">
                    <div className="flex items-center gap-2 text-[#c89f55] text-sm font-medium">
                      <ImageIcon className="w-4 h-4" />
                      {selectedFiles.length > 0 ? `${selectedFiles.length} ${t('files_selected')}` : t('click_select_images')}
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e4e4e1]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#71717a] hover:bg-[#f0eee9] transition-colors">{t('cancel')}</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#f8f7f4] bg-[#c89f55] hover:bg-[#b08b49] transition-colors disabled:opacity-50">{isSaving ? t('saving') : t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
