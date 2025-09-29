import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const features = [
    {
      title: 'Identity Verification',
      description: 'Secure ID hashing with SHA-256 encryption',
      icon: '🔒',
      status: 'Active'
    },
    {
      title: 'Blockchain Security',
      description: 'Immutable vote recording on distributed ledger',
      icon: '⛓️',
      status: 'Active'
    },
    {
      title: 'Client-side Encryption',
      description: 'AES-256-GCM encryption before transmission',
      icon: '🛡️',
      status: 'Active'
    },
    {
      title: 'IPFS Storage',
      description: 'Decentralized storage for encrypted votes',
      icon: '🌐',
      status: 'Active'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="animate-digital-form">
            <h1 className="text-6xl font-bold matrix-text mb-6">
              <span className="animate-matrix-glow">e-VS</span>
              <span className="text-matrix-bright">(e Voting System)</span>
            </h1>
            <div className="text-2xl matrix-text mb-8 typing-animation">
              Secure • Anonymous • Verifiable
            </div>
          </div>
          
          <p className="text-xl text-matrix-glow max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience the future of democracy with our blockchain-secured voting platform.
            Complete privacy, absolute security, and verifiable transparency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/admin/login">
              <Button className="matrix-button text-lg px-8 py-4">
                &gt; ADMIN LOGIN
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" className="matrix-button text-lg px-8 py-4 border-matrix-neon text-matrix-neon hover:bg-matrix-neon/10">
                &gt; GET VOTING LINK
              </Button>
            </Link>
          </div>

          {/* Status Display */}
          <div className="matrix-terminal max-w-2xl mx-auto p-6">
            <div className="font-mono text-sm space-y-2 text-matrix-glow">
              <div className="text-matrix-bright mb-4">&gt; SYSTEM STATUS:</div>
              <div className="grid grid-cols-2 gap-4">
                <div>&gt; Blockchain: <span className="text-matrix-neon">ONLINE</span></div>
                <div>&gt; IPFS Network: <span className="text-matrix-neon">CONNECTED</span></div>
                <div>&gt; Encryption: <span className="text-matrix-neon">AES-256 READY</span></div>
                <div>&gt; Verification: <span className="text-matrix-neon">ACTIVE</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold matrix-text mb-4">
            <span className="text-matrix-bright">&gt;</span> SECURITY FEATURES
          </h2>
          <p className="text-matrix-glow text-lg">
            Multi-layered security ensuring complete vote integrity
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
            <span className="text-matrix-bright">&gt;</span> VOTING PROCESS
          </h2>
          <p className="text-matrix-glow text-lg">
            Secure, anonymous, and verifiable in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Get Link', desc: 'Admin creates election & shares voting link', path: '/admin/login' },
            { step: '02', title: 'Register', desc: 'Upload documents & biometric verification', path: '/admin/login' },
            { step: '03', title: 'Vote', desc: 'Select candidate & cast encrypted vote', path: '/admin/login' },
            { step: '04', title: 'Results', desc: 'View election results & statistics', path: '/admin/login' }
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
            <div className="text-matrix-glow">Encryption Standard</div>
          </div>
          <div>
            <div className="text-4xl font-bold matrix-text text-matrix-bright mb-2">
              100%
            </div>
            <div className="text-matrix-glow">Anonymity Guaranteed</div>
          </div>
          <div>
            <div className="text-4xl font-bold matrix-text text-matrix-bright mb-2">
              0
            </div>
            <div className="text-matrix-glow">Central Points of Failure</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
