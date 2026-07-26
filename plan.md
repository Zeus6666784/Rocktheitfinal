Phase 1 – Project Planning
Project Name
Let's give it a proper name instead of "Course Website."
Some ideas:
Learnify
EduFlow
SkillForge
CourseHub
RockLearn (if you want to tie it to your project name)
LearnSphere
Let's use Learnify for now.

1. Project Goal
Objective
Build a modern LMS (Learning Management System) where students can:
Browse courses
View course details
Watch lectures
Track progress
Unlock new lectures
Download resources
Receive a completion certificate
This is the MVP.

2. User Journey
This is the first thing every team member should understand.
Landing Page
      │
      ▼
Browse Courses
      │
      ▼
Course Detail Page
      │
      ▼
Enroll
      │
      ▼
Learning Dashboard
      │
      ▼
Watch Lecture
      │
      ▼
Progress Updated
      │
      ▼
Next Lecture Unlocks
      │
      ▼
Complete Course
      │
      ▼
Generate Certificate

Everything revolves around this flow.

3. Features
Must Have
Landing Page
Hero
Featured Courses
Categories
CTA

Browse Courses
Course cards
Search
Categories

Course Detail
Spotify Album Style
Contains
Banner
Instructor
Rating
Description
Playlist (Lecture List)

Learning Dashboard
Contains
Video player
Chapters
Resources
Progress
Next Lecture

Progress Tracking
Save watched lectures
Unlock next lecture

Certificate
Generate PDF after course completion.

4. Features NOT Included
Avoid these for version 1:
❌ Payments
❌ Admin Dashboard
❌ Instructor Dashboard
❌ Live Chat
❌ Reviews
❌ Comments
❌ Notifications
❌ AI
❌ OAuth Login
This keeps the project realistic for a demo.

5. Pages
Page
Purpose
Home
Landing
Courses
Browse
Course Detail
Course Info
Learning
Video Player

Only four pages.

6. Components
Shared
Navbar

Footer

CourseCard

Button

SearchBar

CategoryChip

Loader


Course Page
CourseHero

InstructorCard

Playlist

LectureItem

EnrollButton


Learning Page
VideoPlayer

ProgressBar

ResourceCard

ChapterList

LectureNavigator

Reusable components make the code cleaner.

7. Database
Keep it simple.
User
Name

Email

Completed Courses

Progress


Course
Title

Description

Thumbnail

Instructor

Category

Duration


Lecture
Title

Video URL

Resources

Duration

Order


Progress
Completed Lectures

Last Position

Completed


8. Folder Structure
Learnify/

client/
server/

docs/

README.md

We'll flesh this out later.

9. API Planning
GET     /courses

GET     /courses/:id

GET     /lectures/:id

POST    /progress

GET     /certificate

Five APIs are enough.

10. UI Theme
I wouldn't copy Udemy.
Instead:
Spotify

+

Apple

+

Linear.app

Dark theme
Rounded cards
Glass effects
Smooth animations
Minimalistic
Premium look

11. Team Responsibilities
Will be discussed in a meeting/lecture/break on 25/07/2026

12. Project Milestones
Milestone 1
Setup MERN
GitHub
Folder structure

Milestone 2
Home
Courses

Milestone 3
Course Detail
Playlist

Milestone 4
Learning Dashboard
Progress tracking

Milestone 5
Certificate
Testing
Deployment

13. Success Criteria
By demo day, the project should be able to:
Browse a list of courses.
Open a course and display its lecture playlist.
Play lecture videos.
Lock later lectures until previous ones are completed.
Show downloadable resources for each lecture.
Track learning progress.
Generate a completion certificate after finishing the course.


