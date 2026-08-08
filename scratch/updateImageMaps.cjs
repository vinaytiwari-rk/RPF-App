const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/src/pages/Services.tsx', 'utf8');

const mapping = {
  card: '/assets/icons/icon_card_updated_1786163163115.jpg',
  blood: '/assets/icons/icon_blood_1786081356967.jpg',
  "health-care": '/assets/icons/icon_health_updated_1786163249856.jpg',
  donations: '/assets/icons/icon_donations.jpg',
  volunteers: '/assets/icons/icon_volunteers_updated_1786163233069.jpg',
  environment: '/assets/icons/icon_environment_1786081257147.jpg',
  culture: '/assets/icons/icon_culture_1786081280063.jpg',
  schemes: '/assets/icons/icon_schemes_updated_1786163186070.jpg',
  skills: '/assets/icons/icon_skills_1786081334087.jpg',
  farmer: '/assets/icons/icon_farmer_updated_1786163373604.jpg',
  disaster: '/assets/icons/icon_disaster_1786081291322.jpg',
  jobs: '/assets/icons/icon_jobs_updated_1786163264789.jpg',
  animals: '/assets/icons/icon_animal_1786081244906.jpg',
  food: '/assets/icons/icon_food_1786081367715.jpg',
  medicine: '/assets/icons/icon_medicine_updated_1786163301118.jpg',
  "women-safety": '/assets/icons/icon_women_updated_1786163329515.jpg',
  seniors: '/assets/icons/icon_senior_1786081168198.jpg',
  education: '/assets/icons/icon_education_updated_1786163314837.jpg',
  scholarships: '/assets/icons/icon_scholarships_updated_1786163279154.jpg',
  grievance: '/assets/icons/icon_grievance_updated_1786163210095.jpg',
  countries: '/assets/icons/icon_global_guide_updated_1786163358416.jpg',
  crowdfunding: '/assets/icons/icon_crowdfunding_updated_1786163344247.jpg'
};

const newImageMap = Object.entries(mapping).map(([k, v]) => \  "\": "\"\).join(",\\n");
const newDeclaration = \const serviceIdToImage: Record<string, string> = {\\n\\\n};\;

// Replace existing serviceIdToImage
content = content.replace(/const serviceIdToImage: Record<string, string> = \{[\s\S]*?\};/, newDeclaration);
fs.writeFileSync('D:/rp-foundation/src/pages/Services.tsx', content);

console.log('Updated Services.tsx');
