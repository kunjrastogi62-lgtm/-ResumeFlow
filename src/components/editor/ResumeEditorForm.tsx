import React, { useState } from 'react';
import {
  ResumeData,
  WorkExperience,
  Education,
  SkillGroup,
  Project,
  Certification,
} from '../../types/resume';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Palette,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { suggestSkillsForRole } from '../../lib/ai-service';
import { useAuth } from '../../context/AuthContext';

interface ResumeEditorFormProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
  onOpenBulletEnhancer: (bullet: string, roleContext: string, onApply: (newBullet: string) => void) => void;
  onOpenSummaryGenerator: () => void;
}

export const ResumeEditorForm: React.FC<ResumeEditorFormProps> = ({
  data,
  onChange,
  onOpenBulletEnhancer,
  onOpenSummaryGenerator,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'basics' | 'experience' | 'skills' | 'education' | 'projects' | 'certifications' | 'design'
  >('basics');
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [skillError, setSkillError] = useState<string | null>(null);

  // Helper updates
  const updateBasics = (field: keyof typeof data.basics, value: string) => {
    onChange({
      ...data,
      basics: { ...data.basics, [field]: value },
    });
  };

  const updateDesign = (field: keyof typeof data.design, value: any) => {
    onChange({
      ...data,
      design: { ...data.design, [field]: value },
    });
  };

  // Work experience helpers
  const addWorkExperience = () => {
    const newWork: WorkExperience = {
      id: `w-${Date.now()}`,
      company: 'Company Name',
      position: 'Role Title',
      location: 'City, State',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      summary: '',
      highlights: ['Accomplished [X] as measured by [Y], by doing [Z].'],
    };
    onChange({ ...data, work: [newWork, ...data.work] });
  };

  const updateWork = (id: string, updates: Partial<WorkExperience>) => {
    onChange({
      ...data,
      work: data.work.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    });
  };

  const removeWork = (id: string) => {
    onChange({ ...data, work: data.work.filter((w) => w.id !== id) });
  };

  const addHighlight = (workId: string) => {
    onChange({
      ...data,
      work: data.work.map((w) =>
        w.id === workId
          ? { ...w, highlights: [...w.highlights, 'Accelerated key performance indicators by 25% through innovative execution.'] }
          : w
      ),
    });
  };

  const updateHighlight = (workId: string, index: number, value: string) => {
    onChange({
      ...data,
      work: data.work.map((w) =>
        w.id === workId
          ? {
              ...w,
              highlights: w.highlights.map((h, i) => (i === index ? value : h)),
            }
          : w
      ),
    });
  };

  const removeHighlight = (workId: string, index: number) => {
    onChange({
      ...data,
      work: data.work.map((w) =>
        w.id === workId
          ? { ...w, highlights: w.highlights.filter((_, i) => i !== index) }
          : w
      ),
    });
  };

  // Skills helpers
  const addSkillGroup = () => {
    const newGrp: SkillGroup = {
      id: `s-${Date.now()}`,
      category: 'New Skill Group',
      items: ['Skill 1', 'Skill 2'],
    };
    onChange({ ...data, skills: [...data.skills, newGrp] });
  };

  const updateSkillCategory = (id: string, category: string) => {
    onChange({
      ...data,
      skills: data.skills.map((s) => (s.id === id ? { ...s, category } : s)),
    });
  };

  const updateSkillItems = (id: string, itemsStr: string) => {
    const items = itemsStr
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);
    onChange({
      ...data,
      skills: data.skills.map((s) => (s.id === id ? { ...s, items } : s)),
    });
  };

  const removeSkillGroup = (id: string) => {
    onChange({ ...data, skills: data.skills.filter((s) => s.id !== id) });
  };

  const handleSuggestSkills = async () => {
    setSuggestingSkills(true);
    setSkillError(null);
    try {
      const currentFlat = data.skills.flatMap((s) => s.items);
      const suggestions = await suggestSkillsForRole({
        jobTitle: data.basics.label || 'Software Engineer',
        currentSkills: currentFlat,
        userId: user?.id,
      });

      const newGroups: SkillGroup[] = [
        ...data.skills,
        {
          id: `s-ai-tech-${Date.now()}`,
          category: 'Recommended Technical Skills',
          items: suggestions.technical.slice(0, 6),
        },
        {
          id: `s-ai-soft-${Date.now() + 1}`,
          category: 'Leadership & Practices',
          items: suggestions.soft.slice(0, 5),
        },
      ];
      onChange({ ...data, skills: newGroups });
    } catch (e: any) {
      setSkillError(e?.message || 'Could not auto-suggest skills. Please try again.');
    } finally {
      setSuggestingSkills(false);
    }
  };

  // Education helpers
  const addEducation = () => {
    const newEdu: Education = {
      id: `e-${Date.now()}`,
      institution: 'University or College',
      area: 'Major / Field of Study',
      studyType: 'Bachelor of Science',
      startDate: '2016-09',
      endDate: '2020-05',
      score: '3.8 GPA',
      highlights: [],
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    onChange({
      ...data,
      education: data.education.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) });
  };

  // Projects helpers
  const addProject = () => {
    const newProj: Project = {
      id: `p-${Date.now()}`,
      name: 'Project Name',
      description: 'Brief description of architecture and user value.',
      url: 'https://github.com/username/project',
      technologies: ['TypeScript', 'React', 'Node.js'],
      highlights: ['Engineered scalable application handling 10k requests daily.'],
    };
    onChange({ ...data, projects: [...data.projects, newProj] });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    onChange({
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const removeProject = (id: string) => {
    onChange({ ...data, projects: data.projects.filter((p) => p.id !== id) });
  };

  // Certifications helpers
  const addCertification = () => {
    const newCert: Certification = {
      id: `c-${Date.now()}`,
      name: 'Certification Title',
      issuer: 'Issuing Organization',
      date: '2024-01',
      url: '',
    };
    onChange({ ...data, certifications: [...data.certifications, newCert] });
  };

  const updateCertification = (id: string, updates: Partial<Certification>) => {
    onChange({
      ...data,
      certifications: data.certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const removeCertification = (id: string) => {
    onChange({ ...data, certifications: data.certifications.filter((c) => c.id !== id) });
  };

  const colors = [
    { label: 'Indigo', value: '#4f46e5' },
    { label: 'Emerald', value: '#059669' },
    { label: 'Sky', value: '#0284c7' },
    { label: 'Violet', value: '#7c3aed' },
    { label: 'Rose', value: '#e11d48' },
    { label: 'Slate', value: '#334155' },
    { label: 'Amber', value: '#d97706' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#11131a] border-r border-[#232736]">
      {/* Sub tabs navigation */}
      <div className="flex items-center gap-1 overflow-x-auto p-2 bg-[#0d0f17] border-b border-[#232736] text-xs scrollbar-none">
        <button
          onClick={() => setActiveTab('basics')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium shrink-0 transition ${
            activeTab === 'basics'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium shrink-0 transition ${
            activeTab === 'experience'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Experience ({data.work.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium shrink-0 transition ${
            activeTab === 'skills'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Skills</span>
        </button>

        <button
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium shrink-0 transition ${
            activeTab === 'education'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium shrink-0 transition ${
            activeTab === 'projects'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium shrink-0 transition ${
            activeTab === 'certifications'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Certs</span>
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium shrink-0 transition ${
            activeTab === 'design'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Theme</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* 1. BASICS & CONTACT */}
        {activeTab === 'basics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Personal & Contact Info</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={data.basics.name}
                  onChange={(e) => updateBasics('name', e.target.value)}
                  placeholder="Alexander Hayes"
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={data.basics.label}
                  onChange={(e) => updateBasics('label', e.target.value)}
                  placeholder="Senior Full-Stack Engineer"
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Email</label>
                <input
                  type="email"
                  value={data.basics.email}
                  onChange={(e) => updateBasics('email', e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={data.basics.phone}
                  onChange={(e) => updateBasics('phone', e.target.value)}
                  placeholder="+1 (415) 892-0144"
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Location</label>
                <input
                  type="text"
                  value={data.basics.location}
                  onChange={(e) => updateBasics('location', e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Portfolio / Website</label>
                <input
                  type="text"
                  value={data.basics.website}
                  onChange={(e) => updateBasics('website', e.target.value)}
                  placeholder="https://alexhayes.dev"
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={data.basics.linkedin}
                  onChange={(e) => updateBasics('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/alex-hayes"
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">GitHub / Code Link</label>
                <input
                  type="text"
                  value={data.basics.github}
                  onChange={(e) => updateBasics('github', e.target.value)}
                  placeholder="github.com/alexhayes"
                  className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Professional Summary */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">Executive Summary</label>
                <button
                  type="button"
                  onClick={onOpenSummaryGenerator}
                  className="px-2.5 py-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-md flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>AI Generate Summary</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={data.basics.summary}
                onChange={(e) => updateBasics('summary', e.target.value)}
                placeholder="High-impact overview highlighting career trajectory, core technical domain, and measurable outcomes..."
                className="w-full px-3 py-2.5 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white leading-relaxed focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />
            </div>
          </div>
        )}

        {/* 2. EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Work Experience</h3>
              <button
                type="button"
                onClick={addWorkExperience}
                className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg border border-indigo-500/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.work.map((w, idx) => (
                <div key={w.id} className="p-4 bg-[#0a0c12] border border-[#232736] rounded-xl space-y-3 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-indigo-400">Position #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeWork(w.id)}
                      className="p-1 text-neutral-500 hover:text-rose-400 transition"
                      title="Delete Position"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={w.company}
                        onChange={(e) => updateWork(w.id, { company: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={w.position}
                        onChange={(e) => updateWork(w.id, { position: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={w.startDate}
                        onChange={(e) => updateWork(w.id, { startDate: e.target.value })}
                        placeholder="2021-03"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] text-neutral-400">End Date</label>
                        <label className="flex items-center gap-1 text-[10px] text-neutral-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={w.current}
                            onChange={(e) => updateWork(w.id, { current: e.target.checked })}
                            className="rounded border-neutral-700 bg-neutral-900 text-indigo-600 focus:ring-0"
                          />
                          <span>Current</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        disabled={w.current}
                        value={w.current ? 'Present' : w.endDate}
                        onChange={(e) => updateWork(w.id, { endDate: e.target.value })}
                        placeholder="2023-11"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Highlights with AI */}
                  <div className="space-y-2 pt-2 border-t border-[#1b1f2d]">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-neutral-300">
                        Bullet Accomplishments (XYZ Formula)
                      </label>
                      <button
                        type="button"
                        onClick={() => addHighlight(w.id)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {w.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-1.5">
                          <textarea
                            rows={2}
                            value={h}
                            onChange={(e) => updateHighlight(w.id, hIdx, e.target.value)}
                            className="flex-1 p-2 text-xs bg-[#11131a] border border-[#232736] rounded text-neutral-200 focus:outline-none focus:border-indigo-500 resize-none font-sans leading-relaxed"
                          />
                          <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenBulletEnhancer(h, `${w.position} at ${w.company}`, (newBullet) =>
                                  updateHighlight(w.id, hIdx, newBullet)
                                )
                              }
                              title="Enhance with Gemini AI"
                              className="p-1.5 text-indigo-400 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded transition"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeHighlight(w.id, hIdx)}
                              title="Delete Bullet"
                              className="p-1.5 text-neutral-500 hover:text-rose-400 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Skills & Competencies</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSuggestSkills}
                  disabled={suggestingSkills}
                  className="px-2.5 py-1.5 text-xs font-medium text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg border border-indigo-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{suggestingSkills ? 'Recommending...' : 'AI Suggest Skills'}</span>
                </button>
                <button
                  type="button"
                  onClick={addSkillGroup}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 rounded-lg flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {skillError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {skillError}
              </div>
            )}

            <div className="space-y-3">
              {data.skills.map((grp) => (
                <div key={grp.id} className="p-3.5 bg-[#0a0c12] border border-[#232736] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={grp.category}
                      onChange={(e) => updateSkillCategory(grp.id, e.target.value)}
                      placeholder="Category (e.g. Languages, Cloud)"
                      className="px-2 py-1 text-xs font-semibold bg-transparent border-b border-transparent focus:border-indigo-500 text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkillGroup(grp.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={grp.items.join(', ')}
                    onChange={(e) => updateSkillItems(grp.id, e.target.value)}
                    placeholder="Comma-separated items: React, TypeScript, Node.js"
                    className="w-full px-3 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {grp.items.map((it, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px]">
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Education</h3>
              <button
                type="button"
                onClick={addEducation}
                className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg border border-indigo-500/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="p-3.5 bg-[#0a0c12] border border-[#232736] rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-neutral-300">Degree & Institution</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400">Degree / Study Type</label>
                      <input
                        type="text"
                        value={edu.studyType}
                        onChange={(e) => updateEducation(edu.id, { studyType: e.target.value })}
                        placeholder="Bachelor of Science"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">Major / Field</label>
                      <input
                        type="text"
                        value={edu.area}
                        onChange={(e) => updateEducation(edu.id, { area: e.target.value })}
                        placeholder="Computer Science"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                        placeholder="UC Berkeley"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">GPA / Honors (Optional)</label>
                      <input
                        type="text"
                        value={edu.score || ''}
                        onChange={(e) => updateEducation(edu.id, { score: e.target.value })}
                        placeholder="3.85 GPA — Magna Cum Laude"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">Start Date</label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                        placeholder="2016-09"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">End / Graduation Date</label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                        placeholder="2020-05"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Featured Projects</h3>
              <button
                type="button"
                onClick={addProject}
                className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg border border-indigo-500/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-3">
              {data.projects.map((proj) => (
                <div key={proj.id} className="p-3.5 bg-[#0a0c12] border border-[#232736] rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                      placeholder="Project Name"
                      className="px-2 py-1 text-xs font-semibold bg-transparent border-b border-transparent focus:border-indigo-500 text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                    placeholder="Short summary of architecture and impact"
                    className="w-full px-3 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={proj.url || ''}
                      onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                      placeholder="Project URL (e.g. github.com/user/repo)"
                      className="w-full px-3 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-neutral-200 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={proj.technologies.join(', ')}
                      onChange={(e) =>
                        updateProject(proj.id, {
                          technologies: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Tech: React, Go, Docker"
                      className="w-full px-3 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Certifications & Licenses</h3>
              <button
                type="button"
                onClick={addCertification}
                className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg border border-indigo-500/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </button>
            </div>

            <div className="space-y-3">
              {data.certifications.map((c) => (
                <div key={c.id} className="p-3.5 bg-[#0a0c12] border border-[#232736] rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-indigo-400">Credential</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(c.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                      title="Delete Certification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-neutral-400 mb-1">Certification Name</label>
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => updateCertification(c.id, { name: e.target.value })}
                        placeholder="AWS Certified Solutions Architect"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Issuing Organization</label>
                      <input
                        type="text"
                        value={c.issuer}
                        onChange={(e) => updateCertification(c.id, { issuer: e.target.value })}
                        placeholder="Amazon Web Services"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Date Issued</label>
                      <input
                        type="text"
                        value={c.date}
                        onChange={(e) => updateCertification(c.id, { date: e.target.value })}
                        placeholder="2024-03"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#11131a] border border-[#232736] rounded text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. DESIGN & STYLING */}
        {activeTab === 'design' && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Styling & Layout Customization</h3>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-300">Accent Color</label>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => updateDesign('accentColor', c.value)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                      data.design.accentColor === c.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#11131a] scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-300">Font Family</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['sans', 'serif', 'mono'] as const).map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => updateDesign('fontFamily', font)}
                    className={`p-2.5 rounded-lg border text-center capitalize transition ${
                      data.design.fontFamily === font
                        ? 'border-indigo-500 bg-indigo-500/10 text-white font-semibold'
                        : 'border-[#232736] bg-[#0a0c12] text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    {font === 'sans' ? 'Modern Sans' : font === 'serif' ? 'Classic Serif' : 'Tech Mono'}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-300">Content Density / Font Size</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['compact', 'normal', 'relaxed'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateDesign('fontSize', sz)}
                    className={`p-2 rounded-lg border text-center capitalize transition ${
                      data.design.fontSize === sz
                        ? 'border-indigo-500 bg-indigo-500/10 text-white font-semibold'
                        : 'border-[#232736] bg-[#0a0c12] text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-300">Section Spacing</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['compact', 'normal', 'spacious'] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => updateDesign('spacing', sp)}
                    className={`p-2 rounded-lg border text-center capitalize transition ${
                      data.design.spacing === sp
                        ? 'border-indigo-500 bg-indigo-500/10 text-white font-semibold'
                        : 'border-[#232736] bg-[#0a0c12] text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
