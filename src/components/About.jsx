import React, { useState, useEffect } from 'react';
import { getEducation, subscribeToDataChanges } from '../lib/contentService';
import { Award } from 'lucide-react';

export default function About() {
  const [educationList, setEducationList] = useState([]);

  const loadEducation = async () => {
    try {
      const data = await getEducation();
      setEducationList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[About] Failed to load education:', err);
    }
  };

  useEffect(() => {
    loadEducation();
    const unsubscribe = subscribeToDataChanges(() => {
      loadEducation();
    });
    return unsubscribe;
  }, []);

  const awards = [
    {
      title: "Karya Perdana Angkatan 12 Terfavorit",
      detail: "Broadcast Award 2023 — Asisten Produser",
      date: "20 November 2023",
    },
    {
      title: "Juara 3 Fotografi",
      detail: "Atma Jaya Communication Week 2023",
      date: "29 Mei 2023",
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-divider bg-navy-base" id="tentang">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

        {/* Title Column */}
        <div className="md:col-span-4">
          <div className="sticky top-24">
            <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">Tentang<br />Zahara.</h2>
            <div className="mt-6 w-12 h-[1px] bg-blue-accent"></div>
          </div>
        </div>

        {/* Content Column */}
        <div className="md:col-span-8 flex flex-col gap-12">

          <div className="prose prose-invert prose-p:text-ivory/90 prose-p:leading-relaxed max-w-none">
            <p className="text-lg">
              Lulusan D3 Penyiaran Politeknik Negeri Media Kreatif Jakarta dengan minat dan pengalaman dalam dunia produksi media.
              Berperan sebagai produser, penulis naskah, dan social media specialist.
            </p>
            <p className="text-muted mt-4">
              Memiliki pengalaman berorganisasi, kemampuan komunikasi yang baik serta kreatif dalam menciptakan program audio visual di berbagai platform digital.
            </p>
          </div>

          {/* Education & Mini Timeline */}
          <div>
            <h3 className="text-sm font-mono tracking-widest text-muted uppercase mb-6 flex items-center gap-4">
              <span className="w-4 h-4 border border-divider rounded-sm flex items-center justify-center text-[8px]">ED</span>
              Pendidikan
            </h3>

            <div className="flex flex-col gap-8">
              {educationList.map((edu, idx) => (
                <div key={idx} className="border-l border-divider ml-2 pl-6 relative">
                  <div className={`absolute w-2 h-2 rounded-full -left-[5px] top-1.5 ${idx === 0 ? 'bg-blue-accent shadow-[0_0_8px_rgba(74,127,232,0.5)]' : 'bg-divider'}`}></div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono text-muted">{edu.date}</span>
                      {edu.status && (
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-divider rounded-[4px] text-ivory">
                          {edu.status}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-ivory text-lg">{edu.institution}</h4>
                      <p className="text-muted text-sm">{edu.program}</p>
                      {edu.gpa && (
                        <p className="text-xs font-mono mt-1 text-muted">
                          {edu.gpaLabel || 'IPK'} <span className="text-blue-accent">{edu.gpa}</span>
                          {edu.gpaNote && ` — ${edu.gpaNote}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Awards / Penghargaan */}
          <div>
            <h3 className="text-sm font-mono tracking-widest text-muted uppercase mb-6 flex items-center gap-4">
              <span className="w-4 h-4 border border-divider rounded-sm flex items-center justify-center text-[8px]">AW</span>
              Penghargaan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {awards.map((award, idx) => (
                <div key={idx} className="p-5 bg-navy-deep border border-divider rounded-sm flex flex-col gap-3 group hover:border-blue-accent/30 transition-colors">
                  <Award size={18} className="text-blue-accent opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div>
                    <h4 className="text-ivory font-semibold text-sm leading-tight">{award.title}</h4>
                    <p className="text-muted text-xs mt-1">{award.detail}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted tracking-wider mt-auto pt-2 border-t border-divider/50">
                    {award.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
