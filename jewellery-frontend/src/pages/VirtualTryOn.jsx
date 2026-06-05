import { useState, useRef } from 'react'
import './VirtualTryOn.css'

function VirtualTryOn() {
  const [cameraActive, setCameraActive] = useState(false)
  const [mode, setMode] = useState('camera')
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [captured, setCaptured] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
        setMode('camera')
        setUploadedPhoto(null)
        setCaptured(false)
      }
    } catch (err) {
      alert('Could not access camera. Please allow camera permission and try again.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    setUploadedPhoto(dataUrl)
    setCaptured(true)
    stopCamera()
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedPhoto(ev.target.result)
      setCaptured(true)
      stopCamera()
      setCameraActive(false)
    }
    reader.readAsDataURL(file)
  }

  const handleReset = () => {
    setUploadedPhoto(null)
    setCaptured(false)
    setCameraActive(false)
  }

  return (
    <div className="vt-page">
      <div className="vt-container">

        <div className="vt-header">
          <p className="vt-title">Virtual Try-On</p>
          <p className="vt-sub">See how our jewelry looks on you before you buy</p>
        </div>

        <div className="vt-layout">

          <div className="vt-left">
            <div className="vt-viewer">
              <div className="vt-corner tl" />
              <div className="vt-corner tr" />
              <div className="vt-corner bl" />
              <div className="vt-corner br" />

              {!cameraActive && !uploadedPhoto && (
                <div className="vt-placeholder">
                  <div className="vt-camera-icon">◎</div>
                  <p className="vt-placeholder-text">Enable camera to try on</p>
                  <button className="vt-start-btn" onClick={enableCamera}>
                    Enable Camera
                  </button>
                </div>
              )}

              {cameraActive && !captured && (
                <video ref={videoRef} className="vt-video" autoPlay playsInline muted />
              )}

              {uploadedPhoto && (
                <img src={uploadedPhoto} alt="Try on preview" className="vt-preview-img" />
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div className="vt-controls">
              <button
                className={`vt-ctrl-btn ${mode === 'camera' && !captured ? 'active' : ''}`}
                onClick={enableCamera}
              >
                Front Camera
              </button>
              <button
                className="vt-ctrl-btn"
                onClick={() => fileInputRef.current.click()}
              >
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUpload}
              />
              {cameraActive && (
                <button className="vt-ctrl-btn" onClick={capturePhoto}>
                  Capture
                </button>
              )}
              {captured && (
                <button className="vt-ctrl-btn" onClick={handleReset}>
                  Retake
                </button>
              )}
            </div>
          </div>

          <div className="vt-right">
            <p className="panel-title">How It Works</p>

            <div className="vt-steps">
              <div className="step-item">
                <div className="step-num">1</div>
                <div className="step-info">
                  <p className="step-name">Upload or take a photo</p>
                  <p className="step-desc">Upload a portrait photo or use your camera to take one in real time.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">2</div>
                <div className="step-info">
                  <p className="step-name">Face detection check</p>
                  <p className="step-desc">Our system detects your face and maps key points for accurate placement.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">3</div>
                <div className="step-info">
                  <p className="step-name">Select item to try on</p>
                  <p className="step-desc">Browse and pick any jewelry piece from our collection to overlay on your photo.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">4</div>
                <div className="step-info">
                  <p className="step-name">Preview</p>
                  <p className="step-desc">See how the piece looks on you and add it to your cart if you love it.</p>
                </div>
              </div>
            </div>

            <hr className="vt-divider" />

            <div className="tip-box">
              <p className="tip-title">Tips for best results</p>
              <p className="tip-text">Use good lighting and hold your hand or face steady for the most accurate try-on experience.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default VirtualTryOn