import { Field, Form, Formik } from 'formik'
import React, { useState } from 'react'

import { useOrg } from '../hooks/useOrg'
import { useUser } from '../hooks/useUser'
import { post } from '../lib/api'
import { Approval } from './Approval'
import Authentication from './Authentication'
import Avatar from './Avatar'
import Logo from './Logo'
import RichText from './RichText'

function QuestionForm({
  title,
  onSubmit,
  subject = true,
  loading,
  initialValues,
  formType
}) {
  const { user } = useUser()
  const { profileLink } = useOrg()
  const handleSubmit = async (values) => {
    onSubmit &&
      (await onSubmit(
        {
          ...values,
          email: user?.email,
          firstName: user?.profile?.first_name,
          lastName: user?.profile?.last_name
        },
        formType
      ))
  }
  return (
    <div className='squeak-form-frame'>
      {title && <h2>{title}</h2>}
      <Formik
        initialValues={{
          subject: '',
          question: '',
          ...initialValues
        }}
        validate={(values) => {
          const errors = {}
          if (!values.question) {
            errors.question = 'Required'
          }
          if (subject && !values.subject) {
            errors.subject = 'Required'
          }
          return errors
        }}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isValid }) => {
          return (
            <Form className='squeak-form'>
              <Avatar
                url={user?.profile && profileLink && profileLink(user?.profile)}
                image={user?.profile?.avatar}
              />

              <div className=''>
                <div class='squeak-inputs-wrapper'>
                  {subject && (
                    <>
                      <Field
                        required
                        id='subject'
                        name='subject'
                        placeholder='Title'
                        maxLength='140'
                      />
                      <hr />
                    </>
                  )}
                  <div className='squeak-form-richtext'>
                    <RichText
                      setFieldValue={setFieldValue}
                      initialValue={initialValues?.question}
                    />
                  </div>
                </div>
                <span className='squeak-reply-buttons-row'>
                  <button
                    className='squeak-post-button'
                    style={loading || !isValid ? { opacity: '.5' } : {}}
                    disabled={loading || !isValid}
                    type='submit'
                  >
                    {user ? 'Post' : 'Login & post'}
                  </button>
                  <div className='squeak-by-line'>
                    by
                    <a href='https://squeak.posthog.com?utm_source=post-form'>
                      <Logo />
                    </a>
                  </div>
                </span>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

export default function ({
  formType = 'question',
  messageID,
  onSubmit,
  onSignUp
}) {
  const { organizationId, apiHost, profileLink } = useOrg()
  const { user, setUser } = useUser()
  const [formValues, setFormValues] = useState(null)
  const [view, setView] = useState(null)
  const [loading, setLoading] = useState(false)
  const buttonText =
    formType === 'question' ? (
      <span>Ask a question</span>
    ) : (
      <span className='squeak-reply-label'>
        <strong>Reply</strong> to question
      </span>
    )

  const insertReply = async ({ body, messageID }) => {
    const { data } = await post(apiHost, '/api/reply', {
      body,
      organizationId,
      messageId: messageID
    })
    return data
  }

  const insertMessage = async ({ subject, body, userID }) => {
    const { data } = await post(apiHost, '/api/question', {
      subject,
      body,
      organizationId,
      slug: window.location.pathname.replace(/\/$/, '')
    })
    return data
  }

  const handleMessageSubmit = async (values) => {
    setLoading(true)
    const userID = user?.id
    if (userID) {
      let view = null
      if (formType === 'question') {
        const { published: messagePublished } = await insertMessage({
          subject: values.subject,
          body: values.question
        })
        if (!messagePublished) {
          view = 'approval'
        }
      }
      if (formType === 'reply') {
        const { published: replyPublished } = await insertReply({
          body: values.question,
          messageID
        })
        if (!replyPublished) {
          view = 'approval'
        }
      }

      if (onSubmit) {
        onSubmit(values, formType)
      }
      setLoading(false)
      setView(view)
      setFormValues(null)
    } else {
      setFormValues(values)
      setView('auth')
      setLoading(false)
    }
  }

  const doLogout = async () => {
    await post(apiHost, '/api/logout')
    setUser(null)
  }

  return view ? (
    {
      'question-form': (
        <QuestionForm
          subject={formType === 'question'}
          initialValues={formValues}
          loading={loading}
          onSubmit={handleMessageSubmit}
        />
      ),
      auth: (
        <Authentication
          banner={{
            title: 'Please signup to post.',
            body: 'Create an account to ask questions & help others.'
          }}
          buttonText={{
            login: 'Login & post question',
            signUp: 'Sign up & post question'
          }}
          setParentView={setView}
          formValues={formValues}
          handleMessageSubmit={handleMessageSubmit}
          loading={loading}
          onSignUp={onSignUp}
        />
      ),
      login: (
        <Authentication
          setParentView={setView}
          formValues={formValues}
          handleMessageSubmit={() => setView(null)}
          loading={loading}
          onSignUp={onSignUp}
        />
      ),
      approval: <Approval handleConfirm={() => setView(null)} />
    }[view]
  ) : (
    <div className='squeak-reply-buttons'>
      <Avatar
        url={user?.profile && profileLink && profileLink(user?.profile)}
        image={user?.profile?.avatar}
      />
      <button
        className={
          formType === 'reply' ? 'squeak-reply-skeleton' : 'squeak-ask-button'
        }
        onClick={() => setView('question-form')}
      >
        {buttonText}
      </button>
      {formType === 'question' && (
        <button
          onClick={() => {
            if (user) {
              doLogout()
            } else {
              setView('login')
            }
          }}
          className='squeak-auth-button'
        >
          {user ? 'Logout' : 'Login'}
        </button>
      )}
    </div>
  )
}
