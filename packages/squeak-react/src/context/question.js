import React, { createContext, useEffect, useState } from 'react'
import { useOrg } from '../hooks/useOrg'
import { useUser } from '../hooks/useUser'
import { doDelete, patch, post } from '../lib/api'

export const Context = createContext({})

export const Provider = ({
  children,
  question,
  onResolve,
  onSubmit,
  ...other
}) => {
  const { organizationId, apiHost } = useOrg()
  const { user } = useUser()
  const [replies, setReplies] = useState([])
  const [resolvedBy, setResolvedBy] = useState(question?.resolved_reply_id)
  const [resolved, setResolved] = useState(question?.resolved)
  const [firstReply] = replies
  const questionAuthorId = firstReply?.profile?.id || null

  const handleResolve = async (resolved, replyId = null) => {
    await post(apiHost, '/api/question/resolve', {
      messageId: question?.id,
      replyId,
      organizationId,
      resolved
    })
    setResolved(resolved)
    setResolvedBy(replyId)
    if (onResolve) {
      onResolve(resolved, replyId)
    }
  }

  const handleReplyDelete = async (id) => {
    await doDelete(apiHost, `/api/replies/${id}`, { organizationId })
    setReplies(replies.filter((reply) => id !== reply.id))
  }

  const handlePublish = async (id, published) => {
    await patch(apiHost, `/api/replies/${id}`, {
      organizationId: organizationId,
      published
    })
    const newReplies = [...replies]
    newReplies.some((reply) => {
      if (reply.id === id) {
        reply.published = published
        return true
      }
    })
    setReplies(newReplies)
  }

  useEffect(() => {
    setReplies(
      other.replies.filter(
        (reply) => reply.published || (!reply.published && user?.isModerator)
      )
    )
  }, [other.replies, user?.id])

  useEffect(() => {
    setResolved(question.resolved)
  }, [question.resolved])

  useEffect(() => {
    setResolvedBy(question.resolved_reply_id)
  }, [question.resolved_reply_id])

  const value = {
    replies,
    resolvedBy,
    resolved,
    questionAuthorId,
    question,
    onSubmit,
    handleResolve,
    handleReplyDelete,
    handlePublish
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}
