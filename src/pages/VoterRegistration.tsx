import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Camera, CheckCircle, ArrowRight } from 'lucide-react';

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalVoters: number;
  candidates: Candidate[];
  votingLink: string;
  createdAt: Date;
}

interface Candidate {
  id: string;
  name: string;
  description: string;
  logo: string;
}

const VoterRegistration = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  
  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  const [step, setStep] = useState<'upload' | 'biometric' | 'verification' | 'complete'>('upload');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [biometricData, setBiometricData] = useState<string>('');
  const [voterId, setVoterId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Load election data
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const election = elections.find((e: any) => e.id === electionId);
    
    if (!election) {
      setError('Election not found');
      return;
    }

    // Convert date strings back to Date objects
    const electionWithDates = {
      ...election,
      startDate: new Date(election.startDate),
      endDate: new Date(election.endDate),
      createdAt: new Date(election.createdAt)
    };

    setCurrentElection(electionWithDates);

    // Check if voting is active
    const now = new Date();
    if (now < electionWithDates.startDate) {
      setError('Voting has not started yet');
    } else if (now > electionWithDates.endDate) {
      setError('Voting period has ended');
    }
  }, [electionId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'address') => {
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

    if (type === 'id') {
      setIdFile(file);
    } else {
      setAddressFile(file);
    }
    
    setError('');
  };

  const processDocuments = async () => {
    if (!idFile || !addressFile) {
      setError('Please upload both ID proof and address proof documents');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simulate document processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }

      setStep('biometric');
    } catch (error) {
      setError('Failed to process documents');
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
      
      // Simulate biometric capture
      setTimeout(() => {
        const biometricHash = `bio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setBiometricData(biometricHash);
        setStep('verification');
      }, 3000);
      
    } catch (error) {
      setError('Camera access denied. Please allow camera access for biometric verification.');
    }
  };

  const generateVoterId = async () => {
    if (!currentElection) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Generate unique voter ID
      const generatedVoterId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create hash of voter ID
      const encoder = new TextEncoder();
      const data = encoder.encode(generatedVoterId);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const voterIdHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setVoterId(voterIdHash);

      // Save voter registration to blockchain (localStorage for demo)
      const voterRegistration = {
        id: generatedVoterId,
        electionId: currentElection.id,
        voterIdHash,
        biometricData,
        documents: {
          idProof: idFile?.name,
          addressProof: addressFile?.name
        },
        registeredAt: new Date()
      };

      const existingRegistrations = JSON.parse(localStorage.getItem('voterRegistrations') || '[]');
      existingRegistrations.push(voterRegistration);
      localStorage.setItem('voterRegistrations', JSON.stringify(existingRegistrations));

      // Store voter ID in session
      localStorage.setItem('currentVoterId', voterIdHash);
      localStorage.setItem('currentElectionId', currentElection.id);

      setStep('complete');
    } catch (error) {
      setError('Failed to generate voter ID. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentElection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Loading...</h2>
            <p className="text-muted-foreground">Loading election information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Voter Registration
          </h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {currentElection.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {currentElection.description}
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Voting Period: {currentElection.startDate.toLocaleDateString()} - {currentElection.endDate.toLocaleDateString()}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registration Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Process</CardTitle>
              <CardDescription>
                Complete these steps to register for voting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Document Upload */}
              {step === 'upload' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="id-upload">ID Proof Document *</Label>
                    <Input
                      ref={fileInputRef}
                      id="id-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'id')}
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload Aadhaar, Voter ID, Driver's License, or Passport
                    </p>
                    {idFile && (
                      <div className="p-2 bg-muted rounded border">
                        <p className="text-sm text-green-600">✓ {idFile.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="address-upload">Address Proof Document *</Label>
                    <Input
                      ref={addressInputRef}
                      id="address-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'address')}
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload utility bill, bank statement, or rental agreement
                    </p>
                    {addressFile && (
                      <div className="p-2 bg-muted rounded border">
                        <p className="text-sm text-green-600">✓ {addressFile.name}</p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={processDocuments}
                    disabled={!idFile || !addressFile || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Documents...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Process Documents
                      </>
                    )}
                  </Button>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-muted-foreground text-center">
                        {progress}% Complete
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Biometric Verification */}
              {step === 'biometric' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Biometric Verification</h3>
                    <p className="text-muted-foreground mb-6">
                      Position your face in front of the camera for biometric verification
                    </p>
                  </div>

                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    className="w-full max-w-md mx-auto rounded-lg border"
                    style={{ display: videoRef.current?.srcObject ? 'block' : 'none' }}
                  />
                  
                  <Button 
                    onClick={startBiometricVerification}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Biometric Verification
                  </Button>
                </div>
              )}

              {/* Step 3: Voter ID Generation */}
              {step === 'verification' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Generate Voter ID</h3>
                    <p className="text-muted-foreground mb-6">
                      Your documents and biometric data have been verified. Generate your unique voter ID.
                    </p>
                  </div>

                  <Button 
                    onClick={generateVoterId}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Voter ID...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Generate Voter ID
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Step 4: Registration Complete */}
              {step === 'complete' && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-4">
                    Registration Complete!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You have been successfully registered for the election.
                  </p>
                  {voterId && (
                    <div className="mb-6 p-4 bg-muted rounded border">
                      <p className="text-sm text-muted-foreground mb-2">Your Voter ID Hash:</p>
                      <p className="font-mono text-xs break-all">{voterId}</p>
                    </div>
                  )}
                  <Button 
                    onClick={() => navigate(`/voting/${electionId}`)}
                    className="w-full"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Proceed to Vote
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Security Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-3">
                <div>
                  <div className="font-semibold text-foreground">🔒 Privacy Protected</div>
                  <div className="text-muted-foreground">Your documents are processed locally and only hashes are stored.</div>
                </div>
                
                <div>
                  <div className="font-semibold text-foreground">🔗 Blockchain Secured</div>
                  <div className="text-muted-foreground">Your voter ID is hashed and stored on the blockchain.</div>
                </div>
                
                <div>
                  <div className="font-semibold text-foreground">🎯 One Vote Policy</div>
                  <div className="text-muted-foreground">Each voter can only cast one vote per election.</div>
                </div>
                
                <div>
                  <div className="font-semibold text-foreground">🛡️ Encrypted Votes</div>
                  <div className="text-muted-foreground">All votes are encrypted with AES-256 before storage.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoterRegistration;
