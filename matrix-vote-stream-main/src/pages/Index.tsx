import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { language, setLanguage, t } = useLanguage();

  const features = [
    {
      title: t('home.identityVerification'),
      description: t('home.identityDescription'),
      icon: '🔒',
      status: t('home.active')
    },
    {
      title: t('home.blockchainSecurity'),
      description: t('home.blockchainDescription'),
      icon: '⛓️',
      status: t('home.active')
    },
    {
      title: t('home.clientEncryption'),
      description: t('home.clientDescription'),
      icon: '🛡️',
      status: t('home.active')
    },
    {
      title: t('home.ipfsStorage'),
      description: t('home.ipfsDescription'),
      icon: '🌐',
      status: t('home.active')
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Language Selector Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{t('home.language')}:</span>
            <Select value={language} onValueChange={(value: 'en' | 'hi') => setLanguage(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('home.english')}</SelectItem>
                <SelectItem value="hi">{t('home.hindi')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="animate-digital-form">
            <h1 className="text-6xl font-bold matrix-text mb-6">
              <span className="animate-matrix-glow">e-VS</span>
              <span className="text-matrix-bright">({language === 'hi' ? 'ई वोटिंग सिस्टम' : 'e Voting System'})</span>
            </h1>
            <div className="text-2xl matrix-text mb-8 typing-animation">
              {t('home.subtitle')}
            </div>
          </div>

          <p className="text-xl text-matrix-glow max-w-3xl mx-auto mb-12 leading-relaxed">
            {t('home.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/admin/login">
              <Button className="matrix-button text-lg px-8 py-4">
                &gt; {t('home.adminLogin')}
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" className="matrix-button text-lg px-8 py-4 border-matrix-neon text-matrix-neon hover:bg-matrix-neon/10">
                &gt; {t('home.getVotingLink')}
              </Button>
            </Link>
          </div>

          {/* Status Display */}
          <div className="matrix-terminal max-w-2xl mx-auto p-6">
            <div className="font-mono text-sm space-y-2 text-matrix-glow">
              <div className="text-matrix-bright mb-4">&gt; {t('home.systemStatus')}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>&gt; {t('home.blockchain')} <span className="text-matrix-neon">{t('home.online')}</span></div>
                <div>&gt; {t('home.ipfs')} <span className="text-matrix-neon">{t('home.connected')}</span></div>
                <div>&gt; {t('home.encryption')} <span className="text-matrix-neon">{t('home.ready')}</span></div>
                <div>&gt; {t('home.verification')} <span className="text-matrix-neon">{t('home.active')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold matrix-text mb-4">
            <span className="text-matrix-bright">&gt;</span> {t('home.securityFeatures')}
          </h2>
          <p className="text-matrix-glow text-lg">
            {t('home.securityDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="matrix-terminal hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle className="matrix-text text-lg">
                  {feature.title}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-matrix-neon border-matrix-neon"
                >
                  {feature.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-matrix-glow text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Process Flow */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold matrix-text mb-4">
            <span className="text-matrix-bright">&gt;</span> {t('home.votingProcess')}
          </h2>
          <p className="text-matrix-glow text-lg">
            {t('home.processDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: t('home.getLink'), desc: t('home.getLinkDesc'), path: '/admin/login' },
            { step: '02', title: t('home.register'), desc: t('home.registerDesc'), path: '/admin/login' },
            { step: '03', title: t('home.vote'), desc: t('home.voteDesc'), path: '/admin/login' },
            { step: '04', title: t('home.results'), desc: t('home.resultsDesc'), path: '/admin/login' }
          ].map((item, index) => (
            <div key={index}>
              <Card className="matrix-terminal h-full hover:bg-primary/5 transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-matrix-bright mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold matrix-text mb-2">
                    {item.title}
                  </h3>
                  <p className="text-matrix-glow text-sm">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="matrix-terminal max-w-4xl mx-auto p-8 mb-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold matrix-text text-matrix-bright mb-2">
              256-bit
            </div>
            <div className="text-matrix-glow">{t('home.encryptionStandard')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold matrix-text text-matrix-bright mb-2">
              100%
            </div>
            <div className="text-matrix-glow">{t('home.anonymity')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold matrix-text text-matrix-bright mb-2">
              0
            </div>
            <div className="text-matrix-glow">{t('home.failurePoints')}</div>
          </div>
        </div>
      </div>

      {/* Camera Test Section */}
      <div className="matrix-terminal max-w-4xl mx-auto p-8 mb-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold matrix-text text-matrix-bright mb-4">
            Camera Test
          </h2>
          <p className="text-matrix-glow">
            Test your camera functionality before voting
          </p>
        </div>
        <div className="text-center">
          <Link to="/camera-test">
            <Button className="matrix-button">
              Test Camera
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
