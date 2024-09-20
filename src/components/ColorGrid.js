import React, { Fragment } from 'react'
import { Box, Grid } from '@mui/material'

const ColorGrid = ({ onColorChange }) => {
  const colorOptions = [
    '#000000',
    '#FFFFFF',
    '#D3D3D3',
    '#A9A9A9',
    '#808080',
    '#696969',
    '#FF1493',
    '#FF0000',
    '#FFA500',
    '#FFD700',
    '#FFFF00',
    '#FFFFE0',
    '#32CD32',
    '#00FF00',
    '#008000',
    '#00FFFF',
    '#0000FF',
    '#000080',
    '#8A2BE2',
    '#4B0082',
    '#FFE4B5',
    '#D2691E',
    '#8B4513',
    '#A52A2A',
    '#FFC0CB',
    '#FFE4E1',
    '#FFFACD',
    '#98FB98',
    '#E0FFFF',
    '#E6E6FA'
  ]

  return (
    <Fragment>
      {colorOptions.map((color) => (
        <Grid item key={color}>
          <Box
            sx={{
              width: 30,
              height: 30,
              backgroundColor: color,
              borderRadius: '50%',
              cursor: 'pointer',
              border: '1px solid #ccc',
              '&:hover': {
                boxShadow: '0 0 5px rgba(0,0,0,0.3)'
              }
            }}
            onClick={() => onColorChange(color)}
          />
        </Grid>
      ))}
    </Fragment>
  )
}

export { ColorGrid }
