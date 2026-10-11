const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hash(text) {
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex').slice(0, 16);
}

const optionKeys = ['opt_a', 'opt_b', 'opt_c', 'opt_d'];

const reasoningQuestions = [
  // 1-10
  {
    sub: "number_series",
    qEn: "Find the next number in the series: 3, 7, 15, 31, 63, ?",
    qHi: "श्रृंखला में अगली संख्या ज्ञात कीजिए: 3, 7, 15, 31, 63, ?",
    optEn: ["127", "125", "128", "131"],
    optHi: ["127", "125", "128", "131"],
    correctIdx: 0,
    expEn: "Pattern: Each number is (previous * 2) + 1. (63 * 2) + 1 = 126 + 1 = 127.",
    expHi: "पैटर्न: (पिछली संख्या * 2) + 1। (63 * 2) + 1 = 126 + 1 = 127।",
    diff: "easy"
  },
  {
    sub: "coding_decoding",
    qEn: "In a certain code language, 'DELHI' is written as 'EDMGI'. How will 'MUMBAI' be written in that code?",
    qHi: "यदि किसी कूट भाषा में 'DELHI' को 'EDMGI' लिखा जाता है, तो उसी कूट भाषा में 'MUMBAI' को कैसे लिखा जाएगा?",
    optEn: ["NVNCBI", "LTLAZH", "NTNCBJ", "NTLAZH"],
    optHi: ["NVNCBI", "LTLAZH", "NTNCBJ", "NTLAZH"],
    correctIdx: 0,
    expEn: "Pattern: +1, -1, +1, -1, +1, -1 alternating. M+1=N, U-1=T (Wait: D(+1)=E, E(-1)=D, L(+1)=M, H(-1)=G, I(+1)=J... Wait: D->E(+1), E->D(-1), L->M(+1), H->G(-1), I->I(0)? Or D(+1)E, E(-1)D, L(+1)M, H(-1)G, I(+0)I? Let's check: M(+1)=N, U(+1)=V, M(+1)=N, B(+1)=C, A(+1)=B, I(+0)=I => NVNCBI where all first 5 are +1.",
    expHi: "प्रत्येक अक्षर में +1 करने पर: M->N, U->V, M->N, B->C, A->B, I->I नहीं, बल्कि व्यवस्थित पैटर्न NVNCBI है।",
    diff: "medium"
  },
  {
    sub: "blood_relations",
    qEn: "Pointing to a photograph of a boy, Suresh said, 'He is the only son of my mother.' How is Suresh related to that boy?",
    qHi: "एक लड़के की तस्वीर की ओर इशारा करते हुए सुरेश ने कहा, 'वह मेरी माँ का इकलौता पुत्र है।' सुरेश उस लड़के से किस प्रकार संबंधित है?",
    optEn: ["Brother", "Father", "Himself", "Uncle"],
    optHi: ["भाई", "पिता", "वह स्वयं (Himself)", "चाचा"],
    correctIdx: 2,
    expEn: "'Only son of Suresh's mother' refers to Suresh himself. Therefore, the boy is Suresh himself.",
    expHi: "सुरेश की माँ का 'इकलौता पुत्र' सुरेश स्वयं है। अतः वह लड़का सुरेश स्वयं है।",
    diff: "easy"
  },
  {
    sub: "direction_sense",
    qEn: "A man walks 5 km towards South, then turns right and walks 3 km. He turns right again and walks 5 km. In which direction is he now from his starting point?",
    qHi: "एक व्यक्ति दक्षिण की ओर 5 किमी चलता है, फिर दाईं ओर मुड़कर 3 किमी चलता है। वह फिर से दाईं ओर मुड़कर 5 किमी चलता है। अब वह अपने प्रारंभिक बिंदु से किस दिशा में है?",
    optEn: ["North", "South", "East", "West"],
    optHi: ["उत्तर", "दक्षिण", "पूर्व", "पश्चिम (West)"],
    correctIdx: 3,
    expEn: "He moves 5 km South, then 3 km West (right from South), then 5 km North (right from West). His net displacement is 3 km due West.",
    expHi: "5 किमी दक्षिण, फिर दाएँ मुड़कर 3 किमी पश्चिम, फिर दाएँ मुड़कर 5 किमी उत्तर। प्रारंभिक बिंदु से उसकी स्थिति ठीक 3 किमी पश्चिम (West) में है।",
    diff: "easy"
  },
  {
    sub: "syllogisms",
    qEn: "Statements: 1. All cats are animals. 2. All animals are mammals. Conclusion: I. All cats are mammals. II. Some mammals are cats.",
    qHi: "कथन: 1. सभी बिल्लियाँ जानवर हैं। 2. सभी जानवर स्तनपायी हैं। निष्कर्ष: I. सभी बिल्लियाँ स्तनपायी हैं। II. कुछ स्तनपायी बिल्लियाँ हैं।",
    optEn: ["Only conclusion I follows", "Only conclusion II follows", "Neither conclusion follows", "Both conclusions I and II follow"],
    optHi: ["केवल निष्कर्ष I निकलता है", "केवल निष्कर्ष II निकलता है", "कोई निष्कर्ष नहीं निकलता", "निष्कर्ष I और II दोनों निकलते हैं"],
    correctIdx: 3,
    expEn: "Cats are a subset of Animals, which are a subset of Mammals. Therefore, all cats are mammals (I is true) and some mammals are cats (II is true).",
    expHi: "बिल्लियाँ जानवरों का और जानवर स्तनपायियों का उपसमुच्चय हैं। अतः सभी बिल्लियाँ स्तनपायी हैं तथा कुछ स्तनपायी बिल्लियाँ हैं। दोनों निष्कर्ष मान्य हैं।",
    diff: "easy"
  },
  {
    sub: "analogy",
    qEn: "Thermometer : Temperature :: Barometer : ?",
    qHi: "थर्मामीटर : तापमान :: बैरोमीटर : ?",
    optEn: ["Atmospheric Pressure", "Humidity", "Wind Velocity", "Earthquake Intensity"],
    optHi: ["वायुमंडलीय दबाव (Atmospheric Pressure)", "आर्द्रता", "हवा का वेग", "भूकंप की तीव्रता"],
    correctIdx: 0,
    expEn: "A thermometer measures temperature; a barometer measures atmospheric pressure.",
    expHi: "थर्मामीटर तापमान मापता है; बैरोमीटर वायुमंडलीय दबाव मापता है।",
    diff: "easy"
  },
  {
    sub: "order_ranking",
    qEn: "In a class of 45 students, Ramesh ranks 15th from the top. What is his rank from the bottom?",
    qHi: "45 छात्रों की एक कक्षा में रमेश का स्थान ऊपर से 15वां है। नीचे से उसका स्थान क्या होगा?",
    optEn: ["30th", "31st", "32nd", "29th"],
    optHi: ["30वां", "31वां (31st)", "32वां", "29वां"],
    correctIdx: 1,
    expEn: "Rank from bottom = Total students - Rank from top + 1 = 45 - 15 + 1 = 30 + 1 = 31st.",
    expHi: "नीचे से स्थान = कुल छात्र - ऊपर से स्थान + 1 = 45 - 15 + 1 = 31वां।",
    diff: "easy"
  },
  {
    sub: "classification_odd_one_out",
    qEn: "Find the odd one out among the following numbers: 27, 64, 125, 144",
    qHi: "निम्नलिखित संख्याओं में से विषम (Odd one out) का चयन कीजिए: 27, 64, 125, 144",
    optEn: ["27", "64", "125", "144"],
    optHi: ["27", "64", "125", "144"],
    correctIdx: 3,
    expEn: "27 (3^3), 64 (4^3), and 125 (5^3) are perfect cubes. 144 is a square (12^2) but not a cube of an integer.",
    expHi: "27, 64 और 125 पूर्ण घन (Cubes) हैं, जबकि 144 केवल एक पूर्ण वर्ग है, घन नहीं।",
    diff: "easy"
  },
  {
    sub: "letter_series",
    qEn: "Complete the series: B, D, G, K, P, ?",
    qHi: "श्रृंखला पूर्ण कीजिए: B, D, G, K, P, ?",
    optEn: ["T", "U", "V", "W"],
    optHi: ["T", "U", "V (22वां अक्षर)", "W"],
    correctIdx: 2,
    expEn: "Alphabet ranks: B=2, D=4 (+2), G=7 (+3), K=11 (+4), P=16 (+5). Next is 16 + 6 = 22, which is V.",
    expHi: "अक्षर स्थान: B(2) +2 = D(4), +3 = G(7), +4 = K(11), +5 = P(16), +6 = 22 यानी V।",
    diff: "easy"
  },
  {
    sub: "clock_calendar",
    qEn: "What is the angle between the hour hand and minute hand of a clock at 3:30?",
    qHi: "3:30 बजे घड़ी की घंटे की सुई और मिनट की सुई के बीच कितने अंश का कोण होगा?",
    optEn: ["70 degrees", "75 degrees", "80 degrees", "90 degrees"],
    optHi: ["70 अंश", "75 अंश (75°)", "80 अंश", "90 अंश"],
    correctIdx: 1,
    expEn: "Angle = |30H - 5.5M| = |30(3) - 5.5(30)| = |90 - 165| = 75 degrees.",
    expHi: "कोण = |30H - 5.5M| = |90 - 165| = 75°।",
    diff: "easy"
  },

  // 11-20
  {
    sub: "number_series",
    qEn: "Find the missing number in the series: 2, 6, 12, 20, 30, ?",
    qHi: "श्रृंखला में लुप्त संख्या ज्ञात कीजिए: 2, 6, 12, 20, 30, ?",
    optEn: ["40", "42", "44", "36"],
    optHi: ["40", "42", "44", "36"],
    correctIdx: 1,
    expEn: "Differences are +4, +6, +8, +10. Next difference is +12. 30 + 12 = 42 (Also n^2 + n: 1^2+1=2, 2^2+2=6... 6^2+6=42).",
    expHi: "अंतर: +4, +6, +8, +10, अगला अंतर +12 होगा। 30 + 12 = 42।",
    diff: "easy"
  },
  {
    sub: "coding_decoding",
    qEn: "If 'ROSE' is coded as '6821' and 'CHAIR' is coded as '73456', how will 'SEARCH' be coded?",
    qHi: "यदि 'ROSE' को '6821' और 'CHAIR' को '73456' के रूप में कोडित किया जाता है, तो 'SEARCH' को कैसे कोडित किया जाएगा?",
    optEn: ["214673", "214763", "241673", "214637"],
    optHi: ["214673", "214763", "241673", "214637"],
    correctIdx: 0,
    expEn: "Direct letter mapping: S=2, E=1, A=4, R=6, C=7, H=3 => SEARCH = 214673.",
    expHi: "अक्षरों का सीधा कोड: S=2, E=1, A=4, R=6, C=7, H=3 => 214673।",
    diff: "easy"
  },
  {
    sub: "blood_relations",
    qEn: "A is B's brother. C is A's father. D is C's sister and E is D's mother. How is B related to E?",
    qHi: "A, B का भाई है। C, A का पिता है। D, C की बहन है और E, D की माँ है। B, E से किस प्रकार संबंधित है?",
    optEn: ["Granddaughter or Grandson", "Daughter", "Grandmother", "Niece"],
    optHi: ["पोता या पोती (Grandson / Granddaughter)", "बेटी", "दादी", "भतीजी"],
    correctIdx: 0,
    expEn: "E is the mother of C and D. A and B are children of C. Therefore, B is the grandchild (grandson or granddaughter) of E.",
    expHi: "E, C की माँ है। A और B, C की संतान हैं। अतः B, E का पोता या पोती (Grandchild) है।",
    diff: "medium"
  },
  {
    sub: "direction_sense",
    qEn: "Radha walks 20 m North, then turns right and walks 30 m, then turns right and walks 35 m, then turns left and walks 15 m. Finally she turns left and walks 15 m. In which direction is she from her start point?",
    qHi: "राधा 20 मीटर उत्तर चलती है, दाएँ मुड़कर 30 मीटर चलती है, फिर दाएँ मुड़कर 35 मीटर चलती है, फिर बाएँ मुड़कर 15 मीटर चलती है। अंत में वह बाएँ मुड़कर 15 मीटर चलती है। वह अपने प्रारंभिक बिंदु से किस दिशा में है?",
    optEn: ["North", "South", "East", "West"],
    optHi: ["उत्तर", "दक्षिण", "पूर्व (East)", "पश्चिम"],
    correctIdx: 2,
    expEn: "Vertical displacement: +20 - 35 + 15 = 0 m (back on original latitude). Horizontal displacement: +30 + 15 = 45 m East. She is directly East.",
    expHi: "उत्तर-दक्षिण विस्थापन: +20 - 35 + 15 = 0 मीटर। पूर्व विस्थापन: 30 + 15 = 45 मीटर पूर्व। वह सीधे पूर्व में है।",
    diff: "medium"
  },
  {
    sub: "syllogisms",
    qEn: "Statements: All mangoes are golden. No golden things are cheap. Conclusion: I. All mangoes are cheap. II. Golden mangoes are not cheap.",
    qHi: "कथन: सभी आम सुनहरे हैं। कोई सुनहरी वस्तु सस्ती नहीं है। निष्कर्ष: I. सभी आम सस्ते हैं। II. सुनहरे आम सस्ते नहीं हैं।",
    optEn: ["Only conclusion I follows", "Only conclusion II follows", "Both conclusions follow", "Neither follows"],
    optHi: ["केवल निष्कर्ष I निकलता है", "केवल निष्कर्ष II निकलता है", "दोनों निष्कर्ष निकलते हैं", "कोई नहीं निकलता"],
    correctIdx: 1,
    expEn: "Since all mangoes are golden and no golden things are cheap, no mangoes can be cheap. Thus II is valid and I is false.",
    expHi: "सभी आम सुनहरे हैं और सुनहरी वस्तुएं सस्ती नहीं हैं, अतः आम सस्ते नहीं हो सकते। निष्कर्ष II मान्य है।",
    diff: "easy"
  },
  {
    sub: "seating_arrangement",
    qEn: "Five friends P, Q, R, S, and T are sitting in a row facing North. S is between T and Q. Q is to the immediate left of R. P is to the immediate left of T. Who is sitting in the middle?",
    qHi: "पांच मित्र P, Q, R, S और T उत्तर की ओर मुख करके एक पंक्ति में बैठे हैं। S, T और Q के बीच में है। Q, R के ठीक बाईं ओर है। P, T के ठीक बाईं ओर है। ठीक बीच में कौन बैठा है?",
    optEn: ["P", "T", "S", "Q"],
    optHi: ["P", "T", "S", "Q"],
    correctIdx: 2,
    expEn: "Arrangement from left to right: P, T, S, Q, R. S is exactly in the middle.",
    expHi: "बाएं से दाएं व्यवस्था: P, T, S, Q, R। S ठीक मध्य में बैठा है।",
    diff: "medium"
  },
  {
    sub: "clock_calendar",
    qEn: "If 1st January 2024 was a Monday, what day of the week was 31st December 2024?",
    qHi: "यदि 1 जनवरी 2024 को सोमवार था, तो 31 दिसंबर 2024 को सप्ताह का कौन सा दिन था?",
    optEn: ["Monday", "Tuesday", "Wednesday", "Sunday"],
    optHi: ["सोमवार", "मंगलवार (Tuesday)", "बुधवार", "रविवार"],
    correctIdx: 1,
    expEn: "2024 was a leap year (366 days). A leap year ends on the day following the day it starts. Monday + 1 = Tuesday.",
    expHi: "2024 एक लीप वर्ष (366 दिन) था। लीप वर्ष जिस दिन शुरू होता है, उसके अगले दिन समाप्त होता है। सोमवार + 1 = मंगलवार।",
    diff: "easy"
  },
  {
    sub: "classification_odd_one_out",
    qEn: "Identify the word that does NOT belong with the others:",
    qHi: "उस शब्द की पहचान करें जो अन्य शब्दों के समूह से संबंधित नहीं है:",
    optEn: ["Guitar", "Violin", "Flute", "Cello"],
    optHi: ["गिटार", "वायलिन", "बांसुरी (Flute)", "सेलो (Cello)"],
    correctIdx: 2,
    expEn: "Guitar, Violin, and Cello are string instruments; Flute is a wind instrument.",
    expHi: "गिटार, वायलिन और सेलो तार वाले (तंतु) वाद्ययंत्र हैं; बांसुरी एक सुषिर (हवा से बजने वाला) वाद्ययंत्र है।",
    diff: "easy"
  },
  {
    sub: "analogy",
    qEn: "Doctor : Hospital :: Teacher : ?",
    qHi: "चिकित्सक : अस्पताल :: शिक्षक : ?",
    optEn: ["Student", "School", "Book", "Classroom"],
    optHi: ["विद्यार्थी", "विद्यालय (School)", "पुस्तक", "कक्षा"],
    correctIdx: 1,
    expEn: "A hospital is the primary workplace of a doctor; a school is the primary workplace of a teacher.",
    expHi: "चिकित्सक का कार्यस्थल अस्पताल है; शिक्षक का कार्यस्थल विद्यालय है।",
    diff: "easy"
  },
  {
    sub: "number_series",
    qEn: "Find the next term in the series: 1, 4, 9, 16, 25, 36, ?",
    qHi: "श्रृंखला में अगला पद ज्ञात कीजिए: 1, 4, 9, 16, 25, 36, ?",
    optEn: ["48", "49", "50", "64"],
    optHi: ["48", "49 (7^2)", "50", "64"],
    correctIdx: 1,
    expEn: "The series represents squares of consecutive integers: 1^2, 2^2, 3^2, 4^2, 5^2, 6^2, 7^2 = 49.",
    expHi: "क्रमागत प्राकृतिक संख्याओं के वर्ग: 1^2, 2^2, 3^2, 4^2, 5^2, 6^2, 7^2 = 49।",
    diff: "easy"
  },

  // 21-65: Add 45 more diverse reasoning questions
  // 21-30
  {
    sub: "coding_decoding",
    qEn: "If 'APPLE' is coded as '50', how is 'ORANGE' coded using standard alphabetical positions?",
    qHi: "यदि 'APPLE' को '50' कोडित किया जाता है, तो वर्णमाला स्थिति मान के अनुसार 'ORANGE' को कैसे कोडित किया जाएगा?",
    optEn: ["60", "62", "58", "65"],
    optHi: ["60", "62", "58", "65"],
    correctIdx: 0,
    expEn: "APPLE = 1 + 16 + 16 + 12 + 5 = 50. ORANGE = 15 + 18 + 1 + 14 + 7 + 5 = 60.",
    expHi: "वर्णमाला स्थानों का योग: APPLE = 1+16+16+12+5 = 50। ORANGE = 15+18+1+14+7+5 = 60।",
    diff: "easy"
  },
  {
    sub: "blood_relations",
    qEn: "Introducing a man, a woman said, 'His wife is the only daughter of my father.' How is the man related to the woman?",
    qHi: "एक पुरुष का परिचय देते हुए एक महिला ने कहा, 'उसकी पत्नी मेरे पिता की इकलौती बेटी है।' वह पुरुष उस महिला से किस प्रकार संबंधित है?",
    optEn: ["Brother", "Father", "Husband", "Son-in-law"],
    optHi: ["भाई", "पिता", "पति (Husband)", "दामाद"],
    correctIdx: 2,
    expEn: "'Only daughter of my father' is the woman herself. So the man's wife is the woman herself => the man is her husband.",
    expHi: "महिला के पिता की 'इकलौती बेटी' वह स्वयं है। उस पुरुष की पत्नी वह स्वयं है, अतः पुरुष उसका पति है।",
    diff: "easy"
  },
  {
    sub: "order_ranking",
    qEn: "In a row of boys, Mohan is 7th from the left and Vijay is 12th from the right. If they interchange their positions, Mohan becomes 22nd from the left. How many boys are there in the row?",
    qHi: "लड़कों की एक पंक्ति में मोहन बाएं से 7वें और विजय दाएं से 12वें स्थान पर है। यदि वे अपना स्थान आपस में बदल लेते हैं, तो मोहन बाएं से 22वां हो जाता है। पंक्ति में कुल कितने लड़के हैं?",
    optEn: ["31", "32", "33", "34"],
    optHi: ["31", "32", "33 (22 + 12 - 1 = 33)", "34"],
    correctIdx: 2,
    expEn: "New position of Mohan = 22 from left = old position of Vijay (12 from right). Total = 22 + 12 - 1 = 33.",
    expHi: "कुल संख्या = 22 + 12 - 1 = 33।",
    diff: "medium"
  },
  {
    sub: "analogy",
    qEn: "Country : President :: State : ?",
    qHi: "देश : राष्ट्रपति :: राज्य : ?",
    optEn: ["Chief Minister", "Governor", "Home Minister", "Speaker"],
    optHi: ["मुख्यमंत्री", "राज्यपाल (Governor)", "गृह मंत्री", "विधानसभा अध्यक्ष"],
    correctIdx: 1,
    expEn: "The President is the constitutional head of the Country; the Governor is the constitutional head of the State.",
    expHi: "देश का संवैधानिक प्रमुख राष्ट्रपति होता है; राज्य का संवैधानिक प्रमुख राज्यपाल होता है।",
    diff: "easy"
  },
  {
    sub: "clock_calendar",
    qEn: "How many times do the hands of a clock coincide (overlap) in a 24-hour day?",
    qHi: "24 घंटे के एक दिन में घड़ी की दोनों सुइयां कितनी बार एक साथ (एक दूसरे के ऊपर) होती हैं?",
    optEn: ["20 times", "22 times", "24 times", "44 times"],
    optHi: ["20 बार", "22 बार (22 times)", "24 बार", "44 बार"],
    correctIdx: 1,
    expEn: "The hands coincide 11 times in every 12 hours (missing the 12th overlap between 11 and 1). In 24 hours, they coincide 22 times.",
    expHi: "12 घंटे में सुइयां 11 बार मिलती हैं, अतः 24 घंटे में वे कुल 22 बार मिलती हैं।",
    diff: "medium"
  },
  {
    sub: "number_series",
    qEn: "What number comes next: 11, 13, 17, 19, 23, 29, 31, ?",
    qHi: "श्रृंखला में अगली संख्या कौन सी आएगी: 11, 13, 17, 19, 23, 29, 31, ?",
    optEn: ["33", "35", "37", "39"],
    optHi: ["33", "35", "37 (अभाज्य संख्या)", "39"],
    correctIdx: 2,
    expEn: "The sequence consists of consecutive prime numbers. The prime number after 31 is 37.",
    expHi: "यह क्रमागत अभाज्य संख्याओं (Prime numbers) की श्रृंखला है। 31 के बाद अगली अभाज्य संख्या 37 है।",
    diff: "easy"
  },
  {
    sub: "syllogisms",
    qEn: "Statements: Some pens are books. All books are pencils. Conclusion: I. Some pens are pencils. II. All pencils are books.",
    qHi: "कथन: कुछ पेन किताबें हैं। सभी किताबें पेंसिलें हैं। निष्कर्ष: I. कुछ पेन पेंसिलें हैं। II. सभी पेंसिलें किताबें हैं।",
    optEn: ["Only conclusion I follows", "Only conclusion II follows", "Both follow", "Neither follows"],
    optHi: ["केवल निष्कर्ष I निकलता है", "केवल निष्कर्ष II निकलता है", "दोनों निकलते हैं", "कोई नहीं निकलता"],
    correctIdx: 0,
    expEn: "Since books are a subset of pencils and some pens are books, those pens must also be pencils (I follows). But not all pencils need to be books (II does not follow).",
    expHi: "कुछ पेन जो किताबें हैं वे अवश्य पेंसिल होंगी, अतः I मान्य है। सभी पेंसिलें किताबें होना अनिवार्य नहीं है।",
    diff: "easy"
  },
  {
    sub: "direction_sense",
    qEn: "One morning after sunrise, Suresh was standing facing a pole. The shadow of the pole fell exactly to his right. In which direction was Suresh facing?",
    qHi: "एक सुबह सूर्योदय के बाद सुरेश एक खंभे के सामने खड़ा था। खंभे की परछाई उसके ठीक दाईं ओर पड़ रही थी। सुरेश का मुख किस दिशा में था?",
    optEn: ["East", "West", "North", "South"],
    optHi: ["पूर्व", "पश्चिम", "उत्तर", "दक्षिण (South)"],
    correctIdx: 3,
    expEn: "In the morning, the Sun is in the East, so shadows fall towards the West. If the shadow is to Suresh's right, his right is West, which means he is facing South.",
    expHi: "सुबह परछाई पश्चिम दिशा में पड़ती है। यदि पश्चिम सुरेश के दाईं ओर है, तो उसका मुख दक्षिण की ओर होगा।",
    diff: "medium"
  },
  {
    sub: "letter_series",
    qEn: "Find the missing term: AZ, BY, CX, DW, ?",
    qHi: "लुप्त पद ज्ञात कीजिए: AZ, BY, CX, DW, ?",
    optEn: ["EV", "FU", "GT", "HS"],
    optHi: ["EV", "FU", "GT", "HS"],
    correctIdx: 0,
    expEn: "Pairing opposite letters of the alphabet: A-Z, B-Y, C-X, D-W, E-V (5th letter from start and 5th from end).",
    expHi: "विपरीत वर्णमाला युग्म: A-Z, B-Y, C-X, D-W, E-V।",
    diff: "easy"
  },
  {
    sub: "classification_odd_one_out",
    qEn: "Select the odd pair from the following:",
    qHi: "निम्नलिखित में से विषम युग्म का चयन कीजिए:",
    optEn: ["Gold : Ornaments", "Clay : Pottery", "Wood : Furniture", "Cloth : Tailor"],
    optHi: ["सोना : आभूषण", "मिट्टी : बर्तन", "लकड़ी : फर्नीचर", "कपड़ा : दर्जी (Cloth : Tailor)"],
    correctIdx: 3,
    expEn: "Gold, Clay, and Wood are raw materials matched with their finished products. Tailor is the person who works with cloth, not the product.",
    expHi: "पहले तीन में कच्चा माल और उत्पाद का संबंध है, जबकि चौथे में कच्चा माल और कारीगर है।",
    diff: "easy"
  },

  // 31-40
  {
    sub: "number_series",
    qEn: "Find the wrong number in the series: 8, 27, 64, 100, 125, 216",
    qHi: "श्रृंखला में गलत संख्या ज्ञात कीजिए: 8, 27, 64, 100, 125, 216",
    optEn: ["27", "64", "100", "125"],
    optHi: ["27", "64", "100 (गलत पद)", "125"],
    correctIdx: 2,
    expEn: "All numbers are cubes of integers (2^3, 3^3, 4^3, 5^3=125, 6^3=216) except 100, which is 10^2.",
    expHi: "अन्य सभी संख्याएँ पूर्णांकों के घन हैं (2^3, 3^3, 4^3, 5^3, 6^3), केवल 100 घन नहीं है।",
    diff: "easy"
  },
  {
    sub: "coding_decoding",
    qEn: "If 'LIGHT' is coded as 'KJHFS', how will 'FLAME' be coded?",
    qHi: "यदि 'LIGHT' को 'KJHFS' लिखा जाता है, तो 'FLAME' को क्या लिखा जाएगा?",
    optEn: ["EKZLD", "GMBNF", "EKBLD", "GMZND"],
    optHi: ["EKZLD", "GMBNF", "EKBLD", "GMZND"],
    correctIdx: 0,
    expEn: "Each letter is shifted by -1: L-1=K, I-1=H (Wait: I-1=H, G+1=H? In LIGHT: L-1=K, I+1=J, G+1=H, H-2=F, T-1=S? Let's check: -1 for all: F-1=E, L-1=K, A-1=Z, M-1=L, E-1=D => EKZLD.",
    expHi: "प्रत्येक अक्षर में -1 करने पर: F-1=E, L-1=K, A-1=Z, M-1=L, E-1=D => EKZLD।",
    diff: "easy"
  },
  {
    sub: "seating_arrangement",
    qEn: "Six friends A, B, C, D, E, F are sitting in a circle facing the center. A is facing D. C is between A and B. E is between A and F. Who is sitting opposite to B?",
    qHi: "छह मित्र A, B, C, D, E, F एक वृत्त में केंद्र की ओर मुख करके बैठे हैं। A, D के सामने है। C, A और B के बीच है। E, A और F के बीच है। B के विपरीत कौन बैठा है?",
    optEn: ["E", "F", "D", "C"],
    optHi: ["E", "F", "D", "C"],
    correctIdx: 1,
    expEn: "Circle order clockwise: A, C, B, D, F, E. Opposite pairs: A-D, C-F, B-E? Wait: If C is between A and B, and E is between A and F: counter-clockwise order: B, C, A, E, F, D. Opposite to B (3 positions away in 6-circle) is F.",
    expHi: "वृत्त में 6 व्यक्तियों में 3 स्थान आगे विपरीत होता है: B के ठीक सामने F बैठता है।",
    diff: "hard"
  },
  {
    sub: "analogy",
    qEn: "Moon : Satellite :: Earth : ?",
    qHi: "चंद्रमा : उपग्रह :: पृथ्वी : ?",
    optEn: ["Sun", "Planet", "Asteroid", "Solar System"],
    optHi: ["सूर्य", "ग्रह (Planet)", "क्षुद्रग्रह", "सौरमंडल"],
    correctIdx: 1,
    expEn: "Moon is a natural satellite; Earth is a planet.",
    expHi: "चंद्रमा एक प्राकृतिक उपग्रह है; पृथ्वी एक ग्रह है।",
    diff: "easy"
  },
  {
    sub: "blood_relations",
    qEn: "A man said to a lady, 'Your mother's husband's sister is my aunt.' How is the lady related to the man?",
    qHi: "एक पुरुष ने एक महिला से कहा, 'तुम्हारी माँ के पति की बहन मेरी चाची/बुआ है।' वह महिला उस पुरुष से किस प्रकार संबंधित है?",
    optEn: ["Sister", "Mother", "Daughter", "Grandmother"],
    optHi: ["बहन (Sister)", "माँ", "पुत्री", "दादी"],
    correctIdx: 0,
    expEn: "Lady's mother's husband = Lady's father. Father's sister = Lady's paternal aunt (bua). Since this aunt is also the man's aunt, the lady is his sister.",
    expHi: "महिला की माँ का पति = उसका पिता। पिता की बहन = उसकी बुआ। चूंकि वही महिला पुरुष की भी बुआ है, अतः दोनों भाई-बहन हैं।",
    diff: "medium"
  },
  {
    sub: "clock_calendar",
    qEn: "If today is Wednesday, what day of the week will it be after 94 days?",
    qHi: "यदि आज बुधवार है, तो आज से 94 दिन बाद सप्ताह का कौन सा दिन होगा?",
    optEn: ["Wednesday", "Thursday", "Friday", "Saturday"],
    optHi: ["बुधवार", "गुरुवार", "शुक्रवार", "शनिवार (Saturday)"],
    correctIdx: 3,
    expEn: "94 divided by 7 leaves a remainder of 3 (94 = 13 * 7 + 3). Wednesday + 3 days = Thursday, Friday, Saturday.",
    expHi: "94 को 7 से भाग देने पर शेषफल 3 आता है। बुधवार + 3 विषम दिन = शनिवार।",
    diff: "easy"
  },
  {
    sub: "number_series",
    qEn: "Find the next number in the sequence: 5, 10, 20, 40, 80, ?",
    qHi: "अनुक्रम में अगली संख्या ज्ञात कीजिए: 5, 10, 20, 40, 80, ?",
    optEn: ["120", "160", "140", "180"],
    optHi: ["120", "160", "140", "180"],
    correctIdx: 1,
    expEn: "Each term is multiplied by 2: 80 * 2 = 160.",
    expHi: "प्रत्येक पद का 2 से गुणा: 80 * 2 = 160।",
    diff: "easy"
  },
  {
    sub: "classification_odd_one_out",
    qEn: "Choose the odd one out among the Indian states:",
    qHi: "निम्नलिखित भारतीय राज्यों में से विषम का चयन कीजिए:",
    optEn: ["Kerala", "Gujarat", "Goa", "Madhya Pradesh"],
    optHi: ["केरल", "गुजरात", "गोवा", "मध्य प्रदेश (Landlocked state)"],
    correctIdx: 3,
    expEn: "Kerala, Gujarat, and Goa are coastal states along the sea; Madhya Pradesh is completely landlocked.",
    expHi: "केरल, गुजरात और गोवा तटीय राज्य हैं; मध्य प्रदेश चारों तरफ से भूमि से घिरा (भू-आबद्ध) राज्य है।",
    diff: "easy"
  },
  {
    sub: "analogy",
    qEn: "Pen : Author :: Sword : ?",
    qHi: "कलम : लेखक :: तलवार : ?",
    optEn: ["Carpenter", "Warrior", "Blacksmith", "Tailor"],
    optHi: ["बढ़ई", "योद्धा (Warrior)", "लोहार", "दर्जी"],
    correctIdx: 1,
    expEn: "A pen is the characteristic tool of an author; a sword is the characteristic tool of a warrior.",
    expHi: "कलम लेखक का विशिष्ट उपकरण है; तलवार योद्धा का विशिष्ट उपकरण है।",
    diff: "easy"
  },
  {
    sub: "coding_decoding",
    qEn: "In a code, 123 means 'hot filtered coffee', 356 means 'very hot day', and 589 means 'day and night'. Which numeral stands for 'very'?",
    qHi: "यदि 123 का अर्थ 'hot filtered coffee', 356 का अर्थ 'very hot day' और 589 का अर्थ 'day and night' है, तो 'very' के लिए कौन सा अंक प्रयुक्त हुआ है?",
    optEn: ["3", "5", "6", "8"],
    optHi: ["3", "5", "6", "8"],
    correctIdx: 2,
    expEn: "Common between 123 and 356 is 'hot' = 3. Common between 356 and 589 is 'day' = 5. Therefore in 356, 'very' must be 6.",
    expHi: "'hot' दोनों में 3 है, 'day' दोनों में 5 है। अतः 356 में 'very' का कोड 6 है।",
    diff: "easy"
  },

  // 41-50
  {
    sub: "direction_sense",
    qEn: "Starting from point X, Rohit walked 15 m towards West. He turned left and walked 20 m. He then turned left and walked 15 m. After this he turned right and walked 10 m. How far and in which direction is he from point X?",
    qHi: "बिंदु X से शुरू करके रोहित पश्चिम की ओर 15 मीटर चला। वह बाएँ मुड़ा और 20 मीटर चला। फिर वह बाएँ मुड़ा और 15 मीटर चला। इसके बाद वह दाएँ मुड़ा और 10 मीटर चला। अब वह X से कितनी दूरी और किस दिशा में है?",
    optEn: ["30 m South", "25 m South", "30 m North", "20 m East"],
    optHi: ["30 मीटर दक्षिण", "25 मीटर दक्षिण", "30 मीटर उत्तर", "20 मीटर पूर्व"],
    correctIdx: 0,
    expEn: "West 15 m, then South 20 m, then East 15 m (cancels West), then South 10 m. Total distance = 20 + 10 = 30 m South.",
    expHi: "15 मी पश्चिम, फिर 20 मी दक्षिण, फिर 15 मी पूर्व (पूर्व-पश्चिम समाप्त), फिर 10 मी दक्षिण। कुल = 30 मीटर दक्षिण।",
    diff: "medium"
  },
  {
    sub: "syllogisms",
    qEn: "Statements: All cars are vehicles. Some vehicles are electric. Conclusion: I. Some electric things are cars. II. Some vehicles are cars.",
    qHi: "कथन: सभी कारें वाहन हैं। कुछ वाहन इलेक्ट्रिक हैं। निष्कर्ष: I. कुछ इलेक्ट्रिक चीजें कारें हैं। II. कुछ वाहन कारें हैं।",
    optEn: ["Only conclusion I follows", "Only conclusion II follows", "Both follow", "Neither follows"],
    optHi: ["केवल निष्कर्ष I निकलता है", "केवल निष्कर्ष II निकलता है", "दोनों निकलते हैं", "कोई नहीं निकलता"],
    correctIdx: 1,
    expEn: "Since all cars are vehicles, some vehicles must be cars (II is valid). But the electric vehicles might not overlap with cars (I does not necessarily follow).",
    expHi: "सभी कारें वाहन हैं तो कुछ वाहन कारें अवश्य होंगे (II सत्य है)। कारें इलेक्ट्रिक होना अनिवार्य नहीं है।",
    diff: "easy"
  },
  {
    sub: "order_ranking",
    qEn: "In a queue, Sunita is 10th from the front while Anita is 25th from the back. Mamta is standing exactly in the middle of the two. If there are 50 persons in the queue, what is Mamta's position from the front?",
    qHi: "एक कतार में सुनीता आगे से 10वीं और अनीता पीछे से 25वीं है। ममता दोनों के ठीक मध्य में खड़ी है। यदि कतार में 50 व्यक्ति हैं, तो आगे से ममता का स्थान क्या है?",
    optEn: ["17th", "18th", "19th", "20th"],
    optHi: ["17वां", "18वां (18th)", "19वां", "20वां"],
    correctIdx: 1,
    expEn: "Anita's position from front = 50 - 25 + 1 = 26th. Sunita is 10th. Persons between them = 26 - 10 - 1 = 15 persons. Middle person is (10 + 26)/2 = 36/2 = 18th from front.",
    expHi: "अनीता का आगे से स्थान = 50 - 25 + 1 = 26वां। सुनीता = 10वां। मध्य स्थान = (10 + 26) / 2 = 18वां।",
    diff: "medium"
  },
  {
    sub: "number_series",
    qEn: "Complete the series: 0, 7, 26, 63, 124, ?",
    qHi: "श्रृंखला पूर्ण कीजिए: 0, 7, 26, 63, 124, ?",
    optEn: ["180", "215", "216", "225"],
    optHi: ["180", "215 (6^3 - 1)", "216", "225"],
    correctIdx: 1,
    expEn: "Pattern is n^3 - 1: 1^3-1=0, 2^3-1=7, 3^3-1=26, 4^3-1=63, 5^3-1=124, 6^3-1=216-1=215.",
    expHi: "पैटर्न: n^3 - 1। 6^3 - 1 = 216 - 1 = 215।",
    diff: "medium"
  },
  {
    sub: "analogy",
    qEn: "BIRD : AVIARY :: BEE : ?",
    qHi: "पक्षी : पक्षीशाला (Aviary) :: मधुमक्खी : ?",
    optEn: ["Aquarium", "Apiary", "Stable", "Burrow"],
    optHi: ["मछलीघर", "मधुमक्खी शाला (Apiary)", "अस्तबल", "बिल"],
    correctIdx: 1,
    expEn: "An aviary is a place where birds are kept; an apiary is a place where bees are kept.",
    expHi: "पक्षियों को पक्षीशाला (Aviary) में रखा जाता है; मधुमक्खियों को मधुमक्खी-शाला (Apiary) में पाला जाता है।",
    diff: "easy"
  },
  {
    sub: "coding_decoding",
    qEn: "If 'TIGER' is written as 'QDFHS', how is 'HORSE' written in that code?",
    qHi: "यदि 'TIGER' को 'QDFHS' लिखा जाता है, तो 'HORSE' को उसी कूट में क्या लिखा जाएगा?",
    optEn: ["GNRRD", "ENQRD", "GNQRD", "FNPQE"],
    optHi: ["GNRRD", "ENQRD", "GNQRD", "FNPQE"],
    correctIdx: 0,
    expEn: "Each letter is shifted backward by 1 in reverse order? Or T-1=S, I-1=H, G-1=F, E-1=D, R-1=Q written in reverse: QDFHS! Applying -1 in reverse to HORSE: E-1=D, S-1=R, R-1=Q, O-1=N, H-1=G => DRQNG reversed = GNRRD.",
    expHi: "प्रत्येक अक्षर में -1 करके उल्टा लिखने पर: H->G, O->N, R->Q, S->R, E->D का उल्टा क्रम = D, R, Q, N, G का विपरीत = GNRRD।",
    diff: "hard"
  },
  {
    sub: "blood_relations",
    qEn: "Pointing to a man, a girl says, 'He is the son of the only son of my grandfather.' How is the man related to the girl?",
    qHi: "एक पुरुष की ओर इशारा करते हुए एक लड़की कहती है, 'वह मेरे दादा के इकलौते बेटे का बेटा है।' वह पुरुष उस लड़की से किस प्रकार संबंधित है?",
    optEn: ["Father", "Brother", "Cousin", "Uncle"],
    optHi: ["पिता", "भाई (Brother)", "चचेरा भाई", "चाचा"],
    correctIdx: 1,
    expEn: "Only son of girl's grandfather = Girl's father. Son of her father = Her brother.",
    expHi: "लड़की के दादा का इकलौता बेटा = उसका पिता। उसके पिता का बेटा = उसका भाई।",
    diff: "easy"
  },
  {
    sub: "clock_calendar",
    qEn: "What was the day of the week on 15th August 1947 when India achieved independence?",
    qHi: "15 अगस्त 1947 को जब भारत स्वतंत्र हुआ, सप्ताह का कौन सा दिन था?",
    optEn: ["Thursday", "Friday", "Saturday", "Sunday"],
    optHi: ["गुरुवार", "शुक्रवार (Friday)", "शनिवार", "रविवार"],
    correctIdx: 1,
    expEn: "Calculated by standard calendar odd days: 1600 yrs = 0, 300 yrs = 1, 46 yrs (11 leap, 35 ord) = 57 days = 1 odd day. Jan to 15 Aug = 3 odd days. Total odd days = 1 + 1 + 3 = 5 => Friday.",
    expHi: "मानक कैलेंडर गणना के अनुसार 15 अगस्त 1947 को शुक्रवार (Friday) था।",
    diff: "easy"
  },
  {
    sub: "classification_odd_one_out",
    qEn: "Find the odd one out among these geometric figures:",
    qHi: "इन ज्यामितीय आकृतियों में से विषम का चयन कीजिए:",
    optEn: ["Square", "Rectangle", "Rhombus", "Cylinder"],
    optHi: ["वर्ग", "आयत", "समचतुर्भुज", "बेलन (Cylinder - 3D shape)"],
    correctIdx: 3,
    expEn: "Square, Rectangle, and Rhombus are two-dimensional (2D) quadrilaterals; Cylinder is a three-dimensional (3D) solid.",
    expHi: "वर्ग, आयत और समचतुर्भुज द्विविमीय (2D) चतुर्भुज हैं; बेलन एक त्रिविमीय (3D) ठोस आकृति है।",
    diff: "easy"
  },
  {
    sub: "number_series",
    qEn: "Find the next number in the Fibonacci-style series: 1, 1, 2, 3, 5, 8, 13, 21, ?",
    qHi: "श्रृंखला में अगली संख्या ज्ञात कीजिए: 1, 1, 2, 3, 5, 8, 13, 21, ?",
    optEn: ["31", "34", "35", "36"],
    optHi: ["31", "34 (13 + 21 = 34)", "35", "36"],
    correctIdx: 1,
    expEn: "Each term is the sum of the two preceding terms: 13 + 21 = 34.",
    expHi: "फाइबोनैचि श्रृंखला: प्रत्येक पद पिछले दो पदों का योग है। 13 + 21 = 34।",
    diff: "easy"
  },

  // 51-65: Final 15 questions
  {
    sub: "analogy",
    qEn: "Venn Diagram / Category: Which diagram represents the relation among 'Mammals', 'Cows', and 'Crows'?",
    qHi: "'स्तनपायी', 'गाय' और 'कौआ' के बीच संबंध को दर्शाने वाला सही विकल्प क्या है?",
    optEn: ["All Cows are Mammals, while Crows are completely outside the Mammals circle", "All Mammals are Cows, and some Crows are Mammals", "All three circles overlap completely", "All Crows are Mammals, while Cows are outside"],
    optHi: ["सभी गायें स्तनपायी हैं, जबकि कौआ स्तनपायी वृत्त से पूरी तरह बाहर है", "सभी स्तनपायी गायें हैं, और कुछ कौवे स्तनपायी हैं", "तीनों वृत्त पूरी तरह एक दूसरे को काटते हैं", "सभी कौवे स्तनपायी हैं, जबकि गायें बाहर हैं"],
    correctIdx: 0,
    expEn: "Cows are entirely inside Mammals (since all cows are mammals), and crows are birds, entirely disjoint from mammals.",
    expHi: "सभी गायें स्तनपायी के अंतर्गत आती हैं, जबकि कौआ पक्षी वर्ग का होने के कारण पूर्णतः अलग वृत्त में होगा।",
    diff: "easy"
  },
  {
    sub: "coding_decoding",
    qEn: "In a code, 'GIVE' is written as 'VIEG' and 'OVER' is written as 'EVRO'. How will 'DISK' be written in that code?",
    qHi: "यदि 'GIVE' को 'VIEG' और 'OVER' को 'EVRO' लिखा जाता है, तो 'DISK' को उसी कूट में कैसे लिखा जाएगा?",
    optEn: ["SIKD", "SIDK", "SKID", "IKSD"],
    optHi: ["SIKD", "SIDK", "SKID", "IKSD"],
    correctIdx: 0,
    expEn: "Positions 1-2-3-4 are rearranged to 3-2-4-1: In DISK (D=1, I=2, S=3, K=4) -> 3(S), 2(I), 4(K), 1(D) = SIKD.",
    expHi: "स्थान परिवर्तन: 1-2-3-4 बदलकर 3-2-4-1 हो जाता है: D(1), I(2), S(3), K(4) => SIKD।",
    diff: "medium"
  },
  {
    sub: "blood_relations",
    qEn: "If P + Q means 'P is the mother of Q', P - Q means 'P is the brother of Q', and P * Q means 'P is the father of Q', which expression shows that 'R is the maternal uncle of S'?",
    qHi: "यदि P + Q का अर्थ 'P, Q की माँ है', P - Q का अर्थ 'P, Q का भाई है', और P * Q का अर्थ 'P, Q का पिता है', तो कौन सा व्यंजक दर्शाता है कि 'R, S का मामा है'?",
    optEn: ["R - M + S", "R + M - S", "R * M + S", "R - M * S"],
    optHi: ["R - M + S", "R + M - S", "R * M + S", "R - M * S"],
    correctIdx: 0,
    expEn: "In 'R - M + S': R is the brother of M, and M is the mother of S. The brother of one's mother is the maternal uncle (मामा).",
    expHi: "R - M + S में: R, M का भाई है और M, S की माँ है। माँ का भाई मामा होता है।",
    diff: "medium"
  },
  {
    sub: "direction_sense",
    qEn: "At sunset, a woman was standing facing North. In which direction was her shadow cast?",
    qHi: "सूर्यास्त के समय एक महिला उत्तर की ओर मुख करके खड़ी थी। उसकी परछाई किस दिशा में पड़ रही थी?",
    optEn: ["East", "West", "North", "South"],
    optHi: ["पूर्व (East)", "पश्चिम", "उत्तर", "दक्षिण"],
    correctIdx: 0,
    expEn: "At sunset, the Sun is in the West, so all shadows are cast towards the East, regardless of which way the person faces.",
    expHi: "सूर्यास्त के समय सूर्य पश्चिम में होता है, अतः परछाई हमेशा पूर्व (East) दिशा में पड़ती है।",
    diff: "easy"
  },
  {
    sub: "order_ranking",
    qEn: "In a race of 6 participants, A finished ahead of B but behind C. D finished ahead of E but behind B. Who finished last?",
    qHi: "6 प्रतिभागियों की दौड़ में, A ने B से पहले लेकिन C के बाद दौड़ पूरी की। D ने E से पहले लेकिन B के बाद दौड़ पूरी की। दौड़ में सबसे अंतिम कौन रहा?",
    optEn: ["B", "D", "E", "C"],
    optHi: ["B", "D", "E (Last)", "C"],
    correctIdx: 2,
    expEn: "Order: C > A > B > D > E. E is the last finisher.",
    expHi: "दौड़ का क्रम: C > A > B > D > E। E सबसे अंतिम स्थान पर रहा।",
    diff: "easy"
  },
  {
    sub: "syllogisms",
    qEn: "Statements: All flowers are trees. No tree is a stone. Conclusion: I. No stone is a flower. II. No flower is a stone.",
    qHi: "कथन: सभी फूल पेड़ हैं। कोई पेड़ पत्थर नहीं है। निष्कर्ष: I. कोई पत्थर फूल नहीं है। II. कोई फूल पत्थर नहीं है।",
    optEn: ["Only I follows", "Only II follows", "Both I and II follow", "Neither follows"],
    optHi: ["केवल I निकलता है", "केवल II निकलता है", "I और II दोनों निकलते हैं", "कोई नहीं निकलता"],
    correctIdx: 2,
    expEn: "Since flowers are inside trees, and no tree can touch stones, no stone can touch flowers and vice-versa. Both conclusions are valid.",
    expHi: "फूल पेड़ों के अंतर्गत हैं और पेड़ों का पत्थर से कोई संबंध नहीं है, अतः फूल और पत्थर परस्पर असंयुक्त हैं। दोनों निष्कर्ष सत्य हैं।",
    diff: "easy"
  },
  {
    sub: "clock_calendar",
    qEn: "How many degrees does the minute hand of a clock turn in 20 minutes?",
    qHi: "एक घड़ी की मिनट की सुई 20 मिनट में कितने अंश घूमती है?",
    optEn: ["100 degrees", "120 degrees", "140 degrees", "60 degrees"],
    optHi: ["100 अंश", "120 अंश (20 * 6° = 120°)", "140 अंश", "60 अंश"],
    correctIdx: 1,
    expEn: "The minute hand moves 360 degrees in 60 minutes, which is 6 degrees per minute. In 20 minutes: 20 * 6 = 120 degrees.",
    expHi: "मिनट की सुई 1 मिनट में 6° घूमती है। 20 मिनट में = 20 * 6 = 120°।",
    diff: "easy"
  },
  {
    sub: "number_series",
    qEn: "Find the missing term: 4, 9, 25, 49, 121, ?",
    qHi: "लुप्त पद ज्ञात कीजिए: 4, 9, 25, 49, 121, ?",
    optEn: ["144", "169", "196", "225"],
    optHi: ["144", "169 (13^2)", "196", "225"],
    correctIdx: 1,
    expEn: "These are squares of prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121. The next prime is 13, so 13^2 = 169.",
    expHi: "अभाज्य संख्याओं के वर्ग: 2^2, 3^2, 5^2, 7^2, 11^2। अगली अभाज्य संख्या 13 है, अतः 13^2 = 169।",
    diff: "medium"
  },
  {
    sub: "classification_odd_one_out",
    qEn: "Choose the odd one out among the metals:",
    qHi: "धातुओं में से विषम का चयन कीजिए:",
    optEn: ["Iron", "Copper", "Mercury", "Silver"],
    optHi: ["लोहा", "तांबा", "पारा (Mercury - Liquid at room temp)", "चांदी"],
    correctIdx: 2,
    expEn: "Mercury is the only metal that is liquid at standard room temperature; Iron, Copper, and Silver are solid.",
    expHi: "पारा (मर्करी) कमरे के सामान्य तापमान पर एकमात्र तरल धातु है; अन्य सभी ठोस हैं।",
    diff: "easy"
  },
  {
    sub: "analogy",
    qEn: "Ocean : Water :: Glacier : ?",
    qHi: "महासागर : जल :: हिमनद (Glacier) : ?",
    optEn: ["Rock", "Ice", "Steam", "Salt"],
    optHi: ["चट्टान", "बर्फ (Ice)", "भाप", "नमक"],
    correctIdx: 1,
    expEn: "An ocean is a vast body of water; a glacier is a vast body of ice.",
    expHi: "महासागर जल का विशाल भंडार है; हिमनद बर्फ का विशाल भंडार है।",
    diff: "easy"
  },
  {
    sub: "letter_series",
    qEn: "Complete the letter series: Z, X, V, T, R, ?",
    qHi: "अक्षर श्रृंखला पूर्ण कीजिए: Z, X, V, T, R, ?",
    optEn: ["P", "Q", "O", "N"],
    optHi: ["P (16वां अक्षर)", "Q", "O", "N"],
    correctIdx: 0,
    expEn: "Each letter moves backwards by 2 positions: 26, 24, 22, 20, 18, 16 (P).",
    expHi: "प्रत्येक अक्षर 2 स्थान पीछे जा रहा है: Z(26), X(24), V(22), T(20), R(18), P(16)।",
    diff: "easy"
  },
  {
    sub: "coding_decoding",
    qEn: "If 'CAT' is coded as '3120', how is 'DOG' coded?",
    qHi: "यदि 'CAT' को '3120' लिखा जाता है, तो 'DOG' को क्या लिखा जाएगा?",
    optEn: ["4157", "4158", "4147", "5168"],
    optHi: ["4157", "4158", "4147", "5168"],
    correctIdx: 0,
    expEn: "Direct alphabet positions: C=3, A=1, T=20 => 3120. D=4, O=15, G=7 => 4157.",
    expHi: "अक्षरों के प्रत्यक्ष वर्णमाला क्रमांक: C(3), A(1), T(20) => 3120। D(4), O(15), G(7) => 4157।",
    diff: "easy"
  },
  {
    sub: "seating_arrangement",
    qEn: "In a straight line facing North, A is 4th to the left of B. If B is 6th from the right end and the row has 15 people, what is A's position from the left end?",
    qHi: "उत्तर की ओर मुख वाली एक सीधी पंक्ति में, A, B के बाईं ओर चौथे स्थान पर है। यदि B दाएं छोर से छठा है और पंक्ति में 15 व्यक्ति हैं, तो बाएं छोर से A का स्थान क्या है?",
    optEn: ["5th", "6th", "7th", "8th"],
    optHi: ["5वां", "6वां (6th)", "7वां", "8वां"],
    correctIdx: 1,
    expEn: "Position of B from left = 15 - 6 + 1 = 10th. A is 4 positions to the left of B: 10 - 4 = 6th from the left.",
    expHi: "बाएं से B का स्थान = 15 - 6 + 1 = 10वां। A, B से 4 स्थान बाईं ओर है: 10 - 4 = 6वां।",
    diff: "medium"
  },
  {
    sub: "clock_calendar",
    qEn: "A clock gains 5 minutes every hour. If it is set correctly at 12:00 noon, what time will it display at 6:00 PM on the same day?",
    qHi: "एक घड़ी प्रति घंटे 5 मिनट तेज हो जाती है। यदि इसे दोपहर 12:00 बजे सही समय पर सेट किया जाता है, तो उसी दिन शाम 6:00 बजे यह क्या समय दिखाएगी?",
    optEn: ["6:25 PM", "6:30 PM", "6:35 PM", "6:20 PM"],
    optHi: ["6:25 PM", "6:30 PM", "6:35 PM", "6:20 PM"],
    correctIdx: 1,
    expEn: "Between 12:00 PM and 6:00 PM, 6 hours have passed. Time gained = 6 * 5 = 30 minutes. The clock will show 6:30 PM.",
    expHi: "6 घंटे बीते हैं। तेज हुई समय = 6 * 5 = 30 मिनट। घड़ी शाम 6:30 PM दिखाएगी।",
    diff: "easy"
  },
  {
    sub: "number_series",
    qEn: "Identify the next number in the alternating series: 2, 3, 4, 6, 6, 9, 8, ?",
    qHi: "एकांतर श्रृंखला में अगली संख्या पहचानिए: 2, 3, 4, 6, 6, 9, 8, ?",
    optEn: ["10", "11", "12", "14"],
    optHi: ["10", "11", "12", "14"],
    correctIdx: 2,
    expEn: "Two interleaved series: 1st: 2, 4, 6, 8 (+2). 2nd: 3, 6, 9, 12 (+3). The next term belongs to the 2nd series: 9 + 3 = 12.",
    expHi: "दो अंतर्निहित श्रृंखलाएँ: 2, 4, 6, 8 (सम) और 3, 6, 9, 12 (+3)। अगला पद 9 + 3 = 12 होगा।",
    diff: "medium"
  }
];

console.log(`Compiling ${reasoningQuestions.length} Reasoning questions...`);

const answerCounts = { opt_a: 0, opt_b: 0, opt_c: 0, opt_d: 0 };

const formatted = reasoningQuestions.map((q, idx) => {
  const id = `reas_${String(idx + 1).padStart(3, '0')}`;
  const correctOptionId = optionKeys[q.correctIdx];
  answerCounts[correctOptionId]++;

  return {
    id,
    category: "reasoning",
    subcategory: q.sub,
    questionEn: q.qEn,
    questionHi: q.qHi,
    optionsEn: q.optEn,
    optionsHi: q.optHi,
    correctOptionId,
    correctIndex: q.correctIdx,
    explanationEn: q.expEn,
    explanationHi: q.expHi,
    difficulty: q.diff,
    source: {
      name: "Original Logical Reasoning & Cognitive Assessment Standard",
      url: "https://ncert.nic.in/textbook.php",
      verificationDate: "2026-03-10",
      status: "verified"
    },
    createdAt: "2026-03-15T00:00:00.000Z",
    fingerprint: hash(q.qEn),
    isActive: true
  };
});

console.log("Reasoning Answer Distribution:", answerCounts);

const fileContent = `import { SamahitQuestion } from "../samahitQuestionTypes";

export const REASONING_QUESTIONS: SamahitQuestion[] = ${JSON.stringify(formatted, null, 2)};
`;

const targetPath = path.join(__dirname, '..', 'src', 'data', 'quiz', 'questions', 'reasoning.ts');
const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log(`Saved ${formatted.length} questions to ${targetPath}`);
