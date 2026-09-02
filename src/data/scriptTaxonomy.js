// Presentation taxonomy only. Script records themselves are loaded from MongoDB.
export const scriptCategories = [
  { id: 'all', label: 'Semua Naskah' },
  { id: 'comedy', label: 'Sitkom & Drama' },
  { id: 'variety', label: 'Talkshow & Variety' },
  { id: 'news', label: 'Berita & Media' },
];

export const scriptGroupConfig = {
  comedy: { label: 'SITKOM & DRAMA', subtitle: 'Naskah Situasi Komedi & Drama' },
  variety: { label: 'TALKSHOW & VARIETY', subtitle: 'Naskah Talkshow, Gameshow & Variety Show' },
  news: { label: 'BERITA & MEDIA', subtitle: 'Naskah Lead Siaran & Berita Digital' },
};
