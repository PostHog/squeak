/// <reference types="cypress" />

import { randomString } from '../helpers'

const createTeam = (name) => {
    cy.intercept('GET', '/api/teams').as('api')

    cy.get('button').contains('New').click()
    cy.get('#team-name').type(name)
    cy.get('[role="dialog"]').get('button[type="submit"]').click()

    cy.wait('@api')
}

describe('Teams and Roadmaps', () => {
    beforeEach(() => {
        cy.login()
        cy.visit('/teams')
    })

    describe('Teams', () => {
        it('can navigate to the teams page', () => {
            cy.visit('/')
            cy.get('nav').get('a').contains('Teams').should('have.length', 1).click()

            cy.location('pathname').should('eq', '/teams')
        })

        it('can create a team', () => {
            cy.get('button').contains('New').should('have.length', 1).click()

            cy.get('[role="dialog"]').as('dialog')

            cy.get('@dialog').invoke('attr', 'data-headlessui-state').should('eq', 'open')

            cy.get('@dialog').get('#team-name').should('have.length', 1).should('have.focus').as('input')

            cy.get('@input').type('Test Team')

            cy.get('@dialog').get('button[type="submit"]').click()

            cy.get('tr').contains('Test Team')
        })

        it('can delete a team', () => {
            const teamName = randomString()
            createTeam(teamName)

            cy.get('table').contains('tr', teamName).should('have.length', 1).as('row')

            cy.get('@row').contains('Edit').click()

            cy.get('[role="dialog"]').find('form').as('form')

            cy.get('@form').find('#name').should('have.value', teamName)

            cy.intercept('GET', '/api/teams').as('refresh')

            cy.get('@form').find('button').contains('Delete').click()

            cy.get('@form').find('button').contains('Click to confirm').click()

            cy.wait('@refresh')

            cy.get('table').contains('tr', teamName).should('have.length', 0)
        })

        it('can update the name of a team', () => {
            const teamName = randomString()
            createTeam(teamName)

            cy.get('table').contains('tr', teamName).should('have.length', 1).as('row')

            cy.get('@row').contains('Edit').click()

            cy.get('[role="dialog"]').as('dialog')

            cy.get('@dialog').find('#name').as('input').should('have.value', teamName)

            const updatedName = randomString()
            cy.get('@input').clear().type(updatedName)

            cy.intercept('GET', '/api/teams').as('refresh')

            cy.get('@dialog').contains('Update').click()

            cy.wait('@refresh')

            cy.get('table').contains('tr', updatedName).should('have.length', 1)
            cy.get('table').contains('tr', teamName).should('have.length', 0)
        })

        it('can view a team-specific page', () => {
            cy.get('table').contains('tr', 'Website').should('have.length', 1).find('a').as('link')

            cy.get('@link')
                .invoke('attr', 'href')
                .should('match', /^\/team\/[0-9]+$/)
                .then((href) => {
                    cy.get('@link').click()

                    cy.location('pathname').should('eq', href)
                })
        })

        // TODO: Select a specific profile
        it('can add a team member', () => {
            cy.intercept('GET', /^\/api\/team\/[0-9]+$/).as('fetchTeam')

            cy.get('table').contains('Website').click()

            cy.location('pathname').should('match', /^\/team\/[0-9]+$/)

            cy.wait('@fetchTeam')

            cy.contains('Add member').click()

            cy.intercept('POST', /^\/api\/team\/[0-9]+$/).as('updateTeam')

            cy.contains('Add').click()

            cy.wait('@fetchTeam')

            cy.get('ul').find('li').should('have.length.greaterThan', 0)
        })
    })
})
