
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
      // Basic Aviation Terms
      { id: "vt001", english: "Altitude", chinese: "高度", exampleSentenceEn: "The aircraft is cruising at an altitude of 30,000 feet.", exampleSentenceZh: "飞机正在30,000英尺的高度巡航。" },
      { id: "vt002", english: "Runway", chinese: "跑道", exampleSentenceEn: "The pilot aligned the plane with the runway for landing.", exampleSentenceZh: "飞行员将飞机对准跑道准备降落。" },
      { id: "vt003", english: "Cockpit", chinese: "驾驶舱", exampleSentenceEn: "The captain and first officer are in the cockpit.", exampleSentenceZh: "机长和副驾驶在驾驶舱内。" },
      { id: "vt004", english: "Air Traffic Control (ATC)", chinese: "空中交通管制", exampleSentenceEn: "Pilots must follow instructions from Air Traffic Control.", exampleSentenceZh: "飞行员必须听从空中交通管制的指令。" },
      { id: "vt005", english: "Turbulence", chinese: "颠簸", exampleSentenceEn: "Passengers were asked to fasten their seatbelts due to turbulence.", exampleSentenceZh: "由于颠簸，乘客被要求系好安全带。" },
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
      { id: "vt056", english: "Cooperate", chinese: "配合", exampleSentenceEn: "Please cooperate.", exampleSentenceZh: "请配合！" },
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
      { id: "vt011", english: "Confiscate", chinese: "没收", exampleSentenceEn: "I have confiscated his cigarettes and lighter.", exampleSentenceZh: "我已经没收了该乘客的香烟及打火机。" },
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
      { id: "vt052", english: "Intoxicated", chinese: "醉酒", exampleSentenceEn: "May I ask if you have been drinking?", exampleSentenceZh: "请问您是不是喝酒了？" },
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
    id: "pre-flight-check",
    title: "飞行前检查",
    description: "安全员与飞行员进行飞行前绕机检查。",
    icon: "ClipboardCheck",
    lines: [
      { id: "dl001", speaker: "Captain", english: "Ready for the pre-flight walk-around?", chinese: "准备好进行飞行前绕机检查了吗？" },
      { id: "dl002", speaker: "Security Officer", english: "Yes, sir. Checking tires and control surfaces now.", chinese: "是的，长官。正在检查轮胎和操纵面。" },
      { id: "dl003", speaker: "Captain", english: "Good. Ensure all panels are secure and chocks are in place.", chinese: "很好。确保所有盖板都已固定，轮挡已放置好。" },
      { id: "dl004", speaker: "Security Officer", english: "Roger that. Landing gear pins are also confirmed removed.", chinese: "收到。起落架销也已确认移除。" }
    ]
  },
  {
    id: "passenger-smoking-incident",
    title: "旅客吸烟事件处置",
    description: "安全员处理旅客在洗手间吸烟事件。",
    icon: "FlameOff",
    lines: [
      { id: "dl-psmoke-001", speaker: "Security Officer", english: "Excuse me, sir. I'm the security officer of this flight. Did you smoke in the lavatory?", chinese: "打扰一下先生，我是本次航班的安全员。请问您刚才是在洗手间吸烟吗？" },
      { id: "dl-psmoke-002", speaker: "Passenger", english: "Yes, what's the problem?", chinese: "是的，有什么问题吗？" },
      { id: "dl-psmoke-003", speaker: "Security Officer", english: "Smoking is strictly prohibited on board. It's a serious threat to flight safety. I will record audio and video for this process. Please show me your cigarettes and lighter.", chinese: "机上严禁吸烟，这是严重威胁飞行安全的。现在对执勤过程录音录像。请出示您的香烟和打火机。" },
      { id: "dl-psmoke-004", speaker: "Passenger", english: "Here you go.", chinese: "给你。" },
      { id: "dl-psmoke-005", speaker: "Security Officer", english: "Thank you for your cooperation. I have to confiscate these items. We will report this to the captain and possibly the police upon landing. Please be the last to disembark.", chinese: "谢谢您的配合。我必须没收这些物品。我们会向机长报告，并在落地后可能报警处理。请您最后下机。" },
      { id: "dl-psmoke-006", speaker: "Passenger", english: "Okay, I understand.", chinese: "好吧，我明白了。" }
    ]
  },
  {
    id: "power-bank-usage",
    title: "擅自使用充电宝",
    description: "安全员制止旅客违规使用充电宝。",
    icon: "BatteryWarning",
    lines: [
      { id: "dl-power-001", speaker: "Security Officer", english: "Excuse me, sir. According to CAAC regulations, power banks are not allowed to be used during flight.", chinese: "打扰一下先生，根据中国民航法规，飞行全程禁止使用充电宝。" },
      { id: "dl-power-002", speaker: "Passenger", english: "Oh, I didn't know that. My phone is almost dead.", chinese: "哦，我不知道。我的手机快没电了。" },
      { id: "dl-power-003", speaker: "Security Officer", english: "I understand, but it's for safety reasons. Please turn it off and put it away.", chinese: "我理解，但这是为了安全考虑。请您关闭并收好充电宝。" },
      { id: "dl-power-004", speaker: "Passenger", english: "Alright, no problem.", chinese: "好的，没问题。" },
      { id: "dl-power-005", speaker: "Security Officer", english: "We can offer to charge your phone in the galley if it's urgent, once we are at cruising altitude.", chinese: "如果紧急，我们可以在巡航高度时在厨房区域帮您充电。" },
      { id: "dl-power-006", speaker: "Passenger", english: "That would be great, thank you.", chinese: "那太好了，谢谢。" }
    ]
  },
  {
    id: "intoxicated-passenger-management",
    title: "醉酒旅客管理",
    description: "安全员管理行为失常的醉酒旅客。",
    icon: "UserMinus",
    lines: [
      { id: "dl-drunk-001", speaker: "Security Officer", english: "Excuse me, sir. May I ask if you have been drinking?", chinese: "打扰一下先生，请问您是不是喝酒了？" },
      { id: "dl-drunk-002", speaker: "Passenger", english: "Yeah, so what? Just a few.", chinese: "是啊，怎么了？就喝了几杯。" },
      { id: "dl-drunk-003", speaker: "Security Officer", english: "Are you feeling okay? Can you manage your behavior?", chinese: "您感觉还好吗？能控制好自己的行为吗？" },
      { id: "dl-drunk-004", speaker: "Passenger", english: "I'm fine! Leave me alone!", chinese: "我很好！别管我！" },
      { id: "dl-drunk-005", speaker: "Security Officer", english: "Sir, your behavior is disturbing other passengers. Please keep your voice down. Are you traveling with anyone?", chinese: "先生，您的行为已经打扰到其他旅客了。请您小声一点。您有同行人吗？" },
      { id: "dl-drunk-006", speaker: "Passenger's Companion", english: "Yes, officer, he's with me. I'm sorry, he had a bit too much before boarding.", chinese: "是的，安全员，他和我一起的。对不起，他登机前喝得有点多了。" },
      { id: "dl-drunk-007", speaker: "Security Officer", english: "Please help ensure he remains calm and seated. We may have to refuse serving him any more alcoholic beverages.", chinese: "请您帮忙确保他保持冷静并坐在座位上。我们可能不得不拒绝再向他提供任何酒精饮料。" },
      { id: "dl-drunk-008", speaker: "Passenger's Companion", english: "I understand. I'll take care of him.", chinese: "我明白。我会照顾好他的。" }
    ]
  },
  {
    id: "localized-cabin-check",
    title: "局部清舱",
    description: "旅客中途下机后的局部安全检查。",
    icon: "SearchCheck",
    lines: [
      { id: "dl-local-001", speaker: "Captain", english: "Security Officer, passenger in 15A, Li Wei, has discontinued his journey. Please conduct a localized check of his seat and overhead bin.", chinese: "安全员，15A座旅客李伟终止行程。请对他座位及上方行李架进行局部检查。" },
      { id: "dl-local-002", speaker: "Security Officer", english: "Roger, Captain. Will check seat 15A and its surroundings immediately.", chinese: "收到，机长。马上检查15A座位及其周围。" },
      { id: "dl-local-003", speaker: "Security Officer", english: "Excuse me, passengers. For safety reasons, we need to briefly check this area. Thank you for your cooperation.", chinese: "打扰一下各位旅客，为了安全原因，我们需要简单检查一下这个区域，谢谢合作。" },
      { id: "dl-local-004", speaker: "Security Officer", english: "Captain, localized check of 15A area is complete. No suspicious items found. His carry-on was offloaded.", chinese: "机长，15A区域局部检查完毕，未发现可疑物品。他的手提行李已被卸下。" },
      { id: "dl-local-005", speaker: "Captain", english: "Good. Thank you.", chinese: "好的，谢谢。" }
    ]
  },
  {
    id: "journey-discontinuation-report",
    title: "乘客终止行程报告",
    description: "安全员向机长报告旅客终止行程情况。",
    icon: "UserX",
    lines: [
      { id: "dl-discon-001", speaker: "Security Officer", english: "Captain, passenger in 32C, Mr. Wang, wishes to discontinue his journey due to personal reasons.", chinese: "机长，32C座王先生因个人原因希望终止行程。" },
      { id: "dl-discon-002", speaker: "Captain", english: "Understood. Has he stated any specific urgent reason?", chinese: "明白。他有说明具体紧急原因吗？" },
      { id: "dl-discon-003", speaker: "Security Officer", english: "He just mentioned a family emergency. He seems quite distressed.", chinese: "他只说是家庭急事，看起来很着急。" },
      { id: "dl-discon-004", speaker: "Captain", english: "Alright. Coordinate with ground staff for his disembarkation. Ensure his checked baggage is also offloaded. We'll need to do a localized security check of his seat area once he's off.", chinese: "好的。协调地勤人员安排他下机，确保他的托运行李也一并卸下。他下机后我们需要对他座位区域做局部安检。" },
      { id: "dl-discon-005", speaker: "Security Officer", english: "Roger that. I will oversee the process and report once the check is complete.", chinese: "收到。我会监督整个过程，并在检查完成后向您报告。" },
      { id: "dl-discon-006", speaker: "Captain", english: "Thank you. Keep me informed of any delays.", chinese: "谢谢。有任何延误请及时通知我。" }
    ]
  },
  {
    id: "deportee-reception",
    title: "遣返旅客接收",
    description: "安全员与地勤人员交接遣返旅客。",
    icon: "UsersRound",
    lines: [
      { id: "dl-deport-grd-001", speaker: "Ground Staff", english: "Security Officer, we have two deportees for this flight, Mr. Smith and Ms. Jones. Here are their documents.", chinese: "安全员，本次航班有两名遣返旅客，史密斯先生和琼斯女士。这是他们的文件。" },
      { id: "dl-deport-grd-002", speaker: "Security Officer", english: "Understood. I'll review the documents. Are there any specific instructions or concerns?", chinese: "明白。我看一下文件。有什么特别指示或需要注意的事项吗？" },
      { id: "dl-deport-grd-003", speaker: "Ground Staff", english: "Mr. Smith was disruptive at the gate, but he's calm now. Ms. Jones is cooperative. They should be boarded last or first, as per your procedure.", chinese: "史密斯先生在登机口有些吵闹，但现在平静了。琼斯女士很配合。根据你们的程序，他们应该最后或最先登机。" },
      { id: "dl-deport-grd-004", speaker: "Security Officer", english: "We'll have them board first. I will inform the captain and cabin crew of their seating.", chinese: "我们会让他们先登机。我会通知机长和客舱机组他们的座位安排。" },
      { id: "dl-deport-grd-005", speaker: "Ground Staff", english: "Sounds good. Their escorts will hand them over to you at the aircraft door.", chinese: "好的。他们的押送人员会在舱门口把他们交给您。" },
      { id: "dl-deport-grd-006", speaker: "Security Officer", english: "Acknowledged. Thank you.", chinese: "收到，谢谢。" }
    ]
  },
  {
    id: "deportee-cockpit-communication",
    title: "遣返旅客-与驾驶舱沟通",
    description: "安全员向机长报告遣返旅客情况。",
    icon: "MessageSquareWarning", // Changed from MessageCircleQuestion to MessageSquareWarning for more alert
    lines: [
      { id: "dl-deport-cpt-001", speaker: "Security Officer", english: "Captain, we have received two deportees, Mr. Smith in 30A and Ms. Jones in 30B.", chinese: "机长，我们接收了两名遣返旅客，史密斯先生在30A，琼斯女士在30B。" },
      { id: "dl-deport-cpt-002", speaker: "Captain", english: "Roger. Any behavioral concerns noted by ground staff or yourself?", chinese: "收到。地勤或你这边有注意到任何行为问题吗？" },
      { id: "dl-deport-cpt-003", speaker: "Security Officer", english: "Ground staff mentioned Mr. Smith was disruptive earlier but is calm now. Both are seated. Standard procedures will be followed.", chinese: "地勤提到史密斯先生之前有些吵闹，但现在平静了。两人均已就座。将按标准程序处理。" },
      { id: "dl-deport-cpt-004", speaker: "Captain", english: "Good. Ensure they are monitored discreetly. No alcohol, and inform the purser about meal service for them.", chinese: "好的。确保对他们进行谨慎监控。不提供酒精饮料，并通知乘务长关于他们的餐食服务。" },
      { id: "dl-deport-cpt-005", speaker: "Security Officer", english: "Understood. Cabin crew has been briefed. We will maintain vigilance.", chinese: "明白。客舱机组已通报。我们会保持警惕。" },
      { id: "dl-deport-cpt-006", speaker: "Captain", english: "Thank you. Keep me posted if anything changes.", chinese: "谢谢。有任何变化随时通知我。" }
    ]
  },
  {
    id: "explosive-detector-usage",
    title: "使用爆探检测",
    description: "安全员向机长报告使用爆炸物探测器。",
    icon: "ScanSearch",
    lines: [
      { id: "dl-detector-001", speaker: "Security Officer", english: "Captain, I'm preparing to use the explosive detector for a random check on carry-on baggage.", chinese: "机长，我准备使用爆炸物探测器对随机抽查的手提行李进行检测。" },
      { id: "dl-detector-002", speaker: "Captain", english: "Acknowledged. What's the planned inspection ratio?", chinese: "收到。计划的检查比例是多少？" },
      { id: "dl-detector-003", speaker: "Security Officer", english: "As per procedure, approximately 10% of passengers or when deemed necessary. The detector is calibrated and ready.", chinese: "按照程序，大约10%的旅客，或者在认为必要时进行。探测器已校准完毕，准备就绪。" },
      { id: "dl-detector-004", speaker: "Captain", english: "Proceed. Report any findings immediately.", chinese: "请进行。有任何发现立即报告。" },
      { id: "dl-detector-005", speaker: "Security Officer", english: "Will do, Captain. Inspection commencing now.", chinese: "会的，机长。检查现在开始。" }
    ]
  },
  {
    id: "carrying-company-documents",
    title: "携带公司文件",
    description: "安全员与机长沟通关于携带公司文件事宜。",
    icon: "FileText",
    lines: [
      { id: "dl-docs-001", speaker: "Security Officer", english: "Captain, I've received two sealed documents from the sales department to be transported on this flight.", chinese: "机长，我从公司营业部收到了两份密封文件，需要在本次航班上运输。" },
      { id: "dl-docs-002", speaker: "Captain", english: "Are they listed on the cargo manifest or as COMAT (Company Material)?", chinese: "它们是否列在货物清单上，或者作为公司物资 (COMAT)？" },
      { id: "dl-docs-003", speaker: "Security Officer", english: "They are marked as COMAT, and I have the authorization form. They've been security screened.", chinese: "它们标记为公司物资，我有授权表格。已经过安全检查。" },
      { id: "dl-docs-004", speaker: "Captain", english: "Alright. Ensure they are stowed securely in the cockpit or another approved location. You are responsible for them until handover at the destination.", chinese: "好的。确保将它们安全存放在驾驶舱或其他批准的地点。在目的地交接前，由你负责保管。" },
      { id: "dl-docs-005", speaker: "Security Officer", english: "Understood, Captain. They will be secured in the designated flight bag in the cockpit.", chinese: "明白，机长。它们将被存放在驾驶舱指定的飞行包内。" }
    ]
  },
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
    id: "electronic-device-usage-report",
    title: "电子设备使用报告",
    description: "安全员向机长报告旅客违规使用电子设备。",
    icon: "SmartphoneNfc",
    lines: [
      { id: "dl-elecrep-001", speaker: "Security Officer", english: "Captain, a passenger in 22B was found using a non-approved electronic device during taxi.", chinese: "机长，发现22B座一名旅客在滑行期间使用未经批准的电子设备。" },
      { id: "dl-elecrep-002", speaker: "Captain", english: "What kind of device and what was the passenger's response?", chinese: "是什么设备？该旅客有何反应？" },
      { id: "dl-elecrep-003", speaker: "Security Officer", english: "It was a small radio transmitter. He initially refused to turn it off, but complied after a warning. The device is now off and stowed.", chinese: "是一个小型无线电发射器。他最初拒绝关闭，但在警告后遵守了。设备现已关闭并收好。" },
      { id: "dl-elecrep-004", speaker: "Captain", english: "Good. Document the incident. Keep an eye on him. Any further non-compliance, let me know immediately.", chinese: "好的。记录下这起事件。留意他。如有任何进一步的不合作行为，立即通知我。" },
      { id: "dl-elecrep-005", speaker: "Security Officer", english: "Will do. I have his details and will complete the Information Reminder Form.", chinese: "会的。我已经记录了他的详细信息，并将填写信息提示单。" },
      { id: "dl-elecrep-006", speaker: "Captain", english: "Thank you for the prompt report.", chinese: "感谢您的及时报告。" }
    ]
  },
  {
    id: "mobile-phone-usage-violation",
    title: "旅客违规使用手机",
    description: "安全员处理旅客在关键阶段违规使用手机。",
    icon: "PhoneOff",
    lines: [
      { id: "dl-phonevio-001", speaker: "Security Officer", english: "Excuse me, ma'am, please switch your phone to flight mode immediately. We are preparing for takeoff.", chinese: "打扰一下女士，请立即将您的手机调至飞行模式。我们正在准备起飞。" },
      { id: "dl-phonevio-002", speaker: "Passenger", english: "It's just a quick call, I'll be done in a second.", chinese: "就一个短电话，马上就好。" },
      { id: "dl-phonevio-003", speaker: "Security Officer", english: "Ma'am, all phones must be in flight mode or turned off for safety. This is a critical phase of flight. Please comply now.", chinese: "女士，为安全起见，所有手机必须处于飞行模式或关闭。这是飞行的关键阶段。请您现在就配合。" },
      { id: "dl-phonevio-004", speaker: "Passenger", english: "Ugh, fine. (Switches phone to flight mode)", chinese: "哎，好吧。（将手机调至飞行模式）" },
      { id: "dl-phonevio-005", speaker: "Security Officer", english: "Thank you for your cooperation. Enjoy your flight.", chinese: "谢谢您的合作。祝您旅途愉快。" }
    ]
  },
  {
    id: "seat-dispute-resolution",
    title: "抢占座位纠纷",
    description: "安全员调解乘客间的座位纠纷。",
    icon: "UsersCog",
    lines: [
      { id: "dl-seatdis-001", speaker: "Security Officer", english: "Excuse me, what seems to be the problem here?", chinese: "打扰一下，这里发生什么事了？" },
      { id: "dl-seatdis-002", speaker: "Passenger X", english: "This is my seat! I have 10A on my boarding pass!", chinese: "这是我的座位！我的登机牌上是10A！" },
      { id: "dl-seatdis-003", speaker: "Passenger Y", english: "No, this is my seat! The cabin crew told me to sit here.", chinese: "不，这是我的座位！乘务员让我坐这里的。" },
      { id: "dl-seatdis-004", speaker: "Security Officer", english: "Okay, please calm down. May I see both your boarding passes, please?", chinese: "好的，请冷静。我能看一下两位的登机牌吗？" },
      { id: "dl-seatdis-005", speaker: "Security Officer", english: "(After checking) Sir (to Passenger X), your seat is indeed 10A. Ma'am (to Passenger Y), your boarding pass shows 12C. Perhaps there was a misunderstanding. Please allow me to escort you to 12C.", chinese: "（检查后）先生（对乘客X说），您的座位确实是10A。女士（对乘客Y说），您的登机牌显示的是12C。可能有些误会。请允许我陪您到12C座位。" },
      { id: "dl-seatdis-006", speaker: "Passenger Y", english: "Oh, I must have misheard. I'm sorry.", chinese: "哦，我一定是听错了。对不起。" }
    ]
  },
  {
    id: "escort-management-communication",
    title: "押解人员管理沟通",
    description: "安全员与机长就押解事宜进行沟通。",
    icon: "UserCheck",
    lines: [
      { id: "dl-escortmgt-001", speaker: "Security Officer", english: "Captain, regarding the escorted suspect: three police officers, suspect in 35B, officers in 35A, 35C, and 34B.", chinese: "机长，关于押解的嫌疑人：三名警官，嫌疑人在35B，警官分别在35A、35C和34B。" },
      { id: "dl-escortmgt-002", speaker: "Captain", english: "Understood. Any specific requirements from the escorting officers for during the flight?", chinese: "明白。押解警官对飞行途中有什么特殊要求吗？" },
      { id: "dl-escortmgt-003", speaker: "Security Officer", english: "They've requested no metal tableware for the suspect and restricted access to alcoholic beverages. They will manage his lavatory visits.", chinese: "他们要求不给嫌疑人提供金属餐具，并限制酒精饮料。他们会管理嫌疑人上洗手间。" },
      { id: "dl-escortmgt-004", speaker: "Captain", english: "Standard procedure. Ensure cabin crew is aware and maintains discreet observation. Last to board, first to deplane for them.", chinese: "标准程序。确保客舱机组知晓并进行谨慎观察。他们最后登机，最先下机。" },
      { id: "dl-escortmgt-005", speaker: "Security Officer", english: "Correct. Boarding and deplaning sequence is confirmed with ground staff and the officers.", chinese: "是的。登离机顺序已与地勤和警官确认。" },
      { id: "dl-escortmgt-006", speaker: "Captain", english: "Good. Report any issues immediately.", chinese: "好的。有任何问题立即报告。" }
    ]
  },
  {
    id: "security-check-complete-report",
    title: "安保检查完毕报告",
    description: "安全员向机长报告客舱安保检查完成。",
    icon: "ShieldCheck",
    lines: [
      { id: "dl-chkcomplete-001", speaker: "Security Officer", english: "Captain, the cabin security check is finished.", chinese: "机长，客舱安保检查完毕。" },
      { id: "dl-chkcomplete-002", speaker: "Captain", english: "Any anomalies or suspicious items found?", chinese: "发现任何异常或可疑物品吗？" },
      { id: "dl-chkcomplete-003", speaker: "Security Officer", english: "No suspicious items found. All areas are clear. One unattended bag was claimed by a passenger in 5C.", chinese: "未发现可疑物品，所有区域均已清查。一个无人看管的包被5C座的旅客认领。" },
      { id: "dl-chkcomplete-004", speaker: "Captain", english: "Good. Are all emergency exits clear and accessible?", chinese: "很好。所有紧急出口是否畅通无阻？" },
      { id: "dl-chkcomplete-005", speaker: "Security Officer", english: "Yes, all emergency exits are clear and equipment is in place.", chinese: "是的，所有紧急出口畅通，设备齐全。" },
      { id: "dl-chkcomplete-006", speaker: "Captain", english: "Excellent. Thank you. We are ready for boarding.", chinese: "非常好。谢谢。我们准备好登机了。" }
    ]
  },
  // Emergency Situations
  {
    id: "in-flight-incident-communication",
    title: "飞行事故通信",
    description: "飞行员与空管就飞行中发生的事故进行通信。",
    icon: "RadioTower",
    lines: [
      { id: "dl-inc001", speaker: "Pilot", english: "Mayday, Mayday, Mayday. SkyAir 123, experiencing a minor hydraulic leak.", chinese: "Mayday, Mayday, Mayday。天航123，遭遇轻微液压泄漏。" },
      { id: "dl-inc002", speaker: "ATC", english: "SkyAir 123, roger Mayday. State your intentions.", chinese: "天航123，收到Mayday。请说明您的意图。" },
      { id: "dl-inc003", speaker: "Pilot", english: "Requesting priority landing at nearest suitable airport. Maintaining current altitude for now.", chinese: "请求在最近的合适机场优先降落。目前保持当前高度。" },
      { id: "dl-inc004", speaker: "ATC", english: "SkyAir 123, understood. Turn right heading 0-9-0, descend and maintain flight level 1-0-0.", chinese: "天航123，明白。右转航向0-9-0，下降并保持飞行高度100。" }
    ]
  },
  {
    id: "fighting-brawling",
    title: "打架斗殴",
    description: "处理乘客间打架斗殴事件。",
    icon: "ShieldAlert",
    lines: [
      { id: "dl-fight-001", speaker: "Security Officer", english: "Stop! What are you doing? Calm down, both of you!", chinese: "住手！你们在干什么？你们两个冷静一下！" },
      { id: "dl-fight-002", speaker: "Passenger A", english: "He bumped into me on purpose!", chinese: "他路过的时候故意撞我！" },
      { id: "dl-fight-003", speaker: "Passenger B", english: "He swore at me first!", chinese: "是他先骂我的！" },
      { id: "dl-fight-004", speaker: "Security Officer", english: "Fighting on an aircraft is a serious offense. I need you both to cooperate. What happened?", chinese: "在飞机上打架是严重违规行为。我需要你们双方配合。发生了什么事？" },
      { id: "dl-fight-005", speaker: "Passenger A", english: "He started it! He pushed me and called me names.", chinese: "是他先动手的！他推我，还骂我。" },
      { id: "dl-fight-006", speaker: "Passenger B", english: "That's a lie! You were blocking the aisle and wouldn't move!", chinese: "胡说！你挡着过道不让我过去！" },
      { id: "dl-fight-007", speaker: "Security Officer", english: "Okay, I understand there's a disagreement. We need to resolve this peacefully. I will separate you for now. Passenger A, please come with me. Passenger B, please remain in your seat and calm down.", chinese: "好了，我明白你们之间有分歧。我们需要和平解决。我现在会把你们分开。乘客A，请跟我来。乘客B，请留在座位上冷静一下。" },
      { id: "dl-fight-008", speaker: "Security Officer", english: "Captain, there was a physical altercation between two passengers in 25B and 25C. I have separated them. The situation is currently under control.", chinese: "机长，25B和25C的两名乘客发生了肢体冲突。我已经将他们分开了。目前情况已得到控制。" },
      { id: "dl-fight-009", speaker: "Captain", english: "Roger that. Keep me updated. Do we need to involve ground authorities upon arrival?", chinese: "收到。随时向我汇报。我们抵达后需要地面警方介入吗？" },
      { id: "dl-fight-010", speaker: "Security Officer", english: "Potentially. I will assess further and inform you. For now, I will issue them both with verbal warnings and monitor their behavior.", chinese: "有可能。我会进一步评估并告知您。目前，我会对他们分别进行口头警告，并监控他们的行为。" },
    ]
  },
  {
    id: "cockpit-communication-smoking-incident",
    title: "与驾驶舱沟通-旅客吸烟事件",
    description: "安全员向机长报告并商议旅客吸烟事件处理。",
    icon: "MessageCircleWarning",
    lines: [
      { id: "dl-ccsmoke-001", speaker: "Security Officer", english: "Captain, a passenger in seat 12A was found smoking in the lavatory.", chinese: "机长，12A座一名旅客在厕所吸烟。" },
      { id: "dl-ccsmoke-002", speaker: "Captain", english: "Roger. How did you handle it?", chinese: "收到。你是如何处置的？" },
      { id: "dl-ccsmoke-003", speaker: "Security Officer", english: "I've confiscated his cigarettes and lighter, and informed him of the seriousness. He's cooperative now.", chinese: "我已经没收了他的香烟和打火机，并告知了严重性。他现在很配合。" },
      { id: "dl-ccsmoke-004", speaker: "Captain", english: "Good. Do we need to call the police upon arrival?", chinese: "好的。落地后需要报警吗？" },
      { id: "dl-ccsmoke-005", speaker: "Security Officer", english: "Given his cooperation, perhaps a stern warning and documentation will suffice, but I'll leave the final decision to you. I suggest we call the police to handle it.", chinese: "鉴于他的配合，或许严厉警告和书面记录即可，但我将最终决定权交给您。我建议我们报警处理。" },
      { id: "dl-ccsmoke-006", speaker: "Captain", english: "Alright, let's prepare for police involvement. Please complete the Information Reminder Form. Keep him under surveillance.", chinese: "好吧，准备让警方介入。请填写好信息提示单。对他保持监控。" },
      { id: "dl-ccsmoke-007", speaker: "Security Officer", english: "Understood, Captain. Form will be ready, and passenger will be monitored.", chinese: "明白，机长。表格会准备好，并且会监控该旅客。" }
    ]
  },
  {
    id: "cockpit-communication-phone-violation",
    title: "与驾驶舱沟通-违规使用手机",
    description: "安全员向机长报告旅客严重违规使用手机事件。",
    icon: "PhoneIncoming",
    lines: [
      { id: "dl-ccphone-001", speaker: "Security Officer", english: "Captain, a passenger in 7D is persistently using their mobile phone for calls, despite repeated warnings.", chinese: "机长，7D座一名旅客在多次警告后仍坚持使用手机通话。" },
      { id: "dl-ccphone-002", speaker: "Captain", english: "What's their attitude? Are they aggressive?", chinese: "他的态度如何？有攻击性吗？" },
      { id: "dl-ccphone-003", speaker: "Security Officer", english: "His attitude is very poor. He rejected our advice and is quite loud. Not physically aggressive, but uncooperative.", chinese: "他态度很差，拒绝我们的劝告，声音也很大。没有肢体攻击，但不合作。" },
      { id: "dl-ccphone-004", speaker: "Captain", english: "This is unacceptable. We might need to involve ground police. Inform him that if he doesn't comply, he will be handed over to the authorities upon landing.", chinese: "这是不可接受的。我们可能需要地面公安介入。告知他如果再不遵守，落地后将被移交当局。" },
      { id: "dl-ccphone-005", speaker: "Security Officer", english: "I've already warned him of that. He seems indifferent. I will document this thoroughly.", chinese: "我已经警告过他了，他似乎无动于衷。我会详细记录此事。" },
      { id: "dl-ccphone-006", speaker: "Captain", english: "Okay. Let's prepare for that eventuality. Make sure all necessary paperwork is ready.", chinese: "好的。为那种可能发生的情况做好准备。确保所有必要文件都已备妥。" },
      { id: "dl-ccphone-007", speaker: "Security Officer", english: "Roger. I'll ensure the Information Reminder Form is accurately filled out.", chinese: "收到。我会确保信息提示单准确填写完毕。" }
    ]
  },
  {
    id: "explosive-threat-report",
    title: "爆炸物威胁报告",
    description: "安全员向机长报告发现疑似爆炸物。",
    icon: "Bomb",
    lines: [
      { id: "dl-bomb-001", speaker: "Security Officer", english: "Captain, urgent. We found a suspicious package in the aft lavatory that resembles an explosive device.", chinese: "机长，紧急情况。我们在后部洗手间发现一个可疑包裹，疑似爆炸装置。" },
      { id: "dl-bomb-002", speaker: "Captain", english: "Understood. Have you initiated LRBL procedures? Is the area secured?", chinese: "明白。你们启动最低风险炸弹位置程序了吗？该区域是否已隔离？" },
      { id: "dl-bomb-003", speaker: "Security Officer", english: "Yes, attempting to move it to the LRBL now. Area is being cleared. Cabin crew are assisting.", chinese: "是的，正在尝试将其移至最低风险炸弹位置。正在清空该区域。客舱机组正在协助。" },
      { id: "dl-bomb-004", speaker: "Captain", english: "Roger. I am declaring an emergency and diverting to the nearest suitable airport. Keep me updated on the device status.", chinese: "收到。我宣布紧急状态，并备降至最近的合适机场。随时向我更新装置的状态。" }
    ]
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
