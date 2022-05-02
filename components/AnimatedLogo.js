import React from 'react'

const AnimatedLogo = ({ className = '' }) => (
    <object className={className} type="image/svg+xml" data="/animated-logo.svg">
        Squeak! logo
    </object>
)

export default AnimatedLogo
