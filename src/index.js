const express = require("express");
const path = require("path");
const EventRequest = require("./models/EventRequest");
const StudentApplication = require("./models/StudentApplication");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { connectDB, User } = require("./config");

// Connect to MongoDB
connectDB();

const app = express();

// Session configuration
app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/photos", express.static("photos"));
app.set("view engine", "ejs");
app.set("views", "views");

// Role-based middleware to show relevant data
app.use(async (req, res, next) => {
  res.locals.user = req.session.user;

  if (req.session.user) {
    try {
      switch (req.session.user.role) {
        case "Club":
          res.locals.requests = await EventRequest.find({ clubId: req.session.user._id });
          res.locals.pendingCount = await EventRequest.countDocuments({
            clubId: req.session.user._id,
            status: "pending"
          });
          break;
        case "Student":
          res.locals.applications = await StudentApplication.find({
            studentId: req.session.user._id
          }).limit(3);
          break;
        case "Authority":
          res.locals.pendingRequests = await EventRequest.countDocuments({ status: "pending" });
          break;
      }
    } catch (err) {
      console.error("Middleware error:", err.message);
    }
  }
  next();
});

// Routes
app.get("/", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, password, role, email } = req.body;
    const existingUser = await User.findOne({ name: username });
    if (existingUser) {
      return res.render("signup", {
        error: "User already exists",
        formData: req.body
      });
    }

    const newUser = new User({
      name: username,
      password,
      role,
      email: email || ""
    });

    await newUser.save();
    res.redirect("/?signup=success");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).render("signup", {
      error: "Registration failed",
      formData: req.body
    });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Just check plain text match (for demo)
    const user = await User.findOne({ name: username, password });
    
    if (!user) {
      return res.render("login", {
        error: "Invalid credentials",
        formData: req.body
      });
    }

    req.session.user = {
      name: user.name,
      email: user.email,
      role: user.role,
      _id: user._id
    };

    res.redirect(`/dashboard/${user.role.toLowerCase()}`);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("login", {
      error: "Login failed due to server error",
      formData: req.body
    });
  }
});


// Role-protection
function requireLogin(role) {
  return (req, res, next) => {
    if (!req.session.user) return res.redirect("/?login_required=true");
    if (req.session.user.role !== role) return res.status(403).render("403");
    next();
  };
}

// DASHBOARDS
app.get("/dashboard/student", requireLogin("Student"), async (req, res) => {
  try {
    const [events, applications] = await Promise.all([
      EventRequest.find({ status: "approved" }).limit(3),
      StudentApplication.find({ studentId: req.session.user._id }).limit(3)
    ]);
    res.render("studhome", { events, applications });
  } catch (err) {
    res.status(500).render("studhome", { error: "Failed to load dashboard" });
  }
});

app.get("/dashboard/club", requireLogin("Club"), async (req, res) => {
  try {
    const requests = await EventRequest.find({ clubId: req.session.user._id });
    res.render("clubhome", { requests });
  } catch (err) {
    res.status(500).render("clubhome", { error: "Failed to load dashboard" });
  }
});

app.get("/dashboard/authority", requireLogin("Authority"), async (req, res) => {
  try {
    const requests = await EventRequest.find({ status: "pending" });
    res.render("adminhome", { requests });
  } catch (err) {
    res.status(500).render("adminhome", { error: "Failed to load dashboard" });
  }
});

// CLUB ROUTES
app.get("/club/add-event", requireLogin("Club"), (req, res) => {
  res.render("clubaddevent");
});

app.get("/club/add-recruitment", requireLogin("Club"), (req, res) => {
  res.render("clubaddrecruitment");
});

app.get("/club/request-permission", requireLogin("Club"), (req, res) => {
  res.render("clubrequestpermission");
});

app.post("/club/request-permission", requireLogin("Club"), async (req, res) => {
  try {
    const { eventTitle, description, date } = req.body;
    await EventRequest.create({
      clubName: req.session.user.name,
      clubId: req.session.user._id,
      eventTitle,
      description,
      date: new Date(date),
      status: "pending"
    });
    res.redirect("/dashboard/club?request_submitted=true");
  } catch (err) {
    res.status(400).render("clubrequestpermission", {
      error: err.message,
      formData: req.body
    });
  }
});

// STUDENT ROUTES
app.get("/student/events", requireLogin("Student"), async (req, res) => {
  try {
    const events = await EventRequest.find({ status: "approved" });
    res.render("studevent", { events });
  } catch (err) {
    res.status(500).render("studevent", { error: "Failed to load events" });
  }
});

app.get("/student/recruitments", requireLogin("Student"), (req, res) => {
  res.render("studentrecruitment");
});

app.get("/student/clubs", requireLogin("Student"), (req, res) => {
  res.render("studclub");
});

app.get("/student/applications", requireLogin("Student"), async (req, res) => {
  try {
    const applications = await StudentApplication.find({
      studentId: req.session.user._id
    }).populate("eventId");
    res.render("studentapplications", { applications });
  } catch (err) {
    res.status(500).render("studentapplications", { error: "Failed to load applications" });
  }
});

app.post("/student/apply-event", requireLogin("Student"), async (req, res) => {
  try {
    const { eventId, applicationDetails } = req.body;

    const event = await EventRequest.findById(eventId);
    if (!event || event.status !== "approved") {
      throw new Error("Event is not available");
    }

    await StudentApplication.create({
      studentId: req.session.user._id,
      studentName: req.session.user.name,
      eventId,
      eventTitle: event.eventTitle,
      applicationDetails,
      status: "pending"
    });

    res.redirect(`/student/events?applied=${eventId}`);
  } catch (err) {
    res.status(400).render("studevent", {
      error: err.message,
      events: await EventRequest.find({ status: "approved" }),
      formData: req.body
    });
  }
});

// CLUB reviews student apps
app.get("/club/applications", requireLogin("Club"), async (req, res) => {
  try {
    const clubEventIds = await EventRequest.find({ clubId: req.session.user._id }).distinct("_id");
    const applications = await StudentApplication.find({ eventId: { $in: clubEventIds } })
      .populate("eventId studentId");
    res.render("clubapplications", { applications });
  } catch (err) {
    res.status(500).render("clubapplications", { error: "Failed to load applications" });
  }
});

app.post("/club/application/:id/process", requireLogin("Club"), async (req, res) => {
  try {
    const { action, remarks } = req.body;
    const application = await StudentApplication.findById(req.params.id).populate("eventId");

    if (!application || application.eventId.clubId.toString() !== req.session.user._id.toString()) {
      throw new Error("Unauthorized");
    }

    if (action === "approve") {
      application.status = "approved";
    } else if (action === "reject") {
      application.status = "rejected";
    } else {
      throw new Error("Invalid action");
    }

    application.remarks = remarks;
    await application.save();

    res.redirect("/club/applications?action_processed=true");
  } catch (err) {
    res.status(400).redirect("/club/applications?error=" + encodeURIComponent(err.message));
  }
});

// AUTHORITY reviewing club event requests
app.post("/authority/action/:id", requireLogin("Authority"), async (req, res) => {
  try {
    const { action, remarks } = req.body;
    const request = await EventRequest.findById(req.params.id);
    if (!request) throw new Error("Request not found");

    if (action === "approved") {
      request.status = "approved";
    } else if (action === "rejected") {
      request.status = "rejected";
    } else {
      request.status = "changes_requested";
    }

    request.authorityRemarks = remarks;
    await request.save();
    res.redirect("/dashboard/authority?action_processed=true");
  } catch (err) {
    res.status(400).redirect("/dashboard/authority?error=" + encodeURIComponent(err.message));
  }
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.error("Logout error:", err);
    res.redirect("/?logged_out=true");
  });
});

// 404
app.use((req, res) => {
  res.status(404).render("404");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", { error: err.message });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
