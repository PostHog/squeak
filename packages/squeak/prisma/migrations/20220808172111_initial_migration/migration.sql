-- CreateTable
CREATE TABLE "pgmigrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "run_on" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "pgmigrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_config" (
    "id" BIGSERIAL NOT NULL,
    "preflight_complete" BOOLEAN NOT NULL DEFAULT false,
    "slack_api_key" TEXT,
    "slack_question_channel" TEXT,
    "slack_signing_secret" TEXT,
    "mailgun_api_key" TEXT,
    "mailgun_domain" TEXT,
    "company_name" TEXT,
    "company_domain" TEXT,
    "organization_id" UUID NOT NULL,
    "question_auto_publish" BOOLEAN NOT NULL DEFAULT true,
    "allowed_origins" TEXT[],
    "reply_auto_publish" BOOLEAN NOT NULL DEFAULT true,
    "show_slack_user_profiles" BOOLEAN NOT NULL DEFAULT false,
    "mailgun_from_name" TEXT,
    "mailgun_from_email" TEXT,
    "permalink_base" TEXT,
    "permalinks_enabled" BOOLEAN DEFAULT false,

    CONSTRAINT "squeak_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_messages" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subject" TEXT,
    "slug" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "slack_timestamp" TEXT,
    "organization_id" UUID NOT NULL,
    "profile_id" UUID,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_reply_id" BIGINT,
    "topics" TEXT[],
    "permalink" TEXT,

    CONSTRAINT "squeak_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_organizations" (
    "name" TEXT,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_replies" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" TEXT,
    "message_id" BIGINT NOT NULL,
    "organization_id" UUID NOT NULL,
    "profile_id" UUID,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "squeak_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_replies_feedback" (
    "id" BIGSERIAL NOT NULL,
    "reply_id" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squeak_replies_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_topics" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" UUID NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "squeak_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_webhook_config" (
    "id" BIGSERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squeak_webhook_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "instance_id" UUID,
    "id" UUID NOT NULL,
    "aud" VARCHAR(255),
    "role" VARCHAR(255),
    "email" VARCHAR(255),
    "encrypted_password" VARCHAR(255),
    "email_confirmed_at" TIMESTAMPTZ(6),
    "invited_at" TIMESTAMPTZ(6),
    "confirmation_token" VARCHAR(255),
    "confirmation_sent_at" TIMESTAMPTZ(6),
    "recovery_token" VARCHAR(255),
    "recovery_sent_at" TIMESTAMPTZ(6),
    "email_change_token_new" VARCHAR(255),
    "email_change" VARCHAR(255),
    "email_change_sent_at" TIMESTAMPTZ(6),
    "last_sign_in_at" TIMESTAMPTZ(6),
    "raw_app_meta_data" JSONB,
    "raw_user_meta_data" JSONB,
    "is_super_admin" BOOLEAN,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "phone" VARCHAR(15),
    "phone_confirmed_at" TIMESTAMPTZ(6),
    "phone_change" VARCHAR(15) DEFAULT '',
    "phone_change_token" VARCHAR(255) DEFAULT '',
    "phone_change_sent_at" TIMESTAMPTZ(6),
    "confirmed_at" TIMESTAMPTZ(6),
    "email_change_token_current" VARCHAR(255) DEFAULT '',
    "email_change_confirm_status" SMALLINT DEFAULT 0,
    "banned_until" TIMESTAMPTZ(6),
    "reauthentication_token" VARCHAR(255) DEFAULT '',
    "reauthentication_sent_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_profiles" (
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar" TEXT,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_profiles_readonly" (
    "role" TEXT NOT NULL DEFAULT 'user',
    "user_id" UUID,
    "id" BIGSERIAL NOT NULL,
    "organization_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slack_user_id" TEXT,

    CONSTRAINT "squeak_profiles_readonly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "instance_id" UUID,
    "id" BIGSERIAL NOT NULL,
    "token" VARCHAR(255),
    "user_id" VARCHAR(255),
    "revoked" BOOLEAN,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "parent" VARCHAR(255),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "squeak_profiles_feedback_type_idx" ON "squeak_replies_feedback"("type");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_instance_id_email_idx" ON "users"("instance_id");

-- CreateIndex
CREATE INDEX "users_instance_id_idx" ON "users"("instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_unique" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_instance_id_idx" ON "refresh_tokens"("instance_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "refresh_tokens"("instance_id", "user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_parent_idx" ON "refresh_tokens"("parent");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "squeak_config" ADD CONSTRAINT "config_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "squeak_organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_messages" ADD CONSTRAINT "messages_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "squeak_organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_messages" ADD CONSTRAINT "messages_resolved_reply_replies_id_fkey" FOREIGN KEY ("resolved_reply_id") REFERENCES "squeak_replies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_messages" ADD CONSTRAINT "messages_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "squeak_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_replies" ADD CONSTRAINT "replies_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "squeak_messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_replies" ADD CONSTRAINT "replies_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "squeak_organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_replies" ADD CONSTRAINT "replies_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "squeak_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_replies_feedback" ADD CONSTRAINT "replies_feedback_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "squeak_organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_replies_feedback" ADD CONSTRAINT "replies_feedback_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "squeak_replies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_replies_feedback" ADD CONSTRAINT "replies_feedback_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "squeak_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_topics" ADD CONSTRAINT "topics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "squeak_organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_webhook_config" ADD CONSTRAINT "webhook_config_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "squeak_organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_profiles_readonly" ADD CONSTRAINT "profiles_readonly_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "squeak_organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_profiles_readonly" ADD CONSTRAINT "profiles_readonly_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squeak_profiles_readonly" ADD CONSTRAINT "profiles_readonly_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "squeak_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_parent_fkey" FOREIGN KEY ("parent") REFERENCES "refresh_tokens"("token") ON DELETE NO ACTION ON UPDATE NO ACTION;
