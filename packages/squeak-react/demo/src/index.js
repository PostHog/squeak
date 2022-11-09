import React from 'react'
import ReactDOM from 'react-dom'

import { Squeak } from '../../src/components/main/Squeak'

ReactDOM.render(
  <div style={{ maxWidth: 450 }}>
    <Squeak apiHost='http://localhost:3001' organizationId='YOUR_ORG_ID' />
  </div>,
  document.getElementById('demo')
)
