import React from 'react';
import { ResumeData } from '../../types/resume';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink } from 'lucide-react';

interface ResumeRendererProps {
  data: ResumeData;
  template?: string;
  zoom?: number;
  isPrint?: boolean;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({
  data,
  template = 'professional-classic',
  zoom = 1,
  isPrint = false,
}) => {
  const { basics, work, education, skills, projects, certifications, customSections, design } = data;
  const accentColor = design?.accentColor || '#4f46e5';

  const fontClass =
    design?.fontFamily === 'serif'
      ? 'font-serif'
      : design?.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const sizeClass =
    design?.fontSize === 'compact'
      ? 'text-[11px] leading-[1.35]'
      : design?.fontSize === 'relaxed'
      ? 'text-[13px] leading-[1.55]'
      : 'text-[12px] leading-[1.45]';

  const spacingClass =
    design?.spacing === 'compact'
      ? 'space-y-3'
      : design?.spacing === 'spacious'
      ? 'space-y-6'
      : 'space-y-4';

  // 1. Template: Professional Classic
  if (template === 'professional-classic') {
    return (
      <div
        className={`resume-paper bg-white text-neutral-900 w-[210mm] min-h-[297mm] p-[16mm] shadow-2xl rounded-sm ${fontClass} ${sizeClass} mx-auto transition-transform origin-top`}
        style={{
          transform: isPrint ? 'none' : `scale(${zoom})`,
          transformOrigin: 'top center',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <header className="border-b-2 pb-4 mb-5" style={{ borderColor: accentColor }}>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 uppercase">
            {basics.name || 'Candidate Name'}
          </h1>
          {basics.label && (
            <p className="text-sm font-semibold mt-1 tracking-wide" style={{ color: accentColor }}>
              {basics.label}
            </p>
          )}

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-neutral-600">
            {basics.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-neutral-400" />
                {basics.email}
              </span>
            )}
            {basics.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-neutral-400" />
                {basics.phone}
              </span>
            )}
            {basics.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-neutral-400" />
                {basics.location}
              </span>
            )}
            {basics.website && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-neutral-400" />
                {basics.website.replace(/^https?:\/\//, '')}
              </span>
            )}
            {basics.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-neutral-400" />
                {basics.linkedin.replace(/^https?:\/\//, '')}
              </span>
            )}
            {basics.github && (
              <span className="flex items-center gap-1">
                <Github className="w-3 h-3 text-neutral-400" />
                {basics.github.replace(/^https?:\/\//, '')}
              </span>
            )}
          </div>
        </header>

        <div className={spacingClass}>
          {/* Summary */}
          {basics.summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-neutral-700 leading-relaxed text-justify">{basics.summary}</p>
            </section>
          )}

          {/* Work Experience */}
          {work && work.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b pb-1 mb-2.5">
                Work Experience
              </h2>
              <div className="space-y-3.5">
                {work.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="flex justify-between items-baseline font-semibold text-neutral-900">
                      <span className="text-sm font-bold">{item.position}</span>
                      <span className="text-xs text-neutral-500 font-normal">
                        {item.startDate} — {item.current ? 'Present' : item.endDate || 'Present'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-600 mb-1.5 italic">
                      <span>{item.company}</span>
                      {item.location && <span>{item.location}</span>}
                    </div>
                    {item.summary && <p className="text-neutral-600 mb-1.5">{item.summary}</p>}
                    {item.highlights && item.highlights.length > 0 && (
                      <ul className="list-disc list-outside pl-4 space-y-1 text-neutral-700">
                        {item.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b pb-1 mb-2">
                Technical & Core Skills
              </h2>
              <div className="grid grid-cols-1 gap-1.5">
                {skills.map((grp) => (
                  <div key={grp.id} className="flex text-xs">
                    <span className="font-bold text-neutral-800 w-36 shrink-0">{grp.category}:</span>
                    <span className="text-neutral-700">{grp.items.join(', ')}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b pb-1 mb-2">
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-neutral-900 text-xs">
                        {edu.studyType} in {edu.area}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {edu.startDate} — {edu.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-600">
                      <span>{edu.institution}</span>
                      {edu.score && <span className="font-medium">{edu.score}</span>}
                    </div>
                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul className="list-disc list-outside pl-4 mt-1 space-y-0.5 text-xs text-neutral-600">
                        {edu.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b pb-1 mb-2">
                Key Projects
              </h2>
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-neutral-900 text-xs">{proj.name}</span>
                      {proj.url && (
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          {proj.url.replace(/^https?:\/\//, '')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        <span className="font-semibold">Tech:</span> {proj.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b pb-1 mb-1.5">
                Certifications
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {certifications.map((c) => (
                  <div key={c.id}>
                    <div className="font-semibold text-neutral-900">{c.name}</div>
                    <div className="text-neutral-500 text-[11px]">
                      {c.issuer} {c.date && `• ${c.date}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // 2. Template: Modern Minimalist (2-Column)
  if (template === 'modern-minimalist') {
    return (
      <div
        className={`resume-paper bg-white text-neutral-900 w-[210mm] min-h-[297mm] p-[14mm] shadow-2xl rounded-sm ${fontClass} ${sizeClass} mx-auto transition-transform origin-top`}
        style={{
          transform: isPrint ? 'none' : `scale(${zoom})`,
          transformOrigin: 'top center',
          boxSizing: 'border-box',
        }}
      >
        <div className="grid grid-cols-12 gap-6 min-h-full">
          {/* Left Column (4 cols) */}
          <div className="col-span-4 border-r border-neutral-200 pr-4 space-y-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-950">
                {basics.name || 'Candidate Name'}
              </h1>
              {basics.label && (
                <p className="text-xs font-semibold mt-1" style={{ color: accentColor }}>
                  {basics.label}
                </p>
              )}
            </div>

            {/* Contact details */}
            <div className="space-y-1.5 text-xs text-neutral-600 border-t pt-3">
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Contact</h3>
              {basics.email && <div className="break-all">{basics.email}</div>}
              {basics.phone && <div>{basics.phone}</div>}
              {basics.location && <div>{basics.location}</div>}
              {basics.website && <div className="break-all text-neutral-700 font-mono text-[10px]">{basics.website.replace(/^https?:\/\//, '')}</div>}
              {basics.linkedin && <div className="break-all text-neutral-700 font-mono text-[10px]">{basics.linkedin.replace(/^https?:\/\//, '')}</div>}
              {basics.github && <div className="break-all text-neutral-700 font-mono text-[10px]">{basics.github.replace(/^https?:\/\//, '')}</div>}
            </div>

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="space-y-2.5 border-t pt-3">
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Skills</h3>
                {skills.map((grp) => (
                  <div key={grp.id} className="space-y-1">
                    <p className="text-[11px] font-bold text-neutral-800">{grp.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {grp.items.map((it, idx) => (
                        <span key={idx} className="bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded text-[10px]">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Education</h3>
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="font-bold text-neutral-900">{edu.studyType}</div>
                    <div className="text-neutral-600">{edu.area}</div>
                    <div className="text-neutral-500 text-[11px]">{edu.institution}</div>
                    <div className="text-[10px] text-neutral-400">{edu.startDate} - {edu.endDate}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (8 cols) */}
          <div className="col-span-8 pl-1 space-y-4">
            {basics.summary && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                  About Me
                </h2>
                <p className="text-neutral-700 leading-relaxed text-xs">{basics.summary}</p>
              </div>
            )}

            {work && work.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                  Experience
                </h2>
                <div className="space-y-3.5">
                  {work.map((w) => (
                    <div key={w.id}>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-sm text-neutral-900">{w.position}</span>
                        <span className="text-[11px] text-neutral-500">{w.startDate} — {w.current ? 'Present' : w.endDate}</span>
                      </div>
                      <div className="text-xs font-semibold text-neutral-600 mb-1">{w.company} • {w.location}</div>
                      {w.highlights && (
                        <ul className="list-disc list-outside pl-3.5 space-y-1 text-neutral-700 text-xs">
                          {w.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projects && projects.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                  Featured Projects
                </h2>
                <div className="space-y-2">
                  {projects.map((p) => (
                    <div key={p.id}>
                      <div className="flex justify-between text-xs font-bold text-neutral-900">
                        <span>{p.name}</span>
                        {p.url && <span className="text-[10px] text-neutral-500 font-normal">{p.url.replace(/^https?:\/\//, '')}</span>}
                      </div>
                      <p className="text-xs text-neutral-600">{p.description}</p>
                      {p.technologies && (
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          Tech: {p.technologies.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Template: Executive Slate
  if (template === 'executive-slate') {
    return (
      <div
        className={`resume-paper bg-white text-neutral-900 w-[210mm] min-h-[297mm] p-0 shadow-2xl rounded-sm ${fontClass} ${sizeClass} mx-auto transition-transform origin-top`}
        style={{
          transform: isPrint ? 'none' : `scale(${zoom})`,
          transformOrigin: 'top center',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Slate Banner */}
        <div className="bg-[#1e293b] text-white px-[16mm] py-[10mm]">
          <h1 className="text-3xl font-extrabold tracking-tight">{basics.name || 'Candidate Name'}</h1>
          <p className="text-sm font-medium text-slate-300 mt-1 tracking-wider uppercase">{basics.label}</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-700">
            {basics.email && <span>{basics.email}</span>}
            {basics.phone && <span>{basics.phone}</span>}
            {basics.location && <span>{basics.location}</span>}
            {basics.linkedin && <span>{basics.linkedin.replace(/^https?:\/\//, '')}</span>}
          </div>
        </div>

        <div className={`p-[16mm] ${spacingClass}`}>
          {basics.summary && (
            <div className="border-l-4 pl-3" style={{ borderColor: accentColor }}>
              <p className="text-neutral-700 text-xs italic leading-relaxed">{basics.summary}</p>
            </div>
          )}

          {work && work.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 pb-1 border-b border-slate-300 mb-3">
                Executive Leadership & Experience
              </h2>
              <div className="space-y-4">
                {work.map((w) => (
                  <div key={w.id}>
                    <div className="flex justify-between items-baseline font-bold text-neutral-900">
                      <span className="text-sm">{w.position}</span>
                      <span className="text-xs text-slate-500 font-normal">{w.startDate} — {w.current ? 'Present' : w.endDate}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 mb-1.5">{w.company} | {w.location}</div>
                    {w.highlights && (
                      <ul className="list-disc list-outside pl-4 space-y-1 text-neutral-700 text-xs">
                        {w.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 pb-1 border-b border-slate-300 mb-2">
                Core Competencies & Technical Skills
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {skills.map((s) => (
                  <div key={s.id} className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="font-bold text-slate-900 text-[11px] mb-1">{s.category}</div>
                    <div className="text-slate-600 text-[11px] leading-snug">{s.items.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 pb-1 border-b border-slate-300 mb-2">
                Education & Credentials
              </h2>
              <div className="space-y-2">
                {education.map((e) => (
                  <div key={e.id} className="flex justify-between text-xs">
                    <div>
                      <span className="font-bold text-neutral-900">{e.studyType} in {e.area}</span>
                      <span className="text-neutral-600"> — {e.institution}</span>
                    </div>
                    <span className="text-neutral-500">{e.startDate} — {e.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Template: Tech Monochrome (Clean Developer Style)
  if (template === 'tech-monochrome') {
    return (
      <div
        className={`resume-paper bg-white text-neutral-900 w-[210mm] min-h-[297mm] p-[16mm] shadow-2xl rounded-sm font-sans ${sizeClass} mx-auto transition-transform origin-top`}
        style={{
          transform: isPrint ? 'none' : `scale(${zoom})`,
          transformOrigin: 'top center',
          boxSizing: 'border-box',
        }}
      >
        <header className="border-b border-neutral-300 pb-3 mb-4 font-mono">
          <div className="flex justify-between items-baseline">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950">{basics.name}</h1>
            <span className="text-xs font-medium text-neutral-500">{basics.label}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-neutral-600 mt-2">
            {basics.email && <span>{basics.email}</span>}
            {basics.location && <span>{basics.location}</span>}
            {basics.github && <span className="font-semibold text-neutral-900">{basics.github.replace(/^https?:\/\//, '')}</span>}
            {basics.website && <span>{basics.website.replace(/^https?:\/\//, '')}</span>}
          </div>
        </header>

        <div className={spacingClass}>
          {basics.summary && (
            <div>
              <p className="text-xs text-neutral-700 leading-relaxed">{basics.summary}</p>
            </div>
          )}

          {work && work.length > 0 && (
            <div>
              <h2 className="text-xs font-mono font-bold uppercase text-neutral-900 tracking-wider mb-2 border-b border-neutral-200 pb-1">
                // 01. Work Experience
              </h2>
              <div className="space-y-3">
                {work.map((w) => (
                  <div key={w.id}>
                    <div className="flex justify-between text-xs font-semibold text-neutral-900">
                      <span>{w.position} @ <span className="font-mono">{w.company}</span></span>
                      <span className="text-[11px] text-neutral-500 font-mono">{w.startDate} - {w.current ? 'Present' : w.endDate}</span>
                    </div>
                    {w.highlights && (
                      <ul className="list-disc list-outside pl-4 space-y-1 text-neutral-700 text-xs mt-1">
                        {w.highlights.map((h, idx) => (
                          <li key={idx}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-xs font-mono font-bold uppercase text-neutral-900 tracking-wider mb-2 border-b border-neutral-200 pb-1">
                // 02. Open-Source & Projects
              </h2>
              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.id}>
                    <div className="flex justify-between text-xs font-bold text-neutral-900">
                      <span>{p.name}</span>
                      {p.url && <span className="text-[10px] text-neutral-500 font-mono">{p.url.replace(/^https?:\/\//, '')}</span>}
                    </div>
                    <p className="text-xs text-neutral-600">{p.description}</p>
                    {p.technologies && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.technologies.map((t, i) => (
                          <span key={i} className="text-[9px] font-mono bg-neutral-100 text-neutral-800 px-1 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-mono font-bold uppercase text-neutral-900 tracking-wider mb-2 border-b border-neutral-200 pb-1">
                // 03. Skills & Tooling
              </h2>
              <div className="space-y-1 text-xs">
                {skills.map((s) => (
                  <div key={s.id} className="flex">
                    <span className="font-mono font-semibold text-neutral-800 w-36 shrink-0 text-[11px]">{s.category}:</span>
                    <span className="text-neutral-700 text-[11px]">{s.items.join(' • ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-mono font-bold uppercase text-neutral-900 tracking-wider mb-2 border-b border-neutral-200 pb-1">
                // 04. Education
              </h2>
              <div className="space-y-1 text-xs">
                {education.map((e) => (
                  <div key={e.id} className="flex justify-between">
                    <div>
                      <span className="font-bold text-neutral-900">{e.studyType} in {e.area}</span>
                      <span className="text-neutral-600">, {e.institution}</span>
                    </div>
                    <span className="text-neutral-500 font-mono text-[11px]">{e.startDate} - {e.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. Template: Creative Accent
  return (
    <div
      className={`resume-paper bg-white text-neutral-900 w-[210mm] min-h-[297mm] p-[16mm] shadow-2xl rounded-sm ${fontClass} ${sizeClass} mx-auto transition-transform origin-top relative overflow-hidden`}
      style={{
        transform: isPrint ? 'none' : `scale(${zoom})`,
        transformOrigin: 'top center',
        boxSizing: 'border-box',
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-2.5" style={{ backgroundColor: accentColor }}></div>
      <header className="pl-2 mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950">{basics.name}</h1>
        <p className="text-sm font-semibold tracking-wide uppercase mt-0.5" style={{ color: accentColor }}>
          {basics.label}
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-neutral-500 mt-2">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
          {basics.website && <span>{basics.website.replace(/^https?:\/\//, '')}</span>}
        </div>
      </header>

      <div className={`pl-2 ${spacingClass}`}>
        {basics.summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">Overview</h2>
            <p className="text-neutral-700 text-xs leading-relaxed">{basics.summary}</p>
          </div>
        )}

        {work && work.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">Experience</h2>
            <div className="space-y-3">
              {work.map((w) => (
                <div key={w.id} className="border-l-2 pl-3" style={{ borderColor: `${accentColor}33` }}>
                  <div className="flex justify-between text-xs font-bold text-neutral-900">
                    <span>{w.position}</span>
                    <span className="text-[11px] text-neutral-500 font-normal">{w.startDate} - {w.current ? 'Present' : w.endDate}</span>
                  </div>
                  <div className="text-xs text-neutral-600 font-medium mb-1">{w.company}</div>
                  {w.highlights && (
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-neutral-700">
                      {w.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">Expertise</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.flatMap((s) => s.items).map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">Education</h2>
            <div className="space-y-1">
              {education.map((e) => (
                <div key={e.id} className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-900">{e.studyType} in {e.area} — {e.institution}</span>
                  <span className="text-neutral-500">{e.startDate} - {e.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
