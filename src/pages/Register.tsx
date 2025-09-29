import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useElection } from '@/contexts/ElectionContext';
import { useVotingFlow } from '@/hooks/useVotingFlow';

export const Register = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { elections, registerVoter } = useElection();
  const { completeRegistration } = useVotingFlow();
  
  const [step, setStep] = useState<'upload' | 'hash' | 'biometric' | 'verify' | 'complete'>('upload');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [digitalFingerprint, setDigitalFingerprint] = useState('');
  const [biometricHash, setBiometricHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentElection = elections.find(e => e.id === electionId);

  useEffect(() => {
    if (!currentElection) {
      setError('Election not found or invalid election ID');
      return;
    }

    const now = new Date();
    if (now < currentElection.startDate) {
      setError('Voting has not started yet');
    } else if (now > currentElection.endDate) {
      setError('Voting period has ended');
    }
  }, [currentElection]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Hash ID using WebCrypto
  const hashIDDocument = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleIDUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG) or PDF file');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setIdFile(file);
    setError('');
  };

  const handleAddressUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG) or PDF file');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setAddressFile(file);
    setError('');
  };

  const processDocuments = async () => {
    if (!idFile || !addressFile) {
      setError('Please upload both ID proof and address proof documents');
      return;
    }

    setIsProcessing(true);
    setStep('hash');
    setError('');

    try {
      // Simulate processing delay with glitch effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const idHash = await hashIDDocument(idFile);
      const addressHash = await hashIDDocument(addressFile);
      
      // Combine both hashes for a unique voter fingerprint
      const combinedHash = await crypto.subtle.digest('SHA-256', 
        new TextEncoder().encode(idHash + addressHash)
      );
      const fingerprint = Array.from(new Uint8Array(combinedHash))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      
      setDigitalFingerprint(fingerprint);
      
      toast.success('Digital fingerprint created successfully!', {
        description: 'Your documents have been securely hashed and anonymized.'
      });
      
      setStep('biometric');
    } catch (error) {
      toast.error('Failed to process documents');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const startBiometricVerification = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate biometric capture and hashing
      setTimeout(() => {
        const biometricHash = `bio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setBiometricHash(biometricHash);
        
        // Turn off camera after biometric verification
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        
        toast.success('Biometric verification completed!', {
          description: 'Camera has been turned off for privacy.'
        });
        
        setStep('verify');
      }, 3000);
      
    } catch (error) {
      toast.error('Camera access denied. Proceeding without biometric verification.');
      setStep('verify');
    }
  };

  const verifyVoterEligibility = async () => {
    if (!currentElection) return;
    
    setIsProcessing(true);
    setError('');
    
    // Add timeout to prevent getting stuck
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Verification timeout')), 10000); // 10 second timeout
    });
    
    try {
      const verificationPromise = (async () => {
        // Simulate blockchain verification with progress updates
        const steps = [
          'Connecting to blockchain network...',
          'Verifying voter eligibility...',
          'Checking for duplicate registrations...',
          'Generating voter token...',
          'Recording on blockchain...'
        ];

        for (let i = 0; i < steps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 800));
          console.log(`Step ${i + 1}: ${steps[i]}`);
        }
        
        // Register voter in the election context
        const voterId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        registerVoter({
          id: voterId,
          electionId: currentElection.id,
          voterId: digitalFingerprint,
          documents: {
            idProof: idFile?.name,
            addressProof: addressFile?.name
          },
          biometricHash: biometricHash || undefined,
          isVerified: true,
          registrationDate: new Date()
        });

        // Update voting flow state
        completeRegistration(digitalFingerprint);
        
        return true;
      })();

      await Promise.race([verificationPromise, timeoutPromise]);
      
      toast.success('Voter verification successful!', {
        description: 'You are now registered and eligible to vote.'
      });
      
      setStep('complete');
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error instanceof Error && error.message === 'Verification timeout' 
        ? 'Verification timed out. Please try again.' 
        : 'Verification failed. Please try again.';
      
      toast.error(errorMessage);
      setError(errorMessage);
      setStep('verify'); // Go back to verification step
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold matrix-text mb-4">
            <span className="animate-digital-form">VOTER REGISTRATION</span>
          </h1>
          {currentElection && (
            <div className="mb-4">
              <h2 className="text-2xl font-semibold matrix-text mb-2">
                {currentElection.title}
              </h2>
              <p className="text-matrix-glow text-lg mb-2">
                {currentElection.description}
              </p>
              <div className="text-sm text-matrix-glow">
                Voting Period: {currentElection.startDate.toLocaleDateString()} - {currentElection.endDate.toLocaleDateString()}
              </div>
            </div>
          )}
          <p className="text-matrix-glow text-lg">
            Secure identity verification through blockchain technology
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Registration Flow */}
          <Card className="matrix-terminal">
            <CardHeader>
              <CardTitle className="matrix-text flex items-center">
                <span className="text-matrix-bright mr-2">&gt;</span>
                {step === 'upload' && 'Upload ID Document'}
                {step === 'hash' && 'Creating Digital Fingerprint'}
                {step === 'biometric' && 'Biometric Verification'}
                {step === 'verify' && 'Blockchain Verification'}
                {step === 'complete' && 'Registration Complete'}
              </CardTitle>
              <CardDescription className="text-matrix-glow">
                {step === 'upload' && 'Upload your government-issued ID for secure hashing'}
                {step === 'hash' && 'Generating anonymous digital fingerprint...'}
                {step === 'biometric' && 'Optional: Verify your identity with biometric data'}
                {step === 'verify' && 'Verifying against electoral blockchain...'}
                {step === 'complete' && 'You are now registered to vote!'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Document Upload */}
              {step === 'upload' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="id-upload" className="matrix-text">
                      ID Proof Document *
                    </Label>
                    <Input
                      ref={fileInputRef}
                      id="id-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleIDUpload}
                      className="matrix-input"
                    />
                    <p className="text-sm text-matrix-glow">
                      Upload Aadhaar, Voter ID, Driver's License, or Passport
                    </p>
                    {idFile && (
                      <div className="p-2 bg-matrix-dark/30 rounded border border-matrix-neon/20">
                        <p className="text-sm text-matrix-neon">✓ {idFile.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="address-upload" className="matrix-text">
                      Address Proof Document *
                    </Label>
                    <Input
                      ref={addressInputRef}
                      id="address-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleAddressUpload}
                      className="matrix-input"
                    />
                    <p className="text-sm text-matrix-glow">
                      Upload utility bill, bank statement, or rental agreement
                    </p>
                    {addressFile && (
                      <div className="p-2 bg-matrix-dark/30 rounded border border-matrix-neon/20">
                        <p className="text-sm text-matrix-neon">✓ {addressFile.name}</p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={processDocuments}
                    disabled={!idFile || !addressFile}
                    className="matrix-button w-full"
                  >
                    &gt; Process Documents
                  </Button>

                  <p className="text-xs text-matrix-glow text-center">
                    Documents will be hashed locally and never stored in their original form.
                  </p>
                </div>
              )}

              {/* Step 2: Hashing Process */}
              {step === 'hash' && (
                <div className="text-center py-8">
                  <div className="animate-glitch matrix-text text-2xl mb-4">
                    PROCESSING...
                  </div>
                  <div className="space-y-2 font-mono text-sm text-matrix-glow">
                    <div className="animate-pulse">&gt; Reading document data...</div>
                    <div className="animate-pulse">&gt; Applying SHA-256 hash...</div>
                    <div className="animate-pulse">&gt; Generating fingerprint...</div>
                    <div className="animate-pulse">&gt; Securing identity...</div>
                  </div>
                </div>
              )}

              {/* Step 3: Biometric Verification */}
              {step === 'biometric' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-matrix-glow mb-4">
                      Digital Fingerprint: 
                      <span className="font-mono text-xs block mt-1 break-all">
                        {digitalFingerprint.slice(0, 32)}...
                      </span>
                    </div>
                    <Button 
                      onClick={startBiometricVerification}
                      className="matrix-button w-full"
                    >
                      &gt; Start Biometric Verification
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setStep('verify')}
                      className="w-full mt-2 text-matrix-glow hover:text-matrix-bright"
                    >
                      Skip Biometric (Proceed with ID only)
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Blockchain Verification */}
              {step === 'verify' && (
                <div className="space-y-4">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    className="w-full max-w-md mx-auto rounded-lg border border-primary/30"
                    style={{ display: videoRef.current?.srcObject ? 'block' : 'none' }}
                  />
                  
                  <div className="text-center">
                    {isProcessing ? (
                      <div className="py-8">
                        <div className="animate-matrix-glow text-2xl matrix-text mb-4">
                          VERIFYING...
                        </div>
                        <div className="space-y-2 font-mono text-sm text-matrix-glow">
                          <div className="animate-pulse">&gt; Connecting to blockchain network...</div>
                          <div className="animate-pulse">&gt; Verifying voter eligibility...</div>
                          <div className="animate-pulse">&gt; Checking for duplicate registrations...</div>
                          <div className="animate-pulse">&gt; Generating voter token...</div>
                          <div className="animate-pulse">&gt; Recording on blockchain...</div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-matrix-dark/50 rounded-full h-2">
                            <div className="bg-matrix-neon h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Button 
                          onClick={verifyVoterEligibility}
                          className="matrix-button w-full"
                          disabled={isProcessing}
                        >
                          &gt; Verify Voter Eligibility
                        </Button>
                        <p className="text-xs text-matrix-glow">
                          This process will verify your identity and register you for voting
                        </p>
                        {error && (
                          <div className="mt-4">
                            <Alert variant="destructive">
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                            <Button 
                              onClick={verifyVoterEligibility}
                              variant="outline"
                              className="matrix-button w-full mt-2"
                              disabled={isProcessing}
                            >
                              &gt; Retry Verification
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Complete */}
              {step === 'complete' && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✓</div>
                  <div className="text-2xl matrix-text mb-4 animate-digital-form">
                    REGISTRATION COMPLETE
                  </div>
                  <p className="text-matrix-glow mb-6">
                    You have been successfully registered for the election.
                  </p>
                  <Button 
                    onClick={() => navigate(`/vote/${currentElection?.id || ''}`)}
                    className="matrix-button"
                  >
                    &gt; Proceed to Vote
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card className="matrix-terminal">
            <CardHeader>
              <CardTitle className="matrix-text">
                <span className="text-matrix-bright mr-2">&gt;</span>
                Security Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-3 text-matrix-glow">
                <div>
                  <div className="font-semibold text-matrix-bright">🔒 Privacy Protected</div>
                  <div>Your ID is hashed locally using SHA-256. Only the hash is stored on-chain.</div>
                </div>
                
                <div>
                  <div className="font-semibold text-matrix-bright">🔗 Blockchain Secured</div>
                  <div>Immutable voter registration prevents tampering and ensures integrity.</div>
                </div>
                
                <div>
                  <div className="font-semibold text-matrix-bright">🎯 One Vote Policy</div>
                  <div>Voter tokens are burned after use, preventing double voting.</div>
                </div>
                
                <div>
                  <div className="font-semibold text-matrix-bright">🛡️ Encrypted Votes</div>
                  <div>All votes are encrypted client-side before blockchain submission.</div>
                </div>
              </div>

              {digitalFingerprint && (
                <div className="mt-6 p-4 bg-primary/10 rounded border border-primary/30">
                  <div className="text-matrix-bright font-semibold mb-2">Your Digital Identity</div>
                  <div className="font-mono text-xs break-all text-matrix-glow">
                    {digitalFingerprint}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};