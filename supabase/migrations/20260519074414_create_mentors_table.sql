CREATE TABLE public.mentors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    bio TEXT,
    specialties TEXT[],
    profile_picture_url TEXT
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.mentors FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.mentors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.mentors FOR UPDATE USING (auth.uid() = id); -- Assuming mentor id matches auth.uid
CREATE POLICY "Enable delete for authenticated users only" ON public.mentors FOR DELETE USING (auth.uid() = id); -- Assuming mentor id matches auth.uid

-- Sample Mentor Data
INSERT INTO public.mentors (name, email, bio, specialties, profile_picture_url)
VALUES
('Dr. Emily White', 'emily.white@example.com', 'Professor of AI and Machine Learning, specializing in natural language processing.', ARRAY['AI', 'Machine Learning', 'NLP', 'Python'], 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
('Mr. John Davis', 'john.davis@example.com', 'Software Engineer with 10+ years experience in full-stack development and cloud architecture.', ARRAY['Full-Stack', 'Cloud Computing', 'JavaScript', 'AWS', 'Node.js'], 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
('Dr. Sarah Connor', 'sarah.connor@example.com', 'Research Scientist in Quantum Physics, passionate about theoretical physics and scientific communication.', ARRAY['Quantum Physics', 'Theoretical Physics', 'Academia', 'Research'], 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
('Ms. Laura Green', 'laura.green@example.com', 'UX/UI Designer with a focus on user-centered design principles and intuitive interfaces.', ARRAY['UX Design', 'UI Design', 'Figma', 'User Research'], 'https://images.pexels.com/photos/1181691/pexels-photo-1181691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
('Prof. Michael Brown', 'michael.brown@example.com', 'Head of Computer Science department, expert in data structures and algorithms.', ARRAY['Algorithms', 'Data Structures', 'Computer Science', 'Java', 'C++'], 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
