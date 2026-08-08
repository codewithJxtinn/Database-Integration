Project 3: Database Integration
DecodeLabs Full Stack Development — Industrial Training Kit, Batch 2026

A REST API that connects a Node.js/Express backend to a SQLite database, implementing full CRUD, schema design, and SQL-injection-safe queries.

Stack
Runtime: Node.js (v22+, uses the built-in node:sqlite module — no native compilation, no external DB server to install)
Framework: Express
Database: SQLite (file: data.db, auto-created on first run)
Setup
npm install
node server.js
Server starts at http://localhost:3000.

Run the automated test suite
node test.js
This boots the app in-process and walks through every CRUD operation, plus the constraint/security checks (duplicate email, invalid status, missing foreign key, cascade delete).

Schema (Pillar 1: Blueprint)
users                          tasks
------------------------       ------------------------------------
id     INTEGER PK              id           INTEGER PK
name   TEXT NOT NULL           user_id      INTEGER FK -> users.id
email  TEXT NOT NULL UNIQUE    title        TEXT NOT NULL
                                description  TEXT
                                status       TEXT CHECK(...) DEFAULT 'pending'
One user has many tasks (1:Many). ON DELETE CASCADE means deleting a user also removes their tasks.

API Reference (Pillar 3: Action)
Operation	Method	Route	Body
Create	POST	/api/users	{ name, email }
Read all	GET	/api/users	—
Read one	GET	/api/users/:id	—
Update	PUT	/api/users/:id	{ name, email }
Delete	DELETE	/api/users/:id	—
Create	POST	/api/tasks	{ user_id, title, description?, status? }
Read all	GET	/api/tasks	optional ?user_id=
Read one	GET	/api/tasks/:id	—
Update	PUT	/api/tasks/:id	{ title?, description?, status? }
Delete	DELETE	/api/tasks/:id	—
Data Integrity & Security (Pillar 4: Shield)
email is UNIQUE — duplicate signups return 409 Conflict.
status uses a CHECK constraint — invalid values return 400.
Foreign key existence is validated before inserting a task.
Every query uses parameterized placeholders (?) via db.prepare(...).run(...) — user input is never concatenated into SQL strings, which is the standard defense against SQL injection.
Project structure
project3-db-integration/
├── server.js              # Express app entrypoint
├── db.js                  # DB connection + schema (CREATE TABLE)
├── models/
│   ├── userModel.js        # Parameterized CRUD for users
│   └── taskModel.js        # Parameterized CRUD for tasks
├── routes/
│   ├── userRoutes.js       # REST routes -> userModel
│   └── taskRoutes.js       # REST routes -> taskModel
├── test.js                 # End-to-end automated test script
└── package.json
