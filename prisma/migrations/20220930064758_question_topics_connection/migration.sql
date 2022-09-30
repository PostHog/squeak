-- Renaming topicGroupId to topic_group_id on squeak_topics
ALTER TABLE "squeak_topics" RENAME COLUMN "topicGroupId" TO "topic_group_id";
ALTER TABLE "squeak_topics" RENAME CONSTRAINT "squeak_topics_topicGroupId_fkey" TO "squeak_topics_topic_group_id_fkey";

-- Create new squeak_question_topics table to connect topics to questions
CREATE TABLE "squeak_question_topics" (
    "question_id" BIGINT NOT NULL,
    "topic_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squeak_question_topics_pkey" PRIMARY KEY ("question_id","topic_id")
);

-- Add FKs to squeak_messages (questions) and squeak_topics tables
ALTER TABLE "squeak_question_topics" ADD CONSTRAINT "squeak_question_topics_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "squeak_messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "squeak_question_topics" ADD CONSTRAINT "squeak_question_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "squeak_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Expand existing topic lists into new table
INSERT INTO "squeak_question_topics"
SELECT
    question_id,
    id topic_id,
    created_at
FROM (
    SELECT
        id as question_id,
        unnest(topics) as topic
    FROM squeak_messages
)
AS topics
INNER JOIN squeak_topics ON topic = squeak_topics.label;

-- Drop old topics column
ALTER TABLE "squeak_messages" DROP COLUMN "topics";
