// React Imports
import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width={40} height={40} xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='0 0 95.2 79.1' {...props}>
      <defs></defs>
      <g>
        <g id='Layer_1'>
          <g>
            <path
              className='cls-1'
              d='M65.2,35.2l17.6,17.6-8.8,8.8-17.6-17.6-8.8-8.8-8.8,8.8-17.6,17.6-8.8-8.8,17.6-17.6-8.8-8.8L3.6,44h0c-4.9,4.9-4.9,12.7,0,17.6h0s8.8,8.8,8.8,8.8l8.8,8.8,8.8-8.8,17.6-17.6,17.6,17.6,8.8,8.8,8.8-8.8,8.8-8.8h0c4.9-4.9,4.9-12.7,0-17.6h0s-17.6-17.6-17.6-17.6l-8.8,8.8Z'
              fill='var(--mui-palette-primary-main)'
            />
            <polygon
              className='cls-1'
              points='38.8 8.8 30 17.6 38.8 26.4 47.6 17.6 56.4 26.4 65.2 17.6 56.4 8.8 47.6 0 38.8 8.8'
              fill='var(--mui-palette-primary-main)'
            />
          </g>
        </g>
      </g>
    </svg>
  )
}

export default Logo
