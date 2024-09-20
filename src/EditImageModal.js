import React, { useState, useRef, useEffect, Fragment } from 'react'
import { Modal, IconButton, Box, Slider, Button } from '@mui/material'
import Cropper from 'react-easy-crop'
import CropIcon from '@mui/icons-material/Crop'
import CreateIcon from '@mui/icons-material/Create'
import BrushIcon from '@mui/icons-material/Brush'
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import { ColorGrid } from './components/ColorGrid'

const EditImageModal = ({
  isOpen,
  onClose,
  imageSrc,
  onSave,
  index = 0,
  modalStyle = {},
  canvasStyle = {},
  sliderStyle = {},
  buttonStyle = {},
  initialPenColor = '#000000',
  initialHighlighterColor = 'rgba(255, 255, 0, 0.5)',
  initialPenSize = 2,
  initialHighlighterSize = 20,
  initialEraserSize = 20,
  fixedBoxSize = 500
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isCropping, setIsCropping] = useState(false)
  const [editedImage, setEditedImage] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)
  const [aspectRatio, setAspectRatio] = useState(1)
  const canvasRef = useRef(null)
  const [context, setContext] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [mode, setMode] = useState(null)
  const [penColor, setPenColor] = useState(initialPenColor)
  const [penSize, setPenSize] = useState(initialPenSize)
  const [highlighterColor, setHighlighterColor] = useState(
    initialHighlighterColor
  )
  const [showColorGrid, setShowColorGrid] = useState(false)
  const [highlighterSize, setHighlighterSize] = useState(initialHighlighterSize)
  const [eraserSize, setEraserSize] = useState(initialEraserSize)
  // const [colorMenuAnchor, setColorMenuAnchor] = useState(null)
  const [cropSize, setCropSize] = useState({ width: 200, height: 200 })

  useEffect(() => {
    if (isOpen && imageSrc) {
      const image = new Image()
      image.onload = () => {
        setEditedImage(image)
        setOriginalImage(image)
        initializeCanvas(image)
      }
      image.src = imageSrc
    }
  }, [isOpen, imageSrc])

  const initializeCanvas = (image) => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      setContext(ctx)
      saveToHistory()
    }
  }

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const applyCrop = async () => {
    if (!croppedAreaPixels || !editedImage) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const scaleX = editedImage.naturalWidth / editedImage.width
    const scaleY = editedImage.naturalHeight / editedImage.height
    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height

    ctx.drawImage(
      editedImage,
      croppedAreaPixels.x * scaleX,
      croppedAreaPixels.y * scaleY,
      croppedAreaPixels.width * scaleX,
      croppedAreaPixels.height * scaleY,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    // Convert the canvas to an image and set it as the new edited image
    const croppedImage = new Image()
    croppedImage.src = canvas.toDataURL() // Get the data URL from the canvas
    croppedImage.onload = () => {
      setEditedImage(croppedImage) // Update the edited image
      setIsCropping(false)
      setMode(null)

      // Render the cropped image on the main canvas
      const mainCanvas = canvasRef.current
      const mainCtx = mainCanvas.getContext('2d')
      mainCanvas.width = croppedImage.width
      mainCanvas.height = croppedImage.height
      mainCtx.drawImage(croppedImage, 0, 0)

      saveToHistory() // Save the cropped state to history
    }
  }

  const cancelCrop = () => {
    setIsCropping(false)
    setMode(null)

    // Just reset the crop area, but keep the edited image
    if (editedImage) {
      setTimeout(() => {
        const canvas = canvasRef.current
        if (canvas) {
          canvas.width = editedImage.width
          canvas.height = editedImage.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(editedImage, 0, 0, canvas.width, canvas.height)
          setContext(ctx)
        }
      }, 0)
    }
  }

  const startDrawing = (e) => {
    if (!context) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width)
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height)
    setIsDrawing(true)
    setLastX(x)
    setLastY(y)
  }

  const draw = (e) => {
    if (!isDrawing || !context) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width)
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height)

    context.beginPath()
    context.moveTo(lastX, lastY)
    context.lineTo(x, y)

    switch (mode) {
      case 'pen':
        context.globalCompositeOperation = 'source-over'
        context.strokeStyle = penColor
        context.lineWidth = penSize
        context.lineCap = 'round'
        context.stroke()
        break
      case 'highlighter':
        context.globalCompositeOperation = 'source-over'
        context.strokeStyle = highlighterColor
        context.lineWidth = highlighterSize
        context.lineCap = 'square'
        context.stroke()
        break
      case 'eraser':
        context.globalCompositeOperation = 'destination-out'
        context.lineWidth = eraserSize
        context.lineCap = 'round'
        context.stroke()
        break
      default:
        break
    }

    setLastX(x)
    setLastY(y)
  }

  const endDrawing = () => {
    setIsDrawing(false)
    if (context && canvasRef.current) {
      saveToHistory()

      // Update the edited image after drawing
      const updatedImage = new Image()
      updatedImage.src = canvasRef.current.toDataURL() // Convert canvas to data URL
      setEditedImage(updatedImage) // Update the edited image
    }
  }

  const saveToHistory = () => {
    if (context && canvasRef.current) {
      const imageData = context.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      )
      setHistory((prevHistory) => [
        ...prevHistory.slice(0, historyIndex + 1),
        imageData
      ])
      setHistoryIndex((prevIndex) => prevIndex + 1)
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0 && context) {
      setHistoryIndex((prevIndex) => prevIndex - 1)
      const imageData = history[historyIndex - 1]
      context.putImageData(imageData, 0, 0)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && context) {
      setHistoryIndex((prevIndex) => prevIndex + 1)
      const imageData = history[historyIndex + 1]
      context.putImageData(imageData, 0, 0)
    }
  }

  const handleSave = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'edited-image.png', {
            type: 'image/png'
          })
          onSave(file)
          onClose()
        }
      }, 'image/png')
    }
  }

  const toggleMode = (selectedMode) => {
    if (selectedMode === 'crop') {
      setIsCropping((prev) => !prev) // Toggle cropping state
      setMode((prevMode) => (prevMode === selectedMode ? null : selectedMode))

      if (!isCropping && editedImage) {
        // Ensure the edited image remains visible
        setTimeout(() => {
          const canvas = canvasRef.current
          if (canvas) {
            canvas.width = editedImage.width
            canvas.height = editedImage.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(editedImage, 0, 0, canvas.width, canvas.height)
            setContext(ctx)
          }
        }, 0)
      }
    } else {
      setIsCropping(false)
      setMode((prevMode) => (prevMode === selectedMode ? null : selectedMode))

      setTimeout(() => {
        const canvas = canvasRef.current
        if (canvas) {
          canvas.width = editedImage.width
          canvas.height = editedImage.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(editedImage, 0, 0, canvas.width, canvas.height)
          setContext(ctx)
        }
      }, 0)
    }
  }

  const handleColorChange = (color) => {
    if (mode === 'pen') {
      setPenColor(color)
    } else if (mode === 'highlighter') {
      setHighlighterColor(color)
    }
    setShowColorGrid(false)
  }

  const handleAspectRatioChange = (event, newValue) => {
    setAspectRatio(newValue)
  }

  const fixedBoxStyles = {
    position: 'relative',
    width: fixedBoxSize,
    height: fixedBoxSize,
    aspectRatio: 1 / 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...canvasStyle
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(40px)',
          boxShadow: 24,
          p: 4,
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflowY: 'auto',
          ...modalStyle
        }}
      >
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8 }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <IconButton
            onClick={() => toggleMode(mode === 'crop' ? null : 'crop')}
            sx={{
              backgroundColor: mode === 'crop' ? 'lightgray' : 'transparent'
            }}
          >
            <CropIcon />
          </IconButton>
          <IconButton
            onClick={() => toggleMode(mode === 'pen' ? null : 'pen')}
            sx={{
              backgroundColor: mode === 'pen' ? 'lightgray' : 'transparent'
            }}
          >
            <CreateIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              toggleMode(mode === 'highlighter' ? null : 'highlighter')
            }
            sx={{
              backgroundColor:
                mode === 'highlighter' ? 'lightgray' : 'transparent'
            }}
          >
            <BrushIcon />
          </IconButton>
          <IconButton
            onClick={() => toggleMode(mode === 'eraser' ? null : 'eraser')}
            sx={{
              backgroundColor: mode === 'eraser' ? 'lightgray' : 'transparent'
            }}
          >
            <FormatColorFillIcon />
          </IconButton>
          <IconButton
            onClick={() => setShowColorGrid(!showColorGrid)}
            disabled={!['pen', 'highlighter'].includes(mode)}
          >
            <div
              style={{
                width: 24,
                height: 24,
                backgroundColor: mode === 'pen' ? penColor : highlighterColor,
                border: '1px solid black',
                borderRadius: 50
              }}
            />
          </IconButton>
          {showColorGrid && (
            <Box
              sx={{
                position: 'absolute',
                top: '75px',
                // right: "10px",
                zIndex: 1000,
                bgcolor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                p: 2,
                borderRadius: '8px',
                boxShadow: 3
              }}
              style={{
                // width: 200,
                width: '100%',
                maxWidth: 320,
                maxHeight: 350,
                overflowY: 'auto',
                display: 'flex',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                gap: 3
              }}
            >
              <ColorGrid onColorChange={handleColorChange} />
            </Box>
          )}

          <IconButton onClick={handleUndo} disabled={historyIndex === 0}>
            <UndoIcon />
          </IconButton>
          <IconButton
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
          >
            <RedoIcon />
          </IconButton>
        </Box>

        {isCropping ? (
          <Box sx={fixedBoxStyles}>
            <Cropper
              image={editedImage.src}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              restrictPosition={false}
              // cropShape='rect'
              showGrid={false}
              cropSize={{ width: cropSize.width, height: cropSize.height }}
              onCropSizeChange={(newSize) => {
                setCropSize(newSize)
              }}
            />
          </Box>
        ) : (
          <Box sx={fixedBoxStyles}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
            />
          </Box>
        )}

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '10px'
            }}
          >
            {mode === 'pen' && (
              <Slider
                value={penSize}
                onChange={(e, newValue) => setPenSize(newValue)}
                min={1}
                max={20}
                valueLabelDisplay='auto'
                sx={{ width: 100, mr: 2 }}
                style={{ ...sliderStyle }}
              />
            )}
            {mode === 'highlighter' && (
              <Slider
                value={highlighterSize}
                onChange={(e, newValue) => setHighlighterSize(newValue)}
                min={5}
                max={50}
                valueLabelDisplay='auto'
                sx={{ width: 100, mr: 2 }}
              />
            )}
            {mode === 'eraser' && (
              <Slider
                value={eraserSize}
                onChange={(e, newValue) => setEraserSize(newValue)}
                min={5}
                max={50}
                valueLabelDisplay='auto'
                sx={{ width: 100, mr: 2 }}
              />
            )}
            {isCropping && (
              <Fragment>
                <IconButton
                  variant='contained'
                  onClick={applyCrop}
                  sx={{ mr: 2 }}
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: '50px'
                  }}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  variant='contained'
                  onClick={cancelCrop}
                  sx={{ mr: 2 }}
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: '50px'
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Fragment>
            )}
          </div>
          <Button
            variant='contained'
            style={{
              backgroundColor: '#4BB543',
              borderRadius: 10,
              padding: '5px 7px',
              ...buttonStyle
            }}
            disabled={isCropping}
            onClick={handleSave}
          >
            Done
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default EditImageModal
