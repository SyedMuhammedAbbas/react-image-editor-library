# EditImageModal

A React component for editing images with cropping, drawing, and text features. This modal allows users to upload an image, apply edits, and save the edited image.

## Installation

```bash
npm install @syedabbas/react-image-editor-library
```

## Usage

```jsx
import EditImageModal from '@syedabbas/react-image-editor-library'

const YourComponent = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState(null)

  const handleSave = (file) => {
    // Handle the saved file
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Edit Image</button>
      <EditImageModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageSrc={imageSrc}
        onSave={handleSave}
      />
    </>
  )
}
```

## Props

| Prop                      | Type       | Default                  | Description                                                                |
| ------------------------- | ---------- | ------------------------ | -------------------------------------------------------------------------- |
| `isOpen`                  | `boolean`  | `false`                  | Controls the visibility of the modal.                                      |
| `onClose`                 | `function` | -                        | Callback function called when the modal is closed.                         |
| `imageSrc`                | `string`   | -                        | Source of the image to be edited.                                          |
| `onSave`                  | `function` | -                        | Callback function called with the edited image file when the user saves.   |
| `index`                   | `number`   | `0`                      | Index of the image in a collection (if applicable).                        |
| `modalStyle`              | `object`   | `{}`                     | Custom styles for the modal.                                               |
| `canvasStyle`             | `object`   | `{}`                     | Custom styles for the canvas.                                              |
| `sliderStyle`             | `object`   | `{}`                     | Custom styles for the sliders used for pen, highlighter, and eraser sizes. |
| `buttonStyle`             | `object`   | `{}`                     | Custom styles for the Done button.                                         |
| `initialPenColor`         | `string`   | `#000000`                | Initial color for the pen tool.                                            |
| `initialHighlighterColor` | `string`   | `rgba(255, 255, 0, 0.5)` | Initial color for the highlighter tool.                                    |
| `initialPenSize`          | `number`   | `2`                      | Initial size for the pen tool.                                             |
| `initialHighlighterSize`  | `number`   | `20`                     | Initial size for the highlighter tool.                                     |
| `initialEraserSize`       | `number`   | `20`                     | Initial size for the eraser tool.                                          |
| `fixedBoxSize`            | `number`   | `500`                    | Fixed size for the box containing the image and canvas.                    |

## Features

- **Cropping**: Users can crop images with adjustable aspect ratio.
- **Drawing**: Users can draw on the image using a pen, highlighter, or eraser.
- **Text Adding**: Users can click on the image to add text annotations.
- **Undo/Redo**: Users can undo or redo their actions.
- **Color Selection**: Users can choose colors for the pen and highlighter.
- **Image Saving**: Users can save the edited image as a PNG file.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or features you'd like to discuss.
