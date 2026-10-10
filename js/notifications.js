/**
 * BONE SIP — Daily Routine Push Notifications Engine
 *
 * Provides timely local & push reminders for:
 *   1. 07:00 AM — Morning sunbath & bone strengthening exercise
 *   2. 08:00 AM — Breakfast (8:00–9:30 AM · 390 mg calcium, 22 g protein)
 *   3. 01:00 PM — Lunch (1:00–2:30 PM · 390 mg calcium, 23 g protein)
 *   4. 04:30 PM — Evening snack (4:30–5:30 PM · 260 mg calcium, 14 g protein)
 *   5. 07:30 PM — Dinner (7:30–8:30 PM · 420 mg calcium, 27 g protein)
 *
 * Uses the mobile app logo (assets/icons/icon-192.png), vibration pattern, and
 * delivers all titles and bodies in the user's currently selected language
 * (English + 11 Indian languages: hi, bn, mr, te, ta, gu, kn, ml, pa, or, as).
 */
(function (global) {
  'use strict';

  const STORAGE_KEY_ENABLED = 'bonesip_reminders_enabled';
  const STORAGE_KEY_LAST_TEST = 'bonesip_last_test_notification';
  const ICON_PATH = 'assets/icons/icon-192.png';
  const BADGE_PATH = 'assets/icons/favicon-32.png';

  const SCHEDULE = [
    {
      id: 'm_sun_exercise',
      slot: 'm_sun_d3',
      pillar: 'strengthen',
      time: '07:00',
      displayTime: '7:00 AM',
      targetHour: 7,
      targetMinute: 0,
      icon3d: 'assets/icons3d/sun.webp',
      faIcon: 'fa-sun'
    },
    {
      id: 'm_breakfast',
      slot: 'm_breakfast',
      pillar: 'build',
      time: '08:00',
      displayTime: '8:00 AM',
      targetHour: 8,
      targetMinute: 0,
      icon3d: 'assets/icons3d/coffee.webp',
      faIcon: 'fa-mug-hot'
    },
    {
      id: 'm_lunch',
      slot: 'm_lunch',
      pillar: 'build',
      time: '13:00',
      displayTime: '1:00 PM',
      targetHour: 13,
      targetMinute: 0,
      icon3d: 'assets/icons3d/curry.webp',
      faIcon: 'fa-bowl-rice'
    },
    {
      id: 'm_snack',
      slot: 'm_snack',
      pillar: 'build',
      time: '16:30',
      displayTime: '4:30 PM',
      targetHour: 16,
      targetMinute: 30,
      icon3d: 'assets/icons3d/peanuts.webp',
      faIcon: 'fa-cookie-bite'
    },
    {
      id: 'm_dinner',
      slot: 'm_dinner',
      pillar: 'build',
      time: '19:30',
      displayTime: '7:30 PM',
      targetHour: 19,
      targetMinute: 30,
      icon3d: 'assets/icons3d/bowl.webp',
      faIcon: 'fa-utensils'
    }
  ];

  // Localized notification copies in all 12 supported languages
  const I18N_NOTIFS = {
    en: {
      welcome: {
        title: "🔔 BONE SIP Daily Reminders Active!",
        body: "You will receive daily reminders at 7 AM (Sun & Exercise), 8 AM (Breakfast), 1 PM (Lunch), 4:30 PM (Snack), and 7:30 PM (Dinner)."
      },
      m_sun_exercise: {
        title: "☀️ Morning Sunbath & Exercise Time!",
        body: "7:00 AM · Get 15–20 min natural Vitamin D3 and do your daily bone-strengthening moves."
      },
      m_breakfast: {
        title: "🥣 Breakfast Time (8:00–9:30 AM)",
        body: "Fuel your morning with 390 mg calcium & 22 g protein. Check today's recommended breakfast!"
      },
      m_lunch: {
        title: "🍛 Lunch Time (1:00–2:30 PM)",
        body: "Recharge with 390 mg calcium & 23 g protein. Tick off your balanced bone plate!"
      },
      m_snack: {
        title: "🥜 Evening Snack Time (4:30–5:30 PM)",
        body: "260 mg calcium & 14 g protein booster: enjoy makhana, roasted chana, nuts or seeds!"
      },
      m_dinner: {
        title: "🍲 Dinner Time (7:30–8:30 PM)",
        body: "420 mg calcium & 27 g protein to complete your daily bone target! Check off your dinner plate."
      },
      ui: {
        modalTitle: "Daily Routine Reminders",
        modalSub: "Stay consistent with your bone plan. Receive mobile alerts at your scheduled times.",
        masterToggle: "Enable Daily Reminders",
        statusActive: "Active · All 5 daily reminders scheduled",
        statusDisabled: "Reminders turned off · Tap switch to enable",
        statusBlocked: "Notifications blocked in your browser or device settings. Please allow notifications in site permissions.",
        testBtn: "Send Test Notification",
        testSent: "Test notification sent! Check your device lock screen.",
        inAppAlert: "Reminder Alert"
      }
    },
    hi: {
      welcome: {
        title: "🔔 BONE SIP दैनिक रिमाइंडर सक्रिय!",
        body: "आपको सुबह 7:00 (धूप और व्यायाम), 8:00 (नाश्ता), 1:00 (दोपहर का खाना), 4:30 (स्नैक) और 7:30 (रात का खाना) पर रिमाइंडर मिलेंगे।"
      },
      m_sun_exercise: {
        title: "☀️ सुबह की धूप और व्यायाम का समय!",
        body: "सुबह 7:00 बजे · 15–20 मिनट प्राकृतिक विटामिन D3 लें और अपनी हड्डियों को मजबूत करने वाले व्यायाम करें।"
      },
      m_breakfast: {
        title: "🥣 नाश्ते का समय (सुबह 8:00–9:30)",
        body: "390 mg कैल्शियम और 22 g प्रोटीन से दिन की शुरुआत करें। आज का अनुशंसित नाश्ता देखें!"
      },
      m_lunch: {
        title: "🍛 दोपहर के भोजन का समय (1:00–2:30 PM)",
        body: "390 mg कैल्शियम और 23 g प्रोटीन के साथ ऊर्जा पाएं। अपनी बोन प्लेट पूरी करें!"
      },
      m_snack: {
        title: "🥜 शाम के नाश्ते का समय (4:30–5:30 PM)",
        body: "260 mg कैल्शियम और 14 g प्रोटीन बूस्टर: मखाना, भुना चना, नट्स या बीज लें!"
      },
      m_dinner: {
        title: "🍲 रात के खाने का समय (7:30–8:30 PM)",
        body: "दैनिक लक्ष्य पूरा करने के लिए 420 mg कैल्शियम और 27 g प्रोटीन। रात का खाना मार्क करें!"
      },
      ui: {
        modalTitle: "दैनिक दिनचर्या रिमाइंडर",
        modalSub: "अपनी हड्डियों की योजना को न भूलें। निर्धारित समय पर मोबाइल सूचनाएं प्राप्त करें।",
        masterToggle: "दैनिक रिमाइंडर चालू करें",
        statusActive: "सक्रिय · सभी 5 दैनिक रिमाइंडर चालू हैं",
        statusDisabled: "रिमाइंडर बंद हैं · चालू करने के लिए स्विच दबाएं",
        statusBlocked: "ब्राउज़र या डिवाइस सेटिंग में सूचनाएं ब्लॉक हैं। कृपया साइट अनुमतियों में अनुमति दें।",
        testBtn: "टेस्ट नोटिफिकेशन भेजें",
        testSent: "टेस्ट नोटिफिकेशन भेजा गया! अपनी स्क्रीन चेक करें।",
        inAppAlert: "रिमाइंडर अलर्ट"
      }
    },
    bn: {
      welcome: {
        title: "🔔 BONE SIP দৈনিক রিমাইন্ডার সক্রিয়!",
        body: "আপনি প্রতিদিন সকাল ৭:০০ (রোদ ও ব্যায়াম), ৮:০০ (প্রাতঃরাশ), দুপুর ১:০০ (দুপুরের খাবার), বিকেল ৪:৩০ (জলখাবার) এবং রাত ৭:৩০ (নৈশভোজ)-এ রিমাইন্ডার পাবেন।"
      },
      m_sun_exercise: {
        title: "☀️ সকালের রোদ ও ব্যায়ামের সময়!",
        body: "সকাল ৭:০০ · ১৫–২০ মিনিট প্রাকৃতিক ভিটামিন D3 নিন এবং হাড় মজবুত করার ব্যায়াম সম্পন্ন করুন।"
      },
      m_breakfast: {
        title: "🥣 প্রাতঃরাশের সময় (সকাল ৮:০০–৯:৩০)",
        body: "৩৯০ মিলিগ্রাম ক্যালসিয়াম ও ২২ গ্রাম প্রোটিন দিয়ে সকাল শুরু করুন। আজকের খাবার দেখুন!"
      },
      m_lunch: {
        title: "🍛 দুপুরের খাবারের সময় (১:০০–২:৩০ PM)",
        body: "৩৯০ মিলিগ্রাম ক্যালসিয়াম ও ২৩ গ্রাম প্রোটিনের সাথে দুপুরের পুষ্টিকর খাবার সম্পূর্ণ করুন!"
      },
      m_snack: {
        title: "🥜 বিকেলের জলখাবারের সময় (৪:৩০–৫:৩০ PM)",
        body: "২৬০ মিলিগ্রাম ক্যালসিয়াম ও ১৪ গ্রাম প্রোটিন বুস্টার: মাখানা, ছোলা বা বাদাম খান!"
      },
      m_dinner: {
        title: "🍲 নৈশভোজের সময় (৭:৩০–৮:৩০ PM)",
        body: "দৈনিক হাড়ের লক্ষ্য পূরণ করতে ৪২০ মিলিগ্রাম ক্যালসিয়াম ও ২৭ গ্রাম প্রোটিন সমৃদ্ধ খাবার নিন!"
      },
      ui: {
        modalTitle: "দৈনিক রুটিন রিমাইন্ডার",
        modalSub: "হাড়ের পুষ্টি পরিকল্পনা বজায় রাখুন। নির্ধারিত সময়ে মোবাইল নোটিফিকেশন পান।",
        masterToggle: "দৈনিক রিমাইন্ডার চালু করুন",
        statusActive: "সক্রিয় · ৫টি দৈনিক রিমাইন্ডার নির্ধারিত",
        statusDisabled: "রিমাইন্ডার বন্ধ আছে · চালু করতে সুইচ চাপুন",
        statusBlocked: "ব্রাউজারে নোটিফিকেশন বন্ধ আছে। সাইট সেটিংসে অনুমতি দিন।",
        testBtn: "টেস্ট নোটিফিকেশন পাঠান",
        testSent: "টেস্ট নোটিফিকেশন পাঠানো হয়েছে! স্ক্রিন পরীক্ষা করুন।",
        inAppAlert: "রিমাইন্ডার সতর্কতা"
      }
    },
    mr: {
      welcome: {
        title: "🔔 BONE SIP दैनिक स्मरणपत्रे सुरू झाली!",
        body: "तुम्हाला दररोज सकाळी ७:०० (ऊन आणि व्यायाम), ८:०० (नाश्ता), दुपारी १:०० (दुपारचे जेवण), संध्याकाळी ४:३० (स्नॅक्स) आणि रात्री ७:३० (रात्रीचे जेवण) वाजता अलर्ट मिळतील."
      },
      m_sun_exercise: {
        title: "☀️ सकाळचे ऊन आणि व्यायामाची वेळ!",
        body: "सकाळी ७:०० · १५–२० मिनिटे नैसर्गिक व्हिटॅमिन D3 घ्या आणि हाडे बळकट करणारे व्यायाम करा."
      },
      m_breakfast: {
        title: "🥣 नाश्त्याची वेळ (सकाळी ८:००–९:३०)",
        body: "३९० मिग्रॅ कॅल्शियम आणि २२ ग्रॅम प्रथिनांसह दिवसाची सुरुवात करा. आजचा नाश्ता पहा!"
      },
      m_lunch: {
        title: "🍛 दुपारच्या जेवणाची वेळ (१:००–२:३० PM)",
        body: "३९० मिग्रॅ कॅल्शियम आणि २३ ग्रॅम प्रथिनांसह दुपारचे पौष्टिक जेवण पूर्ण करा!"
      },
      m_snack: {
        title: "🥜 संध्याकाळच्या स्नॅक्सची वेळ (४:३०–५:३० PM)",
        body: "२६० मिग्रॅ कॅल्शियम आणि १४ ग्रॅम प्रथिने: मखाणा, फुटाणे किंवा ड्रायफ्रुट्स घ्या!"
      },
      m_dinner: {
        title: "🍲 रात्रीच्या जेवणाची वेळ (७:३०–८:३० PM)",
        body: "४२० मिग्रॅ कॅल्शियम आणि २७ ग्रॅम प्रथिनांसह आजचे उद्दिष्ट पूर्ण करा. रात्रीचे जेवण नोंदवा!"
      },
      ui: {
        modalTitle: "दैनिक दिनचर्या स्मरणपत्रे",
        modalSub: "आपल्या हाडांचे आरोग्य सांभाळा. नियोजित वेळेवर मोबाइल सूचना मिळवा.",
        masterToggle: "दैनिक स्मरणपत्रे सुरू करा",
        statusActive: "सक्रिय · सर्व ५ स्मरणपत्रे नियोजित आहेत",
        statusDisabled: "स्मरणपत्रे बंद आहेत · सुरू करण्यासाठी स्विच दाबा",
        statusBlocked: "ब्राउझरमध्ये सूचना ब्लॉक केल्या आहेत. कृपया सेटिंग्जमध्ये परवानगी द्या.",
        testBtn: "चाचणी सूचना पाठवा",
        testSent: "चाचणी सूचना पाठवली आहे! स्क्रीन तपासा.",
        inAppAlert: "स्मरणपत्र सूचना"
      }
    },
    te: {
      welcome: {
        title: "🔔 BONE SIP రోజువారీ రిమైండర్లు ప్రారంభమయ్యాయి!",
        body: "మీకు ప్రతిరోజూ ఉదయం 7:00 (ఎండ & వ్యాయామం), 8:00 (అల్పాహారం), మధ్యాహ్నం 1:00 (భోజనం), సాయంత్రం 4:30 (స్నాక్స్), రాత్రి 7:30 (డిన్నర్) సమయాల్లో రిమైండర్లు వస్తాయి."
      },
      m_sun_exercise: {
        title: "☀️ ఉదయపు ఎండ మరియు వ్యాయామ సమయం!",
        body: "ఉదయం 7:00 · 15–20 నిమిషాలు విటమిన్ D3 ఎండను పొందండి, ఎముకలను దృఢపరిచే వ్యాయామాలు చేయండి."
      },
      m_breakfast: {
        title: "🥣 అల్పాహార సమయం (ఉదయం 8:00–9:30)",
        body: "390 mg కాల్షియం మరియు 22 g ప్రొటీన్లతో రోజు ప్రారంభించండి. నేటి అల్పాహారాన్ని తనిఖీ చేయండి!"
      },
      m_lunch: {
        title: "🍛 మధ్యాహ్న భోజన సమయం (1:00–2:30 PM)",
        body: "390 mg కాల్షియం మరియు 23 g ప్రొటీన్‌తో సమతుల్య భోజనాన్ని పూర్తి చేయండి!"
      },
      m_snack: {
        title: "🥜 సాయంత్రపు స్నాక్ సమయం (4:30–5:30 PM)",
        body: "260 mg కాల్షియం మరియు 14 g ప్రొటీన్ బూస్టర్: మఖానా, వేయించిన శనగలు లేదా గింజలు తీసుకోండి!"
      },
      m_dinner: {
        title: "🍲 రాత్రి భోజన సమయం (7:30–8:30 PM)",
        body: "మీ రోజువారీ ఎముక లక్ష్యాన్ని పూర్తి చేయడానికి 420 mg కాల్షియం మరియు 27 g ప్రొటీన్ తీసుకోండి!"
      },
      ui: {
        modalTitle: "రోజువారీ రిమైండర్లు",
        modalSub: "మీ ఎముకల ప్రణాళికను క్రమం తప్పకుండా పాటించండి. సమయానికి మొబైల్ నోటిఫికేషన్లు పొందండి.",
        masterToggle: "రోజువారీ రిమైండర్లను ఆన్ చేయండి",
        statusActive: "యాక్టివ్ · మొత్తం 5 రిమైండర్లు షెడ్యూల్ చేయబడ్డాయి",
        statusDisabled: "రిమైండర్లు ఆఫ్ చేయబడ్డాయి · ఆన్ చేయడానికి స్విచ్ నొక్కండి",
        statusBlocked: "బ్రౌజర్‌లో నోటిఫికేషన్‌లు నిలిపివేయబడ్డాయి. దయచేసి సైట్ సెట్టింగ్స్‌లో అనుమతించండి.",
        testBtn: "టెస్ట్ నోటిఫికేషన్ పంపండి",
        testSent: "టెస్ట్ నోటిఫికేషన్ పంపబడింది! మీ స్క్రీన్‌ను తనిఖీ చేయండి.",
        inAppAlert: "రిమైండర్ హెచ్చరిక"
      }
    },
    ta: {
      welcome: {
        title: "🔔 BONE SIP தினசரி நினைவூட்டல்கள் செயல்படுகின்றன!",
        body: "தினமும் காலை 7:00 (வெயில் & உடற்பயிற்சி), 8:00 (காலை உணவு), மதியம் 1:00 (மதிய உணவு), மாலை 4:30 (சிற்றுண்டி), இரவு 7:30 (இரவு உணவு) நேரங்களில் நினைவூட்டல்கள் வரும்."
      },
      m_sun_exercise: {
        title: "☀️ காலை வெயில் மற்றும் உடற்பயிற்சி நேரம்!",
        body: "காலை 7:00 · 15–20 நிமிடம் இயற்கை வைட்டமின் D3 பெற்று, எலும்புகளை வலுப்படுத்தும் உடற்பயிற்சிகளை செய்யுங்கள்."
      },
      m_breakfast: {
        title: "🥣 காலை உணவு நேரம் (காலை 8:00–9:30)",
        body: "390 மி.கி கால்சியம் மற்றும் 22 கிராம் புரதத்துடன் தொடங்குங்கள். இன்றைய உணவை பாருங்கள்!"
      },
      m_lunch: {
        title: "🍛 மதிய உணவு நேரம் (மதியம் 1:00–2:30)",
        body: "390 மி.கி கால்சியம் மற்றும் 23 கிராம் புரதத்துடன் கூடிய எலும்பு ஆரோக்கிய உணவை உட்கொள்ளுங்கள்!"
      },
      m_snack: {
        title: "🥜 மாலை சிற்றுண்டி நேரம் (மாலை 4:30–5:30)",
        body: "260 மி.கி கால்சியம் மற்றும் 14 கிராம் புரதம்: மக்கானா, பொட்டுக்கடலை அல்லது பருப்புகள் உட்கொள்ளுங்கள்!"
      },
      m_dinner: {
        title: "🍲 இரவு உணவு நேரம் (இரவு 7:30–8:30)",
        body: "420 மி.கி கால்சியம் மற்றும் 27 கிராம் புரதத்துடன் உங்கள் எலும்பு ஆரோக்கிய இலக்கை நிறைவு செய்யுங்கள்!"
      },
      ui: {
        modalTitle: "தினசரி நினைவூட்டல்கள்",
        modalSub: "உங்கள் எலும்பு ஆரோக்கிய திட்டத்தை தவறாமல் பின்பற்றுங்கள். சரியான நேரத்தில் மொபைல் அறிவிப்புகளைப் பெறுங்கள்.",
        masterToggle: "தினசரி நினைவூட்டல்களை இயக்கு",
        statusActive: "செயலில் உள்ளது · 5 நினைவூட்டல்களும் திட்டமிடப்பட்டுள்ளன",
        statusDisabled: "நினைவூட்டல்கள் முடக்கப்பட்டுள்ளன · இயக்க சுவிட்சை அழுத்தவும்",
        statusBlocked: "அறிவிப்புகள் உலாவி அமைப்புகளில் தடுக்கப்பட்டுள்ளன. தள அமைப்புகளில் அனுமதிக்கவும்.",
        testBtn: "சோதனை அறிவிப்பை அனுப்பு",
        testSent: "சோதனை அறிவிப்பு அனுப்பப்பட்டது! உங்கள் திரையை சரிபார்க்கவும்.",
        inAppAlert: "நினைவூட்டல் அறிவிப்பு"
      }
    },
    gu: {
      welcome: {
        title: "🔔 BONE SIP દૈનિક રિમાઇન્ડર સક્રિય થયા!",
        body: "તમને દરરોજ સવારે 7:00 (તડકો અને કસરત), 8:00 (નાસ્તો), બપોરે 1:00 (ભોજન), સાંજે 4:30 (નાસ્તો) અને રાત્રે 7:30 (રાત્રિ ભોજન) પર રિમાઇન્ડર મળશે."
      },
      m_sun_exercise: {
        title: "☀️ સવારનો તડકો અને કસરતનો સમય!",
        body: "સવારે 7:00 · 15–20 મિનિટ કુદરતી વિટામિન D3 લો અને હાડકાં મજબૂત કરતી કસરતો કરો."
      },
      m_breakfast: {
        title: "🥣 સવારના નાસ્તાનો સમય (8:00–9:30 AM)",
        body: "390 મિલિગ્રામ કેલ્શિયમ અને 22 ગ્રામ પ્રોટીન સાથે દિવસની શરૂઆત કરો. આજનો નાસ્તો જુઓ!"
      },
      m_lunch: {
        title: "🍛 બપોરના ભોજનનો સમય (1:00–2:30 PM)",
        body: "390 મિલિગ્રામ કેલ્શિયમ અને 23 ગ્રામ પ્રોટીન સાથે પૌષ્ટિક બપોરનું ભોજન લો!"
      },
      m_snack: {
        title: "🥜 સાંજના નાસ્તાનો સમય (4:30–5:30 PM)",
        body: "260 મિલિગ્રામ કેલ્શિયમ અને 14 ગ્રામ પ્રોટીન: મખાના, શેકેલા ચણા અથવા ડ્રાયફ્રૂટ્સ લો!"
      },
      m_dinner: {
        title: "🍲 રાત્રિ ભોજનનો સમય (7:30–8:30 PM)",
        body: "તમારા દૈનિક કેલ્શિયમ લક્ષ્યને પૂર્ણ કરવા 420 મિલિગ્રામ કેલ્શિયમ અને 27 ગ્રામ પ્રોટીન લો!"
      },
      ui: {
        modalTitle: "દૈનિક દિનચર્યા રિમાઇન્ડર",
        modalSub: "તમારા હાડકાંની યોજના ચૂકશો નહીં. નિયત સમયે મોબાઈલ નોટિફિકેશન મેળવો.",
        masterToggle: "દૈનિક રિમાઇન્ડર ચાલુ કરો",
        statusActive: "સક્રિય · તમામ 5 રિમાઇન્ડર શેડ્યૂલ કરેલા છે",
        statusDisabled: "રિમાઇન્ડર બંધ છે · ચાલુ કરવા સ્વિચ દબાવો",
        statusBlocked: "બ્રાઉઝર સેટિંગ્સમાં નોટિફિકેશન બ્લોક છે. સાઇટ સેટિંગ્સમાં પરવાનગી આપો.",
        testBtn: "ટેસ્ટ નોટિફિકેશન મોકલો",
        testSent: "ટેસ્ટ નોટિફિકેશન મોકલ્યું! સ્ક્રીન ચકાસો.",
        inAppAlert: "રિમાઇન્ડર ચેતવણી"
      }
    },
    kn: {
      welcome: {
        title: "🔔 BONE SIP ದೈನಂದಿನ ಜ್ಞಾಪನೆಗಳು ಸಕ್ರಿಯವಾಗಿವೆ!",
        body: "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 7:00 (ಬಿಸಿಲು & ವ್ಯಾಯಾಮ), 8:00 (ಉಪಾಹಾರ), ಮಧ್ಯಾಹ್ನ 1:00 (ಊಟ), ಸಂಜೆ 4:30 (ತಿಂಡಿ) ಮತ್ತು ರಾತ್ರಿ 7:30 (ರಾತ್ರಿಯ ಊಟ) ಸಮಯಕ್ಕೆ ನಿಮಗೆ ಜ್ಞಾಪನೆಗಳು ಬರುತ್ತವೆ."
      },
      m_sun_exercise: {
        title: "☀️ ಬೆಳಗಿನ ಬಿಸಿಲು ಮತ್ತು ವ್ಯಾಯಾಮದ ಸಮಯ!",
        body: "ಬೆಳಿಗ್ಗೆ 7:00 · 15–20 ನಿಮಿಷಗಳ ನೈಸರ್ಗಿಕ ವಿಟಮಿನ್ D3 ಪಡೆಯಿರಿ ಮತ್ತು ಮೂಳೆ ಬಲಪಡಿಸುವ ವ್ಯಾಯಾಮಗಳನ್ನು ಮಾಡಿ."
      },
      m_breakfast: {
        title: "🥣 ಉಪಾಹಾರದ ಸಮಯ (ಬೆಳಿಗ್ಗೆ 8:00–9:30)",
        body: "390 mg ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು 22 g ಪ್ರೋಟೀನ್‌ನೊಂದಿಗೆ ದಿನವನ್ನು ಪ್ರಾರಂಭಿಸಿ. ಇಂದಿನ ಉಪಾಹಾರ ನೋಡಿ!"
      },
      m_lunch: {
        title: "🍛 ಮಧ್ಯಾಹ್ನದ ಊಟದ ಸಮಯ (1:00–2:30 PM)",
        body: "390 mg ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು 23 g ಪ್ರೋಟೀನ್‌ನೊಂದಿಗೆ ಪೌಷ್ಟಿಕ ಮಧ್ಯಾಹ್ನದ ಊಟ ಪೂರ್ಣಗೊಳಿಸಿ!"
      },
      m_snack: {
        title: "🥜 ಸಂಜೆಯ ತಿಂಡಿಯ ಸಮಯ (4:30–5:30 PM)",
        body: "260 mg ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು 14 g ಪ್ರೋಟೀನ್: ಮಖಾನಾ, ಹುರಿದ ಕಡಲೆ ಅಥವಾ ಬೀಜಗಳನ್ನು ಸೇವಿಸಿ!"
      },
      m_dinner: {
        title: "🍲 ರಾತ್ರಿಯ ಊಟದ ಸಮಯ (7:30–8:30 PM)",
        body: "420 mg ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು 27 g ಪ್ರೋಟೀನ್‌ನೊಂದಿಗೆ ಇಂದಿನ ಗುರಿ ಪೂರ್ಣಗೊಳಿಸಿ. ರಾತ್ರಿಯ ಊಟ ದಾಖಲಿಸಿ!"
      },
      ui: {
        modalTitle: "ದೈನಂದಿನ ಜ್ಞಾಪನೆಗಳು",
        modalSub: "ನಿಮ್ಮ ಮೂಳೆಯ ಆರೋಗ್ಯದ ಯೋಜನೆಯನ್ನು ತಪ್ಪದೇ ಪಾಲಿಸಿ. ನಿಗದಿತ ಸಮಯಕ್ಕೆ ಮೊಬೈಲ್ ಸೂಚನೆಗಳನ್ನು ಪಡೆಯಿರಿ.",
        masterToggle: "ದೈನಂದಿನ ಜ್ಞಾಪನೆಗಳನ್ನು ಆನ್ ಮಾಡಿ",
        statusActive: "ಸಕ್ರಿಯವಾಗಿದೆ · ಎಲ್ಲಾ 5 ಜ್ಞಾಪನೆಗಳು ನಿಗದಿಯಾಗಿವೆ",
        statusDisabled: "ಜ್ಞಾಪನೆಗಳನ್ನು ಆಫ್ ಮಾಡಲಾಗಿದೆ · ಆನ್ ಮಾಡಲು ಸ್ವಿಚ್ ಒತ್ತಿ",
        statusBlocked: "ಬ್ರೌಸರ್‌ನಲ್ಲಿ ನೋಟಿಫಿಕೇಶನ್‌ಗಳನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಅನುಮತಿ ನೀಡಿ.",
        testBtn: "ಪರೀಕ್ಷಾ ನೋಟಿಫಿಕೇಶನ್ ಕಳುಹಿಸಿ",
        testSent: "ಪರೀಕ್ಷಾ ನೋಟಿಫಿಕೇಶನ್ ಕಳುಹಿಸಲಾಗಿದೆ! ಪರದೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
        inAppAlert: "ಜ್ಞಾಪನೆ ಎಚ್ಚರಿಕೆ"
      }
    },
    ml: {
      welcome: {
        title: "🔔 BONE SIP ദൈനംദിന ഓർമ്മപ്പെടുത്തലുകൾ സജീവമായി!",
        body: "എല്ലാ ദിവസവും രാവിലെ 7:00 (വെയിലും വ്യായാമവും), 8:00 (പ്രഭാതഭക്ഷണം), ഉച്ചയ്ക്ക് 1:00 (ഉച്ചഭക്ഷണം), വൈകുന്നേരം 4:30 (ലഘുഭക്ഷണം), രാത്രി 7:30 (അത്താഴം) എന്നീ സമയങ്ങളിൽ നിങ്ങൾക്ക് സന്ദേശങ്ങൾ ലഭിക്കും."
      },
      m_sun_exercise: {
        title: "☀️ രാവിലത്തെ വെയിലും വ്യായാമവും ചെയ്യാനുള്ള സമയം!",
        body: "രാവിലെ 7:00 · 15–20 മിനിറ്റ് പ്രകൃതിദത്ത വിറ്റാമിൻ D3 നേടൂ, അസ്ഥി ബലപ്പെടുത്തുന്ന വ്യായാമങ്ങൾ ചെയ്യൂ."
      },
      m_breakfast: {
        title: "🥣 പ്രാതൽ സമയം (രാവിലെ 8:00–9:30)",
        body: "390 മില്ലിഗ്രാം കാൽസ്യവും 22 ഗ്രാം പ്രോട്ടീനും നൽകുന്ന പ്രഭാതഭക്ഷണം കഴിക്കൂ. ഇന്നത്തെ മെനു കാണൂ!"
      },
      m_lunch: {
        title: "🍛 ഉച്ചഭക്ഷണ സമയം (ഉച്ചയ്ക്ക് 1:00–2:30)",
        body: "390 മില്ലിഗ്രാം കാൽസ്യവും 23 ഗ്രാം പ്രോട്ടീനും അടങ്ങിയ ആരോഗ്യകരമായ ഉച്ചഭക്ഷണം കഴിക്കൂ!"
      },
      m_snack: {
        title: "🥜 വൈകുന്നേരത്തെ ലഘുഭക്ഷണ സമയം (4:30–5:30 PM)",
        body: "260 മില്ലിഗ്രാം കാൽസ്യവും 14 ഗ്രാം പ്രോട്ടീനും: മഖാനയോ പരിപ്പുകളോ ആരോഗ്യകരമായ ലഘുഭക്ഷണമോ കഴിക്കൂ!"
      },
      m_dinner: {
        title: "🍲 അത്താഴ സമയം (രാത്രി 7:30–8:30)",
        body: "420 മില്ലിഗ്രാം കാൽസ്യവും 27 ഗ്രാം പ്രോട്ടീനും കഴിച്ച് ഇന്നത്തെ അസ്ഥി ആരോഗ്യ ലക്ഷ്യം പൂർത്തിയാക്കൂ!"
      },
      ui: {
        modalTitle: "ദൈനംദിന ഓർമ്മപ്പെടുത്തലുകൾ",
        modalSub: "നിങ്ങളുടെ അസ്ഥി സംരക്ഷണ പദ്ധതി മുടക്കമില്ലാതെ തുടരൂ. കൃത്യസമയത്ത് അറിയിപ്പുകൾ നേടൂ.",
        masterToggle: "ദൈനംദിന ഓർമ്മപ്പെടുത്തലുകൾ ഓണാക്കുക",
        statusActive: "സജീവമാണ് · 5 ഓർമ്മപ്പെടുത്തലുകളും ക്രമീകരിച്ചിരിക്കുന്നു",
        statusDisabled: "ഓർമ്മപ്പെടുത്തലുകൾ ഓഫാക്കിയിരിക്കുന്നു · ഓണാക്കാൻ സ്വിച്ച് അമർത്തുക",
        statusBlocked: "ബ്രൗസറിൽ അറിയിപ്പുകൾ തടഞ്ഞിരിക്കുന്നു. സൈറ്റ് സെറ്റിംഗ്സിൽ അനുവദിക്കുക.",
        testBtn: "ടെസ്റ്റ് അറിയിപ്പ് അയക്കുക",
        testSent: "ടെസ്റ്റ് അറിയിപ്പ് അയച്ചു! സ്‌ക്രീൻ പരിശോധിക്കുക.",
        inAppAlert: "ഓർമ്മപ്പെടുത്തൽ അറിയിപ്പ്"
      }
    },
    pa: {
      welcome: {
        title: "🔔 BONE SIP ਰੋਜ਼ਾਨਾ ਰਿਮਾਈਂਡਰ ਚਾਲੂ ਹੋ ਗਏ!",
        body: "ਤੁਹਾਨੂੰ ਰੋਜ਼ਾਨਾ ਸਵੇਰੇ 7:00 (ਧੁੱਪ ਅਤੇ ਕਸਰਤ), 8:00 (ਨਾਸ਼ਤਾ), ਦੁਪਹਿਰ 1:00 (ਖਾਣਾ), ਸ਼ਾਮ 4:30 (ਸਨੈਕਸ) ਅਤੇ ਰਾਤ 7:30 (ਰਾਤ ਦਾ ਖਾਣਾ) 'ਤੇ ਰਿਮਾਈਂਡਰ ਮਿਲਣਗੇ।"
      },
      m_sun_exercise: {
        title: "☀️ ਸਵੇਰ ਦੀ ਧੁੱਪ ਅਤੇ ਕਸਰਤ ਦਾ ਸਮਾਂ!",
        body: "ਸਵੇਰੇ 7:00 · 15–20 ਮਿੰਟ ਕੁਦਰਤੀ ਵਿਟਾਮਿਨ D3 ਲਓ ਅਤੇ ਹੱਡੀਆਂ ਮਜ਼ਬੂਤ ਕਰਨ ਵਾਲੀਆਂ ਕਸਰਤਾਂ ਕਰੋ।"
      },
      m_breakfast: {
        title: "🥣 ਨਾਸ਼ਤੇ ਦਾ ਸਮਾਂ (ਸਵੇਰੇ 8:00–9:30)",
        body: "390 ਮਿਲੀਗ੍ਰਾਮ ਕੈਲਸ਼ੀਅਮ ਅਤੇ 22 ਗ੍ਰਾਮ ਪ੍ਰੋਟੀਨ ਨਾਲ ਸ਼ੁਰੂਆਤ ਕਰੋ। ਅੱਜ ਦਾ ਨਾਸ਼ਤਾ ਦੇਖੋ!"
      },
      m_lunch: {
        title: "🍛 ਦੁਪਹਿਰ ਦੇ ਖਾਣੇ ਦਾ ਸਮਾਂ (1:00–2:30 PM)",
        body: "390 ਮਿਲੀਗ੍ਰਾਮ ਕੈਲਸ਼ੀਅਮ ਅਤੇ 23 ਗ੍ਰਾਮ ਪ੍ਰੋਟੀਨ ਨਾਲ ਆਪਣੀ ਬੋਨ ਪਲੇਟ ਪੂਰੀ ਕਰੋ!"
      },
      m_snack: {
        title: "🥜 ਸ਼ਾਮ ਦੇ ਸਨੈਕਸ ਦਾ ਸਮਾਂ (4:30–5:30 PM)",
        body: "260 ਮਿਲੀਗ੍ਰਾਮ ਕੈਲਸ਼ੀਅਮ ਅਤੇ 14 ਗ੍ਰਾਮ ਪ੍ਰੋਟੀਨ: ਮਖਾਣੇ, ਭੁੰਨੇ ਛੋਲੇ ਜਾਂ ਬਦਾਮ-ਅਖਰੋਟ ਲਓ!"
      },
      m_dinner: {
        title: "🍲 ਰਾਤ ਦੇ ਖਾਣੇ ਦਾ ਸਮਾਂ (7:30–8:30 PM)",
        body: "ਰੋਜ਼ਾਨਾ ਹੱਡੀਆਂ ਦਾ ਟੀਚਾ ਪੂਰਾ ਕਰਨ ਲਈ 420 ਮਿਲੀਗ੍ਰਾਮ ਕੈਲਸ਼ੀਅਮ ਅਤੇ 27 ਗ੍ਰਾਮ ਪ੍ਰੋਟੀਨ ਲਓ!"
      },
      ui: {
        modalTitle: "ਰੋਜ਼ਾਨਾ ਰੁਟੀਨ ਰਿਮਾਈਂਡਰ",
        modalSub: "ਆਪਣੀ ਹੱਡੀਆਂ ਦੀ ਯੋਜਨਾ ਨੂੰ ਨਿਯਮਿਤ ਰੱਖੋ। ਸਮੇਂ ਸਿਰ ਮੋਬਾਈਲ ਸੂਚਨਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।",
        masterToggle: "ਰੋਜ਼ਾਨਾ ਰਿਮਾਈਂਡਰ ਚਾਲੂ ਕਰੋ",
        statusActive: "ਸਰਗਰਮ · ਸਾਰੇ 5 ਰਿਮਾਈਂਡਰ ਨਿਰਧਾਰਤ ਹਨ",
        statusDisabled: "ਰਿਮਾਈਂਡਰ ਬੰਦ ਹਨ · ਚਾਲੂ ਕਰਨ ਲਈ ਸਵਿੱਚ ਦਬਾਓ",
        statusBlocked: "ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸੂਚਨਾਵਾਂ ਬੰਦ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਸਾਈਟ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਆਗਿਆ ਦਿਓ।",
        testBtn: "ਟੈਸਟ ਨੋਟੀਫਿਕੇਸ਼ਨ ਭੇਜੋ",
        testSent: "ਟੈਸਟ ਨੋਟੀਫਿਕੇਸ਼ਨ ਭੇਜੀ ਗਈ! ਸਕ੍ਰੀਨ ਦੇਖੋ।",
        inAppAlert: "ਰਿਮਾਈਂਡਰ ਅਲਰਟ"
      }
    },
    or: {
      welcome: {
        title: "🔔 BONE SIP ଦୈନିକ ରିମାଇଣ୍ଡର ସକ୍ରିୟ ହେଲା!",
        body: "ଆପଣଙ୍କୁ ପ୍ରତିଦିନ ସକାଳ ୭:୦୦ (ଖରା ଓ ବ୍ୟାୟାମ), ୮:୦୦ (ଜଳଖିଆ), ଦ୍ୱିପ୍ରହର ୧:୦୦ (ମଧ୍ୟାହ୍ନ ଭୋଜନ), ସନ୍ଧ୍ୟା ୪:୩୦ (ଜଳଖିଆ) ଓ ରାତି ୭:୩୦ (ରାତ୍ରି ଭୋଜନ)ରେ ଆଲର୍ଟ ମିଳିବ।"
      },
      m_sun_exercise: {
        title: "☀️ ସକାଳ ଖରା ଓ ବ୍ୟାୟାମ କରିବାର ସମୟ!",
        body: "ସକାଳ ୭:୦୦ · ୧୫–୨୦ ମିନିଟ ପ୍ରାକୃତିକ ଭିଟାମିନ D3 ନିଅନ୍ତୁ ଏବଂ ହାଡ଼ ମଜବୁତ କରୁଥିବା ବ୍ୟାୟାମ କରନ୍ତୁ।"
      },
      m_breakfast: {
        title: "🥣 ଜଳଖିଆ ସମୟ (ସକାଳ ୮:୦୦–୯:୩୦)",
        body: "୩୯୦ ମିଗ୍ରା କ୍ୟାଲସିୟମ୍ ଓ ୨୨ ଗ୍ରାମ ପ୍ରୋଟିନ୍ ସହ ଦିନ ଆରମ୍ଭ କରନ୍ତୁ। ଆଜିର ଜଳଖିଆ ଦେଖନ୍ତୁ!"
      },
      m_lunch: {
        title: "🍛 ମଧ୍ୟାହ୍ନ ଭୋଜନ ସମୟ (୧:୦୦–୨:୩୦ PM)",
        body: "୩୯୦ ମିଗ୍ରା କ୍ୟାଲସିୟମ୍ ଓ ୨୩ ଗ୍ରାମ ପ୍ରୋଟିନ୍ ସହ ପୁଷ୍ଟିକର ମଧ୍ୟାହ୍ନ ଭୋଜନ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ!"
      },
      m_snack: {
        title: "🥜 ସନ୍ଧ୍ୟା ଜଳଖିଆ ସମୟ (୪:୩୦–୫:୩୦ PM)",
        body: "୨୬୦ ମିଗ୍ରା କ୍ୟାଲସିୟମ୍ ଓ ୧୪ ଗ୍ରାମ ପ୍ରୋଟିନ୍: ମଖାନା, ଭଜା ବୁଟ କିମ୍ବା ବାଦାମ ଖାଆନ୍ତୁ!"
      },
      m_dinner: {
        title: "🍲 ରାତ୍ରି ଭୋଜନ ସମୟ (୭:୩୦–୮:୩୦ PM)",
        body: "ଆଜିର ଲକ୍ଷ୍ୟ ପୂରଣ କରିବାକୁ ୪୨୦ ମିଗ୍ରା କ୍ୟାଲସିୟମ୍ ଓ ୨୭ ଗ୍ରାମ ପ୍ରୋଟିନ୍ ଯୁକ୍ତ ରାତ୍ରି ଭୋଜନ କରନ୍ତୁ!"
      },
      ui: {
        modalTitle: "ଦୈନିକ କାର୍ଯ୍ୟକ୍ରମ ରିମାଇଣ୍ଡର",
        modalSub: "ଆପଣଙ୍କ ହାଡ଼ ସ୍ୱାସ୍ଥ୍ୟ ଯୋଜନା ନିୟମିତ ପାଳନ କରନ୍ତୁ। ନିର୍ଦ୍ଧାରିତ ସମୟରେ ମୋବାଇଲ ଆଲର୍ଟ ପାଆନ୍ତୁ।",
        masterToggle: "ଦୈନିକ ରିମାଇଣ୍ଡର ଚାଲୁ କରନ୍ତୁ",
        statusActive: "ସକ୍ରିୟ · ସମସ୍ତ ୫ଟି ରିମାଇଣ୍ଡର ସମୟ ଅନୁଯାୟୀ ସେଟ୍ ହୋଇଛି",
        statusDisabled: "ରିମାଇଣ୍ଡର ବନ୍ଦ ଅଛି · ଚାଲୁ କରିବାକୁ ସ୍ୱିଚ୍ ଦବାନ୍ତୁ",
        statusBlocked: "ବ୍ରାଉଜରରେ ନୋଟିଫିକେସନ୍ ବ୍ଲକ୍ ହୋଇଛି। ଦୟାକରି ସାଇଟ୍ ସେଟିଂସରେ ଅନୁମତି ଦିଅନ୍ତୁ।",
        testBtn: "ଟେଷ୍ଟ ନୋଟିଫିକେସନ୍ ପଠାନ୍ତୁ",
        testSent: "ଟେଷ୍ଟ ନୋଟିଫିକେସନ୍ ପଠାଗଲା! ସ୍କ୍ରିନ୍ ଯାଞ୍ଚ କରନ୍ତୁ।",
        inAppAlert: "ରିମାଇଣ୍ଡର ଆଲର୍ଟ"
      }
    },
    as: {
      welcome: {
        title: "🔔 BONE SIP দৈনিক ৰিমাইণ্ডাৰ সক্ৰিয় হ’ল!",
        body: "আপুনি প্ৰতিদিনে পুৱা ৭:০০ (ৰ’দ আৰু ব্যায়াম), ৮:০০ (পুৱাৰ আহাৰ), দুপৰীয়া ১:০০ (দুপৰীয়াৰ আহাৰ), গধূলি ৪:৩০ (জলপান) আৰু ৰাতি ৭:৩০ (ৰাতিৰ আহাৰ)ত এলাৰ্ট পাব।"
      },
      m_sun_exercise: {
        title: "☀️ পুৱাৰ ৰ’দ আৰু ব্যায়ামৰ সময়!",
        body: "পুৱা ৭:০০ · ১৫–২০ মিনিট প্ৰাকৃতিক ভিটামিন D3 লওক আৰু হাড় শক্তিশালী কৰা ব্যায়াম কৰক।"
      },
      m_breakfast: {
        title: "🥣 পুৱাৰ আহাৰৰ সময় (পুৱা ৮:০০–৯:৩০)",
        body: "৩৯০ মি.গ্ৰা. কেলচিয়াম আৰু ২২ গ্ৰাম প্ৰ’টিনেৰে দিনটো আৰম্ভ কৰক। আজিৰ আহাৰ চাওক!"
      },
      m_lunch: {
        title: "🍛 দুপৰীয়াৰ আহাৰৰ সময় (১:০০–২:৩০ PM)",
        body: "৩৯০ মি.গ্ৰা. কেলচিয়াম আৰু ২৩ গ্ৰাম প্ৰ’টিনযুক্ত পুষ্টিকৰ দুপৰীয়াৰ আহাৰ গ্ৰহণ কৰক!"
      },
      m_snack: {
        title: "🥜 গধূলিৰ জলপানৰ সময় (৪:৩০–৫:৩০ PM)",
        body: "২৬০ মি.গ্ৰা. কেলচিয়াম আৰু ১৪ গ্ৰাম প্ৰ’টিন: মাখানা, ভজা বুট বা বাদাম গ্ৰহণ কৰক!"
      },
      m_dinner: {
        title: "🍲 ৰাতিৰ আহাৰৰ সময় (৭:৩০–৮:৩০ PM)",
        body: "দৈনিক লক্ষ্য পূৰণ কৰিবলৈ ৪২০ মি.গ্ৰা. কেলচিয়াম আৰু ২৭ গ্ৰাম প্ৰ’টিনযুক্ত ৰাতিৰ আহাৰ লওক!"
      },
      ui: {
        modalTitle: "দৈনিক ৰুটিন ৰিমাইণ্ডাৰ",
        modalSub: "হাড়ৰ সুস্থতা বজাই ৰাখক। নিৰ্ধাৰিত সময়ত মোবাইল সতৰ্কবাৰ্তা লাভ কৰক।",
        masterToggle: "দৈনিক ৰিমਾਈণ্ডাৰ সক্ৰিয় কৰক",
        statusActive: "সক্ৰিয় · আটাইকেইটা ৫ টা ৰিমাইণ্ডাৰ নিৰ্ধাৰিত",
        statusDisabled: "ৰিমাইণ্ডাৰ বন্ধ আছে · আৰম্ভ কৰিবলৈ ছুইচ টিপক",
        statusBlocked: "ব্ৰাউজাৰত সতৰ্কবাৰ্তা বন্ধ আছে। অনুগ্ৰহ কৰি অনুমতি দিয়ক।",
        testBtn: "পৰীক্ষামূলক সতৰ্কবাৰ্তা পঠিয়াওক",
        testSent: "পৰীক্ষামূলক সতৰ্কবাৰ্তা পঠিওৱা হ’ল! স্ক্ৰীণ পৰীক্ষা কৰক।",
        inAppAlert: "ৰিমাইণ্ডাৰ সতৰ্কবাৰ্তা"
      }
    }
  };

  function getCurrentLang() {
    if (global.BoneI18n && typeof global.BoneI18n.current === 'function') {
      const code = global.BoneI18n.current();
      if (code && I18N_NOTIFS[code]) return code;
    }
    try {
      const saved = localStorage.getItem('bonesip_lang');
      if (saved && I18N_NOTIFS[saved]) return saved;
    } catch (e) {}
    return 'en';
  }

  function getCopy(slotKey, lang) {
    const langKey = lang || getCurrentLang();
    const bundle = I18N_NOTIFS[langKey] || I18N_NOTIFS.en;
    return bundle[slotKey] || I18N_NOTIFS.en[slotKey] || { title: 'BONE SIP', body: '' };
  }

  function getUiString(key, lang) {
    const langKey = lang || getCurrentLang();
    const bundle = I18N_NOTIFS[langKey] || I18N_NOTIFS.en;
    const ui = bundle.ui || I18N_NOTIFS.en.ui;
    return ui[key] || I18N_NOTIFS.en.ui[key] || '';
  }

  function isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  function getPermission() {
    if (!isSupported()) return 'unsupported';
    return Notification.permission; // 'default', 'granted', 'denied'
  }

  function isEnabled() {
    if (getPermission() !== 'granted') return false;
    try {
      const pref = localStorage.getItem(STORAGE_KEY_ENABLED);
      return pref !== 'false'; // default to true once permission granted
    } catch (e) {
      return true;
    }
  }

  function setEnabled(flag) {
    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, flag ? 'true' : 'false');
    } catch (e) {}
  }

  async function requestPermission() {
    if (!isSupported()) return false;
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        setEnabled(true);
        // Send welcoming notification immediately so the user sees the mobile app logo!
        sendTestNotification({ welcome: true });
        return true;
      }
    } catch (e) {
      console.warn('[BoneNotifications] Permission error:', e);
    }
    return false;
  }

  async function showNotificationPayload(title, options) {
    const defaultOptions = {
      icon: ICON_PATH,
      badge: BADGE_PATH,
      vibrate: [200, 100, 200],
      tag: 'bonesip-reminder',
      renotify: true,
      requireInteraction: false,
      silent: false,
      data: {
        url: './',
        timestamp: Date.now()
      }
    };
    const finalOptions = Object.assign({}, defaultOptions, options);

    // Try service worker first for mobile PWA standalone notification
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && typeof reg.showNotification === 'function') {
          await reg.showNotification(title, finalOptions);
          return true;
        }
      } catch (e) {
        // Fall back to standard Notification constructor
      }
    }

    if (typeof Notification === 'function' && Notification.permission === 'granted') {
      try {
        const n = new Notification(title, finalOptions);
        n.onclick = function (event) {
          event.preventDefault();
          window.focus();
          if (finalOptions.data && finalOptions.data.slot) {
            handleNotificationClick(finalOptions.data);
          }
          n.close();
        };
        return true;
      } catch (err) {
        console.warn('[BoneNotifications] Standard Notification constructor failed:', err);
      }
    }
    return false;
  }

  function handleNotificationClick(data) {
    if (!data) return;
    if (global.BoneApp) {
      if (data.pillar && typeof global.BoneApp.navigatePillar === 'function') {
        global.BoneApp.navigatePillar(data.pillar);
      }
      if (data.slot && typeof global.BoneApp.filterMealSlotView === 'function') {
        global.BoneApp.filterMealSlotView(data.slot);
      }
    }
  }

  async function sendTestNotification(opts = {}) {
    if (!isSupported()) return false;
    const perm = getPermission();
    if (perm !== 'granted') {
      const ok = await requestPermission();
      if (!ok) return false;
    }

    const lang = getCurrentLang();
    const copy = opts.welcome ? getCopy('welcome', lang) : getCopy('welcome', lang);
    const sent = await showNotificationPayload(copy.title, {
      body: copy.body,
      tag: 'bonesip-welcome-' + Date.now(),
      data: {
        url: './',
        slot: 'all',
        pillar: 'build'
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY_LAST_TEST, String(Date.now()));
    } catch (e) {}

    return sent;
  }

  async function triggerSlot(slotId) {
    const slotDef = SCHEDULE.find(s => s.id === slotId || s.slot === slotId);
    if (!slotDef) return false;
    const lang = getCurrentLang();
    const copy = getCopy(slotDef.id, lang);
    return showNotificationPayload(copy.title, {
      body: copy.body,
      tag: 'bonesip-' + slotDef.id,
      data: {
        url: './?slot=' + encodeURIComponent(slotDef.slot),
        slot: slotDef.slot,
        pillar: slotDef.pillar
      }
    });
  }

  function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function checkScheduleAndNotify() {
    if (!isEnabled()) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayStr = getTodayString();

    SCHEDULE.forEach(item => {
      // Slot window: within 45 minutes of scheduled time
      const targetTimeMinutes = item.targetHour * 60 + item.targetMinute;
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      const diff = currentTimeMinutes - targetTimeMinutes;

      // Fires if between 0 and 40 minutes after target time
      if (diff >= 0 && diff <= 40) {
        const key = `bonesip_fired_${todayStr}_${item.id}`;
        try {
          if (!localStorage.getItem(key)) {
            triggerSlot(item.id);
            localStorage.setItem(key, String(Date.now()));
          }
        } catch (e) {
          triggerSlot(item.id);
        }
      }
    });
  }

  let schedulerTimer = null;
  function startScheduler() {
    if (schedulerTimer) clearInterval(schedulerTimer);
    // Check every 30 seconds
    schedulerTimer = setInterval(checkScheduleAndNotify, 30000);
    // Run an immediate check
    checkScheduleAndNotify();

    // Also check whenever user switches back to this tab/window
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) checkScheduleAndNotify();
      });
      window.addEventListener('focus', checkScheduleAndNotify);
    }
  }

  // Listen for messages from Service Worker when a user taps a mobile notification
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'BONESIP_NOTIFICATION_CLICK') {
        handleNotificationClick(event.data.data);
      }
    });
  }

  const BoneNotifications = {
    SCHEDULE,
    I18N_NOTIFS,
    getCurrentLang,
    getCopy,
    getUiString,
    isSupported,
    getPermission,
    isEnabled,
    setEnabled,
    requestPermission,
    sendTestNotification,
    triggerSlot,
    checkScheduleAndNotify,
    startScheduler,
    handleNotificationClick
  };

  global.BoneNotifications = BoneNotifications;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BoneNotifications;
  }
})(typeof window !== 'undefined' ? window : globalThis);
