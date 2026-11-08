import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal.jsx';
import { showcaseService } from '../services/showcaseService.js';
import {
  Upload,
  Video,
  Camera,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

export const SHOWCASE_CATEGORIES = [
  { name: 'Self Introduction', limit: '90 seconds', maxSec: 90 },
  { name: 'Public Speaking', limit: '2 minutes', maxSec: 120 },
  { name: 'Presentation Skills', limit: '2 minutes', maxSec: 120 },
  { name: 'Technical Explanation', limit: '2 minutes', maxSec: 120 },
  { name: 'Group Discussion', limit: '2 minutes', maxSec: 120 },
  { name: 'Project Demonstration', limit: '5 minutes', maxSec: 300 },
  { name: 'Leadership & Team Coordination', limit: '2 minutes', maxSec: 120 },
  { name: 'Creative Talent', limit: '3 minutes', maxSec: 180 },
  { name: 'Problem Solving', limit: '2 minutes', maxSec: 120 },
  { name: 'Language Skills', limit: '2 minutes', maxSec: 120 },
];

export default function ShowcaseUploadModal({
  isOpen,
  onClose,
  onSuccess,
  currentVideoCount = 0,
}) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'record'

  // Video metadata
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Self Introduction');
  const [description, setDescription] = useState('');
  const [skillTags, setSkillTags] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [hasConsent, setHasConsent] = useState(false);

  // File & recording states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [detectedDuration, setDetectedDuration] = useState(0);

  // Camera / MediaRecorder states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Submission state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const liveVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Clean up media streams and object URLs
  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsCameraReady(false);
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const handleModalClose = () => {
    stopLiveCamera();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setSelectedFile(null);
    setErrorMessage('');
    onClose();
  };

  // Start live webcam for recording
  const handleStartCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }
      setIsCameraReady(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera and microphone. Please check browser permissions.');
    }
  };

  // Start recording
  const handleStartRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    setRecordingSeconds(0);

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `recorded-showcase-${Date.now()}.${ext}`, {
        type: mimeType,
      });
      setSelectedFile(file);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setDetectedDuration(recordingSeconds);
      stopLiveCamera();
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  // Handle file selection from local device
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');

    // Check size (max 50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('Video file exceeds 50 MB limit. Please select a smaller video.');
      return;
    }

    // Check type
    const validTypes = ['video/mp4', 'video/webm'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(file.type) && ext !== 'mp4' && ext !== 'webm') {
      setErrorMessage('Unsupported format. Please upload an MP4 or WebM video file.');
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);

    // Read duration from video element
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setDetectedDuration(Math.round(tempVideo.duration) || 60);
    };
  };

  // Clear preview and re-record / re-upload
  const handleResetVideo = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setSelectedFile(null);
    setDetectedDuration(0);
    if (mode === 'record') {
      handleStartCamera();
    }
  };

  // Submit video to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentVideoCount >= 6) {
      setErrorMessage('You have already reached the maximum limit of 6 showcase videos.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please select or record a video first.');
      return;
    }

    if (!title || title.trim().length < 3) {
      setErrorMessage('Please provide a title with at least 3 characters.');
      return;
    }

    if (!hasConsent) {
      setErrorMessage('Please confirm consent before publishing your video demonstration.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('duration', detectedDuration || 60);
      formData.append('visibility', visibility);
      formData.append('skillTags', skillTags.trim());

      const res = await showcaseService.uploadVideo(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      if (res.success) {
        onSuccess && onSuccess(res.data);
        handleModalClose();
      }
    } catch (err) {
      console.error('Showcase upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload showcase video.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const selectedCategoryMeta = SHOWCASE_CATEGORIES.find((c) => c.name === category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Upload Showcase Video — Beyond Skills"
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} className="showcase-modal-form">
        {/* Category & Limit Notice Banner */}
        <div className="limit-notice-banner">
          <Sparkles size={16} className="banner-icon" />
          <div className="banner-text">
            <strong>Beyond Skills — Talent & Communication Showcase</strong>
            <p>
              Upload up to 6 video demonstrations. Suggested duration for {category}:{' '}
              <b>{selectedCategoryMeta?.limit || '2 minutes'}</b> (Max file size: 50 MB).
            </p>
          </div>
          <span className="count-badge">{currentVideoCount}/6 Videos</span>
        </div>

        {errorMessage && (
          <div className="error-banner">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Mode Selection (Upload vs Record) */}
        {!previewUrl && (
          <div className="mode-toggle-bar">
            <button
              type="button"
              className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => {
                stopLiveCamera();
                setMode('upload');
              }}
            >
              <Upload size={15} /> Upload from Device
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'record' ? 'active' : ''}`}
              onClick={() => {
                setMode('record');
                handleStartCamera();
              }}
            >
              <Camera size={15} /> Record with Camera
            </button>
          </div>
        )}

        {/* Video Input: Upload from Device */}
        {mode === 'upload' && !previewUrl && (
          <div className="file-drop-area">
            <Upload size={32} className="drop-icon" />
            <h4 className="drop-title">Select video file from your computer</h4>
            <p className="drop-sub">Supports MP4 and WebM (Max: 50 MB)</p>
            <label className="btn btn-secondary upload-file-btn">
              Browse Files
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}

        {/* Video Input: Camera Recorder */}
        {mode === 'record' && !previewUrl && (
          <div className="camera-recorder-wrap">
            <div className="camera-screen">
              <video
                ref={liveVideoRef}
                autoPlay
                playsInline
                muted
                className="live-camera-video"
              />
              {!isCameraReady && !cameraError && (
                <div className="camera-placeholder">
                  <Camera size={36} />
                  <span>Requesting camera permission...</span>
                </div>
              )}
              {cameraError && (
                <div className="camera-placeholder camera-error">
                  <AlertCircle size={32} />
                  <span>{cameraError}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleStartCamera}
                  >
                    Retry Permission
                  </button>
                </div>
              )}

              {isRecording && (
                <div className="recording-indicator">
                  <span className="rec-dot"></span>
                  <span className="rec-timer">
                    REC {Math.floor(recordingSeconds / 60)}:
                    {(recordingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            <div className="recorder-controls">
              {!isRecording ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartRecording}
                  disabled={!isCameraReady}
                >
                  <Play size={15} /> Start Recording
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-recording-stop"
                  onClick={handleStopRecording}
                >
                  <Square size={15} /> Stop Recording
                </button>
              )}
            </div>
          </div>
        )}

        {/* Video Preview Section (Preview before publishing) */}
        {previewUrl && (
          <div className="video-preview-box">
            <div className="preview-header">
              <span className="preview-label">
                <CheckCircle size={14} className="check-icon" /> Video Ready for Preview
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetVideo}
              >
                <RefreshCw size={12} /> Replace / Retake Video
              </button>
            </div>
            <div className="preview-viewport">
              <video src={previewUrl} controls className="preview-video-element" />
            </div>
          </div>
        )}

        {/* Step 2: Metadata Fields */}
        <div className="form-fields-grid">
          <div className="input-group">
            <label className="input-label">Video Title *</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Explaining Distributed Consensus Algorithm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={120}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Showcase Category *</label>
            <select
              className="input-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {SHOWCASE_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} (Suggested: {c.limit})
                </option>
              ))}
            </select>
          </div>

          <div className="input-group full-width">
            <label className="input-label">Short Description</label>
            <textarea
              className="input-control"
              rows={2}
              placeholder="Brief overview of what this demonstration illustrates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={400}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Skill Tags (comma separated)</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Distributed Systems, Public Speaking, React"
              value={skillTags}
              onChange={(e) => setSkillTags(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Visibility & Privacy *</label>
            <select
              className="input-control"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="PUBLIC">Public — All authenticated G-CIRCLE students</option>
              <option value="TEAM_ONLY">Team Only — Current team members</option>
              <option value="PRIVATE">Private — Only visible to me</option>
            </select>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="consent-checkbox-wrap">
          <label className="consent-label">
            <input
              type="checkbox"
              checked={hasConsent}
              onChange={(e) => setHasConsent(e.target.checked)}
            />
            <span>
              I confirm this video is an authentic personal demonstration of my skills and communication ability for university academic collaboration. I understand viewers will independently evaluate suitability without automated scoring.
            </span>
          </label>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="upload-progress-wrap">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">Uploading video... {uploadProgress}%</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleModalClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading || !selectedFile || !title.trim() || !hasConsent}
          >
            {uploading ? 'Publishing...' : 'Publish Showcase Video'}
          </button>
        </div>
      </form>

      <style>{`
        .showcase-modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .limit-notice-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          padding: 10px 14px;
        }

        .banner-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .banner-text {
          flex: 1;
        }

        .banner-text strong {
          display: block;
          font-size: 13px;
          color: var(--burgundy-900);
        }

        .banner-text p {
          font-size: 11.5px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .count-badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-primary);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-strong);
          padding: 3px 8px;
          border-radius: var(--radius-full);
          white-space: nowrap;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--burgundy-100);
          border: 1px solid var(--accent-primary);
          color: var(--burgundy-900);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          font-size: 12.5px;
        }

        .mode-toggle-bar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .mode-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .mode-btn:hover {
          background-color: var(--bg-surface-accent);
          border-color: var(--border-strong);
        }

        .mode-btn.active {
          background-color: var(--burgundy-50);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .file-drop-area {
          border: 2px dashed var(--border-strong);
          border-radius: var(--radius-lg);
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-surface-accent);
          text-align: center;
        }

        .drop-icon {
          color: var(--accent-primary);
          margin-bottom: 8px;
        }

        .drop-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .drop-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 14px;
        }

        .upload-file-btn {
          cursor: pointer;
        }

        .camera-recorder-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .camera-screen {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .live-camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .camera-placeholder {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--ivory-100);
          font-size: 13px;
        }

        .camera-error {
          color: #fca5a5;
        }

        .recording-indicator {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.75);
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }

        .rec-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ef4444;
          animation: pulse 1s infinite alternate;
        }

        @keyframes pulse {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        .rec-timer {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          font-family: monospace;
        }

        .recorder-controls {
          display: flex;
          justify-content: center;
        }

        .btn-recording-stop {
          background-color: #991b1b !important;
          border-color: #7f1d1d !important;
        }

        .video-preview-box {
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          padding: 12px;
          background-color: var(--bg-surface-accent);
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .preview-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--accent-primary);
        }

        .check-icon {
          color: var(--accent-primary);
        }

        .preview-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .preview-video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .form-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .consent-checkbox-wrap {
          background-color: var(--bg-surface-accent);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 10px 14px;
        }

        .consent-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.45;
          cursor: pointer;
        }

        .consent-label input[type="checkbox"] {
          margin-top: 3px;
          accent-color: var(--accent-primary);
        }

        .upload-progress-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-bar-track {
          width: 100%;
          height: 8px;
          background-color: var(--border-subtle);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--burgundy-700), var(--accent-primary));
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 11.5px;
          color: var(--text-muted);
          text-align: right;
        }
      `}</style>
    </Modal>
  );
}
