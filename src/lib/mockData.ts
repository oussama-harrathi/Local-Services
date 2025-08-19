import { Provider } from './types';

export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Amira Ben Salem',
    city: 'Tunis',
    coords: { lat: 36.8065, lng: 10.1815 },
    categories: ['food_home'],
    bio: 'Traditional Tunisian cuisine specialist. 15 years of experience cooking authentic couscous, brik, and tajines.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amira&backgroundColor=b6e3f4',
    review: { rating: 4.8, count: 23 },
    whatsapp: '+21623456789',
    messenger: 'm.me/amira.bensalem'
  },
  {
    id: '2',
    name: 'Mohamed Trabelsi',
    city: 'Tunis',
    coords: { lat: 36.8165, lng: 10.1915 },
    categories: ['haircut_mobile'],
    bio: 'Mobile barber serving Tunis area. Modern cuts, traditional shaves, beard grooming at your location.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mohamed&backgroundColor=c6f6d5',
    review: { rating: 4.6, count: 18 },
    whatsapp: '+21623567890'
  },
  {
    id: '3',
    name: 'Fatma Khelifi',
    city: 'Tunis',
    coords: { lat: 36.7965, lng: 10.1715 },
    categories: ['cleaning'],
    bio: 'Professional house cleaning service. Eco-friendly products, reliable schedule, attention to detail.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatma&backgroundColor=fed7d7',
    review: { rating: 4.9, count: 31 },
    whatsapp: '+21623678901',
    messenger: 'm.me/fatma.cleaning'
  },
  {
    id: '4',
    name: 'Ahmed Bouazizi',
    city: 'Sousse',
    coords: { lat: 35.8256, lng: 10.6369 },
    categories: ['tutoring'],
    bio: 'Mathematics and physics tutor. University graduate, 8 years teaching experience, all levels welcome.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed&backgroundColor=feebc8',
    review: { rating: 4.7, count: 15 },
    whatsapp: '+21623789012'
  },
  {
    id: '5',
    name: 'Leila Mansouri',
    city: 'Sousse',
    coords: { lat: 35.8356, lng: 10.6469 },
    categories: ['food_home'],
    bio: 'Coastal cuisine specialist. Fresh seafood dishes, Mediterranean flavors, healthy meal prep options.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leila&backgroundColor=e9d5ff',
    review: { rating: 4.5, count: 12 },
    whatsapp: '+21623890123',
    messenger: 'm.me/leila.coastal'
  },
  {
    id: '6',
    name: 'Karim Jebali',
    city: 'Sousse',
    coords: { lat: 35.8156, lng: 10.6269 },
    categories: ['repairs'],
    bio: 'Handyman services - plumbing, electrical, furniture assembly. Quick response, fair prices.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karim&backgroundColor=bfdbfe',
    review: { rating: 4.4, count: 22 },
    whatsapp: '+21623901234'
  },
  {
    id: '7',
    name: 'András Kovács',
    city: 'Budapest',
    coords: { lat: 47.4979, lng: 19.0402 },
    categories: ['haircut_mobile'],
    bio: 'Mobile barber in Budapest. Classic and modern styles, beard care, home visits throughout the city.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andras&backgroundColor=fde68a',
    review: { rating: 4.8, count: 27 },
    whatsapp: '+36301234567',
    messenger: 'm.me/andras.barber'
  },
  {
    id: '8',
    name: 'Eszter Nagy',
    city: 'Budapest',
    coords: { lat: 47.5079, lng: 19.0502 },
    categories: ['tutoring', 'cleaning'],
    bio: 'English tutor and house cleaning. Native speaker, flexible schedule, thorough cleaning service.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eszter&backgroundColor=fbcfe8',
    review: { rating: 4.6, count: 19 },
    whatsapp: '+36301345678'
  },
  {
    id: '9',
    name: 'Péter Szabó',
    city: 'Budapest',
    coords: { lat: 47.4879, lng: 19.0302 },
    categories: ['food_home'],
    bio: 'Traditional Hungarian cuisine. Goulash, schnitzel, strudel - authentic recipes from my grandmother.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=peter&backgroundColor=d1fae5',
    review: { rating: 4.9, count: 34 },
    whatsapp: '+36301456789',
    messenger: 'm.me/peter.hungarian'
  },
  {
    id: '10',
    name: 'Zoltán Tóth',
    city: 'Budapest',
    coords: { lat: 47.5179, lng: 19.0602 },
    categories: ['repairs'],
    bio: 'Home repairs and maintenance. 20+ years experience, reliable service, warranty on all work.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zoltan&backgroundColor=ddd6fe',
    review: { rating: 4.7, count: 41 },
    whatsapp: '+36301567890'
  },
  {
    id: '11',
    name: 'Sarra Hamdi',
    city: 'Tunis',
    coords: { lat: 36.8265, lng: 10.2015 },
    categories: ['tutoring'],
    bio: 'French and Arabic language tutor. Certified teacher, conversation practice, exam preparation.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarra&backgroundColor=fecaca',
    review: { rating: 4.8, count: 16 },
    whatsapp: '+21623012345',
    messenger: 'm.me/sarra.languages'
  },
  {
    id: '12',
    name: 'Katalin Varga',
    city: 'Budapest',
    coords: { lat: 47.4779, lng: 19.0202 },
    categories: ['cleaning'],
    bio: 'Professional cleaning service. Deep cleaning, regular maintenance, move-in/move-out cleaning.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=katalin&backgroundColor=a7f3d0',
    review: { rating: 4.5, count: 28 },
    whatsapp: '+36301678901'
  }
];