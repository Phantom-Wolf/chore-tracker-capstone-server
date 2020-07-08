CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_email VARCHAR (255) UNIQUE NOT NULL,
    user_password VARCHAR (225) NOT NULL
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER
        REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR (255) NOT NULL,
    notes TEXT NOT NULL,
    recurrence INTEGER DEFAULT 1 NOT NULL,
    recurrence_specifics TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    date_ended TIMESTAMP DEFAULT now()
);

CREATE TABLE tasks (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    event_id INTEGER
        REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    date_of_task TIMESTAMP NOT NULL,
    task_status BOOLEAN DEFAULT FALSE NOT NULL,
    task_completion_date TIMESTAMP
);


-- INSERT INTO public.users (user_name,"password") VALUES 
-- ('admin','admin')
-- ,('user','user')
-- ,('log','log')
-- ,('sandra','sandra')
-- ;

-- INSERT INTO public.book_collection (user_id,collection_name) VALUES 
-- (4,'Romance')
-- ,(2,'Science and Robots')
-- ,(1,'Healthcare')
-- ,(3,'Sea Animals')
-- ;