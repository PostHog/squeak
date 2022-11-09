import React, { useRef } from 'react'
import root from 'react-shadow/styled-components'
import Authentication from '../Authentication'
import { Theme } from '../Theme'
import { createGlobalStyle } from 'styled-components'

const Style = createGlobalStyle`
    .squeak {
        .squeak-avatar-container {
            display: none;
        }
        .squeak-authentication-form-container {
            margin-left: 0;
        }
    }
`

export const Login = ({ onSubmit, buttonText }) => {
  const containerRef = useRef()

  return (
    <root.div ref={containerRef}>
      <Theme containerRef={containerRef} />
      <Style />
      <div className='squeak'>
        <Authentication
          buttonText={buttonText}
          handleMessageSubmit={onSubmit}
        />
      </div>
    </root.div>
  )
}
