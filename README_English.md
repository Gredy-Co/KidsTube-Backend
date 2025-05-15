# 🎥 KidsTube - Safe Video Platform for Children

---

## 📌 Project Overview

**KidsTube** is a web platform designed for parents to control and manage what video content their children are allowed to watch. Videos can be added from YouTube or uploaded directly by the parent, ensuring a secure and curated experience for kids.

This platform is built following a **Service-Oriented Architecture (SOA)**, integrating RESTful services for standard functionality and GraphQL for advanced querying. The app also integrates with third-party services like YouTube, Twilio, and MailerSend.

---

## 🎯 Objectives

- Implement a secure registration process with email verification and two-step authentication.
- Enable searching and adding videos using the YouTube API.
- Allow account management with child profiles and content restrictions.
- Use modern authentication mechanisms (JWT and Google OAuth2).
- Provide flexible and optimized data access via GraphQL queries.

---

## 🚀 Technologies Used

- **Frontend:** Angular CLI v19.1.8
- **Backend:** Node.js v22.13.1 (REST API & GraphQL)
- **Authentication:** JWT, Two-Factor Authentication (Twilio), Google OAuth2
- **Database:** (Your choice — e.g., MongoDB, PostgreSQL, etc.)
- **Third-Party Services:** YouTube Data API, Twilio, MailerSend

---

## 🔐 Key Features

### 🔸 Registration & Authentication

- User registration with required phone number.
- Email verification with activation link (MailerSend).
- Two-Factor Authentication (2FA) via SMS (Twilio).
- Register/Login with Google, followed by profile completion.

### 🔸 Frontend (Angular)

- Responsive and intuitive UI for parents.
- Manage children profiles and playlists.
- Token-based authentication (JWT) for all API requests.
- Integrated YouTube video search and selection.

### 🔸 Backend (REST + GraphQL)

- RESTful services for user, video, and playlist management.
- Independent GraphQL service for:
  - Profile list
  - Video list
  - Playlist list
  - Video search

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js v22.13.1+
- Angular CLI v19.1.8
- Database server : MongoDB
- API keys: Twilio, YouTube Data API, MailerSend

### Setup Steps

1. **Clone the frontend repository**
   ```bash
   git clone https://github.com/your-username/kidstube-frontend.git
   cd kidstube-frontend


## 📂 Repositories
Frontend = https://github.com/Gredy-Co/KidsTube-Frontend

GraphQL = https://github.com/Gredy-Co/KidsTube-GraphQL             
