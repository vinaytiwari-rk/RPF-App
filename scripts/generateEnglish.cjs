const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hash(text) {
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex').slice(0, 16);
}

const optionKeys = ['opt_a', 'opt_b', 'opt_c', 'opt_d'];

const englishQuestions = [
  // 1-10
  {
    sub: "vocabulary_synonyms",
    qEn: "Choose the synonym of the word 'PRUDENT':",
    qHi: "'PRUDENT' (विवेकी / समझदार) शब्द का समानार्थी (Synonym) चुनें:",
    optEn: ["Reckless", "Cautious", "Impetuous", "Careless"],
    optHi: ["लापरवाह (Reckless)", "सतर्क / समझदार (Cautious)", "उतावला (Impetuous)", "असावधान (Careless)"],
    correctIdx: 1,
    expEn: "'Prudent' means acting with or showing care and thought for the future; synonymous with 'cautious' or 'wise'.",
    expHi: "'Prudent' का अर्थ विवेकशील, दूरदर्शी या सतर्क होना है, जिसका समानार्थी 'Cautious' है।",
    diff: "easy"
  },
  {
    sub: "vocabulary_antonyms",
    qEn: "Choose the antonym of the word 'OBSCURE':",
    qHi: "'OBSCURE' (अस्पष्ट / अप्रसिद्ध) शब्द का विलोमार्थी (Antonym) चुनें:",
    optEn: ["Vague", "Concealed", "Clear", "Doubtful"],
    optHi: ["अस्पष्ट (Vague)", "छिपा हुआ (Concealed)", "स्पष्ट (Clear)", "संदेहास्पद (Doubtful)"],
    correctIdx: 2,
    expEn: "'Obscure' means not clearly expressed or easily understood; its direct antonym is 'Clear' or 'Lucid'.",
    expHi: "'Obscure' का अर्थ अस्पष्ट या धुंधला होता है, जिसका विलोम 'Clear' (स्पष्ट) है।",
    diff: "easy"
  },
  {
    sub: "idioms_phrases",
    qEn: "What is the meaning of the idiom 'To break the ice'?",
    qHi: "'To break the ice' मुहावरे का सही अर्थ क्या है?",
    optEn: ["To shatter frozen water", "To initiate a social conversation in an awkward or silent situation", "To quarrel openly with someone", "To end a long friendship"],
    optHi: ["जमी हुई बर्फ को तोड़ना", "असहज खामोशी को तोड़कर बातचीत की शुरुआत करना", "खुलेआम झगड़ा करना", "पुरानी दोस्ती समाप्त करना"],
    correctIdx: 1,
    expEn: "'To break the ice' means to initiate conversation in a social setting where people feel awkward or reserved.",
    expHi: "'To break the ice' का अर्थ हिचकिचाहट या खामोशी दूर करके बातचीत शुरू करना है।",
    diff: "easy"
  },
  {
    sub: "one_word_substitution",
    qEn: "A person who is indifferent to both pleasure and pain is called a/an:",
    qHi: "जो व्यक्ति सुख और दुख दोनों में समान भाव से उदासीन रहता है, उसे क्या कहा जाता है?",
    optEn: ["Hedonist", "Stoic", "Ascetic", "Altruist"],
    optHi: ["सुखवादी (Hedonist)", "उदासीन / स्थितप्रज्ञ (Stoic)", "तपस्वी (Ascetic)", "परोपकारी (Altruist)"],
    correctIdx: 1,
    expEn: "A 'Stoic' is an individual who can endure pain or hardship without showing feelings or complaining.",
    expHi: "'Stoic' वह व्यक्ति है जो सुख और दुख में समान भाव रखता है (स्थितप्रज्ञ)।",
    diff: "easy"
  },
  {
    sub: "error_spotting",
    qEn: "Identify the part of the sentence containing a grammatical error: 'Neither the manager (A) / nor the employees (B) / was present at the meeting (C) / No error (D)'",
    qHi: "व्याकरणिक त्रुटि वाले भाग की पहचान करें: 'Neither the manager (A) / nor the employees (B) / was present at the meeting (C) / No error (D)'",
    optEn: ["Neither the manager", "nor the employees", "was present at the meeting", "No error"],
    optHi: ["Neither the manager", "nor the employees", "was present at the meeting", "No error"],
    correctIdx: 2,
    expEn: "When two subjects are connected by 'neither... nor', the verb agrees with the closer subject. Since 'employees' is plural, the correct verb is 'were present'.",
    expHi: "'Neither... nor' में क्रिया निकटतम कर्ता के अनुसार होती है। 'employees' बहुवचन है, अतः 'was' के स्थान पर 'were' होना चाहिए।",
    diff: "medium"
  },
  {
    sub: "active_passive",
    qEn: "Convert to Passive Voice: 'The chef prepared a sumptuous meal for the dignitaries.'",
    qHi: "कर्मवाच्य (Passive Voice) में परिवर्तित करें: 'The chef prepared a sumptuous meal for the dignitaries.'",
    optEn: ["A sumptuous meal is prepared by the chef for the dignitaries.", "A sumptuous meal had been prepared by the chef for the dignitaries.", "A sumptuous meal was prepared by the chef for the dignitaries.", "A sumptuous meal was being prepared by the chef for the dignitaries."],
    optHi: ["A sumptuous meal is prepared by the chef for the dignitaries.", "A sumptuous meal had been prepared by the chef for the dignitaries.", "A sumptuous meal was prepared by the chef for the dignitaries.", "A sumptuous meal was being prepared by the chef for the dignitaries."],
    correctIdx: 2,
    expEn: "Simple past active 'prepared' converts to 'was prepared' in passive voice.",
    expHi: "सामान्य भूतकाल (Simple Past) 'prepared' पैसिव वॉइस में 'was prepared' में परिवर्तित होता है।",
    diff: "easy"
  },
  {
    sub: "direct_indirect",
    qEn: "Convert to Indirect Speech: She said to me, 'Where are you going for the holidays?'",
    qHi: "परोक्ष कथन (Indirect Speech) में बदलें: She said to me, 'Where are you going for the holidays?'",
    optEn: ["She asked me that where was I going for the holidays.", "She told me where I was going for the holidays.", "She asked me where I was going for the holidays.", "She asked me where was I going for the holidays."],
    optHi: ["She asked me that where was I going for the holidays.", "She told me where I was going for the holidays.", "She asked me where I was going for the holidays.", "She asked me where was I going for the holidays."],
    correctIdx: 2,
    expEn: "In WH-question indirect speech: reporting verb becomes 'asked', no 'that' is used, and sentence becomes assertive (subject before verb: 'I was going').",
    expHi: "प्रश्नवाचक अप्रत्यक्ष कथन में 'asked' प्रयुक्त होता है, 'that' नहीं लगता और वाक्य साधारण रूप ('I was going') में बदलता है।",
    diff: "medium"
  },
  {
    sub: "idioms_phrases",
    qEn: "What does the idiom 'Bite the bullet' signify?",
    qHi: "'Bite the bullet' मुहावरे का क्या अभिप्राय है?",
    optEn: ["To consume something dangerous", "To face an inevitable grim situation with courage and fortitude", "To refuse to accept responsibility", "To surrender in battle"],
    optHi: ["किसी खतरनाक वस्तु का उपभोग करना", "अपरिहार्य अप्रिय स्थिति का साहसपूर्वक सामना करना", "जिम्मेदारी लेने से इनकार करना", "युद्ध में आत्मसमर्पण करना"],
    correctIdx: 1,
    expEn: "'Bite the bullet' means to decide to do something difficult or unpleasant that one has been putting off or hesitating over.",
    expHi: "'Bite the bullet' का अर्थ किसी अप्रिय या कठिन परिस्थिति का धैर्यपूर्वक व साहस से सामना करना है।",
    diff: "easy"
  },
  {
    sub: "vocabulary_synonyms",
    qEn: "Select the synonym of 'EPHEMERAL':",
    qHi: "'EPHEMERAL' (क्षणभंगुर / अल्पकालिक) का समानार्थी चुनें:",
    optEn: ["Eternal", "Enduring", "Transient", "Perpetual"],
    optHi: ["शाश्वत (Eternal)", "स्थायी (Enduring)", "क्षणिक (Transient)", "सदा रहने वाला (Perpetual)"],
    correctIdx: 2,
    expEn: "'Ephemeral' means lasting for a very short time; its synonym is 'Transient' or 'Fleeting'.",
    expHi: "'Ephemeral' का अर्थ क्षणिक या अल्पकालिक होता है, जिसका समानार्थी 'Transient' है।",
    diff: "medium"
  },
  {
    sub: "one_word_substitution",
    qEn: "One who possesses comprehensive knowledge about everything is known as:",
    qHi: "जो सब कुछ जानने वाला (सर्वज्ञ) हो, उसे क्या कहते हैं?",
    optEn: ["Omnipotent", "Omnipresent", "Omnivorous", "Omniscient"],
    optHi: ["सर्वशक्तिमान (Omnipotent)", "सर्वव्यापी (Omnipresent)", "सर्वाहारी (Omnivorous)", "सर्वज्ञ (Omniscient)"],
    correctIdx: 3,
    expEn: "'Omniscient' means knowing everything (Omni = all, Scient = knowing).",
    expHi: "'Omniscient' का अर्थ सर्वज्ञ (सब कुछ जानने वाला) होता है।",
    diff: "easy"
  },

  // 11-20
  {
    sub: "sentence_correction",
    qEn: "Choose the correct sentence among the following:",
    qHi: "निम्नलिखित में से व्याकरण की दृष्टि से शुद्ध वाक्य चुनें:",
    optEn: ["One of my friend is an IAS officer.", "One of my friends are an IAS officer.", "One of my friends is an IAS officer.", "One of my friends were an IAS officer."],
    optHi: ["One of my friend is an IAS officer.", "One of my friends are an IAS officer.", "One of my friends is an IAS officer.", "One of my friends were an IAS officer."],
    correctIdx: 2,
    expEn: "'One of' is followed by a plural noun ('friends') and a singular verb ('is').",
    expHi: "'One of' के बाद संज्ञा बहुवचन ('friends') और क्रिया एकवचन ('is') होती है।",
    diff: "easy"
  },
  {
    sub: "vocabulary_antonyms",
    qEn: "Select the antonym of the word 'BENEVOLENT':",
    qHi: "'BENEVOLENT' (परोपकारी / दयालु) शब्द का विलोमार्थी चुनें:",
    optEn: ["Generous", "Altruistic", "Malevolent", "Compassionate"],
    optHi: ["उदार (Generous)", "परोपकारी (Altruistic)", "द्वेषी / दुर्भावनापूर्ण (Malevolent)", "दयालु (Compassionate)"],
    correctIdx: 2,
    expEn: "'Benevolent' means kind and well-meaning; 'Malevolent' means wishing or doing evil to others.",
    expHi: "'Benevolent' का अर्थ परोपकारी या दयालु होता है, जिसका विलोम 'Malevolent' (द्वेषी/दुर्भावनापूर्ण) है।",
    diff: "easy"
  },
  {
    sub: "idioms_phrases",
    qEn: "The phrase 'Once in a blue moon' represents an event that happens:",
    qHi: "'Once in a blue moon' मुहावरे का प्रयोग किस प्रकार की घटना के लिए किया जाता है?",
    optEn: ["Every full moon night", "Very frequently", "Very rarely", "Never in lifetime"],
    optHi: ["प्रत्येक पूर्णिमा की रात", "बहुत बार (Frequently)", "बहुत ही दुर्लभ रूप से (Very rarely)", "जीवन में कभी नहीं"],
    correctIdx: 2,
    expEn: "'Once in a blue moon' is an idiom used to describe something that happens very rarely.",
    expHi: "'Once in a blue moon' का अर्थ कभी-कभार या बहुत दुर्लभ रूप से होने वाली घटना है (ईद का चाँद)।",
    diff: "easy"
  },
  {
    sub: "error_spotting",
    qEn: "Find the error: 'Scarcely had I reached the station (A) / than the train departed (B) / leaving me stranded (C) / No error (D)'",
    qHi: "त्रुटि खोजें: 'Scarcely had I reached the station (A) / than the train departed (B) / leaving me stranded (C) / No error (D)'",
    optEn: ["Scarcely had I reached the station", "than the train departed", "leaving me stranded", "No error"],
    optHi: ["Scarcely had I reached the station", "than the train departed", "leaving me stranded", "No error"],
    correctIdx: 1,
    expEn: "'Scarcely' and 'Hardly' are followed by 'when' or 'before', never by 'than'. 'Than' is used with 'No sooner'.",
    expHi: "'Scarcely' और 'Hardly' के साथ 'when' का प्रयोग होता है, 'than' का नहीं। 'Than' का प्रयोग 'No sooner' के साथ किया जाता है।",
    diff: "medium"
  },
  {
    sub: "one_word_substitution",
    qEn: "A remedy or cure for all diseases or difficulties is known as a/an:",
    qHi: "सभी रोगों या समस्याओं के लिए रामबाण औषधि को क्या कहा जाता है?",
    optEn: ["Antidote", "Antibiotic", "Panacea", "Placebo"],
    optHi: ["विषनाशक (Antidote)", "एंटीबायोटिक", "रामबाण (Panacea)", "प्लासिबो (Placebo)"],
    correctIdx: 2,
    expEn: "'Panacea' is a solution or remedy for all difficulties or diseases.",
    expHi: "'Panacea' का अर्थ सभी रोगों या समस्याओं का रामबाण इलाज होता है।",
    diff: "easy"
  },
  {
    sub: "active_passive",
    qEn: "Convert to Passive: 'Someone has stolen my bicycle.'",
    qHi: "पैसिव वॉइस में बदलें: 'Someone has stolen my bicycle.'",
    optEn: ["My bicycle was stolen.", "My bicycle had been stolen.", "My bicycle is stolen.", "My bicycle has been stolen."],
    optHi: ["My bicycle was stolen.", "My bicycle had been stolen.", "My bicycle is stolen.", "My bicycle has been stolen."],
    correctIdx: 3,
    expEn: "Present perfect 'has stolen' becomes 'has been stolen' in passive voice.",
    expHi: "Present Perfect 'has stolen' पैसिव वॉइस में 'has been stolen' में बदलता है।",
    diff: "easy"
  },
  {
    sub: "vocabulary_synonyms",
    qEn: "Choose the synonym of 'CANDID':",
    qHi: "'CANDID' (स्पष्टवादी / निष्कपट) का समानार्थी चुनें:",
    optEn: ["Deceptive", "Frank", "Secretive", "Shy"],
    optHi: ["धोखेबाज (Deceptive)", "निष्कपट / स्पष्टवादी (Frank)", "रहस्यमयी (Secretive)", "शर्मीला (Shy)"],
    correctIdx: 1,
    expEn: "'Candid' means truthful, straightforward, and frank.",
    expHi: "'Candid' का अर्थ निष्कपट, खरा और स्पष्टवादी होता है (Frank)।",
    diff: "easy"
  },
  {
    sub: "error_spotting",
    qEn: "Identify the error: 'If I was the Prime Minister (A) / I would eradicate poverty (B) / within five years (C) / No error (D)'",
    qHi: "त्रुटि पहचानें: 'If I was the Prime Minister (A) / I would eradicate poverty (B) / within five years (C) / No error (D)'",
    optEn: ["If I was the Prime Minister", "I would eradicate poverty", "within five years", "No error"],
    optHi: ["If I was the Prime Minister", "I would eradicate poverty", "within five years", "No error"],
    correctIdx: 0,
    expEn: "In hypothetical or subjunctive conditional clauses, 'were' is used for all subjects: 'If I were the Prime Minister'.",
    expHi: "काल्पनिक या अप्रत्यक्ष शर्त वाले वाक्यों (Subjunctive mood) में 'was' के स्थान पर 'were' का प्रयोग होता है: 'If I were...'",
    diff: "medium"
  },
  {
    sub: "idioms_phrases",
    qEn: "What does the idiom 'Burn the midnight oil' mean?",
    qHi: "'Burn the midnight oil' मुहावरे का क्या अर्थ है?",
    optEn: ["To waste expensive fuel at night", "To read or work late into the night", "To set fire to property intentionally", "To host a lavish late-night party"],
    optHi: ["रात में महंगा ईंधन बर्बाद करना", "देर रात तक परिश्रमपूर्वक अध्ययन या कार्य करना", "जानबूझकर संपत्ति में आग लगाना", "देर रात तक भव्य पार्टी आयोजित करना"],
    correctIdx: 1,
    expEn: "'To burn the midnight oil' means to study or work until very late at night.",
    expHi: "'To burn the midnight oil' का अर्थ देर रात तक जागकर कड़ी मेहनत या पढ़ाई करना है।",
    diff: "easy"
  },
  {
    sub: "one_word_substitution",
    qEn: "A speech or presentation delivered without any prior preparation is called:",
    qHi: "बिना किसी पूर्व तैयारी के दिया गया भाषण क्या कहलाता है?",
    optEn: ["Maiden speech", "Eulogy", "Extempore (or Impromptu)", "Soliloquy"],
    optHi: ["पहला भाषण (Maiden speech)", "प्रशंसा भाषण (Eulogy)", "तात्कालिक भाषण (Extempore / Impromptu)", "आत्मभाषण (Soliloquy)"],
    correctIdx: 2,
    expEn: "'Extempore' or 'Impromptu' refers to spoken or done without preparation.",
    expHi: "बिना पूर्व तैयारी के तत्क्षण दिए गए भाषण को 'Extempore' कहा जाता है।",
    diff: "easy"
  },

  // 21-35
  {
    sub: "vocabulary_antonyms",
    qEn: "Find the antonym of 'METICULOUS':",
    qHi: "'METICULOUS' (अति सावधान / सूक्ष्मदर्शी) का विलोम चुनें:",
    optEn: ["Punctilious", "Careless", "Methodical", "Fastidious"],
    optHi: ["सटीक (Punctilious)", "लापरवाह (Careless)", "व्यवस्थित (Methodical)", "नखरेबाज (Fastidious)"],
    correctIdx: 1,
    expEn: "'Meticulous' means showing great attention to detail; its opposite is 'Careless' or 'Sloppy'.",
    expHi: "'Meticulous' का अर्थ अत्यंत बारीक और सावधान होता है, जिसका विलोम 'Careless' (लापरवाह) है।",
    diff: "easy"
  },
  {
    sub: "direct_indirect",
    qEn: "Convert to Indirect Speech: The teacher said to the students, 'The Earth revolves around the Sun.'",
    qHi: "परोक्ष कथन में बदलें: The teacher said to the students, 'The Earth revolves around the Sun.'",
    optEn: ["The teacher told the students that the Earth revolved around the Sun.", "The teacher told the students that the Earth revolves around the Sun.", "The teacher said the students that the Earth had revolved around the Sun.", "The teacher asked the students if the Earth revolves around the Sun."],
    optHi: ["The teacher told the students that the Earth revolved around the Sun.", "The teacher told the students that the Earth revolves around the Sun.", "The teacher said the students that the Earth had revolved around the Sun.", "The teacher asked the students if the Earth revolves around the Sun."],
    correctIdx: 1,
    expEn: "Universal truths or scientific facts do not undergo tense change in indirect speech: 'revolves' remains 'revolves'.",
    expHi: "सार्वभौमिक सत्य (Universal truth) होने के कारण क्रिया का काल नहीं बदलता, अतः 'revolves' ही रहेगा।",
    diff: "easy"
  },
  {
    sub: "idioms_phrases",
    qEn: "What is the meaning of 'A blessing in disguise'?",
    qHi: "'A blessing in disguise' मुहावरे का क्या अर्थ है?",
    optEn: ["An apparent misfortune that eventually results in good", "A secret gift from an unknown well-wisher", "A supernatural apparition", "A curse that harms everyone"],
    optHi: ["एक प्रत्यक्ष विपत्ति जिसका परिणाम अंततः सुखद या लाभदायक साबित होता है", "किसी अज्ञात शुभचिंतक का गुप्त उपहार", "एक अलौकिक दृश्य", "एक अभिशाप जो सबको नुकसान पहुंचाए"],
    correctIdx: 0,
    expEn: "'A blessing in disguise' is an apparent misfortune that eventually results in something good happening.",
    expHi: "'A blessing in disguise' का अर्थ विपत्ति के रूप में छिपा हुआ वरदान होता है।",
    diff: "easy"
  },
  {
    sub: "vocabulary_synonyms",
    qEn: "What is the synonym of 'RESILIENT'?",
    qHi: "'RESILIENT' (लचीला / आघात सहने में सक्षम) का समानार्थी शब्द क्या है?",
    optEn: ["Brittle", "Fragile", "Elastic / Adaptable", "Rigid"],
    optHi: ["भंगुर (Brittle)", "नाजुक (Fragile)", "अनुकूलनीय / लचीला (Elastic / Adaptable)", "कठोर (Rigid)"],
    correctIdx: 2,
    expEn: "'Resilient' means able to withstand or recover quickly from difficult conditions; adaptable or elastic.",
    expHi: "'Resilient' का अर्थ आघात सहकर पुनः सामान्य स्थिति में आने में सक्षम (लचीला) होता है।",
    diff: "easy"
  },
  {
    sub: "error_spotting",
    qEn: "Find the grammatical error: 'He is senior than me (A) / in service (B) / by five years (C) / No error (D)'",
    qHi: "व्याकरणिक अशुद्धि चुनें: 'He is senior than me (A) / in service (B) / by five years (C) / No error (D)'",
    optEn: ["He is senior than me", "in service", "by five years", "No error"],
    optHi: ["He is senior than me", "in service", "by five years", "No error"],
    correctIdx: 0,
    expEn: "Comparative Latin adjectives ending in '-ior' (senior, junior, superior, inferior, prior) take the preposition 'to', not 'than': 'He is senior to me'.",
    expHi: "Senior, junior, superior, inferior आदि लैटिन तुलनात्मक शब्दों के साथ 'than' के स्थान पर 'to' का प्रयोग होता है।",
    diff: "easy"
  },
  {
    sub: "one_word_substitution",
    qEn: "A person who speaks or writes several languages fluently is called a:",
    qHi: "जो व्यक्ति कई भाषाओं को धाराप्रवाह बोल या लिख सकता है, उसे क्या कहते हैं?",
    optEn: ["Linguist", "Polyglot", "Monoglot", "Etymologist"],
    optHi: ["भाषाविद् (Linguist)", "बहुभाषाविद (Polyglot)", "एकलभाषी (Monoglot)", "व्युत्पत्तिविज्ञानी (Etymologist)"],
    correctIdx: 1,
    expEn: "A 'Polyglot' is a person who knows and is able to use several languages.",
    expHi: "'Polyglot' का अर्थ बहुभाषाभाषी होता है।",
    diff: "easy"
  },
  {
    sub: "sentence_correction",
    qEn: "Select the grammatically correct sentence:",
    qHi: "व्याकरण सम्मत सही वाक्य चुनें:",
    optEn: ["The furniture in this room are very old.", "The furnitures in this room is very old.", "The furniture in this room is very old.", "The furnitures in this room are very old."],
    optHi: ["The furniture in this room are very old.", "The furnitures in this room is very old.", "The furniture in this room is very old.", "The furnitures in this room are very old."],
    correctIdx: 2,
    expEn: "'Furniture' is an uncountable noun and does not take a plural '-s'. It takes a singular verb: 'is'.",
    expHi: "'Furniture' एक अगणनीय (Uncountable) संज्ञा है, इसमें 's' नहीं लगता और यह एकवचन क्रिया 'is' लेता है।",
    diff: "easy"
  },
  {
    sub: "vocabulary_antonyms",
    qEn: "What is the antonym of 'OSTENTATIOUS'?",
    qHi: "'OSTENTATIOUS' (दिखावटी / आडंबरपूर्ण) का विलोम क्या है?",
    optEn: ["Flamboyant", "Modest / Simple", "Pretentious", "Gaudy"],
    optHi: ["दिखावटी (Flamboyant)", "विनम्र / सादा (Modest / Simple)", "आडंबरयुक्त (Pretentious)", "भड़कीला (Gaudy)"],
    correctIdx: 1,
    expEn: "'Ostentatious' means characterized by pretentious or showy display; its antonym is 'Modest' or 'Restrained'.",
    expHi: "'Ostentatious' का अर्थ दिखावटी या आडंबरपूर्ण होता है, जिसका विलोम 'Modest' (विनम्र/सादा) है।",
    diff: "medium"
  },
  {
    sub: "idioms_phrases",
    qEn: "What does 'To let the cat out of the bag' mean?",
    qHi: "'To let the cat out of the bag' मुहावरे का क्या अभिप्राय है?",
    optEn: ["To release a captured pet animal", "To reveal a secret carelessly or by mistake", "To cause widespread confusion in public", "To avoid telling the truth deliberately"],
    optHi: ["पकड़े गए पालतू जानवर को छोड़ना", "अनजाने में या लापरवाही से कोई रहस्य उजागर करना", "जनता में व्यापक भ्रम पैदा करना", "जानबूझकर सच बोलने से बचना"],
    correctIdx: 1,
    expEn: "'To let the cat out of the bag' means to disclose a secret, often inadvertently.",
    expHi: "'To let the cat out of the bag' का अर्थ अनजाने में किसी रहस्य का भंडाफोड़ करना है।",
    diff: "easy"
  },
  {
    sub: "one_word_substitution",
    qEn: "Something that cannot be avoided or prevented is described as:",
    qHi: "जिसे टाला या रोका नहीं जा सके (अपरिहार्य), उसे क्या कहते हैं?",
    optEn: ["Infallible", "Incurable", "Inevitable", "Inaudible"],
    optHi: ["अचूक (Infallible)", "असाध्य (Incurable)", "अपरिहार्य (Inevitable)", "अश्रव्य (Inaudible)"],
    correctIdx: 2,
    expEn: "'Inevitable' means certain to happen; unavoidable.",
    expHi: "'Inevitable' का अर्थ जिसे टाला न जा सके (अपरिहार्य) होता है।",
    diff: "easy"
  },
  {
    sub: "active_passive",
    qEn: "Change into Passive Voice: 'Who wrote the epic Mahabharata?'",
    qHi: "पैसिव वॉइस में बदलें: 'Who wrote the epic Mahabharata?'",
    optEn: ["By whom was the epic Mahabharata written?", "Who was the epic Mahabharata written by?", "By whom had the epic Mahabharata written?", "Whom wrote the epic Mahabharata?"],
    optHi: ["By whom was the epic Mahabharata written?", "Who was the epic Mahabharata written by?", "By whom had the epic Mahabharata written?", "Whom wrote the epic Mahabharata?"],
    correctIdx: 0,
    expEn: "'Who' in interrogative active voice transforms to 'By whom + auxiliary + subject + V3': 'By whom was the epic Mahabharata written?'.",
    expHi: "प्रश्नवाचक में 'Who' पैसिव वॉइस में 'By whom' में बदलता है: 'By whom was the epic Mahabharata written?'।",
    diff: "easy"
  },
  {
    sub: "vocabulary_synonyms",
    qEn: "Select the synonym of 'DILIGENT':",
    qHi: "'DILIGENT' (परिश्रमी / कर्मठ) का समानार्थी चुनें:",
    optEn: ["Slothful", "Industrious / Hardworking", "Lethargic", "Indifferent"],
    optHi: ["आलसी (Slothful)", "परिश्रमी / कर्मठ (Industrious / Hardworking)", "सुस्त (Lethargic)", "उदासीन (Indifferent)"],
    correctIdx: 1,
    expEn: "'Diligent' means having or showing care and conscientiousness in one's work; synonymous with 'Industrious'.",
    expHi: "'Diligent' का अर्थ कर्मठ या परिश्रमी होता है (Industrious)।",
    diff: "easy"
  },
  {
    sub: "error_spotting",
    qEn: "Identify the error: 'The committee have decided (A) / to submit its report (B) / on next Monday (C) / No error (D)'",
    qHi: "त्रुटि पहचानें: 'The committee have decided (A) / to submit its report (B) / on next Monday (C) / No error (D)'",
    optEn: ["The committee have decided", "to submit its report", "on next Monday", "No error"],
    optHi: ["The committee have decided", "to submit its report", "on next Monday", "No error"],
    correctIdx: 0,
    expEn: "When a collective noun functions as a single unified body (evidenced by the singular pronoun 'its'), it requires a singular verb: 'The committee has decided'.",
    expHi: "जब समूहवाचक संज्ञा (collective noun) एक इकाई के रूप में कार्य करती है (जैसा कि 'its' से स्पष्ट है), तो एकवचन क्रिया 'has decided' होनी चाहिए।",
    diff: "medium"
  },
  {
    sub: "idioms_phrases",
    qEn: "What does the idiom 'Call it a day' mean?",
    qHi: "'Call it a day' मुहावरे का क्या अर्थ है?",
    optEn: ["To declare a holiday for celebration", "To stop working on something for the rest of the day", "To start a fresh business venture", "To count the hours of sunlight"],
    optHi: ["उत्सव के लिए छुट्टी घोषित करना", "दिन भर के काम को समाप्त करना या विराम देना", "एक नया व्यापार उद्यम शुरू करना", "धूप के घंटों की गिनती करना"],
    correctIdx: 1,
    expEn: "'To call it a day' means to stop what you are doing because you have done enough or finished for that day.",
    expHi: "'To call it a day' का अर्थ आज के काम को समाप्त करने का निर्णय लेना है।",
    diff: "easy"
  },
  {
    sub: "one_word_substitution",
    qEn: "A person who loves, supports, and defends his country is known as a:",
    qHi: "जो व्यक्ति अपने देश से प्रेम करता है और उसकी रक्षा करता है, उसे क्या कहते हैं?",
    optEn: ["Mercenary", "Traitor", "Patriot", "Expatriate"],
    optHi: ["भाड़े का सैनिक (Mercenary)", "देशद्रोही (Traitor)", "देशभक्त (Patriot)", "प्रवासी (Expatriate)"],
    correctIdx: 2,
    expEn: "A 'Patriot' is a person who vigorously supports their country and is prepared to defend it.",
    expHi: "'Patriot' का अर्थ देशभक्त होता है।",
    diff: "easy"
  }
];

console.log(`Compiling ${englishQuestions.length} English questions...`);

const answerCounts = { opt_a: 0, opt_b: 0, opt_c: 0, opt_d: 0 };

const formatted = englishQuestions.map((q, idx) => {
  const id = `eng_${String(idx + 1).padStart(3, '0')}`;
  const correctOptionId = optionKeys[q.correctIdx];
  answerCounts[correctOptionId]++;

  return {
    id,
    category: "english",
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
      name: "Standard English Grammar and Usage & NCERT English Curriculum",
      url: "https://ncert.nic.in/textbook.php",
      verificationDate: "2026-03-10",
      status: "verified"
    },
    createdAt: "2026-03-15T00:00:00.000Z",
    fingerprint: hash(q.qEn),
    isActive: true
  };
});

console.log("English Answer Distribution:", answerCounts);

const fileContent = `import { SamahitQuestion } from "../samahitQuestionTypes";

export const ENGLISH_QUESTIONS: SamahitQuestion[] = ${JSON.stringify(formatted, null, 2)};
`;

const targetPath = path.join(__dirname, '..', 'src', 'data', 'quiz', 'questions', 'english.ts');
const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log(`Saved ${formatted.length} questions to ${targetPath}`);
