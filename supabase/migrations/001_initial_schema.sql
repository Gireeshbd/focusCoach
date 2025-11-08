-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'elite');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE workspace_type AS ENUM ('personal', 'team');
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE pair_status AS ENUM ('pending', 'active', 'ended');

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
  subscription_status subscription_status,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  ai_requests_count INTEGER DEFAULT 0 NOT NULL,
  ai_requests_reset_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workspace_type workspace_type DEFAULT 'personal' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Workspace members table
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role workspace_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Columns table
CREATE TABLE public.columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Focus sessions table
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL, -- in milliseconds
  target_duration INTEGER NOT NULL, -- in milliseconds
  focus_quality INTEGER CHECK (focus_quality >= 1 AND focus_quality <= 10),
  reflection JSONB,
  distractions TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User stats table
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_focus_time BIGINT DEFAULT 0 NOT NULL, -- in milliseconds
  total_distraction_time BIGINT DEFAULT 0 NOT NULL, -- in milliseconds
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_session_date DATE,
  sessions_completed INTEGER DEFAULT 0 NOT NULL,
  average_focus_quality NUMERIC(3,1) DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'weekly', 'monthly', 'permanent'
  requirements JSONB NOT NULL,
  reward_badge TEXT NOT NULL,
  reward_description TEXT NOT NULL,
  tier_restriction subscription_tier,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User challenges table (tracking progress)
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress NUMERIC(5,2) DEFAULT 0 NOT NULL, -- percentage 0-100
  completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- User badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Flow templates table
CREATE TABLE public.flow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  is_premium BOOLEAN DEFAULT false NOT NULL,
  price NUMERIC(10,2),
  uses_count INTEGER DEFAULT 0 NOT NULL,
  rating NUMERIC(2,1) DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Accountability pairs table
CREATE TABLE public.accountability_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status pair_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  CHECK (user1_id != user2_id)
);

-- Indexes for performance
CREATE INDEX idx_columns_user_id ON public.columns(user_id);
CREATE INDEX idx_columns_workspace_id ON public.columns(workspace_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_column_id ON public.tasks(column_id);
CREATE INDEX idx_tasks_workspace_id ON public.tasks(workspace_id);
CREATE INDEX idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task_id ON public.focus_sessions(task_id);
CREATE INDEX idx_focus_sessions_start_time ON public.focus_sessions(start_time);
CREATE INDEX idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_flow_templates_creator_id ON public.flow_templates(creator_id);
CREATE INDEX idx_flow_templates_category ON public.flow_templates(category);
CREATE INDEX idx_flow_templates_public ON public.flow_templates(is_public) WHERE is_public = true;

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flow_templates_updated_at BEFORE UPDATE ON public.flow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create initial stats record
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);

  -- Create personal workspace
  INSERT INTO public.workspaces (owner_id, name, workspace_type)
  VALUES (NEW.id, 'My Workspace', 'personal');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user stats after focus session
CREATE OR REPLACE FUNCTION public.update_user_stats_after_session()
RETURNS TRIGGER AS $$
DECLARE
  prev_session_date DATE;
  days_diff INTEGER;
BEGIN
  -- Only update if session is completed (has end_time)
  IF NEW.end_time IS NOT NULL THEN
    -- Get previous session date
    SELECT last_session_date INTO prev_session_date
    FROM public.user_stats
    WHERE user_id = NEW.user_id;

    -- Calculate streak
    IF prev_session_date IS NULL THEN
      -- First session ever
      UPDATE public.user_stats
      SET current_streak = 1,
          longest_streak = GREATEST(longest_streak, 1)
      WHERE user_id = NEW.user_id;
    ELSE
      days_diff := DATE(NEW.end_time) - prev_session_date;

      IF days_diff = 0 THEN
        -- Same day, streak unchanged
        NULL;
      ELSIF days_diff = 1 THEN
        -- Consecutive day, increment streak
        UPDATE public.user_stats
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1)
        WHERE user_id = NEW.user_id;
      ELSE
        -- Streak broken, reset to 1
        UPDATE public.user_stats
        SET current_streak = 1
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;

    -- Update other stats
    UPDATE public.user_stats
    SET total_focus_time = total_focus_time + NEW.duration,
        sessions_completed = sessions_completed + 1,
        last_session_date = DATE(NEW.end_time),
        average_focus_quality = (
          SELECT AVG(focus_quality)
          FROM public.focus_sessions
          WHERE user_id = NEW.user_id AND focus_quality IS NOT NULL
        )
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_focus_session_completed
  AFTER INSERT OR UPDATE ON public.focus_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_after_session();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_pairs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Columns policies
CREATE POLICY "Users can view own columns"
  ON public.columns FOR SELECT
  USING (auth.uid() = user_id OR workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own columns"
  ON public.columns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own columns"
  ON public.columns FOR UPDATE
  USING (auth.uid() = user_id OR workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own columns"
  ON public.columns FOR DELETE
  USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id OR workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id OR workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Focus sessions policies
CREATE POLICY "Users can view own sessions"
  ON public.focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.focus_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.focus_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Challenges policies (read-only for users)
CREATE POLICY "Everyone can view active challenges"
  ON public.challenges FOR SELECT
  USING (active = true);

-- User challenges policies
CREATE POLICY "Users can view own challenges"
  ON public.user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON public.user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON public.user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- User badges policies
CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Workspaces policies
CREATE POLICY "Users can view own workspaces"
  ON public.workspaces FOR SELECT
  USING (auth.uid() = owner_id OR id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update workspaces"
  ON public.workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete workspaces"
  ON public.workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- Workspace members policies
CREATE POLICY "Members can view workspace members"
  ON public.workspace_members FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Owners can manage workspace members"
  ON public.workspace_members FOR ALL
  USING (workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
  ));

-- Flow templates policies
CREATE POLICY "Users can view public templates"
  ON public.flow_templates FOR SELECT
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create templates"
  ON public.flow_templates FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own templates"
  ON public.flow_templates FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own templates"
  ON public.flow_templates FOR DELETE
  USING (auth.uid() = creator_id);

-- Accountability pairs policies
CREATE POLICY "Users can view own accountability pairs"
  ON public.accountability_pairs FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create accountability pairs"
  ON public.accountability_pairs FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own accountability pairs"
  ON public.accountability_pairs FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
