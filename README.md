# react-image-editor-library

> Made with create-react-library

[![NPM](https://img.shields.io/npm/v/react-image-editor-library.svg)](https://www.npmjs.com/package/react-image-editor-library) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-image-editor-library
```

## Usage

```jsx
import React, { useState } from 'react'
import { EditImageModal } from '@syedabbas/react-image-editor-library'
import '@syedabbas/react-image-editor-library/dist/index.css'

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
        type='file'
        accept='.jpg,.jpeg,.png,.gif'
        onChange={handleChange}
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
```

## License

MIT © [SyedMuhammedAbbas](https://github.com/SyedMuhammedAbbas)
