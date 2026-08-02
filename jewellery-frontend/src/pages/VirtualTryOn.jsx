import { useState, useRef, useEffect, useCallback } from 'react'
import './VirtualTryOn.css'
import { getProducts } from '../api'

const JEWELRY_CATEGORIES = ['Earrings', 'Necklaces', 'Sunglasses', 'Bracelets', 'Watches']

function VirtualTryOn() {
  const [cameraActive, setCameraActive] = useState(false)
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [captured, setCaptured] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultImage, setResultImage] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Earrings')
  const [faceNotFound, setFaceNotFound] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [modelsLoading, setModelsLoading] = useState(true)
  const [cameraError, setCameraError] = useState('')

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const resultCanvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const faceMeshRef = useRef(null)
  const holisticRef = useRef(null)
  const streamRef = useRef(null)

  // ── Load MediaPipe models once on mount ──
  useEffect(() => {
    const loadModels = async () => {
      try {
        setModelsLoading(true)
        const { FaceMesh } = await import('@mediapipe/face_mesh')
        const { Holistic } = await import('@mediapipe/holistic')

        const faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        })
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })
        await faceMesh.initialize()
        faceMeshRef.current = faceMesh

        const holistic = new Holistic({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
        })
        holistic.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })
        await holistic.initialize()
        holisticRef.current = holistic

        setModelsLoaded(true)
        setModelsLoading(false)
      } catch (err) {
        console.error('Failed to load MediaPipe models:', err)
        setModelsLoading(false)
      }
    }
    loadModels()

    // cleanup on unmount
    return () => {
      stopCamera()
    }
  }, [])

  // ── Fetch products ──
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts()
        setProducts(data)
        const first = data.find(p => p.category === 'Earrings' && p.images?.length > 0)
        if (first) setSelectedProduct(first)
      } catch (err) {
        console.error('Failed to fetch products:', err)
      }
    }
    fetchProducts()
  }, [])

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    const first = products.find(p => p.category === category && p.images?.length > 0)
    setSelectedProduct(first || null)
    setResultImage(null)
    setFaceNotFound(false)
  }

  // ── Camera ──
  const enableCamera = async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setCameraActive(true)
          setUploadedPhoto(null)
          setCaptured(false)
          setResultImage(null)
          setFaceNotFound(false)
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setCameraError('Could not access camera. Please allow camera permission and try again.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    // mirror the image so it looks natural
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    setUploadedPhoto(dataUrl)
    setCaptured(true)
    stopCamera()
    setResultImage(null)
    setFaceNotFound(false)
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
      setFaceNotFound(false)
    }
    reader.readAsDataURL(file)
  }

  const handleReset = () => {
    setUploadedPhoto(null)
    setCaptured(false)
    setCameraActive(false)
    setResultImage(null)
    setFaceNotFound(false)
    setCameraError('')
  }

  // ── Draw jewellery helper ──
  const drawJewelry = (ctx, jewelryImg, x, y, width, height) => {
    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(jewelryImg, x, y, width, height)
    ctx.restore()
  }

  // ── Main Try-On processor ──
  const processTryOn = useCallback(async () => {
    if (!uploadedPhoto || !selectedProduct || !modelsLoaded) return
    setProcessing(true)
    setFaceNotFound(false)
    setResultImage(null)

    try {
      // Load the user photo
      const img = new Image()
      img.src = uploadedPhoto
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Set up result canvas
      const canvas = resultCanvasRef.current
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      // Load jewellery image
      const jewelryImg = new Image()
      jewelryImg.crossOrigin = 'anonymous'
      jewelryImg.src = selectedProduct.images[0]
      await new Promise((resolve, reject) => {
        jewelryImg.onload = resolve
        jewelryImg.onerror = reject
      })

      const category = selectedProduct.category
      const W = canvas.width
      const H = canvas.height

      if (category === 'Bracelets' || category === 'Watches') {
        // ── Wrist detection with Holistic ──
        await new Promise((resolve) => {
          holisticRef.current.onResults((results) => {
            let wristDetected = false

            if (results.poseLandmarks) {
              const lms = results.poseLandmarks
              const leftWrist = lms[15]
              const rightWrist = lms[16]

              if (leftWrist && leftWrist.visibility > 0.4) {
                wristDetected = true
                const wx = leftWrist.x * W
                const wy = leftWrist.y * H
                const wSize = W * 0.18
                const wH = wSize * (jewelryImg.height / jewelryImg.width)
                drawJewelry(ctx, jewelryImg, wx - wSize / 2, wy - wH / 2, wSize, wH)
              }

              if (rightWrist && rightWrist.visibility > 0.4) {
                wristDetected = true
                const wx = rightWrist.x * W
                const wy = rightWrist.y * H
                const wSize = W * 0.18
                const wH = wSize * (jewelryImg.height / jewelryImg.width)
                drawJewelry(ctx, jewelryImg, wx - wSize / 2, wy - wH / 2, wSize, wH)
              }
            }

            if (!wristDetected) setFaceNotFound(true)
            resolve()
          })
          holisticRef.current.send({ image: img })
        })

      } else {
        // ── Face detection with FaceMesh ──
        await new Promise((resolve) => {
          faceMeshRef.current.onResults((results) => {
            if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
              setFaceNotFound(true)
              resolve()
              return
            }

            const landmarks = results.multiFaceLandmarks[0]
            const lm = (i) => ({
              x: landmarks[i].x * W,
              y: landmarks[i].y * H,
            })

            if (category === 'Earrings') {
              // Left ear: 234, Right ear: 454
              const leftEar = lm(234)
              const rightEar = lm(454)
              const earSize = W * 0.09
              const eH = earSize * (jewelryImg.height / jewelryImg.width)
              drawJewelry(ctx, jewelryImg, leftEar.x - earSize / 2, leftEar.y, earSize, eH)
              drawJewelry(ctx, jewelryImg, rightEar.x - earSize / 2, rightEar.y, earSize, eH)

            } else if (category === 'Necklaces') {
              // Chin: 152, jaw landmarks: 234 and 454
              const chin = lm(152)
              const leftJaw = lm(234)
              const rightJaw = lm(454)
              const jawWidth = Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y)
              const nW = jawWidth * 1.3
              const nH = nW * (jewelryImg.height / jewelryImg.width)
              drawJewelry(ctx, jewelryImg, chin.x - nW / 2, chin.y + 15, nW, nH)

            } else if (category === 'Sunglasses') {
              // Left eye outer: 33, Right eye outer: 263
              const leftEye = lm(33)
              const rightEye = lm(263)
              const eyeWidth = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y)
              const sW = eyeWidth * 2.6
              const sH = sW * (jewelryImg.height / jewelryImg.width)
              const cx = (leftEye.x + rightEye.x) / 2
              const cy = (leftEye.y + rightEye.y) / 2
              drawJewelry(ctx, jewelryImg, cx - sW / 2, cy - sH / 2, sW, sH)

            } else if (category === 'Rings') {
              // Show ring preview in bottom right corner
              const rSize = W * 0.14
              const rH = rSize * (jewelryImg.height / jewelryImg.width)
              drawJewelry(ctx, jewelryImg, W - rSize - 20, H - rH - 20, rSize, rH)
            }

            resolve()
          })
          faceMeshRef.current.send({ image: img })
        })
      }

      setResultImage(canvas.toDataURL('image/png'))

    } catch (err) {
      console.error('Try-on processing failed:', err)
      setFaceNotFound(true)
    } finally {
      setProcessing(false)
    }
  }, [uploadedPhoto, selectedProduct, modelsLoaded])

  const filteredProducts = products.filter(p => p.category === activeCategory && p.images?.length > 0)

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
                  <p className="vt-placeholder-text">
                    {modelsLoading
                      ? 'Loading AI models...'
                      : modelsLoaded
                      ? 'Enable camera or upload a photo'
                      : 'Failed to load models. Please refresh.'}
                  </p>
                  {modelsLoaded && (
                    <button className="vt-start-btn" onClick={enableCamera}>
                      Enable Camera
                    </button>
                  )}
                </div>
              )}

              {/* Live camera feed */}
              <video
                ref={videoRef}
                className="vt-video"
                autoPlay
                playsInline
                muted
                style={{ display: cameraActive && !captured ? 'block' : 'none' }}
              />

              {/* Uploaded or captured photo before processing */}
              {uploadedPhoto && !resultImage && (
                <img src={uploadedPhoto} alt="Your photo" className="vt-preview-img" />
              )}

              {/* Result after try-on */}
              {resultImage && (
                <img src={resultImage} alt="Try-on result" className="vt-preview-img" />
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <canvas ref={resultCanvasRef} style={{ display: 'none' }} />
            </div>

            {cameraError && <p className="vt-error-text">{cameraError}</p>}

            <div className="vt-controls">
              <button className="vt-ctrl-btn" onClick={enableCamera}>
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
                  {!modelsLoaded
                    ? 'Loading models...'
                    : processing
                    ? 'Processing...'
                    : 'Try It On ✦'}
                </button>
              </div>
            )}

            {faceNotFound && (
              <p className="vt-error-text">
                {activeCategory === 'Watches' || activeCategory === 'Bracelets'
                  ? 'No wrist detected. Please show your wrist clearly in the photo.'
                  : 'No face detected. Please use a clear, well-lit, front-facing photo.'}
              </p>
            )}
          </div>

          <div className="vt-right">

            <p className="panel-title">Select Category</p>
            <div className="vt-category-tabs">
              {JEWELRY_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`vt-category-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <p className="panel-title" style={{ marginTop: '16px' }}>Select Item</p>
            <div className="vt-product-select">
              {filteredProducts.length === 0 ? (
                <p className="vt-no-products">
                  No {activeCategory} with images yet. Add some via the admin panel.
                </p>
              ) : (
                filteredProducts.slice(0, 6).map(product => (
                  <div
                    key={product._id}
                    className={`vt-product-thumb ${selectedProduct?._id === product._id ? 'active' : ''}`}
                    onClick={() => { setSelectedProduct(product); setResultImage(null) }}
                  >
                    <img src={product.images[0]} alt={product.name} />
                    <p>{product.name}</p>
                  </div>
                ))
              )}
            </div>

            <hr className="vt-divider" />

            <p className="panel-title">How It Works</p>
            <div className="vt-steps">
              <div className="step-item">
                <div className="step-num">1</div>
                <div className="step-info">
                  <p className="step-name">Take or upload a photo</p>
                  <p className="step-desc">Use your camera or upload a portrait. For bracelets, show your wrist clearly.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">2</div>
                <div className="step-info">
                  <p className="step-name">AI detection</p>
                  <p className="step-desc">Our AI detects your face or wrist landmarks for accurate placement.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">3</div>
                <div className="step-info">
                  <p className="step-name">Select a jewellery item</p>
                  <p className="step-desc">Pick a category and choose any item from our collection.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">4</div>
                <div className="step-info">
                  <p className="step-name">Preview and buy</p>
                  <p className="step-desc">See how it looks on you and add to cart if you love it!</p>
                </div>
              </div>
            </div>

            <hr className="vt-divider" />

            <div className="tip-box">
              <p className="tip-title">Tips for best results</p>
              <p className="tip-text">
                Face jewellery: use good lighting and face the camera directly.
                Bracelets and watches: hold your wrist up against a plain background.
                Use PNG product images with transparent backgrounds for best overlay results.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default VirtualTryOn