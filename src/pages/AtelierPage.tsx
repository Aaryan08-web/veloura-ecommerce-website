import React from 'react';

const sections = [
  {
    id: 'manifesto',
    eyebrow: 'The VELOURA Perspective',
    title: 'Brand Manifesto',
    copy: 'VELOURA creates considered silhouettes for a life lived with presence. Each piece balances architectural form, tactile comfort, and a quiet sense of personal expression.',
  },
  {
    id: 'fit',
    eyebrow: 'Client Service',
    title: 'Size & Fit Guide',
    copy: 'Review each garment’s individual fit notes and size range on its product page. For the most precise fit, compare your preferred measurements with the listed silhouette description before adding a piece to your bag.',
  },
  {
    id: 'fibers',
    eyebrow: 'Material Practice',
    title: 'Sustainable Fibers',
    copy: 'Our seasonal wardrobe prioritizes enduring materials, responsible sourcing, and garments designed to be worn and cared for over time.',
  },
  {
    id: 'mills',
    eyebrow: 'Craft',
    title: 'Artisan Mills',
    copy: 'VELOURA’s imagined atelier approach celebrates skilled textile makers, thoughtful finishing, and the material integrity behind every considered silhouette.',
  },
  {
    id: 'careers',
    eyebrow: 'The Atelier',
    title: 'Careers at VELOURA',
    copy: 'We are building a client experience rooted in care, curiosity, and contemporary craft. Career opportunities will be shared here when available.',
  },
];

export const AtelierPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-16">
    <header className="max-w-2xl space-y-3">
      <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-stone-500 dark:text-stone-400">The Atelier</span>
      <h1 className="font-serif text-4xl sm:text-5xl font-light text-stone-950 dark:text-white">The world of VELOURA</h1>
      <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">A closer look at our point of view, client guidance, and material practice.</p>
    </header>

    {sections.map((section) => (
      <section key={section.id} id={section.id} className="scroll-mt-28 border-t border-stone-200 dark:border-white/10 pt-8 space-y-3">
        <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-amber-700 dark:text-amber-400">{section.eyebrow}</span>
        <h2 className="font-serif text-3xl font-light text-stone-950 dark:text-white">{section.title}</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">{section.copy}</p>
      </section>
    ))}
  </div>
);
