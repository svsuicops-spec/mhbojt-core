--
-- PostgreSQL database dump
--

\restrict UOfeLgTfkdaIseSb8feDWefPxQSefCiGeB6JAYNXZ4ePzQBlin6DBAA5gXI2qOS

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, stripe_customer_id, email, full_name, role, created_at, updated_at) FROM stdin;
5e891991-fc36-4219-a1c1-05c17eadb7d5	\N	test@example.com	Test User	candidate	2026-06-27 03:43:03.109247+00	2026-06-27 03:43:03.109247+00
user_3FhjwjqSWq1TJlv1SHmwVWGDaVO	\N	svsuic.ops@gmail.com	Van Phabmixay	admin	2026-06-28 03:28:48.625561+00	2026-06-28 04:42:34.273+00
user_3FlrTGx0Td4XXxYsf2m8CFTiIUd	\N	ttot1812@gmail.com	Van Phab1	candidate	2026-06-28 15:28:23.384089+00	2026-06-28 15:28:23.384089+00
user_3FvrM0fiM2uAgxr1WbiutJnA1SG	\N	mhbojt1782966331026@example.com	Test Builder	candidate	2026-07-02 04:25:32.415461+00	2026-07-02 04:25:32.415461+00
user_3Fw0XzDhgPcx35nK6LYuFGvliJo	\N	contenteng1782970867255@example.com	Content Tester	candidate	2026-07-02 05:41:08.755447+00	2026-07-02 05:41:08.755447+00
user_3Fw4Pg8ygJNREpkApuV09RLFZgO	\N	debughs1782972774617@example.com	Debug Handshake	candidate	2026-07-02 06:12:56.391942+00	2026-07-02 06:12:56.391942+00
user_3G0QQSk3n5ojT5VpaOtRq9izrX7	\N	dynasty-test-l2a5fi@example.com	Dynasty Tester	candidate	2026-07-03 19:13:10.730607+00	2026-07-03 19:13:10.730607+00
user_3G0Rhmh0e5Y5QHeuhzHMfQrruxP	\N	alice-dynasty-uaifin@example.com	Alice Dynasty	candidate	2026-07-03 19:23:43.19675+00	2026-07-03 19:23:43.19675+00
user_3G0S1DiQcq6EpCotQLLjwV6tFYB	\N	bob-dynasty-qcdzky@example.com	Bob Dynasty	candidate	2026-07-03 19:26:17.594262+00	2026-07-03 19:26:17.594262+00
user_3G0oWJPCc7bTiuM8vK0nOcRXfBX	\N	carol-dynasty-4deium@example.com	Carol Dynasty	candidate	2026-07-03 22:31:18.830644+00	2026-07-03 22:31:18.830644+00
user_3G0rj8Z5XDTqlplqtUsVuEvfdid	\N	nadia-sponsor-jj20mh@example.com	Nadia Sponsor	candidate	2026-07-03 22:57:41.446527+00	2026-07-03 22:57:41.446527+00
user_3G0rq7tfBDzJSaa1Mk1riXxOxI6	\N	oscar-candidate-vuyrf6@example.com	Oscar Candidate	candidate	2026-07-03 22:58:37.54051+00	2026-07-03 22:58:37.54051+00
user_3G0sBG3svtC3EgdPePfYiBtShqB	\N	nadia-sponsor-evzpux@example.com	Nadia Sponsor	candidate	2026-07-03 23:01:25.123665+00	2026-07-03 23:01:25.123665+00
user_3G0sRXp20ZB1plKSxd7Z0VeYKzM	\N	nadia-sponsor-qs2c2l@example.com	Nadia Sponsor	candidate	2026-07-03 23:03:33.622776+00	2026-07-03 23:03:33.622776+00
user_3G0sYAMuwjUWzLb2libhoY2Ncfn	\N	oscar-candidate-ogttua@example.com	Oscar Candidate	candidate	2026-07-03 23:04:26.95157+00	2026-07-03 23:04:26.95157+00
user_3G0tYPY5XMD2O8XZALqvjIIKl9L	\N	priya-sponsor-5zzlii@example.com	Priya Sponsor	candidate	2026-07-03 23:12:42.008515+00	2026-07-03 23:12:42.008515+00
user_3G0tdvz3tXn1Vzc084PXR6vaFB6	\N	manny-candidate-lepjkp@example.com	Manny Candidate	candidate	2026-07-03 23:13:26.449035+00	2026-07-03 23:13:26.449035+00
user_3G0tmOgptzjtdM8BZ3o46i96s6M	\N	nadia-sponsor2-iil8px@example.com	Nadia Sponsor	candidate	2026-07-03 23:14:33.440723+00	2026-07-03 23:14:33.440723+00
user_3G0trK7mBmzh9pjFYaer1H52zjw	\N	oscar-candidate2-jynlni@example.com	Oscar Candidate	candidate	2026-07-03 23:15:13.162666+00	2026-07-03 23:15:13.162666+00
user_3G35GtQm8vuwotPzGTowQ59tZgu	\N	somchai-tnoj7r@example.com	Somchai Traveler	candidate	2026-07-04 17:48:41.2194+00	2026-07-04 17:48:41.2194+00
user_3G3VSI1ztBCC3yqIzRaBKrQwZJY	\N	legacytrust1783200053963@example.com	Legacy Trust	candidate	2026-07-04 21:23:59.043543+00	2026-07-04 21:23:59.043543+00
\.


--
-- PostgreSQL database dump complete
--

\unrestrict UOfeLgTfkdaIseSb8feDWefPxQSefCiGeB6JAYNXZ4ePzQBlin6DBAA5gXI2qOS

