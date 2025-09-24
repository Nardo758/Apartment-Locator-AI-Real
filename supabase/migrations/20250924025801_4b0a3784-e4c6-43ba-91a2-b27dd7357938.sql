-- Create user data tracking tables
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'page_view', 'click', 'search', 'interaction', etc.
  page_url TEXT,
  element_clicked TEXT,
  activity_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  location_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user sessions tracking
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  pages_visited INTEGER DEFAULT 0,
  session_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data export requests table
CREATE TABLE public.data_export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL DEFAULT 'complete', -- 'complete', 'partial', 'category'
  export_format TEXT NOT NULL DEFAULT 'json', -- 'json', 'csv', 'pdf', 'xml'
  data_categories TEXT[] DEFAULT ARRAY['profile', 'activity', 'content'],
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  file_url TEXT,
  file_size BIGINT,
  delivery_method TEXT NOT NULL DEFAULT 'download', -- 'download', 'email'
  progress_percentage INTEGER DEFAULT 0,
  error_message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user content tracking
CREATE TABLE public.user_content_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'search', 'offer', 'favorite', 'note'
  content_id TEXT,
  content_data JSONB DEFAULT '{}',
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activity_logs
CREATE POLICY "Users can view their own activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" 
ON public.user_activity_logs 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" 
ON public.user_sessions 
FOR ALL 
USING (true);

-- Create RLS policies for data_export_requests
CREATE POLICY "Users can view their own export requests" 
ON public.data_export_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests" 
ON public.data_export_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own export requests" 
ON public.data_export_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_content_logs
CREATE POLICY "Users can view their own content logs" 
ON public.user_content_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert content logs" 
ON public.user_content_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_activity_logs_user_id_created_at ON public.user_activity_logs(user_id, created_at DESC);
CREATE INDEX idx_user_activity_logs_activity_type ON public.user_activity_logs(activity_type);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX idx_data_export_requests_user_id_status ON public.data_export_requests(user_id, status);
CREATE INDEX idx_user_content_logs_user_id_created_at ON public.user_content_logs(user_id, created_at DESC);

-- Create trigger to update timestamps
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_export_requests_updated_at
BEFORE UPDATE ON public.data_export_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();