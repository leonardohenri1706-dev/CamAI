export interface PlaceCoordinates {
  lat: number;
  lng: number;
}

export interface IcpProfile {
  targetBusinessTypes: string[];
  targetNiches: string[];
  idealSize?: string;
  recommendedPitchStrategy?: string;
  idealLocationKeywords?: string[];
}

export interface RepoAnalysis {
  repoUrl: string;
  repoName: string;
  description: string;
  githubStars?: number;
  githubLanguage?: string;
  githubTopics?: string[];
  icp: IcpProfile;
  coreValueProp: string;
  searchKeywords: string[];
  solvedPainPoints: string[];
  suggestedCities?: string[];
  analyzedAt?: string;
}

export interface DigitalHealth {
  hasWebsite: boolean;
  websiteUrl?: string | null;
  hasWhatsApp: boolean;
  isVerified?: boolean;
  ddd?: string;
  formattedPhone?: string | null;
  rawPhone?: string | null;
  rating: number;
  reviewsCount: number;
  googleMapsUri: string;
  photoUrl?: string;
  hasInstagram?: boolean;
  instagramHandle?: string;
  instagramProfileUrl?: string;
  instagramFollowers?: number;
  instagramBio?: string;
}

export interface ScoreFactors {
  noWebsiteBonus: number;
  reviewVolumeBonus: number;
  phoneVerifiedBonus: number;
  categoryFitBonus: number;
}

export interface ScoreResult {
  leadScorePercentage: number;
  classification: 'Alta Prioridade' | 'Média Prioridade' | 'Baixa Prioridade';
  rationale: string;
  customPitch: string;
  factors: ScoreFactors;
}

export type CrmStage = 'Novo' | 'Contatado' | 'Demonstracao' | 'Fechado' | 'Perdido';

export interface TimelineLog {
  date: string;
  event: string;
  status: string;
}

export interface PlaceLead {
  id: string;
  displayName: string;
  contactName?: string;
  category: string;
  formattedAddress: string;
  neighborhood: string;
  city: string;
  coordinates: PlaceCoordinates;
  digitalHealth: DigitalHealth;
  scoreResult: ScoreResult;
  source?: 'google_maps' | 'instagram' | 'broad_verified_db';
  isSaved?: boolean;
  crmStatus?: CrmStage;
  monthlyFee?: number;
  setupFee?: number;
  notes?: string;
  timelineLogs?: TimelineLog[];
}

export interface FilterOptions {
  onlyNoWebsite: boolean;
  minReviews: number;
  minScore: number;
  categoryFilter: string;
  sourceFilter?: 'all' | 'google_maps' | 'instagram';
  searchMode?: 'fast' | 'deep';
  sortBy: 'score' | 'reviews' | 'noWebsiteFirst';
  searchQuery: string;
}

export interface SearchLocation {
  id?: number | string;
  name: string;
  city: string;
  state: string;
  center: PlaceCoordinates;
  zoom: number;
  isCustom?: boolean;
  source?: string;
}

export interface ApiSettings {
  openrouterApiKey?: string;
  openrouterModel?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
  googlePlacesApiKey?: string;
  devName?: string;
  demoUrl?: string;
  useMockEngine: boolean;
}

export interface CRMStats {
  totalLeads: number;
  closedCount: number;
  inNegotiationCount: number;
  newCount: number;
  lostCount: number;
  conversionRate: number;
  totalMrr: number;
  totalSetupRevenue: number;
  pipelineValue: number;
  stageCounts: Record<CrmStage, number>;
  nicheBreakdown: Array<{
    category: string;
    count: number;
    closed: number;
    mrr: number;
  }>;
}
