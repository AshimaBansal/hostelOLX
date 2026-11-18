# Repositories (data access layer)

Repositories are the only place that reads or writes data.
Right now they use an in-memory store (`src/store/memoryStore.js`).

For the database member: to connect PostgreSQL, rewrite the body of
each function here using `pg` queries against the tables in
`database/migrations/001_initial_schema.sql`. Keep the same function
names, arguments and return shapes (camelCase objects), and nothing
above this layer needs to change. All functions are already `async`.
