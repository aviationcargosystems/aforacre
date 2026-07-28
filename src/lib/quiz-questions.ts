/**
 * The seven questions, in order.
 *
 * Plain data with no imports, so the same question set can drive the web flow
 * and a future WhatsApp or voice flow without either drifting.
 */

export type QuestionId = "goals" | "timeline" | "identity" | "involvement" | "excites" | "drive" | "budget";

export interface QuizOption {
  value: string;
  label: string;
  /** Lucide icon name. A string, not a component, so this module stays
   *  dependency free and a non-React flow can ignore it. */
  icon: string;
}

export interface QuizQuestion {
  id: QuestionId;
  prompt: string;
  helper?: string;
  multi: boolean;
  maxChoices?: number;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "goals",
    prompt: "What are you hoping to do with your land?",
    helper: "Pick as many as apply.",
    multi: true,
    options: [
      { value: "weekend-farm", label: "Weekend farm", icon: "TentTree" },
      { value: "farmhouse", label: "Build a farmhouse", icon: "Home" },
      { value: "investment", label: "Long-term investment", icon: "TrendingUp" },
      { value: "organic", label: "Organic farming", icon: "Leaf" },
      { value: "commercial", label: "Commercial farming", icon: "Tractor" },
      { value: "retirement", label: "Retirement home", icon: "Armchair" },
      { value: "legacy", label: "Family legacy", icon: "Users" },
      { value: "eco-tourism", label: "Eco tourism", icon: "Compass" },
      { value: "not-sure", label: "Not sure yet", icon: "HelpCircle" },
    ],
  },
  {
    id: "timeline",
    prompt: "When do you see yourself using this land?",
    multi: false,
    options: [
      { value: "immediately", label: "Immediately", icon: "Zap" },
      { value: "within-2-years", label: "Within 2 years", icon: "CalendarClock" },
      { value: "after-retirement", label: "After retirement", icon: "Hourglass" },
      { value: "pure-investment", label: "Pure investment, I may never use it", icon: "LineChart" },
    ],
  },
  {
    id: "identity",
    prompt: "Which best describes you?",
    multi: false,
    options: [
      { value: "founder", label: "Founder", icon: "Rocket" },
      { value: "cxo", label: "CXO", icon: "Briefcase" },
      { value: "tech", label: "Tech professional", icon: "Laptop" },
      { value: "doctor", label: "Doctor", icon: "Stethoscope" },
      { value: "nri", label: "NRI", icon: "Plane" },
      { value: "business-owner", label: "Business owner", icon: "Store" },
      { value: "investor", label: "Investor", icon: "PiggyBank" },
      { value: "farmer", label: "Farmer", icon: "Wheat" },
      { value: "family-office", label: "Family office", icon: "Landmark" },
    ],
  },
  {
    id: "involvement",
    prompt: "How involved do you want to be?",
    multi: false,
    options: [
      { value: "visit-occasionally", label: "Visit occasionally", icon: "CalendarDays" },
      { value: "spend-weekends", label: "Spend weekends there", icon: "Sun" },
      { value: "actively-farm", label: "Actively farm it myself", icon: "Shovel" },
      { value: "managed-farm", label: "Have it managed for me", icon: "ClipboardList" },
      { value: "hire-team", label: "Hire a team to run it", icon: "UsersRound" },
    ],
  },
  {
    id: "excites",
    prompt: "What excites you the most?",
    helper: "Choose up to three.",
    multi: true,
    maxChoices: 3,
    options: [
      { value: "mountain-views", label: "Mountain views", icon: "Mountain" },
      { value: "dense-forest", label: "Dense forest", icon: "Trees" },
      { value: "water-body", label: "Water body", icon: "Waves" },
      { value: "fruit-orchard", label: "Fruit orchard", icon: "Apple" },
      { value: "silence", label: "Silence", icon: "VolumeX" },
      { value: "wildlife", label: "Wildlife", icon: "Bird" },
      { value: "sunrise", label: "Sunrise", icon: "Sunrise" },
      { value: "investment-growth", label: "Investment growth", icon: "ChartLine" },
      { value: "privacy", label: "Privacy", icon: "Lock" },
    ],
  },
  {
    id: "drive",
    prompt: "How far are you willing to drive from Bengaluru?",
    multi: false,
    options: [
      { value: "45", label: "45 minutes", icon: "Timer" },
      { value: "60", label: "1 hour", icon: "Clock" },
      { value: "90", label: "90 minutes", icon: "Clock4" },
      { value: "120", label: "2 hours", icon: "Clock12" },
      { value: "any", label: "No preference", icon: "Infinity" },
    ],
  },
  {
    id: "budget",
    prompt: "What is your investment range?",
    multi: false,
    options: [
      { value: "75l-1cr", label: "75L to 1Cr", icon: "IndianRupee" },
      { value: "1-2cr", label: "1 to 2Cr", icon: "IndianRupee" },
      { value: "2-5cr", label: "2 to 5Cr", icon: "IndianRupee" },
      { value: "5cr-plus", label: "5Cr and above", icon: "Gem" },
    ],
  },
];

export type QuizAnswers = Partial<Record<QuestionId, string[]>>;

/** Lines shown while scoring runs. Not a spinner: it says what is happening. */
export const THINKING_LINES = [
  "Analysing your preferences",
  "Matching your lifestyle",
  "Checking available farms",
  "Evaluating future growth",
];

export const THINKING_FADE_MS = 700;
export const THINKING_MIN_MS = 2800;
