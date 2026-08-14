export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  income: string;
  occupation: string;
  category: string;
  division: string; // ward/assembly/district
  janSevaId: string;
  role: "Citizen" | "Active Volunteer" | "Donor";
  points?: number;
  badge?: string;
  profileImage?: string;
  bloodGroup?: string;
  memberSince?: string;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  location: string;
  reportedBy: string;
  date: string;
  status: "Open" | "Assigned" | "Resolved" | "Closed";
  aiSummary?: string;
}

export interface HelpPost {
  id: string;
  type: "need" | "offer";
  category: "Food" | "Books & Study" | "Blood Required" | "Medical Consultation" | "Career Guidance" | "Financial Help" | "Others";
  title: string;
  description: string;
  postedBy: string;
  contact: string;
  location: string;
  date: string;
  status: "Active" | "Fulfilled";
}

export interface BloodDonor {
  name: string;
  bloodGroup: string;
  phone: string;
  location: string;
  verified: boolean;
  distance: string;
}

export interface Camp {
  id: string;
  title: string;
  date: string;
  type: "Health" | "Blood Donation" | "Food Dist" | "Education" | "Afforestation";
  location: string;
  registeredCount: number;
  pointsReward?: number;
}

export interface SocialPost {
  id: string;
  platform: "instagram" | "facebook" | "x" | "website";
  image: string;
  title: string;
  caption: string;
  date: string;
  link: string;
}

export interface AppSettings {
  splash_animation?: string;
  splash_duration?: number;
  splash_logo?: string;
  login_bg_image?: string;
  marquee_text_en?: string;
  marquee_text_hi?: string;
  marquee_enabled?: boolean;
  [key: string]: any;
}

export type DbRecord = Record<string, any>;
