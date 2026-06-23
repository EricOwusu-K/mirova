import { useState, useRef, useEffect } from 'react'
import * as faceapi from 'face-api.js'
import './VirtualTryOn.css'
import { getProducts } from '../api'

function VirtualTryOn() {
  const [cameraActive, setCameraActive] = useState(false)
  const [mode, setMode] = useState('camera')
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [captured, setCaptured] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultImage, setResultImage] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [faceNotFound, setFaceNotFound] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const resultCanvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Load face-api models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        setModelsLoaded(true)
      } catch (err) {
        console.error('Failed to load face detection models:', err)
      }
    }
    loadModels()
  }, [])

  // Fetch jewellery products that have try-on images
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts()
        const tryOnable = data.filter(p => p.images && p.images.length > 0)
        setProducts(tryOnable)
        if (tryOnable.length > 0) setSelectedProduct(tryOnable[0])
      } catch (err) {
        console.error('Failed to fetch products:', err)
      }
    }
    fetchProducts()
  }, [])

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
        setResultImage(null)
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
      setResultImage(null)
    }
    reader.readAsDataURL(file)
  }

  const handleReset = () => {
    setUploadedPhoto(null)
    setCaptured(false)
    setCameraActive(false)
    setResultImage(null)
    setFaceNotFound(false)
  }

  // Core try-on logic: detect face, calculate landmark positions, overlay jewellery
  const processTryOn = async () => {
    if (!uploadedPhoto || !selectedProduct || !modelsLoaded) return

    setProcessing(true)
    setFaceNotFound(false)

    try {
      const img = await faceapi.bufferToImage(await (await fetch(uploadedPhoto)).blob())

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()

      if (!detection) {
        setFaceNotFound(true)
        setProcessing(false)
        return
      }

      const canvas = resultCanvasRef.current
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const landmarks = detection.landmarks
      const jaw = landmarks.getJawOutline()
      const leftEye = landmarks.getLeftEye()
      const rightEye = landmarks.getRightEye()
      const nose = landmarks.getNose()

      const jewelryImg = new Image()
      jewelryImg.crossOrigin = 'anonymous'
      jewelryImg.src = selectedProduct.images[0]

      jewelryImg.onload = () => {
        if (selectedProduct.category === 'Necklaces') {
          // Position below jawline, centered
          const chinPoint = jaw[8]
          const jawWidth = Math.hypot(jaw[2].x - jaw[14].x, jaw[2].y - jaw[14].y)
          const w = jawWidth * 1.1
          const h = w * (jewelryImg.height / jewelryImg.width)
          ctx.drawImage(jewelryImg, chinPoint.x - w / 2, chinPoint.y + 5, w, h)

        } else if (selectedProduct.category === 'Earrings') {
          // Position at ear region (estimated from jaw outline edges)
          const earSize = Math.hypot(jaw[0].x - jaw[1].x, jaw[0].y - jaw[1].y) * 2.2
          const leftEar = jaw[0]
          const rightEar = jaw[16]
          ctx.drawImage(jewelryImg, leftEar.x - earSize / 2, leftEar.y, earSize, earSize * (jewelryImg.height / jewelryImg.width))
          ctx.drawImage(jewelryImg, rightEar.x - earSize / 2, rightEar.y, earSize, earSize * (jewelryImg.height / jewelryImg.width))

        } else if (selectedProduct.category === 'Sunglasses') {
          // Position over eye region
          const leftEyeCenter = leftEye[0]
          const rightEyeCenter = rightEye[3]
          const eyeWidth = Math.hypot(rightEyeCenter.x - leftEyeCenter.x, rightEyeCenter.y - leftEyeCenter.y)
          const w = eyeWidth * 2.2
          const h = w * (jewelryImg.height / jewelryImg.width)
          const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2
          const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2
          ctx.drawImage(jewelryImg, centerX - w / 2, centerY - h / 2, w, h)

        } else {
          // Rings/Bracelets fallback - just show jewelry in corner as preview
          const w = 100
          const h = w * (jewelryImg.height / jewelryImg.width)
          ctx.drawImage(jewelryImg, canvas.width - w - 20, canvas.height - h - 20, w, h)
        }

        setResultImage(canvas.toDataURL('image/png'))
        setProcessing(false)
      }

      jewelryImg.onerror = () => {
        console.error('Failed to load jewelry image')
        setProcessing(false)
      }

    } catch (err) {
      console.error('Try-on processing failed:', err)
      setProcessing(false)
    }
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

              {uploadedPhoto && !resultImage && (
                <img src={uploadedPhoto} alt="Try on preview" className="vt-preview-img" />
              )}

              {resultImage && (
                <img src={resultImage} alt="Try on result" className="vt-preview-img" />
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <canvas ref={resultCanvasRef} style={{ display: 'none' }} />
            </div>

            <div className="vt-controls">
              <button
                className={`vt-ctrl-btn ${mode === 'camera' && !captured ? 'active' : ''}`}
                onClick={enableCamera}
              >
                Front Camera
              </button>
              <button className="vt-ctrl-btn" onClick={() => fileInputRef.current.click()}>
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

            {captured && (
              <div className="vt-controls" style={{ marginTop: '10px' }}>
                <button
                  className="vt-ctrl-btn active"
                  onClick={processTryOn}
                  disabled={!modelsLoaded || processing || !selectedProduct}
                >
                  {!modelsLoaded ? 'Loading face detection...' : processing ? 'Processing...' : 'Try It On'}
                </button>
              </div>
            )}

            {faceNotFound && (
              <p className="vt-error-text">No face detected. Please use a clear, front-facing photo.</p>
            )}
          </div>

          <div className="vt-right">
            <p className="panel-title">Select Jewellery</p>

            <div className="vt-product-select">
              {products.slice(0, 6).map(product => (
                <div
                  key={product._id}
                  className={`vt-product-thumb ${selectedProduct?._id === product._id ? 'active' : ''}`}
                  onClick={() => { setSelectedProduct(product); setResultImage(null) }}
                >
                  <img src={product.images[0]} alt={product.name} />
                  <p>{product.name}</p>
                </div>
              ))}
            </div>

            <hr className="vt-divider" />

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
              <p className="tip-text">Use good lighting and face the camera directly for the most accurate try-on experience.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default VirtualTryOn