/// <reference types="cypress" />

import { randomString } from '../helpers'

describe('Account creation and login', () => {
    describe('Sign-up', () => {
        beforeEach(() => {
            cy.clearCookies()
            cy.visit('/signup')
        })

        it('should link back to login page', () => {
            cy.get('a').contains('Already got an account? Sign in instead').should('have.length', 1).click()
            cy.url().should('equal', `${Cypress.config('baseUrl')}/login`)
        })

        it('can create a new account', () => {
            const email = `${randomString()}@posthog.com`
            const password = randomString()

            cy.get('form').get('input[name="email"]').type(email)
            cy.get('form').get('input[name="password"]').type(password)

            cy.get('form').get('button[type="submit"]').click()

            cy.location('pathname').should('eq', '/signup/profile')

            cy.get('form').get('input[name="firstName"]').type('First')
            cy.get('form').get('input[name="lastName"]').type('Last')
            cy.get('form').get('input[name="organization"]').type('Test Organization')
            cy.get('form').get('input[name="url"]').type('https://posthog.com')

            cy.get('form').get('button[type="submit"]').click()

            cy.location('pathname').should('eq', '/questions')
        })

        it("can't create an account with an email that has already been used", () => {
            cy.get('form').get('input[name="email"]').type('test@posthog.com')
            cy.get('form').get('input[name="password"]').type('12345678')

            cy.get('form').get('button[type="submit"]').click()

            cy.location('pathname').should('eq', '/signup')

            cy.contains('Something went wrong when creating your account.').should('have.length', 1)
        })
    })

    describe('Login', () => {
        beforeEach(() => {
            cy.clearCookies()
            cy.visit('/login')
        })

        it("should redirect '/' to '/login' when logged out", () => {
            cy.visit('/')
            cy.url().should('equal', `${Cypress.config('baseUrl')}/login`)
        })

        it('submit should only be enabled when both password and email are filled', () => {
            cy.get('form').get('button[type=submit]').should('be.disabled')

            cy.get('form').get('input[name=email]').type('test@test.com')

            cy.get('form').get('button[type=submit]').should('be.disabled')

            cy.get('form').get('input[name=password]').type('test@test.com')

            cy.get('form').get('button[type=submit]').should('be.enabled')
        })

        it('navigates user to /forgot-password when clicking forgot password link', () => {
            cy.get('a').contains('Forgot your password?').should('have.length', 1).click()

            cy.url().should('equal', `${Cypress.config('baseUrl')}/forgot-password`)
        })

        it('navigates user back to /login when clicking the sign in link from /forgot-password', () => {
            cy.visit('/forgot-password')
            cy.get('a').contains('Remembered your password? Sign in instead').should('have.length', 1).click()

            cy.url().should('equal', `${Cypress.config('baseUrl')}/login`)
        })

        it("should redirect '/' to '/login' when logged out", () => {
            cy.visit('/')
            cy.url().should('equal', `${Cypress.config('baseUrl')}/login`)
        })

        it('can log in to existing account', () => {
            cy.get('form').get('input[name=email]').type('test@posthog.com')
            cy.get('form').get('input[name=password]').type('12345678')

            cy.get('form').get('button[type="submit"]').click()

            cy.location('pathname').should('eq', '/questions')
        })

        it("doesn't log in when providing the wrong password", () => {
            cy.get('form').get('input[name=email]').type('test@posthog.com')
            cy.get('form').get('input[name=password]').type('123456789')

            cy.get('form').get('button[type="submit"]').click()

            cy.location('pathname').should('eq', '/login')
            cy.contains('Invalid email or password').should('have.length', 1)
        })

        it('clears cookies when logging out', () => {
            cy.login()
            cy.intercept('/api/logout').as('logout')
            cy.get('button').contains('Logout').click()

            cy.wait('@logout').location('pathname').should('eq', '/login')

            cy.getCookie('squeak_session').should('be.null')
            cy.getCookie('squeak_organization_id').should('be.null')
        })
    })

    describe('Forgot password', () => {
        it('navigates user back to /login when clicking the sign in link from /forgot-password', () => {
            cy.visit('/forgot-password')
            cy.get('a').contains('Remembered your password? Sign in instead').should('have.length', 1).click()

            cy.url().should('equal', `${Cypress.config('baseUrl')}/login`)
        })
    })
})
