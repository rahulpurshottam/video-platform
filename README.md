# Video Platform

A full-stack video processing and streaming platform with automated sensitivity detection, built using the MERN stack.
It allows users to upload videos, process them for content sensitivity, stream them efficiently, and manage access via role-based permissions in a multi-tenant environment.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://video-platform-sigma-lac.vercel.app)

---

## 🚀 Features
- **User Authentication**: JWT-based auth with role-based access control (Viewer, Editor, Admin)
- **Video Upload**: Multi-format video upload with progress tracking
- **Real-time Processing**: FFmpeg-based video processing with Socket.io updates
- **Sensitivity Detection**: Automated content moderation with flagging system
- **Video Streaming**: HTTP range request support for efficient video playback
- **Tenant Isolation**: Multi-tenant architecture for data separation
- **Responsive UI**: Modern React interface with Tailwind CSS

---

## Tech Stack

- **Frontend:** React, TailwindCSS, Axios, React Router
- **Backend:** Node.js, Express.js, Socket.io, Multer, FFmpeg (video processing)
- **Database:** MongoDB (MongoDB Atlas)
- **Authentication:** JWT
- **Hosting:** Vercel (frontend), Render (backend)

---

## Getting Started

## 📋 Prerequisites

This project requires the following dependencies:

- **Programming Language:** JavaScript
- **Package Managers:** `npm`

## 💾 Installation

Install dependencies, and get started:

```bash
# Navigate to project root
cd video-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

## 💡 Usage
Run the frontend and backend servers:
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev

```

## 📁 Project Structure
```
video-platform/
├── backend/
│   ├── src/
│   │   ├── models/          
│   │   ├── routes/         
│   │   ├── controllers/     
│   │   ├── middleware/      
│   │   ├── services/        
│   │   ├── sockets/         
│   │   ├── app.js         
│   │   └── server.js       
│   ├── uploads/            
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/          
│   │   ├── components/     
│   │   ├── context/        
│   │   ├── services/      
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md

```

---
