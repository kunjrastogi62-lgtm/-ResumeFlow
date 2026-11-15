export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  summary?: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
  score?: string;
  highlights: string[];
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  highlights: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeData {
  basics: ResumeBasics;
  work: WorkExperience[];
  education: Education[];
  skills: SkillGroup[];
  projects: Project[];
  certifications: Certification[];
  customSections: CustomSection[];
  design: {
    accentColor: string;
    fontFamily: 'sans' | 'serif' | 'mono';
    fontSize: 'compact' | 'normal' | 'relaxed';
    spacing: 'compact' | 'normal' | 'spacious';
  };
}

export interface ResumeRecord {
  id: string;
  user_id: string;
  title: string;
  template: string;
  resume_data: ResumeData;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  preview_url?: string;
  badge?: string;
  popular?: boolean;
}

export const INITIAL_RESUME: ResumeData = {
  basics: {
    name: 'Alexander Hayes',
    label: 'Senior Full-Stack Engineer & System Architect',
    email: 'alex.hayes@example.com',
    phone: '+1 (415) 892-0144',
    location: 'San Francisco, CA',
    website: 'https://alexhayes.dev',
    linkedin: 'linkedin.com/in/alex-hayes',
    github: 'github.com/alexhayes',
    summary: 'Results-driven Senior Software Engineer with 7+ years of experience building resilient distributed systems and intuitive consumer web applications. Proven track record of scaling platforms to 2M+ active users, optimizing database performance by 40%, and mentoring high-velocity engineering teams.',
  },
  work: [
    {
      id: 'w-1',
      company: 'Aether Cloud Systems',
      position: 'Staff Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: 'Present',
      current: true,
      summary: 'Led architecture and technical strategy for core infrastructure and real-time streaming pipeline.',
      highlights: [
        'Architected real-time event streaming pipeline processing 120M+ events daily with 99.99% availability using TypeScript, Kafka, and PostgreSQL.',
        'Spearheaded frontend migration to React 19 and Next.js, reducing initial page load times by 44% and boosting Core Web Vitals to 98/100.',
        'Mentored 8 mid-level engineers, instituted automated CI/CD security audits, and cut release cycle turnaround from 4 days to 35 minutes.',
      ],
    },
    {
      id: 'w-2',
      company: 'Vanguard Data Labs',
      position: 'Senior Full-Stack Engineer',
      location: 'New York, NY',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      summary: 'Built collaborative analytics dashboards and high-throughput REST & GraphQL APIs.',
      highlights: [
        'Designed and shipped customer-facing analytics dashboard used by 45,000+ enterprise accounts, generating $1.8M ARR in upsells.',
        'Optimized critical PostgreSQL database queries and connection pooling, slashing 95th-percentile response latency from 680ms to 95ms.',
        'Championed end-to-end testing coverage using Vitest and Playwright, lowering production regression incidents by 65%.',
      ],
    },
    {
      id: 'w-3',
      company: 'Helix Interactive',
      position: 'Software Engineer',
      location: 'Boston, MA',
      startDate: '2017-08',
      endDate: '2019-05',
      current: false,
      summary: 'Developed responsive client interfaces and microservices.',
      highlights: [
        'Engineered responsive single-page web applications with modern state management, serving 300K+ monthly active users.',
        'Integrated third-party payment gateways and OAuth flows, handling over $12M in gross transaction volume safely.',
      ],
    },
  ],
  education: [
    {
      id: 'e-1',
      institution: 'University of California, Berkeley',
      area: 'Computer Science & Data Systems',
      studyType: 'Bachelor of Science (B.S.)',
      startDate: '2013-09',
      endDate: '2017-05',
      score: '3.85 GPA — Magna Cum Laude',
      highlights: [
        'Dean\'s Honor List (6 consecutive semesters)',
        'Teaching Assistant for CS61B: Data Structures & Algorithms',
      ],
    },
  ],
  skills: [
    {
      id: 's-1',
      category: 'Languages & Core',
      items: ['TypeScript', 'JavaScript (ESNext)', 'Python', 'Go', 'SQL (PostgreSQL)', 'HTML5 / CSS3'],
    },
    {
      id: 's-2',
      category: 'Frameworks & Libraries',
      items: ['React 19', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'GraphQL', 'Prisma / Drizzle'],
    },
    {
      id: 's-3',
      category: 'Cloud & Infrastructure',
      items: ['Docker', 'Kubernetes', 'AWS (S3, ECS, RDS)', 'Supabase', 'Redis', 'CI/CD Pipelines', 'Git'],
    },
    {
      id: 's-4',
      category: 'Architecture & Practices',
      items: ['System Design', 'Microservices', 'RESTful API Design', 'Performance Optimization', 'Agile / Scrum'],
    },
  ],
  projects: [
    {
      id: 'p-1',
      name: 'PulseFlow Metrics Engine',
      description: 'Open-source distributed telemetry collector and visual dashboard for microservices.',
      url: 'https://github.com/alexhayes/pulseflow',
      technologies: ['TypeScript', 'React', 'Go', 'PostgreSQL', 'WebSockets'],
      highlights: [
        'Accumulated 1,400+ GitHub stars and adopted by 30+ startup production teams.',
        'Maintains sub-10ms query times across millions of time-series data points.',
      ],
    },
    {
      id: 'p-2',
      name: 'OmniDocs AI',
      description: 'Intelligent document indexing and retrieval system powered by vector embeddings.',
      url: 'https://omnidocs.dev',
      technologies: ['Python', 'FastAPI', 'Gemini API', 'pgvector', 'Tailwind CSS'],
      highlights: [
        'Delivered semantic search capabilities with 94% precision on technical manual corpora.',
      ],
    },
  ],
  certifications: [
    {
      id: 'c-1',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: '2023-04',
      url: 'https://aws.amazon.com/certification',
    },
    {
      id: 'c-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      date: '2022-11',
      url: 'https://cncf.io',
    },
  ],
  customSections: [],
  design: {
    accentColor: '#4f46e5', // indigo-600
    fontFamily: 'sans',
    fontSize: 'normal',
    spacing: 'normal',
  },
};
