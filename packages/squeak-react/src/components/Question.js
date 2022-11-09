import React, { useEffect, useState } from 'react'

import { Provider as QuestionProvider } from '../context/question'
import { useOrg } from '../hooks/useOrg'
import { useQuestion } from '../hooks/useQuestion'
import { get } from '../lib/api'
import Avatar from './Avatar'
import QuestionForm from './QuestionForm'
import Reply from './Reply'

const getBadge = (questionAuthorId, replyAuthorId, replyAuthorRole) => {
  if (replyAuthorRole === 'admin' || replyAuthorRole === 'moderator') {
    return 'Moderator'
  }

  if (!questionAuthorId || !replyAuthorId) {
    return null
  }

  return questionAuthorId === replyAuthorId ? 'Author' : null
}

const Collapsed = ({ setExpanded }) => {
  const { replies, resolvedBy, questionAuthorId } = useQuestion()
  const reply =
    replies[replies.findIndex((reply) => reply?.id === resolvedBy)] ||
    replies[replies.length - 1]
  const replyCount = replies.length - 2
  const maxAvatars = Math.min(replyCount, 3)
  const replyAuthorMetadata =
    reply?.profile?.profiles_readonly?.[0] || reply?.profile?.metadata?.[0]

  const badgeText = getBadge(
    questionAuthorId,
    reply?.profile?.id,
    replyAuthorMetadata?.role
  )

  const avatars = []

  for (let reply of replies.slice(1)) {
    if (avatars.length >= maxAvatars) break
    const avatar = reply?.profile?.avatar
    if (avatar && !avatars.includes(avatar)) {
      avatars.push(avatar)
    }
  }

  if (avatars.length < maxAvatars) {
    avatars.push(...Array(maxAvatars - avatars.length))
  }

  return (
    <>
      <li>
        <div className='squeak-other-replies-container'>
          {avatars.map((avatar) => {
            return (
              <Avatar
                key={`${reply?.message_id}-${reply?.id}-${reply?.profile?.id}-${avatar}`}
                image={avatar}
              />
            )
          })}

          <button
            className='squeak-other-replies'
            onClick={() => setExpanded(true)}
          >
            View {replyCount} other {replyCount === 1 ? 'reply' : 'replies'}
          </button>
        </div>
      </li>

      <li
        key={reply?.id}
        className={`${resolvedBy === reply?.id ? 'squeak-solution' : ''} ${
          !reply?.published ? 'squeak-reply-unpublished' : ''
        }`}
      >
        <Reply className='squeak-post-reply' {...reply} badgeText={badgeText} />
      </li>
    </>
  )
}

const Expanded = () => {
  const question = useQuestion()
  const replies = question.replies?.slice(1)
  const { resolvedBy, questionAuthorId } = question

  return (
    <>
      {replies.map((reply) => {
        const replyAuthorMetadata =
          reply?.profile?.profiles_readonly?.[0] ||
          reply?.profile?.metadata?.[0]

        const badgeText = getBadge(
          questionAuthorId,
          reply?.profile?.id,
          replyAuthorMetadata?.role
        )

        return (
          <li
            key={reply.id}
            className={`${resolvedBy === reply.id ? 'squeak-solution' : ''} ${
              !reply.published ? 'squeak-reply-unpublished' : ''
            }`}
          >
            <Reply
              className='squeak-post-reply'
              {...reply}
              badgeText={badgeText}
            />
          </li>
        )
      })}
    </>
  )
}

const Replies = ({ expanded, setExpanded }) => {
  const { resolved, replies, onSubmit, question } = useQuestion()
  return (
    <>
      {replies && replies.length - 1 > 0 && (
        <ul
          className={`squeak-replies ${
            resolved ? 'squeak-thread-resolved' : ''
          }`}
        >
          {expanded || replies.length <= 2 ? (
            <Expanded />
          ) : (
            <Collapsed setExpanded={setExpanded} />
          )}
        </ul>
      )}
      {resolved ? (
        <div className='squeak-locked-message'>
          <p>This thread has been closed</p>
        </div>
      ) : (
        <div className='squeak-reply-form-container'>
          <QuestionForm
            onSubmit={onSubmit}
            messageID={question.id}
            formType='reply'
          />
        </div>
      )}
    </>
  )
}

export default function Question({ onSubmit, onResolve, apiHost, ...other }) {
  const [expanded, setExpanded] = useState(false)
  const [question, setQuestion] = useState(other?.question)
  const [replies, setReplies] = useState(other?.question?.replies || [])
  const [firstReply] = replies

  const {
    organizationId,
    config: { permalink_base, permalinks_enabled }
  } = useOrg()

  const getQuestion = async () => {
    const permalink = window.location.pathname
    const { response, data: question } = await get(apiHost, '/api/question', {
      organizationId,
      permalink
    })

    if (response.status !== 200) return null

    return question
  }

  useEffect(() => {
    if (!question && permalink_base) {
      getQuestion().then((question) => {
        setQuestion(question?.question)
        setReplies(question?.replies || [])
      })
    }
  }, [organizationId, permalink_base])

  useEffect(() => {
    setQuestion(other?.question)
  }, [other?.question])

  return question ? (
    <div className='squeak-question-container'>
      <Reply
        permalink={
          permalinks_enabled &&
          question?.permalink &&
          `/${permalink_base}/${question?.permalink}`
        }
        className='squeak-post'
        subject={question.subject}
        {...firstReply}
      />
      <QuestionProvider
        onSubmit={onSubmit}
        question={question}
        replies={replies}
        onResolve={onResolve}
      >
        <Replies expanded={expanded} setExpanded={setExpanded} />
      </QuestionProvider>
    </div>
  ) : null
}
