export const sql = `CREATE TABLE public.squeak_config (
    id bigint NOT NULL,
    preflight_complete boolean DEFAULT false NOT NULL,
    slack_api_key text,
    slack_question_channel text,
    slack_signing_secret text,
    mailgun_api_key text,
    mailgun_domain text,
    company_name text,
    company_domain text,
    organization_id uuid NOT NULL,
    question_auto_publish boolean DEFAULT false NOT NULL
);

ALTER TABLE public.squeak_config ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.squeak_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.squeak_messages (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    subject text,
    slug text[],
    published boolean DEFAULT false NOT NULL,
    slack_timestamp text,
    organization_id uuid NOT NULL,
    profile_id uuid,
    resolved boolean DEFAULT false NOT NULL,
    resolved_reply_id bigint
);

ALTER TABLE public.squeak_messages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.squeak_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.squeak_organizations (
    name text,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);

CREATE TABLE public.squeak_profiles (
    first_name text,
    last_name text,
    avatar text,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);

CREATE TABLE public.squeak_profiles_readonly (
    role text DEFAULT 'user'::text NOT NULL,
    user_id uuid NOT NULL,
    id bigint NOT NULL,
    organization_id uuid NOT NULL,
    profile_id uuid NOT NULL
);

ALTER TABLE public.squeak_profiles_readonly ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.squeak_profiles_readonly_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE VIEW public.squeak_profiles_view AS
 SELECT squeak_profiles.id AS profile_id,
    squeak_profiles_readonly.user_id,
    squeak_profiles_readonly.organization_id,
    squeak_profiles.first_name,
    squeak_profiles.last_name,
    squeak_profiles.avatar,
    squeak_profiles_readonly.role
   FROM (public.squeak_profiles
     JOIN public.squeak_profiles_readonly ON ((squeak_profiles_readonly.profile_id = squeak_profiles.id)));

CREATE TABLE public.squeak_replies (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    body text,
    message_id bigint NOT NULL,
    organization_id uuid NOT NULL,
    profile_id uuid
);

CREATE TABLE public.squeak_replies_feedback (
    id bigint NOT NULL,
    reply_id bigint NOT NULL,
    type text NOT NULL,
    organization_id uuid NOT NULL,
    profile_id uuid NOT NULL
);

ALTER TABLE public.squeak_replies_feedback ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.squeak_replies_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE public.squeak_replies ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.squeak_replies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE VIEW public.squeak_replies_view AS
 SELECT r.id AS reply_id,
    r.message_id,
    r.organization_id,
    r.body,
    r.created_at,
    COALESCE(upvote.count, (0)::bigint) AS upvote_count,
    COALESCE(downvote.count, (0)::bigint) AS downvote_count,
    COALESCE(spam.count, (0)::bigint) AS spam_count
   FROM (((public.squeak_replies r
     LEFT JOIN ( SELECT count(*) AS count,
            squeak_replies_feedback.reply_id
           FROM public.squeak_replies_feedback
          WHERE (squeak_replies_feedback.type = 'upvote'::text)
          GROUP BY squeak_replies_feedback.reply_id) upvote ON ((r.id = upvote.reply_id)))
     LEFT JOIN ( SELECT count(*) AS count,
            squeak_replies_feedback.reply_id
           FROM public.squeak_replies_feedback
          WHERE (squeak_replies_feedback.type = 'downvote'::text)
          GROUP BY squeak_replies_feedback.reply_id) downvote ON ((r.id = downvote.reply_id)))
     LEFT JOIN ( SELECT count(*) AS count,
            squeak_replies_feedback.reply_id
           FROM public.squeak_replies_feedback
          WHERE (squeak_replies_feedback.type = 'spam'::text)
          GROUP BY squeak_replies_feedback.reply_id) spam ON ((r.id = spam.reply_id)));

CREATE TABLE public.squeak_webhook_config (
    id bigint NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    organization_id uuid NOT NULL
);

ALTER TABLE public.squeak_webhook_config ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.squeak_webhook_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY public.squeak_organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.squeak_profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.squeak_config
    ADD CONSTRAINT squeak_config_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.squeak_messages
    ADD CONSTRAINT squeak_messages_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.squeak_profiles_readonly
    ADD CONSTRAINT squeak_profiles_readonly_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.squeak_replies_feedback
    ADD CONSTRAINT squeak_replies_feedback_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.squeak_replies
    ADD CONSTRAINT squeak_replies_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.squeak_webhook_config
    ADD CONSTRAINT squeak_webhook_config_pkey PRIMARY KEY (id);

CREATE INDEX squeak_profiles_feedback_type_idx ON public.squeak_replies_feedback USING btree (type);

ALTER TABLE ONLY public.squeak_config
    ADD CONSTRAINT config_organizations_id_fkey FOREIGN KEY (organization_id) REFERENCES public.squeak_organizations(id);

ALTER TABLE ONLY public.squeak_messages
    ADD CONSTRAINT messages_organizations_id_fkey FOREIGN KEY (organization_id) REFERENCES public.squeak_organizations(id);

ALTER TABLE ONLY public.squeak_messages
    ADD CONSTRAINT messages_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.squeak_profiles(id);

ALTER TABLE ONLY public.squeak_messages
    ADD CONSTRAINT messages_resolved_reply_replies_id_fkey FOREIGN KEY (resolved_reply_id) REFERENCES public.squeak_replies(id);

ALTER TABLE ONLY public.squeak_profiles_readonly
    ADD CONSTRAINT profiles_readonly_organizations_id_fkey FOREIGN KEY (organization_id) REFERENCES public.squeak_organizations(id);

ALTER TABLE ONLY public.squeak_profiles_readonly
    ADD CONSTRAINT profiles_readonly_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.squeak_profiles(id);

ALTER TABLE ONLY public.squeak_profiles_readonly
    ADD CONSTRAINT profiles_readonly_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.squeak_replies_feedback
    ADD CONSTRAINT replies_feedback_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.squeak_organizations(id);

ALTER TABLE ONLY public.squeak_replies_feedback
    ADD CONSTRAINT replies_feedback_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.squeak_profiles(id);

ALTER TABLE ONLY public.squeak_replies_feedback
    ADD CONSTRAINT replies_feedback_reply_id_fkey FOREIGN KEY (reply_id) REFERENCES public.squeak_replies(id);

ALTER TABLE ONLY public.squeak_replies
    ADD CONSTRAINT replies_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.squeak_messages(id);

ALTER TABLE ONLY public.squeak_replies
    ADD CONSTRAINT replies_organizations_id_fkey FOREIGN KEY (organization_id) REFERENCES public.squeak_organizations(id);

ALTER TABLE ONLY public.squeak_replies
    ADD CONSTRAINT replies_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.squeak_profiles(id);

ALTER TABLE ONLY public.squeak_webhook_config
    ADD CONSTRAINT webhook_config_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.squeak_organizations(id);

CREATE FUNCTION public.check_organization_access(row_organization_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
        SELECT EXISTS (SELECT true FROM squeak_profiles_view WHERE organization_id = row_organization_id AND user_id = auth.uid());
    $$;

CREATE FUNCTION public.check_profile_access(row_profile_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
        SELECT EXISTS (SELECT true FROM squeak_profiles_view WHERE profile_id = row_profile_id AND user_id = auth.uid());
    $$;

CREATE FUNCTION public.get_is_admin() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
        SELECT CASE WHEN role = 'admin' THEN true ELSE false END
        FROM squeak_profiles_readonly
        WHERE user_id = auth.uid()
    $$;

CREATE POLICY "Allow delete to organization admins" ON public.squeak_messages FOR DELETE USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow delete to organization admins" ON public.squeak_replies FOR DELETE USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow delete to organization admins" ON public.squeak_replies_feedback FOR DELETE USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow delete to organization admins" ON public.squeak_webhook_config FOR DELETE USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow delete to user of feedback" ON public.squeak_replies_feedback FOR DELETE USING ((public.check_organization_access(organization_id) AND public.check_profile_access(profile_id)));

CREATE POLICY "Allow insert to organization admins" ON public.squeak_webhook_config FOR INSERT WITH CHECK ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow insert to organization users" ON public.squeak_messages FOR INSERT WITH CHECK (public.check_organization_access(organization_id));

CREATE POLICY "Allow insert to organization users" ON public.squeak_replies FOR INSERT WITH CHECK (public.check_organization_access(organization_id));

CREATE POLICY "Allow insert to organization users" ON public.squeak_replies_feedback FOR INSERT WITH CHECK (public.check_organization_access(organization_id));

CREATE POLICY "Allow select to all" ON public.squeak_messages FOR SELECT USING (true);

CREATE POLICY "Allow select to all" ON public.squeak_profiles FOR SELECT USING (true);

CREATE POLICY "Allow select to all" ON public.squeak_profiles_readonly FOR SELECT USING (true);

CREATE POLICY "Allow select to all" ON public.squeak_replies FOR SELECT USING (true);

CREATE POLICY "Allow select to all" ON public.squeak_replies_feedback FOR SELECT USING (true);

CREATE POLICY "Allow select to organization admins" ON public.squeak_config FOR SELECT USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow select to organization admins" ON public.squeak_organizations FOR SELECT USING ((public.get_is_admin() AND public.check_organization_access(id)));

CREATE POLICY "Allow select to organization admins" ON public.squeak_webhook_config FOR SELECT USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow update to organization admins" ON public.squeak_config FOR UPDATE USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow update to organization admins" ON public.squeak_messages FOR UPDATE USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow update to organization admins" ON public.squeak_organizations FOR UPDATE USING ((public.get_is_admin() AND public.check_organization_access(id)));

CREATE POLICY "Allow update to organization admins" ON public.squeak_profiles_readonly FOR UPDATE USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow update to organization admins" ON public.squeak_replies FOR UPDATE USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow update to organization admins" ON public.squeak_webhook_config FOR UPDATE USING ((public.get_is_admin() AND public.check_organization_access(organization_id)));

CREATE POLICY "Allow update to user of message" ON public.squeak_messages FOR UPDATE USING ((public.check_organization_access(organization_id) AND public.check_profile_access(profile_id)));

CREATE POLICY "Allow update to user of profile" ON public.squeak_profiles FOR UPDATE USING (public.check_profile_access(id));

ALTER TABLE public.squeak_config ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.squeak_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.squeak_organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.squeak_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.squeak_profiles_readonly ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.squeak_replies ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.squeak_replies_feedback ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.squeak_webhook_config ENABLE ROW LEVEL SECURITY;`
