--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'USER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'NOT_SENT',
    'SENT',
    'PENDING',
    'BUYER_REPLIED',
    'BUYER_NOT_INTERESTED'
);


ALTER TYPE public."Status" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'BLOCK'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Contact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Contact" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    company text NOT NULL,
    domain text,
    "countryId" integer,
    "companyLinkedin" text,
    "personalLinkedin" text,
    status public."Status" DEFAULT 'NOT_SENT'::public."Status" NOT NULL,
    note text,
    "authorId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Contact" OWNER TO postgres;

--
-- Name: Contact_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Contact_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Contact_id_seq" OWNER TO postgres;

--
-- Name: Contact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Contact_id_seq" OWNED BY public."Contact".id;


--
-- Name: Country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Country" (
    id integer NOT NULL,
    name text NOT NULL,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Country" OWNER TO postgres;

--
-- Name: Country_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Country_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Country_id_seq" OWNER TO postgres;

--
-- Name: Country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Country_id_seq" OWNED BY public."Country".id;


--
-- Name: Post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Post" (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    thumbnail text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    tags text[],
    views integer DEFAULT 0 NOT NULL,
    "authorId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Post" OWNER TO postgres;

--
-- Name: Post_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Post_id_seq" OWNER TO postgres;

--
-- Name: Post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Post_id_seq" OWNED BY public."Post".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Contact id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contact" ALTER COLUMN id SET DEFAULT nextval('public."Contact_id_seq"'::regclass);


--
-- Name: Country id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Country" ALTER COLUMN id SET DEFAULT nextval('public."Country_id_seq"'::regclass);


--
-- Name: Post id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post" ALTER COLUMN id SET DEFAULT nextval('public."Post_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Contact" (id, name, email, company, domain, "countryId", "companyLinkedin", "personalLinkedin", status, note, "authorId", "createdAt", "updatedAt") FROM stdin;
1	Vera Vicane	vera@euro.com	Eurodif	www.euro.com	1	www.linkedin.com	www.linkedin.com	NOT_SENT	Received reply	1	2026-02-24 19:49:34.839	2026-02-24 19:54:13.692
2	Caroline	caroline@eu.com	Eurodif	ww.eurodif.com	1	www.linkedin.com/asd	www.linkedin.com/asd	NOT_SENT	working	1	2026-02-25 00:07:53.198	2026-02-25 00:07:53.198
6	Michael Laurent	michael@techflow.com	TechFlow	www.techflow.com	1	https://www.linkedin.com/company/techflow	https://www.linkedin.com/in/michael-laurent	SENT	Cold email sent today	1	2026-02-25 00:18:31.154	2026-02-25 00:18:31.154
7	Sophie Martin	sophie@retailhub.com	RetailHub	www.retailhub.com	1	https://www.linkedin.com/company/retailhub	https://www.linkedin.com/in/sophie-martin	PENDING	Waiting for reply	1	2026-02-25 00:18:41.04	2026-02-25 00:18:41.04
8	Daniel Cruz	daniel@innovatek.com	Innovatek	www.innovatek.com	1	https://www.linkedin.com/company/innovatek	https://www.linkedin.com/in/daniel-cruz	BUYER_REPLIED	Requested pricing information	1	2026-02-25 00:18:48.237	2026-02-25 00:18:48.237
9	Emma Johansson	emma@scandicorp.com	ScandiCorp	www.scandicorp.com	1	https://www.linkedin.com/company/scandicorp	https://www.linkedin.com/in/emma-johansson	BUYER_NOT_INTERESTED	Not interested this quarter	1	2026-02-25 00:18:54.91	2026-02-25 00:18:54.91
10	Liam O'Connor	liam@greenenergy.com	GreenEnergy	www.greenenergy.com	1	https://www.linkedin.com/company/greenenergy	https://www.linkedin.com/in/liam-oconnor	NOT_SENT	Added from LinkedIn search	1	2026-02-25 00:19:01.886	2026-02-25 00:19:01.886
11	Isabella Rossi	isabella@italtrade.com	ItalTrade	www.italtrade.com	1	https://www.linkedin.com/company/italtrade	https://www.linkedin.com/in/isabella-rossi	SENT	Follow-up next week	1	2026-02-25 00:19:11.232	2026-02-25 00:19:11.232
12	Noah Williams	noah@marketbridge.com	MarketBridge	www.marketbridge.com	1	https://www.linkedin.com/company/marketbridge	https://www.linkedin.com/in/noah-williams	PENDING	Awaiting procurement approval	1	2026-02-25 00:19:18.749	2026-02-25 00:19:18.749
13	Olivia Brown	olivia@digitalsync.com	DigitalSync	www.digitalsync.com	1	https://www.linkedin.com/company/digitalsync	https://www.linkedin.com/in/olivia-brown	NOT_SENT	Potential enterprise client	1	2026-02-25 00:19:29.403	2026-02-25 00:19:29.403
14	Lucas Meier	lucas@alphasolutions.com	AlphaSolutions	www.alphasolutions.com	1	https://www.linkedin.com/company/alphasolutions	https://www.linkedin.com/in/lucas-meier	BUYER_REPLIED	Interested in demo call	1	2026-02-25 00:19:36.84	2026-02-25 00:19:36.84
15	Lucas Meierr	lucas@alphasolutions.com	AlphaSolutions	www.alphasolutions.com	1	AlphaSolutio	https://www.linkedin.com/in/lucas-meier	BUYER_REPLIED	Interested in demo call	2	2026-02-25 00:26:58.154	2026-02-25 01:11:40.882
\.


--
-- Data for Name: Country; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Country" (id, name, code, "createdAt", "updatedAt") FROM stdin;
1	USA	US	2026-02-24 19:49:22.188	2026-02-24 19:49:28.24
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Post" (id, title, content, thumbnail, "isFeatured", tags, views, "authorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, role, status, "isVerified", "updatedAt", "createdAt") FROM stdin;
2	Raihan Sharif	a.sharif@dazbd.com	mahina	ADMIN	ACTIVE	t	2026-02-24 22:43:34.052	2026-02-24 22:43:34.052
1	Abid	abid@demo.com	abid123	USER	ACTIVE	t	2026-02-24 23:07:45.368	2026-02-24 19:49:14.912
3	Laika Bangladesh	laikabangladesh@gmail.com	admin123	USER	ACTIVE	t	2026-02-24 23:10:27.347	2026-02-24 23:10:27.347
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8fc8df45-0aaf-4092-bc2d-0f7c5cf73e1b	3be4a1ef18cc59082293a9838394deba0b4239cc072cf25e2b7c61af5fba57b7	2026-02-25 01:48:12.256259+06	20260224194037_new	\N	\N	2026-02-25 01:48:12.232676+06	1
03e310c0-0fa1-4ac2-bb48-1b0ee4e116a1	0c03e3b165b5d74dff49dd8a7ddb2230e7d1c39c3a0cd443a1c13c19a8bf3643	2026-02-25 01:48:12.257852+06	20260224194437_createdat_added	\N	\N	2026-02-25 01:48:12.256605+06	1
\.


--
-- Name: Contact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Contact_id_seq"', 15, true);


--
-- Name: Country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Country_id_seq"', 1, true);


--
-- Name: Post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Post_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 4, true);


--
-- Name: Contact Contact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_pkey" PRIMARY KEY (id);


--
-- Name: Country Country_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Country"
    ADD CONSTRAINT "Country_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Country_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Country_name_key" ON public."Country" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Contact Contact_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Contact Contact_countryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES public."Country"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

