/**
 * MongoDB Taxonomy & Contact Defaults
 * Portfolio: Zahara Elhusna Barok
 */

export const defaultWorkCategories = [
  {
    id: 'magang',
    label: 'MAGANG',
    subtitle: 'Pengalaman Profesional',
    order: 1,
  },
  {
    id: 'smk',
    label: 'SMK',
    subtitle: 'Awal Perjalanan Produksi',
    order: 2,
  },
  {
    id: 'kampus',
    label: 'KAMPUS',
    subtitle: 'Politeknik Negeri Media Kreatif',
    order: 3,
  },
  {
    id: 'polimedia-tv',
    label: 'POLIMEDIA TV',
    subtitle: 'Produksi & Organisasi Media',
    order: 4,
  },
];

export const defaultExpCategories = [
  {
    id: 'magang',
    label: 'MAGANG',
    subtitle: 'Pengalaman Profesional',
    order: 1,
  },
  {
    id: 'organisasi',
    label: 'ORGANISASI',
    subtitle: 'Kepemimpinan & Aktivitas Media',
    order: 2,
  },
];

export const defaultRoleFilters = [
  {
    id: 'all',
    label: 'Semua',
    roles: null,
    order: 1,
  },
  {
    id: 'producer',
    label: 'Produser',
    roles: [
      'Produser',
      'Asisten Produser',
      'Produser & Reporter',
      'Produser & Host',
      'Redaktur Softnews',
    ],
    order: 2,
  },
  {
    id: 'writer',
    label: 'Penulis Naskah',
    roles: [
      'Penulis Naskah',
      'Penulis Naskah & Host',
      'Penulis Naskah & Reporter',
      'Script Writer & Talent Coordinator',
      'Asisten Script',
    ],
    order: 3,
  },
  {
    id: 'reporter',
    label: 'Reporter',
    roles: [
      'Reporter',
      'Produser & Reporter',
      'Penulis Naskah & Reporter',
      'Content Creator & Reporter',
    ],
    order: 4,
  },
  {
    id: 'host',
    label: 'Host',
    roles: [
      'Penulis Naskah & Host',
      'Produser & Host',
    ],
    order: 5,
  },
  {
    id: 'director',
    label: 'Sutradara',
    roles: [
      'Sutradara',
    ],
    order: 6,
  },
];

export const defaultContact = {
  email: 'zaharaelhusnab@gmail.com',
  linkedin: 'https://linkedin.com/in/zahara-elhusna-barok/',
  linkedinDisplay: '@zahara-elhusna-barok',
  instagram: 'https://instagram.com/zhr.elhusna',
  instagramDisplay: '@zhr.elhusna',
  whatsapp: 'https://wa.me/6285211372894',
  whatsappDisplay: '+62 852-1137-2894',
  youtube: 'https://youtube.com/@zaharaelhusna',
  phone: '+62 852-1137-2894',
  location: 'Jakarta, Indonesia',
};
