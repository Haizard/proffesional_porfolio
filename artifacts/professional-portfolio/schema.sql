-- haithammisape Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  icon TEXT,
  category TEXT,
  features JSONB DEFAULT '[]',
  price_from DECIMAL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_service_slugs TEXT[] DEFAULT '{}',
  related_product_slugs TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL NOT NULL,
  compare_at_price DECIMAL,
  images TEXT[] DEFAULT '{}',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  specs JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  related_service_slugs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
  total DECIMAL NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTACT INQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service_category TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','converted','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: users can read/update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Services: public read, admin write
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view services" ON services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Blog: public read published, admin all
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage all posts" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products: public read active, admin all
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders: users see their own, admins see all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all order items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Inquiries: insert for all, read/manage for admins
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit inquiries" ON contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage inquiries" ON contact_inquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- SEED DATA — Services
-- ============================================================
INSERT INTO services (name, slug, description, long_description, icon, category, features, price_from, is_featured) VALUES
('AI Agent Automation', 'ai-agent-automation', 'Transform your business from manual to intelligent AI agent execution using n8n, Hermes, and custom agents.', 'We analyse your business workflows and implement intelligent AI agents that automate repetitive tasks, decision-making, and inter-department communication. From email triage to data processing pipelines, we build agents that work 24/7.', 'bot', 'ai-automation', '["Workflow analysis", "n8n pipeline design", "Custom agent training", "Integration with existing tools", "Ongoing monitoring & support"]', 2500, true),
('Marketing AI Solutions', 'marketing-ai-solutions', 'Data-driven marketing powered by AI — content generation, campaign automation, lead scoring, and analytics.', 'From AI-generated content strategies to automated social media and email campaigns, we build marketing systems that scale. Includes lead scoring, audience segmentation, and real-time performance dashboards.', 'megaphone', 'marketing', '["AI content generation", "Campaign automation", "Lead scoring models", "Analytics dashboards", "A/B testing frameworks"]', 1500, true),
('Website Design & Development', 'website-design-development', 'Stunning, high-performance websites built with modern frameworks and optimised for conversion.', 'We design and develop websites that not only look world-class but convert visitors into customers. Built on Next.js, React, and other modern stacks with SEO, performance, and accessibility built in from day one.', 'globe', 'web-development', '["Custom UI/UX design", "Next.js / React development", "SEO optimisation", "Performance tuning", "CMS integration", "Ongoing maintenance"]', 3000, false),
('Custom SaaS Development', 'custom-saas-development', 'End-to-end SaaS application development — from architecture to launch and beyond.', 'We build full-featured SaaS products with scalable backends, beautiful frontends, payment integration, user management, and everything you need to go to market fast.', 'code-2', 'saas-development', '["System architecture", "Full-stack development", "Payment integration", "User auth & permissions", "API design", "Deployment & DevOps"]', 8000, true),
('B2B Project Delivery', 'b2b-project-delivery', 'End-to-end project delivery for businesses — from scoping to handoff, on time and on budget.', 'We manage and deliver complex B2B technology projects with a dedicated team, clear communication, and robust project management. Fixed-price or time-and-materials engagements available.', 'handshake', 'b2b-delivery', '["Project scoping", "Dedicated team", "Weekly reporting", "Quality assurance", "Knowledge transfer", "Post-launch support"]', 5000, false),
('Forex Bot Development', 'forex-bot-development', 'Automated trading bots that execute strategies in the forex market with precision and speed.', 'We develop custom forex trading bots using proven algorithmic strategies, risk management systems, and real-time market data feeds. Supports MT4, MT5, and direct broker APIs.', 'trending-up', 'forex-bots', '["Strategy coding", "Backtesting", "Risk management", "MT4/MT5 support", "Live monitoring", "Performance reporting"]', 3500, true),
('Custom Computer Building', 'custom-computer-building', 'Hand-built custom PCs for business workstations, gaming rigs, and enterprise servers.', 'Every machine is assembled to order with premium components, tested for stability, and shipped ready to use. Business, gaming, and server configurations available with warranty and support.', 'cpu', 'computer-building', '["Component sourcing", "Professional assembly", "Stress testing", "Windows/Linux setup", "Warranty included", "Remote support"]', 800, false),
('AI-Implanted Machines', 'ai-implanted-machines', 'Pre-built computers with locally running AI agents already configured and ready for your business.', 'Purpose-built workstations that ship with locally hosted AI models, pre-configured agents for your use case, and no cloud dependency. Your data stays on-premise. Includes setup and staff training.', 'brain-circuit', 'ai-machines', '["Local LLM deployment", "Agent pre-configuration", "Business use-case setup", "Staff training", "No cloud dependency", "Ongoing updates"]', 2000, true),
('AI Agent Configuration', 'ai-agent-configuration', 'We configure and implement AI agents tailored to your specific business model and workflows.', 'Already have the infrastructure? We specialise in configuring AI agents — from prompt engineering to tool integration — that slot seamlessly into your existing business processes.', 'settings-2', 'ai-configuration', '["Business process analysis", "Agent configuration", "Tool integration", "Prompt engineering", "Testing & validation", "Staff training"]', 1200, false),
('Server Setup & Management', 'server-setup-management', 'Professional server setup for companies and gaming infrastructure — on-premise and cloud.', 'From bare-metal server builds to cloud infrastructure, we handle installation, configuration, security hardening, monitoring, and ongoing management for business and gaming servers.', 'server', 'server-setup', '["Hardware sourcing", "OS installation", "Security hardening", "Network configuration", "Monitoring setup", "Ongoing management"]', 2000, false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA — Products
-- ============================================================
INSERT INTO products (name, slug, description, long_description, price, compare_at_price, images, category, tags, stock, features, specs, is_featured) VALUES
('WorkStation Pro X1', 'workstation-pro-x1', 'High-performance business workstation built for demanding professional workloads.', 'The WorkStation Pro X1 is engineered for professionals who need raw performance without compromise. Featuring the latest Intel Core i9 processor, 64GB DDR5 RAM, and a dedicated NVIDIA RTX 4070, it handles video editing, 3D rendering, software development, and AI workloads with ease.', 2499.00, 2999.00, '[]', 'business-pc', ARRAY['workstation', 'business', 'intel'], 10, '["Intel Core i9-14900K", "64GB DDR5 RAM", "2TB NVMe SSD", "NVIDIA RTX 4070 12GB", "Windows 11 Pro", "3-year warranty"]', '{"CPU": "Intel Core i9-14900K", "RAM": "64GB DDR5-5600", "Storage": "2TB Samsung 990 Pro NVMe", "GPU": "NVIDIA RTX 4070 12GB", "PSU": "850W 80+ Gold", "OS": "Windows 11 Pro"}', true),
('AI NeuralBox M1', 'ai-neuralbox-m1', 'Pre-configured AI workstation with local LLM agents ready to deploy in your business.', 'The NeuralBox M1 ships with Ollama, Open WebUI, and a suite of business-ready AI agents pre-installed and configured. Run Llama 3, Mistral, and other top models entirely on-premise. No cloud subscription, no data leaving your building.', 3799.00, 4500.00, '[]', 'ai-machine', ARRAY['ai', 'local-llm', 'on-premise'], 5, '["Local AI agents pre-installed", "Ollama + Open WebUI setup", "Llama 3 & Mistral models", "No cloud dependency", "Business agent templates", "Staff training included"]', '{"CPU": "AMD Ryzen 9 7950X", "RAM": "128GB DDR5", "Storage": "4TB NVMe SSD", "GPU": "NVIDIA RTX 4090 24GB", "AI Stack": "Ollama, Open WebUI, LangChain", "OS": "Ubuntu 22.04 LTS"}', true),
('Gaming Beast RX', 'gaming-beast-rx', 'Extreme gaming rig built to dominate at 4K — every component chosen for maximum frame rates.', 'The Gaming Beast RX is our top-tier gaming build — crafted for competitive and enthusiast gamers who demand the absolute best. Overclocked and benchmarked before shipping.', 3299.00, 3799.00, '[]', 'gaming-pc', ARRAY['gaming', '4k', 'amd'], 8, '["AMD Ryzen 9 7900X3D", "32GB DDR5 6000MHz", "2TB Gen4 NVMe", "AMD RX 7900 XTX", "360mm AIO Liquid Cooling", "RGB ecosystem"]', '{"CPU": "AMD Ryzen 9 7900X3D", "RAM": "32GB DDR5-6000 RGB", "Storage": "2TB Seagate FireCuda NVMe", "GPU": "AMD RX 7900 XTX 24GB", "Cooling": "360mm AIO Liquid", "OS": "Windows 11 Home"}', true),
('Enterprise Server ES-4U', 'enterprise-server-es-4u', '4U rack-mount server for SME and enterprise — built for reliability, redundancy, and scale.', 'The ES-4U is our enterprise-grade rack server, designed for production workloads, virtualisation, and high-availability deployments. Ships with IPMI remote management, dual redundant PSUs, and optional RAID configuration.', 6999.00, NULL, '[]', 'server', ARRAY['server', 'rack', 'enterprise'], 3, '["Dual Xeon Scalable processors", "512GB ECC DDR4", "8x 4TB SATA HDD (RAID optional)", "Dual 10GbE NICs", "IPMI remote management", "Dual redundant PSUs"]', '{"CPU": "Dual Intel Xeon Silver 4314", "RAM": "512GB ECC DDR4", "Storage": "8x 4TB SATA (RAID 5/6 optional)", "Network": "Dual 10GbE + 1GbE IPMI", "PSU": "Dual 800W Redundant", "Form Factor": "4U Rack Mount"}', true),
('NeuralBox Home Edition', 'neuralbox-home-edition', 'Compact AI machine for personal and small-business use — local AI without the enterprise price.', 'The NeuralBox Home Edition brings local AI to your home office or small business. Compact form factor, whisper-quiet, and powerful enough to run the latest open-source models for writing, coding, and automation.', 1899.00, 2200.00, '[]', 'ai-machine', ARRAY['ai', 'home', 'compact'], 12, '["Pre-installed Ollama", "Llama 3 & Mistral models", "Open WebUI dashboard", "Compact mini-ITX form factor", "Silent operation", "2-year warranty"]', '{"CPU": "AMD Ryzen 7 7700", "RAM": "32GB DDR5", "Storage": "1TB NVMe SSD", "GPU": "NVIDIA RTX 4060 8GB", "Form Factor": "Mini-ITX", "Noise Level": "< 25dB"}', false)
ON CONFLICT (slug) DO NOTHING;
