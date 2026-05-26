'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { 
  QrCode, Globe, Sparkles, TrendingUp, ArrowUpRight, 
  CheckCircle2, ChevronRight, Star, Menu, X, 
  Compass, Upload, Smartphone, HelpCircle, 
  Mail, MessageSquare, Shield, Check, Heart, ChevronDown 
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type TranslationKeys = 'heroTop' | 'heroBottom' | 'heroDesc' | 'selectLang' | 'supportText' | 'cta' | 'liveDemo';
const translations: Record<string, Record<TranslationKeys, string>> = {
  English: {
    heroTop: "One Platform to Run",
    heroBottom: "Your Entire Restaurant.",
    heroDesc: "Manage menus, orders, staff, analytics, and guest experience — all from one smart dashboard. Built for modern restaurants that want to grow faster and operate smarter.",
    selectLang: "Select your Language",
    supportText: "Support all major Desi regional dialects and global international languages natively.",
    cta: "Get started now",
    liveDemo: "Live Interactive Demo"
  },
  Hindi: {
    heroTop: "सबसे स्मार्ट मेनू",
    heroBottom: "अब आपके हाथ में।",
    heroDesc: "अपने रेस्तरां मेनू का सभी प्रमुख स्थानीय और अंतर्राष्ट्रीय भाषाओं में स्वतः अनुवाद करें। इंटरएक्टिव 3D कार्ड और स्मार्ट अपसेलिंग से ऑर्डर वैल्यू बढ़ाएं।",
    selectLang: "अपनी भाषा चुनें",
    supportText: "सभी प्रमुख देसी क्षेत्रीय बोलियों और वैश्विक अंतरराष्ट्रीय भाषाओं का मूल रूप से समर्थन करें।",
    cta: "अभी शुरू करें",
    liveDemo: "लाइव डेमो"
  },
  Nepali: {
    heroTop: "सबैभन्दा स्मार्ट मेनु",
    heroBottom: "अब तपाईको हातमा।",
    heroDesc: "तपाईको रेस्टुरेन्ट मेनुलाई सबै प्रमुख स्थानीय र अन्तर्राष्ट्रिय भाषाहरूमा स्वत: अनुवाद गर्नुहोस्। 3D कार्ड र अपसेलिंग मार्फत अर्डर मूल्य बढाउनुहोस्।",
    selectLang: "आफ्नो भाषा छान्नुहोस्",
    supportText: "सबै प्रमुख क्षेत्रीय र अन्तर्राष्ट्रिय भाषाहरूको समर्थन गर्दछ।",
    cta: "अहिले सुरु गर्नुहोस्",
    liveDemo: "प्रत्यक्ष डेमो"
  },
  Urdu: {
    heroTop: "سب سے سمارٹ مینو",
    heroBottom: "اب آپ کے ہاتھ میں۔",
    heroDesc: "اپنے ریستوراں کے مینو کا تمام بڑی زبانوں میں خودکار ترجمہ کریں۔ انٹرایکٹو 3D کارڈز اور سمارٹ اپ سیلنگ کی سفارشات کے ساتھ آرڈر کی قدریں بڑھائیں۔",
    selectLang: "اپنی زبان منتخب کریں",
    supportText: "تمام بڑی مقامی اور بین الاقوامی زبانوں کی حمایت کریں۔",
    cta: "ابھی شروع کریں",
    liveDemo: "لائیو ڈیمو"
  },
  Tamil: {
    heroTop: "சிறந்த மெனு",
    heroBottom: "இப்போது உங்கள் கைகளில்.",
    heroDesc: "உங்கள் உணவக மெனுக்களை அனைத்து முக்கிய உள்ளூர் மற்றும் சர்வதேச மொழிகளில் தானாக மொழிபெயர்க்கவும். ஊடாடும் 3D கார்டுகள் மற்றும் ஸ்மார்ட் அப்செல்லிங் பரிந்துரைகள் மூலம் ஆர்டர் மதிப்புகளை அதிகரிக்கவும்.",
    selectLang: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    supportText: "அனைத்து முக்கிய உள்ளூர் மற்றும் சர்வதேச மொழிகளை ஆதரிக்கவும்.",
    cta: "தொடங்குங்கள்",
    liveDemo: "நேரடி டெமோ"
  },
  Malayalam: {
    heroTop: "ഏറ്റവും മികച്ച മെനു",
    heroBottom: "ഇപ്പോൾ നിങ്ങളുടെ പക്കൽ.",
    heroDesc: "നിങ്ങളുടെ റെസ്റ്റോറൻ്റ് മെനുകൾ എല്ലാ പ്രധാന ഭാഷകളിലേക്കും സ്വയമേവ വിവർത്തനം ചെയ്യുക. ഇൻ്ററാക്ടീവ് 3D കാർഡുകളും മികച്ച അപ്‌സെല്ലിംഗ് ശുപാർശകളും ഉപയോഗിച്ച് ഓർഡർ മൂല്യങ്ങൾ വർദ്ധിപ്പിക്കുക.",
    selectLang: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    supportText: "എല്ലാ പ്രധാന ഭാഷകളെയും പിന്തുണയ്ക്കുന്നു.",
    cta: "ആരംഭിക്കുക",
    liveDemo: "ലൈവ് ഡെമോ"
  },
  Gujarati: {
    heroTop: "સૌથી સ્માર્ટ મેનૂ",
    heroBottom: "હવે તમારા હાથમાં.",
    heroDesc: "તમારા રેસ્ટોરન્ટ મેનૂઝનું તમામ મુખ્ય ભાષાઓમાં સ્વતઃ ભાષાંતર કરો. ઇન્ટરેક્ટિવ 3D કાર્ડ્સ અને સ્માર્ટ અપસેલિંગ ભલામણો સાથે ઓર્ડર મૂલ્યો વધારો.",
    selectLang: "તમારી ભાષા પસંદ કરો",
    supportText: "તમામ પ્રાદેશિક અને આંતરરાષ્ટ્રીય ભાષાઓને સપોર્ટ કરે છે.",
    cta: "હવે શરૂ કરો",
    liveDemo: "લાઇવ ડેમો"
  },
  Bengali: {
    heroTop: "সবচেয়ে স্মার্ট মেনু",
    heroBottom: "এখন আপনার হাতে।",
    heroDesc: "আপনার রেস্তোরাঁর মেনুগুলি সমস্ত প্রধান স্থানীয় এবং আন্তর্জাতিক ভাষায় স্বয়ংক্রিয়ভাবে অনুবাদ করুন। ইন্টারেক্টিভ 3D কার্ড এবং স্মার্ট আপসেলিং সুপারিশগুলির মাধ্যমে অর্ডারের মান বৃদ্ধি করুন।",
    selectLang: "আপনার ভাষা নির্বাচন করুন",
    supportText: "সমস্ত প্রধান আঞ্চলিক এবং আন্তর্জাতিক ভাষা সমর্থন করে।",
    cta: "এখন শুরু করুন",
    liveDemo: "লাইভ ডেমো"
  },
  Punjabi: {
    heroTop: "ਸਭ ਤੋਂ ਸਮਾਰਟ ਮੀਨੂ",
    heroBottom: "ਹੁਣ ਤੁਹਾਡੇ ਕੋਲ ਹੈ।",
    heroDesc: "ਆਪਣੇ ਰੈਸਟੋਰੈਂਟ ਮੀਨੂ ਦਾ ਸਾਰੀਆਂ ਪ੍ਰਮੁੱਖ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਸਵੈਚਲਿਤ ਅਨੁਵਾਦ ਕਰੋ। ਇੰਟਰਐਕਟਿਵ 3D ਕਾਰਡਾਂ ਅਤੇ ਸਮਾਰਟ ਅੱਪਸੈਲਿੰਗ ਸਿਫ਼ਾਰਸ਼ਾਂ ਨਾਲ ਆਰਡਰ ਦੇ ਮੁੱਲ ਵਧਾਓ।",
    selectLang: "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ",
    supportText: "ਸਾਰੀਆਂ ਪ੍ਰਮੁੱਖ ਖੇਤਰੀ ਅਤੇ ਅੰਤਰਰਾਸ਼ਟਰੀ ਭਾഷਾਵਾਂ ਦਾ ਸਮਰਥਨ ਕਰੋ।",
    cta: "ਹੁਣੇ ਸ਼ੁਰੂ ਕਰੋ",
    liveDemo: "ਲਾਈਵ ਡੈਮੋ"
  },
  Telugu: {
    heroTop: "అత్యంత స్మార్ట్ మెను",
    heroBottom: "ఇప్పుడు మీ చేతిలో.",
    heroDesc: "మీ రెస్టారెంట్ మెనులను అన్ని ప్రధాన స్థానిక మరియు అంతర్జాతీయ భాషలలోకి అనువదించండి. ఇంటరాక్టివ్ 3D కార్డ్‌లు మరియు స్మార్ట్ అప్‌సెల్లింగ్ సిఫార్సులతో ఆర్డర్ విలువలను పెంచండి.",
    selectLang: "మీ భాషను ఎంచుకోండి",
    supportText: "అన్ని ప్రధాన ప్రాంతీయ మరియు అంతర్జాతీయ భాషలకు మద్దతు ఇస్తుంది.",
    cta: "ఇప్పుడే ప్రారంభించండి",
    liveDemo: "లైవ్ డెమో"
  },
  Sindhi: {
    heroTop: "سڀ کان وڌيڪ سمارٽ مينيو",
    heroBottom: "هاڻي توهان جي هٿ ۾.",
    heroDesc: "پنهنجي ريسٽورنٽ مينيو کي سمورين اهم ٻولين ۾ پاڻمرادو ترجمو ڪريو. انٽرايڪٽو 3D ڪارڊن ۽ سمارٽ اپ سيلنگ سفارشن سان آرڊر جا قدر وڌايو.",
    selectLang: "پنهنجي ٻولي چونڊيو",
    supportText: "سڀني وڏين ٻولين جي حمايت ڪريو.",
    cta: "هاڻي شروع ڪريو",
    liveDemo: "لائيو ڊيمو"
  },
  Marathi: {
    heroTop: "सर्वात स्मार्ट मेनू",
    heroBottom: "आता तुमच्या हातात.",
    heroDesc: "तुमच्या रेस्टॉरंट मेनूचे सर्व प्रमुख भाषांमध्ये स्वयंचलित भाषांतर करा. संवादात्मक 3D कार्ड आणि स्मार्ट अपसेलिंग शिफारसींसह ऑर्डर मूल्ये वाढवा.",
    selectLang: "तुमची भाषा निवडा",
    supportText: "सर्व प्रमुख प्रादेशिक आणि आंतरराष्ट्रीय भाषांना समर्थन द्या.",
    cta: "आता सुरू करा",
    liveDemo: "लाइव्ह डेमो"
  },
  Kannada: {
    heroTop: "ಅತ್ಯಂತ ಸ್ಮಾರ್ಟ್ ಮೆನು",
    heroBottom: "ಈಗ ನಿಮ್ಮ ಕೈಯಲ್ಲಿ.",
    heroDesc: "ನಿಮ್ಮ ರೆಸ್ಟೋರೆಂಟ್ ಮೆನುಗಳನ್ನು ಎಲ್ಲಾ ಪ್ರಮುಖ ಭಾಷೆಗಳಿಗೆ ಅನುವಾದಿಸಿ. ಸಂವಾದಾತ್ಮಕ 3D ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ಸ್ಮಾರ್ಟ್ ಅಪ್‌ಸೆಲ್ಲಿಂಗ್ ಶಿಫಾರಸುಗಳೊಂದಿಗೆ ಆದೇಶ ಮೌಲ್ಯಗಳನ್ನು ಹೆಚ್ಚಿಸಿ.",
    selectLang: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    supportText: "ಎಲ್ಲಾ ಪ್ರಮುಖ ಭಾಷೆಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.",
    cta: "ಈಗ ಪ್ರಾರಂಭಿಸಿ",
    liveDemo: "ಲೈವ್ ಡೆಮೊ"
  },
  Pushto: {
    heroTop: "تر ټولو هوښیار مینو",
    heroBottom: "اوس ستاسو په لاس کې.",
    heroDesc: "د خپل رستورانت مینو ټولو ژبو ته وژباړئ. د متقابل 3D کارتونو او سمارټ اپ سیل کولو وړاندیزونو سره د امر ارزښتونه لوړ کړئ.",
    selectLang: "خپله ژبه غوره کړئ",
    supportText: "د ټولو ژبو ملاتړ وکړئ.",
    cta: "همدا اوس پیل کړئ",
    liveDemo: "ژوندی ډیمو"
  },
  Malay: {
    heroTop: "Menu Paling Pintar",
    heroBottom: "Kini Milik Anda.",
    heroDesc: "Terjemah secara automatik menu restoran anda ke dalam semua bahasa. Tingkatkan nilai pesanan dengan kad 3D interaktif dan cadangan jualan tambahan pintar.",
    selectLang: "Pilih Bahasa anda",
    supportText: "Menyokong semua bahasa serantau dan antarabangsa.",
    cta: "Mula sekarang",
    liveDemo: "Demo Langsung"
  }
};

export default function Home() {
  const [activeLanguage, setActiveLanguage] = useState('English')
  const t = translations[activeLanguage] || translations['English']
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  
  // Contact Form State
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactMsg, setContactMsg] = useState("")
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Fallback: If Supabase auth redirects here instead of the callback URL, pass it on
    if (window.location.search.includes('code=')) {
      window.location.href = `/api/auth/callback${window.location.search}`
      return
    }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
      }
    })
  }, [])

  const features = [
    {
      title: "Interactive QR Code",
      description: "Instant access to your digital menu without any app downloads. Just scan and browse with stunning layouts.",
      icon: <QrCode className="w-6 h-6 text-orange-500" />,
    },
    {
      title: "Desi & Global Languages",
      description: "Auto-generate and translate your menu into Hindi, Spanish, French, and Japanese instantly.",
      icon: <Globe className="w-6 h-6 text-orange-500" />,
    },
    {
      title: "AI Upselling Engine",
      description: "Recommend the perfect sides and drinks based on customer selections using intelligent AI recommendations.",
      icon: <Sparkles className="w-6 h-6 text-orange-500" />,
    },
    {
      title: "Analytics Dashboard",
      description: "Track scan frequency, popular dishes, and language preferences to optimize your pricing and menu.",
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
    },
  ]

  const steps = [
    {
      step: "01",
      title: "Upload Your Menu",
      description: "Upload your existing PDF or write your dish details. Safar Dine's smart importer organizes it in seconds."
    },
    {
      step: "02",
      title: "Get Your Custom QR Code",
      description: "Generate beautiful, branded QR codes for your tables, menu boards, or flyers ready for high-resolution printing."
    },
    {
      step: "03",
      title: "Guests Scan & Dine",
      description: "Customers scan the QR and instantly browse, translate to their native language, and view AI dish pairings."
    }
  ]



  const faqs = [
    {
      question: "Do guests need to install any app to scan the menu?",
      answer: "Absolutely not! Guests simply scan the QR code using their default phone camera or Google lens. The menu opens instantly as a highly responsive, modern web app in their mobile browser, loading in less than a second."
    },
    {
      question: "Which languages are supported for automatic translation?",
      answer: "We currently support Hindi, English, Spanish, French, German, and Japanese natively. Our AI auto-translation handles regional culinary terms with precision, so local specialities read naturally in every language."
    },
    {
      question: "Can I update my menu items and prices in real-time?",
      answer: "Yes, fully! Any changes you make in your dashboard—whether editing prices, changing descriptions, uploading a new photo, or toggling an item's availability—reflect instantly on scanned customer menus without requiring a QR code reprint."
    },
    {
      question: "Is there a free trial, and what happens when it ends?",
      answer: "We offer a completely free Starter plan to support local cafes. There are no credit card requirements to sign up. If you scale to our Pro plan, you enjoy a 14-day free trial. If you cancel, your account simply reverts to the free tier."
    },
    {
      question: "How secure is our menu data and transaction records?",
      answer: "We enforce enterprise-grade security practices using Supabase PostgreSQL infrastructure and Row Level Security (RLS) data insulation. Your menus, scan metrics, and customer interactions are completely safe, private, and under your control."
    }
  ]

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingContact(true)
    try {
      await fetch("https://formsubmit.co/ajax/vermasurabh4343@gmail.com", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: contactName,
            email: contactEmail,
            message: contactMsg,
            _subject: "New Contact Form Submission from Safar Dine"
        })
      });
      setContactSuccess(true)
      setContactName("")
      setContactEmail("")
      setContactMsg("")
    } catch (error) {
      console.error(error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSubmittingContact(false)
    }
  }

  return (
    <div className="relative w-full flex flex-col min-h-screen bg-white text-slate-800 selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      {/* Radial Glowing Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[95vw] max-w-[800px] h-[550px] bg-gradient-to-tr from-orange-100/35 to-amber-100/25 rounded-full blur-[140px]" />
        <div className="absolute top-[800px] left-0 -translate-x-1/2 w-[50vw] max-w-[500px] h-[50vw] max-h-[500px] bg-orange-100/15 rounded-full blur-[120px]" />
        <div className="absolute top-[1800px] right-0 translate-x-1/2 w-[60vw] max-w-[600px] h-[60vw] max-h-[600px] bg-amber-100/20 rounded-full blur-[140px]" />
      </div>

      {/* Floating Premium Glassmorphic Header */}
      <header className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] max-w-5xl z-50 rounded-full bg-white/85 backdrop-blur-xl border border-slate-200/80 px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between shadow-lg shadow-slate-100/40">
        <Link href="/" className="flex items-center select-none group relative h-10 w-[120px]">
          <Image 
            src="/logo.png?v=3" 
            alt="Safar Dine Logo" 
            width={180}
            height={60}
            priority
            className="w-auto h-16 object-contain select-none scale-[1.35] origin-left group-hover:scale-[1.4] transition-transform duration-200" 
          />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <Link href="#features" className="hover:text-brand-500 transition-colors duration-200">Features</Link>
          <Link href="#how-it-works" className="hover:text-brand-500 transition-colors duration-200">How it Works</Link>
          <Link href="#about" className="hover:text-brand-500 transition-colors duration-200">Our Story</Link>
          <Link href="#pricing" className="hover:text-brand-500 transition-colors duration-200">Pricing</Link>
          <Link href="/changelog" className="hover:text-brand-500 transition-colors duration-200">Changelog</Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/login" className="hidden sm:inline-block text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors">
            Log in
          </Link>
          <Link 
            href="/signup" 
            className="flex items-center gap-1 px-3.5 py-1.5 md:px-5 md:py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs md:text-sm rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(249,115,22,0.2)] active:scale-95"
          >
            Get started <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-white stroke-[3]" />
          </Link>

          {/* Hamburger Menu Toggle Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-brand-500 transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Glassmorphic Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[92%] z-45 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 p-5 shadow-xl md:hidden flex flex-col gap-4 text-center"
          >
            <nav className="flex flex-col gap-3 text-sm font-bold text-slate-600">
              <Link 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-brand-500 py-2.5 border-b border-slate-100/50 transition-colors"
              >
                Features
              </Link>
              <Link 
                href="#how-it-works" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-brand-500 py-2.5 border-b border-slate-100/50 transition-colors"
              >
                How it Works
              </Link>
              <Link 
                href="#about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-brand-500 py-2.5 border-b border-slate-100/50 transition-colors"
              >
                Our Story
              </Link>
              <Link 
                href="#pricing" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-brand-500 py-2.5 border-b border-slate-100/50 transition-colors"
              >
                Pricing
              </Link>
              <Link 
                href="/changelog" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-brand-500 py-2.5 border-b border-slate-100/50 transition-colors"
              >
                Changelog
              </Link>
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-brand-500 py-2.5 border-b border-slate-100/50 transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-brand-500 py-2.5 transition-colors font-extrabold text-orange-500"
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-32">
        
        {/* HERO SECTION WITH DYNAMIC GRID ACCENT */}
        <section 
          className="relative px-4 md:px-6 pt-12 md:pt-16 pb-16 md:pb-24 max-w-7xl mx-auto flex flex-col items-center text-center z-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(249,115,22,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.035) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-4xl w-full">
            {/* Glowing Accent Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-6 md:mb-8 animate-pulse shadow-sm">
              <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" /> THE COMPLETE RESTAURANT OS
            </span>

            <h1 className="mb-6 md:mb-8 leading-none select-none">
              <span className="block text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-3 md:mb-4 py-2">
                {t.heroTop}
              </span>
              <span className="block text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-tight whitespace-nowrap">
                {t.heroBottom}
              </span>
            </h1>
            
            <p className="text-sm sm:text-lg md:text-xl text-slate-500 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0 font-sans font-medium">
              {t.heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 md:gap-5 w-full max-w-sm sm:max-w-none mx-auto mb-12 md:mb-16 px-2 sm:px-0">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-base md:text-lg rounded-xl md:rounded-2xl transition-all duration-300 shadow-[0_6px_20px_rgba(249,115,22,0.25)] active:scale-98"
              >
                {t.cta} <ArrowUpRight className="w-4.5 h-4.5 md:w-5 md:h-5 text-white stroke-[3]" />
              </Link>
              <Link 
                href="/demo/menu" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all duration-300"
              >
                {t.liveDemo}
              </Link>
            </div>

            {/* Credible Social Proof Stars */}
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                The smarter way to manage your restaurant <br /> is here. Be part of the new standard
              </span>
            </div>
          </div>
        </section>



        {/* Glowing Orange Laser Divider Line */}
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 mb-20">
          <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-[16px] bg-orange-500/20 rounded-full pointer-events-none" style={{ filter: 'blur(20px)' }} />
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-[8px] bg-orange-500/40 rounded-full pointer-events-none" style={{ filter: 'blur(8px)' }} />
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[2.5px] bg-white rounded-full pointer-events-none" style={{ filter: 'blur(1.2px)' }} />
          <div className="relative h-[2px] bg-gradient-to-r from-transparent via-[#FF7000] to-transparent" style={{ filter: 'drop-shadow(0px 0px 8px rgba(255, 112, 0, 0.95))' }} />
        </div>

        {/* MOCKUP SHOWCASE CARDS (Language selector & interactive preview) */}
        <section className="px-4 sm:px-6 py-12 max-w-6xl mx-auto z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Language Selector Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-8 md:col-span-6 flex flex-col justify-between shadow-xl shadow-slate-100/50 relative overflow-hidden group min-h-[400px] sm:min-h-[460px]">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">{t.selectLang}</h3>
                
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-5 px-2">
                  {[
                    { name: 'Hindi', rotate: 'rotate-[-3deg]' },
                    { name: 'English', rotate: 'rotate-[-8deg]' },
                    { name: 'Nepali', rotate: 'rotate-[4deg]' },
                    { name: 'Urdu', rotate: 'rotate-[-2deg]' },
                    { name: 'Tamil', rotate: 'rotate-[3deg]' },
                    { name: 'Malayalam', rotate: 'rotate-[2deg]' },
                    { name: 'Gujarati', rotate: 'rotate-[-4deg]' },
                    { name: 'Bengali', rotate: 'rotate-[5deg]' },
                    { name: 'Punjabi', rotate: 'rotate-[-1deg]' },
                    { name: 'Telugu', rotate: 'rotate-[-6deg]' },
                    { name: 'Sindhi', rotate: 'rotate-[2deg]' },
                    { name: 'Marathi', rotate: 'rotate-[-3deg]' },
                    { name: 'Kannada', rotate: 'rotate-[4deg]' },
                    { name: 'Pushto', rotate: 'rotate-[-2deg]' },
                    { name: 'Malay', rotate: 'rotate-[3deg]' }
                  ].map((lang) => (
                    <span 
                      key={lang.name} 
                      onClick={() => setActiveLanguage(lang.name)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all duration-300 transform inline-flex items-center gap-1.5 cursor-pointer hover:scale-105 ${
                        activeLanguage === lang.name
                          ? 'bg-orange-50 text-[#FF7000] border-orange-200 shadow-[0_0_20px_rgba(255,112,0,0.15)] scale-105'
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:text-slate-800 hover:bg-slate-100/80 hover:border-slate-200'
                      } ${lang.rotate}`}
                    >
                      {activeLanguage === lang.name && <CheckCircle2 className="w-4 h-4 text-[#FF7000] stroke-[3]" />}
                      {lang.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-400 leading-relaxed font-semibold">
                  {t.supportText}
                </p>
              </div>
            </div>

            {/* Beautiful CSS Mobile Mockup Showcase Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-8 md:col-span-6 flex flex-col justify-between shadow-xl shadow-slate-100/50 relative overflow-hidden group min-h-[400px] sm:min-h-[460px]">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
              
              {/* Mobile Phone Simulation */}
              <div className="relative h-[280px] sm:h-[320px] w-[180px] sm:w-[220px] mx-auto rounded-[36px] border-8 border-slate-900 bg-slate-50 shadow-2xl overflow-hidden flex flex-col justify-between p-3">
                {/* Phone camera notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-b-xl z-20" />
                
                {/* Phone Header */}
                <div className="flex items-center justify-between border-b pb-2 pt-3 select-none">
                  <span className="text-[9px] font-black tracking-tight text-slate-800">☕ Safar Dine</span>
                  <span className="text-[7px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-bold uppercase">{activeLanguage.substring(0, 3)} ▼</span>
                </div>

                {/* Phone Dish list */}
                <div className="flex-1 space-y-2 py-3 overflow-y-auto no-scrollbar">
                  <div className="border border-slate-100 rounded-xl p-2 bg-white flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="text-[9px] font-bold text-slate-900">Truffle Wagyu Burger</h4>
                      <span className="text-[8px] font-extrabold text-orange-500">$24.99</span>
                    </div>
                    <div className="w-8 h-8 rounded bg-slate-100 shrink-0 overflow-hidden">
                      <Image src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=40&q=80" alt="burger" width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-xl p-2 bg-white flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="text-[9px] font-bold text-slate-900">Saffron Cardamom Tea</h4>
                      <span className="text-[8px] font-extrabold text-orange-500">$4.99</span>
                    </div>
                    <div className="w-8 h-8 rounded bg-slate-100 shrink-0 overflow-hidden">
                      <Image src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=40&q=80" alt="tea" width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Dynamic Recommendation Bubble */}
                <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 text-[8px] font-semibold text-orange-600 mb-2 flex items-center gap-1 select-none animate-bounce">
                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                  <span>Try Saffron Cardamom Tea with the Burger!</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-slate-400 leading-relaxed font-semibold">
                  Provide highly engaging digital layouts that help guests scan, choose, and order instantly.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 2. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-16 md:py-24 bg-slate-50/50 relative z-10 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
                SaaS Onboarding Flow
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-6 mb-4">
                Launch your digital menu in 3 simple steps
              </h2>
              <p className="text-slate-500 text-lg">
                Democratize next-gen dining telemetry without high initial hardware setup costs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((s, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl relative group shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="text-5xl font-black text-orange-500/10 mb-4 font-mono select-none">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/demo" className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-500 font-extrabold text-sm group">
                Explore Simulated Live Dashboard <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-16 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto z-10 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">Powerful Capabilities</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-6 mb-4">Everything you need to modernize your menu</h2>
            <p className="text-slate-500 text-lg">Give your customers an unforgettable dining experience while increasing order values.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl hover:border-slate-200 transition-all duration-300 relative group shadow-sm hover:shadow-md"
              >
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:border-orange-200 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-500 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. OUR STORY / ABOUT FOUNDER SECTION */}
        <section id="about" className="py-16 md:py-24 bg-slate-50/50 relative z-10 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200 w-fit block">
                  Our Mission
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Born from curiosity and the ambition to build something meaningful.
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
                  Founded by Saurabh Verma, Safar Dine started with a simple belief — technology should make dining smarter and more interactive. Starting from scratch with an idea and a vision, the journey began with solving real problems for restaurants and customers.
                </p>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
                  Today, Safar Dine is building AI-powered dining experiences that remove barriers, simplify discovery, and help restaurants grow in a smarter way.
                </p>
                
                <div className="flex items-center gap-3 pt-2">
                  <Image 
                    src="/founder.jpg" 
                    alt="Saurabh Verma"
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full border border-slate-200 object-cover" 
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block">Saurabh Verma</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">FOUNDER, SAFAR DINE</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl aspect-[16/10]">
                  <Image 
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80" 
                    alt="Busy Indian Restaurant Kitchen" 
                    width={800}
                    height={500}
                    className="w-full h-full object-cover brightness-[0.95]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white text-left select-none">
                    <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">BUILDING THE FUTURE OF DINING</span>
                    <h3 className="text-base font-bold mt-1 text-white">Creating AI-powered dining experiences across India</h3>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>



        {/* 5. FAQ SECTION */}
        <section className="py-16 md:py-24 bg-slate-50/50 relative z-10 border-y border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
                Common Inquiries
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-6 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 text-base">
                Answering critical onboarding questions to reduce setup anxiety.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx
                return (
                  <div 
                    key={idx}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <button 
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-slate-800 hover:text-orange-500 transition-colors focus:outline-none"
                    >
                      <span className="text-sm sm:text-base tracking-tight">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-5 pt-1 text-slate-500 text-xs sm:text-sm font-medium leading-relaxed border-t border-slate-50">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* PRICING PLANS SECTION */}
        <section id="pricing" className="py-20 md:py-32 bg-[#FAFAFA]/70 relative z-10 border-y border-slate-200/50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/[0.03] via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF6B00] text-xs font-bold uppercase tracking-widest mb-4">
                SafarDine Pricing
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-5">
                Hassle-free pricing for every restaurant
              </h2>
              <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed">
                Turn your traditional menu into a smart digital dining experience. Select the plan that matches your vision.
              </p>
            </div>

            {/* Pricing Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto items-center mb-24">
              
              {/* CARD 1 — STARTER */}
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white border border-slate-200/60 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-slate-200/35 transition-all duration-300 min-h-[580px] relative overflow-hidden"
              >
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Starter Plan</span>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Starter</h3>
                  <p className="text-slate-400 text-xs font-semibold mb-6">Perfect for getting started</p>
                  
                  <div className="mb-8">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">₹2,999</span>
                    <span className="text-slate-400 text-xs font-extrabold ml-1 uppercase tracking-wider">/ 3 Months</span>
                    <div className="text-[11px] font-extrabold text-[#FF6B00] bg-orange-50/50 border border-orange-100/50 px-2 py-0.5 rounded-md w-fit mt-1.5">
                      ₹999 / month equivalent
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100 mb-6" />

                  <ul className="space-y-4 mb-8">
                    {[
                      "Dynamic QR Menu",
                      "Restaurant logo & branding",
                      "Unlimited menu items",
                      "Search functionality",
                      "Categories support",
                      "Multi-language support",
                      "Menu updates"
                    ].map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#FF6B00] shrink-0" />
                        <span className="text-slate-600 text-xs font-bold">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href="/signup" 
                  className="w-full py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-widest text-[#FF6B00] bg-white hover:bg-orange-50 border-2 border-[#FF6B00] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Get Started <ChevronRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </motion.div>

              {/* CARD 2 — GROWTH (MOST POPULAR) */}
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="bg-white border-2 border-[#FF6B00] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(255,107,0,0.12)] md:scale-[1.06] z-10 min-h-[640px] relative overflow-hidden ring-4 ring-orange-500/10"
              >
                {/* Floating Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md shadow-orange-500/10">
                  🔥 MOST POPULAR
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest block mb-1">Growth Plan</span>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1 flex items-center gap-2">
                    Growth
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold mb-6">Best value for growing restaurants</p>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">₹4,999</span>
                      <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">/ 6 Months</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="text-[11px] font-extrabold text-[#FF6B00] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md w-fit">
                        ₹833 / month equivalent
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Save ₹1,000+
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100 mb-6" />

                  <ul className="space-y-4 mb-8">
                    {[
                      "Everything in Starter",
                      "AI-generated dish descriptions",
                      "Premium menu themes",
                      "Customer engagement features",
                      "Advanced analytics",
                      "Priority support",
                      "Seasonal menu updates"
                    ].map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#FF6B00] shrink-0" />
                        <span className="text-slate-700 text-xs font-extrabold">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <Link 
                    href="/signup" 
                    className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/15"
                  >
                    Start Growing <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </Link>
                  <div className="text-center text-[10px] font-black text-[#FF6B00] tracking-widest uppercase flex items-center justify-center gap-1">
                    💎 Best Value
                  </div>
                </div>
              </motion.div>

              {/* CARD 3 — BUSINESS PRO */}
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white border border-slate-200/60 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-slate-200/35 transition-all duration-300 min-h-[580px] relative overflow-hidden"
              >
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Enterprise Plan</span>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Business Pro</h3>
                  <p className="text-slate-400 text-xs font-semibold mb-6">Built for established businesses</p>
                  
                  <div className="mb-8">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">₹8,999</span>
                    <span className="text-slate-400 text-xs font-extrabold ml-1 uppercase tracking-wider">/ 12 Months</span>
                    <div className="text-[11px] font-extrabold text-[#FF6B00] bg-orange-50/50 border border-orange-100/50 px-2 py-0.5 rounded-md w-fit mt-1.5">
                      ₹749 / month equivalent
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100 mb-6" />

                  <ul className="space-y-4 mb-8">
                    {[
                      "Everything in Growth",
                      "Custom branding",
                      "Multi-QR support",
                      "Dedicated support",
                      "Priority onboarding",
                      "Early access to new features"
                    ].map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#FF6B00] shrink-0" />
                        <span className="text-slate-600 text-xs font-bold">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href="/signup" 
                  className="w-full py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-widest text-[#FF6B00] bg-white hover:bg-orange-50 border-2 border-[#FF6B00] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Choose Pro <ChevronRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </motion.div>

            </div>

            {/* Small FAQ Section below pricing */}
            <div className="max-w-3xl mx-auto pt-16 border-t border-slate-200/60">
              <h3 className="text-center text-sm font-black text-slate-400 uppercase tracking-widest mb-10">Pricing FAQ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight mb-2">Can I change plans later?</h4>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Yes, you can easily upgrade, downgrade, or switch plans at any time directly from your dashboard settings without any downtime.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight mb-2">Do you offer support?</h4>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Absolutely. We offer dedicated premium customer support to help with onboarding, menu importing, and configuring custom brand designs.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight mb-2">Can I cancel anytime?</h4>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Yes, SafarDine subscriptions are fully flexible. There are no locking contracts, and you can cancel your subscription whenever you want.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 6. CONTACT US FORM SECTION */}
        <section id="contact" className="py-16 md:py-24 bg-slate-50/50 relative z-10 border-y border-slate-100">
          <div className="max-w-lg mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200 w-fit block mx-auto">
                Reach Safar Dine
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-5">Contact our sales & support</h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                Ask questions or request dedicated onboarding setups. Raghav's team typically answers in minutes.
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 space-y-6">
              
              {contactSuccess ? (
                  <div className="text-center py-8 space-y-4 animate-in fade-in duration-300">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Message Sent Successfully!</h3>
                    <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">
                      Thank you for contacting Safar Dine. Raghav or a beta support executive will reply to your inbox shortly.
                    </p>
                    <button 
                      onClick={() => setContactSuccess(false)}
                      className="px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={handleContactSubmit}
                    className="space-y-4 animate-in fade-in duration-300"
                  >
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider" htmlFor="cName">Your Name</label>
                      <input 
                        id="cName"
                        type="text" 
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Raghav Verma"
                        className="w-full px-3 py-2.5 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl outline-none text-xs text-slate-800 placeholder-slate-300 font-medium transition-all" 
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider" htmlFor="cEmail">Email Address</label>
                      <input 
                        id="cEmail"
                        type="email" 
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="owner@myrestaurant.com"
                        className="w-full px-3 py-2.5 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl outline-none text-xs text-slate-800 placeholder-slate-300 font-medium transition-all" 
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider" htmlFor="cMsg">Message Description</label>
                      <textarea 
                        id="cMsg"
                        required
                        rows={4}
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        placeholder="Tell us about your restaurant setup or custom onboarding inquiries..."
                        className="w-full px-3 py-2.5 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-xl outline-none text-xs text-slate-800 placeholder-slate-300 font-medium transition-all resize-none" 
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmittingContact}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    >
                      {isSubmittingContact ? "Submitting..." : "Send Message"}
                    </button>
                  </form>
                )}

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER - FULL BUILD OUT */}
      <footer className="bg-slate-50 border-t border-slate-200 py-16 px-4 sm:px-6 z-10 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-16">
            
            {/* Column 1: Info */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center select-none group w-fit">
                <Image 
                  src="/logo.png?v=3" 
                  alt="Safar Dine Logo" 
                  width={180}
                  height={60}
                  className="h-16 w-auto object-contain mb-6 scale-[1.35] origin-left grayscale hover:grayscale-0 transition-all duration-300" 
                />
              </Link>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-semibold">
                Auto-translate menus, automate upselling, and monitor dine-in metrics using intelligent, responsive visual overlays. Deployed with row level database insulation.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Beta support: Maharashtra, Mumbai, India</span>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Product</h4>
              <ul className="space-y-2 text-xs font-bold text-slate-500">
                <li><Link href="#features" className="hover:text-orange-500 transition-colors">Key Features</Link></li>
                <li><Link href="#pricing" className="hover:text-orange-500 transition-colors">Pricing Options</Link></li>
                <li><Link href="/demo/menu" className="hover:text-orange-500 transition-colors">Interactive Menu Demo</Link></li>
                <li><Link href="/demo" className="hover:text-orange-500 transition-colors">Sandbox Dashboard Demo</Link></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Company</h4>
              <ul className="space-y-2 text-xs font-bold text-slate-500">
                <li><Link href="#about" className="hover:text-orange-500 transition-colors">Our Story</Link></li>
                <li><Link href="/changelog" className="hover:text-orange-500 transition-colors">Product Changelog</Link></li>
                <li><span className="opacity-50 cursor-not-allowed">Join Careers (We are hiring!)</span></li>
              </ul>
            </div>

            {/* Column 4: Legal & Support */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Legal & Support</h4>
              <ul className="space-y-2 text-xs font-bold text-slate-500">
                <li><Link href="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#contact" className="hover:text-orange-500 transition-colors">Contact Support</Link></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-200/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
            <p>© 2026 Safar Dine. Built with absolute pride in Maharashtra, Mumbai. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="hover:text-orange-500 cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-orange-500 cursor-pointer transition-colors">GitHub</span>
              <span className="hover:text-orange-500 cursor-pointer transition-colors">LinkedIn</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}
