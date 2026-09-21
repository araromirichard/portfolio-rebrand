-- Run this in Supabase SQL Editor (https://app.supabase.com → SQL Editor)

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  subtitle    TEXT,
  description TEXT,
  image_url   TEXT,
  live_url    TEXT,
  github_url  TEXT,
  stacks      TEXT[]      DEFAULT '{}',
  featured    BOOLEAN     DEFAULT false,
  order_index INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Stacks table
CREATE TABLE IF NOT EXISTS stacks (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL UNIQUE,
  icon       TEXT        DEFAULT '',
  category   TEXT        DEFAULT 'other' CHECK (category IN ('frontend','backend','database','devops','other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on projects
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Row-Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stacks   ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "public_read_projects" ON projects FOR SELECT USING (true);
CREATE POLICY "public_read_stacks"   ON stacks   FOR SELECT USING (true);

-- Authenticated users can write (the API uses service_role key which bypasses RLS,
-- but these policies protect direct client access)
CREATE POLICY "auth_write_projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_stacks"   ON stacks   FOR ALL USING (auth.role() = 'authenticated');

-- Seed with existing portfolio projects
INSERT INTO projects (title, subtitle, description, image_url, live_url, github_url, stacks, order_index) VALUES
  ('TryHyphen',        'Frontend', 'B2B Financial Process Automation and Workflow Management Software.',                                              'assets/img/tryhyphen.jpg',   'https://tryhyphen.com/',                             NULL,                                                   ARRAY['Vue.js'],                        1),
  ('Mont Mineral Water','FullStack','e-commerce website with admin dashboard to manage products, orders, payments and customers.',                    'assets/img/montweb.jpg',     'https://www.montwater.com/',                         'https://github.com/araromirichard/mont-mineral-water',  ARRAY['Vue.js','Laravel','Tailwind CSS'],2),
  ('Rana Farms',        'FullStack','An Agro-investment web application with dashboards for admins and investors to manage investments.',             'assets/img/ranaweb.jpg',     'https://rana.com.ng/',                               'https://github.com/Rana-farms/webfrontend',             ARRAY['Vue.js','Nuxt','Laravel'],        3),
  ('Romovees (Tevhey-roll)','Backend','An API built with the standard Go library and PostgreSQL. Lists movie details with auth, rate limiting and JSON responses.', 'assets/img/golangapi2.png', 'https://github.com/araromirichard/tevhey-roll', 'https://github.com/araromirichard/tevhey-roll',         ARRAY['Go','PostgreSQL'],               4)
ON CONFLICT DO NOTHING;
