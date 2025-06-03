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
  {
    id: "cockpit-smoking-incident",
    title: "与驾驶舱沟通-旅客吸烟事件",
    description: "向机长报告并处理旅客在厕所吸烟的情况。",
    icon: "Ban",
    lines: [
      { id: "dl-smoke-001", speaker: "Security Officer", english: "Captain, we found a passenger smoking in the lavatory.", chinese: "机长，发现一名旅客在厕所吸烟。" },
      { id: "dl-smoke-002", speaker: "Captain", english: "What's going on?", chinese: "现在情况如何？" },
      { id: "dl-smoke-003", speaker: "Security Officer", english: "We have the situation under control and I have confiscated his cigarettes and lighter. I suggest we call the police to handle it.", chinese: "我们已将事态控制并已经没收了该乘客的香烟及打火机。建议机长报警处理。" },
      { id: "dl-smoke-004", speaker: "Captain", english: "Good job! Please complete the 'Information Reminder Form' and submit it to me.", chinese: "做得好！请写好《信息提示单》后交给我。" },
      { id: "dl-smoke-005", speaker: "Security Officer", english: "Yes, I will fill out the relevant documents immediately.", chinese: "是的，我马上填写相关单据。" },
      { id: "dl-smoke-006", speaker: "Captain", english: "Please keep this passenger closely under surveillance.", chinese: "请对该旅客持续做好监控。" },
      { id: "dl-smoke-007", speaker: "Security Officer", english: "Yes, and I have recorded his information.", chinese: "是的，我已对该旅客的信息作好记录。" },
    ],
  },
  {
    id: "passenger-smoking-handling",
    title: "旅客吸烟事件处置",
    description: "直接处理旅客吸烟事件，包括录音录像和警告。",
    icon: "AlertTriangle",
    lines: [
      { id: "dl-psmoke-001", speaker: "Security Officer", english: "I'm the security officer on this flight, responsible for security work onboard. I will record audio and video. Please cooperate. Are you smoking in the restroom?", chinese: "你好，我是本次航班的安全员，负责机上安保工作，现在对执勤过程录音录像请配合！你是在洗手间吸烟了是吗？" },
      { id: "dl-psmoke-002", speaker: "Passenger", english: "I'm sorry, yes I did.", chinese: "是的，我很抱歉。" },
      { id: "dl-psmoke-003", speaker: "Security Officer", english: "Where did you put your cigarette end?", chinese: "请问你把烟头丢在哪里了？" },
      { id: "dl-psmoke-004", speaker: "Passenger", english: "I smoke an electronic cigarette.", chinese: "我抽的是电子烟。" },
      { id: "dl-psmoke-005", speaker: "Security Officer", english: "Smoking is a serious threat to flight safety, so we will call the police. Please be the last to disembark after landing.", chinese: "吸烟是严重威胁飞行安全的，所以我们会报警，请你在落地后最后一个下机。" },
      { id: "dl-psmoke-006", speaker: "Passenger", english: "Sorry, it was my fault.", chinese: "不好意思，是我的错。" },
    ],
  },
  {
    id: "power-bank-usage",
    title: "擅自使用充电宝",
    description: "处理旅客违规使用充电宝的情况。",
    icon: "Battery",
    lines: [
      { id: "dl-power-001", speaker: "Security Officer", english: "Excuse me, please do not use the power bank.", chinese: "你好，请不要使用充电宝。" },
      { id: "dl-power-002", speaker: "Passenger", english: "But my cell phone is out of battery.", chinese: "但是我的手机没电了。" },
      { id: "dl-power-003", speaker: "Security Officer", english: "According to the CAAC regulations, the power bank cannot be used during the flight.", chinese: "根据中国民航法规定，在飞行过程中是不允许使用充电宝的。" },
      { id: "dl-power-004", speaker: "Passenger", english: "How do I inform my family when I land?", chinese: "那我落地后怎么通知家人？" },
      { id: "dl-power-005", speaker: "Security Officer", english: "You can use my phone if you need, and you can charge your phone when you disembark.", chinese: "如果需要，您可以落地后用我的手机，等您下飞机之后再给您的电话充电。" },
      { id: "dl-power-006", speaker: "Passenger", english: "OK, thank you.", chinese: "那好吧，谢谢。" },
    ],
  },
  {
    id: "intoxicated-passenger",
    title: "醉酒旅客",
    description: "处理醉酒旅客，确保飞行安全。",
    icon: "Wine",
    lines: [
      { id: "dl-drunk-001", speaker: "Security Officer", english: "Excuse me, may I ask if you have been drinking?", chinese: "您好，请问您是不是喝酒了？" },
      { id: "dl-drunk-002", speaker: "Passenger", english: "Yes, what's the matter?", chinese: "是的，怎么了？" },
      { id: "dl-drunk-003", speaker: "Security Officer", english: "It's OK. Do you have any friends with you?", chinese: "没什么，请问您有朋友跟您一起吗？" },
      { id: "dl-drunk-004", speaker: "Passenger", english: "Yes, there are two other friends who boarded the plane with me.", chinese: "有的，还有两位朋友跟我一起上机的。" },
      { id: "dl-drunk-005", speaker: "Security Officer", english: "Can you manage your behavior?", chinese: "那您能控制好自己吗？" },
      { id: "dl-drunk-006", speaker: "Passenger", english: "Sure, I didn't drink a lot.", chinese: "没问题的，我没喝很多酒。" },
      { id: "dl-drunk-007", speaker: "Security Officer", english: "OK, if you need some help, you can ask your friends to tell us.", chinese: "好的，如果有什么需要，可以让您随行的朋友告诉我们。" },
      { id: "dl-drunk-008", speaker: "Passenger", english: "OK, thanks.", chinese: "好，谢谢。" },
    ],
  },
  {
    id: "localized-cabin-check",
    title: "局部清舱",
    description: "对特定区域进行安全检查。",
    icon: "Search",
    lines: [
      { id: "dl-local-001", speaker: "Security Officer", english: "I'm the security officer of this flight. Please check and confirm your luggage in rows 3 to 9.", chinese: "我是航班的航空安全员，请座位号3至9排的旅客检查并确认一下你们的行李。" },
      { id: "dl-local-002", speaker: "Passenger", english: "What happened on the aircraft?", chinese: "飞机上发生什么了吗？" },
      { id: "dl-local-003", speaker: "Security Officer", english: "The passenger in seat 6A has already left the aircraft due to personal reasons.", chinese: "坐在6A的旅客由于个人原因已经离开了飞机。" },
      { id: "dl-local-004", speaker: "Security Officer", english: "For security reasons, please follow our instructions.", chinese: "为了安全原因请遵循我们的指令。" },
      { id: "dl-local-005", speaker: "Passenger", english: "I see. I'll tell you if we have any problems.", chinese: "我知道了，如果我们有问题的话我会告诉你。" },
    ],
  },
  {
    id: "cockpit-passenger-discontinue",
    title: "与驾驶舱沟通-乘客终止行程",
    description: "向机长报告有乘客要终止行程的情况。",
    icon: "UserX",
    lines: [
      { id: "dl-discon-001", speaker: "Security Officer", english: "Captain, two passengers want to end their trip.", chinese: "机长，有两名乘客想要终止本次行程。" },
      { id: "dl-discon-002", speaker: "Captain", english: "Alright, where are their seats? I need to inform the staff.", chinese: "好吧，他们坐在哪里？我需要通知工作人员。" },
      { id: "dl-discon-003", speaker: "Security Officer", english: "Their seat number is 6A/B.", chinese: "他们座位号是6A/B。" },
      { id: "dl-discon-004", speaker: "Security Officer", english: "Captain, which kind of check do I need to do after they disembark?", chinese: "机长，下机后我应该做哪一种检查？" },
      { id: "dl-discon-005", speaker: "Captain", english: "A localized check is enough.", chinese: "局部的检查就足够了。" },
      { id: "dl-discon-006", speaker: "Security Officer", english: "I see. I will report after it's finished.", chinese: "我知道了，完成后会报告。" },
    ],
  },
  {
    id: "deportees-handling",
    title: "遣返旅客",
    description: "处理遣返旅客登机事宜。",
    icon: "UserMinus",
    lines: [
      { id: "dl-deport-001", speaker: "Staff", english: "Who is the security officer on board?", chinese: "哪位是飞机上的航空安全员？" },
      { id: "dl-deport-002", speaker: "Security Officer", english: "I'm the flight security officer on board.", chinese: "我是本次航班上的航空安全员。" },
      { id: "dl-deport-003", speaker: "Security Officer", english: "Anything for me?", chinese: "有什么事情吗找我？" },
      { id: "dl-deport-004", speaker: "Staff", english: "We have two deportees for the flight from Osaka to Shanghai. Here are their documents and passports.", chinese: "有两名遣返从大阪到上海，这是遣返的证明和护照。" },
      { id: "dl-deport-005", speaker: "Security Officer", english: "Thank you. But I need to inform our crew first. So please wait.", chinese: "谢谢你。但是我需要先通知我们组员，请稍等。" },
      { id: "dl-deport-006", speaker: "Security Officer", english: "Thanks for waiting. Please let the deportees board first.", chinese: "谢谢你的等待，请让遣返旅客先登机。" },
    ],
  },
  {
    id: "cockpit-deportees",
    title: "与驾驶舱沟通-遣返旅客",
    description: "向机长报告遣返旅客情况。",
    icon: "AlertCircle",
    lines: [
      { id: "dl-cockdeport-001", speaker: "Security Officer", english: "Captain, I've just been informed by the staff that there are two deportees.", chinese: "机长，我刚刚从地服那边收到两名遣返旅客的通知。" },
      { id: "dl-cockdeport-002", speaker: "Captain", english: "Alright! It shouldn't be a big problem, but please follow the procedure and confirm.", chinese: "好吧！这应该不是什么大问题，请根据程序做并确认。" },
      { id: "dl-cockdeport-003", speaker: "Captain", english: "And where are they seated?", chinese: "他们坐在哪里？" },
      { id: "dl-cockdeport-004", speaker: "Security Officer", english: "Their seat number is 27A/B.", chinese: "他们座位号是27排A/B。" },
      { id: "dl-cockdeport-005", speaker: "Captain", english: "Good! Please report again after boarding.", chinese: "很好，请在登机后再给我报告一下。" },
      { id: "dl-cockdeport-006", speaker: "Security Officer", english: "Don't worry! I will handle it.", chinese: "别担心，我会处理好的。" },
    ],
  },
  {
    id: "explosive-detector-usage",
    title: "与驾驶舱沟通-使用爆探",
    description: "使用爆炸物探测器前向机长报告。",
    icon: "Scan",
    lines: [
      { id: "dl-detector-001", speaker: "Security Officer", english: "Captain, according to procedure, we need to report to you before we start using the detector.", chinese: "机长，根据程序，我们在使用爆探前需要向你报告一些内容。" },
      { id: "dl-detector-002", speaker: "Captain", english: "Sounds good.", chinese: "很好。" },
      { id: "dl-detector-003", speaker: "Security Officer", english: "The detector is ready for inspection now, and at least fifty percent of passengers will be checked.", chinese: "爆探已经准备好检测，并且会检测至少百分之五十的乘客。" },
      { id: "dl-detector-004", speaker: "Security Officer", english: "The security crew will report after the check is finished or if any problem is found.", chinese: "安保组在完成检查后或发现任何问题时会向你报告。" },
      { id: "dl-detector-005", speaker: "Captain", english: "Thank you for your effort.", chinese: "辛苦了。" },
    ],
  },
  {
    id: "company-documents",
    title: "驾驶舱沟通-携带公司文件",
    description: "向机长报告携带公司文件事宜。",
    icon: "FileText",
    lines: [
      { id: "dl-docs-001", speaker: "Security Officer", english: "Captain, I received two documents from the sales department.", chinese: "机长，我从公司营业部那边收到了两份文件。" },
      { id: "dl-docs-002", speaker: "Security Officer", english: "Do I have your approval to bring these documents to Shanghai?", chinese: "我能把它们带到上海吗？" },
      { id: "dl-docs-003", speaker: "Captain", english: "You can carry them, but please confirm their security status.", chinese: "你可以携带，但是请你在安全方面再确认一下。" },
      { id: "dl-docs-004", speaker: "Security Officer", english: "The documents have already been through security.", chinese: "文件已经经过安检了。" },
      { id: "dl-docs-005", speaker: "Captain", english: "Sounds good! Thanks for your report.", chinese: "听起来很好！谢谢你给我报告。" },
    ],
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
    id: "electronic-device-report",
    title: "电子设备使用报告机长",
    description: "向机长报告旅客违规使用电子设备。",
    icon: "Smartphone",
    lines: [
      { id: "dl-elec-001", speaker: "Captain", english: "Did anything happen?", chinese: "发生什么情况了吗？" },
      { id: "dl-elec-002", speaker: "Security Officer", english: "Captain, one passenger used electronic equipment in violation of regulations.", chinese: "机长，有一名旅客违规使用电子设备。" },
      { id: "dl-elec-003", speaker: "Captain", english: "How did you handle it?", chinese: "你是如何处置的？" },
      { id: "dl-elec-004", speaker: "Security Officer", english: "I have stopped him and given him a warning.", chinese: "我已制止他的行为并且发出了警告。" },
      { id: "dl-elec-005", speaker: "Captain", english: "Please keep this passenger closely under surveillance.", chinese: "请对该旅客持续做好监控。" },
      { id: "dl-elec-006", speaker: "Security Officer", english: "Sure, I will keep an eye on him all the time.", chinese: "好的机长，我会一直关注他。" },
    ],
  },
  {
    id: "explosive-report",
    title: "爆炸物报告",
    description: "发现疑似爆炸物的紧急报告。",
    icon: "AlertTriangle",
    lines: [
      { id: "dl-bomb-001", speaker: "Security Officer", english: "Captain, we found an explosive in the lavatory.", chinese: "报告机长，我们在厕所发现疑似炸弹。" },
      { id: "dl-bomb-002", speaker: "Captain", english: "Did you confirm it?", chinese: "确认是爆炸物吗？" },
      { id: "dl-bomb-003", speaker: "Security Officer", english: "Yes, we have confirmed it.", chinese: "是的，我们已经确认了是爆炸物。" },
      { id: "dl-bomb-004", speaker: "Captain", english: "Deal with it according to procedure.", chinese: "按照预案处置。" },
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
  {
    id: "passenger-mobile-phone",
    title: "旅客使用手机",
    description: "处理旅客在飞行中违规使用手机。",
    icon: "PhoneOff",
    lines: [
      { id: "dl-phone-001", speaker: "Security Officer", english: "Sir, please switch your phone to flight mode immediately.", chinese: "先生，请立即将手机调至飞行模式！" },
      { id: "dl-phone-002", speaker: "Passenger", english: "I need to call my girlfriend.", chinese: "我需要给我女朋友打电话。" },
      { id: "dl-phone-003", speaker: "Security Officer", english: "Sir, mobile phone calls are not allowed during the flight. Please switch your phone to flight mode. You can contact her after landing.", chinese: "先生，飞行期间不允许打电话，请将手机调至飞行模式，落地后再联系。" },
      { id: "dl-phone-004", speaker: "Passenger", english: "No! Leave me alone!", chinese: "不！ 别管我！" },
      { id: "dl-phone-005", speaker: "Security Officer", english: "Your behavior has seriously endangered our flight safety. If you don't stop, I will call the police to handle it, and you will bear the consequences arising therefrom.", chinese: "你的行为已经严重危害到了我们的飞行安全，否则我将叫警察来处理，由此产生的后果你自己承担。" },
    ],
  },
  {
    id: "cockpit-mobile-phone",
    title: "与驾驶舱沟通-违规使用手机",
    description: "向机长报告旅客违规使用手机并拒绝配合。",
    icon: "PhoneCall",
    lines: [
      { id: "dl-cockphone-001", speaker: "Security Officer", english: "Captain, a passenger was caught using a mobile phone during takeoff.", chinese: "机长，有一旅客在起飞时违规使用手机。" },
      { id: "dl-cockphone-002", speaker: "Captain", english: "Won't he turn it to flight mode?", chinese: "他不肯调成飞行模式？" },
      { id: "dl-cockphone-003", speaker: "Security Officer", english: "Yes! His attitude is very poor and he rejected our advice.", chinese: "是的！这位旅客态度很差，并且拒绝我们的劝告。" },
      { id: "dl-cockphone-004", speaker: "Captain", english: "OK! What's your point?", chinese: "好吧！你有什么看法？" },
      { id: "dl-cockphone-005", speaker: "Security Officer", english: "We need to call the ground police to handle it.", chinese: "我们需要呼叫地面公安来处理。" },
      { id: "dl-cockphone-006", speaker: "Captain", english: "Good job! Please complete the 'Information Reminder Form' and submit it to me.", chinese: "做得好！请写好《信息提示单》后交给我。" },
      { id: "dl-cockphone-007", speaker: "Security Officer", english: "Yes, I will fill out the relevant documents immediately.", chinese: "是的，我马上填写相关单据。" },
    ],
  },
  {
    id: "seat-grabbing",
    title: "抢占座位",
    description: "解决旅客座位争议。",
    icon: "User",
    lines: [
      { id: "dl-seat-001", speaker: "Security Officer", english: "Excuse me, what's wrong?", chinese: "请问发生了什么事？" },
      { id: "dl-seat-002", speaker: "Passenger A", english: "It's my seat, my seat is window-side!", chinese: "这是我的座位，我的座位是靠窗的！" },
      { id: "dl-seat-003", speaker: "Passenger B", english: "No! This seat is mine! You must be wrong!", chinese: "不，这是我的座位，你一定是坐错了！" },
      { id: "dl-seat-004", speaker: "Security Officer", english: "OK, please show me your boarding pass.", chinese: "请两位给我你们的登机牌。" },
      { id: "dl-seat-005", speaker: "Passenger A & B", english: "Here you are.", chinese: "给。" },
      { id: "dl-seat-006", speaker: "Security Officer", english: "I think you are mistaken Mr. A, your seat is in the back row. Please return to your seat.", chinese: "是A先生座位错了，您的座位在后一排，请您回到您的原位。" },
    ],
  },
  {
    id: "suspect-escort",
    title: "押解",
    description: "处理嫌疑人押解的安保要求。",
    icon: "Lock",
    lines: [
      { id: "dl-escort-001", speaker: "Security Officer", english: "There will be a suspect escorted by three police officers. The suspect will be seated at 27B.", chinese: "本次航班将有一名嫌疑人，由三名警官押解。嫌疑人将坐在27B座位。" },
      { id: "dl-escort-002", speaker: "Captain", english: "Are there any security requirements?", chinese: "安保有什么要求？" },
      { id: "dl-escort-003", speaker: "Security Officer", english: "The escorted suspect should board before other passengers, and disembark after others. They cannot be on the same flight as a Very Important Person (VIP).", chinese: "被押解人犯要先于其他旅客登机，后于其他旅客下机。不得与重要旅客同机。" },
      { id: "dl-escort-004", speaker: "Captain", english: "Any other requirements?", chinese: "还有其他要求吗？" },
      { id: "dl-escort-005", speaker: "Security Officer", english: "Don't provide metal tableware. Don't provide alcoholic drinks.", chinese: "不要提供金属餐具，不要提供酒精饮料。" },
      { id: "dl-escort-006", speaker: "Captain", english: "Fine. Please pay attention to them.", chinese: "好的，注意监控。" },
    ],
  },
  {
    id: "security-check-complete",
    title: "安保检查完毕报告",
    description: "向机长报告客舱安保检查完成情况。",
    icon: "CheckCircle",
    lines: [
      { id: "dl-complete-001", speaker: "Security Officer", english: "Captain, the cabin security check is finished.", chinese: "机长，客舱安保检查完毕。" },
      { id: "dl-complete-002", speaker: "Captain", english: "OK, is everything okay?", chinese: "好的，有什么情况吗？" },
      { id: "dl-complete-003", speaker: "Security Officer", english: "There's a box of tableware in the rear of the cabin.", chinese: "机长，客舱后部有一箱餐具。" },
      { id: "dl-complete-004", speaker: "Captain", english: "Go and check it.", chinese: "好的，你去检查一下。" },
      { id: "dl-complete-005", speaker: "Security Officer", english: "I have checked it. No problem.", chinese: "已经检查过了，没问题。" },
      { id: "dl-complete-006", speaker: "Captain", english: "OK, call for boarding.", chinese: "好，通知旅客登机。" },
    ],
  },
];

// Quiz data can be generated from vocabulary/dialogues or defined separately
// For now, quiz logic will pick from these.

    