import usersData from '../data/users.json';

export interface User {
    id: number;
    name: string;
    aadhaar: {
        id_number: string;
        photo: string;
    };
    voter: {
        id_number: string;
        photo: string;
    };
    verification_status: 'verified' | 'not_verified';
}

export interface VerificationResult {
    success: boolean;
    user?: User;
    message: string;
    documentType?: 'aadhaar' | 'voter';
}

export class VerificationService {
    private static users: User[] = usersData.users;

    static async verifyUser(
        documentType: 'aadhaar' | 'voter',
        idNumber: string,
        uploadedImage: File
    ): Promise<VerificationResult> {
        try {
            // Find user by ID number
            const user = this.users.find(u => {
                if (documentType === 'aadhaar') {
                    return u.aadhaar.id_number === idNumber;
                } else {
                    return u.voter.id_number === idNumber;
                }
            });

            if (!user) {
                return {
                    success: false,
                    message: 'User not found in database. Please check your ID number.'
                };
            }

            // Check verification status
            if (user.verification_status !== 'verified') {
                return {
                    success: false,
                    message: 'User verification status is not verified. Please contact administrator.'
                };
            }

            // Check if this Aadhaar number has already voted in any election
            const hasAlreadyVoted = this.checkIfAlreadyVoted(user.aadhaar.id_number);
            if (hasAlreadyVoted) {
                return {
                    success: false,
                    message: 'This Aadhaar number has already voted. One person can only vote once.'
                };
            }

            // Simulate face matching (in real implementation, this would use face recognition API)
            const faceMatchResult = await this.simulateFaceMatching(uploadedImage, user, documentType);

            if (!faceMatchResult.success) {
                return {
                    success: false,
                    message: 'Face does not match the document. Please ensure you are the person in the document.'
                };
            }

            return {
                success: true,
                user,
                message: 'Verification successful!',
                documentType
            };

        } catch (error) {
            return {
                success: false,
                message: 'Verification failed. Please try again.'
            };
        }
    }

    private static checkIfAlreadyVoted(aadhaarNumber: string): boolean {
        try {
            // Check if this Aadhaar number has already voted using the new system
            return this.checkIfAadhaarVoted(aadhaarNumber);
        } catch (error) {
            console.error('Error checking if already voted:', error);
            return false;
        }
    }

    private static async simulateFaceMatching(
        uploadedImage: File,
        user: User,
        documentType: 'aadhaar' | 'voter'
    ): Promise<{ success: boolean; confidence?: number }> {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get expected image path
        const expectedImagePath = documentType === 'aadhaar'
            ? user.aadhaar.photo
            : user.voter.photo;

        // Simulate face matching logic
        // In a real implementation, this would:
        // 1. Extract face from uploaded image
        // 2. Extract face from expected image
        // 3. Compare faces using face recognition algorithms
        // 4. Return confidence score

        // For demo purposes, we'll simulate different scenarios based on image names
        const uploadedFileName = uploadedImage.name.toLowerCase();
        const expectedFileName = expectedImagePath.toLowerCase();

        // Check if the uploaded file matches the expected pattern
        const userFirstName = user.name.split(' ')[0].toLowerCase();

        if (uploadedFileName.includes(userFirstName) &&
            uploadedFileName.includes(documentType) &&
            !uploadedFileName.includes('wrong') &&
            !uploadedFileName.includes('mismatch')) {
            return { success: true, confidence: 0.95 };
        }

        return { success: false, confidence: 0.2 };
    }

    static getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    static getAllUsers(): User[] {
        return this.users;
    }

    static async generateVoterHash(user: User, electionId: string): Promise<string> {
        // Generate a unique voter hash based on user data and election
        const data = `${user.id}-${user.name}-${electionId}-${Date.now()}`;
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static markVoterAsVoted(aadhaarNumber: string, electionId: string): void {
        try {
            // Mark this Aadhaar number as having voted
            const votedAadhaars = JSON.parse(localStorage.getItem('votedAadhaars') || '[]');
            const voteRecord = {
                aadhaarNumber,
                electionId,
                votedAt: new Date().toISOString()
            };

            votedAadhaars.push(voteRecord);
            localStorage.setItem('votedAadhaars', JSON.stringify(votedAadhaars));
        } catch (error) {
            console.error('Error marking voter as voted:', error);
        }
    }

    static checkIfAadhaarVoted(aadhaarNumber: string): boolean {
        try {
            const votedAadhaars = JSON.parse(localStorage.getItem('votedAadhaars') || '[]');
            return votedAadhaars.some((record: any) => record.aadhaarNumber === aadhaarNumber);
        } catch (error) {
            console.error('Error checking if Aadhaar voted:', error);
            return false;
        }
    }
}
