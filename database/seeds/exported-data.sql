-- Nova Admin 数据库初始化数据
-- 自动导出时间: 2026-01-13 13:38:51
-- 使用方法: psql -U postgres -d nova_admin -f database/seeds/exported-data.sql

-- 清空现有数据 (如果表存在)
DO $$
BEGIN
    TRUNCATE TABLE sys_role_menu, sys_user_role, sys_operation_log, sys_i18n, sys_config, sys_menu_closure, sys_menu, sys_role, sys_user, sys_department_closure, sys_department, sys_dict_item, sys_dict_type CASCADE;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: sys_department
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: sys_menu
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
--
-- PostgreSQL database dump
--

\restrict BVtnuSWMJbwePM56e11aXTBMKLEL52Bs3HOvOkF7MA1CjaLjcRuadbnGftAgvqK

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

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
-- Data for Name: sys_config; Type: TABLE DATA; Schema: public; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.sys_config DISABLE TRIGGER ALL;

INSERT INTO public.sys_config VALUES ('40000000-0000-0000-0000-000000000001', 'site.name', 'Nova Admin', 'string', '站点名称', '2026-01-07 07:23:53.734253', '2026-01-07 07:23:53.734253', NULL, NULL, NULL);
INSERT INTO public.sys_config VALUES ('40000000-0000-0000-0000-000000000002', 'site.logo', '/logo.png', 'string', '站点Logo', '2026-01-07 07:23:53.734253', '2026-01-07 07:23:53.734253', NULL, NULL, NULL);
INSERT INTO public.sys_config VALUES ('40000000-0000-0000-0000-000000000003', 'user.defaultPassword', '123456', 'string', '用户默认密码', '2026-01-07 07:23:53.734253', '2026-01-07 07:23:53.734253', NULL, NULL, NULL);


ALTER TABLE public.sys_config ENABLE TRIGGER ALL;

--
-- Data for Name: sys_department; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_department DISABLE TRIGGER ALL;

INSERT INTO public.sys_department VALUES ('00000000-0000-0000-0000-000000000001', '总公司', 'HQ', '张总', '13800000001', 'hq@nova.com', 1, 1, '2026-01-07 07:23:53.730632', '2026-01-07 07:23:53.730632', NULL, NULL, NULL, NULL);
INSERT INTO public.sys_department VALUES ('00000000-0000-0000-0000-000000000002', '技术部', 'TECH', '李经理', '13800000002', 'tech@nova.com', 1, 1, '2026-01-07 07:23:53.730632', '2026-01-07 07:23:53.730632', NULL, NULL, NULL, NULL);
INSERT INTO public.sys_department VALUES ('00000000-0000-0000-0000-000000000003', '产品部', 'PRODUCT', '王经理', '13800000003', 'product@nova.com', 1, 2, '2026-01-07 07:23:53.730632', '2026-01-07 07:23:53.730632', NULL, NULL, NULL, NULL);
INSERT INTO public.sys_department VALUES ('00000000-0000-0000-0000-000000000004', '运营部', 'OPS', '赵经理', '13800000004', 'ops@nova.com', 1, 3, '2026-01-07 07:23:53.730632', '2026-01-07 07:23:53.730632', NULL, NULL, NULL, NULL);


ALTER TABLE public.sys_department ENABLE TRIGGER ALL;

--
-- Data for Name: sys_department_closure; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_department_closure DISABLE TRIGGER ALL;

INSERT INTO public.sys_department_closure VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');
INSERT INTO public.sys_department_closure VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002');
INSERT INTO public.sys_department_closure VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003');
INSERT INTO public.sys_department_closure VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004');
INSERT INTO public.sys_department_closure VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
INSERT INTO public.sys_department_closure VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003');
INSERT INTO public.sys_department_closure VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004');


ALTER TABLE public.sys_department_closure ENABLE TRIGGER ALL;

--
-- Data for Name: sys_dict_item; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_dict_item DISABLE TRIGGER ALL;

INSERT INTO public.sys_dict_item VALUES ('74b0792e-efa5-4d43-afd3-9c2205f3e2b9', '2026-01-08 07:44:11.46607', '2026-01-08 07:44:11.46607', NULL, NULL, NULL, 'i18n', '基础', 'common', '', 1, 0);
INSERT INTO public.sys_dict_item VALUES ('ba3acfe0-e912-4e13-828f-cbe19df470e6', '2026-01-08 07:44:22.793373', '2026-01-08 07:44:22.793373', NULL, NULL, NULL, 'i18n', '用户', 'user', '', 1, 0);
INSERT INTO public.sys_dict_item VALUES ('b1a9683d-8326-441d-8451-32cbe433a950', '2026-01-08 07:44:32.377102', '2026-01-08 07:44:32.377102', NULL, NULL, NULL, 'i18n', '菜单', 'menu', '', 1, 0);


ALTER TABLE public.sys_dict_item ENABLE TRIGGER ALL;

--
-- Data for Name: sys_dict_type; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_dict_type DISABLE TRIGGER ALL;

INSERT INTO public.sys_dict_type VALUES ('99071f0b-f185-4a71-b377-52688d568653', '2026-01-08 07:43:53.907697', '2026-01-08 07:43:53.907697', NULL, NULL, NULL, '多语言模块', 'i18n', '', 1, 0);


ALTER TABLE public.sys_dict_type ENABLE TRIGGER ALL;

--
-- Data for Name: sys_i18n; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_i18n DISABLE TRIGGER ALL;

INSERT INTO public.sys_i18n VALUES ('86bad619-5bf9-468c-9a45-4976e7f0e8f3', 'i18n', 'menu', '2026-01-08 09:14:22.751963', '2026-01-08 09:14:22.751963', NULL, NULL, NULL, '国际化', 'Internationalization', 'التدويل');
INSERT INTO public.sys_i18n VALUES ('15dd60d9-4294-4dc6-92af-1cb16e108195', 'roles', 'menu', '2026-01-09 06:49:28.490637', '2026-01-09 06:49:28.490637', NULL, NULL, NULL, '角色管理', 'Managing Roles', 'إدارة الأدوار');
INSERT INTO public.sys_i18n VALUES ('68feab63-f275-42bf-b190-310ff9e517e4', 'dict', 'menu', '2026-01-09 06:50:27.040148', '2026-01-09 06:51:17.705411', NULL, NULL, NULL, '字典管理', 'Dictionary management', 'إدارة القاموس');
INSERT INTO public.sys_i18n VALUES ('bab215e1-a37e-42d3-bcc3-f7eb1116f95c', 'system', 'menu', '2026-01-09 06:51:58.944229', '2026-01-09 06:51:58.944229', NULL, NULL, NULL, '系统设置', 'System', 'اعدادات النظام');
INSERT INTO public.sys_i18n VALUES ('59744cc4-0ebe-4f36-9fce-a89c0e19ab4d', 'systemManage', 'menu', '2026-01-09 06:52:28.393019', '2026-01-09 06:52:28.393019', NULL, NULL, NULL, '系统管理', 'System Management', 'إدارة النظام');
INSERT INTO public.sys_i18n VALUES ('e517c7ba-1ac0-4a58-8a84-60150ee4bc6f', 'menu', 'menu', '2026-01-09 06:52:59.056996', '2026-01-09 06:52:59.056996', NULL, NULL, NULL, '菜单管理', 'Menu Management', 'إدارة القائمة');
INSERT INTO public.sys_i18n VALUES ('0ae30263-0bdb-4cb2-bbf9-016ead3a0105', 'Dashboard', 'menu', '2026-01-09 06:53:21.023403', '2026-01-09 06:53:21.023403', NULL, NULL, NULL, '仪表盘', 'Dashboard', 'لوحة المعلومات');


ALTER TABLE public.sys_i18n ENABLE TRIGGER ALL;

--
-- Data for Name: sys_menu; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_menu DISABLE TRIGGER ALL;

INSERT INTO public.sys_menu VALUES ('a478a6d4-f22a-4fe4-bbc3-8bf5b2a1182e', '贪吃蛇', NULL, '/mini-games/snake', 'pages/mini-games/snake', NULL, NULL, 2, NULL, 0, true, 1, false, true, '2026-01-09 08:26:20.923336', '2026-01-09 08:26:32.074728', NULL, NULL, NULL, '69735e07-e8d3-4c57-acbd-5ff1371b4d2f');
INSERT INTO public.sys_menu VALUES ('f87d43fd-4f4d-484d-b43a-df59e89ff775', '2048', NULL, '/game-2048', 'pages/mini-games/2048', NULL, NULL, 2, NULL, 0, true, 1, false, true, '2026-01-09 08:30:39.427767', '2026-01-09 08:30:39.427767', NULL, NULL, NULL, '69735e07-e8d3-4c57-acbd-5ff1371b4d2f');
INSERT INTO public.sys_menu VALUES ('19b07600-52c6-4b82-b3d5-0a1b5026d2e2', '扫雷', NULL, '/mini-games/minesweeper', 'pages/mini-games/minesweeper', NULL, NULL, 2, NULL, 0, true, 1, false, true, '2026-01-09 08:34:53.089474', '2026-01-09 08:34:53.089474', NULL, NULL, NULL, '69735e07-e8d3-4c57-acbd-5ff1371b4d2f');
INSERT INTO public.sys_menu VALUES ('57db2ae8-bc1f-4f0c-8986-c025240552e5', '俄罗斯方块', NULL, '/mini-games/tetris', 'pages/mini-games/tetris', NULL, NULL, 2, NULL, 0, true, 1, false, true, '2026-01-09 08:33:00.338507', '2026-01-09 08:35:06.684873', NULL, NULL, NULL, '69735e07-e8d3-4c57-acbd-5ff1371b4d2f');
INSERT INTO public.sys_menu VALUES ('69735e07-e8d3-4c57-acbd-5ff1371b4d2f', '小游戏', NULL, NULL, NULL, NULL, 'LayoutDashboard', 1, NULL, 2, true, 1, false, true, '2026-01-09 08:24:10.648865', '2026-01-09 09:21:44.745276', NULL, NULL, NULL, NULL);
INSERT INTO public.sys_menu VALUES ('6a8a79be-093e-437b-b156-e4ae93279cb2', '国际化配置', 'menu.i18n', '/i18n', 'pages/system/i18n', NULL, 'Languages', 2, '1', 0, true, 1, false, true, '2026-01-08 06:24:57.586243', '2026-01-09 07:50:08.42675', NULL, NULL, NULL, '0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4');
INSERT INTO public.sys_menu VALUES ('7e8f532c-93e4-4c23-8346-e356a943e1ca', '菜单管理', 'menu.menu', '/menu', 'pages/system/menu/index', NULL, 'FolderTree', 2, '', 0, true, 1, false, true, '2026-01-08 02:13:51.444534', '2026-01-09 07:50:33.656831', NULL, NULL, NULL, '0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4');
INSERT INTO public.sys_menu VALUES ('639b077b-e318-4f72-87ff-35f9cf35ca0c', '系统设置', 'menu.system', '/setting', 'pages/system/setting', NULL, 'Settings', 2, NULL, 0, true, 1, false, true, '2026-01-08 03:21:28.465015', '2026-01-09 07:50:50.11788', NULL, NULL, NULL, '0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4');
INSERT INTO public.sys_menu VALUES ('17715464-3f01-4f80-9fdf-73b473313369', '字典管理', 'menu.dict', '/dict', 'pages/system/dict', NULL, 'Database', 2, '1', 1, true, 1, false, true, '2026-01-08 07:43:08.065765', '2026-01-09 07:51:06.655422', NULL, NULL, NULL, '0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4');
INSERT INTO public.sys_menu VALUES ('9cf2e2fd-3c34-4a67-892f-5ef65d8b5837', '角色管理', 'menu.roles', '/role', 'pages/system/role', NULL, 'UserCog', 2, NULL, 0, true, 1, false, true, '2026-01-08 02:51:04.342221', '2026-01-09 07:51:25.10433', NULL, NULL, NULL, '0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4');
INSERT INTO public.sys_menu VALUES ('0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4', '系统管理', 'menu.systemManage', NULL, NULL, NULL, 'Grid3X3', 1, NULL, 1, true, 1, false, true, '2026-01-08 02:33:26.256395', '2026-01-09 07:52:08.014311', NULL, NULL, NULL, NULL);
INSERT INTO public.sys_menu VALUES ('fdc99744-e1b5-4e43-bada-dee20c3db82f', '仪表盘', 'menu.Dashboard', '/dashboard', 'pages/dashboard', NULL, 'Home', 2, NULL, 0, true, 1, false, true, '2026-01-08 03:08:01.780379', '2026-01-09 07:52:20.08795', NULL, NULL, NULL, NULL);
INSERT INTO public.sys_menu VALUES ('57b99fa0-401e-412a-8fd5-3be2d1dec284', '用户管理', NULL, '/user', 'pages/system/user', NULL, 'User', 2, NULL, 0, true, 1, false, true, '2026-01-09 07:57:12.291331', '2026-01-09 07:57:25.599147', NULL, NULL, NULL, '0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4');


ALTER TABLE public.sys_menu ENABLE TRIGGER ALL;

--
-- Data for Name: sys_menu_closure; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_menu_closure DISABLE TRIGGER ALL;

INSERT INTO public.sys_menu_closure VALUES ('7e8f532c-93e4-4c23-8346-e356a943e1ca', '7e8f532c-93e4-4c23-8346-e356a943e1ca');
INSERT INTO public.sys_menu_closure VALUES ('0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4', '0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4');
INSERT INTO public.sys_menu_closure VALUES ('9cf2e2fd-3c34-4a67-892f-5ef65d8b5837', '9cf2e2fd-3c34-4a67-892f-5ef65d8b5837');
INSERT INTO public.sys_menu_closure VALUES ('0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4', '9cf2e2fd-3c34-4a67-892f-5ef65d8b5837');
INSERT INTO public.sys_menu_closure VALUES ('0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4', '7e8f532c-93e4-4c23-8346-e356a943e1ca');
INSERT INTO public.sys_menu_closure VALUES ('fdc99744-e1b5-4e43-bada-dee20c3db82f', 'fdc99744-e1b5-4e43-bada-dee20c3db82f');
INSERT INTO public.sys_menu_closure VALUES ('639b077b-e318-4f72-87ff-35f9cf35ca0c', '639b077b-e318-4f72-87ff-35f9cf35ca0c');
INSERT INTO public.sys_menu_closure VALUES ('0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4', '639b077b-e318-4f72-87ff-35f9cf35ca0c');
INSERT INTO public.sys_menu_closure VALUES ('6a8a79be-093e-437b-b156-e4ae93279cb2', '6a8a79be-093e-437b-b156-e4ae93279cb2');
INSERT INTO public.sys_menu_closure VALUES ('0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4', '6a8a79be-093e-437b-b156-e4ae93279cb2');
INSERT INTO public.sys_menu_closure VALUES ('17715464-3f01-4f80-9fdf-73b473313369', '17715464-3f01-4f80-9fdf-73b473313369');
INSERT INTO public.sys_menu_closure VALUES ('0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4', '17715464-3f01-4f80-9fdf-73b473313369');
INSERT INTO public.sys_menu_closure VALUES ('57b99fa0-401e-412a-8fd5-3be2d1dec284', '57b99fa0-401e-412a-8fd5-3be2d1dec284');
INSERT INTO public.sys_menu_closure VALUES ('0f320f4c-d9dd-41e3-bbe3-c0c1c3e95bc4', '57b99fa0-401e-412a-8fd5-3be2d1dec284');
INSERT INTO public.sys_menu_closure VALUES ('69735e07-e8d3-4c57-acbd-5ff1371b4d2f', '69735e07-e8d3-4c57-acbd-5ff1371b4d2f');
INSERT INTO public.sys_menu_closure VALUES ('a478a6d4-f22a-4fe4-bbc3-8bf5b2a1182e', 'a478a6d4-f22a-4fe4-bbc3-8bf5b2a1182e');
INSERT INTO public.sys_menu_closure VALUES ('69735e07-e8d3-4c57-acbd-5ff1371b4d2f', 'a478a6d4-f22a-4fe4-bbc3-8bf5b2a1182e');
INSERT INTO public.sys_menu_closure VALUES ('f87d43fd-4f4d-484d-b43a-df59e89ff775', 'f87d43fd-4f4d-484d-b43a-df59e89ff775');
INSERT INTO public.sys_menu_closure VALUES ('69735e07-e8d3-4c57-acbd-5ff1371b4d2f', 'f87d43fd-4f4d-484d-b43a-df59e89ff775');
INSERT INTO public.sys_menu_closure VALUES ('57db2ae8-bc1f-4f0c-8986-c025240552e5', '57db2ae8-bc1f-4f0c-8986-c025240552e5');
INSERT INTO public.sys_menu_closure VALUES ('69735e07-e8d3-4c57-acbd-5ff1371b4d2f', '57db2ae8-bc1f-4f0c-8986-c025240552e5');
INSERT INTO public.sys_menu_closure VALUES ('19b07600-52c6-4b82-b3d5-0a1b5026d2e2', '19b07600-52c6-4b82-b3d5-0a1b5026d2e2');
INSERT INTO public.sys_menu_closure VALUES ('69735e07-e8d3-4c57-acbd-5ff1371b4d2f', '19b07600-52c6-4b82-b3d5-0a1b5026d2e2');


ALTER TABLE public.sys_menu_closure ENABLE TRIGGER ALL;

--
-- Data for Name: sys_role; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_role DISABLE TRIGGER ALL;

INSERT INTO public.sys_role VALUES ('10000000-0000-0000-0000-000000000001', '超级管理员', 'SUPER_ADMIN', '拥有所有权限', 1, 1, '2026-01-07 07:23:53.731879', '2026-01-07 07:23:53.731879', NULL, NULL, NULL);
INSERT INTO public.sys_role VALUES ('10000000-0000-0000-0000-000000000002', '管理员', 'ADMIN', '系统管理员', 1, 2, '2026-01-07 07:23:53.731879', '2026-01-07 07:23:53.731879', NULL, NULL, NULL);
INSERT INTO public.sys_role VALUES ('10000000-0000-0000-0000-000000000003', '普通用户', 'USER', '普通用户权限', 1, 3, '2026-01-07 07:23:53.731879', '2026-01-07 07:23:53.731879', NULL, NULL, NULL);


ALTER TABLE public.sys_role ENABLE TRIGGER ALL;

--
-- Data for Name: sys_role_menu; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_role_menu DISABLE TRIGGER ALL;



ALTER TABLE public.sys_role_menu ENABLE TRIGGER ALL;

--
-- Data for Name: sys_user; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_user DISABLE TRIGGER ALL;

INSERT INTO public.sys_user VALUES ('20000000-0000-0000-0000-000000000002', 'test', '$2b$10$ItH0diwka2ytGAc.qPWrfuQ3c6bNzO8bjXHPIqNqmJWmk6JFIutHi', '测试用户', 'test@nova.com', '13800000001', NULL, 0, 1, '00000000-0000-0000-0000-000000000002', NULL, NULL, '2026-01-07 07:23:53.732308', '2026-01-07 07:23:53.732308', NULL, NULL, NULL);
INSERT INTO public.sys_user VALUES ('20000000-0000-0000-0000-000000000001', 'admin', '$2b$10$ItH0diwka2ytGAc.qPWrfuQ3c6bNzO8bjXHPIqNqmJWmk6JFIutHi', '超级管理员', 'admin@nova.com', '13800000000', NULL, 0, 1, '00000000-0000-0000-0000-000000000001', '2026-01-08 15:21:09.985', '::1', '2026-01-07 07:23:53.732308', '2026-01-08 07:21:09.992017', NULL, NULL, NULL);


ALTER TABLE public.sys_user ENABLE TRIGGER ALL;

--
-- Data for Name: sys_user_role; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sys_user_role DISABLE TRIGGER ALL;

INSERT INTO public.sys_user_role VALUES ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.sys_user_role VALUES ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003');


ALTER TABLE public.sys_user_role ENABLE TRIGGER ALL;

--
-- PostgreSQL database dump complete
--

\unrestrict BVtnuSWMJbwePM56e11aXTBMKLEL52Bs3HOvOkF7MA1CjaLjcRuadbnGftAgvqK

