
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
    id: "aviation-fundamentals-cabin-safety",
    name: "飞行基础与客舱安全",
    description: "涵盖基础航空术语、安全设备及机上物品词汇。",
    icon: "PlaneTakeoff",
    items: [
      // From Basic Aviation Terms
      { id: "vt001", english: "Altitude", chinese: "高度", exampleSentenceEn: "The aircraft is cruising at an altitude of 30,000 feet.", exampleSentenceZh: "飞机正在30,000英尺的高度巡航。" },
      { id: "vt002", english: "Runway", chinese: "跑道", exampleSentenceEn: "The pilot aligned the plane with the runway for landing.", exampleSentenceZh: "飞行员将飞机对准跑道准备降落。" },
      { id: "vt003", english: "Cockpit", chinese: "驾驶舱", exampleSentenceEn: "The captain and first officer are in the cockpit.", exampleSentenceZh: "机长和副驾驶在驾驶舱内。" },
      { id: "vt004", english: "Air Traffic Control (ATC)", chinese: "空中交通管制", exampleSentenceEn: "Pilots must follow instructions from Air Traffic Control.", exampleSentenceZh: "飞行员必须听从空中交通管制的指令。" },
      { id: "vt005", english: "Turbulence", chinese: "颠簸", exampleSentenceEn: "Passengers were asked to fasten their seatbelts due to turbulence.", exampleSentenceZh: "由于颠簸，乘客被要求系好安全带。" },
      // From Safety Equipment
      { id: "vt006", english: "Life Vest", chinese: "救生衣", exampleSentenceEn: "Locate your life vest under your seat.", exampleSentenceZh: "救生衣在您的座位下方。" },
      { id: "vt007", english: "Oxygen Mask", chinese: "氧气面罩", exampleSentenceEn: "In case of cabin depressurization, oxygen masks will drop automatically.", exampleSentenceZh: "如果机舱失压，氧气面罩会自动落下。" },
      { id: "vt008", english: "Emergency Exit", chinese: "紧急出口", exampleSentenceEn: "Familiarize yourself with the nearest emergency exit.", exampleSentenceZh: "请熟悉离您最近的紧急出口。" },
      // From Onboard Equipment & Items
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
    ],
  },
  {
    id: "security-operations-emergency-response",
    name: "安保操作与应急处理",
    description: "专注于航空安保操作、旅客行为管理及紧急情况处理词汇。",
    icon: "ShieldAlert",
    items: [
      // From Security Operations Terms
      { id: "vt009", english: "Security Officer", chinese: "安全员", exampleSentenceEn: "I'm the security officer of this flight.", exampleSentenceZh: "我是本次航班的安全员。" },
      { id: "vt010", english: "Surveillance", chinese: "监控", exampleSentenceEn: "Please keep this passenger closely under surveillance.", exampleSentenceZh: "请对该旅客持续做好监控。" },
      { id: "vt011", english: "Confiscate", chinese: "没收", exampleSentenceEn: "I have confiscated his cigarettes and lighter.", exampleSentenceZh: "我已经没收了该乘客的香烟及打火机。" },
      { id: "vt012", english: "Pre-flight Check", chinese: "飞行前检查", exampleSentenceEn: "Ready for the pre-flight walk-around?", exampleSentenceZh: "准备好进行飞行前绕机检查了吗？" },
      { id: "vt013", english: "Security Check", chinese: "安保检查", exampleSentenceEn: "The cabin security check is finished.", exampleSentenceZh: "客舱安保检查完毕。" },
      { id: "vt014", english: "Aircraft Security Check List", chinese: "航空器安保检查单", exampleSentenceEn: "Please follow the Aircraft Security Check List.", exampleSentenceZh: "请大家按照《航空器安保检查单》进行检查。" },
      { id: "vt015", english: "Information Reminder Form", chinese: "信息提示单", exampleSentenceEn: "Please complete the Information Reminder Form.", exampleSentenceZh: "请写好《信息提示单》后交给我。" },
      { id: "vt016", english: "Security Level", chinese: "勤务等级", exampleSentenceEn: "The security level for this flight is level three.", exampleSentenceZh: "目前的勤务等级为三级。" },
      { id: "vt017", english: "Security Procedure", chinese: "空防预案", exampleSentenceEn: "How about the security procedure?", exampleSentenceZh: "空防预案如何？" },
      { id: "vt018", english: "Security Codes", chinese: "暗语暗号", exampleSentenceEn: "Our security codes are according to company procedures.", exampleSentenceZh: "我们的暗语暗号按照公司程序。" },
      { id: "vt019", english: "Localized Check", chinese: "局部检查", exampleSentenceEn: "A localized check is enough.", exampleSentenceZh: "局部的检查就足够了。" },
      { id: "vt020", english: "Clear Cabin", chinese: "清舱", exampleSentenceEn: "I will give you the report after I finish clearing the cabin.", exampleSentenceZh: "清舱后我会向您报告。" },
      { id: "vt021", english: "Explosive Detector", chinese: "爆探", exampleSentenceEn: "The detector is ready for inspection now.", exampleSentenceZh: "爆探已经准备好检测。" },
      { id: "vt022", english: "Walk-around", chinese: "绕机检查", exampleSentenceEn: "Ready for the pre-flight walk-around?", exampleSentenceZh: "准备好进行飞行前绕机检查了吗？" },
      { id: "vt023", english: "Control Surfaces", chinese: "操纵面", exampleSentenceEn: "Check the control surfaces.", exampleSentenceZh: "检查操纵面。" },
      { id: "vt024", english: "Panels", chinese: "盖板", exampleSentenceEn: "Ensure all panels are secure.", exampleSentenceZh: "确保所有盖板都已固定。" },
      { id: "vt025", english: "Chocks", chinese: "轮挡", exampleSentenceEn: "We'll double-check the chocks.", exampleSentenceZh: "我们会再次检查轮挡。" },
      { id: "vt026", english: "Landing Gear Pins", chinese: "起落架销", exampleSentenceEn: "Check the landing gear pins.", exampleSentenceZh: "检查起落架销。" },
      { id: "vt027", english: "Record Audio and Video", chinese: "录音录像", exampleSentenceEn: "I will record audio and video.", exampleSentenceZh: "现在对执勤过程录音录像。" },
      // From Passenger Behavior Management
      { id: "vt046", english: "Calm Down", chinese: "冷静", exampleSentenceEn: "Calm down, both of you!", exampleSentenceZh: "你们两个冷静一下！" },
      { id: "vt047", english: "Fighting", chinese: "打架斗殴", exampleSentenceEn: "Fighting and brawling on the plane.", exampleSentenceZh: "机上打架斗殴。" },
      { id: "vt048", english: "Bump Into", chinese: "撞", exampleSentenceEn: "He bumped into me on purpose!", exampleSentenceZh: "他路过的时候故意撞我！" },
      { id: "vt049", english: "Swear", chinese: "说脏话", exampleSentenceEn: "He swore at me!", exampleSentenceZh: "他向我说脏话！" },
      { id: "vt050", english: "Beat Up", chinese: "动手/打", exampleSentenceEn: "I will beat him up.", exampleSentenceZh: "我还会动手！" },
      { id: "vt051", english: "Smoking", chinese: "吸烟", exampleSentenceEn: "A passenger was smoking in the lavatory.", exampleSentenceZh: "一名旅客在厕所吸烟。" },
      { id: "vt052", english: "Intoxicated", chinese: "醉酒", exampleSentenceEn: "May I ask if you have been drinking?", exampleSentenceZh: "请问您是不是喝酒了？" },
      { id: "vt053", english: "Deportee", chinese: "遣返旅客", exampleSentenceEn: "We have two deportees.", exampleSentenceZh: "有两名遣返旅客。" },
      { id: "vt054", english: "Escort", chinese: "押解", exampleSentenceEn: "A suspect escorted by three police officers.", exampleSentenceZh: "一名嫌疑人，由三名警官押解。" },
      { id: "vt055", english: "Suspect", chinese: "嫌疑人", exampleSentenceEn: "There will be a suspect escorted.", exampleSentenceZh: "本次航班将有一名嫌疑人。" },
      { id: "vt056", english: "Cooperate", chinese: "配合", exampleSentenceEn: "Please cooperate.", exampleSentenceZh: "请配合！" },
      { id: "vt057", english: "Violate Regulations", chinese: "违规", exampleSentenceEn: "Used equipment in violation of regulations.", exampleSentenceZh: "违规使用设备。" },
      { id: "vt058", english: "Attitude", chinese: "态度", exampleSentenceEn: "His attitude is very poor.", exampleSentenceZh: "这位旅客态度很差。" },
      { id: "vt059", english: "Reject", chinese: "拒绝", exampleSentenceEn: "He rejected our advice.", exampleSentenceZh: "拒绝我们的劝告。" },
      { id: "vt060", english: "Manage Behavior", chinese: "控制自己", exampleSentenceEn: "Can you manage your behavior?", exampleSentenceZh: "您能控制好自己吗？" },
      { id: "vt061", english: "Board", chinese: "登机", exampleSentenceEn: "Please let the deportees board first.", exampleSentenceZh: "请让遣返旅客先登机。" },
      { id: "vt062", english: "Disembark", chinese: "下机/下飞机", exampleSentenceEn: "Please be the last to disembark.", exampleSentenceZh: "请你在落地后最后一个下机。" },
      { id: "vt063", english: "Personal Reasons", chinese: "个人原因", exampleSentenceEn: "Left the aircraft due to personal reasons.", exampleSentenceZh: "由于个人原因已经离开了飞机。" },
      { id: "vt064", english: "Discontinue Journey", chinese: "终止行程", exampleSentenceEn: "Two passengers want to end their trip.", exampleSentenceZh: "有两名乘客想要终止本次行程。" },
      // From Emergency Situations
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
    id: "crew-coordination",
    title: "机组协同",
    description: "安全员与机组的安全协调会议。",
    icon: "Users",
    lines: [
      { id: "dl-crew-001", speaker: "Captain", english: "How about the security situation recently?", chinese: "最近的空防形势如何？" },
      { id: "dl-crew-002", speaker: "Security Officer", english: "Hello, I'm the Security Officer of this flight. My name is Li Ming. The security situation hasn't been stable recently and the security level for this flight is level three. Please follow the Aircraft Security Check List to check the cockpit and cabin.", chinese: "大家好，我是今天的航空安全员，我叫李明。最近的空防形势不太稳定，目前的勤务等级为三级。请大家按照《航空器安保检查单》对驾驶舱和客舱进行检查。" },
      { id: "dl-crew-003", speaker: "Captain", english: "Any other questions?", chinese: "其他还有什么问题吗？" },
      { id: "dl-crew-004", speaker: "Security Officer", english: "How about the security procedure?", chinese: "空防预案如何？" },
      { id: "dl-crew-005", speaker: "Captain", english: "They are normal. Our security codes are according to company procedures.", chinese: "正常。我们的暗语暗号按照公司程序。" },
      { id: "dl-crew-006", speaker: "Security Officer", english: "OK. I will give you the report after I finish the security check.", chinese: "好的。清舱后我会向您报告。" },
    ],
  },
  {
    id: "hijacking-report",
    title: "劫机报告",
    description: "处理劫机企图的紧急情况。",
    icon: "AlertOctagon",
    lines: [
      { id: "dl-hijack-001", speaker: "Security Officer", english: "Captain, we have a hijacking situation.", chinese: "机长，我们遇到了劫机。" },
      { id: "dl-hijack-002", speaker: "Captain", english: "What's the situation now?", chinese: "现在什么情况？" },
      { id: "dl-hijack-003", speaker: "Security Officer", english: "A male passenger in seat 11C tried to force the cabin crew to divert the aircraft to Taiwan.", chinese: "11C一名男子试图胁迫乘务员改变飞机航向至台湾。" },
      { id: "dl-hijack-004", speaker: "Captain", english: "What is the current status?", chinese: "事态发展如何？" },
      { id: "dl-hijack-005", speaker: "Security Officer", english: "I have stopped him and the situation is under control.", chinese: "我已将其制服，情况已得到控制。" },
    ],
  },
];

// Quiz data can be generated from vocabulary/dialogues or defined separately
// For now, quiz logic will pick from these.
    

    