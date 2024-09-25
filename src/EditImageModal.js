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
import TextFieldsIcon from '@mui/icons-material/TextFields'

import html2canvas from 'html2canvas'

const EditImageModal = ({
  isOpen,
  onClose,
  imageSrc,
  onSave,
  modes = {
    crop: true,
    pen: true,
    highlighter: true,
    eraser: true,
    text: true
  },
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

  const [points, setPoints] = useState([])
  const [isAddingText, setIsAddingText] = useState(false)
  const [editingTextIndex, setEditingTextIndex] = useState(null)
  const [currentText, setCurrentText] = useState('')
  const imageContainerRef = useRef(null)

  useEffect(() => {
    if (isOpen && imageSrc) {
      const image = new Image()
      image.onload = () => {
        setEditedImage(image)
        setOriginalImage(image)
        initializeCanvas(image)
      }
      image.src = imageSrc

      setPoints([])
      setCurrentText('')
      setEditingTextIndex(null)
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
    if (!croppedAreaPixels || !originalImage) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const scaleX = originalImage.naturalWidth / originalImage.width
    const scaleY = originalImage.naturalHeight / originalImage.height
    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height

    ctx.drawImage(
      originalImage,
      croppedAreaPixels.x * scaleX,
      croppedAreaPixels.y * scaleY,
      croppedAreaPixels.width * scaleX,
      croppedAreaPixels.height * scaleY,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    const croppedImage = new Image()
    croppedImage.src = canvas.toDataURL()
    croppedImage.onload = () => {
      setEditedImage(croppedImage)
      setIsCropping(false)
      setMode(null)

      const mainCanvas = canvasRef.current
      const mainCtx = mainCanvas.getContext('2d')
      mainCanvas.width = croppedImage.width
      mainCanvas.height = croppedImage.height
      mainCtx.drawImage(croppedImage, 0, 0)

      saveToHistory()
    }
  }

  const cancelCrop = () => {
    setIsCropping(false)
    setMode(null)

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

      const updatedImage = new Image()
      updatedImage.src = canvasRef.current.toDataURL()
      setEditedImage(updatedImage)
    }
  }

  const saveToHistory = () => {
    if (context && canvasRef.current) {
      const canvasData = context.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      )
      const state = {
        canvasData,
        points: [...points]
      }
      setHistory((prevHistory) => [
        ...prevHistory.slice(0, historyIndex + 1),
        state
      ])
      setHistoryIndex((prevIndex) => prevIndex + 1)
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0 && context) {
      const prevIndex = historyIndex - 1
      setHistoryIndex(prevIndex)
      const { canvasData, points: savedPoints } = history[prevIndex]
      context.putImageData(canvasData, 0, 0)
      setPoints(savedPoints)

      // Update editedImage
      const updatedImage = new Image()
      updatedImage.src = canvasRef.current.toDataURL()
      setEditedImage(updatedImage)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && context) {
      const nextIndex = historyIndex + 1
      setHistoryIndex(nextIndex)
      const { canvasData, points: savedPoints } = history[nextIndex]
      context.putImageData(canvasData, 0, 0)
      setPoints(savedPoints)

      const updatedImage = new Image()
      updatedImage.src = canvasRef.current.toDataURL()
      setEditedImage(updatedImage)
    }
  }

  const [isEditing, setIsEditing] = useState(false)

  const addTextPoint = (e) => {
    if (!isAddingText || isEditing || !imageContainerRef.current) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedTextIndex = points.findIndex(
      (point) => Math.abs(point.x - x) < 20 && Math.abs(point.y - y) < 20
    )

    if (clickedTextIndex !== -1) {
      handleTextClick(clickedTextIndex)
    } else {
      setPoints([...points, { x, y, text: '' }])
      setEditingTextIndex(points.length)
      setIsEditing(true)
    }
  }

  const handleTextChange = (e, index) => {
    const newText = e.target.value
    const updatedPoints = points.map((point, idx) =>
      idx === index ? { ...point, text: newText } : point
    )
    setPoints(updatedPoints)
  }

  const finishEditingText = (index) => {
    setIsEditing(false)
    setEditingTextIndex(null)

    if (points[index].text.trim() === '') {
      deleteTextPoint(index)
    } else {
      saveToHistory()
    }
  }

  const deleteTextPoint = (index) => {
    const updatedPoints = points.filter((_, idx) => idx !== index)
    setPoints(updatedPoints)
    saveToHistory()
  }

  const handleTextClick = (index) => {
    setEditingTextIndex(index) // Start editing mode for the clicked text
    setIsEditing(true) // Prevent adding new text while editing
  }

  const renderTextPoints = () => {
    return points.map((point, index) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: point.x,
          top: point.y,
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid #000',
          padding: '2px',
          borderRadius: '3px',
          pointerEvents: 'auto',
          fontSize: '12px',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          e.stopPropagation() // Prevent click event from triggering a new point
          handleTextClick(index)
        }}
      >
        {editingTextIndex === index ? (
          <Fragment>
            <input
              type='text'
              value={point.text}
              onChange={(e) => handleTextChange(e, index)}
              onBlur={() => finishEditingText(index)}
              autoFocus
              style={{
                pointerEvents: 'auto',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid black',
                fontSize: '12px'
              }}
            />
            <button
              onClick={() => deleteTextPoint(index)}
              style={{
                marginLeft: '4px',
                pointerEvents: 'auto',
                background: 'red',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                fontSize: '12px'
              }}
            >
              Delete
            </button>
          </Fragment>
        ) : (
          <span>{point.text}</span>
        )}
      </div>
    ))
  }

  const toggleTextMode = () => {
    setIsAddingText(!isAddingText)
    setMode(isAddingText ? null : 'text')
  }

  const handleSave = () => {
    if (imageContainerRef.current) {
      html2canvas(imageContainerRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'edited-image.png', {
              type: 'image/png'
            })
            onSave(file)
            onClose()
          }
        }, 'image/png')
      })
    }
  }

  const toggleMode = (selectedMode) => {
    if (selectedMode === 'crop') {
      setIsCropping((prev) => !prev)
      setMode((prevMode) => (prevMode === selectedMode ? null : selectedMode))

      if (!isCropping && editedImage) {
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
        if (canvas && editedImage) {
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
          {modes.crop && (
            <IconButton
              onClick={() => toggleMode(mode === 'crop' ? null : 'crop')}
              sx={{
                backgroundColor: mode === 'crop' ? 'lightgray' : 'transparent'
              }}
            >
              <CropIcon />
            </IconButton>
          )}
          {modes.text && (
            <IconButton
              onClick={() => toggleTextMode()}
              sx={{
                backgroundColor: isAddingText ? 'lightgray' : 'transparent'
              }}
            >
              <TextFieldsIcon />
            </IconButton>
          )}
          {modes.pen && (
            <IconButton
              onClick={() => toggleMode(mode === 'pen' ? null : 'pen')}
              sx={{
                backgroundColor: mode === 'pen' ? 'lightgray' : 'transparent'
              }}
            >
              <CreateIcon />
            </IconButton>
          )}
          {modes.highlighter && (
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
          )}
          {modes.eraser && (
            <IconButton
              onClick={() => toggleMode(mode === 'eraser' ? null : 'eraser')}
              sx={{
                backgroundColor: mode === 'eraser' ? 'lightgray' : 'transparent'
              }}
            >
              <FormatColorFillIcon />
            </IconButton>
          )}
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
          <Box
            sx={fixedBoxStyles}
            ref={imageContainerRef}
            onClick={addTextPoint}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
            />
            {renderTextPoints()}
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
