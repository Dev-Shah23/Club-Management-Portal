## 👥 Team Name: 80085

### 💼 Problem Statement:

In most colleges, clubs struggle with organizing events and managing student applications due to the lack of a centralized platform. Our solution is a role-based Club Management Web Portal that enables Students, Club Managers, and Authorities to interact efficiently. Students can view and apply for club events, clubs can request permissions and manage applications, and authorities can review and approve event proposals — all through a single portal.

---

## 📜 Introduction

**Club Connect** is a role-based full-stack web platform designed to streamline and digitize how clubs and students interact in a college ecosystem. Students can register and explore events, clubs can request permissions and manage their own members, and authorities can approve or reject those event requests. The platform is built with **Node.js, Express, MongoDB, and EJS**, ensuring smooth backend logic and dynamic frontend rendering.

Whether you're a student eager to participate or a club leader trying to organize your next event, **Club Connect** brings it all together in one place.

---

## ✨ Features

### 👩‍🎓 Student:

* Sign up / Login
* View approved events
* Apply to club events with application form
* View past applications

### 🏛️ Club:

* Login to dashboard
* Request event permission from authorities
* Add event/recruitment info
* View and process student applications

### 🧑‍⚖️ Authority:

* Login to dashboard
* View and act on event permission requests from clubs
* Approve / Reject / Request changes with remarks

### 📊 Admin Panel Highlights:

* Role-based redirection and dashboards
* Pending request counters
* Recent event previews
* Application analytics (dummy for demo)

---

## 🖥️ Tech Stack

| Category         | Tech Used                |
| ---------------- | ------------------------ |
| **Frontend**     | EJS, HTML, CSS           |
| **Backend**      | Node.js, Express.js      |
| **Database**     | MongoDB (with Mongoose)  |
| **Session Auth** | express-session + bcrypt |
| **Templating**   | EJS                      |

---

## 🟢 Access

🚀 **Hosted Link**: *Not hosted currently. Run locally using instructions below.*

📁 **Views**:

* `/signup` → Register new user
* `/` → Login page
* `/dashboard/student` → Student dashboard
* `/dashboard/club` → Club dashboard
* `/dashboard/authority` → Authority dashboard

---

## ⚙️ Instructions For Local Deployment

### 1. Clone the repository from the final-student-flow branch

```bash
git clone https://github.com/Dev-Shah23/Club-Management-Portal.git
cd Club-Management-Portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start MongoDB server (Make sure MongoDB is running on localhost)

If you're using local MongoDB:

```bash
mongod
```

### 4. Start the application

```bash
npm run dev
```

*Or:*

```bash
node src/index.js
```

### 5. Open in browser:

```
http://localhost:5000
```

---

## 👨‍💻 Sample Roles for Testing

> You can manually register 3 different users (with different roles: Student, Club, Authority) during signup and test the full role-based functionality.

---


---
Some parts of the website contain hardcoded content to maintain its visual appeal and ensure it doesn't appear empty. However, the backend is fully functional — you can test it by adding events, submitting permission requests, managing clubs, and more.
