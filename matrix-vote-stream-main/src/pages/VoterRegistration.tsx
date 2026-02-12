import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Camera, CheckCircle, ArrowRight, User, CreditCard } from 'lucide-react';
import { VerificationService, User as VerifiedUser } from '@/services/verificationService';

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
  const [step, setStep] = useState<'document' | 'idNumber' | 'biometric' | 'verification' | 'complete'>('document');
  const [documentType, setDocumentType] = useState<'aadhaar' | 'voter'>('aadhaar');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idNumber, setIdNumber] = useState<string>('');
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
  const [biometricData, setBiometricData] = useState<string>('');
  const [voterId, setVoterId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const demoProfiles = {
    aadhaar: {
      name: 'Ravi Sharma',
      idNumber: '1234-5678-9012',
      fileName: 'demo_ravi_aadhaar.jpg'
    },
    voter: {
      name: 'Ravi Sharma',
      idNumber: 'MH1234567',
      fileName: 'demo_ravi_voter.jpg'
    }
  } as const;

  const createDemoDocument = () => {
    const profile = demoProfiles[documentType];
    const documentLabel = documentType === 'aadhaar' ? 'Aadhaar Card' : 'Voter ID Card';
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#f8fafc" />
  <rect x="24" y="24" width="752" height="452" rx="16" fill="#ffffff" stroke="#e2e8f0" />
  <text x="50" y="80" font-family="Arial, sans-serif" font-size="28" fill="#0f172a">${documentLabel} (DEMO)</text>
  <text x="50" y="130" font-family="Arial, sans-serif" font-size="18" fill="#334155">Name: ${profile.name}</text>
  <text x="50" y="165" font-family="Arial, sans-serif" font-size="18" fill="#334155">ID: ${profile.idNumber}</text>
  <rect x="50" y="210" width="140" height="180" fill="#e2e8f0" stroke="#cbd5f5" />
  <text x="70" y="305" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Demo Photo</text>
  <text x="50" y="420" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">For testing only. Not a real government document.</text>
</svg>`;
    const file = new File([svg], profile.fileName, { type: 'image/svg+xml' });

    setIdFile(file);
    setIdNumber(profile.idNumber);
    setError('');
  };

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG) file');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setIdFile(file);
    setError('');
  };

  const processDocument = async () => {
    if (!idFile) {
      setError('Please upload your ID document');
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

      setStep('idNumber');
    } catch (error) {
      setError('Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyIdNumber = async () => {
    if (!idNumber.trim()) {
      setError('Please enter your ID number');
      return;
    }

    if (!idFile) {
      setError('Please upload your ID document first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await VerificationService.verifyUser(documentType, idNumber.trim(), idFile);

      if (result.success && result.user) {
        setVerifiedUser(result.user);
        setStep('biometric');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
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
    if (!currentElection || !verifiedUser) return;

    setIsProcessing(true);
    setError('');

    try {
      // Generate unique voter hash using verification service
      const voterIdHash = await VerificationService.generateVoterHash(verifiedUser, currentElection.id);
      setVoterId(voterIdHash);

      // Save voter registration to blockchain (localStorage for demo)
      const voterRegistration = {
        id: verifiedUser.id,
        name: verifiedUser.name,
        electionId: currentElection.id,
        voterIdHash,
        biometricData,
        documentType,
        idNumber,
        documentFile: idFile?.name,
        registeredAt: new Date()
      };

      const existingRegistrations = JSON.parse(localStorage.getItem('voterRegistrations') || '[]');
      existingRegistrations.push(voterRegistration);
      localStorage.setItem('voterRegistrations', JSON.stringify(existingRegistrations));

      // Store voter ID in session
      localStorage.setItem('currentVoterId', voterIdHash);
      localStorage.setItem('currentElectionId', currentElection.id);
      localStorage.setItem('currentVoterName', verifiedUser.name);

      // Mark this Aadhaar number as having voted (one person one vote)
      if (documentType === 'aadhaar') {
        VerificationService.markVoterAsVoted(idNumber, currentElection.id);
      }

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
            Voting Period: {currentElection.startDate.toLocaleDateString()} {currentElection.startDate.toLocaleTimeString()} - {currentElection.endDate.toLocaleDateString()} {currentElection.endDate.toLocaleTimeString()}
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
              {step === 'document' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="document-type">Document Type *</Label>
                    <Select value={documentType} onValueChange={(value: 'aadhaar' | 'voter') => setDocumentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aadhaar">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Aadhaar Card</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="voter">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Voter ID Card</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="id-upload">{documentType === 'aadhaar' ? 'Aadhaar Card' : 'Voter ID Card'} Image *</Label>
                    <Input
                      ref={fileInputRef}
                      id="id-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload a clear image of your {documentType === 'aadhaar' ? 'Aadhaar Card' : 'Voter ID Card'}
                    </p>
                    {idFile && (
                      <div className="p-2 bg-muted rounded border flex items-center justify-between">
                        <p className="text-sm text-green-600">✓ {idFile.name}</p>
                        {idFile.name.startsWith('demo_') && (
                          <Badge variant="secondary">Demo</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-foreground">Demo Data</div>
                      <Badge variant="outline">DEMO</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use a prebuilt demo {documentType === 'aadhaar' ? 'Aadhaar' : 'Voter ID'} document and ID number.
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <div className="font-medium text-foreground">{demoProfiles[documentType].name}</div>
                      <div>ID: {demoProfiles[documentType].idNumber}</div>
                    </div>
                    <Button type="button" variant="secondary" onClick={createDemoDocument} className="w-full">
                      Use Demo {documentType === 'aadhaar' ? 'Aadhaar' : 'Voter ID'}
                    </Button>
                  </div>

                  <Button
                    onClick={processDocument}
                    disabled={!idFile || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Document...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Process Document
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

              {/* Step 2: ID Number Input */}
              {step === 'idNumber' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Document Processed</h3>
                    <p className="text-muted-foreground mb-6">
                      Please enter your {documentType === 'aadhaar' ? 'Aadhaar' : 'Voter ID'} number for verification
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="id-number">
                      {documentType === 'aadhaar' ? 'Aadhaar Number' : 'Voter ID Number'} *
                    </Label>
                    <Input
                      id="id-number"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder={documentType === 'aadhaar' ? '1234-5678-9012' : 'MH1234567'}
                      className="text-center font-mono"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Enter the {documentType === 'aadhaar' ? '12-digit Aadhaar number' : 'Voter ID number'} exactly as it appears on your document
                    </p>
                  </div>

                  <Button
                    onClick={verifyIdNumber}
                    disabled={!idNumber.trim() || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify Identity
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Step 3: Biometric Verification */}
              {step === 'biometric' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Identity Verified</h3>
                    <p className="text-muted-foreground mb-4">
                      Welcome, <span className="font-semibold text-foreground">{verifiedUser?.name}</span>
                    </p>
                    <div className="p-4 bg-muted rounded border mb-6">
                      <p className="text-sm text-muted-foreground">
                        {documentType === 'aadhaar' ? 'Aadhaar' : 'Voter ID'}: {idNumber}
                      </p>
                    </div>
                  </div>

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
                    <span className="font-semibold text-foreground">{verifiedUser?.name}</span> has been successfully registered for the election.
                  </p>

                  <div className="mb-6 p-4 bg-muted rounded border space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Voter Name:</p>
                      <p className="font-semibold">{verifiedUser?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Document Type:</p>
                      <p className="font-semibold capitalize">{documentType} Card</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ID Number:</p>
                      <p className="font-mono text-sm">{idNumber}</p>
                    </div>
                    {voterId && (
                      <div>
                        <p className="text-sm text-muted-foreground">Voter Hash:</p>
                        <p className="font-mono text-xs break-all">{voterId}</p>
                      </div>
                    )}
                  </div>

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
