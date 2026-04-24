-- ============================================================
-- UpStream 上流工程サポートツール データベース定義
-- DB: PostgreSQL
-- 作成日: 2026-04-24
-- ============================================================

-- ============================================================
-- 【共通】ユーザー・プロジェクト管理
-- ============================================================

CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100),
    role          VARCHAR(20)  NOT NULL DEFAULT 'member',  -- admin / member / viewer
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    project_id   SERIAL PRIMARY KEY,
    project_name VARCHAR(200) NOT NULL,
    description  TEXT,
    owner_id     INT          NOT NULL REFERENCES users(user_id),
    status       VARCHAR(20)  NOT NULL DEFAULT 'active',  -- active / archived
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_members (
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL DEFAULT 'editor',  -- owner / editor / viewer
    joined_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- ============================================================
-- 【機能1】技術スタック提案
-- ============================================================

CREATE TABLE proposals (
    proposal_id   SERIAL PRIMARY KEY,
    project_id    INT          NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title         VARCHAR(200),
    project_type  VARCHAR(50)  NOT NULL,  -- web / mobile / api / ai / iot / enterprise / ec / cms
    scale         VARCHAR(20)  NOT NULL,  -- small / medium / large
    priority      VARCHAR(20)  NOT NULL,  -- speed / performance / security / scalability / cost
    description   TEXT,
    created_by    INT          NOT NULL REFERENCES users(user_id),
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proposal_results (
    result_id    SERIAL PRIMARY KEY,
    proposal_id  INT         NOT NULL REFERENCES proposals(proposal_id) ON DELETE CASCADE,
    category     VARCHAR(30) NOT NULL,  -- language / framework / service / feature
    name         VARCHAR(100) NOT NULL,
    reason       TEXT,
    sort_order   INT         NOT NULL DEFAULT 0
);

-- ============================================================
-- 【機能2】要件定義書
-- ============================================================

CREATE TABLE requirements (
    requirement_id  SERIAL PRIMARY KEY,
    project_id      INT          NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL DEFAULT '要件定義書',
    version         VARCHAR(20)  NOT NULL DEFAULT '1.0',
    status          VARCHAR(20)  NOT NULL DEFAULT 'draft',  -- draft / review / approved
    created_by      INT          NOT NULL REFERENCES users(user_id),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requirement_sections (
    section_id     SERIAL PRIMARY KEY,
    requirement_id INT          NOT NULL REFERENCES requirements(requirement_id) ON DELETE CASCADE,
    section_key    VARCHAR(50)  NOT NULL,  -- overview / functional / nonfunctional / constraints / glossary / custom
    title          VARCHAR(200) NOT NULL,
    sort_order     INT          NOT NULL DEFAULT 0,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requirement_fields (
    field_id    SERIAL PRIMARY KEY,
    section_id  INT          NOT NULL REFERENCES requirement_sections(section_id) ON DELETE CASCADE,
    label       VARCHAR(200) NOT NULL,
    field_type  VARCHAR(20)  NOT NULL DEFAULT 'textarea',  -- input / textarea
    content     TEXT         NOT NULL DEFAULT '',
    sort_order  INT          NOT NULL DEFAULT 0
);

-- ============================================================
-- 【機能3】システム構成図
-- ============================================================

CREATE TABLE architecture_diagrams (
    diagram_id   SERIAL PRIMARY KEY,
    project_id   INT          NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL DEFAULT 'システム構成図',
    description  TEXT,
    created_by   INT          NOT NULL REFERENCES users(user_id),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE architecture_nodes (
    node_id      SERIAL PRIMARY KEY,
    diagram_id   INT          NOT NULL REFERENCES architecture_diagrams(diagram_id) ON DELETE CASCADE,
    label        VARCHAR(100) NOT NULL,
    icon         VARCHAR(10),
    color        VARCHAR(20),
    pos_x        INT          NOT NULL DEFAULT 0,
    pos_y        INT          NOT NULL DEFAULT 0
);

CREATE TABLE architecture_connections (
    connection_id SERIAL PRIMARY KEY,
    diagram_id    INT NOT NULL REFERENCES architecture_diagrams(diagram_id) ON DELETE CASCADE,
    from_node_id  INT NOT NULL REFERENCES architecture_nodes(node_id) ON DELETE CASCADE,
    to_node_id    INT NOT NULL REFERENCES architecture_nodes(node_id) ON DELETE CASCADE,
    label         VARCHAR(100)
);

-- ============================================================
-- 【機能4】UML・画面遷移図
-- ============================================================

CREATE TABLE uml_diagrams (
    diagram_id   SERIAL PRIMARY KEY,
    project_id   INT          NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL DEFAULT 'UML図',
    diagram_type VARCHAR(30)  NOT NULL DEFAULT 'screen_transition',  -- screen_transition / state / activity
    created_by   INT          NOT NULL REFERENCES users(user_id),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE uml_nodes (
    node_id     SERIAL PRIMARY KEY,
    diagram_id  INT          NOT NULL REFERENCES uml_diagrams(diagram_id) ON DELETE CASCADE,
    node_type   VARCHAR(30)  NOT NULL,  -- screen / start / end / branch / action / form / etc.
    label       VARCHAR(100) NOT NULL,
    icon        VARCHAR(10),
    color       VARCHAR(20),
    pos_x       INT          NOT NULL DEFAULT 0,
    pos_y       INT          NOT NULL DEFAULT 0
);

CREATE TABLE uml_connections (
    connection_id SERIAL PRIMARY KEY,
    diagram_id    INT NOT NULL REFERENCES uml_diagrams(diagram_id) ON DELETE CASCADE,
    from_node_id  INT NOT NULL REFERENCES uml_nodes(node_id) ON DELETE CASCADE,
    to_node_id    INT NOT NULL REFERENCES uml_nodes(node_id) ON DELETE CASCADE,
    label         VARCHAR(100),
    line_type     VARCHAR(20) DEFAULT 'solid'  -- solid / dashed
);

-- ============================================================
-- 【機能5】画面レイアウト
-- ============================================================

CREATE TABLE screen_layouts (
    layout_id    SERIAL PRIMARY KEY,
    project_id   INT          NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL DEFAULT '画面レイアウト',
    screen_name  VARCHAR(100),
    canvas_width  INT         NOT NULL DEFAULT 1280,
    canvas_height INT         NOT NULL DEFAULT 720,
    created_by   INT          NOT NULL REFERENCES users(user_id),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE layout_elements (
    element_id    SERIAL PRIMARY KEY,
    layout_id     INT          NOT NULL REFERENCES screen_layouts(layout_id) ON DELETE CASCADE,
    element_type  VARCHAR(30)  NOT NULL,  -- header / sidebar / button / table / image / text / form / card / footer / search
    label         VARCHAR(200) NOT NULL,
    pos_x         INT          NOT NULL DEFAULT 0,
    pos_y         INT          NOT NULL DEFAULT 0,
    width         INT          NOT NULL DEFAULT 100,
    height        INT          NOT NULL DEFAULT 50,
    bg_color      VARCHAR(20),
    text_color    VARCHAR(20),
    sort_order    INT          NOT NULL DEFAULT 0
);

-- ============================================================
-- 【機能6】E-R図
-- ============================================================

CREATE TABLE er_diagrams (
    diagram_id   SERIAL PRIMARY KEY,
    project_id   INT          NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL DEFAULT 'E-R図',
    created_by   INT          NOT NULL REFERENCES users(user_id),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE er_entities (
    entity_id   SERIAL PRIMARY KEY,
    diagram_id  INT          NOT NULL REFERENCES er_diagrams(diagram_id) ON DELETE CASCADE,
    table_name  VARCHAR(100) NOT NULL,
    pos_x       INT          NOT NULL DEFAULT 0,
    pos_y       INT          NOT NULL DEFAULT 0
);

CREATE TABLE er_attributes (
    attribute_id SERIAL PRIMARY KEY,
    entity_id    INT          NOT NULL REFERENCES er_entities(entity_id) ON DELETE CASCADE,
    column_name  VARCHAR(100) NOT NULL,
    data_type    VARCHAR(50)  NOT NULL DEFAULT 'VARCHAR',
    is_pk        BOOLEAN      NOT NULL DEFAULT FALSE,
    is_fk        BOOLEAN      NOT NULL DEFAULT FALSE,
    is_nullable  BOOLEAN      NOT NULL DEFAULT TRUE,
    default_val  VARCHAR(200),
    sort_order   INT          NOT NULL DEFAULT 0
);

CREATE TABLE er_relations (
    relation_id    SERIAL PRIMARY KEY,
    diagram_id     INT          NOT NULL REFERENCES er_diagrams(diagram_id) ON DELETE CASCADE,
    from_entity_id INT          NOT NULL REFERENCES er_entities(entity_id) ON DELETE CASCADE,
    to_entity_id   INT          NOT NULL REFERENCES er_entities(entity_id) ON DELETE CASCADE,
    relation_type  VARCHAR(10)  NOT NULL DEFAULT '1:N',  -- 1:1 / 1:N / N:M
    label          VARCHAR(100)
);

-- ============================================================
-- 【機能7】ガントチャート
-- ============================================================

CREATE TABLE gantt_charts (
    chart_id     SERIAL PRIMARY KEY,
    project_id   INT          NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL DEFAULT 'ガントチャート',
    created_by   INT          NOT NULL REFERENCES users(user_id),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gantt_tasks (
    task_id      SERIAL PRIMARY KEY,
    chart_id     INT          NOT NULL REFERENCES gantt_charts(chart_id) ON DELETE CASCADE,
    parent_id    INT          REFERENCES gantt_tasks(task_id) ON DELETE SET NULL,
    task_name    VARCHAR(200) NOT NULL,
    is_phase     BOOLEAN      NOT NULL DEFAULT FALSE,
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    progress     INT          NOT NULL DEFAULT 0,  -- 0〜100
    color        VARCHAR(20),
    assigned_to  INT          REFERENCES users(user_id),
    sort_order   INT          NOT NULL DEFAULT 0
);

-- ============================================================
-- インデックス
-- ============================================================

CREATE INDEX idx_projects_owner        ON projects(owner_id);
CREATE INDEX idx_proposals_project     ON proposals(project_id);
CREATE INDEX idx_requirements_project  ON requirements(project_id);
CREATE INDEX idx_arch_diagrams_project ON architecture_diagrams(project_id);
CREATE INDEX idx_uml_diagrams_project  ON uml_diagrams(project_id);
CREATE INDEX idx_layouts_project       ON screen_layouts(project_id);
CREATE INDEX idx_er_diagrams_project   ON er_diagrams(project_id);
CREATE INDEX idx_gantt_charts_project  ON gantt_charts(project_id);
CREATE INDEX idx_gantt_tasks_chart     ON gantt_tasks(chart_id);
CREATE INDEX idx_gantt_tasks_parent    ON gantt_tasks(parent_id);
