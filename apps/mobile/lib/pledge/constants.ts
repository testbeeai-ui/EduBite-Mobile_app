export type PledgeType = 'am' | 'pm';

export const REEL_DURATION_SEC = 60;
export const PLEDGE_CATALOG_DAYS = 180;

export const PLEDGE_AM = {
  time: '8:00 AM · MORNING PLEDGE',
  title: 'The learning pledge',
  quote:
    'I will only use AI to learn but will never use AI to solve a problem or a challenge or while taking a test.',
  modalTitle: "Sign today's morning pledge",
  buttonLabel: 'Sign the 8AM pledge →',
};

export const PLEDGE_PM = {
  time: '10:00 PM · NIGHT PLEDGE',
  title: 'The integrity pledge',
  quote:
    'I did not use AI for any of my assignments — whether given by my school/college or tutor/mentor or coaching institution, or even those I attempted on my own.',
  modalTitle: "Sign today's night pledge",
  buttonLabel: 'Sign the 10PM pledge →',
};

export const AI_RESOURCES = [
  {
    id: '1',
    type: 'article' as const,
    icon: '📄',
    title: 'Does AI Harm Critical Thinking?',
    src: 'DUKE UNIVERSITY · CENTER FOR TEACHING AND LEARNING',
    desc: 'Explains how relying on AI for writing and research tasks was linked to weaker reasoning and argumentation in university students.',
    url: 'https://ctl.duke.edu/ai-ethics-learning-toolkit/does-ai-harm-critical-thinking/',
  },
  {
    id: '2',
    type: 'article' as const,
    icon: '📄',
    title: 'Increased AI Use Linked to Eroding Critical Thinking Skills',
    src: 'PHYS.ORG',
    desc: 'Covers a 2025 study finding that heavier AI tool usage correlates with cognitive offloading and lower critical-thinking scores.',
    url: 'https://phys.org/news/2025-01-ai-linked-eroding-critical-skills.html',
  },
  {
    id: '3',
    type: 'video' as const,
    icon: '▶️',
    title: 'AI Might Be Reshaping How Students Learn — At a Cost',
    src: 'YOUTUBE',
    desc: 'A news segment on research showing STEM-leaning students are the most likely to over-rely on AI tools.',
    url: 'https://www.youtube.com/watch?v=SRbIS35RFh0',
  },
  {
    id: '4',
    type: 'video' as const,
    icon: '▶️',
    title: 'How to Use AI to Teach Critical Thinking (Not Replace It)',
    src: 'YOUTUBE',
    desc: 'A practical look at where the line sits between AI as a study aid and AI as a substitute for thinking.',
    url: 'https://www.youtube.com/watch?v=-0np--DAgmI',
  },
];
