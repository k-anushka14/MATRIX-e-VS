export interface BiometricStatus {
    isActive: boolean;
    confidence: number;
    faceDetected: boolean;
    multipleFaces: boolean;
    warning: string | null;
}

export class BiometricService {
    private static videoElement: HTMLVideoElement | null = null;
    private static canvas: HTMLCanvasElement | null = null;
    private static context: CanvasRenderingContext2D | null = null;
    private static stream: MediaStream | null = null;
    private static isMonitoring = false;
    private static monitoringInterval: NodeJS.Timeout | null = null;
    private static onStatusChange: ((status: BiometricStatus) => void) | null = null;

    static async initializeCamera(videoElement: HTMLVideoElement): Promise<boolean> {
        try {
            console.log('Initializing camera with video element:', videoElement);
            
            if (!videoElement) {
                throw new Error('Video element is null or undefined');
            }

            this.videoElement = videoElement;

            // Create canvas for face detection
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');

            if (!this.context) {
                throw new Error('Could not get canvas context');
            }

            // Check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera access not supported in this browser');
            }

            // Try different camera configurations with better quality
            let stream: MediaStream | null = null;

            // First try: High quality configuration
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280, min: 640 },
                        height: { ideal: 720, min: 480 },
                        facingMode: 'user',
                        frameRate: { ideal: 30, min: 15 }
                    }
                });
                console.log('High quality camera config successful');
            } catch (error) {
                console.log('High quality camera config failed, trying standard...');

                // Fallback 1: Standard configuration
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: 640,
                            height: 480,
                            facingMode: 'user'
                        }
                    });
                    console.log('Standard camera config successful');
                } catch (error2) {
                    console.log('Standard camera config failed, trying any video device...');

                    // Fallback 2: Any video device
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({
                            video: true
                        });
                        console.log('Any video device config successful');
                    } catch (error3) {
                        console.log('Any video device failed, trying basic config...');

                        // Fallback 3: Basic configuration
                        try {
                            stream = await navigator.mediaDevices.getUserMedia({
                                video: {
                                    width: { ideal: 320 },
                                    height: { ideal: 240 }
                                }
                            });
                            console.log('Basic camera config successful');
                        } catch (error4) {
                            console.error('All camera configurations failed:', error4);
                            throw error4;
                        }
                    }
                }
            }

            if (!stream) {
                throw new Error('No camera stream available');
            }

            this.stream = stream;
            
            // Set video properties before setting srcObject
            this.videoElement.setAttribute('playsinline', 'true');
            this.videoElement.setAttribute('webkit-playsinline', 'true');
            this.videoElement.muted = true;
            this.videoElement.autoplay = true;
            this.videoElement.controls = false;
            
            // Set the video source
            this.videoElement.srcObject = this.stream;

            return new Promise((resolve) => {
                let resolved = false;
                
                const timeout = setTimeout(() => {
                    if (!resolved) {
                        console.log('Camera initialization timeout, but proceeding...');
                        resolved = true;
                        resolve(true);
                    }
                }, 5000); // 5 second timeout

                const onLoadedMetadata = () => {
                    if (resolved) return;
                    clearTimeout(timeout);
                    
                    console.log('Video metadata loaded, starting playback...');
                    this.videoElement!.play()
                        .then(() => {
                            console.log('Camera initialized successfully');
                            resolved = true;
                            resolve(true);
                        })
                        .catch((playError) => {
                            console.log('Video play failed, but camera stream is available:', playError);
                            resolved = true;
                            resolve(true);
                        });
                };

                const onError = (error: Event) => {
                    if (resolved) return;
                    clearTimeout(timeout);
                    console.log('Video element error:', error);
                    resolved = true;
                    resolve(false);
                };

                const onCanPlay = () => {
                    if (resolved) return;
                    console.log('Video can play, camera ready');
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                };

                const onLoadedData = () => {
                    if (resolved) return;
                    console.log('Video data loaded');
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                };

                // Add event listeners
                this.videoElement.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
                this.videoElement.addEventListener('error', onError, { once: true });
                this.videoElement.addEventListener('canplay', onCanPlay, { once: true });
                this.videoElement.addEventListener('loadeddata', onLoadedData, { once: true });
            });
        } catch (error) {
            console.error('Camera initialization failed:', error);
            return false;
        }
    }

    static startContinuousMonitoring(onStatusChange: (status: BiometricStatus) => void): void {
        if (this.isMonitoring) {
            this.stopContinuousMonitoring();
        }

        this.onStatusChange = onStatusChange;
        this.isMonitoring = true;

        // Start monitoring every 500ms
        this.monitoringInterval = setInterval(() => {
            this.performFaceDetection();
        }, 500);
    }

    static stopContinuousMonitoring(): void {
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.onStatusChange = null;
    }

    static async stopCamera(): Promise<void> {
        this.stopContinuousMonitoring();

        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log('Camera track stopped:', track.label);
            });
            this.stream = null;
        }

        if (this.videoElement) {
            this.videoElement.srcObject = null;
            this.videoElement.pause();
            this.videoElement = null;
        }

        // Clean up canvas
        if (this.canvas) {
            this.canvas = null;
        }
        if (this.context) {
            this.context = null;
        }
    }

    private static performFaceDetection(): void {
        if (!this.videoElement || !this.canvas || !this.context || !this.onStatusChange) {
            return;
        }

        const video = this.videoElement;
        const canvas = this.canvas;
        const context = this.context;

        // Check if video is ready and playing
        if (video.readyState < 2 || video.paused || video.ended) {
            const status: BiometricStatus = {
                isActive: this.isMonitoring,
                confidence: 0,
                faceDetected: false,
                multipleFaces: false,
                warning: 'Camera not ready'
            };
            this.onStatusChange(status);
            return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Simulate face detection (in real implementation, this would use face detection API)
        const faceDetectionResult = this.simulateFaceDetection(canvas);

        // Update status
        const status: BiometricStatus = {
            isActive: this.isMonitoring,
            confidence: faceDetectionResult.confidence,
            faceDetected: faceDetectionResult.faceDetected,
            multipleFaces: faceDetectionResult.multipleFaces,
            warning: faceDetectionResult.warning
        };

        this.onStatusChange(status);
    }

    private static simulateFaceDetection(canvas: HTMLCanvasElement): {
        faceDetected: boolean;
        confidence: number;
        multipleFaces: boolean;
        warning: string | null;
    } {
        // Simulate face detection based on video properties
        // In a real implementation, this would use face detection libraries like face-api.js or MediaPipe

        const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
            return {
                faceDetected: false,
                confidence: 0,
                multipleFaces: false,
                warning: 'Unable to analyze video feed'
            };
        }

        // Simulate different scenarios based on video properties
        const video = this.videoElement!;
        const isVideoPlaying = !video.paused && !video.ended && video.readyState > 2;

        if (!isVideoPlaying) {
            return {
                faceDetected: false,
                confidence: 0,
                multipleFaces: false,
                warning: 'Camera not active'
            };
        }

        // Check if video has proper dimensions (indicates camera is working)
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            return {
                faceDetected: false,
                confidence: 0,
                multipleFaces: false,
                warning: 'Camera not properly initialized'
            };
        }

        // Check if we have a valid video stream
        if (!this.stream || this.stream.getVideoTracks().length === 0) {
            return {
                faceDetected: false,
                confidence: 0,
                multipleFaces: false,
                warning: 'No video stream available'
            };
        }

        // Check if video track is active
        const videoTrack = this.stream.getVideoTracks()[0];
        if (!videoTrack || videoTrack.readyState !== 'live') {
            return {
                faceDetected: false,
                confidence: 0,
                multipleFaces: false,
                warning: 'Video track not active'
            };
        }

        // More realistic face detection simulation
        // In a real implementation, this would use actual face detection algorithms
        const random = Math.random();

        // Check if camera is working properly by analyzing image data
        const hasValidImageData = imageData.data.some(pixel => pixel !== 0);
        
        if (!hasValidImageData) {
            return {
                faceDetected: false,
                confidence: 0,
                multipleFaces: false,
                warning: 'Camera feed appears to be blank or not working'
            };
        }

        // Simulate face detection with more realistic patterns
        if (random < 0.01) {
            // 1% chance of no face detected
            return {
                faceDetected: false,
                confidence: 0.2 + Math.random() * 0.3, // 0.2 to 0.5
                multipleFaces: false,
                warning: 'No face detected. Please position yourself in front of the camera.'
            };
        } else if (random < 0.015) {
            // 0.5% chance of multiple faces
            return {
                faceDetected: true,
                confidence: 0.6 + Math.random() * 0.2, // 0.6 to 0.8
                multipleFaces: true,
                warning: 'Multiple faces detected. Please ensure only you are visible in the camera.'
            };
        } else if (random < 0.03) {
            // 1.5% chance of low confidence
            return {
                faceDetected: true,
                confidence: 0.5 + Math.random() * 0.2, // 0.5 to 0.7
                multipleFaces: false,
                warning: 'Face detection confidence is low. Please ensure good lighting and clear view.'
            };
        } else {
            // 97.5% chance of good detection
            return {
                faceDetected: true,
                confidence: 0.75 + Math.random() * 0.25, // 0.75 to 1.0
                multipleFaces: false,
                warning: null
            };
        }
    }

    static getCurrentStatus(): BiometricStatus {
        return {
            isActive: this.isMonitoring,
            confidence: 0,
            faceDetected: false,
            multipleFaces: false,
            warning: this.isMonitoring ? null : 'Monitoring not active'
        };
    }

    static async checkCameraAvailability(): Promise<boolean> {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return false;
            }

            // Check if we can enumerate devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length === 0) {
                return false;
            }

            // Try to get a test stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            
            return true;
        } catch (error) {
            console.log('Camera availability check failed:', error);
            return false;
        }
    }
}
