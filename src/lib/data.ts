
export interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  pronunciationAudio?: string; // URL
  exampleSentenceEn: string;
  exampleSentenceZh: string;
}

export interface VocabularyPack {
  id: string;
  name: string;
  description: string;
  items: VocabularyItem[];
  icon?: string; // For lucide icon name
}

export interface DialogueLine {
  id: string;
  speaker: string; // 'Officer A', 'Pilot', 'System'
  english: string;
  chinese: string;
  audio?: string; // URL for this line
}

export interface Dialogue {
  id:string;
  title: string;
  description: string;
  lines: DialogueLine[];
  icon?: string; // For lucide icon name
}

export const vocabularyPacks: VocabularyPack[] = [
  {
    id: "basic-aviation-terms",
    name: "Basic Aviation Terms",
    description: "Essential vocabulary for understanding basic aviation concepts.",
    icon: "PlaneTakeoff",
    items: [
      { id: "vt001", english: "Altitude", chinese: "高度", exampleSentenceEn: "The aircraft is cruising at an altitude of 30,000 feet.", exampleSentenceZh: "飞机正在30,000英尺的高度巡航。" },
      { id: "vt002", english: "Runway", chinese: "跑道", exampleSentenceEn: "The pilot aligned the plane with the runway for landing.", exampleSentenceZh: "飞行员将飞机对准跑道准备降落。" },
      { id: "vt003", english: "Cockpit", chinese: "驾驶舱", exampleSentenceEn: "The captain and first officer are in the cockpit.", exampleSentenceZh: "机长和副驾驶在驾驶舱内。" },
      { id: "vt004", english: "Air Traffic Control (ATC)", chinese: "空中交通管制", exampleSentenceEn: "Pilots must follow instructions from Air Traffic Control.", exampleSentenceZh: "飞行员必须听从空中交通管制的指令。" },
      { id: "vt005", english: "Turbulence", chinese: "颠簸", exampleSentenceEn: "Passengers were asked to fasten their seatbelts due to turbulence.", exampleSentenceZh: "由于颠簸，乘客被要求系好安全带。" },
    ],
  },
  {
    id: "safety-equipment",
    name: "Safety Equipment",
    description: "Vocabulary related to aircraft safety equipment.",
    icon: "ShieldCheck",
    items: [
      { id: "vt006", english: "Life Vest", chinese: "救生衣", exampleSentenceEn: "Locate your life vest under your seat.", exampleSentenceZh: "救生衣在您的座位下方。" },
      { id: "vt007", english: "Oxygen Mask", chinese: "氧气面罩", exampleSentenceEn: "In case of cabin depressurization, oxygen masks will drop automatically.", exampleSentenceZh: "如果机舱失压，氧气面罩会自动落下。" },
      { id: "vt008", english: "Emergency Exit", chinese: "紧急出口", exampleSentenceEn: "Familiarize yourself with the nearest emergency exit.", exampleSentenceZh: "请熟悉离您最近的紧急出口。" },
    ],
  },
];

export const dialogues: Dialogue[] = [
  {
    id: "pre-flight-check",
    title: "Pre-Flight Check",
    description: "A dialogue between an officer and a pilot during pre-flight.",
    icon: "ClipboardList",
    lines: [
      { id: "dl001", speaker: "Safety Officer", english: "Good morning, Captain. Ready for the pre-flight walk-around?", chinese: "早上好，机长。准备好进行飞行前绕机检查了吗？" },
      { id: "dl002", speaker: "Pilot", english: "Good morning. Yes, let's begin. Anything specific I should look out for?", chinese: "早上好。是的，我们开始吧。有什么特别需要注意的吗？" },
      { id: "dl003", speaker: "Safety Officer", english: "Just the usual checks: tires, control surfaces, and ensure all panels are secure.", chinese: "就是常规检查：轮胎、操纵面，并确保所有盖板都已固定。" },
      { id: "dl004", speaker: "Pilot", english: "Understood. We'll also double-check the chocks and landing gear pins.", chinese: "明白。我们也会再次检查轮挡和起落架销。" },
    ],
  },
  {
    id: "in-flight-incident",
    title: "In-Flight Incident Reporting",
    description: "Dialogue for reporting a minor in-flight incident to ATC.",
    icon: "TriangleAlert",
    lines: [
      { id: "dl005", speaker: "Pilot", english: "Mayday, Mayday, Mayday, SkyAir 123, experiencing moderate turbulence and a minor hydraulic leak.", chinese: "Mayday, Mayday, Mayday, 天空航空123，遭遇中度颠簸和轻微液压泄漏。" },
      { id: "dl006", speaker: "ATC", english: "SkyAir 123, roger Mayday. Say intentions.", chinese: "天空航空123，收到Mayday。请说明您的意图。" },
      { id: "dl007", speaker: "Pilot", english: "SkyAir 123, requesting priority landing at nearest suitable airport. Maintaining current altitude.", chinese: "天空航空123，请求在最近的合适机场优先降落。保持当前高度。" },
      { id: "dl008", speaker: "ATC", english: "SkyAir 123, understood. Turn left heading 270, descend and maintain flight level one zero zero. Nearest airport is Capital City, runway 09 available.", chinese: "天空航空123，明白。左转航向270，下降并保持高度层100。最近机场是首都机场，09号跑道可用。" },
    ],
  },
  {
    id: "fighting-on-plane",
    title: "打架斗殴 (Fighting and Brawling)",
    description: "处理机上乘客打架斗殴情景的模拟对话。",
    icon: "ShieldAlert",
    lines: [
      { id: "dl-fight-001", speaker: "Security Officer", english: "Calm down, both of you! Can you tell me what happened?", chinese: "你们两个冷静一下！能告诉我什么原因吗？" },
      { id: "dl-fight-002", speaker: "Passenger A", english: "He bumped into me on purpose!", chinese: "他路过的时候故意撞我！" },
      { id: "dl-fight-003", speaker: "Passenger B", english: "No! He swore at me!", chinese: "不是！是他向我说脏话！" },
      { id: "dl-fight-004", speaker: "Security Officer", english: "I'm the security officer of this flight. Your behavior is affecting flight safety.", chinese: "我是本次航班的安全员，你们的行为已经影响到了飞行安全。" },
      { id: "dl-fight-005", speaker: "Passenger A", english: "Change his seat, or I will beat him up.", chinese: "你把他换到别的位置，否则我还会动手！" },
      { id: "dl-fight-006", speaker: "Security Officer", english: "If you do not stop right now, I'll report to the captain to call the police to handle it!", chinese: "如果你们不停止你们的行为，我将会报告机长，让机长通知地面公安进行处置！" },
    ],
  },
];

// Quiz data can be generated from vocabulary/dialogues or defined separately
// For now, quiz logic will pick from these.

    