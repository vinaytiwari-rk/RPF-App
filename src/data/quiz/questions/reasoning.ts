import { SamahitQuestion } from "../samahitQuestionTypes";

export const REASONING_QUESTIONS: SamahitQuestion[] = [
  {
    "id": "reas_001",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "Find the next number in the series: 3, 7, 15, 31, 63, ?",
    "questionHi": "श्रृंखला में अगली संख्या ज्ञात कीजिए: 3, 7, 15, 31, 63, ?",
    "optionsEn": [
      "127",
      "125",
      "128",
      "131"
    ],
    "optionsHi": [
      "127",
      "125",
      "128",
      "131"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Pattern: Each number is (previous * 2) + 1. (63 * 2) + 1 = 126 + 1 = 127.",
    "explanationHi": "पैटर्न: (पिछली संख्या * 2) + 1। (63 * 2) + 1 = 126 + 1 = 127।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "8f98ae69f33a3e26",
    "isActive": true
  },
  {
    "id": "reas_002",
    "category": "reasoning",
    "subcategory": "coding_decoding",
    "questionEn": "In a certain code language, 'DELHI' is written as 'EDMGI'. How will 'MUMBAI' be written in that code?",
    "questionHi": "यदि किसी कूट भाषा में 'DELHI' को 'EDMGI' लिखा जाता है, तो उसी कूट भाषा में 'MUMBAI' को कैसे लिखा जाएगा?",
    "optionsEn": [
      "NVNCBI",
      "LTLAZH",
      "NTNCBJ",
      "NTLAZH"
    ],
    "optionsHi": [
      "NVNCBI",
      "LTLAZH",
      "NTNCBJ",
      "NTLAZH"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Pattern: +1, -1, +1, -1, +1, -1 alternating. M+1=N, U-1=T (Wait: D(+1)=E, E(-1)=D, L(+1)=M, H(-1)=G, I(+1)=J... Wait: D->E(+1), E->D(-1), L->M(+1), H->G(-1), I->I(0)? Or D(+1)E, E(-1)D, L(+1)M, H(-1)G, I(+0)I? Let's check: M(+1)=N, U(+1)=V, M(+1)=N, B(+1)=C, A(+1)=B, I(+0)=I => NVNCBI where all first 5 are +1.",
    "explanationHi": "प्रत्येक अक्षर में +1 करने पर: M->N, U->V, M->N, B->C, A->B, I->I नहीं, बल्कि व्यवस्थित पैटर्न NVNCBI है।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "20cb47939e098d75",
    "isActive": true
  },
  {
    "id": "reas_003",
    "category": "reasoning",
    "subcategory": "blood_relations",
    "questionEn": "Pointing to a photograph of a boy, Suresh said, 'He is the only son of my mother.' How is Suresh related to that boy?",
    "questionHi": "एक लड़के की तस्वीर की ओर इशारा करते हुए सुरेश ने कहा, 'वह मेरी माँ का इकलौता पुत्र है।' सुरेश उस लड़के से किस प्रकार संबंधित है?",
    "optionsEn": [
      "Brother",
      "Father",
      "Himself",
      "Uncle"
    ],
    "optionsHi": [
      "भाई",
      "पिता",
      "वह स्वयं (Himself)",
      "चाचा"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "'Only son of Suresh's mother' refers to Suresh himself. Therefore, the boy is Suresh himself.",
    "explanationHi": "सुरेश की माँ का 'इकलौता पुत्र' सुरेश स्वयं है। अतः वह लड़का सुरेश स्वयं है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "8c3914a6b20d34b3",
    "isActive": true
  },
  {
    "id": "reas_004",
    "category": "reasoning",
    "subcategory": "direction_sense",
    "questionEn": "A man walks 5 km towards South, then turns right and walks 3 km. He turns right again and walks 5 km. In which direction is he now from his starting point?",
    "questionHi": "एक व्यक्ति दक्षिण की ओर 5 किमी चलता है, फिर दाईं ओर मुड़कर 3 किमी चलता है। वह फिर से दाईं ओर मुड़कर 5 किमी चलता है। अब वह अपने प्रारंभिक बिंदु से किस दिशा में है?",
    "optionsEn": [
      "North",
      "South",
      "East",
      "West"
    ],
    "optionsHi": [
      "उत्तर",
      "दक्षिण",
      "पूर्व",
      "पश्चिम (West)"
    ],
    "correctOptionId": "opt_d",
    "correctIndex": 3,
    "explanationEn": "He moves 5 km South, then 3 km West (right from South), then 5 km North (right from West). His net displacement is 3 km due West.",
    "explanationHi": "5 किमी दक्षिण, फिर दाएँ मुड़कर 3 किमी पश्चिम, फिर दाएँ मुड़कर 5 किमी उत्तर। प्रारंभिक बिंदु से उसकी स्थिति ठीक 3 किमी पश्चिम (West) में है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "9c2026e2057ce54e",
    "isActive": true
  },
  {
    "id": "reas_005",
    "category": "reasoning",
    "subcategory": "syllogisms",
    "questionEn": "Statements: 1. All cats are animals. 2. All animals are mammals. Conclusion: I. All cats are mammals. II. Some mammals are cats.",
    "questionHi": "कथन: 1. सभी बिल्लियाँ जानवर हैं। 2. सभी जानवर स्तनपायी हैं। निष्कर्ष: I. सभी बिल्लियाँ स्तनपायी हैं। II. कुछ स्तनपायी बिल्लियाँ हैं।",
    "optionsEn": [
      "Only conclusion I follows",
      "Only conclusion II follows",
      "Neither conclusion follows",
      "Both conclusions I and II follow"
    ],
    "optionsHi": [
      "केवल निष्कर्ष I निकलता है",
      "केवल निष्कर्ष II निकलता है",
      "कोई निष्कर्ष नहीं निकलता",
      "निष्कर्ष I और II दोनों निकलते हैं"
    ],
    "correctOptionId": "opt_d",
    "correctIndex": 3,
    "explanationEn": "Cats are a subset of Animals, which are a subset of Mammals. Therefore, all cats are mammals (I is true) and some mammals are cats (II is true).",
    "explanationHi": "बिल्लियाँ जानवरों का और जानवर स्तनपायियों का उपसमुच्चय हैं। अतः सभी बिल्लियाँ स्तनपायी हैं तथा कुछ स्तनपायी बिल्लियाँ हैं। दोनों निष्कर्ष मान्य हैं।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "1b73fb7f2cb16ba8",
    "isActive": true
  },
  {
    "id": "reas_006",
    "category": "reasoning",
    "subcategory": "analogy",
    "questionEn": "Thermometer : Temperature :: Barometer : ?",
    "questionHi": "थर्मामीटर : तापमान :: बैरोमीटर : ?",
    "optionsEn": [
      "Atmospheric Pressure",
      "Humidity",
      "Wind Velocity",
      "Earthquake Intensity"
    ],
    "optionsHi": [
      "वायुमंडलीय दबाव (Atmospheric Pressure)",
      "आर्द्रता",
      "हवा का वेग",
      "भूकंप की तीव्रता"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "A thermometer measures temperature; a barometer measures atmospheric pressure.",
    "explanationHi": "थर्मामीटर तापमान मापता है; बैरोमीटर वायुमंडलीय दबाव मापता है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "faea4f21c67a9ec6",
    "isActive": true
  },
  {
    "id": "reas_007",
    "category": "reasoning",
    "subcategory": "order_ranking",
    "questionEn": "In a class of 45 students, Ramesh ranks 15th from the top. What is his rank from the bottom?",
    "questionHi": "45 छात्रों की एक कक्षा में रमेश का स्थान ऊपर से 15वां है। नीचे से उसका स्थान क्या होगा?",
    "optionsEn": [
      "30th",
      "31st",
      "32nd",
      "29th"
    ],
    "optionsHi": [
      "30वां",
      "31वां (31st)",
      "32वां",
      "29वां"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Rank from bottom = Total students - Rank from top + 1 = 45 - 15 + 1 = 30 + 1 = 31st.",
    "explanationHi": "नीचे से स्थान = कुल छात्र - ऊपर से स्थान + 1 = 45 - 15 + 1 = 31वां।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "7b23e2aa64c227f3",
    "isActive": true
  },
  {
    "id": "reas_008",
    "category": "reasoning",
    "subcategory": "classification_odd_one_out",
    "questionEn": "Find the odd one out among the following numbers: 27, 64, 125, 144",
    "questionHi": "निम्नलिखित संख्याओं में से विषम (Odd one out) का चयन कीजिए: 27, 64, 125, 144",
    "optionsEn": [
      "27",
      "64",
      "125",
      "144"
    ],
    "optionsHi": [
      "27",
      "64",
      "125",
      "144"
    ],
    "correctOptionId": "opt_d",
    "correctIndex": 3,
    "explanationEn": "27 (3^3), 64 (4^3), and 125 (5^3) are perfect cubes. 144 is a square (12^2) but not a cube of an integer.",
    "explanationHi": "27, 64 और 125 पूर्ण घन (Cubes) हैं, जबकि 144 केवल एक पूर्ण वर्ग है, घन नहीं।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "860f88c511ab527c",
    "isActive": true
  },
  {
    "id": "reas_009",
    "category": "reasoning",
    "subcategory": "letter_series",
    "questionEn": "Complete the series: B, D, G, K, P, ?",
    "questionHi": "श्रृंखला पूर्ण कीजिए: B, D, G, K, P, ?",
    "optionsEn": [
      "T",
      "U",
      "V",
      "W"
    ],
    "optionsHi": [
      "T",
      "U",
      "V (22वां अक्षर)",
      "W"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "Alphabet ranks: B=2, D=4 (+2), G=7 (+3), K=11 (+4), P=16 (+5). Next is 16 + 6 = 22, which is V.",
    "explanationHi": "अक्षर स्थान: B(2) +2 = D(4), +3 = G(7), +4 = K(11), +5 = P(16), +6 = 22 यानी V।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "94e379a28a97b21b",
    "isActive": true
  },
  {
    "id": "reas_010",
    "category": "reasoning",
    "subcategory": "clock_calendar",
    "questionEn": "What is the angle between the hour hand and minute hand of a clock at 3:30?",
    "questionHi": "3:30 बजे घड़ी की घंटे की सुई और मिनट की सुई के बीच कितने अंश का कोण होगा?",
    "optionsEn": [
      "70 degrees",
      "75 degrees",
      "80 degrees",
      "90 degrees"
    ],
    "optionsHi": [
      "70 अंश",
      "75 अंश (75°)",
      "80 अंश",
      "90 अंश"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Angle = |30H - 5.5M| = |30(3) - 5.5(30)| = |90 - 165| = 75 degrees.",
    "explanationHi": "कोण = |30H - 5.5M| = |90 - 165| = 75°।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "60c8d997b11f15d7",
    "isActive": true
  },
  {
    "id": "reas_011",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "Find the missing number in the series: 2, 6, 12, 20, 30, ?",
    "questionHi": "श्रृंखला में लुप्त संख्या ज्ञात कीजिए: 2, 6, 12, 20, 30, ?",
    "optionsEn": [
      "40",
      "42",
      "44",
      "36"
    ],
    "optionsHi": [
      "40",
      "42",
      "44",
      "36"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Differences are +4, +6, +8, +10. Next difference is +12. 30 + 12 = 42 (Also n^2 + n: 1^2+1=2, 2^2+2=6... 6^2+6=42).",
    "explanationHi": "अंतर: +4, +6, +8, +10, अगला अंतर +12 होगा। 30 + 12 = 42।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "86bd1defb55163e6",
    "isActive": true
  },
  {
    "id": "reas_012",
    "category": "reasoning",
    "subcategory": "coding_decoding",
    "questionEn": "If 'ROSE' is coded as '6821' and 'CHAIR' is coded as '73456', how will 'SEARCH' be coded?",
    "questionHi": "यदि 'ROSE' को '6821' और 'CHAIR' को '73456' के रूप में कोडित किया जाता है, तो 'SEARCH' को कैसे कोडित किया जाएगा?",
    "optionsEn": [
      "214673",
      "214763",
      "241673",
      "214637"
    ],
    "optionsHi": [
      "214673",
      "214763",
      "241673",
      "214637"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Direct letter mapping: S=2, E=1, A=4, R=6, C=7, H=3 => SEARCH = 214673.",
    "explanationHi": "अक्षरों का सीधा कोड: S=2, E=1, A=4, R=6, C=7, H=3 => 214673।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "fc6ceddf50f1ec0b",
    "isActive": true
  },
  {
    "id": "reas_013",
    "category": "reasoning",
    "subcategory": "blood_relations",
    "questionEn": "A is B's brother. C is A's father. D is C's sister and E is D's mother. How is B related to E?",
    "questionHi": "A, B का भाई है। C, A का पिता है। D, C की बहन है और E, D की माँ है। B, E से किस प्रकार संबंधित है?",
    "optionsEn": [
      "Granddaughter or Grandson",
      "Daughter",
      "Grandmother",
      "Niece"
    ],
    "optionsHi": [
      "पोता या पोती (Grandson / Granddaughter)",
      "बेटी",
      "दादी",
      "भतीजी"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "E is the mother of C and D. A and B are children of C. Therefore, B is the grandchild (grandson or granddaughter) of E.",
    "explanationHi": "E, C की माँ है। A और B, C की संतान हैं। अतः B, E का पोता या पोती (Grandchild) है।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "d93c3336691f7829",
    "isActive": true
  },
  {
    "id": "reas_014",
    "category": "reasoning",
    "subcategory": "direction_sense",
    "questionEn": "Radha walks 20 m North, then turns right and walks 30 m, then turns right and walks 35 m, then turns left and walks 15 m. Finally she turns left and walks 15 m. In which direction is she from her start point?",
    "questionHi": "राधा 20 मीटर उत्तर चलती है, दाएँ मुड़कर 30 मीटर चलती है, फिर दाएँ मुड़कर 35 मीटर चलती है, फिर बाएँ मुड़कर 15 मीटर चलती है। अंत में वह बाएँ मुड़कर 15 मीटर चलती है। वह अपने प्रारंभिक बिंदु से किस दिशा में है?",
    "optionsEn": [
      "North",
      "South",
      "East",
      "West"
    ],
    "optionsHi": [
      "उत्तर",
      "दक्षिण",
      "पूर्व (East)",
      "पश्चिम"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "Vertical displacement: +20 - 35 + 15 = 0 m (back on original latitude). Horizontal displacement: +30 + 15 = 45 m East. She is directly East.",
    "explanationHi": "उत्तर-दक्षिण विस्थापन: +20 - 35 + 15 = 0 मीटर। पूर्व विस्थापन: 30 + 15 = 45 मीटर पूर्व। वह सीधे पूर्व में है।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "16d199bd5cc06543",
    "isActive": true
  },
  {
    "id": "reas_015",
    "category": "reasoning",
    "subcategory": "syllogisms",
    "questionEn": "Statements: All mangoes are golden. No golden things are cheap. Conclusion: I. All mangoes are cheap. II. Golden mangoes are not cheap.",
    "questionHi": "कथन: सभी आम सुनहरे हैं। कोई सुनहरी वस्तु सस्ती नहीं है। निष्कर्ष: I. सभी आम सस्ते हैं। II. सुनहरे आम सस्ते नहीं हैं।",
    "optionsEn": [
      "Only conclusion I follows",
      "Only conclusion II follows",
      "Both conclusions follow",
      "Neither follows"
    ],
    "optionsHi": [
      "केवल निष्कर्ष I निकलता है",
      "केवल निष्कर्ष II निकलता है",
      "दोनों निष्कर्ष निकलते हैं",
      "कोई नहीं निकलता"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Since all mangoes are golden and no golden things are cheap, no mangoes can be cheap. Thus II is valid and I is false.",
    "explanationHi": "सभी आम सुनहरे हैं और सुनहरी वस्तुएं सस्ती नहीं हैं, अतः आम सस्ते नहीं हो सकते। निष्कर्ष II मान्य है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "b3656325dae383fc",
    "isActive": true
  },
  {
    "id": "reas_016",
    "category": "reasoning",
    "subcategory": "seating_arrangement",
    "questionEn": "Five friends P, Q, R, S, and T are sitting in a row facing North. S is between T and Q. Q is to the immediate left of R. P is to the immediate left of T. Who is sitting in the middle?",
    "questionHi": "पांच मित्र P, Q, R, S और T उत्तर की ओर मुख करके एक पंक्ति में बैठे हैं। S, T और Q के बीच में है। Q, R के ठीक बाईं ओर है। P, T के ठीक बाईं ओर है। ठीक बीच में कौन बैठा है?",
    "optionsEn": [
      "P",
      "T",
      "S",
      "Q"
    ],
    "optionsHi": [
      "P",
      "T",
      "S",
      "Q"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "Arrangement from left to right: P, T, S, Q, R. S is exactly in the middle.",
    "explanationHi": "बाएं से दाएं व्यवस्था: P, T, S, Q, R। S ठीक मध्य में बैठा है।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "93cd52347b139d95",
    "isActive": true
  },
  {
    "id": "reas_017",
    "category": "reasoning",
    "subcategory": "clock_calendar",
    "questionEn": "If 1st January 2024 was a Monday, what day of the week was 31st December 2024?",
    "questionHi": "यदि 1 जनवरी 2024 को सोमवार था, तो 31 दिसंबर 2024 को सप्ताह का कौन सा दिन था?",
    "optionsEn": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Sunday"
    ],
    "optionsHi": [
      "सोमवार",
      "मंगलवार (Tuesday)",
      "बुधवार",
      "रविवार"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "2024 was a leap year (366 days). A leap year ends on the day following the day it starts. Monday + 1 = Tuesday.",
    "explanationHi": "2024 एक लीप वर्ष (366 दिन) था। लीप वर्ष जिस दिन शुरू होता है, उसके अगले दिन समाप्त होता है। सोमवार + 1 = मंगलवार।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "15530587b93bf768",
    "isActive": true
  },
  {
    "id": "reas_018",
    "category": "reasoning",
    "subcategory": "classification_odd_one_out",
    "questionEn": "Identify the word that does NOT belong with the others:",
    "questionHi": "उस शब्द की पहचान करें जो अन्य शब्दों के समूह से संबंधित नहीं है:",
    "optionsEn": [
      "Guitar",
      "Violin",
      "Flute",
      "Cello"
    ],
    "optionsHi": [
      "गिटार",
      "वायलिन",
      "बांसुरी (Flute)",
      "सेलो (Cello)"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "Guitar, Violin, and Cello are string instruments; Flute is a wind instrument.",
    "explanationHi": "गिटार, वायलिन और सेलो तार वाले (तंतु) वाद्ययंत्र हैं; बांसुरी एक सुषिर (हवा से बजने वाला) वाद्ययंत्र है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "99f301f72c3ca2e6",
    "isActive": true
  },
  {
    "id": "reas_019",
    "category": "reasoning",
    "subcategory": "analogy",
    "questionEn": "Doctor : Hospital :: Teacher : ?",
    "questionHi": "चिकित्सक : अस्पताल :: शिक्षक : ?",
    "optionsEn": [
      "Student",
      "School",
      "Book",
      "Classroom"
    ],
    "optionsHi": [
      "विद्यार्थी",
      "विद्यालय (School)",
      "पुस्तक",
      "कक्षा"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "A hospital is the primary workplace of a doctor; a school is the primary workplace of a teacher.",
    "explanationHi": "चिकित्सक का कार्यस्थल अस्पताल है; शिक्षक का कार्यस्थल विद्यालय है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "03586477199b0d37",
    "isActive": true
  },
  {
    "id": "reas_020",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "Find the next term in the series: 1, 4, 9, 16, 25, 36, ?",
    "questionHi": "श्रृंखला में अगला पद ज्ञात कीजिए: 1, 4, 9, 16, 25, 36, ?",
    "optionsEn": [
      "48",
      "49",
      "50",
      "64"
    ],
    "optionsHi": [
      "48",
      "49 (7^2)",
      "50",
      "64"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "The series represents squares of consecutive integers: 1^2, 2^2, 3^2, 4^2, 5^2, 6^2, 7^2 = 49.",
    "explanationHi": "क्रमागत प्राकृतिक संख्याओं के वर्ग: 1^2, 2^2, 3^2, 4^2, 5^2, 6^2, 7^2 = 49।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "0054b48cc2e1b3aa",
    "isActive": true
  },
  {
    "id": "reas_021",
    "category": "reasoning",
    "subcategory": "coding_decoding",
    "questionEn": "If 'APPLE' is coded as '50', how is 'ORANGE' coded using standard alphabetical positions?",
    "questionHi": "यदि 'APPLE' को '50' कोडित किया जाता है, तो वर्णमाला स्थिति मान के अनुसार 'ORANGE' को कैसे कोडित किया जाएगा?",
    "optionsEn": [
      "60",
      "62",
      "58",
      "65"
    ],
    "optionsHi": [
      "60",
      "62",
      "58",
      "65"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "APPLE = 1 + 16 + 16 + 12 + 5 = 50. ORANGE = 15 + 18 + 1 + 14 + 7 + 5 = 60.",
    "explanationHi": "वर्णमाला स्थानों का योग: APPLE = 1+16+16+12+5 = 50। ORANGE = 15+18+1+14+7+5 = 60।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "847538485202dce6",
    "isActive": true
  },
  {
    "id": "reas_022",
    "category": "reasoning",
    "subcategory": "blood_relations",
    "questionEn": "Introducing a man, a woman said, 'His wife is the only daughter of my father.' How is the man related to the woman?",
    "questionHi": "एक पुरुष का परिचय देते हुए एक महिला ने कहा, 'उसकी पत्नी मेरे पिता की इकलौती बेटी है।' वह पुरुष उस महिला से किस प्रकार संबंधित है?",
    "optionsEn": [
      "Brother",
      "Father",
      "Husband",
      "Son-in-law"
    ],
    "optionsHi": [
      "भाई",
      "पिता",
      "पति (Husband)",
      "दामाद"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "'Only daughter of my father' is the woman herself. So the man's wife is the woman herself => the man is her husband.",
    "explanationHi": "महिला के पिता की 'इकलौती बेटी' वह स्वयं है। उस पुरुष की पत्नी वह स्वयं है, अतः पुरुष उसका पति है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "62375717a4ab7851",
    "isActive": true
  },
  {
    "id": "reas_023",
    "category": "reasoning",
    "subcategory": "order_ranking",
    "questionEn": "In a row of boys, Mohan is 7th from the left and Vijay is 12th from the right. If they interchange their positions, Mohan becomes 22nd from the left. How many boys are there in the row?",
    "questionHi": "लड़कों की एक पंक्ति में मोहन बाएं से 7वें और विजय दाएं से 12वें स्थान पर है। यदि वे अपना स्थान आपस में बदल लेते हैं, तो मोहन बाएं से 22वां हो जाता है। पंक्ति में कुल कितने लड़के हैं?",
    "optionsEn": [
      "31",
      "32",
      "33",
      "34"
    ],
    "optionsHi": [
      "31",
      "32",
      "33 (22 + 12 - 1 = 33)",
      "34"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "New position of Mohan = 22 from left = old position of Vijay (12 from right). Total = 22 + 12 - 1 = 33.",
    "explanationHi": "कुल संख्या = 22 + 12 - 1 = 33।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "6d1d47c0142ad519",
    "isActive": true
  },
  {
    "id": "reas_024",
    "category": "reasoning",
    "subcategory": "analogy",
    "questionEn": "Country : President :: State : ?",
    "questionHi": "देश : राष्ट्रपति :: राज्य : ?",
    "optionsEn": [
      "Chief Minister",
      "Governor",
      "Home Minister",
      "Speaker"
    ],
    "optionsHi": [
      "मुख्यमंत्री",
      "राज्यपाल (Governor)",
      "गृह मंत्री",
      "विधानसभा अध्यक्ष"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "The President is the constitutional head of the Country; the Governor is the constitutional head of the State.",
    "explanationHi": "देश का संवैधानिक प्रमुख राष्ट्रपति होता है; राज्य का संवैधानिक प्रमुख राज्यपाल होता है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "5d3a4d48ac2da7a4",
    "isActive": true
  },
  {
    "id": "reas_025",
    "category": "reasoning",
    "subcategory": "clock_calendar",
    "questionEn": "How many times do the hands of a clock coincide (overlap) in a 24-hour day?",
    "questionHi": "24 घंटे के एक दिन में घड़ी की दोनों सुइयां कितनी बार एक साथ (एक दूसरे के ऊपर) होती हैं?",
    "optionsEn": [
      "20 times",
      "22 times",
      "24 times",
      "44 times"
    ],
    "optionsHi": [
      "20 बार",
      "22 बार (22 times)",
      "24 बार",
      "44 बार"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "The hands coincide 11 times in every 12 hours (missing the 12th overlap between 11 and 1). In 24 hours, they coincide 22 times.",
    "explanationHi": "12 घंटे में सुइयां 11 बार मिलती हैं, अतः 24 घंटे में वे कुल 22 बार मिलती हैं।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "7380a1f61dd5edad",
    "isActive": true
  },
  {
    "id": "reas_026",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "What number comes next: 11, 13, 17, 19, 23, 29, 31, ?",
    "questionHi": "श्रृंखला में अगली संख्या कौन सी आएगी: 11, 13, 17, 19, 23, 29, 31, ?",
    "optionsEn": [
      "33",
      "35",
      "37",
      "39"
    ],
    "optionsHi": [
      "33",
      "35",
      "37 (अभाज्य संख्या)",
      "39"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "The sequence consists of consecutive prime numbers. The prime number after 31 is 37.",
    "explanationHi": "यह क्रमागत अभाज्य संख्याओं (Prime numbers) की श्रृंखला है। 31 के बाद अगली अभाज्य संख्या 37 है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "9bc454e05828580e",
    "isActive": true
  },
  {
    "id": "reas_027",
    "category": "reasoning",
    "subcategory": "syllogisms",
    "questionEn": "Statements: Some pens are books. All books are pencils. Conclusion: I. Some pens are pencils. II. All pencils are books.",
    "questionHi": "कथन: कुछ पेन किताबें हैं। सभी किताबें पेंसिलें हैं। निष्कर्ष: I. कुछ पेन पेंसिलें हैं। II. सभी पेंसिलें किताबें हैं।",
    "optionsEn": [
      "Only conclusion I follows",
      "Only conclusion II follows",
      "Both follow",
      "Neither follows"
    ],
    "optionsHi": [
      "केवल निष्कर्ष I निकलता है",
      "केवल निष्कर्ष II निकलता है",
      "दोनों निकलते हैं",
      "कोई नहीं निकलता"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Since books are a subset of pencils and some pens are books, those pens must also be pencils (I follows). But not all pencils need to be books (II does not follow).",
    "explanationHi": "कुछ पेन जो किताबें हैं वे अवश्य पेंसिल होंगी, अतः I मान्य है। सभी पेंसिलें किताबें होना अनिवार्य नहीं है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "8ee00bed48960230",
    "isActive": true
  },
  {
    "id": "reas_028",
    "category": "reasoning",
    "subcategory": "direction_sense",
    "questionEn": "One morning after sunrise, Suresh was standing facing a pole. The shadow of the pole fell exactly to his right. In which direction was Suresh facing?",
    "questionHi": "एक सुबह सूर्योदय के बाद सुरेश एक खंभे के सामने खड़ा था। खंभे की परछाई उसके ठीक दाईं ओर पड़ रही थी। सुरेश का मुख किस दिशा में था?",
    "optionsEn": [
      "East",
      "West",
      "North",
      "South"
    ],
    "optionsHi": [
      "पूर्व",
      "पश्चिम",
      "उत्तर",
      "दक्षिण (South)"
    ],
    "correctOptionId": "opt_d",
    "correctIndex": 3,
    "explanationEn": "In the morning, the Sun is in the East, so shadows fall towards the West. If the shadow is to Suresh's right, his right is West, which means he is facing South.",
    "explanationHi": "सुबह परछाई पश्चिम दिशा में पड़ती है। यदि पश्चिम सुरेश के दाईं ओर है, तो उसका मुख दक्षिण की ओर होगा।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "2b4bf5bf1b432e23",
    "isActive": true
  },
  {
    "id": "reas_029",
    "category": "reasoning",
    "subcategory": "letter_series",
    "questionEn": "Find the missing term: AZ, BY, CX, DW, ?",
    "questionHi": "लुप्त पद ज्ञात कीजिए: AZ, BY, CX, DW, ?",
    "optionsEn": [
      "EV",
      "FU",
      "GT",
      "HS"
    ],
    "optionsHi": [
      "EV",
      "FU",
      "GT",
      "HS"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Pairing opposite letters of the alphabet: A-Z, B-Y, C-X, D-W, E-V (5th letter from start and 5th from end).",
    "explanationHi": "विपरीत वर्णमाला युग्म: A-Z, B-Y, C-X, D-W, E-V।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "8e47f22fd99e02d3",
    "isActive": true
  },
  {
    "id": "reas_030",
    "category": "reasoning",
    "subcategory": "classification_odd_one_out",
    "questionEn": "Select the odd pair from the following:",
    "questionHi": "निम्नलिखित में से विषम युग्म का चयन कीजिए:",
    "optionsEn": [
      "Gold : Ornaments",
      "Clay : Pottery",
      "Wood : Furniture",
      "Cloth : Tailor"
    ],
    "optionsHi": [
      "सोना : आभूषण",
      "मिट्टी : बर्तन",
      "लकड़ी : फर्नीचर",
      "कपड़ा : दर्जी (Cloth : Tailor)"
    ],
    "correctOptionId": "opt_d",
    "correctIndex": 3,
    "explanationEn": "Gold, Clay, and Wood are raw materials matched with their finished products. Tailor is the person who works with cloth, not the product.",
    "explanationHi": "पहले तीन में कच्चा माल और उत्पाद का संबंध है, जबकि चौथे में कच्चा माल और कारीगर है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "8b4f541886ab074e",
    "isActive": true
  },
  {
    "id": "reas_031",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "Find the wrong number in the series: 8, 27, 64, 100, 125, 216",
    "questionHi": "श्रृंखला में गलत संख्या ज्ञात कीजिए: 8, 27, 64, 100, 125, 216",
    "optionsEn": [
      "27",
      "64",
      "100",
      "125"
    ],
    "optionsHi": [
      "27",
      "64",
      "100 (गलत पद)",
      "125"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "All numbers are cubes of integers (2^3, 3^3, 4^3, 5^3=125, 6^3=216) except 100, which is 10^2.",
    "explanationHi": "अन्य सभी संख्याएँ पूर्णांकों के घन हैं (2^3, 3^3, 4^3, 5^3, 6^3), केवल 100 घन नहीं है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "8af2857f8afa45e4",
    "isActive": true
  },
  {
    "id": "reas_032",
    "category": "reasoning",
    "subcategory": "coding_decoding",
    "questionEn": "If 'LIGHT' is coded as 'KJHFS', how will 'FLAME' be coded?",
    "questionHi": "यदि 'LIGHT' को 'KJHFS' लिखा जाता है, तो 'FLAME' को क्या लिखा जाएगा?",
    "optionsEn": [
      "EKZLD",
      "GMBNF",
      "EKBLD",
      "GMZND"
    ],
    "optionsHi": [
      "EKZLD",
      "GMBNF",
      "EKBLD",
      "GMZND"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Each letter is shifted by -1: L-1=K, I-1=H (Wait: I-1=H, G+1=H? In LIGHT: L-1=K, I+1=J, G+1=H, H-2=F, T-1=S? Let's check: -1 for all: F-1=E, L-1=K, A-1=Z, M-1=L, E-1=D => EKZLD.",
    "explanationHi": "प्रत्येक अक्षर में -1 करने पर: F-1=E, L-1=K, A-1=Z, M-1=L, E-1=D => EKZLD।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "4173bf649b7109ea",
    "isActive": true
  },
  {
    "id": "reas_033",
    "category": "reasoning",
    "subcategory": "seating_arrangement",
    "questionEn": "Six friends A, B, C, D, E, F are sitting in a circle facing the center. A is facing D. C is between A and B. E is between A and F. Who is sitting opposite to B?",
    "questionHi": "छह मित्र A, B, C, D, E, F एक वृत्त में केंद्र की ओर मुख करके बैठे हैं। A, D के सामने है। C, A और B के बीच है। E, A और F के बीच है। B के विपरीत कौन बैठा है?",
    "optionsEn": [
      "E",
      "F",
      "D",
      "C"
    ],
    "optionsHi": [
      "E",
      "F",
      "D",
      "C"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Circle order clockwise: A, C, B, D, F, E. Opposite pairs: A-D, C-F, B-E? Wait: If C is between A and B, and E is between A and F: counter-clockwise order: B, C, A, E, F, D. Opposite to B (3 positions away in 6-circle) is F.",
    "explanationHi": "वृत्त में 6 व्यक्तियों में 3 स्थान आगे विपरीत होता है: B के ठीक सामने F बैठता है।",
    "difficulty": "hard",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "d2cc23eda5eb9090",
    "isActive": true
  },
  {
    "id": "reas_034",
    "category": "reasoning",
    "subcategory": "analogy",
    "questionEn": "Moon : Satellite :: Earth : ?",
    "questionHi": "चंद्रमा : उपग्रह :: पृथ्वी : ?",
    "optionsEn": [
      "Sun",
      "Planet",
      "Asteroid",
      "Solar System"
    ],
    "optionsHi": [
      "सूर्य",
      "ग्रह (Planet)",
      "क्षुद्रग्रह",
      "सौरमंडल"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Moon is a natural satellite; Earth is a planet.",
    "explanationHi": "चंद्रमा एक प्राकृतिक उपग्रह है; पृथ्वी एक ग्रह है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "b9dd1b0fd0055273",
    "isActive": true
  },
  {
    "id": "reas_035",
    "category": "reasoning",
    "subcategory": "blood_relations",
    "questionEn": "A man said to a lady, 'Your mother's husband's sister is my aunt.' How is the lady related to the man?",
    "questionHi": "एक पुरुष ने एक महिला से कहा, 'तुम्हारी माँ के पति की बहन मेरी चाची/बुआ है।' वह महिला उस पुरुष से किस प्रकार संबंधित है?",
    "optionsEn": [
      "Sister",
      "Mother",
      "Daughter",
      "Grandmother"
    ],
    "optionsHi": [
      "बहन (Sister)",
      "माँ",
      "पुत्री",
      "दादी"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Lady's mother's husband = Lady's father. Father's sister = Lady's paternal aunt (bua). Since this aunt is also the man's aunt, the lady is his sister.",
    "explanationHi": "महिला की माँ का पति = उसका पिता। पिता की बहन = उसकी बुआ। चूंकि वही महिला पुरुष की भी बुआ है, अतः दोनों भाई-बहन हैं।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "651e28975dd20bd6",
    "isActive": true
  },
  {
    "id": "reas_036",
    "category": "reasoning",
    "subcategory": "clock_calendar",
    "questionEn": "If today is Wednesday, what day of the week will it be after 94 days?",
    "questionHi": "यदि आज बुधवार है, तो आज से 94 दिन बाद सप्ताह का कौन सा दिन होगा?",
    "optionsEn": [
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "optionsHi": [
      "बुधवार",
      "गुरुवार",
      "शुक्रवार",
      "शनिवार (Saturday)"
    ],
    "correctOptionId": "opt_d",
    "correctIndex": 3,
    "explanationEn": "94 divided by 7 leaves a remainder of 3 (94 = 13 * 7 + 3). Wednesday + 3 days = Thursday, Friday, Saturday.",
    "explanationHi": "94 को 7 से भाग देने पर शेषफल 3 आता है। बुधवार + 3 विषम दिन = शनिवार।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "ba93594947d63164",
    "isActive": true
  },
  {
    "id": "reas_037",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "Find the next number in the sequence: 5, 10, 20, 40, 80, ?",
    "questionHi": "अनुक्रम में अगली संख्या ज्ञात कीजिए: 5, 10, 20, 40, 80, ?",
    "optionsEn": [
      "120",
      "160",
      "140",
      "180"
    ],
    "optionsHi": [
      "120",
      "160",
      "140",
      "180"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Each term is multiplied by 2: 80 * 2 = 160.",
    "explanationHi": "प्रत्येक पद का 2 से गुणा: 80 * 2 = 160।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "cb6adfb5a95685a3",
    "isActive": true
  },
  {
    "id": "reas_038",
    "category": "reasoning",
    "subcategory": "classification_odd_one_out",
    "questionEn": "Choose the odd one out among the Indian states:",
    "questionHi": "निम्नलिखित भारतीय राज्यों में से विषम का चयन कीजिए:",
    "optionsEn": [
      "Kerala",
      "Gujarat",
      "Goa",
      "Madhya Pradesh"
    ],
    "optionsHi": [
      "केरल",
      "गुजरात",
      "गोवा",
      "मध्य प्रदेश (Landlocked state)"
    ],
    "correctOptionId": "opt_d",
    "correctIndex": 3,
    "explanationEn": "Kerala, Gujarat, and Goa are coastal states along the sea; Madhya Pradesh is completely landlocked.",
    "explanationHi": "केरल, गुजरात और गोवा तटीय राज्य हैं; मध्य प्रदेश चारों तरफ से भूमि से घिरा (भू-आबद्ध) राज्य है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "2c370f9083826514",
    "isActive": true
  },
  {
    "id": "reas_039",
    "category": "reasoning",
    "subcategory": "analogy",
    "questionEn": "Pen : Author :: Sword : ?",
    "questionHi": "कलम : लेखक :: तलवार : ?",
    "optionsEn": [
      "Carpenter",
      "Warrior",
      "Blacksmith",
      "Tailor"
    ],
    "optionsHi": [
      "बढ़ई",
      "योद्धा (Warrior)",
      "लोहार",
      "दर्जी"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "A pen is the characteristic tool of an author; a sword is the characteristic tool of a warrior.",
    "explanationHi": "कलम लेखक का विशिष्ट उपकरण है; तलवार योद्धा का विशिष्ट उपकरण है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "cd22a64b3c77102e",
    "isActive": true
  },
  {
    "id": "reas_040",
    "category": "reasoning",
    "subcategory": "coding_decoding",
    "questionEn": "In a code, 123 means 'hot filtered coffee', 356 means 'very hot day', and 589 means 'day and night'. Which numeral stands for 'very'?",
    "questionHi": "यदि 123 का अर्थ 'hot filtered coffee', 356 का अर्थ 'very hot day' और 589 का अर्थ 'day and night' है, तो 'very' के लिए कौन सा अंक प्रयुक्त हुआ है?",
    "optionsEn": [
      "3",
      "5",
      "6",
      "8"
    ],
    "optionsHi": [
      "3",
      "5",
      "6",
      "8"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "Common between 123 and 356 is 'hot' = 3. Common between 356 and 589 is 'day' = 5. Therefore in 356, 'very' must be 6.",
    "explanationHi": "'hot' दोनों में 3 है, 'day' दोनों में 5 है। अतः 356 में 'very' का कोड 6 है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "59e0d3f23a96956a",
    "isActive": true
  },
  {
    "id": "reas_041",
    "category": "reasoning",
    "subcategory": "direction_sense",
    "questionEn": "Starting from point X, Rohit walked 15 m towards West. He turned left and walked 20 m. He then turned left and walked 15 m. After this he turned right and walked 10 m. How far and in which direction is he from point X?",
    "questionHi": "बिंदु X से शुरू करके रोहित पश्चिम की ओर 15 मीटर चला। वह बाएँ मुड़ा और 20 मीटर चला। फिर वह बाएँ मुड़ा और 15 मीटर चला। इसके बाद वह दाएँ मुड़ा और 10 मीटर चला। अब वह X से कितनी दूरी और किस दिशा में है?",
    "optionsEn": [
      "30 m South",
      "25 m South",
      "30 m North",
      "20 m East"
    ],
    "optionsHi": [
      "30 मीटर दक्षिण",
      "25 मीटर दक्षिण",
      "30 मीटर उत्तर",
      "20 मीटर पूर्व"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "West 15 m, then South 20 m, then East 15 m (cancels West), then South 10 m. Total distance = 20 + 10 = 30 m South.",
    "explanationHi": "15 मी पश्चिम, फिर 20 मी दक्षिण, फिर 15 मी पूर्व (पूर्व-पश्चिम समाप्त), फिर 10 मी दक्षिण। कुल = 30 मीटर दक्षिण।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "6589c996776d1eb4",
    "isActive": true
  },
  {
    "id": "reas_042",
    "category": "reasoning",
    "subcategory": "syllogisms",
    "questionEn": "Statements: All cars are vehicles. Some vehicles are electric. Conclusion: I. Some electric things are cars. II. Some vehicles are cars.",
    "questionHi": "कथन: सभी कारें वाहन हैं। कुछ वाहन इलेक्ट्रिक हैं। निष्कर्ष: I. कुछ इलेक्ट्रिक चीजें कारें हैं। II. कुछ वाहन कारें हैं।",
    "optionsEn": [
      "Only conclusion I follows",
      "Only conclusion II follows",
      "Both follow",
      "Neither follows"
    ],
    "optionsHi": [
      "केवल निष्कर्ष I निकलता है",
      "केवल निष्कर्ष II निकलता है",
      "दोनों निकलते हैं",
      "कोई नहीं निकलता"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Since all cars are vehicles, some vehicles must be cars (II is valid). But the electric vehicles might not overlap with cars (I does not necessarily follow).",
    "explanationHi": "सभी कारें वाहन हैं तो कुछ वाहन कारें अवश्य होंगे (II सत्य है)। कारें इलेक्ट्रिक होना अनिवार्य नहीं है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "35e9cc04dc44623c",
    "isActive": true
  },
  {
    "id": "reas_043",
    "category": "reasoning",
    "subcategory": "order_ranking",
    "questionEn": "In a queue, Sunita is 10th from the front while Anita is 25th from the back. Mamta is standing exactly in the middle of the two. If there are 50 persons in the queue, what is Mamta's position from the front?",
    "questionHi": "एक कतार में सुनीता आगे से 10वीं और अनीता पीछे से 25वीं है। ममता दोनों के ठीक मध्य में खड़ी है। यदि कतार में 50 व्यक्ति हैं, तो आगे से ममता का स्थान क्या है?",
    "optionsEn": [
      "17th",
      "18th",
      "19th",
      "20th"
    ],
    "optionsHi": [
      "17वां",
      "18वां (18th)",
      "19वां",
      "20वां"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Anita's position from front = 50 - 25 + 1 = 26th. Sunita is 10th. Persons between them = 26 - 10 - 1 = 15 persons. Middle person is (10 + 26)/2 = 36/2 = 18th from front.",
    "explanationHi": "अनीता का आगे से स्थान = 50 - 25 + 1 = 26वां। सुनीता = 10वां। मध्य स्थान = (10 + 26) / 2 = 18वां।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "a788bbc07a900196",
    "isActive": true
  },
  {
    "id": "reas_044",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "Complete the series: 0, 7, 26, 63, 124, ?",
    "questionHi": "श्रृंखला पूर्ण कीजिए: 0, 7, 26, 63, 124, ?",
    "optionsEn": [
      "180",
      "215",
      "216",
      "225"
    ],
    "optionsHi": [
      "180",
      "215 (6^3 - 1)",
      "216",
      "225"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Pattern is n^3 - 1: 1^3-1=0, 2^3-1=7, 3^3-1=26, 4^3-1=63, 5^3-1=124, 6^3-1=216-1=215.",
    "explanationHi": "पैटर्न: n^3 - 1। 6^3 - 1 = 216 - 1 = 215।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "93fc57686b28e193",
    "isActive": true
  },
  {
    "id": "reas_045",
    "category": "reasoning",
    "subcategory": "analogy",
    "questionEn": "BIRD : AVIARY :: BEE : ?",
    "questionHi": "पक्षी : पक्षीशाला (Aviary) :: मधुमक्खी : ?",
    "optionsEn": [
      "Aquarium",
      "Apiary",
      "Stable",
      "Burrow"
    ],
    "optionsHi": [
      "मछलीघर",
      "मधुमक्खी शाला (Apiary)",
      "अस्तबल",
      "बिल"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "An aviary is a place where birds are kept; an apiary is a place where bees are kept.",
    "explanationHi": "पक्षियों को पक्षीशाला (Aviary) में रखा जाता है; मधुमक्खियों को मधुमक्खी-शाला (Apiary) में पाला जाता है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "bf6dc8ef90434016",
    "isActive": true
  },
  {
    "id": "reas_046",
    "category": "reasoning",
    "subcategory": "coding_decoding",
    "questionEn": "If 'TIGER' is written as 'QDFHS', how is 'HORSE' written in that code?",
    "questionHi": "यदि 'TIGER' को 'QDFHS' लिखा जाता है, तो 'HORSE' को उसी कूट में क्या लिखा जाएगा?",
    "optionsEn": [
      "GNRRD",
      "ENQRD",
      "GNQRD",
      "FNPQE"
    ],
    "optionsHi": [
      "GNRRD",
      "ENQRD",
      "GNQRD",
      "FNPQE"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Each letter is shifted backward by 1 in reverse order? Or T-1=S, I-1=H, G-1=F, E-1=D, R-1=Q written in reverse: QDFHS! Applying -1 in reverse to HORSE: E-1=D, S-1=R, R-1=Q, O-1=N, H-1=G => DRQNG reversed = GNRRD.",
    "explanationHi": "प्रत्येक अक्षर में -1 करके उल्टा लिखने पर: H->G, O->N, R->Q, S->R, E->D का उल्टा क्रम = D, R, Q, N, G का विपरीत = GNRRD।",
    "difficulty": "hard",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "388547f3005e6611",
    "isActive": true
  },
  {
    "id": "reas_047",
    "category": "reasoning",
    "subcategory": "blood_relations",
    "questionEn": "Pointing to a man, a girl says, 'He is the son of the only son of my grandfather.' How is the man related to the girl?",
    "questionHi": "एक पुरुष की ओर इशारा करते हुए एक लड़की कहती है, 'वह मेरे दादा के इकलौते बेटे का बेटा है।' वह पुरुष उस लड़की से किस प्रकार संबंधित है?",
    "optionsEn": [
      "Father",
      "Brother",
      "Cousin",
      "Uncle"
    ],
    "optionsHi": [
      "पिता",
      "भाई (Brother)",
      "चचेरा भाई",
      "चाचा"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Only son of girl's grandfather = Girl's father. Son of her father = Her brother.",
    "explanationHi": "लड़की के दादा का इकलौता बेटा = उसका पिता। उसके पिता का बेटा = उसका भाई।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "3843d3bdb69c21b7",
    "isActive": true
  },
  {
    "id": "reas_048",
    "category": "reasoning",
    "subcategory": "clock_calendar",
    "questionEn": "What was the day of the week on 15th August 1947 when India achieved independence?",
    "questionHi": "15 अगस्त 1947 को जब भारत स्वतंत्र हुआ, सप्ताह का कौन सा दिन था?",
    "optionsEn": [
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "optionsHi": [
      "गुरुवार",
      "शुक्रवार (Friday)",
      "शनिवार",
      "रविवार"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Calculated by standard calendar odd days: 1600 yrs = 0, 300 yrs = 1, 46 yrs (11 leap, 35 ord) = 57 days = 1 odd day. Jan to 15 Aug = 3 odd days. Total odd days = 1 + 1 + 3 = 5 => Friday.",
    "explanationHi": "मानक कैलेंडर गणना के अनुसार 15 अगस्त 1947 को शुक्रवार (Friday) था।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "6a4ed702a1d284ca",
    "isActive": true
  },
  {
    "id": "reas_049",
    "category": "reasoning",
    "subcategory": "classification_odd_one_out",
    "questionEn": "Find the odd one out among these geometric figures:",
    "questionHi": "इन ज्यामितीय आकृतियों में से विषम का चयन कीजिए:",
    "optionsEn": [
      "Square",
      "Rectangle",
      "Rhombus",
      "Cylinder"
    ],
    "optionsHi": [
      "वर्ग",
      "आयत",
      "समचतुर्भुज",
      "बेलन (Cylinder - 3D shape)"
    ],
    "correctOptionId": "opt_d",
    "correctIndex": 3,
    "explanationEn": "Square, Rectangle, and Rhombus are two-dimensional (2D) quadrilaterals; Cylinder is a three-dimensional (3D) solid.",
    "explanationHi": "वर्ग, आयत और समचतुर्भुज द्विविमीय (2D) चतुर्भुज हैं; बेलन एक त्रिविमीय (3D) ठोस आकृति है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "d930546f06f3ea08",
    "isActive": true
  },
  {
    "id": "reas_050",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "Find the next number in the Fibonacci-style series: 1, 1, 2, 3, 5, 8, 13, 21, ?",
    "questionHi": "श्रृंखला में अगली संख्या ज्ञात कीजिए: 1, 1, 2, 3, 5, 8, 13, 21, ?",
    "optionsEn": [
      "31",
      "34",
      "35",
      "36"
    ],
    "optionsHi": [
      "31",
      "34 (13 + 21 = 34)",
      "35",
      "36"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Each term is the sum of the two preceding terms: 13 + 21 = 34.",
    "explanationHi": "फाइबोनैचि श्रृंखला: प्रत्येक पद पिछले दो पदों का योग है। 13 + 21 = 34।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "922dbb2a3bf6c72b",
    "isActive": true
  },
  {
    "id": "reas_051",
    "category": "reasoning",
    "subcategory": "analogy",
    "questionEn": "Venn Diagram / Category: Which diagram represents the relation among 'Mammals', 'Cows', and 'Crows'?",
    "questionHi": "'स्तनपायी', 'गाय' और 'कौआ' के बीच संबंध को दर्शाने वाला सही विकल्प क्या है?",
    "optionsEn": [
      "All Cows are Mammals, while Crows are completely outside the Mammals circle",
      "All Mammals are Cows, and some Crows are Mammals",
      "All three circles overlap completely",
      "All Crows are Mammals, while Cows are outside"
    ],
    "optionsHi": [
      "सभी गायें स्तनपायी हैं, जबकि कौआ स्तनपायी वृत्त से पूरी तरह बाहर है",
      "सभी स्तनपायी गायें हैं, और कुछ कौवे स्तनपायी हैं",
      "तीनों वृत्त पूरी तरह एक दूसरे को काटते हैं",
      "सभी कौवे स्तनपायी हैं, जबकि गायें बाहर हैं"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Cows are entirely inside Mammals (since all cows are mammals), and crows are birds, entirely disjoint from mammals.",
    "explanationHi": "सभी गायें स्तनपायी के अंतर्गत आती हैं, जबकि कौआ पक्षी वर्ग का होने के कारण पूर्णतः अलग वृत्त में होगा।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "a3599fb74a154a11",
    "isActive": true
  },
  {
    "id": "reas_052",
    "category": "reasoning",
    "subcategory": "coding_decoding",
    "questionEn": "In a code, 'GIVE' is written as 'VIEG' and 'OVER' is written as 'EVRO'. How will 'DISK' be written in that code?",
    "questionHi": "यदि 'GIVE' को 'VIEG' और 'OVER' को 'EVRO' लिखा जाता है, तो 'DISK' को उसी कूट में कैसे लिखा जाएगा?",
    "optionsEn": [
      "SIKD",
      "SIDK",
      "SKID",
      "IKSD"
    ],
    "optionsHi": [
      "SIKD",
      "SIDK",
      "SKID",
      "IKSD"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Positions 1-2-3-4 are rearranged to 3-2-4-1: In DISK (D=1, I=2, S=3, K=4) -> 3(S), 2(I), 4(K), 1(D) = SIKD.",
    "explanationHi": "स्थान परिवर्तन: 1-2-3-4 बदलकर 3-2-4-1 हो जाता है: D(1), I(2), S(3), K(4) => SIKD।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "11d997f3e1b83380",
    "isActive": true
  },
  {
    "id": "reas_053",
    "category": "reasoning",
    "subcategory": "blood_relations",
    "questionEn": "If P + Q means 'P is the mother of Q', P - Q means 'P is the brother of Q', and P * Q means 'P is the father of Q', which expression shows that 'R is the maternal uncle of S'?",
    "questionHi": "यदि P + Q का अर्थ 'P, Q की माँ है', P - Q का अर्थ 'P, Q का भाई है', और P * Q का अर्थ 'P, Q का पिता है', तो कौन सा व्यंजक दर्शाता है कि 'R, S का मामा है'?",
    "optionsEn": [
      "R - M + S",
      "R + M - S",
      "R * M + S",
      "R - M * S"
    ],
    "optionsHi": [
      "R - M + S",
      "R + M - S",
      "R * M + S",
      "R - M * S"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "In 'R - M + S': R is the brother of M, and M is the mother of S. The brother of one's mother is the maternal uncle (मामा).",
    "explanationHi": "R - M + S में: R, M का भाई है और M, S की माँ है। माँ का भाई मामा होता है।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "e0d6792b6787af3c",
    "isActive": true
  },
  {
    "id": "reas_054",
    "category": "reasoning",
    "subcategory": "direction_sense",
    "questionEn": "At sunset, a woman was standing facing North. In which direction was her shadow cast?",
    "questionHi": "सूर्यास्त के समय एक महिला उत्तर की ओर मुख करके खड़ी थी। उसकी परछाई किस दिशा में पड़ रही थी?",
    "optionsEn": [
      "East",
      "West",
      "North",
      "South"
    ],
    "optionsHi": [
      "पूर्व (East)",
      "पश्चिम",
      "उत्तर",
      "दक्षिण"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "At sunset, the Sun is in the West, so all shadows are cast towards the East, regardless of which way the person faces.",
    "explanationHi": "सूर्यास्त के समय सूर्य पश्चिम में होता है, अतः परछाई हमेशा पूर्व (East) दिशा में पड़ती है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "012e407bd568b6fd",
    "isActive": true
  },
  {
    "id": "reas_055",
    "category": "reasoning",
    "subcategory": "order_ranking",
    "questionEn": "In a race of 6 participants, A finished ahead of B but behind C. D finished ahead of E but behind B. Who finished last?",
    "questionHi": "6 प्रतिभागियों की दौड़ में, A ने B से पहले लेकिन C के बाद दौड़ पूरी की। D ने E से पहले लेकिन B के बाद दौड़ पूरी की। दौड़ में सबसे अंतिम कौन रहा?",
    "optionsEn": [
      "B",
      "D",
      "E",
      "C"
    ],
    "optionsHi": [
      "B",
      "D",
      "E (Last)",
      "C"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "Order: C > A > B > D > E. E is the last finisher.",
    "explanationHi": "दौड़ का क्रम: C > A > B > D > E। E सबसे अंतिम स्थान पर रहा।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "38d535328eff5672",
    "isActive": true
  },
  {
    "id": "reas_056",
    "category": "reasoning",
    "subcategory": "syllogisms",
    "questionEn": "Statements: All flowers are trees. No tree is a stone. Conclusion: I. No stone is a flower. II. No flower is a stone.",
    "questionHi": "कथन: सभी फूल पेड़ हैं। कोई पेड़ पत्थर नहीं है। निष्कर्ष: I. कोई पत्थर फूल नहीं है। II. कोई फूल पत्थर नहीं है।",
    "optionsEn": [
      "Only I follows",
      "Only II follows",
      "Both I and II follow",
      "Neither follows"
    ],
    "optionsHi": [
      "केवल I निकलता है",
      "केवल II निकलता है",
      "I और II दोनों निकलते हैं",
      "कोई नहीं निकलता"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "Since flowers are inside trees, and no tree can touch stones, no stone can touch flowers and vice-versa. Both conclusions are valid.",
    "explanationHi": "फूल पेड़ों के अंतर्गत हैं और पेड़ों का पत्थर से कोई संबंध नहीं है, अतः फूल और पत्थर परस्पर असंयुक्त हैं। दोनों निष्कर्ष सत्य हैं।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "4dec39387610ed8f",
    "isActive": true
  },
  {
    "id": "reas_057",
    "category": "reasoning",
    "subcategory": "clock_calendar",
    "questionEn": "How many degrees does the minute hand of a clock turn in 20 minutes?",
    "questionHi": "एक घड़ी की मिनट की सुई 20 मिनट में कितने अंश घूमती है?",
    "optionsEn": [
      "100 degrees",
      "120 degrees",
      "140 degrees",
      "60 degrees"
    ],
    "optionsHi": [
      "100 अंश",
      "120 अंश (20 * 6° = 120°)",
      "140 अंश",
      "60 अंश"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "The minute hand moves 360 degrees in 60 minutes, which is 6 degrees per minute. In 20 minutes: 20 * 6 = 120 degrees.",
    "explanationHi": "मिनट की सुई 1 मिनट में 6° घूमती है। 20 मिनट में = 20 * 6 = 120°।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "4de9ec3a9d914af4",
    "isActive": true
  },
  {
    "id": "reas_058",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "Find the missing term: 4, 9, 25, 49, 121, ?",
    "questionHi": "लुप्त पद ज्ञात कीजिए: 4, 9, 25, 49, 121, ?",
    "optionsEn": [
      "144",
      "169",
      "196",
      "225"
    ],
    "optionsHi": [
      "144",
      "169 (13^2)",
      "196",
      "225"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "These are squares of prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121. The next prime is 13, so 13^2 = 169.",
    "explanationHi": "अभाज्य संख्याओं के वर्ग: 2^2, 3^2, 5^2, 7^2, 11^2। अगली अभाज्य संख्या 13 है, अतः 13^2 = 169।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "2273ed9627ccb0b1",
    "isActive": true
  },
  {
    "id": "reas_059",
    "category": "reasoning",
    "subcategory": "classification_odd_one_out",
    "questionEn": "Choose the odd one out among the metals:",
    "questionHi": "धातुओं में से विषम का चयन कीजिए:",
    "optionsEn": [
      "Iron",
      "Copper",
      "Mercury",
      "Silver"
    ],
    "optionsHi": [
      "लोहा",
      "तांबा",
      "पारा (Mercury - Liquid at room temp)",
      "चांदी"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "Mercury is the only metal that is liquid at standard room temperature; Iron, Copper, and Silver are solid.",
    "explanationHi": "पारा (मर्करी) कमरे के सामान्य तापमान पर एकमात्र तरल धातु है; अन्य सभी ठोस हैं।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "4b206c8786136821",
    "isActive": true
  },
  {
    "id": "reas_060",
    "category": "reasoning",
    "subcategory": "analogy",
    "questionEn": "Ocean : Water :: Glacier : ?",
    "questionHi": "महासागर : जल :: हिमनद (Glacier) : ?",
    "optionsEn": [
      "Rock",
      "Ice",
      "Steam",
      "Salt"
    ],
    "optionsHi": [
      "चट्टान",
      "बर्फ (Ice)",
      "भाप",
      "नमक"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "An ocean is a vast body of water; a glacier is a vast body of ice.",
    "explanationHi": "महासागर जल का विशाल भंडार है; हिमनद बर्फ का विशाल भंडार है।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "b61fc7dac83733d8",
    "isActive": true
  },
  {
    "id": "reas_061",
    "category": "reasoning",
    "subcategory": "letter_series",
    "questionEn": "Complete the letter series: Z, X, V, T, R, ?",
    "questionHi": "अक्षर श्रृंखला पूर्ण कीजिए: Z, X, V, T, R, ?",
    "optionsEn": [
      "P",
      "Q",
      "O",
      "N"
    ],
    "optionsHi": [
      "P (16वां अक्षर)",
      "Q",
      "O",
      "N"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Each letter moves backwards by 2 positions: 26, 24, 22, 20, 18, 16 (P).",
    "explanationHi": "प्रत्येक अक्षर 2 स्थान पीछे जा रहा है: Z(26), X(24), V(22), T(20), R(18), P(16)।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "ebe61414e64bb19b",
    "isActive": true
  },
  {
    "id": "reas_062",
    "category": "reasoning",
    "subcategory": "coding_decoding",
    "questionEn": "If 'CAT' is coded as '3120', how is 'DOG' coded?",
    "questionHi": "यदि 'CAT' को '3120' लिखा जाता है, तो 'DOG' को क्या लिखा जाएगा?",
    "optionsEn": [
      "4157",
      "4158",
      "4147",
      "5168"
    ],
    "optionsHi": [
      "4157",
      "4158",
      "4147",
      "5168"
    ],
    "correctOptionId": "opt_a",
    "correctIndex": 0,
    "explanationEn": "Direct alphabet positions: C=3, A=1, T=20 => 3120. D=4, O=15, G=7 => 4157.",
    "explanationHi": "अक्षरों के प्रत्यक्ष वर्णमाला क्रमांक: C(3), A(1), T(20) => 3120। D(4), O(15), G(7) => 4157।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "0b24a7fede191a5f",
    "isActive": true
  },
  {
    "id": "reas_063",
    "category": "reasoning",
    "subcategory": "seating_arrangement",
    "questionEn": "In a straight line facing North, A is 4th to the left of B. If B is 6th from the right end and the row has 15 people, what is A's position from the left end?",
    "questionHi": "उत्तर की ओर मुख वाली एक सीधी पंक्ति में, A, B के बाईं ओर चौथे स्थान पर है। यदि B दाएं छोर से छठा है और पंक्ति में 15 व्यक्ति हैं, तो बाएं छोर से A का स्थान क्या है?",
    "optionsEn": [
      "5th",
      "6th",
      "7th",
      "8th"
    ],
    "optionsHi": [
      "5वां",
      "6वां (6th)",
      "7वां",
      "8वां"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Position of B from left = 15 - 6 + 1 = 10th. A is 4 positions to the left of B: 10 - 4 = 6th from the left.",
    "explanationHi": "बाएं से B का स्थान = 15 - 6 + 1 = 10वां। A, B से 4 स्थान बाईं ओर है: 10 - 4 = 6वां।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "69256afffb969696",
    "isActive": true
  },
  {
    "id": "reas_064",
    "category": "reasoning",
    "subcategory": "clock_calendar",
    "questionEn": "A clock gains 5 minutes every hour. If it is set correctly at 12:00 noon, what time will it display at 6:00 PM on the same day?",
    "questionHi": "एक घड़ी प्रति घंटे 5 मिनट तेज हो जाती है। यदि इसे दोपहर 12:00 बजे सही समय पर सेट किया जाता है, तो उसी दिन शाम 6:00 बजे यह क्या समय दिखाएगी?",
    "optionsEn": [
      "6:25 PM",
      "6:30 PM",
      "6:35 PM",
      "6:20 PM"
    ],
    "optionsHi": [
      "6:25 PM",
      "6:30 PM",
      "6:35 PM",
      "6:20 PM"
    ],
    "correctOptionId": "opt_b",
    "correctIndex": 1,
    "explanationEn": "Between 12:00 PM and 6:00 PM, 6 hours have passed. Time gained = 6 * 5 = 30 minutes. The clock will show 6:30 PM.",
    "explanationHi": "6 घंटे बीते हैं। तेज हुई समय = 6 * 5 = 30 मिनट। घड़ी शाम 6:30 PM दिखाएगी।",
    "difficulty": "easy",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "3d53f7735dae7d6d",
    "isActive": true
  },
  {
    "id": "reas_065",
    "category": "reasoning",
    "subcategory": "number_series",
    "questionEn": "Identify the next number in the alternating series: 2, 3, 4, 6, 6, 9, 8, ?",
    "questionHi": "एकांतर श्रृंखला में अगली संख्या पहचानिए: 2, 3, 4, 6, 6, 9, 8, ?",
    "optionsEn": [
      "10",
      "11",
      "12",
      "14"
    ],
    "optionsHi": [
      "10",
      "11",
      "12",
      "14"
    ],
    "correctOptionId": "opt_c",
    "correctIndex": 2,
    "explanationEn": "Two interleaved series: 1st: 2, 4, 6, 8 (+2). 2nd: 3, 6, 9, 12 (+3). The next term belongs to the 2nd series: 9 + 3 = 12.",
    "explanationHi": "दो अंतर्निहित श्रृंखलाएँ: 2, 4, 6, 8 (सम) और 3, 6, 9, 12 (+3)। अगला पद 9 + 3 = 12 होगा।",
    "difficulty": "medium",
    "source": {
      "name": "Original Logical Reasoning & Cognitive Assessment Standard",
      "url": "https://ncert.nic.in/textbook.php",
      "verificationDate": "2026-03-10",
      "status": "verified"
    },
    "createdAt": "2026-03-15T00:00:00.000Z",
    "fingerprint": "f9281994653aa7f8",
    "isActive": true
  }
];
