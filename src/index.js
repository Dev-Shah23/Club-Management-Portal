const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');

const app = express();

// Convert data into JSON format
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Set EJS as the view engine
app.set("view engine", "ejs");

// Home Routes
app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Register User with role
app.post("/signup", async (req, res) => {
    const { username, password, role } = req.body;

    // Check if user exists
    const existingUser = await collection.findOne({ name: username });
    if (existingUser) {
        return res.send('User already exists. Please choose a different username.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const data = {
        name: username,
        password: hashedPassword,
        role: role // add role field
    };

    const userdata = await collection.insertMany(data);
    console.log(userdata);
    res.redirect('/');
});

// Login User with role check
app.post("/login", async (req, res) => {
    try {
        const user = await collection.findOne({ name: req.body.username });

        if (!user) {
            return res.send("User not found");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.send("Wrong password");
        }

        // Redirect based on role
        if (user.role === "student") {
            res.send("Welcome Student");
            // OR res.render("student-dashboard");
        } else if (user.role === "club_manager") {
            res.send("Welcome Club Manager");
            // OR res.render("club-dashboard");
        } else if (user.role === "authority") {
            res.send("Welcome Authority");
            // OR res.render("authority-dashboard");
        } else {
            res.send("Invalid role");
        }

    } catch (err) {
        console.error(err);
        res.send("Login failed");
    }
});

// Start Server
const port = 5000;
app.listen(port, () => {
    console.log('Server listening on port ${port}');
});