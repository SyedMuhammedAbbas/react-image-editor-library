import React, { useState } from 'react'
import { EditImageModal } from 'react-image-editor-library'

function App() {
  const [imagePreviewFlag, setImagePreviewFlag] = useState(false)
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null)

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviewFlag(true)
        setSelectedPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)

      e.target.value = null
    }
  }

  return (
    <div>
      <h1>Test Image Editor Modal</h1>
      <input
        // style={{ display: 'none' }}
        type='file'
        id='text-button-file-docs'
        accept='.jpg,.jpeg,.png,.gif'
        onChange={(e) => {
          handleChange(e)
        }}
      />
      <EditImageModal
        isOpen={imagePreviewFlag}
        imageSrc={selectedPreviewImage}
        onClose={() => {
          setImagePreviewFlag(false)
          setSelectedPreviewImage(null)
        }}
        onSave={(editedImage) => {
          setImagePreviewFlag(false)
          setSelectedPreviewImage(editedImage)
        }}
      />

      {selectedPreviewImage && <img src={selectedPreviewImage} alt='Edited' />}
    </div>
  )
}

export default App
