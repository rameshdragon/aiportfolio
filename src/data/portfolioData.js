export const PORTFOLIO = {
  intro: {
    name: 'RAMESH REDDY CHANGAL',
    tagline: 'MS Computer Science | Full-Stack | AI/ML | Distributed Systems',
    status: 'OPEN TO WORK',
    brief: 'Software engineer with expertise in building scalable distributed systems, AI/ML applications, and full-stack web platforms. Currently seeking opportunities to create impactful technology.',
  },
  experience: [
    {
      role: 'Graduate Teaching Assistant',
      org: 'University of Maryland, Baltimore County',
      date: 'AUG 2024 – MAY 2025',
      bullets: [
        'Cut assignment error rate 30%, improved scores 20% across 150+ students',
        'Mentored in distributed systems, NLP & algorithm design',
        'Redesigned 3 problem sets/semester to industry standards',
      ],
    },
    {
      role: 'Software Engineering Intern',
      org: 'Path Creators',
      date: 'JUN 2021 – JUL 2021',
      bullets: [
        'Reduced API latency 40% (320ms → 190ms) via O(1) hash map',
        'Built NLP chatbot — 500+ users in first month',
        'Fixed race condition killing 15% of CI runs',
      ],
    },
    {
      role: 'Research Intern',
      org: 'ICRISAT',
      date: 'SEP 2022 – OCT 2022',
      bullets: [
        'O(n²) → O(n log n) pipeline — 40% reliability gain on 50K+ records',
        'Deployed ML model at 87% accuracy via Flask REST API',
        'Eliminated 25% session data loss for 200+ field researchers',
      ],
    },
  ],
  projects: [
    {
      name: 'Distributed File System',
      desc: 'GFS-inspired, 3x chunk replication, Raft leader election, 99.9% uptime under sustained node kills.',
      tech: ['Python', 'gRPC', 'Docker', 'AWS'],
      link: 'https://github.com/rameshdragon/distributed-fs',
    },
    {
      name: 'Realtime Messaging',
      desc: '10K+ concurrent users, Kafka partitioning, Redis O(1) presence, <50ms p99 on GCP Cloud Run.',
      tech: ['Node.js', 'Kafka', 'Redis', 'GCP'],
      link: 'https://github.com/rameshdragon/realtime-chat',
    },
    {
      name: 'AI Icon Generation SaaS',
      desc: 'Full-stack solo — DALL-E 3, Stripe payments, AWS serverless, 5 gen modes, real users & revenue.',
      tech: ['React', 'DALL-E 3', 'Stripe', 'AWS'],
      link: 'https://github.com/rameshdragon/ai-icon-generator',
    },
    {
      name: 'ML Crop Yield Prediction',
      desc: '23% accuracy gain, 80% preprocessing speedup via vectorized NumPy. GCP + React dashboard.',
      tech: ['Python', 'TensorFlow', 'Flask', 'GCP'],
      link: 'https://github.com/rameshdragon/crop-yield',
    },
  ],
  skills: {
    Languages: ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Go', 'SQL'],
    Frameworks: ['React', 'Next.js', 'Node.js', 'Spring Boot', 'FastAPI', 'TensorFlow', 'PyTorch', 'LangChain'],
    'Cloud & Infra': ['GCP', 'AWS', 'Docker', 'Kubernetes', 'Kafka', 'Redis', 'PostgreSQL', 'MongoDB'],
  },
  contact: {
    email: 'rameshreddychangal@gmail.com',
    phone: '(667) 260-3005',
    github: 'https://github.com/rameshdragon',
    linkedin: 'https://linkedin.com/in/ramesh-reddy-changal',
    location: 'Chicago, IL',
  },
}
