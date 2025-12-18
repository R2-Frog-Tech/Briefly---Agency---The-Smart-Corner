
export type Language = 'en' | 'es' | 'pl';

export type ServiceType = 
  | 'branding' 
  | 'web_design' 
  | 'ecommerce' 
  | 'landing_page' 
  | 'hosting_maintenance' 
  | 'graphic_design';

export interface BriefingData {
  services: ServiceType[];
  details: {
    projectName: string;
    description: string;
    targetAudience: string;
    specificGoals: string;
    hasCurrentSite?: string;
  };
  timeline: {
    deadline: string;
    budgetRange: string;
  };
  contact: {
    fullName: string;
    email: string;
    company: string;
    phone: string;
    gdprConsent: boolean;
  };
}

export interface ServiceOption {
  id: ServiceType;
  labelKey: string;
  descriptionKey: string;
  icon: string;
  basePrice: number;
}
