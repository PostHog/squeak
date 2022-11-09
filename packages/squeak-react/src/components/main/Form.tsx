import React, { useRef } from 'react'
import root from 'react-shadow/styled-components'
import { Provider as OrgProvider } from '../../context/org'
import { Provider as UserProvider } from '../../context/user'
import QuestionForm from '../QuestionForm'
import { Theme } from '../Theme'

export const Form = ({ apiHost, organizationId, onSubmit }) => {
  const containerRef = useRef()

  return (
    <root.div ref={containerRef}>
      <OrgProvider value={{ organizationId, apiHost }}>
        <UserProvider>
          <Theme containerRef={containerRef} />
          <div className='squeak'>
            <QuestionForm onSubmit={onSubmit} />
          </div>
        </UserProvider>
      </OrgProvider>
    </root.div>
  )
}
