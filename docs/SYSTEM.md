# Learnify - System Design Document

Version: 1.0

---

# Architecture

MERN Stack

React
↓

Axios

↓

Express

↓

MongoDB

---

# Tech Stack

Frontend

React (Vite)

TailwindCSS

React Router

Axios

React Player

Backend

Node

Express

MongoDB

Mongoose

Deployment

MongoDB Atlas

Render

Vercel

---

# Folder Structure

learnify/

client/

server/

docs/

README.md

---

# Client Structure

src/

assets/

components/

common/

course/

learning/

certificate/

pages/

Home/

Courses/

CourseDetail/

Learning/

hooks/

services/

context/

utils/

styles/

---

# Server Structure

config/

controllers/

middleware/

models/

routes/

services/

utils/

uploads/

certificates/

---

# Database Collections

Users

Courses

Lectures

Progress

---

# User Model

name

email

password

enrolledCourses

completedCourses

---

# Course Model

title

description

thumbnail

category

instructor

duration

rating

lectures

---

# Lecture Model

courseId

title

videoUrl

duration

resources

order

---

# Progress Model

userId

courseId

completedLectures

watchPercentage

certificateGenerated

---

# API Design

GET /courses

GET /courses/:id

GET /lectures/:id

POST /progress

GET /certificate/:courseId

---

# Application Flow

Landing

↓

Browse Courses

↓

Course Details

↓

Enroll

↓

Learning Dashboard

↓

Watch Lecture

↓

Update Progress

↓

Unlock Next Lecture

↓

Generate Certificate

---

# Feature Modules

Landing Module

Course Module

Learning Module

Progress Module

Certificate Module

---

# Backend Services

Course Service

Progress Service

Certificate Service

---

# Security

Helmet

CORS

bcrypt

JWT

Input Validation

Environment Variables

---

# Error Handling

400

Bad Request

401

Unauthorized

404

Not Found

500

Internal Server Error

---

# State Management

React Context

Current User

Current Course

Progress

Theme

---

# Storage

Videos

Static Folder

Future

Cloud Storage

Resources

Uploads Folder

Certificates

Generated PDF

---

# Git Workflow

main

develop

feature/course

feature/learning

Merge into develop

Review

Merge into main

---

# Future Scalability

Authentication

Instructor Dashboard

Admin Dashboard

Payments

AI Assistant

Quiz Generation

Notes Generation

Analytics

Bookmarks

Comments

Reviews

Notifications

---

# AI Integration

Future Architecture

React

↓

Express

↓

AI Service

↓

Ollama

↓

LLM

Future APIs

POST /ai/chat

POST /ai/quiz

POST /ai/summary

POST /ai/recommend

---

# Deployment

Frontend

Vercel

Backend

Render

Database

MongoDB Atlas

---

# Development Roadmap

Phase 1

Setup

Phase 2

Landing

Courses

Phase 3

Course Detail

Phase 4

Learning Dashboard

Phase 5

Progress Tracking

Certificate

Phase 6

Testing

Deployment