"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";

interface CameraAttachmentProps {
  isCameraActive: boolean;
  setIsCameraActive: (active: boolean) => void;
  isPhotoCaptured: boolean;
  setIsPhotoCaptured: (captured: boolean) => void;
  capturedPhoto: string | null;
  setCapturedPhoto: (photo: string | null) => void;
  isVideoReady: boolean;
  setIsVideoReady: (ready: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
}

const CameraAttachment: React.FC<CameraAttachmentProps> = ({
  isCameraActive,
  setIsCameraActive,
  isPhotoCaptured,
  setIsPhotoCaptured,
  capturedPhoto,
  setCapturedPhoto,
  isVideoReady,
  setIsVideoReady,
  videoRef,
  canvasRef,
  mediaStreamRef,
}) => {
  const { showAlert } = useAppContext();

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
    setIsCameraActive(false);
    setIsVideoReady(false);
  }, [mediaStreamRef, videoRef, setIsCameraActive, setIsVideoReady]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setIsVideoReady(true); // Set to true here, as metadata is loaded and video is ready for capture
      videoRef.current.play().then(() => {
        // Video started playing successfully
      }).catch(e => {
        console.error("Error playing video:", e);
        showAlert('Video playback failed, but camera might still be active for capture.', 'info');
      });
    }
  }, [videoRef, setIsVideoReady, showAlert]);

  const startCamera = async () => {
    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
      setIsCameraActive(true);
      setIsPhotoCaptured(false);
      // isVideoReady will be set by handleLoadedMetadata
    } catch (error) {
      console.error('Error accessing camera:', error);
      showAlert('Unable to access camera. Please check browser permissions and ensure no other application is using the camera.', 'error');
      setIsCameraActive(false); // Ensure camera is not active if it fails
      setIsVideoReady(false); // Ensure video is not ready if it fails
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && isVideoReady) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Determine the size for a square crop
      const size = Math.min(videoWidth, videoHeight);

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Calculate source x, y to center the square crop
        const sx = (videoWidth - size) / 2;
        const sy = (videoHeight - size) / 2;

        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size); // Draw cropped square
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoData);
        setIsPhotoCaptured(true);
        stopCamera();
      }
    } else {
      showAlert('Camera not ready or elements not found for capture.', 'error');
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setIsPhotoCaptured(false);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-center bg-gray-50 dark:bg-gray-800">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">📸 Attach Photo (Optional)</h4>
      {isCameraActive && (
        <video ref={videoRef} className="w-full max-w-sm aspect-square object-contain rounded-lg shadow-md mb-4 mx-auto border border-gray-300 dark:border-gray-600" autoPlay playsInline></video>
      )}
      {isPhotoCaptured && capturedPhoto && (
        <img src={capturedPhoto} className="w-full max-w-sm aspect-square object-cover rounded-lg shadow-md mb-4 mx-auto border border-gray-300 dark:border-gray-600" alt="Captured" />
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="flex justify-center gap-3 flex-wrap">
        {!isCameraActive && !isPhotoCaptured && (
          <Button type="button" variant="secondary" onClick={startCamera}>
            📷 Start Camera
          </Button>
        )}
        {isCameraActive && (
          <Button type="button" onClick={capturePhoto} disabled={!isVideoReady}>
            📸 Capture
          </Button>
        )}
        {isPhotoCaptured && (
          <Button type="button" variant="secondary" onClick={retakePhoto}>
            🔄 Retake
          </Button>
        )}
      </div>
    </div>
  );
};

export default CameraAttachment;