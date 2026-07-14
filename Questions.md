# Interview Questions & Answers

## Frontend (React & JavaScript)

### 1. What is the Virtual DOM in React?
**Answer:** The Virtual DOM (VDOM) is a programming concept where an ideal, or "virtual", representation of a UI is kept in memory and synced with the "real" DOM by a library such as ReactDOM. This process is called reconciliation. It allows React to compute minimal DOM operations when updating the UI, making it highly performant.

### 2. Explain Closures in JavaScript.
**Answer:** A closure is a feature in JavaScript where an inner function has access to the outer (enclosing) function's variables—a scope chain. The closure has three scope chains: it has access to its own scope, it has access to the outer function's variables, and it has access to the global variables.

### 3. What are React Hooks?
**Answer:** Hooks are functions that let you "hook into" React state and lifecycle features from function components. Examples include `useState` for managing local state and `useEffect` for performing side effects (like data fetching or manually changing the DOM).

### 4. What is the Event Loop in JavaScript?
**Answer:** The event loop is a mechanism that makes JavaScript's single-threaded, non-blocking asynchronous concurrent model possible. It continuously checks the call stack and if it's empty, it checks the callback queue, pushing the first callback into the stack to be executed.

## Backend (Node.js & Express)

### 5. How does Node.js handle concurrency despite being single-threaded?
**Answer:** Node.js uses an event-driven, non-blocking I/O model. While the main thread runs the event loop, heavy I/O operations are offloaded to worker threads (via libuv). Once an operation completes, its callback is pushed to the event queue to be executed by the main thread.

### 6. What is middleware in Express.js?
**Answer:** Middleware functions have access to the request object (`req`), response object (`res`), and the `next` middleware function. They can execute code, modify request/response objects, end the cycle, or call the next middleware.

### 7. What is REST and what is a RESTful API?
**Answer:** REST (Representational State Transfer) is an architectural style for web services. A RESTful API uses HTTP methods (GET, POST, PUT, DELETE) to access and manipulate data. It is stateless, meaning each request contains all information needed to process it.

## Database (SQL & NoSQL)

### 8. What is the difference between SQL and NoSQL?
**Answer:** SQL databases are relational and use structured query language, defining schemas before inserting data (e.g., PostgreSQL, MySQL). NoSQL databases are non-relational and have dynamic schemas for unstructured data (e.g., MongoDB, Redis). SQL is typically vertically scalable, while NoSQL is horizontally scalable.

## General & Behavioral

### 9. What happens when you type a URL into a browser?
**Answer:** 
1. DNS lookup finds the server's IP address.
2. The browser establishes a TCP connection with the server.
3. The browser sends an HTTP request.
4. The server processes the request and sends an HTTP response.
5. The browser renders the HTML, CSS, and executes JavaScript.

### 10. Why should we hire you?
**Answer:** *(Personalize this answer by highlighting specific technical skills relevant to the role, your problem-solving abilities, how you align with the company's tech stack, and your track record of successfully delivering projects.)*
