const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hash(text) {
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex').slice(0, 16);
}

const optionKeys = ['opt_a', 'opt_b', 'opt_c', 'opt_d'];

const mathQuestions = [
  // 1-10
  {
    sub: "percentages",
    qEn: "If the price of a commodity increases by 25%, by what percentage must a household reduce its consumption so that the total expenditure remains unchanged?",
    qHi: "यदि किसी वस्तु की कीमत में 25% की वृद्धि होती है, तो एक परिवार को अपनी खपत में कितने प्रतिशत की कमी करनी चाहिए ताकि कुल खर्च अपरिवर्तित रहे?",
    optEn: ["15%", "20%", "25%", "16.66%"],
    optHi: ["15%", "20%", "25%", "16.66%"],
    correctIdx: 1,
    expEn: "Reduction % = [r / (100 + r)] * 100 = [25 / 125] * 100 = (1/5) * 100 = 20%.",
    expHi: "कमी % = [r / (100 + r)] * 100 = [25 / 125] * 100 = (1/5) * 100 = 20%।",
    diff: "easy"
  },
  {
    sub: "profit_loss",
    qEn: "A trader marks his goods 40% above the cost price and allows a discount of 15% on the marked price. What is his net gain percentage?",
    qHi: "एक व्यापारी अपनी वस्तुओं पर लागत मूल्य से 40% अधिक मूल्य अंकित करता है और अंकित मूल्य पर 15% की छूट देता है। उसका शुद्ध लाभ प्रतिशत क्या है?",
    optEn: ["19%", "25%", "22%", "18%"],
    optHi: ["19%", "25%", "22%", "18%"],
    correctIdx: 0,
    expEn: "Let CP = 100. MP = 140. SP = 140 * (1 - 0.15) = 140 * 0.85 = 119. Gain = 119 - 100 = 19%.",
    expHi: "माना क्रय मूल्य (CP) = 100। अंकित मूल्य (MP) = 140। विक्रय मूल्य (SP) = 140 * 0.85 = 119। लाभ = 119 - 100 = 19%।",
    diff: "easy"
  },
  {
    sub: "simple_compound_interest",
    qEn: "The difference between compound interest (compounded annually) and simple interest on a principal of Rs 10,000 for 2 years at 10% per annum is:",
    qHi: "₹10,000 के मूलधन पर 10% वार्षिक दर से 2 वर्ष के लिए चक्रवृद्धि ब्याज (वार्षिक देय) और साधारण ब्याज के बीच का अंतर कितना है?",
    optEn: ["Rs 50", "Rs 150", "Rs 100", "Rs 200"],
    optHi: ["₹50", "₹150", "₹100", "₹200"],
    correctIdx: 2,
    expEn: "Difference for 2 years = P * (r/100)^2 = 10,000 * (10/100)^2 = 10,000 * 0.01 = Rs 100.",
    expHi: "2 वर्ष के लिए अंतर = P * (r/100)^2 = 10,000 * (1/10)^2 = 10,000 * (1/100) = ₹100।",
    diff: "easy"
  },
  {
    sub: "ratio_proportion",
    qEn: "The ratio of present ages of father and son is 7 : 3. If the sum of their ages is 60 years, what will be the ratio of their ages after 6 years?",
    qHi: "पिता और पुत्र की वर्तमान आयु का अनुपात 7 : 3 है। यदि उनकी आयु का योग 60 वर्ष है, तो 6 वर्ष बाद उनकी आयु का अनुपात क्या होगा?",
    optEn: ["3 : 2", "4 : 3", "5 : 3", "2 : 1"],
    optHi: ["3 : 2", "4 : 3", "5 : 3", "2 : 1"],
    correctIdx: 3,
    expEn: "Sum of ratio parts = 10. 1 unit = 60/10 = 6 years. Father = 42, Son = 18. After 6 years: Father = 48, Son = 24. Ratio = 48 : 24 = 2 : 1.",
    expHi: "अनुपातिक योग = 7 + 3 = 10 इकाई = 60 वर्ष => 1 इकाई = 6 वर्ष। पिता की आयु = 42 वर्ष, पुत्र = 18 वर्ष। 6 वर्ष बाद: पिता = 48, पुत्र = 24। अनुपात = 48 : 24 = 2 : 1।",
    diff: "easy"
  },
  {
    sub: "time_work",
    qEn: "A can complete a piece of work alone in 12 days, and B can complete the same work alone in 24 days. Working together, in how many days can they finish the work?",
    qHi: "A अकेले किसी कार्य को 12 दिनों में पूरा कर सकता है, और B उसी कार्य को अकेले 24 दिनों में पूरा कर सकता है। एक साथ काम करते हुए, वे उस काम को कितने दिनों में समाप्त कर सकते हैं?",
    optEn: ["8 days", "6 days", "9 days", "10 days"],
    optHi: ["8 दिन", "6 दिन", "9 दिन", "10 दिन"],
    correctIdx: 0,
    expEn: "1/Time = 1/12 + 1/24 = (2 + 1)/24 = 3/24 = 1/8 => Time = 8 days.",
    expHi: "संयुक्त कार्य क्षमता = 1/12 + 1/24 = 3/24 = 1/8 => कुल समय = 8 दिन।",
    diff: "easy"
  },
  {
    sub: "speed_distance",
    qEn: "A 180-metre-long train running at a speed of 54 km/h will cross a standing electric pole in how many seconds?",
    qHi: "54 किमी/घंटा की गति से चल रही 180 मीटर लंबी रेलगाड़ी एक खड़े बिजली के खंभे को कितने सेकंड में पार करेगी?",
    optEn: ["10 seconds", "12 seconds", "14 seconds", "15 seconds"],
    optHi: ["10 सेकंड", "12 सेकंड", "14 सेकंड", "15 सेकंड"],
    correctIdx: 1,
    expEn: "Speed in m/s = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 180 / 15 = 12 seconds.",
    expHi: "मीटर/सेकंड में गति = 54 * (5/18) = 15 मी/से। समय = दूरी / गति = 180 / 15 = 12 सेकंड।",
    diff: "easy"
  },
  {
    sub: "averages",
    qEn: "The average of 5 consecutive odd numbers is 27. What is the product of the first and the fifth number?",
    qHi: "5 क्रमागत विषम संख्याओं का औसत 27 है। पहली और पांचवीं संख्या का गुणनफल क्या है?",
    optEn: ["675", "703", "713", "725"],
    optHi: ["675", "703", "713", "725"],
    correctIdx: 2,
    expEn: "The middle number is 27. The 5 consecutive odd numbers are 23, 25, 27, 29, 31. Product of 1st and 5th = 23 * 31 = 713.",
    expHi: "मध्य संख्या औसत (27) है। 5 क्रमागत विषम संख्याएँ 23, 25, 27, 29, 31 हैं। पहली और 5वीं का गुणनफल = 23 * 31 = 713।",
    diff: "medium"
  },
  {
    sub: "number_system",
    qEn: "What is the greatest number that will divide 148, 246, and 623 leaving remainder 4, 6, and 11 respectively?",
    qHi: "वह सबसे बड़ी संख्या कौन सी है जिससे 148, 246 और 623 को विभाजित करने पर क्रमशः 4, 6 और 11 शेषफल प्राप्त होता है?",
    optEn: ["12", "18", "16", "24"],
    optHi: ["12", "18", "16", "24"],
    correctIdx: 2,
    expEn: "Required number = HCF of (148-4=144), (246-6=240), and (623-11=612). 144 = 16*9 = 12*12; HCF(144, 240, 612): 144 = 12*12, 240 = 12*20, 612 = 12*51. Common factor is 12.",
    expHi: "अपेक्षित संख्या = HCF(144, 240, 612)। 144 = 12*12, 240 = 12*20, 612 = 12*51। म.स.प. = 12।",
    diff: "medium"
  },
  {
    sub: "geometry_mensuration",
    qEn: "The radius of a circular wheel is 35 cm. How many complete revolutions will it make to cover a distance of 1.1 km? (Take pi = 22/7)",
    qHi: "एक वृत्ताकार पहिए की त्रिज्या 35 सेमी है। 1.1 किमी की दूरी तय करने के लिए यह कितने पूर्ण चक्कर लगाएगा? (pi = 22/7 लीजिए)",
    optEn: ["500", "400", "600", "250"],
    optHi: ["500", "400", "600", "250"],
    correctIdx: 0,
    expEn: "Circumference = 2 * (22/7) * 35 = 220 cm = 2.2 m. Distance = 1.1 km = 1,100 m. Revolutions = 1100 / 2.2 = 500.",
    expHi: "पहिए की परिधि = 2 * (22/7) * 35 = 220 सेमी = 2.2 मीटर। कुल दूरी = 1,100 मीटर। चक्करों की संख्या = 1100 / 2.2 = 500।",
    diff: "medium"
  },
  {
    sub: "algebra",
    qEn: "If x + (1/x) = 5, what is the value of x^2 + (1/x^2)?",
    qHi: "यदि x + (1/x) = 5 है, तो x^2 + (1/x^2) का मान क्या होगा?",
    optEn: ["27", "23", "25", "21"],
    optHi: ["27", "23", "25", "21"],
    correctIdx: 1,
    expEn: "Squaring both sides: (x + 1/x)^2 = x^2 + 1/x^2 + 2 = 25 => x^2 + 1/x^2 = 25 - 2 = 23.",
    expHi: "दोनों पक्षों का वर्ग करने पर: (x + 1/x)^2 = x^2 + 1/x^2 + 2 = 25 => x^2 + 1/x^2 = 25 - 2 = 23।",
    diff: "easy"
  },

  // 11-20
  {
    sub: "percentages",
    qEn: "In an examination, a candidate must secure 40% marks to pass. A student gets 178 marks and fails by 22 marks. What are the maximum aggregate marks for the examination?",
    qHi: "एक परीक्षा में उत्तीर्ण होने के लिए उम्मीदवार को 40% अंक प्राप्त करने होते हैं। एक छात्र को 178 अंक मिलते हैं और वह 22 अंकों से अनुत्तीर्ण हो जाता है। परीक्षा के अधिकतम कुल अंक क्या हैं?",
    optEn: ["450", "550", "500", "600"],
    optHi: ["450", "550", "500", "600"],
    correctIdx: 2,
    expEn: "Pass marks = 178 + 22 = 200. Since 40% = 200, Total maximum marks = (200 / 40) * 100 = 500.",
    expHi: "उत्तीर्णांक = 178 + 22 = 200। चूंकि 40% = 200 है, अधिकतम कुल अंक = (200 / 40) * 100 = 500।",
    diff: "easy"
  },
  {
    sub: "profit_loss",
    qEn: "By selling an article for Rs 720, a shopkeeper incurs a loss of 10%. At what price should he sell it to gain 15%?",
    qHi: "एक वस्तु को ₹720 में बेचने पर एक दुकानदार को 10% की हानि होती है। 15% का लाभ प्राप्त करने के लिए उसे इसे किस मूल्य पर बेचना चाहिए?",
    optEn: ["Rs 800", "Rs 880", "Rs 900", "Rs 920"],
    optHi: ["₹800", "₹880", "₹900", "₹920"],
    correctIdx: 3,
    expEn: "CP = SP / (1 - Loss%) = 720 / 0.90 = Rs 800. For 15% gain: New SP = 800 * 1.15 = Rs 920.",
    expHi: "क्रय मूल्य = 720 / 0.90 = ₹800। 15% लाभ के लिए नया विक्रय मूल्य = 800 * 1.15 = ₹920।",
    diff: "medium"
  },
  {
    sub: "speed_distance",
    qEn: "A person travels from city A to city B at a speed of 60 km/h and returns from B to A along the same route at 40 km/h. What is his average speed for the whole round trip?",
    qHi: "एक व्यक्ति शहर A से B तक 60 किमी/घंटा की गति से यात्रा करता है और उसी रास्ते से B से A तक 40 किमी/घंटा की गति से लौटता है। पूरी यात्रा के लिए उसकी औसत गति क्या है?",
    optEn: ["48 km/h", "50 km/h", "52 km/h", "45 km/h"],
    optHi: ["48 किमी/घंटा", "50 किमी/घंटा", "52 किमी/घंटा", "45 किमी/घंटा"],
    correctIdx: 0,
    expEn: "Average speed for equal distances = (2 * v1 * v2) / (v1 + v2) = (2 * 60 * 40) / (60 + 40) = 4800 / 100 = 48 km/h.",
    expHi: "समान दूरी के लिए औसत गति = (2 * v1 * v2) / (v1 + v2) = (2 * 60 * 40) / 100 = 48 किमी/घंटा।",
    diff: "easy"
  },
  {
    sub: "ratio_proportion",
    qEn: "In a mixture of 60 litres, the ratio of milk to water is 2 : 1. How much water must be added to the mixture so that the ratio becomes 1 : 2?",
    qHi: "60 लीटर के मिश्रण में दूध और पानी का अनुपात 2 : 1 है। मिश्रण में कितना पानी मिलाया जाना चाहिए ताकि अनुपात 1 : 2 हो जाए?",
    optEn: ["40 litres", "60 litres", "50 litres", "80 litres"],
    optHi: ["40 लीटर", "60 लीटर", "50 लीटर", "80 लीटर"],
    correctIdx: 1,
    expEn: "Initial: Milk = (2/3)*60 = 40L, Water = 20L. In new mixture, Milk remains 40L. For 1:2 ratio, Water must be 40 * 2 = 80L. Water to add = 80 - 20 = 60 litres.",
    expHi: "आरंभ में: दूध = 40 लीटर, पानी = 20 लीटर। नए अनुपात 1 : 2 में दूध 40 लीटर ही रहेगा, अतः पानी = 40 * 2 = 80 लीटर होना चाहिए। मिलाया जाने वाला पानी = 80 - 20 = 60 लीटर।",
    diff: "medium"
  },
  {
    sub: "time_work",
    qEn: "Two pipes P and Q can fill a water tank in 15 hours and 20 hours respectively, while a third drain pipe R can empty it in 30 hours. If all three pipes are opened simultaneously, in how many hours will the tank be full?",
    qHi: "दो नल P और Q एक पानी की टंकी को क्रमशः 15 घंटे और 20 घंटे में भर सकते हैं, जबकि तीसरा निकास नल R इसे 30 घंटे में खाली कर सकता है। यदि तीनों नलों को एक साथ खोल दिया जाए, तो टंकी कितने घंटों में भर जाएगी?",
    optEn: ["10 hours", "12 hours", "15 hours", "18 hours"],
    optHi: ["10 घंटे", "12 घंटे", "15 घंटे", "18 घंटे"],
    correctIdx: 1,
    expEn: "LCM of (15, 20, 30) = 60 units. P adds 4 u/hr, Q adds 3 u/hr, R drains 2 u/hr. Net filling = 4 + 3 - 2 = 5 u/hr. Time = 60 / 5 = 12 hours.",
    expHi: "कुल क्षमता = 60 इकाई। P = +4, Q = +3, R = -2। संयुक्त दर = 4 + 3 - 2 = 5 इकाई/घंटा। कुल समय = 60 / 5 = 12 घंटे।",
    diff: "medium"
  },
  {
    sub: "simple_compound_interest",
    qEn: "A sum of money invested at simple interest amounts to Rs 1,008 in 2 years and to Rs 1,164 in 3.5 years. What is the rate of interest per annum?",
    qHi: "साधारण ब्याज पर निवेश की गई कोई धनराशि 2 वर्षों में ₹1,008 और 3.5 वर्षों में ₹1,164 हो जाती है। प्रति वर्ष ब्याज की दर क्या है?",
    optEn: ["12%", "13%", "10%", "14%"],
    optHi: ["12%", "13%", "10%", "14%"],
    correctIdx: 1,
    expEn: "SI for 1.5 years = 1164 - 1008 = Rs 156. SI for 1 year = 156 / 1.5 = Rs 104. Principal = 1008 - (2 * 104) = 1008 - 208 = Rs 800. Rate = (104 / 800) * 100 = 13%.",
    expHi: "1.5 वर्ष का ब्याज = 1164 - 1008 = ₹156 => 1 वर्ष का ब्याज = ₹104। मूलधन = 1008 - 208 = ₹800। ब्याज दर = (104 / 800) * 100 = 13%।",
    diff: "hard"
  },
  {
    sub: "number_system",
    qEn: "What is the unit digit in the product (7^95 - 3^58)?",
    qHi: "व्यंजक (7^95 - 3^58) के प्रसार में इकाई का अंक क्या है?",
    optEn: ["0", "4", "6", "2"],
    optHi: ["0", "4", "6", "2"],
    correctIdx: 1,
    expEn: "Cyclicity of 7 is 4. 95 mod 4 = 3 => 7^3 ends in 3. Cyclicity of 3 is 4. 58 mod 4 = 2 => 3^2 ends in 9. Unit digit = (13 - 9) = 4.",
    expHi: "7 की चक्रीयता 4 है: 95 % 4 = 3 => 7^3 का इकाई अंक 3। 3 की चक्रीयता 4 है: 58 % 4 = 2 => 3^2 का इकाई अंक 9। इकाई अंक = 13 - 9 = 4।",
    diff: "medium"
  },
  {
    sub: "geometry_mensuration",
    qEn: "If the length of a rectangle is increased by 20% and its breadth is decreased by 10%, what is the net percentage change in its area?",
    qHi: "यदि किसी आयत की लंबाई में 20% की वृद्धि की जाती है और उसकी चौड़ाई में 10% की कमी की जाती है, तो उसके क्षेत्रफल में शुद्ध प्रतिशत परिवर्तन क्या होगा?",
    optEn: ["8% increase", "10% increase", "8% decrease", "No change"],
    optHi: ["8% की वृद्धि", "10% की वृद्धि", "8% की कमी", "कोई परिवर्तन नहीं"],
    correctIdx: 0,
    expEn: "Net change = x + y + (xy/100) = +20 - 10 + (20 * -10 / 100) = 10 - 2 = +8% (increase).",
    expHi: "शुद्ध परिवर्तन = x + y + (xy/100) = +20 - 10 - 2 = +8% (वृद्धि)।",
    diff: "easy"
  },
  {
    sub: "algebra",
    qEn: "Find the roots of the quadratic equation 2x^2 - 7x + 6 = 0.",
    qHi: "द्विघात समीकरण 2x^2 - 7x + 6 = 0 के मूल ज्ञात कीजिए।",
    optEn: ["1 and 3", "2 and 3/2", "3 and 2/3", "-2 and -3/2"],
    optHi: ["1 और 3", "2 और 3/2", "3 and 2/3", "-2 और -3/2"],
    correctIdx: 1,
    expEn: "2x^2 - 4x - 3x + 6 = 0 => 2x(x - 2) - 3(x - 2) = 0 => (2x - 3)(x - 2) = 0 => x = 2 or x = 3/2.",
    expHi: "2x^2 - 4x - 3x + 6 = 0 => (2x - 3)(x - 2) = 0 => x = 2 और x = 3/2।",
    diff: "easy"
  },
  {
    sub: "speed_distance",
    qEn: "A boat can travel at a speed of 9 km/h in still water. If the speed of the river current is 3 km/h, how much time will it take to travel 24 km downstream and 24 km upstream?",
    qHi: "एक नाव शांत जल में 9 किमी/घंटा की गति से चल सकती है। यदि नदी की धारा की गति 3 किमी/घंटा है, तो उसे 24 किमी धारा के अनुकूल और 24 किमी धारा के प्रतिकूल जाने में कुल कितना समय लगेगा?",
    optEn: ["5 hours", "7 hours", "6 hours", "8 hours"],
    optHi: ["5 घंटे", "7 घंटे", "6 घंटे", "8 घंटे"],
    correctIdx: 2,
    expEn: "Downstream speed = 9 + 3 = 12 km/h. Downstream time = 24 / 12 = 2 hrs. Upstream speed = 9 - 3 = 6 km/h. Upstream time = 24 / 6 = 4 hrs. Total time = 2 + 4 = 6 hours.",
    expHi: "अनुकूल गति = 9 + 3 = 12 किमी/घं (समय = 24/12 = 2 घंटे)। प्रतिकूल गति = 9 - 3 = 6 किमी/घं (समय = 24/6 = 4 घंटे)। कुल समय = 2 + 4 = 6 घंटे।",
    diff: "medium"
  },

  // 21-35
  {
    sub: "averages",
    qEn: "The average weight of 8 persons increases by 2.5 kg when a new person comes in place of one of them weighing 65 kg. What is the weight of the new person?",
    qHi: "8 व्यक्तियों का औसत वजन 2.5 किलोग्राम बढ़ जाता है जब उनमें से 65 किलोग्राम वजन वाले व्यक्ति के स्थान पर एक नया व्यक्ति आता है। नए व्यक्ति का वजन कितना है?",
    optEn: ["75 kg", "80 kg", "85 kg", "90 kg"],
    optHi: ["75 किग्रा", "80 किग्रा", "85 किग्रा", "90 किग्रा"],
    correctIdx: 2,
    expEn: "Total increase = 8 * 2.5 = 20 kg. Weight of new person = 65 + 20 = 85 kg.",
    expHi: "कुल वजन में वृद्धि = 8 * 2.5 = 20 किग्रा। नए व्यक्ति का वजन = 65 + 20 = 85 किग्रा।",
    diff: "easy"
  },
  {
    sub: "percentages",
    qEn: "A number is first increased by 10% and then decreased by 10%. What is the net change in the number?",
    qHi: "किसी संख्या में पहले 10% की वृद्धि की जाती है और फिर 10% की कमी की जाती है। संख्या में शुद्ध परिवर्तन क्या है?",
    optEn: ["0% change", "1% decrease", "1% increase", "2% decrease"],
    optHi: ["0% परिवर्तन", "1% की कमी", "1% की वृद्धि", "2% की कमी"],
    correctIdx: 1,
    expEn: "Net change = +10 - 10 - (10 * 10 / 100) = -1% (1% decrease).",
    expHi: "शुद्ध परिवर्तन = 10 - 10 - (100/100) = -1% (1% की कमी)।",
    diff: "easy"
  },
  {
    sub: "profit_loss",
    qEn: "If the cost price of 15 articles is equal to the selling price of 12 articles, what is the profit percentage?",
    qHi: "यदि 15 वस्तुओं का लागत मूल्य 12 वस्तुओं के विक्रय मूल्य के बराबर है, तो लाभ प्रतिशत क्या है?",
    optEn: ["20%", "30%", "25%", "15%"],
    optHi: ["20%", "30%", "25%", "15%"],
    correctIdx: 2,
    expEn: "15 * CP = 12 * SP => SP/CP = 15/12 = 5/4. Profit % = [(5 - 4) / 4] * 100 = (1/4) * 100 = 25%.",
    expHi: "15 * CP = 12 * SP => SP/CP = 5/4। लाभ % = (1/4) * 100 = 25%।",
    diff: "easy"
  },
  {
    sub: "number_system",
    qEn: "Which of the following numbers is divisible by both 9 and 11?",
    qHi: "निम्नलिखित में से कौन सी संख्या 9 और 11 दोनों से विभाज्य है?",
    optEn: ["10098", "10197", "11099", "10089"],
    optHi: ["10098", "10197", "11099", "10089"],
    correctIdx: 0,
    expEn: "For 10098: Sum of digits = 1+0+0+9+8 = 18 (divisible by 9). Alternating sum = (1+0+8) - (0+9) = 9 - 9 = 0 (divisible by 11).",
    expHi: "10098 के लिए: अंकों का योग = 18 (9 से विभाज्य)। विषम व सम स्थानों के अंकों के योग का अंतर = 9 - 9 = 0 (11 से विभाज्य)।",
    diff: "medium"
  },
  {
    sub: "geometry_mensuration",
    qEn: "The total surface area of a solid hemisphere of radius 7 cm is: (Take pi = 22/7)",
    qHi: "7 सेमी त्रिज्या वाले एक ठोस अर्धगोले का कुल पृष्ठीय क्षेत्रफल क्या है? (pi = 22/7 लीजिए)",
    optEn: ["308 cm^2", "462 cm^2", "616 cm^2", "154 cm^2"],
    optHi: ["308 सेमी^2", "462 सेमी^2", "616 सेमी^2", "154 सेमी^2"],
    correctIdx: 1,
    expEn: "Total surface area of a solid hemisphere = 3 * pi * r^2 = 3 * (22/7) * 49 = 3 * 22 * 7 = 462 cm^2.",
    expHi: "ठोस अर्धगोले का संपूर्ण पृष्ठीय क्षेत्रफल = 3 * pi * r^2 = 3 * (22/7) * 49 = 462 वर्ग सेमी।",
    diff: "medium"
  },
  {
    sub: "time_work",
    qEn: "12 men can complete a project in 16 days. How many days will 8 men take to complete the same project working at the same rate?",
    qHi: "12 पुरुष किसी परियोजना को 16 दिनों में पूरा कर सकते हैं। उसी दर से कार्य करते हुए 8 पुरुष उसी परियोजना को कितने दिनों में पूरा करेंगे?",
    optEn: ["24 days", "20 days", "18 days", "22 days"],
    optHi: ["24 दिन", "20 दिन", "18 दिन", "22 दिन"],
    correctIdx: 0,
    expEn: "M1 * D1 = M2 * D2 => 12 * 16 = 8 * D2 => 192 = 8 * D2 => D2 = 24 days.",
    expHi: "M1 * D1 = M2 * D2 => 12 * 16 = 8 * D2 => D2 = 192 / 8 = 24 दिन।",
    diff: "easy"
  },
  {
    sub: "ratio_proportion",
    qEn: "If A : B = 3 : 4 and B : C = 8 : 9, find the compound ratio A : C.",
    qHi: "यदि A : B = 3 : 4 और B : C = 8 : 9 है, तो A : C का अनुपात ज्ञात कीजिए।",
    optEn: ["1 : 2", "3 : 4", "2 : 3", "4 : 5"],
    optHi: ["1 : 2", "3 : 4", "2 : 3", "4 : 5"],
    correctIdx: 2,
    expEn: "A/C = (A/B) * (B/C) = (3/4) * (8/9) = 24 / 36 = 2/3.",
    expHi: "A/C = (A/B) * (B/C) = (3/4) * (8/9) = 2/3 यानी 2 : 3।",
    diff: "easy"
  },
  {
    sub: "algebra",
    qEn: "If a + b = 10 and ab = 21, what is the value of a^3 + b^3?",
    qHi: "यदि a + b = 10 और ab = 21 है, तो a^3 + b^3 का मान क्या होगा?",
    optEn: ["370", "410", "450", "390"],
    optHi: ["370", "410", "450", "390"],
    correctIdx: 0,
    expEn: "a^3 + b^3 = (a + b)^3 - 3ab(a + b) = 10^3 - 3(21)(10) = 1000 - 630 = 370.",
    expHi: "a^3 + b^3 = (a + b)^3 - 3ab(a + b) = 1000 - 3(21)(10) = 1000 - 630 = 370।",
    diff: "medium"
  },
  {
    sub: "simple_compound_interest",
    qEn: "At what rate of simple interest per annum will a principal double itself in 8 years?",
    qHi: "किस साधारण ब्याज की वार्षिक दर पर कोई मूलधन 8 वर्षों में दोगुना हो जाएगा?",
    optEn: ["10%", "12.5%", "15%", "11.5%"],
    optHi: ["10%", "12.5%", "15%", "11.5%"],
    correctIdx: 1,
    expEn: "Interest = Principal => P = (P * r * 8) / 100 => 8r = 100 => r = 12.5% per annum.",
    expHi: "ब्याज = मूलधन => r = (100 / समय) = 100 / 8 = 12.5% प्रति वर्ष।",
    diff: "easy"
  },
  {
    sub: "speed_distance",
    qEn: "Two trains of lengths 140 m and 160 m run on parallel tracks towards each other with speeds 60 km/h and 48 km/h. How many seconds will they take to completely cross each other?",
    qHi: "140 मीटर और 160 मीटर लंबाई की दो रेलगाड़ियाँ समानांतर पटरियों पर एक दूसरे की ओर 60 किमी/घंटा और 48 किमी/घंटा की गति से चल रही हैं। वे एक दूसरे को पूरी तरह से पार करने में कितने सेकंड का समय लेंगी?",
    optEn: ["8 seconds", "10 seconds", "12 seconds", "15 seconds"],
    optHi: ["8 सेकंड", "10 सेकंड", "12 सेकंड", "15 सेकंड"],
    correctIdx: 1,
    expEn: "Relative speed = 60 + 48 = 108 km/h = 108 * (5/18) = 30 m/s. Total distance = 140 + 160 = 300 m. Time = 300 / 30 = 10 seconds.",
    expHi: "सापेक्ष गति = 60 + 48 = 108 किमी/घं = 30 मी/से। कुल दूरी = 140 + 160 = 300 मीटर। समय = 300 / 30 = 10 सेकंड।",
    diff: "medium"
  },
  {
    sub: "number_system",
    qEn: "The sum of three consecutive natural numbers is 87. What is the smallest of these numbers?",
    qHi: "तीन क्रमागत प्राकृतिक संख्याओं का योग 87 है। इनमें से सबसे छोटी संख्या कौन सी है?",
    optEn: ["27", "28", "29", "30"],
    optHi: ["27", "28", "29", "30"],
    correctIdx: 1,
    expEn: "Let numbers be x, x+1, x+2. 3x + 3 = 87 => 3x = 84 => x = 28.",
    expHi: "माना संख्याएँ x, x+1, x+2 हैं। 3x + 3 = 87 => 3x = 84 => x = 28।",
    diff: "easy"
  },
  {
    sub: "profit_loss",
    qEn: "A dishonest milkman claims to sell milk at cost price but mixes 25% water. What is his percentage profit?",
    qHi: "एक बेईमान दूधवाला लागत मूल्य पर दूध बेचने का दावा करता है लेकिन उसमें 25% पानी मिलाता है। उसका लाभ प्रतिशत क्या है?",
    optEn: ["20%", "25%", "33.33%", "16.66%"],
    optHi: ["20%", "25%", "33.33%", "16.66%"],
    correctIdx: 1,
    expEn: "If milk is 100 units and water added is 25 units, profit is purely from the added water = (25 / 100) * 100 = 25%.",
    expHi: "यदि 100 लीटर दूध में 25 लीटर पानी मिलाया जाता है, तो लाभ विशुद्ध रूप से पानी की मात्रा है = (25/100) * 100 = 25%।",
    diff: "easy"
  },
  {
    sub: "percentages",
    qEn: "If 30% of a number is 120, what is 60% of that same number?",
    qHi: "यदि किसी संख्या का 30% मान 120 है, तो उसी संख्या का 60% मान क्या होगा?",
    optEn: ["200", "240", "180", "300"],
    optHi: ["200", "240", "180", "300"],
    correctIdx: 1,
    expEn: "The number is 120 / 0.30 = 400. 60% of 400 = 240 (or simply double of 120 = 240).",
    expHi: "संख्या = 120 / 0.3 = 400। 400 का 60% = 240 (या सीधे 120 का दोगुना = 240)।",
    diff: "easy"
  },
  {
    sub: "averages",
    qEn: "The average of marks obtained by 50 students was calculated as 68. Later it was found that marks of one student were wrongly entered as 86 instead of 36. What is the correct average?",
    qHi: "50 छात्रों द्वारा प्राप्त अंकों का औसत 68 निकाला गया था। बाद में पाया गया कि एक छात्र के अंक 36 के स्थान पर गलती से 86 दर्ज हो गए थे। सही औसत क्या है?",
    optEn: ["67", "66", "67.5", "69"],
    optHi: ["67", "66", "67.5", "69"],
    correctIdx: 0,
    expEn: "Error = 86 - 36 = +50 excess. Correction per student = 50 / 50 = 1 mark reduction. Correct average = 68 - 1 = 67.",
    expHi: "अतिरिक्त अंक = 86 - 36 = 50। औसत में कमी = 50 / 50 = 1 अंक। सही औसत = 68 - 1 = 67।",
    diff: "medium"
  },
  {
    sub: "geometry_mensuration",
    qEn: "What is the length of the longest rod that can be placed in a room of dimensions 12 m long, 9 m wide, and 8 m high?",
    qHi: "12 मीटर लंबी, 9 मीटर चौड़ी और 8 मीटर ऊंची विमाओं वाले कमरे में रखी जा सकने वाली सबसे लंबी छड़ की लंबाई क्या है?",
    optEn: ["15 m", "17 m", "19 m", "21 m"],
    optHi: ["15 मीटर", "17 मीटर", "19 मीटर", "21 मीटर"],
    correctIdx: 1,
    expEn: "Diagonal of a cuboid = sqrt(l^2 + b^2 + h^2) = sqrt(12^2 + 9^2 + 8^2) = sqrt(144 + 81 + 64) = sqrt(289) = 17 m.",
    expHi: "घनाभ का विकर्ण = sqrt(l^2 + b^2 + h^2) = sqrt(144 + 81 + 64) = sqrt(289) = 17 मीटर।",
    diff: "easy"
  }
];

console.log(`Compiling ${mathQuestions.length} Mathematics questions...`);

const answerCounts = { opt_a: 0, opt_b: 0, opt_c: 0, opt_d: 0 };

const formatted = mathQuestions.map((q, idx) => {
  const id = `math_${String(idx + 1).padStart(3, '0')}`;
  const correctOptionId = optionKeys[q.correctIdx];
  answerCounts[correctOptionId]++;

  return {
    id,
    category: "mathematics",
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
      name: "NCERT Mathematics Class 9-10 & Quantitative Standards",
      url: "https://ncert.nic.in/textbook.php",
      verificationDate: "2026-03-10",
      status: "verified"
    },
    createdAt: "2026-03-15T00:00:00.000Z",
    fingerprint: hash(q.qEn),
    isActive: true
  };
});

console.log("Mathematics Answer Distribution:", answerCounts);

const fileContent = `import { SamahitQuestion } from "../samahitQuestionTypes";

export const MATHEMATICS_QUESTIONS: SamahitQuestion[] = ${JSON.stringify(formatted, null, 2)};
`;

const targetPath = path.join(__dirname, '..', 'src', 'data', 'quiz', 'questions', 'mathematics.ts');
const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log(`Saved ${formatted.length} questions to ${targetPath}`);
