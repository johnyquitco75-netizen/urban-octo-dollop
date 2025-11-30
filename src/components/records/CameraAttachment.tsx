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
      videoRef.current.play().then(() => {
        setIsVideoReady(true);
      }).catch(e => console.error("Error playing video:", e));
    }
  }, [videoRef, setIsVideoReady]);

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
      setIsVideoReady(false);
    } catch (error) {
      console.error('Error accessing camera:', error);
      showAlert('Unable to access camera. Please check browser permissions and ensure no other application is using the camera.', 'error');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && isVideoReady) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
        <video ref={videoRef} className="w-full max-h-80 object-cover rounded-lg shadow-md mb-4" autoPlay playsInline></video>
      )}
      {isPhotoCaptured && capturedPhoto && (
        <img src={capturedPhoto} className="w-full max-h-80 object-cover rounded-lg shadow-md mb-4" alt="Captured" />
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