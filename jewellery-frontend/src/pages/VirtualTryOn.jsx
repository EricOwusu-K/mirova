import { useState, useRef, useEffect, useCallback } from 'react'
import './VirtualTryOn.css'
import { getProducts } from '../api'

const JEWELRY_CATEGORIES = ['Earrings', 'Necklaces', 'Sunglasses', 'Bracelets', 'Watches']

// Which body part each category needs
const CATEGORY_TARGET = {
  Earrings: 'face', Necklaces: 'face', Sunglasses: 'face',
  Bracelets: 'wrist', Watches: 'wrist',
}

function VirtualTryOn() {
  const [cameraActive, setCameraActive] = useState(false)
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [captured, setCaptured] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultImage, setResultImage] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Earrings')
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [modelsLoading, setModelsLoading] = useState(true)
  const [cameraError, setCameraError] = useState('')
  // null | 'checking' | 'met' | 'failed'
  const [detectionStatus, setDetectionStatus] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const resultCanvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const faceMeshRef = useRef(null)
  const holisticRef = useRef(null)
  const streamRef = useRef(null)

  // ── Load MediaPipe models once on mount ──
  useEffect(() => {
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
      const script = document.createElement('script')
      script.src = src
      script.crossOrigin = 'anonymous'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })

    const loadModels = async () => {
      try {
        setModelsLoading(true)
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js')

        const FaceMesh = window.FaceMesh
        const Holistic = window.Holistic

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

    return () => { stopCamera() }
  }, [])

  // ── Fetch products + read ?product=ID from URL for pre-selection ──
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts()
        setProducts(data)

        // Flow 1: product passed via URL → pre-select it
        const params = new URLSearchParams(window.location.search)
        const productId = params.get('product')
        if (productId) {
          const preSelected = data.find(p => p._id === productId)
          if (preSelected) {
            setSelectedProduct(preSelected)
            setActiveCategory(preSelected.category)
            return
          }
        }
        // Flow 2: no product in URL → leave nothing selected (user must pick)
      } catch (err) {
        console.error('Failed to fetch products:', err)
      }
    }
    fetchProducts()
  }, [])

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    setSelectedProduct(null)
    setResultImage(null)
    setDetectionStatus(null)
  }

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setResultImage(null)
    // If a photo is already present, re-check detection for the new target
    if (uploadedPhoto) {
      runDetection(uploadedPhoto, product)
    }
  }

  const handleChangeProduct = () => {
    setSelectedProduct(null)
    setResultImage(null)
    setDetectionStatus(null)
  }

  // ── Camera ──
  const enableCamera = async () => {
    if (!selectedProduct) return
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
          setDetectionStatus(null)
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
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    setUploadedPhoto(dataUrl)
    setCaptured(true)
    stopCamera()
    setResultImage(null)
    runDetection(dataUrl, selectedProduct)
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
      runDetection(ev.target.result, selectedProduct)
    }
    reader.readAsDataURL(file)
  }

  const handleReset = () => {
    setUploadedPhoto(null)
    setCaptured(false)
    setCameraActive(false)
    setResultImage(null)
    setDetectionStatus(null)
    setCameraError('')
  }

  // ── Auto-detection: runs when a photo is added ──
  const runDetection = useCallback(async (photoSrc, product) => {
    if (!photoSrc || !product || !modelsLoaded) return
    setDetectionStatus('checking')

    try {
      const img = new Image()
      img.src = photoSrc
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject })

      const target = CATEGORY_TARGET[product.category] || 'face'

      if (target === 'wrist') {
        await new Promise((resolve) => {
          holisticRef.current.onResults((results) => {
            const lms = results.poseLandmarks
            const leftWrist = lms?.[15]
            const rightWrist = lms?.[16]
            const detected =
              (leftWrist && leftWrist.visibility > 0.4) ||
              (rightWrist && rightWrist.visibility > 0.4)
            setDetectionStatus(detected ? 'met' : 'failed')
            resolve()
          })
          holisticRef.current.send({ image: img })
        })
      } else {
        await new Promise((resolve) => {
          faceMeshRef.current.onResults((results) => {
            const detected = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0
            setDetectionStatus(detected ? 'met' : 'failed')
            resolve()
          })
          faceMeshRef.current.send({ image: img })
        })
      }
    } catch (err) {
      console.error('Detection failed:', err)
      setDetectionStatus('failed')
    }
  }, [modelsLoaded])

  // ── Draw jewellery ──
const drawJewelry = (ctx, jewelryImg, x, y, width, height) => {
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(jewelryImg, x, y, width, height)
  ctx.restore()
}

  // ── Main Try-On processor (renders the overlay) ──
  const processTryOn = useCallback(async () => {
    if (!uploadedPhoto || !selectedProduct || !modelsLoaded || detectionStatus !== 'met') return
    setProcessing(true)
    setResultImage(null)

    try {
      const img = new Image()
      img.src = uploadedPhoto
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject })

      const canvas = resultCanvasRef.current
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const jewelryImg = new Image()
      jewelryImg.crossOrigin = 'anonymous'
      jewelryImg.src = selectedProduct.images[0]
      await new Promise((resolve, reject) => { jewelryImg.onload = resolve; jewelryImg.onerror = reject })

      const category = selectedProduct.category
      const W = canvas.width
      const H = canvas.height

      if (category === 'Bracelets' || category === 'Watches') {
        await new Promise((resolve) => {
          holisticRef.current.onResults((results) => {
            if (results.poseLandmarks) {
              const lms = results.poseLandmarks
              ;[lms[15], lms[16]].forEach(wrist => {
                if (wrist && wrist.visibility > 0.4) {
                  const wx = wrist.x * W
                  const wy = wrist.y * H
                  const wSize = W * 0.18
                  const wH = wSize * (jewelryImg.height / jewelryImg.width)
                  drawJewelry(ctx, jewelryImg, wx - wSize / 2, wy - wH / 2, wSize, wH)
                }
              })
            }
            resolve()
          })
          holisticRef.current.send({ image: img })
        })
      } else {
        await new Promise((resolve) => {
          faceMeshRef.current.onResults((results) => {
            if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
              resolve()
              return
            }
            const landmarks = results.multiFaceLandmarks[0]
            const lm = (i) => ({ x: landmarks[i].x * W, y: landmarks[i].y * H })

            if (category === 'Earrings') {
              const leftEar = lm(234)
              const rightEar = lm(454)
              const earSize = W * 0.09
              const eH = earSize * (jewelryImg.height / jewelryImg.width)
              drawJewelry(ctx, jewelryImg, leftEar.x - earSize / 2, leftEar.y, earSize, eH)
              drawJewelry(ctx, jewelryImg, rightEar.x - earSize / 2, rightEar.y, earSize, eH)

           } else if (category === 'Necklaces') {
              const chin = lm(152)
              const leftJaw = lm(234)
              const rightJaw = lm(454)
              const jawWidth = Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y)
              const nW = jawWidth * 1.3
              const nH = nW * (jewelryImg.height / jewelryImg.width)
              drawJewelry(ctx, jewelryImg, chin.x - nW / 2, chin.y + 15, nW, nH)
            }else if (category === 'Sunglasses') {
              const leftEye = lm(33)
              const rightEye = lm(263)
              const eyeWidth = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y)
              const sW = eyeWidth * 2.6
              const sH = sW * (jewelryImg.height / jewelryImg.width)
              const cx = (leftEye.x + rightEye.x) / 2
              const cy = (leftEye.y + rightEye.y) / 2
              drawJewelry(ctx, jewelryImg, cx - sW / 2, cy - sH / 2, sW, sH)
            }
            resolve()
          })
          faceMeshRef.current.send({ image: img })
        })
      }

      setResultImage(canvas.toDataURL('image/png'))
    } catch (err) {
      console.error('Try-on processing failed:', err)
    } finally {
      setProcessing(false)
    }
  }, [uploadedPhoto, selectedProduct, modelsLoaded, detectionStatus])

  const filteredProducts = products.filter(p => p.category === activeCategory && p.images?.length > 0)
  const targetLabel = selectedProduct
    ? (CATEGORY_TARGET[selectedProduct.category] === 'wrist' ? 'wrist landmarks' : 'face landmarks')
    : ''

  return (
    <div className="vt-page">
      <div className="vt-container">

        <div className="vt-header">
          <p className="vt-title">Virtual Try-On</p>
          <p className="vt-sub">See how our jewelry looks on you before you buy</p>
        </div>

        <div className="vt-layout">

          {/* ══ LEFT COLUMN ══ */}
          <div className="vt-left">

            {/* ── STEP 1: SELECT PRODUCT ── */}
            {!selectedProduct ? (
              <div className="vt-step-card vt-step-active">
                <div className="vt-step-head">
                  <div className="vt-step-num">1</div>
                  <div>
                    <p className="vt-step-title">Select a Product</p>
                    <p className="vt-step-desc">Choose what you want to try on first</p>
                  </div>
                </div>

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

                <div className="vt-product-select">
                  {filteredProducts.length === 0 ? (
                    <p className="vt-no-products">
                      No {activeCategory} with images yet. Add some via the admin panel.
                    </p>
                  ) : (
                    filteredProducts.slice(0, 6).map(product => (
                      <div
                        key={product._id}
                        className="vt-product-thumb"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <img src={product.images[0]} alt={product.name} />
                        <p>{product.name}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              // ── Confirmed green bar ──
              <div className="vt-step-card vt-step-confirmed">
                <div className="vt-confirm-check">✓</div>
                <div className="vt-confirm-info">
                  <p className="vt-confirm-title">Product Selected: {selectedProduct.name}</p>
                  <p className="vt-confirm-sub">
                    {selectedProduct.category} · will detect {targetLabel}
                    <span className="vt-change-btn" onClick={handleChangeProduct}> · Change</span>
                  </p>
                </div>
                {selectedProduct.images?.[0] && (
                  <img className="vt-confirm-thumb" src={selectedProduct.images[0]} alt={selectedProduct.name} />
                )}
              </div>
            )}

            {/* ── STEP 2: PHOTO ── */}
            <div className={`vt-step-card ${selectedProduct ? 'vt-step-active' : 'vt-step-locked'}`} style={{ marginTop: '16px' }}>
              <div className="vt-step-head">
                <div className={`vt-step-num ${selectedProduct ? '' : 'locked'}`}>2</div>
                <div>
                  <p className={`vt-step-title ${selectedProduct ? '' : 'locked-text'}`}>Add Your Photo</p>
                  <p className="vt-step-desc">
                    {selectedProduct
                      ? 'Take a photo or upload a clear portrait'
                      : '🔒 Select a product above to unlock'}
                  </p>
                </div>
              </div>

              {/* Photo viewer — same box as before */}
              <div className={`vt-viewer ${selectedProduct ? '' : 'vt-viewer-locked'}`}>
                <div className="vt-corner tl" />
                <div className="vt-corner tr" />
                <div className="vt-corner bl" />
                <div className="vt-corner br" />

                {!cameraActive && !uploadedPhoto && (
                  <div className="vt-placeholder">
                    <div className="vt-camera-icon">◎</div>
                    <p className="vt-placeholder-text">
                      {!selectedProduct
                        ? 'Locked until product selected'
                        : modelsLoading
                        ? 'Loading AI models...'
                        : modelsLoaded
                        ? 'Enable camera or upload a photo'
                        : 'Failed to load models. Please refresh.'}
                    </p>
                    {selectedProduct && modelsLoaded && (
                      <button className="vt-start-btn" onClick={enableCamera}>
                        Enable Camera
                      </button>
                    )}
                  </div>
                )}

                <video
                  ref={videoRef}
                  className="vt-video"
                  autoPlay
                  playsInline
                  muted
                  style={{ display: cameraActive && !captured ? 'block' : 'none' }}
                />

                {uploadedPhoto && !resultImage && (
                  <img src={uploadedPhoto} alt="Your photo" className="vt-preview-img" />
                )}
                {resultImage && (
                  <img src={resultImage} alt="Try-on result" className="vt-preview-img" />
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <canvas ref={resultCanvasRef} style={{ display: 'none' }} />
              </div>

              {cameraError && <p className="vt-error-text">{cameraError}</p>}

              {/* Controls — only usable when product selected */}
              {selectedProduct && (
                <div className="vt-controls">
                  <button className="vt-ctrl-btn" onClick={enableCamera}>Front Camera</button>
                  <button className="vt-ctrl-btn" onClick={() => fileInputRef.current.click()}>Upload Photo</button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                  {cameraActive && <button className="vt-ctrl-btn" onClick={capturePhoto}>Capture</button>}
                  {captured && <button className="vt-ctrl-btn" onClick={handleReset}>Retake</button>}
                </div>
              )}

              {/* Detection feedback */}
              {detectionStatus === 'checking' && (
                <div className="vt-detect vt-detect-checking">
                  Checking your photo...
                </div>
              )}
              {detectionStatus === 'met' && (
                <div className="vt-detect vt-detect-met">
                  <p className="vt-detect-title">✓ Picture requirement met successfully</p>
                  <p className="vt-detect-sub">
                    {CATEGORY_TARGET[selectedProduct?.category] === 'wrist'
                      ? 'Wrist detected. You can now try on the item.'
                      : 'Face detected. You can now try on the item.'}
                  </p>
                </div>
              )}
              {detectionStatus === 'failed' && (
                <div className="vt-detect vt-detect-failed">
                  <p className="vt-detect-title">
                    ✗ Could not detect your {CATEGORY_TARGET[selectedProduct?.category] === 'wrist' ? 'wrist' : 'face'}
                  </p>
                  <p className="vt-detect-sub">
                    {CATEGORY_TARGET[selectedProduct?.category] === 'wrist'
                      ? 'Please show your wrist clearly against a plain background, then retake.'
                      : 'Please use a clear, front-facing, well-lit photo, then retake.'}
                  </p>
                </div>
              )}

              {/* Try It On button */}
              {captured && (
                <button
                  className="vt-tryon-btn"
                  onClick={processTryOn}
                  disabled={detectionStatus !== 'met' || processing}
                >
                  {processing ? 'Processing...' : 'Try It On ✦'}
                </button>
              )}
            </div>
          </div>

          {/* ══ RIGHT COLUMN — unchanged content, reordered steps ══ */}
          <div className="vt-right">
            <p className="panel-title">How It Works</p>
            <div className="vt-steps">
              <div className="step-item">
                <div className="step-num">1</div>
                <div className="step-info">
                  <p className="step-name">Select a jewellery item</p>
                  <p className="step-desc">Pick a category and choose any item from our collection.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">2</div>
                <div className="step-info">
                  <p className="step-name">Take or upload a photo</p>
                  <p className="step-desc">Use your camera or upload a portrait. For bracelets, show your wrist clearly.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">3</div>
                <div className="step-info">
                  <p className="step-name">AI detection</p>
                  <p className="step-desc">Our AI detects your face or wrist landmarks for accurate placement.</p>
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