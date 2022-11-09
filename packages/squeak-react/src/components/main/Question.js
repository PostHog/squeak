import React, { useRef } from 'react'
import root from 'react-shadow/styled-components'
import { Provider as OrgProvider } from '../../context/org'
import { Provider as UserProvider } from '../../context/user'
import SingleQuestion from '../Question'
import { Theme } from '../Theme'

export const Question = ({
  apiHost,
  organizationId,
  onResolve,
  onSubmit,
  question,
  url,
  apiKey,
  ...other
}) => {
  const containerRef = useRef()
  return (
    <root.div ref={containerRef}>
      <OrgProvider value={{ organizationId, apiHost }}>
        <UserProvider>
          <Theme containerRef={containerRef} />
          <div className='squeak'>
            <SingleQuestion
              apiHost={apiHost}
              replies={question?.replies}
              question={question?.question}
              onSubmit={onSubmit}
              onResolve={onResolve}
            />
          </div>
        </UserProvider>
      </OrgProvider>
    </root.div>
  )
}
