import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

export interface ProctoringDetection {
  facesCount: number;
  lookingAway: boolean;
  suspiciousMovement: boolean;
  isMuted: boolean;
  phoneDetected: boolean;
  confidence: number;
  timestamp: number;
}

export class ProctoringService {
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private lastEyePosition: { x: number; y: number } | null = null;
  private movementHistory: number[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    await tf.ready();
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig = {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
      refineLandmarks: true
    };
    this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    this.isInitialized = true;
    console.log('Proctoring Service Initialized');
  }

  async runDetection(videoElement: HTMLVideoElement): Promise<ProctoringDetection> {
    if (!this.detector) {
      return { facesCount: 0, lookingAway: false, suspiciousMovement: false, isMuted: false, phoneDetected: false, confidence: 0, timestamp: Date.now() };
    }

    const faces = await this.detector.estimateFaces(videoElement);
    
    // Multiple face detection
    const facesCount = faces.length;

    let lookingAway = false;
    let suspiciousMovement = false;

    if (facesCount === 1) {
      const face = faces[0];
      const keypoints = face.keypoints;

      // Eye tracking (simplified: check if pupils are significantly off-center)
      // MediaPipe refinement adds specific iris keypoints
      const leftIris = keypoints.filter(k => k.name === 'leftIris')[0];
      const rightIris = keypoints.filter(k => k.name === 'rightIris')[0];
      
      if (leftIris && rightIris) {
        // Simple logic: if iris is too far from center of eye bounds
        // In a real prod app, you'd calculate head pose vs gaze vector
        // Here we use a heuristic based on iris position relative to eye corners
        const leftEyeLeft = keypoints.filter(k => k.name === 'leftEye')[0];
        const leftEyeRight = keypoints.filter(k => k.name === 'leftEye')[1]; // This is simplified
        
        // For now, let's use a distance-based history check
        const currentPos = { x: (leftIris.x + rightIris.x) / 2, y: (leftIris.y + rightIris.y) / 2 };
        if (this.lastEyePosition) {
          const dist = Math.sqrt(Math.pow(currentPos.x - this.lastEyePosition.x, 2) + Math.pow(currentPos.y - this.lastEyePosition.y, 2));
          this.movementHistory.push(dist);
          if (this.movementHistory.length > 30) this.movementHistory.shift();
          
          const avgMovement = this.movementHistory.reduce((a, b) => a + b, 0) / this.movementHistory.length;
          if (avgMovement > 5) suspiciousMovement = true; // High jitter
        }
        this.lastEyePosition = currentPos;
      }

      // Detect if user looks away (head rotation check)
      // Check distance between left and right side of face to detect profile view
      const leftCheek = keypoints.find(k => k.name === 'leftCheek');
      const rightCheek = keypoints.find(k => k.name === 'rightCheek');
      if (leftCheek && rightCheek) {
        const cheekDist = Math.abs(leftCheek.x - rightCheek.x);
        if (cheekDist < videoElement.videoWidth * 0.1) {
            lookingAway = true; // User turned side
        }
      }
    }

    return {
      facesCount,
      lookingAway,
      suspiciousMovement,
      isMuted: false, // Set externally from audio context analyzer
      phoneDetected: false, // Requires object detection model
      confidence: facesCount > 0 ? (faces[0] as any).box?.score || (faces[0] as any).score || 1 : 0,
      timestamp: Date.now()
    };
  }
}

export const proctoring = new ProctoringService();
