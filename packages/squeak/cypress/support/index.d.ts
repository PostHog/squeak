/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject> {
        login(): Chainable<Subject>
    }
}
