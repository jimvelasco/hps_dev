import React, { useState, useRef, useEffect } from 'react';
import axios from '../services/api';
import ModalAlert from './ModalAlert';

export default function PlateLookup({ isOpen, onClose, onPlateDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
     // console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure you have given permission.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image as a base64 string
    const imageData = canvas.toDataURL('image/jpeg');

    setIsLoading(true);
    stopCamera();

    try {
      const response = await axios.post('/vehicles/lookup-plate', { image: imageData });
      onPlateDetected(response.data);
      onClose();
    } catch (err) {
    //  console.log('WE HAVE A REPSONSE ERROR.  SHOULD SHOW MODAL', err);
      setModal({
        isOpen: true,
        type: 'alert',
        title: 'Plate Recognition Error',
        message: err.message || 'Failed to recognize plate. Please try again.',
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          startCamera();
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalStyles = `
    .plate-lookup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999;
      /* z-index: 2000 modal alert is 1000 */
      padding: 20px;
    }
    .plate-lookup-content {
      background-color: #fff;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 100%;
      position: relative;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .video-container {
      width: 100%;
      aspect-ratio: 4/3;
      background-color: #000;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
      position: relative;
    }
    .video-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .scan-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 40%;
      border: 2px solid #00ff00;
      box-shadow: 0 0 0 4000px rgba(0,0,0,0.3);
      pointer-events: none;
    }
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{modalStyles}</style>
      <div className="plate-lookup-overlay">
        <div className="plate-lookup-content">
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            Plate Recognition
          </h2>
          
          <div className="video-container">
            {isLoading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Processing Plate...</p>
              </div>
            )}
            {error ? (
              <div style={{ padding: '20px', color: '#d32f2f', textAlign: 'center' }}>
                {error}
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="video-preview"
                />
                <div className="scan-overlay"></div>
              </>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={handleCapture}
              disabled={isLoading || error}
              style={{ padding: '12px 24px', minWidth: '120px' }}
            >
              Take Photo
            </button>
            <button 
              className="btn btn-cancel"
              onClick={onClose}
              disabled={isLoading}
              style={{ padding: '12px 24px', minWidth: '120px' }}
            >
              Cancel
            </button>
          </div>
          
          <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '15px' }}>
            Position the license plate within the green rectangle
          </p>
        </div>
      </div>

      <ModalAlert
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
      />
    </>
  );
}
