Cypress.Commands.add('login', () => {
    cy.request({
        method: 'POST',
        url: '/api/login',
        headers: {
            Origin: 'http://localhost:3000',
        },
        body: {
            email: 'test@posthog.com',
            password: '12345678',
        },
    })

    cy.visit('/')
})

export {}
