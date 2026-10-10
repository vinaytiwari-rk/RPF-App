const fs = require('fs');
const path = require('path');

const RAW_SUBJECTS = [
  {
    id: "ancient_history",
    titleEn: "Ancient Indian History",
    titleHi: "प्राचीन भारतीय इतिहास",
    icon: "Landmark",
    color: "from-amber-600 to-yellow-600",
    topics: [
      "1. Prehistoric India",
      "2. Indus Valley Civilization",
      "3. Rig Vedic Society, Economy, Polity & Religion",
      "4. Rig-Vedic Literature",
      "5. Later Vedic Society, Economy, Polity & Religion",
      "6. Later Vedic Literature",
      "7. Rise of Jainism",
      "8. Rise of Buddhism",
      "9. Ajivikas and Other Ascetics",
      "10. Ancient Republics of India",
      "11. Sixteen Mahajanapadas",
      "12. Magadha Empire",
      "13. Invasion of Alexander on India",
      "14. Maurya Empire- Chandragupta and Bindusara",
      "15. Maurya Empire- Ashoka",
      "16. Administration of Mauryas",
      "17. Mauryan Culture, Society and Economy",
      "18. Shungas, Kanvas and Mahameghavanas",
      "19. Changes in Post-Mauryan times",
      "20. The Indo-Greek rulers",
      "21. The Shakas Rulers & Satrap System",
      "22. The Satavahanas",
      "23. Kushana Empire",
      "24. Gupta Empire- Political History",
      "25. Gupta Empire- Society, Religion, Literature",
      "26. Gupta Polity, Economy, Numismatics",
      "27. Gupta Art, Architecture",
      "28. Vakatakas, Maitrakas and Mukharis",
      "29. Era of Harsha",
      "30. Early Medieval North India",
      "31. Early Medieval South India",
      "32. Early Medieval Society & Religion",
      "33. Changes in Indian Economy (600-1000 AD)",
      "34. Art and Architecture of India (600-1000 AD)",
      "35. The Rashtrakutas",
      "36. The Chalukyas",
      "37. The Pallavas",
      "38. The Cholas",
      "39. Pandya Kingdom",
      "40. Sangam Age"
    ]
  },
  {
    id: "medieval_history",
    titleEn: "Medieval Indian History",
    titleHi: "मध्यकालीन भारतीय इतिहास",
    icon: "Shield",
    color: "from-orange-600 to-red-600",
    topics: [
      "1. Sources of Medieval Indian History",
      "2. Medieval Indian Coins and Coinage",
      "3. Indian Society & Economy in Early Medieval Period",
      "4. Initial Invasions of Arabs and Turks",
      "5. Mahmud of Ghazni",
      "6. Muhammad Ghori & Foundation of Delhi Sultanate",
      "7. Mamluk dynasty (1206–90)",
      "8. Khilji Dynasty (1290-1320)",
      "9. Tughlaq dynasty (1320–1413)",
      "10. Sayyid and Lodi Dynasties",
      "11. Lodi Dynasty (1451–1526)",
      "12. Decline of Delhi Sultanate and Rise of Provincial Kingdoms",
      "13. Delhi Sultanate: Polity, Administration & Economy",
      "14. Delhi Sultanate: Architecture, Arts and Culture",
      "15. Vijayanagara Empire",
      "16. Deccan Sultanates: Bahmani, Ahmadnagar, Berar, Bijapur, Golconda, Bidar",
      "17. Bhakti & Sufi Movements",
      "18. Mughal Empire: Political History",
      "19. Mughal Empire: Polity, Administration & Economy",
      "20. Mughal Empire: Society, Culture, Arts, Architecture & Literature",
      "21. Maratha Empire"
    ]
  },
  {
    id: "modern_history",
    titleEn: "Modern Indian History & Freedom Struggle",
    titleHi: "आधुनिक भारत एवं स्वतंत्रता संग्राम",
    icon: "Flag",
    color: "from-blue-600 to-indigo-600",
    topics: [
      "1. Various States in India in 18th century",
      "2. Socio-economic Condition in 18th century India",
      "3. Beginning of European Trade",
      "4. Dutch and Danes Companies",
      "5. British East India Company – Initial Days",
      "6. French East India Company",
      "7. British Conquest & Annexation of Territories Till 1857",
      "8. East India Company Rule – Revenue, Reforms Etc.",
      "9. EIC – Internal Administration & Regulation",
      "10. Resistance Before 1857",
      "11. The Revolt of 1857",
      "12. British Raj – Viceroys of India [1858-1947]",
      "13. British Raj – Provincial Administration",
      "14. Relations with Princely States",
      "15. Judicial Developments during British Era",
      "16. Constitutional and Legislature Developments",
      "17. Development of Civil Services",
      "18. Development of Police and Military",
      "19. British Frontier Policy",
      "20. Economic Policies and Impacts",
      "21. Development of Education",
      "22. Development of Infrastructure",
      "23. Famines and other Natural Disasters",
      "24. Indian Press & Literature in British Era",
      "25. Socio-Religious Reform Movements",
      "26. Freedom Struggle – Important Organizations",
      "27. Freedom Struggle – Important Events [1905-1947]",
      "28. Freedom Struggle – Freedom Fighters & Leaders",
      "29. Mahatma Gandhi – Life, Role and Philosophy",
      "30. Subhash Chandra Bose and Azad Hind",
      "31. Communalism & Pakistan Movement",
      "32. Peasant & Tribal Movements 1857-1947",
      "33. Working Class & Left Movements"
    ]
  },
  {
    id: "polity_constitution",
    titleEn: "Indian Polity & Constitution",
    titleHi: "भारतीय संविधान एवं राजव्यवस्था",
    icon: "Scale",
    color: "from-emerald-600 to-teal-600",
    topics: [
      "1. Historical Background",
      "2. Constituent Assembly & Making of the Constitution",
      "3. Salient Features of the Constitution",
      "4. Preamble of the Constitution",
      "5. Union and its Territory",
      "6. Citizenship & Citizenship Laws",
      "7. Fundamental Rights",
      "8. Directive Principles and Fundamental Duties",
      "9. Amendment of Constitution and Basic Structure Doctrine",
      "10. Important Amendment of Constitution",
      "11. System of Government in India",
      "12. President",
      "13. Vice-President",
      "14. Prime Minister & Union Council of Ministers",
      "15. Parliament",
      "16. Parliamentary Committees, Forums and Parliamentary Group",
      "17. Supreme Court, Review, Activism, PIL",
      "18. State Government – Governor",
      "19. Chief Minister & State Council of Ministers",
      "20. State Legislature: Assemblies & Legislative Councils",
      "21. High Courts & Subordinate Courts",
      "22. Special Provisions for Various States",
      "23. Centre-State Relations & Inter-state Relations",
      "24. Emergency Provisions",
      "25. Evolution of Panchayati Raj",
      "26. Rural Local Government",
      "27. Urban Local Government",
      "28. Union Territories",
      "29. Scheduled and Tribal Areas",
      "30. Overview of Various Bodies in India",
      "31. Finance Commissions [Central & States]",
      "32. Election Commission [Central & States]",
      "33. Elections & Election Laws in India",
      "34. Public Service Commissions [Central & States]",
      "35. Public Services in India",
      "36. Various National Commissions",
      "37. RTI and Information Commissions",
      "38. Comptroller and Auditor General of India (CAG)",
      "39. Attorney General, Advocate General and other Law Officers",
      "40. Planning Commission & NITI Aayog",
      "41. Central Vigilance Commission & CBI",
      "42. Lokpal & Lokayuktas",
      "43. GST and GST Council",
      "44. 97th Amendment and Co-operative Societies",
      "45. Provisions Related to Languages",
      "46. Tribunals",
      "47. Rights and Liabilities of the Government",
      "48. Special Provisions Relating to Certain Classes",
      "49. Important Laws on Consumer Protection",
      "50. Important Laws on Corruption",
      "51. Important Laws on Crime and Terror",
      "52. Important Laws on Education",
      "53. Important Laws on Environment & Forests",
      "54. Important Laws on Finance & Financial Crimes",
      "55. Important Laws on Healthcare",
      "56. Important Labour and Personnel Laws",
      "57. Important Laws on Social Protection"
    ]
  },
  {
    id: "world_geography",
    titleEn: "World & Physical Geography",
    titleHi: "विश्व एवं भौतिक भूगोल",
    icon: "Globe",
    color: "from-cyan-600 to-blue-600",
    topics: [
      "1. Introduction to Geography and Geographers",
      "2. Astronomy – Universe, Constellations & Galaxies, Stars",
      "3. Geology – Earth Movements, Latitude, Longitude and Time",
      "4. Geology Geological Time Earths Internal Structure",
      "5. Geology – Rocks, Plate Tectonics, Earthquakes, Volcanoes",
      "6. Physical Geography – Weathering, Mass wasting and Erosion",
      "7. Physical Geography – Various Landforms",
      "8. Physical Geography – Important Seas, Archipelagos, Coral Reefs, Atolls",
      "9. Physical Geography – Important Islands, Gulfs, Bays, Isthmuses, Glaciers, Canyons",
      "10. Physical Geography – Important Rivers, River Islands, Deltas and Lakes",
      "11. Physical Geography – Important Coasts and Beaches",
      "12. Physical Geography – Important Mountain Ranges, Mountains, Hills, Plateaus, Mountain Passes, Volcanoes",
      "13. Physical Geography – Important Plains and Deserts",
      "14. Physical Geography – World Soils, Major Biomes",
      "15. Climatology – Climatic Classification",
      "16. Climatology – Atmosphere, Winds, Humidity, Clouds, Rainfall",
      "17. Climatology – Air Masses, Fronts, Cyclones and Related Phenomena",
      "18. Oceanography – Major Oceans, Ocean Bottom Relief, Ocean Deposits",
      "19. Oceanography – Ocean Temperature, Density, Salinity",
      "20. Oceanography – Coral Reefs, Tides and Waves",
      "21. Oceanography – Ocean Currents, Coastal Climate",
      "22. Human Geography – Human Evolution, Races, Tribes of World",
      "23. Human Geography: Population, Demography, Migration, Settlements, Urbanization",
      "24. Economic Geography – Hunting, Pastoral Herding, Fishing, Aquaculture, Forestry",
      "25. Economic Geography – Agriculture, Livestock Ranching, Animal Husbandry, Dairy Farming, Plantation Crops",
      "26. Economic Geography – Minerals and Mining Activities",
      "27. Economic Geography – Manufacturing Industries",
      "28. Economic Geography – Service Industries, Quaternary Activities",
      "29. World Geography – Continents and Country Trivia"
    ]
  },
  {
    id: "indian_geography",
    titleEn: "Indian Geography",
    titleHi: "भारत का भूगोल",
    icon: "Compass",
    color: "from-green-600 to-emerald-600",
    topics: [
      "1. Location, Extent, Administrative, Physiographic Divisions of India",
      "2. Geology, Tectonics, Earthquakes, Volcanoes in India",
      "3. Plains, Deserts of India",
      "4. Mountains, Glaciers, Mountain Passes, Hill Stations, Plateaus of India",
      "5. Islands, Coral Reefs, Mangroves, Coasts, Beaches",
      "6. Drainage System, Rivers, Lakes, Waterfalls, Other Water Bodies",
      "7. Climate, Climatic Regions, Rains, Monsoon, Winds in India",
      "8. Soils, Natural Vegetation, Forests",
      "9. Mines, Minerals, Coal, Coal Fields, Oil & Natural Gas",
      "10. Thermal Energy, Hydroelectricity, Nuclear and Non-conventional Power Resources",
      "11. Agriculture, Irrigation, Water Resources",
      "12. Industries, Industrial Cities",
      "13. Transport – Roads, Railways, Ports, Shipping, Air & Inland Water Transport",
      "14. Demography, Population, Census, Races, Tribes, Languages, Settlements"
    ]
  },
  {
    id: "gk_international",
    titleEn: "International Affairs, Defence & World GK",
    titleHi: "अंतर्राष्ट्रीय संगठन, रक्षा व सामान्य ज्ञान",
    icon: "Award",
    color: "from-purple-600 to-indigo-600",
    topics: [
      "1. Important Days and Years",
      "2. International Organizations",
      "3. Defence & Security of India",
      "4. Books and Authors General Knowledge Questions",
      "5. Ancient World History",
      "6. Medieval World History",
      "7. Modern World History",
      "8. Discoveries & Inventions"
    ]
  },
  {
    id: "indian_economy",
    titleEn: "Indian Economy",
    titleHi: "भारतीय अर्थव्यवस्था",
    icon: "TrendingUp",
    color: "from-amber-700 to-orange-700",
    topics: [
      "1. Important Concepts in Micro & Macroeconomics",
      "2. Notable Economists – India and World",
      "3. Economies: Types, Sectors, Branches",
      "4. Indian Economy: History & Salient Features",
      "5. Economic Planning, Planning Commission, NITI Aayog",
      "6. Agriculture, Irrigation, Seeds, Fertilizers and other Inputs",
      "7. Crops & Cropping Patterns, Food grains production and Management",
      "8. Oil Seeds, Horticulture and Plantation Crops",
      "9. Dairy, Poultry, Fisheries, Forestry and other allied sectors",
      "10. Agro-based Industries, Agro-marketing, Food Processing Industries",
      "11. Agriculture Policy, Green Revolution and Rainbow Revolution",
      "12. Industries: Types, Policies and Industrial Production Data",
      "13. Automobiles Industry",
      "14. Cement Industry",
      "15. Chemical & Petrochemical Sector",
      "16. FMCG and Consumer Durables Sectors",
      "17. Engineering and Capital Goods Sector",
      "18. Gems and Jewellery Industry",
      "19. Metals and Mining Sector",
      "20. Oil and Gas Sector",
      "21. Pharmaceuticals Industry",
      "22. Real Estate & Construction Sector",
      "23. Steel Industry",
      "24. Textiles Industry",
      "25. Sugar Industry",
      "26. Pulp and Paper Industry",
      "27. Education and Training Industry",
      "28. Healthcare Services Industry",
      "29. IT & ITeS Sector",
      "30. Media and Entertainment Sector",
      "31. Retail & Wholesale Trade",
      "32. Telecommunications Sector",
      "33. Tourism and Hospitality",
      "34. Research & Development Sector",
      "35. Money Markets & Monetary Policy",
      "36. Capital Markets & Debt Markets",
      "37. Banking, Finance and Insurance Sectors",
      "38. Infrastructure Sector and Policy",
      "39. Transport Sector",
      "40. Energy Sector and Policy",
      "41. Fiscal Policy, Budget, India's debt",
      "42. India's Tax Regime",
      "43. Foreign Trade – Policy, Balance of Trade, Balance of Payment, WTO",
      "44. Forex Reserves of India and Forex Management",
      "45. India and World Bank & IMF",
      "46. Foreign Investments in India",
      "47. Economic Growth, Development, Inclusive Growth",
      "48. Socio-economic Issues",
      "49. Labour Related Issues and Reforms",
      "50. Inflation and Price Rise"
    ]
  },
  {
    id: "indian_culture",
    titleEn: "Indian Culture & Heritage",
    titleHi: "भारतीय संस्कृति एवं विरासत",
    icon: "Palette",
    color: "from-pink-600 to-rose-600",
    topics: [
      "1. Religion and Philosophy",
      "2. Indian Paintings",
      "3. Indian Folk Paintings",
      "4. Sculpture",
      "5. Ancient Architecture",
      "6. Medieval Architecture",
      "7. Modern Architecture",
      "8. Indian Classical Dance",
      "9. Indian Folk Dances",
      "10. Indian Classical Music",
      "11. Indian Folk Music",
      "12. Fairs and Festivals",
      "13. Sports and martial arts",
      "14. Theatre and Cinema",
      "15. Folk Theatre",
      "16. Puppetry Art",
      "17. Television and Media",
      "18. Family and Marriage",
      "19. Indian Cuisine",
      "20. Handlooms and Handicrafts",
      "21. Indian Clothing and Textiles",
      "22. Languages",
      "23. Literature – Ancient & Medieval",
      "24. Modern Indian Literature",
      "25. Literature – Regional Languages",
      "26. Indian Cultural Heritage Sites and Landmarks",
      "27. National Insignia"
    ]
  },
  {
    id: "computer_it",
    titleEn: "Computers and Information Technology",
    titleHi: "कंप्यूटर एवं सूचना प्रौद्योगिकी",
    icon: "Monitor",
    color: "from-slate-700 to-gray-800",
    topics: [
      "1. Computers – Introduction, History, Types",
      "2. Computer Components: Hardware",
      "3. Computer Components: Software, OS and Programming Languages",
      "4. Database Management",
      "5. Computer Networks, Networking Technologies & Devices",
      "6. Wired, Wireless Technologies, Internet, Browsers, Apps, Cloud Computing",
      "7. Websites, Blogs, Search Engines & Social Media",
      "8. Microsoft Windows & Office",
      "9. Computer Security – Various Attacks and Malware",
      "10. Application of Computers and IT in Various Fields"
    ]
  },
  {
    id: "environment_ecology",
    titleEn: "Environment & Biodiversity",
    titleHi: "पर्यावरण एवं जैव विविधता",
    icon: "Trees",
    color: "from-emerald-700 to-green-700",
    topics: [
      "1. Introduction to Environment & Ecology",
      "2. Biomes and Biogeographic regions of World",
      "3. India's Biogeographic Regions",
      "4. India's Forest, Wetlands, Mangroves and Coral Reefs",
      "5. Fauna and Flora of the World",
      "6. Flora and Fauna of India",
      "7. Environment Conservation Treaties and Organizations",
      "8. National Parks, Wildlife Sanctuaries of World",
      "9. National Parks, Wildlife Areas of India",
      "10. Environment Related Laws in India",
      "11. Pollution and Pollution Control",
      "12. Various Topics on Climate Change",
      "13. Sustainability",
      "14. Disaster Management",
      "15. Environment Impact Assessment"
    ]
  },
  {
    id: "biology",
    titleEn: "General Science: Biology",
    titleHi: "सामान्य विज्ञान: जीव विज्ञान",
    icon: "Dna",
    color: "from-teal-600 to-cyan-600",
    topics: [
      "1. Introduction & Branches of Biology",
      "2. Important Biologists",
      "3. Classification of Organisms",
      "4. Cell Biology & Organelles",
      "5. Biomolecules & Bio-chemistry",
      "6. Viruses",
      "7. Overview of Plant Kingdom",
      "8. Bacteria",
      "9. Algae & Fungi",
      "10. Mosses and Bryophytes",
      "11. Pteridophytes and Gymnosperms",
      "12. Morphology and Adaptations in Higher Plants",
      "13. Plant Tissues",
      "14. Photosynthesis, Respiration and Nutrition in Plants",
      "15. Growth in Plants",
      "16. Reproduction in Plants",
      "17. Plant Products and Parts",
      "18. Plant Diseases",
      "19. Overview Animal Kingdom",
      "20. Lower animals & Invertebrates",
      "21. Fishes & Mollusks",
      "22. Amphibians",
      "23. Reptiles",
      "24. Birds",
      "25. Mammals",
      "26. Useful Animal Products",
      "27. Human Body – Important Tissues and Skin",
      "28. Human Body – Brain & Nervous System",
      "29. Human Body – Senses – Eyes, Ears and Nose",
      "30. Human Body – Muscles and Bones",
      "31. Human Body – Blood, Circulation and Immune System",
      "32. Human Body – Urinary System",
      "33. Human Body – Respiratory System",
      "34. Human Body – Digestive System",
      "35. Human Body – Endocrine System",
      "36. Human Body – Reproductive System",
      "37. Animal Diseases",
      "38. Human Diseases",
      "39. Genetics, Inheritance and Evolution",
      "40. Biofertilizers and Biofuels",
      "41. Biotechnology, GMOs and Recent Developments in Biology"
    ]
  },
  {
    id: "chemistry",
    titleEn: "General Science: Chemistry",
    titleHi: "सामान्य विज्ञान: रसायन विज्ञान",
    icon: "Atom",
    color: "from-violet-600 to-purple-600",
    topics: [
      "1. Important Chemical Scientists",
      "2. Matter and Its States",
      "3. Elements",
      "4. Compounds",
      "5. Mixtures",
      "6. Minerals and Ores",
      "7. Atomic Structure",
      "8. Radioactivity",
      "9. Periodic Table",
      "10. Chemical Bonds",
      "11. Chemical Reactions",
      "12. Acids, Bases and Salts",
      "13. Electrochemistry",
      "14. Organic Chemistry Basics",
      "15. Hydrocarbons & Fuels",
      "16. Plastics & Polymers",
      "17. Important Metals",
      "18. Important Non-Metals",
      "19. Soaps & Detergents"
    ]
  },
  {
    id: "physics",
    titleEn: "General Science: Physics",
    titleHi: "सामान्य विज्ञान: भौतिक विज्ञान",
    icon: "Zap",
    color: "from-amber-600 to-red-600",
    topics: [
      "1. Introduction to Physics",
      "2. Units & Measurements",
      "3. Kinematics",
      "4. Motion & Friction",
      "5. Work, Energy and Power",
      "6. Gravitation",
      "7. Satellites",
      "8. General Properties of Matter",
      "9. Pressure",
      "10. Floatation",
      "11. Surface Tension & Capillarity",
      "12. Density",
      "13. Viscosity",
      "14. Simple Harmonic Motion (SHM)",
      "15. Mechanical & Electromagnetic Waves",
      "16. Sound Waves",
      "17. Heat & Heat Transmission",
      "18. Thermodynamics",
      "19. Light and Human Eye",
      "20. Electricity",
      "21. Electrochemical Cell",
      "22. Magnetism",
      "23. Atomic and Nuclear Physics Basics",
      "24. Electronics Basics"
    ]
  }
];

function slugify(text) {
  return text.toLowerCase()
    .replace(/^\d+[\.\-\s]*/, '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const subjectsOut = RAW_SUBJECTS.map(subj => {
  const topicsOut = subj.topics.map((t, idx) => {
    const slug = `${subj.id}_${idx + 1}_${slugify(t)}`;
    return {
      id: slug,
      subjectId: subj.id,
      topicNumber: idx + 1,
      titleEn: t,
      titleHi: t, // Can be formatted or translated
      questionsCount: 10,
      durationMinutes: 10,
      badge: "UPSC / SSC / PSC"
    };
  });

  return {
    id: subj.id,
    titleEn: subj.titleEn,
    titleHi: subj.titleHi,
    icon: subj.icon,
    color: subj.color,
    totalTopics: topicsOut.length,
    topics: topicsOut
  };
});

const tsCode = `// Autogenerated GK & Exam Syllabus Catalog
export interface CatalogTopic {
  id: string;
  subjectId: string;
  topicNumber: number;
  titleEn: string;
  titleHi: string;
  questionsCount: number;
  durationMinutes: number;
  badge: string;
}

export interface CatalogSubject {
  id: string;
  titleEn: string;
  titleHi: string;
  icon: string;
  color: string;
  totalTopics: number;
  topics: CatalogTopic[];
}

export const GK_EXAM_SUBJECTS: CatalogSubject[] = ${JSON.stringify(subjectsOut, null, 2)};

export const ALL_TOPICS_MAP: Record<string, CatalogTopic> = {};
GK_EXAM_SUBJECTS.forEach(s => {
  s.topics.forEach(t => {
    ALL_TOPICS_MAP[t.id] = t;
  });
});

export const TOTAL_GK_TOPICS = GK_EXAM_SUBJECTS.reduce((acc, s) => acc + s.totalTopics, 0);
`;

const targetFile = path.join(__dirname, '..', 'src', 'data', 'quiz', 'quizCatalog.ts');
fs.writeFileSync(targetFile, tsCode, 'utf8');
console.log(`Generated ${targetFile} with ${subjectsOut.length} subjects and ${subjectsOut.reduce((a, s) => a + s.totalTopics, 0)} topics!`);
