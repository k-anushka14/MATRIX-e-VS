import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, AlertTriangle, CheckCircle } from 'lucide-react';

const CameraTest = () => {
  const [cameraStatus, setCameraStatus] = useState<string>('Not initialized');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      setError(null);
      setCameraStatus('Requesting camera access...');

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        }
      });

      setStream(mediaStream);
      setCameraStatus('Camera access granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().then(() => {
          setCameraStatus('Camera is working!');
        }).catch((playError) => {
          setError(`Video play failed: ${playError.message}`);
          setCameraStatus('Camera access granted but video failed to play');
        });
      } else {
        setError('Video element not found');
        setCameraStatus('Camera access granted but video element not available');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setCameraStatus('Camera access failed');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus('Camera stopped');
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Camera Test Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Camera Controls</h3>
                <div className="space-y-2">
                  <Button onClick={startCamera} disabled={!!stream}>
                    Start Camera
                  </Button>
                  <Button onClick={stopCamera} variant="outline" disabled={!stream}>
                    Stop Camera
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Status:</h4>
                  <div className="flex items-center gap-2">
                    {cameraStatus === 'Camera is working!' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-sm">{cameraStatus}</span>
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Camera Feed</h3>
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-64 object-cover rounded-lg border-2 border-primary/20 bg-black"
                    style={{
                      transform: 'scaleX(-1)', // Mirror the video
                    }}
                  />
                  {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No camera feed</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Troubleshooting Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Make sure your camera is connected and not being used by another application</li>
                <li>• Check browser permissions for camera access</li>
                <li>• Try refreshing the page if camera doesn't start</li>
                <li>• Make sure you're using HTTPS (required for camera access)</li>
                <li>• Try a different browser if the issue persists</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CameraTest;

