/**
 * The four questions, in order.
 *
 * These are the four the spec defines, and only those four. The flow used to
 * ask seven — timeline, identity and drive-time were added on top — which made
 * a "takes 2 minutes" promise into something people abandon halfway. Timeline
 * and identity fed nothing but persona flavour text, and drive-time duplicated
 * a filter that already exists on /explore.
 *
 * Plain data with no imports, so the same question set can drive the web flow
 * and a future WhatsApp or voice flow without either drifting.
 */

export type QuestionId = "goals" | "involvement" | "excites" | "budget";

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
      { value: "weekend-farm", label: "Weekend farmhouse", icon: "TentTree" },
      { value: "investment", label: "Long-term investment", icon: "TrendingUp" },
      { value: "organic", label: "Organic farming", icon: "Leaf" },
      { value: "commercial", label: "Commercial farming", icon: "Tractor" },
      { value: "retirement", label: "Retirement home", icon: "Armchair" },
      { value: "not-sure", label: "Not sure yet", icon: "HelpCircle" },
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
      { value: "plantations", label: "Plantations", icon: "Apple" },
      { value: "investment-growth", label: "Investment growth", icon: "ChartLine" },
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
