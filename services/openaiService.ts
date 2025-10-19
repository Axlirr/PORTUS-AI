import OpenAI from 'openai';
import type { AnalysisResult } from '../types';
import { mockVessels, mockPorts, mockWeather, mockRoutes } from '../data/mockData';
import { retrieveDocs } from '../data/ragDocs';

// Azure OpenAI configuration from environment (mapped via Vite define)
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT as string | undefined;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT as string | undefined;
const AZURE_OPENAI_API_VERSION = (process.env.AZURE_OPENAI_API_VERSION as string | undefined) || '2024-08-01-preview';
const AZURE_OPENAI_PRIMARY_KEY = process.env.AZURE_OPENAI_PRIMARY_KEY as string | undefined;
const AZURE_OPENAI_SECONDARY_KEY = process.env.AZURE_OPENAI_SECONDARY_KEY as string | undefined;

// Prefer primary key; fall back to secondary key if primary is missing
const resolvedAzureKey = AZURE_OPENAI_PRIMARY_KEY || AZURE_OPENAI_SECONDARY_KEY || '';

// Language detection function
const detectLanguage = (text: string): string => {
  // Simple language detection based on character patterns
  const chinesePattern = /[\u4e00-\u9fff]/;
  const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
  const koreanPattern = /[\uac00-\ud7af]/;
  const arabicPattern = /[\u0600-\u06ff]/;
  const cyrillicPattern = /[\u0400-\u04ff]/;
  const thaiPattern = /[\u0e00-\u0e7f]/;

  if (chinesePattern.test(text)) return 'Chinese';
  if (japanesePattern.test(text)) return 'Japanese';
  if (koreanPattern.test(text)) return 'Korean';
  if (arabicPattern.test(text)) return 'Arabic';
  if (cyrillicPattern.test(text)) return 'Russian';
  if (thaiPattern.test(text)) return 'Thai';

  // Check for common non-English words
  const spanishWords = ['hola', 'gracias', 'por favor', 'buenos días', 'cómo', 'está'];
  const frenchWords = ['bonjour', 'merci', 's\'il vous plaît', 'comment', 'allez-vous'];
  const germanWords = ['hallo', 'danke', 'bitte', 'wie', 'geht es'];
  const italianWords = ['ciao', 'grazie', 'per favore', 'come', 'stai'];
  const portugueseWords = ['olá', 'obrigado', 'por favor', 'como', 'está'];

  const lowerText = text.toLowerCase();

  if (spanishWords.some(word => lowerText.includes(word))) return 'Spanish';
  if (frenchWords.some(word => lowerText.includes(word))) return 'French';
  if (germanWords.some(word => lowerText.includes(word))) return 'German';
  if (italianWords.some(word => lowerText.includes(word))) return 'Italian';
  if (portugueseWords.some(word => lowerText.includes(word))) return 'Portuguese';

  return 'English'; // Default to English
};

export const getTradeAnalysis = async (prompt: string): Promise<AnalysisResult> => {
  console.log("Connecting to OpenAI API...");

  // Detect the language of the user's input
  const detectedLanguage = detectLanguage(prompt);
  console.log(`Detected language: ${detectedLanguage}`);

  // Check if we have Azure OpenAI configuration
  const hasAzureConfig = AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_DEPLOYMENT && resolvedAzureKey;

  if (!hasAzureConfig) {
    console.warn("Azure OpenAI not configured, using mock response");
    return generateMockResponse(prompt, detectedLanguage);
  }

  const systemInstruction = `You are PORTUS AI, a conversational trade intelligence agent for the Port of Singapore Authority (PSA). 
Your purpose is to help logistics managers make real-time, data-driven decisions during global trade disruptions.
You must analyze the user's query against the provided structured data (vessels, ports, weather, routes).

IMPORTANT: The user's query is in ${detectedLanguage}. You MUST respond in the SAME LANGUAGE as the user's query.
- If the user writes in Chinese, respond in Chinese
- If the user writes in Spanish, respond in Spanish  
- If the user writes in French, respond in French
- If the user writes in German, respond in German
- If the user writes in Japanese, respond in Japanese
- If the user writes in Korean, respond in Korean
- If the user writes in Arabic, respond in Arabic
- If the user writes in Russian, respond in Russian
- If the user writes in Thai, respond in Thai
- If the user writes in Italian, respond in Italian
- If the user writes in Portuguese, respond in Portuguese
- If the user writes in English, respond in English

Your response MUST be a valid JSON object that adheres to the provided schema.
Your analysis should be concise, actionable, and grounded in the data.
Identify relevant entities, simulate impacts, and recommend concrete actions.
For sources, use the format 'dataset:id' or 'dataset:name' (e.g., 'vessels:V102', 'weather:Sandstorm').
Always provide a step-by-step plan of how you reached your conclusion.

You must respond with a valid JSON object containing the following structure:
{
  "plan": ["step1", "step2", "step3"],
  "recommendations": [
    {
      "action": "concrete action",
      "impact_estimate": "estimated impact", 
      "confidence": 0.85
    }
  ],
  "sources": ["vessels:V101", "weather:Sandstorm"],
  "explain": "summary in the user's language",
  "trace": [
    {"type": "thinking", "message": "Analyzing the situation..."},
    {"type": "action", "actionName": "check_vessel_status", "arguments": {"vessel_id": "V101"}},
    {"type": "observation", "observation": "Vessel V101 is currently delayed by 2 hours"},
    {"type": "final", "message": "Based on analysis, here are my recommendations"}
  ]
}`;

  const dataContext = `
    AVAILABLE DATA:
    ---
    Vessels: ${JSON.stringify(mockVessels, null, 2)}
    ---
    Ports: ${JSON.stringify(mockPorts, null, 2)}
    ---
    Weather Disruption Events: ${JSON.stringify(mockWeather, null, 2)}
    ---
    Trade Routes: ${JSON.stringify(mockRoutes, null, 2)}
    ---
  `;

  const retrieved = retrieveDocs(prompt, 3);
  const ragBlock = retrieved.length
    ? `\nRAG CONTEXT (Top ${retrieved.length}):\n` +
    retrieved
      .map((d, i) => `#${i + 1} ${d.title} (DocID: ${d.id})\n${d.text}`)
      .join('\n---\n')
    : '';

  const fullPrompt = `${dataContext}\n${ragBlock}\nUSER QUERY: "${prompt}"`;

  try {
    // Call our dev-time proxy to avoid exposing keys and CORS in the browser
    const proxyResponse = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: fullPrompt }
        ],
        temperature: 0.1
      })
    });

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text();
      console.error(`Proxy error (${proxyResponse.status}): ${errorText}`);
      return generateMockResponse(prompt);
    }

    const response = await proxyResponse.json();

    const jsonText = response.choices?.[0]?.message?.content?.trim();
    console.log("Received response from OpenAI API:", jsonText);

    if (!jsonText) {
      throw new Error("No response content received from OpenAI");
    }

    const analysisResult: AnalysisResult = JSON.parse(jsonText);
    return analysisResult;

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return generateMockResponse(prompt);
  }
};

// Mock response generator for when Azure OpenAI is not configured
const generateMockResponse = (prompt: string, language: string = 'English'): AnalysisResult => {
  const vesselMatches = prompt.match(/V\d+/g);
  const vesselId = vesselMatches ? vesselMatches[0] : 'V101';

  // Language-specific responses
  const responses = {
    Chinese: {
      plan: [
        "分析了当前港口运营和船舶状态",
        "识别了潜在的中断及其影响",
        "基于运营数据生成建议"
      ],
      recommendations: [
        {
          action: `密切监控 ${vesselId} 的任何延误`,
          impact_estimate: "防止港口运营中的连锁延误",
          confidence: 0.85
        },
        {
          action: "准备替代泊位分配",
          impact_estimate: "减少等待时间2-3小时",
          confidence: 0.75
        }
      ],
      explain: `基于当前港口运营数据，我已经分析了 ${vesselId} 的情况。该船舶似乎按计划运行，但我建议监控天气条件并准备应急计划。港口以85%的容量运营，泊位可用性良好。`,
      trace: [
        { type: "thinking", message: "分析船舶状态和港口条件..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} 目前按计划运行，无延误报告` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "港口以85%的容量运营，有3个泊位可用" },
        { type: "final", message: "基于当前运营状态生成建议" }
      ]
    },
    Spanish: {
      plan: [
        "Analicé las operaciones portuarias actuales y el estado de los buques",
        "Identifiqué interrupciones potenciales y sus impactos",
        "Generé recomendaciones basadas en datos operativos"
      ],
      recommendations: [
        {
          action: `Monitorear de cerca ${vesselId} por cualquier retraso`,
          impact_estimate: "Prevenir retrasos en cascada en las operaciones portuarias",
          confidence: 0.85
        },
        {
          action: "Preparar asignaciones alternativas de amarre",
          impact_estimate: "Reducir el tiempo de espera en 2-3 horas",
          confidence: 0.75
        }
      ],
      explain: `Basándome en los datos actuales de operaciones portuarias, he analizado la situación para ${vesselId}. El buque parece estar en horario, pero recomiendo monitorear las condiciones climáticas y preparar planes de contingencia. El puerto opera al 85% de capacidad con buena disponibilidad de amarre.`,
      trace: [
        { type: "thinking", message: "Analizando el estado del buque y las condiciones del puerto..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} está actualmente en horario sin retrasos reportados` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "Puerto operando al 85% de capacidad con 3 amarraderos disponibles" },
        { type: "final", message: "Generé recomendaciones basadas en el estado operativo actual" }
      ]
    },
    French: {
      plan: [
        "Analysé les opérations portuaires actuelles et l'état des navires",
        "Identifié les perturbations potentielles et leurs impacts",
        "Généré des recommandations basées sur les données opérationnelles"
      ],
      recommendations: [
        {
          action: `Surveiller de près ${vesselId} pour tout retard`,
          impact_estimate: "Prévenir les retards en cascade dans les opérations portuaires",
          confidence: 0.85
        },
        {
          action: "Préparer des affectations d'amarrage alternatives",
          impact_estimate: "Réduire le temps d'attente de 2-3 heures",
          confidence: 0.75
        }
      ],
      explain: `Basé sur les données actuelles des opérations portuaires, j'ai analysé la situation pour ${vesselId}. Le navire semble être à l'heure, mais je recommande de surveiller les conditions météorologiques et de préparer des plans de contingence. Le port fonctionne à 85% de sa capacité avec une bonne disponibilité des postes d'amarrage.`,
      trace: [
        { type: "thinking", message: "Analyse de l'état du navire et des conditions portuaires..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} est actuellement à l'heure sans retard signalé` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "Port fonctionnant à 85% de capacité avec 3 postes d'amarrage disponibles" },
        { type: "final", message: "Généré des recommandations basées sur l'état opérationnel actuel" }
      ]
    },
    German: {
      plan: [
        "Analysierte aktuelle Hafenoperationen und Schiffsstatus",
        "Identifizierte potenzielle Störungen und deren Auswirkungen",
        "Generierte Empfehlungen basierend auf operativen Daten"
      ],
      recommendations: [
        {
          action: `${vesselId} eng auf Verzögerungen überwachen`,
          impact_estimate: "Kaskadierte Verzögerungen in Hafenoperationen verhindern",
          confidence: 0.85
        },
        {
          action: "Alternative Liegeplatzzuweisungen vorbereiten",
          impact_estimate: "Wartezeit um 2-3 Stunden reduzieren",
          confidence: 0.75
        }
      ],
      explain: `Basierend auf aktuellen Hafenoperationsdaten habe ich die Situation für ${vesselId} analysiert. Das Schiff scheint pünktlich zu sein, aber ich empfehle, die Wetterbedingungen zu überwachen und Notfallpläne vorzubereiten. Der Hafen arbeitet mit 85% Kapazität und guter Liegeplatzverfügbarkeit.`,
      trace: [
        { type: "thinking", message: "Analysiere Schiffsstatus und Hafenbedingungen..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} ist derzeit pünktlich ohne gemeldete Verzögerungen` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "Hafen arbeitet mit 85% Kapazität, 3 Liegeplätze verfügbar" },
        { type: "final", message: "Empfehlungen basierend auf aktuellem Betriebsstatus generiert" }
      ]
    },
    Japanese: {
      plan: [
        "現在の港湾運営と船舶状況を分析",
        "潜在的な混乱とその影響を特定",
        "運営データに基づく推奨事項を生成"
      ],
      recommendations: [
        {
          action: `${vesselId} の遅延を密接に監視`,
          impact_estimate: "港湾運営での連鎖的な遅延を防止",
          confidence: 0.85
        },
        {
          action: "代替バース割り当てを準備",
          impact_estimate: "待機時間を2-3時間短縮",
          confidence: 0.75
        }
      ],
      explain: `現在の港湾運営データに基づき、${vesselId} の状況を分析しました。船舶は予定通りに運行しているようですが、気象条件を監視し、緊急計画を準備することをお勧めします。港湾は85%の容量で運営され、良好なバース利用可能性があります。`,
      trace: [
        { type: "thinking", message: "船舶状況と港湾条件を分析中..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} は現在遅延なく予定通り` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "港湾は85%の容量で運営、3つのバースが利用可能" },
        { type: "final", message: "現在の運営状況に基づく推奨事項を生成" }
      ]
    },
    Korean: {
      plan: [
        "현재 항만 운영 및 선박 상태 분석",
        "잠재적 중단 및 영향 식별",
        "운영 데이터 기반 권장사항 생성"
      ],
      recommendations: [
        {
          action: `${vesselId} 지연 상황을 면밀히 모니터링`,
          impact_estimate: "항만 운영에서 연쇄적 지연 방지",
          confidence: 0.85
        },
        {
          action: "대체 선석 배정 준비",
          impact_estimate: "대기 시간 2-3시간 단축",
          confidence: 0.75
        }
      ],
      explain: `현재 항만 운영 데이터를 바탕으로 ${vesselId}의 상황을 분석했습니다. 선박은 일정대로 운항하고 있는 것으로 보이지만, 기상 조건을 모니터링하고 비상 계획을 준비하는 것을 권장합니다. 항만은 85% 용량으로 운영되며 선석 가용성이 양호합니다.`,
      trace: [
        { type: "thinking", message: "선박 상태 및 항만 조건 분석 중..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId}는 현재 지연 없이 일정대로` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "항만 85% 용량 운영, 3개 선석 이용 가능" },
        { type: "final", message: "현재 운영 상태 기반 권장사항 생성" }
      ]
    },
    Arabic: {
      plan: [
        "حللت عمليات الميناء الحالية وحالة السفن",
        "حددت الاضطرابات المحتملة وتأثيراتها",
        "ولدت توصيات بناءً على البيانات التشغيلية"
      ],
      recommendations: [
        {
          action: `مراقبة ${vesselId} عن كثب لأي تأخير`,
          impact_estimate: "منع التأخير المتتالي في عمليات الميناء",
          confidence: 0.85
        },
        {
          action: "إعداد تعيينات مراسي بديلة",
          impact_estimate: "تقليل وقت الانتظار 2-3 ساعات",
          confidence: 0.75
        }
      ],
      explain: `بناءً على بيانات عمليات الميناء الحالية، حللت الوضع لـ ${vesselId}. تبدو السفينة في الموعد المحدد، لكن أنصح بمراقبة الأحوال الجوية وإعداد خطط الطوارئ. الميناء يعمل بكفاءة 85% مع توفر جيد للمراسي.`,
      trace: [
        { type: "thinking", message: "تحليل حالة السفينة وظروف الميناء..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} حالياً في الموعد المحدد دون تأخير` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "الميناء يعمل بكفاءة 85% مع 3 مراسي متاحة" },
        { type: "final", message: "ولدت توصيات بناءً على الحالة التشغيلية الحالية" }
      ]
    },
    Russian: {
      plan: [
        "Проанализировал текущие портовые операции и состояние судов",
        "Выявил потенциальные сбои и их воздействие",
        "Сгенерировал рекомендации на основе операционных данных"
      ],
      recommendations: [
        {
          action: `Тесно следить за ${vesselId} на предмет задержек`,
          impact_estimate: "Предотвратить каскадные задержки в портовых операциях",
          confidence: 0.85
        },
        {
          action: "Подготовить альтернативные назначения причалов",
          impact_estimate: "Сократить время ожидания на 2-3 часа",
          confidence: 0.75
        }
      ],
      explain: `На основе текущих данных портовых операций я проанализировал ситуацию для ${vesselId}. Судно, похоже, идет по расписанию, но рекомендую следить за погодными условиями и готовить планы на случай непредвиденных обстоятельств. Порт работает на 85% мощности с хорошей доступностью причалов.`,
      trace: [
        { type: "thinking", message: "Анализирую состояние судна и портовые условия..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} в настоящее время идет по расписанию без задержек` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "Порт работает на 85% мощности, доступно 3 причала" },
        { type: "final", message: "Сгенерировал рекомендации на основе текущего операционного статуса" }
      ]
    },
    Thai: {
      plan: [
        "วิเคราะห์การดำเนินงานท่าเรือปัจจุบันและสถานะเรือ",
        "ระบุการหยุดชะงักที่อาจเกิดขึ้นและผลกระทบ",
        "สร้างคำแนะนำตามข้อมูลการดำเนินงาน"
      ],
      recommendations: [
        {
          action: `ติดตาม ${vesselId} อย่างใกล้ชิดสำหรับความล่าช้าใดๆ`,
          impact_estimate: "ป้องกันความล่าช้าต่อเนื่องในการดำเนินงานท่าเรือ",
          confidence: 0.85
        },
        {
          action: "เตรียมการจัดสรรท่าจอดเรือทางเลือก",
          impact_estimate: "ลดเวลารอคอย 2-3 ชั่วโมง",
          confidence: 0.75
        }
      ],
      explain: `จากข้อมูลการดำเนินงานท่าเรือปัจจุบัน ฉันได้วิเคราะห์สถานการณ์สำหรับ ${vesselId} เรือดูเหมือนจะตรงเวลา แต่ฉันแนะนำให้ติดตามสภาพอากาศและเตรียมแผนฉุกเฉิน ท่าเรือทำงานที่ 85% ของความจุพร้อมความพร้อมใช้งานของท่าจอดเรือที่ดี`,
      trace: [
        { type: "thinking", message: "วิเคราะห์สถานะเรือและสภาพท่าเรือ..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} ปัจจุบันตรงเวลาโดยไม่มีการรายงานความล่าช้า` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "ท่าเรือทำงานที่ 85% ของความจุพร้อมท่าจอดเรือ 3 ท่า" },
        { type: "final", message: "สร้างคำแนะนำตามสถานะการดำเนินงานปัจจุบัน" }
      ]
    },
    Italian: {
      plan: [
        "Analizzato le operazioni portuali attuali e lo stato delle navi",
        "Identificato potenziali interruzioni e i loro impatti",
        "Generato raccomandazioni basate sui dati operativi"
      ],
      recommendations: [
        {
          action: `Monitorare da vicino ${vesselId} per eventuali ritardi`,
          impact_estimate: "Prevenire ritardi a cascata nelle operazioni portuali",
          confidence: 0.85
        },
        {
          action: "Preparare assegnazioni alternative di ormeggio",
          impact_estimate: "Ridurre il tempo di attesa di 2-3 ore",
          confidence: 0.75
        }
      ],
      explain: `Basandomi sui dati attuali delle operazioni portuali, ho analizzato la situazione per ${vesselId}. La nave sembra essere in orario, ma raccomando di monitorare le condizioni meteorologiche e preparare piani di emergenza. Il porto opera all'85% della capacità con buona disponibilità di ormeggio.`,
      trace: [
        { type: "thinking", message: "Analizzando lo stato della nave e le condizioni del porto..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} è attualmente in orario senza ritardi segnalati` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "Porto operativo all'85% della capacità con 3 ormeggi disponibili" },
        { type: "final", message: "Generato raccomandazioni basate sullo stato operativo attuale" }
      ]
    },
    Portuguese: {
      plan: [
        "Analisei as operações portuárias atuais e o status dos navios",
        "Identifiquei interrupções potenciais e seus impactos",
        "Gerei recomendações baseadas em dados operacionais"
      ],
      recommendations: [
        {
          action: `Monitorar de perto ${vesselId} para qualquer atraso`,
          impact_estimate: "Prevenir atrasos em cascata nas operações portuárias",
          confidence: 0.85
        },
        {
          action: "Preparar atribuições alternativas de atracação",
          impact_estimate: "Reduzir tempo de espera em 2-3 horas",
          confidence: 0.75
        }
      ],
      explain: `Com base nos dados atuais das operações portuárias, analisei a situação para ${vesselId}. O navio parece estar no horário, mas recomendo monitorar as condições climáticas e preparar planos de contingência. O porto opera a 85% da capacidade com boa disponibilidade de atracação.`,
      trace: [
        { type: "thinking", message: "Analisando status do navio e condições portuárias..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} está atualmente no horário sem atrasos reportados` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "Porto operando a 85% da capacidade com 3 atracações disponíveis" },
        { type: "final", message: "Gerei recomendações baseadas no status operacional atual" }
      ]
    },
    English: {
      plan: [
        "Analyzed current port operations and vessel status",
        "Identified potential disruptions and their impacts",
        "Generated recommendations based on operational data"
      ],
      recommendations: [
        {
          action: `Monitor ${vesselId} closely for any delays`,
          impact_estimate: "Prevent cascading delays across port operations",
          confidence: 0.85
        },
        {
          action: "Prepare alternative berth assignments",
          impact_estimate: "Reduce waiting time by 2-3 hours",
          confidence: 0.75
        }
      ],
      explain: `Based on the current port operations data, I've analyzed the situation for ${vesselId}. The vessel appears to be on schedule, but I recommend monitoring weather conditions and preparing contingency plans. The port is operating at 85% capacity with good berth availability.`,
      trace: [
        { type: "thinking", message: "Analyzing vessel status and port conditions..." },
        { type: "action", actionName: "check_vessel_status", arguments: { vessel_id: vesselId } },
        { type: "observation", observation: `${vesselId} is currently on schedule with no delays reported` },
        { type: "action", actionName: "check_berth_availability", arguments: {} },
        { type: "observation", observation: "Port operating at 85% capacity with 3 berths available" },
        { type: "final", message: "Generated recommendations based on current operational status" }
      ]
    }
  };

  const response = responses[language as keyof typeof responses] || responses.English;

  return {
    plan: response.plan,
    recommendations: response.recommendations,
    sources: [`vessels:${vesselId}`, "weather:Current", "ports:Singapore"],
    explain: response.explain,
    trace: response.trace
  };
};
