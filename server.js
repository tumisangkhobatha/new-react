const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tumisang@58141777',
    database: 'wings'
});
//const hashedPassword = await bcrypt.hash(newPassword, 10);

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Registration API
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Log the plaintext password (for debugging only, REMOVE IN PRODUCTION)
    console.log('User Password:', password); // This will print the plaintext password to the console

    // Hash the password
     const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Registration successful' });
        }
    );
});



// Login API
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, results) => {
            if (err || results.length === 0) return res.status(400).json({ error: 'Invalid username or password' });
            const validPassword = await bcrypt.compare(password, results[0].password);
            if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });
            res.json({ message: 'Login successful' });
        }
    );
});


// Fetch all products
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// Add a new product
app.post('/products', (req, res) => {
    const { name, description, category, price, quantity } = req.body;
    db.query(
        'INSERT INTO products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [name, description, category, price, quantity],
        (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Product added successfully' });
        }
    );
});

// Update a product
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, category, price, quantity } = req.body;
    db.query(
        'UPDATE products SET name = ?, description = ?, category = ?, price = ?, quantity = ? WHERE id = ?',
        [name, description, category, price, quantity, id],
        (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Product updated successfully' });
        }
    );
});

// Delete a product
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Product deleted successfully' });
    });
});

//

app.use(cors());
app.use(bodyParser.json());

// Sample in-memory user store (replace with your database logic)
let users = [];

// Fetch all users
app.get('/users', (req, res) => {
    res.json({ users });
});

// Add a new user
app.post('/addUser', (req, res) => {
    const { username, password } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ error: 'User already exists.' });
    }
    users.push({ username, password });
    res.json({ message: 'User added successfully.' });
});

// Update an existing user
app.put('/updateUser', (req, res) => {
    const { oldUsername, newUsername, newPassword } = req.body;
    const userIndex = users.findIndex(user => user.username === oldUsername);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
    }
    users[userIndex] = { username: newUsername, password: newPassword };
    res.json({ message: 'User updated successfully.' });
});

// Delete a user
app.delete('/deleteUser', (req, res) => {
    const { username } = req.body;
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
    }
    users.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully.' });
});

const PORT = 5300;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
