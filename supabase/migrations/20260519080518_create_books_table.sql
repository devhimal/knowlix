CREATE TABLE public.books (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    genre TEXT,
    publication_year INTEGER,
    cover_image_url TEXT,
    description TEXT,
    pages INTEGER,
    language TEXT,
    pdf_url TEXT,
    
    condition TEXT,
    price NUMERIC,
    type TEXT, 
    exchange_for TEXT
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Enable read access for all users" ON public.books FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.books FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.books FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for authenticated users only" ON public.books FOR DELETE USING (auth.uid() = id);


INSERT INTO public.books (title, author, isbn, genre, publication_year, cover_image_url, description, pages, language, pdf_url, condition, price, type, exchange_for)
VALUES
('The Silent Patient', 'Alex Michaelides', '978-1250301697', 'Thriller', 2019, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=200&q=80', 'A shocking psychological thriller about a woman''s act of violence against her husband—and the psychotherapist obsessed with uncovering what happened.', 336, 'English', NULL, 'Used - Good', 12.99, 'sell', NULL),
('Where the Crawdads Sing', 'Delia Owens', '978-0735219090', 'Mystery', 2018, 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=200&q=80', 'A wild young woman living in the marshes of North Carolina becomes a suspect in a murder case.', 384, 'English', NULL, 'Used - Very Good', 10.50, 'sell', NULL),
('Atomic Habits', 'James Clear', '978-0735211292', 'Self-Help', 2018, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd87?auto=format&fit=crop&w=200&q=80', 'An easy and proven way to build good habits and break bad ones.', 320, 'English', NULL, 'New', 15.00, 'sell', NULL),
('Project Hail Mary', 'Andy Weir', '978-0593135204', 'Science Fiction', 2021, 'https://images.unsplash.com/photo-1544716278-c51120a160c8?auto=format&fit=crop&w=200&q=80', 'An astronaut wakes up on a spaceship with no memory of how he got there, on a mission to save humanity.', 496, 'English', NULL, 'Used - Like New', NULL, 'exchange', 'Any Sci-Fi by Blake Crouch'),
('The Midnight Library', 'Matt Haig', '978-0525559474', 'Fantasy', 2020, 'https://images.unsplash.com/photo-1582236940087-f82c3c9079f8?auto=format&fit=crop&w=200&q=80', 'Between life and death, there is a library. Nora Seed gets a chance to undo her regrets and try out new lives.', 304, 'English', NULL, 'Used - Good', NULL, 'exchange', 'History book');
