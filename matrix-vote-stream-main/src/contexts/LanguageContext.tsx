import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
    language: 'en' | 'hi';
    setLanguage: (lang: 'en' | 'hi') => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation mappings
const translations = {
    en: {
        // Homepage
        'home.title': 'e-VS (e Voting System)',
        'home.subtitle': 'Secure • Anonymous • Verifiable',
        'home.description': 'Experience the future of democracy with our blockchain-secured voting platform. Complete privacy, absolute security, and verifiable transparency.',
        'home.adminLogin': 'ADMIN LOGIN',
        'home.getVotingLink': 'GET VOTING LINK',
        'home.systemStatus': 'SYSTEM STATUS:',
        'home.blockchain': 'Blockchain:',
        'home.ipfs': 'IPFS Network:',
        'home.encryption': 'Encryption:',
        'home.verification': 'Verification:',
        'home.online': 'ONLINE',
        'home.connected': 'CONNECTED',
        'home.ready': 'AES-256 READY',
        'home.active': 'ACTIVE',
        'home.securityFeatures': 'SECURITY FEATURES',
        'home.securityDescription': 'Multi-layered security ensuring complete vote integrity',
        'home.identityVerification': 'Identity Verification',
        'home.identityDescription': 'Secure ID hashing with SHA-256 encryption',
        'home.blockchainSecurity': 'Blockchain Security',
        'home.blockchainDescription': 'Immutable vote recording on distributed ledger',
        'home.clientEncryption': 'Client-side Encryption',
        'home.clientDescription': 'AES-256-GCM encryption before transmission',
        'home.ipfsStorage': 'IPFS Storage',
        'home.ipfsDescription': 'Decentralized storage for encrypted votes',
        'home.votingProcess': 'VOTING PROCESS',
        'home.processDescription': 'Secure, anonymous, and verifiable in four simple steps',
        'home.getLink': 'Get Link',
        'home.getLinkDesc': 'Admin creates election & shares voting link',
        'home.register': 'Register',
        'home.registerDesc': 'Upload documents & biometric verification',
        'home.vote': 'Vote',
        'home.voteDesc': 'Select candidate & cast encrypted vote',
        'home.results': 'Results',
        'home.resultsDesc': 'View election results & statistics',
        'home.encryptionStandard': 'Encryption Standard',
        'home.anonymity': 'Anonymity Guaranteed',
        'home.failurePoints': 'Central Points of Failure',
        'home.language': 'Language',
        'home.english': 'English',
        'home.hindi': 'Hindi',
    },
    hi: {
        // Homepage
        'home.title': 'ई-वीएस (ई वोटिंग सिस्टम)',
        'home.subtitle': 'सुरक्षित • गुमनाम • सत्यापन योग्य',
        'home.description': 'हमारे ब्लॉकचेन-सुरक्षित वोटिंग प्लेटफॉर्म के साथ लोकतंत्र के भविष्य का अनुभव करें। पूर्ण गोपनीयता, पूर्ण सुरक्षा और सत्यापन योग्य पारदर्शिता।',
        'home.adminLogin': 'एडमिन लॉगिन',
        'home.getVotingLink': 'वोटिंग लिंक प्राप्त करें',
        'home.systemStatus': 'सिस्टम स्थिति:',
        'home.blockchain': 'ब्लॉकचेन:',
        'home.ipfs': 'आईपीएफएस नेटवर्क:',
        'home.encryption': 'एन्क्रिप्शन:',
        'home.verification': 'सत्यापन:',
        'home.online': 'ऑनलाइन',
        'home.connected': 'जुड़ा हुआ',
        'home.ready': 'एईएस-256 तैयार',
        'home.active': 'सक्रिय',
        'home.securityFeatures': 'सुरक्षा सुविधाएं',
        'home.securityDescription': 'पूर्ण वोट अखंडता सुनिश्चित करने वाली बहु-स्तरीय सुरक्षा',
        'home.identityVerification': 'पहचान सत्यापन',
        'home.identityDescription': 'एसएचए-256 एन्क्रिप्शन के साथ सुरक्षित आईडी हैशिंग',
        'home.blockchainSecurity': 'ब्लॉकचेन सुरक्षा',
        'home.blockchainDescription': 'वितरित लेजर पर अपरिवर्तनीय वोट रिकॉर्डिंग',
        'home.clientEncryption': 'क्लाइंट-साइड एन्क्रिप्शन',
        'home.clientDescription': 'ट्रांसमिशन से पहले एईएस-256-जीसीएम एन्क्रिप्शन',
        'home.ipfsStorage': 'आईपीएफएस स्टोरेज',
        'home.ipfsDescription': 'एन्क्रिप्टेड वोट्स के लिए विकेंद्रीकृत स्टोरेज',
        'home.votingProcess': 'वोटिंग प्रक्रिया',
        'home.processDescription': 'चार सरल चरणों में सुरक्षित, गुमनाम और सत्यापन योग्य',
        'home.getLink': 'लिंक प्राप्त करें',
        'home.getLinkDesc': 'एडमिन चुनाव बनाता है और वोटिंग लिंक साझा करता है',
        'home.register': 'पंजीकरण',
        'home.registerDesc': 'दस्तावेज अपलोड करें और बायोमेट्रिक सत्यापन',
        'home.vote': 'वोट',
        'home.voteDesc': 'उम्मीदवार चुनें और एन्क्रिप्टेड वोट डालें',
        'home.results': 'परिणाम',
        'home.resultsDesc': 'चुनाव परिणाम और आंकड़े देखें',
        'home.encryptionStandard': 'एन्क्रिप्शन मानक',
        'home.anonymity': 'गुमनामी की गारंटी',
        'home.failurePoints': 'केंद्रीय विफलता बिंदु',
        'home.language': 'भाषा',
        'home.english': 'अंग्रेजी',
        'home.hindi': 'हिंदी',
    }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<'en' | 'hi'>('en');

    useEffect(() => {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('language') as 'en' | 'hi';
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
            setLanguage(savedLanguage);
        }
    }, []);

    const handleSetLanguage = (lang: 'en' | 'hi') => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations[typeof language]] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
