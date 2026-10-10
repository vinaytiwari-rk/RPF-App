import axios from "axios";
import { QuizQuestion, QuizTopic } from "../data/quiz/quizQuestionBank";
import { CatalogTopic } from "../data/quiz/quizCatalog";

const LOCAL_STORAGE_PREFIX = "rpf_quiz_cache_";

export async function fetchTopicQuestions(
  topic: CatalogTopic,
  subjectTitle: string = "General Studies"
): Promise<QuizQuestion[]> {
  const cacheKey = `${LOCAL_STORAGE_PREFIX}${topic.id}`;

  // 1. Try local cache in device
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore local storage error
  }

  // 2. Try server API with Gemini AI generation
  try {
    const response = await axios.post(
      "/api/quiz/generate",
      {
        topicId: topic.id,
        topicTitle: topic.titleEn,
        subjectTitle,
        count: topic.questionsCount || 10
      },
      { timeout: 12000 }
    );

    if (response.data && Array.isArray(response.data.questions) && response.data.questions.length > 0) {
      const questions: QuizQuestion[] = response.data.questions;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(questions));
      } catch {
        // quota exceeded guard
      }
      return questions;
    }
  } catch (apiErr) {
    console.warn("Could not fetch questions from server, using fallback:", apiErr);
  }

  // 3. Fallback questions
  const fallbackQuestions: QuizQuestion[] = [
    {
      id: `${topic.id}_fb_1`,
      questionEn: `What is the key importance of ${topic.titleEn} in the context of ${subjectTitle}?`,
      questionHi: `${subjectTitle} के संदर्भ में ${topic.titleHi || topic.titleEn} का मुख्य महत्व क्या है?`,
      optionsEn: [
        `It forms a foundational framework repeatedly tested in civil service examinations.`,
        `It has no relevance to modern administrative and socio-economic systems.`,
        `It was completely replaced without leaving any institutional heritage.`,
        `It applies solely to isolated non-Indian geographical zones.`
      ],
      optionsHi: [
        `यह एक आधारभूत ढांचा तैयार करता है जिसका सिविल सेवा परीक्षाओं में बार-बार परीक्षण किया जाता है।`,
        `आधुनिक प्रशासनिक और सामाजिक-आर्थिक प्रणालियों में इसका कोई महत्व नहीं है।`,
        `यह बिना किसी संस्थागत विरासत को छोड़े पूरी तरह समाप्त हो गया था।`,
        `यह केवल अलग-थलग गैर-भारतीय क्षेत्रों तक ही सीमित था।`
      ],
      correctIndex: 0,
      explanationEn: `${topic.titleEn} is an essential curriculum milestone under ${subjectTitle}.`,
      explanationHi: `${topic.titleHi || topic.titleEn}, ${subjectTitle} के अंतर्गत एक अनिवार्य अध्ययन विषय है।`
    },
    {
      id: `${topic.id}_fb_2`,
      questionEn: `Which of the following statements is historically / scientifically verified regarding ${topic.titleEn}?`,
      questionHi: `${topic.titleHi || topic.titleEn} के संबंध में निम्नलिखित में से कौन सा कथन ऐतिहासिक / वैज्ञानिक रूप से सत्यापित है?`,
      optionsEn: [
        `It is systematically analyzed to understand evolution, governance, and structural dynamics.`,
        `It lacks empirical corroboration and recorded documentation.`,
        `It was rejected uniformly by contemporary authorities and scholars.`,
        `It had zero impact on regional policy or public knowledge.`
      ],
      optionsHi: [
        `विकास, शासन और संरचनात्मक गतिशीलता को समझने के लिए इसका व्यवस्थित विश्लेषण किया जाता है।`,
        `इसमें अनुभवजन्य पुष्टि और दर्ज दस्तावेज़ीकरण का अभाव है।`,
        `समकालीन अधिकारियों और विद्वानों द्वारा इसे एक समान रूप से अस्वीकार कर दिया गया था।`,
        `क्षेत्रीय नीति या सार्वजनिक ज्ञान पर इसका शून्य प्रभाव था।`
      ],
      correctIndex: 0,
      explanationEn: `Standard competitive examinations emphasize the analytical insights of ${topic.titleEn}.`,
      explanationHi: `मानक प्रतियोगी परीक्षाओं में ${topic.titleHi || topic.titleEn} के विश्लेषणात्मक पहलुओं पर बल दिया जाता है।`
    }
  ];

  return fallbackQuestions;
}
