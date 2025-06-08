
export interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  partOfSpeech?: string; // 词性：noun, verb, adjective, adverb, etc.
  pronunciationAudio?: string; // URL
  exampleSentenceEn: string;
  exampleSentenceZh: string;
  additionalExamples?: Array<{
    english: string;
    chinese: string;
  }>;
  commonUsages?: Array<{
    phrase: string;
    translation: string;
    example?: string;
  }>;
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
    id: "aviation-fundamentals-cabin-safety",
    name: "飞行基础与客舱安全",
    description: "涵盖基础航空术语、安全设备及机上物品词汇。",
    icon: "PlaneTakeoff",
    items: [
      // Basic Aviation Terms
      { 
        id: "vt001", 
        english: "Altitude", 
        chinese: "高度", 
        partOfSpeech: "noun",
        exampleSentenceEn: "The aircraft is cruising at an altitude of 30,000 feet.", 
        exampleSentenceZh: "飞机正在30,000英尺的高度巡航。",
        additionalExamples: [
          {
            english: "We need to maintain this altitude for safety.",
            chinese: "为了安全，我们需要保持这个高度。"
          },
          {
            english: "The pilot adjusted the altitude to avoid turbulence.",
            chinese: "飞行员调整了高度以避免颠簸。"
          }
        ],
        commonUsages: [
          {
            phrase: "cruising altitude",
            translation: "巡航高度",
            example: "We have reached our cruising altitude of 35,000 feet."
          },
          {
            phrase: "altitude sickness",
            translation: "高原反应",
            example: "Some passengers may experience altitude sickness."
          },
          {
            phrase: "lose altitude",
            translation: "失去高度/下降",
            example: "The aircraft began to lose altitude rapidly."
          }
        ]
      },
      { 
        id: "vt002", 
        english: "Runway", 
        chinese: "跑道", 
        partOfSpeech: "noun",
        exampleSentenceEn: "The pilot aligned the plane with the runway for landing.", 
        exampleSentenceZh: "飞行员将飞机对准跑道准备降落。",
        additionalExamples: [
          {
            english: "The runway is clear for takeoff.",
            chinese: "跑道已清空，可以起飞。"
          },
          {
            english: "Due to strong winds, we changed to a different runway.",
            chinese: "由于强风，我们改用了另一条跑道。"
          }
        ],
        commonUsages: [
          {
            phrase: "runway lights",
            translation: "跑道灯",
            example: "The runway lights guide pilots during night landings."
          },
          {
            phrase: "clear the runway",
            translation: "清空跑道",
            example: "All aircraft must clear the runway immediately."
          },
          {
            phrase: "runway approach",
            translation: "跑道进近",
            example: "Begin your runway approach at 2,000 feet."
          }
        ]
      },
      { id: "vt003", english: "Cockpit", chinese: "驾驶舱", exampleSentenceEn: "The captain and first officer are in the cockpit.", exampleSentenceZh: "机长和副驾驶在驾驶舱内。" },
      { id: "vt004", english: "Air Traffic Control (ATC)", chinese: "空中交通管制", exampleSentenceEn: "Pilots must follow instructions from Air Traffic Control.", exampleSentenceZh: "飞行员必须听从空中交通管制的指令。" },
      { 
        id: "vt005", 
        english: "Turbulence", 
        chinese: "颠簸", 
        partOfSpeech: "noun",
        exampleSentenceEn: "Passengers were asked to fasten their seatbelts due to turbulence.", 
        exampleSentenceZh: "由于颠簸，乘客被要求系好安全带。",
        additionalExamples: [
          {
            english: "The aircraft encountered severe turbulence over the mountains.",
            chinese: "飞机在山区上空遇到了严重颠簸。"
          },
          {
            english: "Light turbulence is expected during the first hour of flight.",
            chinese: "预计飞行第一小时会有轻微颠簸。"
          }
        ],
        commonUsages: [
          {
            phrase: "severe turbulence",
            translation: "严重颠簸",
            example: "We are experiencing severe turbulence, please remain seated."
          },
          {
            phrase: "clear air turbulence",
            translation: "晴空颠簸",
            example: "Clear air turbulence is difficult to predict."
          },
          {
            phrase: "turbulence ahead",
            translation: "前方颠簸",
            example: "There is turbulence ahead, please fasten your seatbelts."
          }
        ]
      },
      // Safety Equipment
      { id: "vt006", english: "Life Vest", chinese: "救生衣", exampleSentenceEn: "Locate your life vest under your seat.", exampleSentenceZh: "救生衣在您的座位下方。" },
      { id: "vt007", english: "Oxygen Mask", chinese: "氧气面罩", exampleSentenceEn: "In case of cabin depressurization, oxygen masks will drop automatically.", exampleSentenceZh: "如果机舱失压，氧气面罩会自动落下。" },
      { id: "vt008", english: "Emergency Exit", chinese: "紧急出口", exampleSentenceEn: "Familiarize yourself with the nearest emergency exit.", exampleSentenceZh: "请熟悉离您最近的紧急出口。" },
      // Onboard Equipment & Items
      { id: "vt028", english: "Lavatory", chinese: "洗手间/厕所", exampleSentenceEn: "A passenger was smoking in the lavatory.", exampleSentenceZh: "一名旅客在厕所吸烟。" },
      { id: "vt029", english: "Power Bank", chinese: "充电宝", exampleSentenceEn: "Please do not use the power bank.", exampleSentenceZh: "请不要使用充电宝。" },
      { id: "vt030", english: "Electronic Equipment", chinese: "电子设备", exampleSentenceEn: "One passenger used electronic equipment in violation of regulations.", exampleSentenceZh: "有一名旅客违规使用电子设备。" },
      { id: "vt031", english: "Mobile Phone", chinese: "手机", exampleSentenceEn: "Please switch your phone to flight mode.", exampleSentenceZh: "请将手机调至飞行模式。" },
      { id: "vt032", english: "Flight Mode", chinese: "飞行模式", exampleSentenceEn: "Switch your phone to flight mode immediately.", exampleSentenceZh: "请立即将手机调至飞行模式。" },
      { id: "vt033", english: "Cigarettes", chinese: "香烟", exampleSentenceEn: "I have confiscated his cigarettes.", exampleSentenceZh: "我已经没收了他的香烟。" },
      { id: "vt034", english: "Lighter", chinese: "打火机", exampleSentenceEn: "I have confiscated his lighter.", exampleSentenceZh: "我已经没收了他的打火机。" },
      { id: "vt035", english: "Electronic Cigarette", chinese: "电子烟", exampleSentenceEn: "I smoke an electronic cigarette.", exampleSentenceZh: "我抽的是电子烟。" },
      { id: "vt036", english: "Cigarette End", chinese: "烟头", exampleSentenceEn: "Where did you put your cigarette end?", exampleSentenceZh: "你把烟头丢在哪里了？" },
      { id: "vt037", english: "Boarding Pass", chinese: "登机牌", exampleSentenceEn: "Please show me your boarding pass.", exampleSentenceZh: "请给我你们的登机牌。" },
      { id: "vt038", english: "Metal Tableware", chinese: "金属餐具", exampleSentenceEn: "Don't provide metal tableware.", exampleSentenceZh: "不要提供金属餐具。" },
      { id: "vt039", english: "Alcoholic Drinks", chinese: "酒精饮料", exampleSentenceEn: "Don't provide alcoholic drinks.", exampleSentenceZh: "不要提供酒精饮料。" },
      { id: "vt040", english: "Documents", chinese: "文件", exampleSentenceEn: "I received two documents from the sales department.", exampleSentenceZh: "我从公司营业部那边收到了两份文件。" },
      { id: "vt041", english: "Passport", chinese: "护照", exampleSentenceEn: "Here are their documents and passports.", exampleSentenceZh: "这是遣返的证明和护照。" },
      { id: "vt042", english: "Luggage", chinese: "行李", exampleSentenceEn: "Please check and confirm your luggage.", exampleSentenceZh: "请检查并确认一下你们的行李。" },
      { id: "vt043", english: "Seat", chinese: "座位", exampleSentenceEn: "Change his seat.", exampleSentenceZh: "把他换到别的位置。" },
      { id: "vt044", english: "Row", chinese: "排", exampleSentenceEn: "Your seat is in the back row.", exampleSentenceZh: "您的座位在后一排。" },
      { id: "vt045", english: "Window-side", chinese: "靠窗", exampleSentenceEn: "My seat is window-side!", exampleSentenceZh: "我的座位是靠窗的！" },
      // 飞行相关基础词汇 (Pre-flight checks etc.)
      { id: "vt022", english: "Walk-around", chinese: "绕机检查", exampleSentenceEn: "Ready for the pre-flight walk-around?", exampleSentenceZh: "准备好进行飞行前绕机检查了吗？" },
      { id: "vt023", english: "Control Surfaces", chinese: "操纵面", exampleSentenceEn: "Check the control surfaces.", exampleSentenceZh: "检查操纵面。" },
      { id: "vt024", english: "Panels", chinese: "盖板", exampleSentenceEn: "Ensure all panels are secure.", exampleSentenceZh: "确保所有盖板都已固定。" },
      { id: "vt025", english: "Chocks", chinese: "轮挡", exampleSentenceEn: "We'll double-check the chocks.", exampleSentenceZh: "我们会再次检查轮挡。" },
      { id: "vt026", english: "Landing Gear Pins", chinese: "起落架销", exampleSentenceEn: "Check the landing gear pins.", exampleSentenceZh: "检查起落架销。" },
      // 乘客相关基础词汇 (General passenger interaction)
      { id: "vt061", english: "Board", chinese: "登机", exampleSentenceEn: "Please let the deportees board first.", exampleSentenceZh: "请让遣返旅客先登机。" },
      { id: "vt062", english: "Disembark", chinese: "下机/下飞机", exampleSentenceEn: "Please be the last to disembark.", exampleSentenceZh: "请你在落地后最后一个下机。" },
      { id: "vt046", english: "Calm Down", chinese: "冷静", exampleSentenceEn: "Calm down, both of you!", exampleSentenceZh: "你们两个冷静一下！" },
      { 
        id: "vt056", 
        english: "Cooperate", 
        chinese: "配合", 
        partOfSpeech: "verb",
        exampleSentenceEn: "Please cooperate.", 
        exampleSentenceZh: "请配合！",
        additionalExamples: [
          {
            english: "We need all passengers to cooperate during the security check.",
            chinese: "我们需要所有乘客在安全检查期间配合。"
          },
          {
            english: "The passenger refused to cooperate with the crew instructions.",
            chinese: "该乘客拒绝配合机组人员的指示。"
          }
        ],
        commonUsages: [
          {
            phrase: "cooperate with",
            translation: "与...配合",
            example: "Please cooperate with our security procedures."
          },
          {
            phrase: "refuse to cooperate",
            translation: "拒绝配合",
            example: "The passenger refused to cooperate with safety instructions."
          },
          {
            phrase: "full cooperation",
            translation: "全力配合",
            example: "We appreciate your full cooperation during this investigation."
          }
        ]
      },
      { id: "vt058", english: "Attitude", chinese: "态度", exampleSentenceEn: "His attitude is very poor.", exampleSentenceZh: "这位旅客态度很差。" },
      { id: "vt059", english: "Reject", chinese: "拒绝", exampleSentenceEn: "He rejected our advice.", exampleSentenceZh: "拒绝我们的劝告。" },
      { id: "vt060", english: "Manage Behavior", chinese: "控制自己", exampleSentenceEn: "Can you manage your behavior?", exampleSentenceZh: "您能控制好自己吗？" },
      { id: "vt063", english: "Personal Reasons", chinese: "个人原因", exampleSentenceEn: "Left the aircraft due to personal reasons.", exampleSentenceZh: "由于个人原因已经离开了飞机。" },
    ],
  },
  {
    id: "security-operations-emergency-response",
    name: "安保操作与应急处理",
    description: "专注于航空安保操作、旅客行为管理及紧急情况处理词汇。",
    icon: "ShieldAlert",
    items: [
      // Security Operations Terms
      { id: "vt009", english: "Security Officer", chinese: "安全员", exampleSentenceEn: "I'm the security officer of this flight.", exampleSentenceZh: "我是本次航班的安全员。" },
      { id: "vt010", english: "Surveillance", chinese: "监控", exampleSentenceEn: "Please keep this passenger closely under surveillance.", exampleSentenceZh: "请对该旅客持续做好监控。" },
      { 
        id: "vt011", 
        english: "Confiscate", 
        chinese: "没收", 
        partOfSpeech: "verb",
        exampleSentenceEn: "I have confiscated his cigarettes and lighter.", 
        exampleSentenceZh: "我已经没收了该乘客的香烟及打火机。",
        additionalExamples: [
          {
            english: "Security will confiscate any prohibited items.",
            chinese: "安保人员将没收任何违禁物品。"
          },
          {
            english: "The officer had to confiscate the passenger's electronic device.",
            chinese: "安全员不得不没收该乘客的电子设备。"
          }
        ],
        commonUsages: [
          {
            phrase: "confiscate items",
            translation: "没收物品",
            example: "We need to confiscate all dangerous items."
          },
          {
            phrase: "confiscation procedure",
            translation: "没收程序",
            example: "Follow the standard confiscation procedure."
          },
          {
            phrase: "temporarily confiscate",
            translation: "临时没收",
            example: "We will temporarily confiscate this device."
          }
        ]
      },
      { id: "vt013", english: "Security Check", chinese: "安保检查", exampleSentenceEn: "The cabin security check is finished.", exampleSentenceZh: "客舱安保检查完毕。" },
      { id: "vt014", english: "Aircraft Security Check List", chinese: "航空器安保检查单", exampleSentenceEn: "Please follow the Aircraft Security Check List.", exampleSentenceZh: "请大家按照《航空器安保检查单》进行检查。" },
      { id: "vt015", english: "Information Reminder Form", chinese: "信息提示单", exampleSentenceEn: "Please complete the Information Reminder Form.", exampleSentenceZh: "请写好《信息提示单》后交给我。" },
      { id: "vt016", english: "Security Level", chinese: "勤务等级", exampleSentenceEn: "The security level for this flight is level three.", exampleSentenceZh: "目前的勤务等级为三级。" },
      { id: "vt017", english: "Security Procedure", chinese: "空防预案", exampleSentenceEn: "How about the security procedure?", exampleSentenceZh: "空防预案如何？" },
      { id: "vt018", english: "Security Codes", chinese: "暗语暗号", exampleSentenceEn: "Our security codes are according to company procedures.", exampleSentenceZh: "我们的暗语暗号按照公司程序。" },
      { id: "vt019", english: "Localized Check", chinese: "局部检查", exampleSentenceEn: "A localized check is enough.", exampleSentenceZh: "局部的检查就足够了。" },
      { id: "vt020", english: "Clear Cabin", chinese: "清舱", exampleSentenceEn: "I will give you the report after I finish clearing the cabin.", exampleSentenceZh: "清舱后我会向您报告。" },
      { id: "vt021", english: "Explosive Detector", chinese: "爆探", exampleSentenceEn: "The detector is ready for inspection now.", exampleSentenceZh: "爆探已经准备好检测。" },
      { id: "vt027", english: "Record Audio and Video", chinese: "录音录像", exampleSentenceEn: "I will record audio and video.", exampleSentenceZh: "现在对执勤过程录音录像。" },
      // Passenger Behavior Management (items not already in pack 1)
      { id: "vt047", english: "Fighting", chinese: "打架斗殴", exampleSentenceEn: "Fighting and brawling on the plane.", exampleSentenceZh: "机上打架斗殴。" },
      { id: "vt048", english: "Bump Into", chinese: "撞", exampleSentenceEn: "He bumped into me on purpose!", exampleSentenceZh: "他路过的时候故意撞我！" },
      { id: "vt049", english: "Swear", chinese: "说脏话", exampleSentenceEn: "He swore at me!", exampleSentenceZh: "他向我说脏话！" },
      { id: "vt050", english: "Beat Up", chinese: "动手/打", exampleSentenceEn: "I will beat him up.", exampleSentenceZh: "我还会动手！" },
      { id: "vt051", english: "Smoking", chinese: "吸烟", exampleSentenceEn: "A passenger was smoking in the lavatory.", exampleSentenceZh: "一名旅客在厕所吸烟。" },
      { 
        id: "vt052", 
        english: "Intoxicated", 
        chinese: "醉酒", 
        partOfSpeech: "adjective",
        exampleSentenceEn: "May I ask if you have been drinking?", 
        exampleSentenceZh: "请问您是不是喝酒了？",
        additionalExamples: [
          {
            english: "The passenger appears to be intoxicated and disruptive.",
            chinese: "该乘客似乎醉酒并且有破坏性行为。"
          },
          {
            english: "Intoxicated passengers are not allowed to board the aircraft.",
            chinese: "醉酒的乘客不允许登机。"
          }
        ],
        commonUsages: [
          {
            phrase: "heavily intoxicated",
            translation: "严重醉酒",
            example: "The passenger was heavily intoxicated and causing disturbance."
          },
          {
            phrase: "appear intoxicated",
            translation: "看起来醉酒",
            example: "Several passengers appear intoxicated after the party."
          },
          {
            phrase: "intoxicated behavior",
            translation: "醉酒行为",
            example: "We cannot tolerate intoxicated behavior on this flight."
          }
        ]
      },
      { id: "vt053", english: "Deportee", chinese: "遣返旅客", exampleSentenceEn: "We have two deportees.", exampleSentenceZh: "有两名遣返旅客。" },
      { id: "vt054", english: "Escort", chinese: "押解", exampleSentenceEn: "A suspect escorted by three police officers.", exampleSentenceZh: "一名嫌疑人，由三名警官押解。" },
      { id: "vt055", english: "Suspect", chinese: "嫌疑人", exampleSentenceEn: "There will be a suspect escorted.", exampleSentenceZh: "本次航班将有一名嫌疑人。" },
      { id: "vt057", english: "Violate Regulations", chinese: "违规", exampleSentenceEn: "Used equipment in violation of regulations.", exampleSentenceZh: "违规使用设备。" },
      { id: "vt064", english: "Discontinue Journey", chinese: "终止行程", exampleSentenceEn: "Two passengers want to end their trip.", exampleSentenceZh: "有两名乘客想要终止本次行程。" },
      // Emergency Situations
      { id: "vt065", english: "Flight Safety", chinese: "飞行安全", exampleSentenceEn: "Your behavior is affecting flight safety.", exampleSentenceZh: "你们的行为已经影响到了飞行安全。" },
      { id: "vt066", english: "Call the Police", chinese: "报警", exampleSentenceEn: "I suggest we call the police to handle it.", exampleSentenceZh: "建议机长报警处理。" },
      { id: "vt067", english: "Ground Police", chinese: "地面公安", exampleSentenceEn: "We need to call the ground police.", exampleSentenceZh: "我们需要呼叫地面公安来处理。" },
      { id: "vt068", english: "Threat", chinese: "威胁", exampleSentenceEn: "Smoking is a serious threat to flight safety.", exampleSentenceZh: "吸烟是严重威胁飞行安全的。" },
      { id: "vt069", english: "Endanger", chinese: "危害", exampleSentenceEn: "Your behavior has seriously endangered our flight safety.", exampleSentenceZh: "你的行为已经严重危害到了我们的飞行安全。" },
      { id: "vt070", english: "Explosive", chinese: "爆炸物", exampleSentenceEn: "We found an explosive in the lavatory.", exampleSentenceZh: "我们在厕所发现疑似炸弹。" },
      { id: "vt071", english: "Hijacking", chinese: "劫机", exampleSentenceEn: "We have a hijacking situation.", exampleSentenceZh: "我们遇到了劫机。" },
      { id: "vt072", english: "Divert", chinese: "改变航向", exampleSentenceEn: "Tried to force the cabin crew to divert the aircraft.", exampleSentenceZh: "试图胁迫乘务员改变飞机航向。" },
      { id: "vt073", english: "Under Control", chinese: "得到控制", exampleSentenceEn: "The situation is under control.", exampleSentenceZh: "情况已得到控制。" },
      { id: "vt074", english: "Stop/Subdue", chinese: "制服", exampleSentenceEn: "I have stopped him.", exampleSentenceZh: "我已将其制服。" },
      { id: "vt075", english: "Mayday", chinese: "紧急呼叫", exampleSentenceEn: "Mayday, Mayday, Mayday.", exampleSentenceZh: "Mayday, Mayday, Mayday（国际紧急呼叫）。" },
      { id: "vt076", english: "Priority Landing", chinese: "优先降落", exampleSentenceEn: "Requesting priority landing at nearest suitable airport.", exampleSentenceZh: "请求在最近的合适机场优先降落。" },
      { id: "vt077", english: "Hydraulic Leak", chinese: "液压泄漏", exampleSentenceEn: "Experiencing a minor hydraulic leak.", exampleSentenceZh: "遭遇轻微液压泄漏。" },
      { id: "vt078", english: "Depressurization", chinese: "失压", exampleSentenceEn: "In case of cabin depressurization.", exampleSentenceZh: "如果机舱失压。" },
      { id: "vt079", english: "Warning", chinese: "警告", exampleSentenceEn: "I have given him a warning.", exampleSentenceZh: "我已发出了警告。" },
      { id: "vt080", english: "Consequences", chinese: "后果", exampleSentenceEn: "You will bear the consequences.", exampleSentenceZh: "由此产生的后果你自己承担。" },
      { id: "vt081", english: "CAAC Regulations", chinese: "中国民航法规", exampleSentenceEn: "According to the CAAC regulations.", exampleSentenceZh: "根据中国民航法规定。" },
      { id: "vt082", english: "Procedure", chinese: "程序", exampleSentenceEn: "Deal with it according to procedure.", exampleSentenceZh: "按照预案处置。" },
      { id: "vt083", english: "Report", chinese: "报告", exampleSentenceEn: "I'll report to the captain.", exampleSentenceZh: "我将会报告机长。" },
      { id: "vt084", english: "Handle", chinese: "处理/处置", exampleSentenceEn: "How did you handle it?", exampleSentenceZh: "你是如何处置的？" },
      { id: "vt085", english: "Security Requirements", chinese: "安保要求", exampleSentenceEn: "Are there any security requirements?", exampleSentenceZh: "安保有什么要求？" },
    ],
  },
];

export const dialogues: Dialogue[] = [
  {
    id: "dialogue-1-fighting-brawling",
    title: "打架斗殴",
    description: "安全员处理乘客间的肢体冲突。",
    icon: "ShieldAlert",
    lines: [
      { id: "d1-line-1", speaker: "Security Officer", english: "Calm down, both of you! Can you tell me what happened?", chinese: "你们两个冷静一下！能告诉我什么原因吗？" },
      { id: "d1-line-2", speaker: "Passenger A", english: "He bumped into me on purpose!", chinese: "他路过的时候故意撞我！" },
      { id: "d1-line-3", speaker: "Passenger B", english: "No! He swore at me!", chinese: "不是！是他向我说脏话！" },
      { id: "d1-line-4", speaker: "Security Officer", english: "I'm the security officer of this flight. Your behavior is affecting flight safety.", chinese: "我是本次航班的安全员，你们的行为已经影响到了飞行安全。" },
      { id: "d1-line-5", speaker: "Passenger A", english: "Change his seat, or I will beat him up.", chinese: "你把他换到别的位置，否则我还会动手！" },
      { id: "d1-line-6", speaker: "Security Officer", english: "If you do not stop right now, I'll report to the captain to call the police to handle it!", chinese: "如果你们不停止你们的行为，我将会报告机长，让机长通知地面公安进行处置！" }
    ]
  },
  {
    id: "dialogue-2-cockpit-comm-smoking",
    title: "与驾驶舱沟通-旅客吸烟事件",
    description: "安全员向机长报告旅客吸烟情况及处理建议。",
    icon: "MessageCircleWarning",
    lines: [
      { id: "d2-line-1", speaker: "Security Officer", english: "Captain, we found a passenger smoking in the lavatory.", chinese: "机长，发现一名旅客在厕所吸烟。" },
      { id: "d2-line-2", speaker: "Captain", english: "What's going on?", chinese: "现在情况如何？" },
      { id: "d2-line-3", speaker: "Security Officer", english: "We have the situation under control and I have confiscated his cigarettes and lighter. I suggest we call the police to handle it.", chinese: "我们已将事态控制并已经没收了该乘客的香烟及打火机。建议机长报警处理。" },
      { id: "d2-line-4", speaker: "Captain", english: "Good job! Please complete the \"Information Reminder Form\" and submit it to me.", chinese: "做得好！请写好《信息提示单》后交给我。" },
      { id: "d2-line-5", speaker: "Security Officer", english: "Yes, I will fill out the relevant documents immediately.", chinese: "是的，我马上填写相关单据。" },
      { id: "d2-line-6", speaker: "Captain", english: "Please keep this passenger closely under surveillance.", chinese: "请对该旅客持续做好监控。" },
      { id: "d2-line-7", speaker: "Security Officer", english: "Yes, and I have recorded his information.", chinese: "是的，我已对该旅客的信息作好记录。" }
    ]
  },
  {
    id: "dialogue-3-handling-passenger-smoking",
    title: "旅客吸烟事件处置",
    description: "安全员现场处理旅客在洗手间吸烟的行为。",
    icon: "FlameOff",
    lines: [
      { id: "d3-line-1", speaker: "Security Officer", english: "I'm the security officer on this flight, responsible for security work onboard. I will record audio and video. Please cooperate. Are you smoking in the restroom?", chinese: "你好，我是本次航班的安全员，负责机上安保工作，现在对执勤过程录音录像请配合！你是在洗手间吸烟了是吗？" },
      { id: "d3-line-2", speaker: "Passenger", english: "I'm sorry, yes I did.", chinese: "是的，我很抱歉。" },
      { id: "d3-line-3", speaker: "Security Officer", english: "Where did you put your cigarette end?", chinese: "请问你把烟头丢在哪里了？" },
      { id: "d3-line-4", speaker: "Passenger", english: "I smoke an electronic cigarette.", chinese: "我抽的是电子烟。" },
      { id: "d3-line-5", speaker: "Security Officer", english: "Smoking is a serious threat to flight safety, so we will call the police. Please be the last to disembark after landing.", chinese: "吸烟是严重威胁飞行安全的，所以我们会报警，请你在落地后最后一个下机。" },
      { id: "d3-line-6", speaker: "Passenger", english: "Sorry, it was my fault.", chinese: "不好意思，是我的错。" }
    ]
  },
  {
    id: "dialogue-4-unauthorized-power-bank",
    title: "擅自使用充电宝",
    description: "安全员制止旅客违规使用充电宝。",
    icon: "BatteryWarning",
    lines: [
      { id: "d4-line-1", speaker: "Security Officer", english: "Excuse me, please do not use the power bank.", chinese: "你好，请不要使用充电宝。" },
      { id: "d4-line-2", speaker: "Passenger", english: "But my cell phone is out of battery.", chinese: "但是我的手机没电了。" },
      { id: "d4-line-3", speaker: "Security Officer", english: "According to the CAAC regulations, the power bank cannot be used during the flight.", chinese: "根据中国民航法规定，在飞行过程中是不允许使用充电宝的。" },
      { id: "d4-line-4", speaker: "Passenger", english: "How do I inform my family when I land?", chinese: "那我落地后怎么通知家人？" },
      { id: "d4-line-5", speaker: "Security Officer", english: "You can use my phone if you need, and you can charge your phone when you disembark.", chinese: "如果需要，您可以落地后用我的手机，等您下飞机之后再给您的电话充电。" },
      { id: "d4-line-6", speaker: "Passenger", english: "OK, thank you.", chinese: "那好吧，谢谢。" }
    ]
  },
  {
    id: "dialogue-5-intoxicated-passenger",
    title: "醉酒旅客",
    description: "安全员与疑似醉酒旅客沟通并评估情况。",
    icon: "UserMinus",
    lines: [
      { id: "d5-line-1", speaker: "Security Officer", english: "Excuse me, may I ask if you have been drinking?", chinese: "您好，请问您是不是喝酒了？" },
      { id: "d5-line-2", speaker: "Passenger", english: "Yes, what's the matter?", chinese: "是的，怎么了？" },
      { id: "d5-line-3", speaker: "Security Officer", english: "It's OK. Do you have any friends with you?", chinese: "没什么，请问您有朋友跟您一起吗？" },
      { id: "d5-line-4", speaker: "Passenger", english: "Yes, there are two other friends who boarded the plane with me.", chinese: "有的，还有两位朋友跟我一起上机的。" },
      { id: "d5-line-5", speaker: "Security Officer", english: "Can you manage your behavior?", chinese: "那您能控制好自己吗？" },
      { id: "d5-line-6", speaker: "Passenger", english: "Sure, I didn't drink a lot.", chinese: "没问题的，我没喝很多酒。" },
      { id: "d5-line-7", speaker: "Security Officer", english: "OK, if you need some help, you can ask your friends to tell us.", chinese: "好的，如果有什么需要，可以让您随行的朋友告诉我们。" },
      { id: "d5-line-8", speaker: "Passenger", english: "OK, thanks.", chinese: "好，谢谢。" }
    ]
  },
  {
    id: "dialogue-6-localized-cabin-check",
    title: "局部清舱",
    description: "因旅客中止行程，安全员执行局部客舱检查。",
    icon: "SearchCheck",
    lines: [
      { id: "d6-line-1", speaker: "Security Officer", english: "I'm the security officer of this flight. Please check and confirm your luggage in rows 3 to 9.", chinese: "我是航班的航空安全员，请座位号3至9排的旅客检查并确认一下你们的行李。" },
      { id: "d6-line-2", speaker: "Passenger", english: "What happened on the aircraft?", chinese: "飞机上发生什么了吗？" },
      { id: "d6-line-3", speaker: "Security Officer", english: "The passenger in seat 6A has already left the aircraft due to personal reasons.", chinese: "坐在6A的旅客由于个人原因已经离开了飞机。" },
      { id: "d6-line-4", speaker: "Security Officer", english: "For security reasons, please follow our instructions.", chinese: "为了安全原因请遵循我们的指令。" },
      { id: "d6-line-5", speaker: "Passenger", english: "I see. I'll tell you if we have any problems.", chinese: "我知道了，如果我们有问题的话我会告诉你。" }
    ]
  },
  {
    id: "dialogue-7-cockpit-comm-discontinue-journey",
    title: "与驾驶舱沟通-乘客终止行程",
    description: "安全员就乘客终止行程事宜与机长沟通。",
    icon: "UserX",
    lines: [
      { id: "d7-line-1", speaker: "Security Officer", english: "Captain, two passengers want to end their trip.", chinese: "机长，有两名乘客想要终止本次行程。" },
      { id: "d7-line-2", speaker: "Captain", english: "Alright, where are their seats? I need to inform the staff.", chinese: "好吧，他们坐在哪里？我需要通知工作人员。" },
      { id: "d7-line-3", speaker: "Security Officer", english: "Their seat number is 6A/B.", chinese: "他们座位号是6A/B。" },
      { id: "d7-line-4", speaker: "Security Officer", english: "Captain, which kind of check do I need to do after they disembark?", chinese: "机长，下机后我应该做哪一种检查？" },
      { id: "d7-line-5", speaker: "Captain", english: "A localized check is enough.", chinese: "局部的检查就足够了。" },
      { id: "d7-line-6", speaker: "Security Officer", english: "I see. I will report after it's finished.", chinese: "我知道了，完成后会报告。" }
    ]
  },
  {
    id: "dialogue-8-deportees-reception",
    title: "遣返旅客",
    description: "安全员与地面服务人员交接遣返旅客。",
    icon: "UsersRound",
    lines: [
      { id: "d8-line-1", speaker: "Staff", english: "Who is the security officer on board?", chinese: "哪位是飞机上的航空安全员？" },
      { id: "d8-line-2", speaker: "Security Officer", english: "I'm the flight security officer on board.", chinese: "我是本次航班上的航空安全员。" },
      { id: "d8-line-3", speaker: "Security Officer", english: "Anything for me?", chinese: "有什么事情吗找我？" },
      { id: "d8-line-4", speaker: "Staff", english: "We have two deportees for the flight from Osaka to Shanghai. Here are their documents and passports.", chinese: "有两名遣返从大阪到上海，这是遣返的证明和护照。" },
      { id: "d8-line-5", speaker: "Security Officer", english: "Thank you. But I need to inform our crew first. So please wait.", chinese: "谢谢你。但是我需要先通知我们组员，请稍等。" },
      { id: "d8-line-6", speaker: "Security Officer", english: "Thanks for waiting. Please let the deportees board first.", chinese: "谢谢你的等待，请让遣返旅客先登机。" }
    ]
  },
  {
    id: "dialogue-9-cockpit-comm-deportees",
    title: "与驾驶舱沟通-遣返旅客",
    description: "安全员向机长通报遣返旅客信息。",
    icon: "MessageSquareWarning",
    lines: [
      { id: "d9-line-1", speaker: "Security Officer", english: "Captain, I've just been informed by the staff that there are two deportees.", chinese: "机长，我刚刚从地服那边收到两名遣返旅客的通知。" },
      { id: "d9-line-2", speaker: "Captain", english: "Alright! It shouldn't be a big problem, but please follow the procedure and confirm.", chinese: "好吧！这应该不是什么大问题，请根据程序做并确认。" },
      { id: "d9-line-3", speaker: "Captain", english: "And where are they seated?", chinese: "他们坐在哪里？" },
      { id: "d9-line-4", speaker: "Security Officer", english: "Their seat number is 27A/B.", chinese: "他们座位号是27排A/B。" },
      { id: "d9-line-5", speaker: "Captain", english: "Good! Please report again after boarding.", chinese: "很好，请在登机后再给我报告一下。" },
      { id: "d9-line-6", speaker: "Security Officer", english: "Don't worry! I will handle it.", chinese: "别担心，我会处理好的。" }
    ]
  },
  {
    id: "dialogue-10-cockpit-comm-explosive-detector",
    title: "与驾驶舱沟通-使用爆探",
    description: "安全员就使用爆炸物探测器事宜与机长沟通。",
    icon: "ScanSearch",
    lines: [
      { id: "d10-line-1", speaker: "Security Officer", english: "Captain, according to procedure, we need to report to you before we start using the detector.", chinese: "机长，根据程序，我们在使用爆探前需要向你报告一些内容。" },
      { id: "d10-line-2", speaker: "Captain", english: "Sounds good.", chinese: "很好。" },
      { id: "d10-line-3", speaker: "Security Officer", english: "The detector is ready for inspection now, and at least fifty percent of passengers will be checked.", chinese: "爆探已经准备好检测，并且会检测至少百分之五十的乘客。" },
      { id: "d10-line-4", speaker: "Security Officer", english: "The security crew will report after the check is finished or if any problem is found.", chinese: "安保组在完成检查后或发现任何问题时会向你报告。" },
      { id: "d10-line-5", speaker: "Captain", english: "Thank you for your effort.", chinese: "辛苦了。" }
    ]
  },
  {
    id: "dialogue-11-cockpit-comm-company-documents",
    title: "驾驶舱沟通-携带公司文件",
    description: "安全员就是否能携带公司文件与机长进行确认。",
    icon: "FileText",
    lines: [
      { id: "d11-line-1", speaker: "Security Officer", english: "Captain, I received two documents from the sales department.", chinese: "机长，我从公司营业部那边收到了两份文件。" },
      { id: "d11-line-2", speaker: "Security Officer", english: "Do I have your approval to bring these documents to Shanghai?", chinese: "我能把它们带到上海吗？" },
      { id: "d11-line-3", speaker: "Captain", english: "You can carry them, but please confirm their security status.", chinese: "你可以携带，但是请你在安全方面再确认一下。" },
      { id: "d11-line-4", speaker: "Security Officer", english: "The documents have already been through security.", chinese: "文件已经经过安检了。" },
      { id: "d11-line-5", speaker: "Captain", english: "Sounds good! Thanks for your report.", chinese: "听起来很好！谢谢你给我报告。" }
    ]
  },
  {
    id: "dialogue-12-crew-coordination",
    title: "机组协同",
    description: "飞行前机组关于安全形势和勤务等级的协调。",
    icon: "Users",
    lines: [
      { id: "d12-line-1", speaker: "Captain", english: "How about the security situation recently?", chinese: "最近的空防形势如何？" },
      { id: "d12-line-2", speaker: "Security Officer", english: "Hello, I'm the Security Officer of this flight. My name is Li Ming. The security situation hasn't been stable recently and the security level for this flight is level three. Please follow the Aircraft Security Check List to check the cockpit and cabin.", chinese: "大家好，我是今天的航空安全员，我叫李明。最近的空防形势不太稳定，目前的勤务等级为三级。请大家按照《航空器安保检查单》对驾驶舱和客舱进行检查。" },
      { id: "d12-line-3", speaker: "Captain", english: "Any other questions?", chinese: "其他还有什么问题吗？" },
      { id: "d12-line-4", speaker: "Security Officer", english: "How about the security procedure?", chinese: "空防预案如何？" },
      { id: "d12-line-5", speaker: "Captain", english: "They are normal. Our security codes are according to company procedures.", chinese: "正常。我们的暗语暗号按照公司程序。" },
      { id: "d12-line-6", speaker: "Security Officer", english: "OK. I will give you the report after I finish the security check.", chinese: "好的。清舱后我会向您报告。" }
    ]
  },
  {
    id: "dialogue-13-report-electronic-devices",
    title: "电子设备使用报告机长",
    description: "安全员向机长报告旅客违规使用电子设备的处理情况。",
    icon: "SmartphoneNfc",
    lines: [
      { id: "d13-line-1", speaker: "Captain", english: "Did anything happen?", chinese: "发生什么情况了吗？" },
      { id: "d13-line-2", speaker: "Security Officer", english: "Captain, one passenger used electronic equipment in violation of regulations.", chinese: "机长，有一名旅客违规使用电子设备。" },
      { id: "d13-line-3", speaker: "Captain", english: "How did you handle it?", chinese: "你是如何处置的？" },
      { id: "d13-line-4", speaker: "Security Officer", english: "I have stopped him and given him a warning.", chinese: "我已制止他的行为并且发出了警告。" },
      { id: "d13-line-5", speaker: "Captain", english: "Please keep this passenger closely under surveillance.", chinese: "请对该旅客持续做好监控。" },
      { id: "d13-line-6", speaker: "Security Officer", english: "Sure, I will keep an eye on him all the time.", chinese: "好的机长，我会一直关注他。" }
    ]
  },
  {
    id: "dialogue-14-report-explosives",
    title: "爆炸物报告",
    description: "安全员紧急向机长报告发现疑似爆炸物。",
    icon: "Bomb",
    lines: [
      { id: "d14-line-1", speaker: "Security Officer", english: "Captain, we found an explosive in the lavatory.", chinese: "报告机长，我们在厕所发现疑似炸弹。" },
      { id: "d14-line-2", speaker: "Captain", english: "Did you confirm it?", chinese: "确认是爆炸物吗？" },
      { id: "d14-line-3", speaker: "Security Officer", english: "Yes, we have confirmed it.", chinese: "是的，我们已经确认了是爆炸物。" },
      { id: "d14-line-4", speaker: "Captain", english: "Deal with it according to procedure.", chinese: "按照预案处置。" }
    ]
  },
  {
    id: "dialogue-15-report-hijacking",
    title: "劫机报告",
    description: "安全员向机长报告劫机事件及处置情况。",
    icon: "AlertOctagon",
    lines: [
      { id: "d15-line-1", speaker: "Security Officer", english: "Captain, we have a hijacking situation.", chinese: "机长，我们遇到了劫机。" },
      { id: "d15-line-2", speaker: "Captain", english: "What's the situation now?", chinese: "现在什么情况？" },
      { id: "d15-line-3", speaker: "Security Officer", english: "A male passenger in seat 11C tried to force the cabin crew to divert the aircraft to Taiwan.", chinese: "11C一名男子试图胁迫乘务员改变飞机航向至台湾。" },
      { id: "d15-line-4", speaker: "Captain", english: "What is the current status?", chinese: "事态发展如何？" },
      { id: "d15-line-5", speaker: "Security Officer", english: "I have stopped him and the situation is under control.", chinese: "我已将其制服，情况已得到控制。" }
    ]
  },
  {
    id: "dialogue-16-passenger-using-mobile-phone",
    title: "旅客使用手机",
    description: "安全员处理旅客在飞行中违规使用手机通话的行为。",
    icon: "PhoneOff",
    lines: [
      { id: "d16-line-1", speaker: "Security Officer", english: "Sir, please switch your phone to flight mode immediately.", chinese: "先生，请立即将手机调至飞行模式！" },
      { id: "d16-line-2", speaker: "Passenger", english: "I need to call my girlfriend.", chinese: "我需要给我女朋友打电话。" },
      { id: "d16-line-3", speaker: "Security Officer", english: "Sir, mobile phone calls are not allowed during the flight. Please switch your phone to flight mode. You can contact her after landing.", chinese: "先生，飞行期间不允许打电话，请将手机调至飞行模式，落地后再联系。" },
      { id: "d16-line-4", speaker: "Passenger", english: "No! Leave me alone!", chinese: "不！ 别管我！" },
      { id: "d16-line-5", speaker: "Security Officer", english: "Your behavior has seriously endangered our flight safety. If you don't stop, I will call the police to handle it, and you will bear the consequences arising therefrom.", chinese: "你的行为已经严重危害到了我们的飞行安全，否则我将叫警察来处理，由此产生的后果你自己承担。" }
    ]
  },
  {
    id: "dialogue-17-cockpit-comm-illegal-phone-use",
    title: "与驾驶舱沟通-违规使用手机",
    description: "安全员向机长报告旅客在起飞时违规使用手机。",
    icon: "PhoneIncoming",
    lines: [
      { id: "d17-line-1", speaker: "Security Officer", english: "Captain, a passenger was caught using a mobile phone during takeoff.", chinese: "机长，有一旅客在起飞时违规使用手机。" },
      { id: "d17-line-2", speaker: "Captain", english: "Won't he turn it to flight mode?", chinese: "他不肯调成飞行模式？" },
      { id: "d17-line-3", speaker: "Security Officer", english: "Yes! His attitude is very poor and he rejected our advice.", chinese: "是的！这位旅客态度很差，并且拒绝我们的劝告。" },
      { id: "d17-line-4", speaker: "Captain", english: "OK! What's your point?", chinese: "好吧！你有什么看法？" },
      { id: "d17-line-5", speaker: "Security Officer", english: "We need to call the ground police to handle it.", chinese: "我们需要呼叫地面公安来处理。" },
      { id: "d17-line-6", speaker: "Captain", english: "Good job! Please complete the \"Information Reminder Form\" and submit it to me.", chinese: "做得好！请写好《信息提示单》后交给我。" },
      { id: "d17-line-7", speaker: "Security Officer", english: "Yes, I will fill out the relevant documents immediately.", chinese: "是的，我马上填写相关单据。" }
    ]
  },
  {
    id: "dialogue-18-seat-grabbing",
    title: "抢占座位",
    description: "安全员调解乘客间的座位纠纷。",
    icon: "UsersCog",
    lines: [
      { id: "d18-line-1", speaker: "Security Officer", english: "Excuse me, what's wrong?", chinese: "请问发生了什么事？" },
      { id: "d18-line-2", speaker: "Passenger A", english: "It's my seat, my seat is window-side!", chinese: "这是我的座位，我的座位是靠窗的！" },
      { id: "d18-line-3", speaker: "Passenger B", english: "No! This seat is mine! You must be wrong!", chinese: "不，这是我的座位，你一定是坐错了！" },
      { id: "d18-line-4", speaker: "Security Officer", english: "OK, please show me your boarding pass.", chinese: "请两位给我你们的登机牌。" },
      { id: "d18-line-5", speaker: "Passenger A", english: "Here you are.", chinese: "给。" },
      { id: "d18-line-6", speaker: "Passenger B", english: "Here you are.", chinese: "给。" },
      { id: "d18-line-7", speaker: "Security Officer", english: "I think you are mistaken Mr. A, your seat is in the back row. Please return to your seat.", chinese: "是A先生座位错了，您的座位在后一排，请您回到您的原位。" }
    ]
  },
  {
    id: "dialogue-19-escort-procedures",
    title: "押解",
    description: "安全员与机长就押解嫌疑人的程序进行沟通。",
    icon: "UserCheck",
    lines: [
      { id: "d19-line-1", speaker: "Security Officer", english: "There will be a suspect escorted by three police officers. The suspect will be seated at 27B.", chinese: "本次航班将有一名嫌疑人，由三名警官押解。嫌疑人将坐在27B座位。" },
      { id: "d19-line-2", speaker: "Captain", english: "Are there any security requirements?", chinese: "安保有什么要求？" },
      { id: "d19-line-3", speaker: "Security Officer", english: "The escorted suspect should board before other passengers, and disembark after others. They cannot be on the same flight as a Very Important Person (VIP).", chinese: "被押解人犯要先于其他旅客登机，后于其他旅客下机。不得与重要旅客同机。" },
      { id: "d19-line-4", speaker: "Captain", english: "Any other requirements?", chinese: "还有其他要求吗？" },
      { id: "d19-line-5", speaker: "Security Officer", english: "Don't provide metal tableware. Don't provide alcoholic drinks.", chinese: "不要提供金属餐具，不要提供酒精饮料。" },
      { id: "d19-line-6", speaker: "Captain", english: "Fine. Please pay attention to them.", chinese: "好的，注意监控。" }
    ]
  },
  {
    id: "dialogue-20-security-check-completion",
    title: "安保检查完毕报告",
    description: "安全员向机长报告客舱安保检查已完成。",
    icon: "ShieldCheck",
    lines: [
      { id: "d20-line-1", speaker: "Security Officer", english: "Captain, the cabin security check is finished.", chinese: "机长，客舱安保检查完毕。" },
      { id: "d20-line-2", speaker: "Captain", english: "OK, is everything okay?", chinese: "好的，有什么情况吗？" },
      { id: "d20-line-3", speaker: "Security Officer", english: "There's a box of tableware in the rear of the cabin.", chinese: "机长，客舱后部有一箱餐具。" },
      { id: "d20-line-4", speaker: "Captain", english: "Go and check it.", chinese: "好的，你去检查一下。" },
      { id: "d20-line-5", speaker: "Security Officer", english: "I have checked it. No problem.", chinese: "已经检查过了，没问题。" },
      { id: "d20-line-6", speaker: "Captain", english: "OK, call for boarding.", chinese: "好，通知旅客登机。" }
    ]
  }
];

