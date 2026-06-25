import { useState, useRef, useEffect } from 'react'
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

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const resultCanvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const faceMeshRef = useRef(null)
  const holisticRef = useRef(null)

  // Load MediaPipe models
  useEffect(() => {
    const loadModels = async () => {
      try {
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
      } catch (err) {
        console.error('Failed to load MediaPipe models:', err)
      }
    }
    loadModels()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts()
        setProducts(data)
        const firstInCategory = data.find(p => p.category === activeCategory && p.images?.length > 0)
        if (firstInCategory) setSelectedProduct(firstInCategory)
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
  }

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
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
    setResultImage(null)
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

  const drawJewelry = (ctx, jewelryImg, x, y, width, height, flipX = false) => {
    ctx.save()
    if (flipX) {
      ctx.scale(-1, 1)
      ctx.drawImage(jewelryImg, -x - width, y, width, height)
    } else {
      ctx.drawImage(jewelryImg, x, y, width, height)
    }
    ctx.restore()
  }

  const processTryOn = async () => {
    if (!uploadedPhoto || !selectedProduct || !modelsLoaded) return
    setProcessing(true)
    setFaceNotFound(false)

    try {
      const img = new Image()
      img.src = uploadedPhoto

      await new Promise((resolve) => { img.onload = resolve })

      const canvas = resultCanvasRef.current
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const jewelryImg = new Image()
      jewelryImg.crossOrigin = 'anonymous'
      jewelryImg.src = selectedProduct.images[0]
      await new Promise((resolve, reject) => {
        jewelryImg.onload = resolve
        jewelryImg.onerror = reject
      })

      const category = selectedProduct.category

      if (category === 'Watches' || category === 'Bracelets') {
        // Use Holistic for wrist detection
        let wristDetected = false

        holisticRef.current.onResults((results) => {
          if (results.poseLandmarks) {
            const landmarks = results.poseLandmarks
            // Left wrist is landmark 15, right wrist is landmark 16
            const leftWrist = landmarks[15]
            const rightWrist = landmarks[16]

            if (leftWrist && leftWrist.visibility > 0.5) {
              wristDetected = true
              const wx = leftWrist.x * canvas.width
              const wy = leftWrist.y * canvas.height
              const wristSize = canvas.width * 0.15
              const wHeight = wristSize * (jewelryImg.height / jewelryImg.width)
              drawJewelry(ctx, jewelryImg, wx - wristSize / 2, wy - wHeight / 2, wristSize, wHeight)
            }

            if (rightWrist && rightWrist.visibility > 0.5) {
              wristDetected = true
              const wx = rightWrist.x * canvas.width
              const wy = rightWrist.y * canvas.height
              const wristSize = canvas.width * 0.15
              const wHeight = wristSize * (jewelryImg.height / jewelryImg.width)
              drawJewelry(ctx, jewelryImg, wx - wristSize / 2, wy - wHeight / 2, wristSize, wHeight)
            }

            if (!wristDetected) {
              setFaceNotFound(true)
            }

            setResultImage(canvas.toDataURL('image/png'))
            setProcessing(false)
          } else {
            setFaceNotFound(true)
            setProcessing(false)
          }
        })

        await holisticRef.current.send({ image: img })

      } else {
        // Use FaceMesh for face-based jewelry
        let faceDetected = false

        faceMeshRef.current.onResults((results) => {
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            faceDetected = true
            const landmarks = results.multiFaceLandmarks[0]
            const W = canvas.width
            const H = canvas.height

            const lm = (index) => ({
              x: landmarks[index].x * W,
              y: landmarks[index].y * H,
            })

            if (category === 'Earrings') {
              // Left ear: landmark 234, Right ear: landmark 454
              const leftEar = lm(234)
              const rightEar = lm(454)
              const earSize = W * 0.08
              const eHeight = earSize * (jewelryImg.height / jewelryImg.width)

              drawJewelry(ctx, jewelryImg, leftEar.x - earSize / 2, leftEar.y, earSize, eHeight)
              drawJewelry(ctx, jewelryImg, rightEar.x - earSize / 2, rightEar.y, earSize, eHeight)

            } else if (category === 'Necklaces') {
              // Chin: landmark 152, use it to position necklace below jaw
              const chin = lm(152)
              const leftJaw = lm(234)
              const rightJaw = lm(454)
              const jawWidth = Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y)
              const nWidth = jawWidth * 1.2
              const nHeight = nWidth * (jewelryImg.height / jewelryImg.width)
              drawJewelry(ctx, jewelryImg, chin.x - nWidth / 2, chin.y + 10, nWidth, nHeight)

            } else if (category === 'Sunglasses') {
              // Left eye center: 33, Right eye center: 263
              const leftEye = lm(33)
              const rightEye = lm(263)
              const eyeWidth = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y)
              const sWidth = eyeWidth * 2.4
              const sHeight = sWidth * (jewelryImg.height / jewelryImg.width)
              const centerX = (leftEye.x + rightEye.x) / 2
              const centerY = (leftEye.y + rightEye.y) / 2
              drawJewelry(ctx, jewelryImg, centerX - sWidth / 2, centerY - sHeight / 2, sWidth, sHeight)

            } else if (category === 'Rings') {
              // Show ring as a preview in bottom corner
              const rSize = W * 0.12
              const rHeight = rSize * (jewelryImg.height / jewelryImg.width)
              drawJewelry(ctx, jewelryImg, W - rSize - 20, H - rHeight - 20, rSize, rHeight)
            }

            setResultImage(canvas.toDataURL('image/png'))
          } else {
            setFaceNotFound(true)
          }
          setProcessing(false)
        })

        await faceMeshRef.current.send({ image: img })

        if (!faceDetected) {
          setTimeout(() => {
            if (processing) {
              setFaceNotFound(true)
              setProcessing(false)
            }
          }, 5000)
        }
      }

    } catch (err) {
      console.error('Try-on processing failed:', err)
      setFaceNotFound(true)
      setProcessing(false)
    }
  }

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
                    {modelsLoaded ? 'Enable camera to try on' : 'Loading face detection models...'}
                  </p>
                  {modelsLoaded && (
                    <button className="vt-start-btn" onClick={enableCamera}>
                      Enable Camera
                    </button>
                  )}
                </div>
              )}

              {cameraActive && !captured && (
                <video ref={videoRef} className="vt-video" autoPlay playsInline muted />
              )}

              {uploadedPhoto && !resultImage && (
                <img src={uploadedPhoto} alt="Preview" className="vt-preview-img" />
              )}

              {resultImage && (
                <img src={resultImage} alt="Try on result" className="vt-preview-img" />
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <canvas ref={resultCanvasRef} style={{ display: 'none' }} />
            </div>

            <div className="vt-controls">
              <button className="vt-ctrl-btn" onClick={enableCamera}>Front Camera</button>
              <button className="vt-ctrl-btn" onClick={() => fileInputRef.current.click()}>Upload Photo</button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
              {cameraActive && (
                <button className="vt-ctrl-btn" onClick={capturePhoto}>Capture</button>
              )}
              {captured && (
                <button className="vt-ctrl-btn" onClick={handleReset}>Retake</button>
              )}
            </div>

            {captured && (
              <div className="vt-controls" style={{ marginTop: '10px' }}>
                <button
                  className="vt-ctrl-btn active"
                  onClick={processTryOn}
                  disabled={!modelsLoaded || processing || !selectedProduct}
                >
                  {!modelsLoaded ? 'Loading models...' : processing ? 'Processing...' : 'Try It On ✦'}
                </button>
              </div>
            )}

            {faceNotFound && (
              <p className="vt-error-text">
                {activeCategory === 'Watches' || activeCategory === 'Bracelets'
                  ? 'No wrist detected. Please show your wrist clearly in the photo.'
                  : 'No face detected. Please use a clear, front-facing photo.'}
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
                <p className="vt-no-products">No {activeCategory} with images yet. Add some via the admin panel.</p>
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
                  <p className="step-name">Upload or take a photo</p>
                  <p className="step-desc">Upload a portrait photo or use your camera. For watches, show your wrist clearly.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">2</div>
                <div className="step-info">
                  <p className="step-name">Detection</p>
                  <p className="step-desc">Our AI detects your face or wrist landmarks for accurate jewellery placement.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">3</div>
                <div className="step-info">
                  <p className="step-name">Select item</p>
                  <p className="step-desc">Pick a category and choose any jewellery piece to try on.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">4</div>
                <div className="step-info">
                  <p className="step-name">Preview & Buy</p>
                  <p className="step-desc">See how it looks and add to cart if you love it!</p>
                </div>
              </div>
            </div>

            <hr className="vt-divider" />

            <div className="tip-box">
              <p className="tip-title">Tips for best results</p>
              <p className="tip-text">
                Face jewellery: use good lighting and face the camera directly.
                Watches & bracelets: show your full wrist against a plain background.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default VirtualTryOn