import React, { useState, useEffect } from 'react'

import Slider from '@mui/material/Slider'
import { useDebounce } from 'use-debounce'
import { Typography } from '@mui/material'

// Define props with TypeScript
interface DebouncedSliderProps {
  value: number[] // The initial range value of the slider
  min?: number // Minimum value
  max?: number // Maximum value
  step?: number // Step value
  debounceTime?: number // Debounce delay in milliseconds
  onChange: (value: number[]) => void // Callback for debounced value
}

const DebouncedRangeSlider: React.FC<DebouncedSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  debounceTime = 500,
  onChange
}) => {
  const [sliderValue, setSliderValue] = useState<number[]>(value)
  const [debouncedValue] = useDebounce(sliderValue, debounceTime)

  // Notify the parent component whenever the debounced value changes
  useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue])

  // Handle slider value changes
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number[]) // Ensure the value is a pair of numbers
  }

  return (
    <div className='flex flex-col'>
      <Slider
        value={sliderValue}
        min={min}
        max={max}
        step={step}
        onChange={handleSliderChange}
        valueLabelDisplay='auto'
      />
      <div className='flex justify-between items-center -mx-2'>
        <Typography>{min}</Typography>
        <Typography>{max}</Typography>
      </div>
    </div>
  )
}

export default DebouncedRangeSlider
