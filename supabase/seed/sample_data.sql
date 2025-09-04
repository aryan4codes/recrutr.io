-- Sample job data
insert into jobs (title, jd_text, location, level) values
('Backend Engineer (Payments)', 'Node.js, Postgres, PCI exposure, building scalable payment systems...', 'Mumbai', 'SDE-2'),
('Frontend Engineer (React)', 'React, TypeScript, modern UI frameworks, responsive design...', 'Bangalore', 'SDE-1'),
('Full Stack Engineer', 'MEAN/MERN stack, microservices, cloud deployment...', 'Remote', 'SDE-3');

-- Sample competencies for the backend engineer role
insert into job_competencies (job_id, competency, weight) 
select id, 'Node.js', 1.0 from jobs where title = 'Backend Engineer (Payments)'
union all
select id, 'PostgreSQL', 0.8 from jobs where title = 'Backend Engineer (Payments)'
union all
select id, 'Payment Systems', 1.2 from jobs where title = 'Backend Engineer (Payments)'
union all
select id, 'API Design', 0.9 from jobs where title = 'Backend Engineer (Payments)';

-- Sample interviewers
insert into interviewers (name, email, team, seniority, competencies) values
('Arjun Sharma', 'arjun@company.com', 'Backend', 'Senior', ARRAY['Node.js', 'System Design', 'PostgreSQL']),
('Priya Patel', 'priya@company.com', 'Frontend', 'Lead', ARRAY['React', 'TypeScript', 'UI/UX']),
('Raj Kumar', 'raj@company.com', 'Engineering', 'Principal', ARRAY['Architecture', 'Leadership', 'Technical Strategy']),
('Anita Singh', 'anita@company.com', 'Product', 'Manager', ARRAY['Product Strategy', 'User Research', 'Analytics']);

-- Sample candidates
insert into candidates (name, email, phone, resume_text) values
('Vikram Gupta', 'vikram@email.com', '+91-9876543210', 'Experienced Node.js developer with 4 years in fintech. Built payment gateway integrations at PayU. Proficient in PostgreSQL, Redis, microservices...'),
('Sneha Reddy', 'sneha@email.com', '+91-9876543211', 'Full-stack engineer with React and Node.js expertise. 3 years at startup building e-commerce platforms. Experience with MongoDB, Express...'),
('Amit Verma', 'amit@email.com', '+91-9876543212', 'Senior backend engineer with 6 years experience. Led team at Razorpay building payment infrastructure. Expert in Node.js, PostgreSQL, distributed systems...');

-- Sample candidate skills
insert into candidate_skills (candidate_id, skill, source) 
select id, 'Node.js', 'resume' from candidates where name = 'Vikram Gupta'
union all
select id, 'PostgreSQL', 'resume' from candidates where name = 'Vikram Gupta'
union all
select id, 'Payments', 'resume' from candidates where name = 'Vikram Gupta'
union all
select id, 'React', 'resume' from candidates where name = 'Sneha Reddy'
union all
select id, 'Node.js', 'resume' from candidates where name = 'Sneha Reddy'
union all
select id, 'MongoDB', 'resume' from candidates where name = 'Sneha Reddy';
