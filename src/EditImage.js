import React, { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

const ImageUploader = () => {
  const [image, setImage] = useState(null)
  const [points, setPoints] = useState([])
  const imageRef = useRef()

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImage(url)
    }
  }

  const addPoint = (e) => {
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const tooltip = prompt('Enter tooltip text:')
    if (tooltip) {
      setPoints([...points, { x, y, text: tooltip }])
    }
  }

  const downloadImage = () => {
    html2canvas(imageRef.current).then((canvas) => {
      const link = document.createElement('a')
      link.href = canvas.toDataURL()
      link.download = 'image_with_tooltips.png'
      link.click()
    })
  }

  return (
    <div>
      <input type='file' accept='image/*' onChange={handleImageUpload} />
      {image && (
        <div>
          <div
            ref={imageRef}
            onClick={addPoint}
            style={{
              position: 'relative',
              display: 'inline-block',
              cursor: 'pointer'
            }}
          >
            <img src={image} alt='Uploaded' style={{ maxWidth: '100%' }} />
            {points.map((point, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: point.x,
                  top: point.y,
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid #000',
                  padding: '2px',
                  borderRadius: '3px',
                  pointerEvents: 'none'
                }}
                title={point.text}
              >
                {point.text}
              </div>
            ))}
          </div>
          <button onClick={downloadImage}>Download Image</button>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
