import React from 'react'
import ReactDOM from 'react-dom/client'
import { Question } from './index'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Question
            apiHost="http://localhost:3000"
            organizationId=""
            question={{}}
            onSubmit={() => {}}
            onResolve={() => {}}
        />
    </React.StrictMode>
)
