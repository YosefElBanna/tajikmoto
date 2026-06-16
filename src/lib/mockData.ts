export const mockMotorcycles = [
  {
    id: 'mock-1',
    name: 'R1250 GS',
    brand: 'BMW',
    model_year: 2023,
    engine_size_cc: 1254,
    short_description: 'The ultimate adventure motorcycle for exploring the world. Equipped with heated grips, luggage racks, and off-road capabilities.',
    price_daily: 2500,
    price_weekly: 15000,
    price_monthly: 50000,
    busy_until: null,
    created_at: new Date().toISOString(),
    cover_image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    motorcycle_images: [
      { id: 'img-1', image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', is_cover: true, display_order: 0 },
      { id: 'img-2', image_url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', is_cover: false, display_order: 1 }
    ]
  },
  {
    id: 'mock-2',
    name: 'Panigale V4',
    brand: 'Ducati',
    model_year: 2024,
    engine_size_cc: 1103,
    short_description: 'Experience pure track performance on the road. The Panigale V4 offers breathtaking speed and Italian styling.',
    price_daily: 4000,
    price_weekly: 24000,
    price_monthly: 80000,
    busy_until: new Date(Date.now() + 86400000 * 3).toISOString(), // Busy for 3 days
    created_at: new Date().toISOString(),
    cover_image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    motorcycle_images: [
      { id: 'img-3', image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', is_cover: true, display_order: 0 }
    ]
  }
].map(m => ({
  ...m,
  images: m.motorcycle_images.sort((a, b) => a.display_order - b.display_order).map(i => i.image_url)
}));
