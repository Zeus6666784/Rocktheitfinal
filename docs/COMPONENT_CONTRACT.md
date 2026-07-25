# Learnify Component Contract

Version: 1.0

Purpose:
Define the reusable UI components used across the application so both developers build the same components with the same API.

---

# Naming Convention

Component Names

PascalCase

Example

CourseCard.jsx

LectureItem.jsx

PrimaryButton.jsx

ResourceCard.jsx

Files

One component per folder.

Example

components/
    CourseCard/
        CourseCard.jsx
        CourseCard.css (if needed)
        index.js

---

# Shared Props Rules

- Props must be descriptive.
- Avoid passing entire objects unless necessary.
- Components should be reusable.
- No API calls inside UI components.
- Components receive data through props only.

---

# PrimaryButton

Purpose

Main CTA button.

Props

label

string

required

Example

"Enroll Now"

---

variant

primary

secondary

ghost

danger

default

primary

---

icon

React Icon

optional

---

disabled

boolean

default false

---

loading

boolean

default false

---

onClick

function

required

---

Usage

<PrimaryButton
    label="Enroll Now"
    variant="primary"
/>

---

# CourseCard

Purpose

Display a course in grid/list.

Props

thumbnail

string

required

title

string

required

instructor

string

required

duration

string

required

rating

number

required

students

number

optional

category

string

required

progress

number

optional

onClick

function

required

---

Hover

Lift

Image Zoom

Shadow Increase

---

Usage

<CourseCard
    title="React Masterclass"
    instructor="John Doe"
/>

---

# SearchBar

Purpose

Search courses.

Props

placeholder

string

value

string

onChange

function

onSearch

function

---

# CategoryChip

Purpose

Display course category.

Props

label

string

selected

boolean

onClick

function

---

# PlaylistItem

Purpose

One lecture row.

Props

lectureNumber

number

title

string

duration

string

locked

boolean

completed

boolean

active

boolean

onClick

function

---

States

Completed

Green Check

Locked

Grey Lock

Current

Purple Indicator

---

# VideoPlayer

Purpose

Play lecture video.

Props

videoUrl

string

required

title

string

required

onComplete

function

required

onProgress

function

required

---

No business logic.

Only emits events.

---

# ProgressBar

Props

progress

number

0-100

---

Animated

Yes

---

# ResourceCard

Purpose

Display downloadable material.

Props

icon

React Icon

title

string

description

string

fileUrl

string

type

pdf

zip

doc

ppt

---

Button

Download

---

# CertificateCard

Purpose

Show completion certificate.

Props

courseName

string

userName

string

completedDate

string

download

function

---

# Navbar

Contains

Logo

Navigation

Search

Profile

Responsive Menu

---

Props

user

optional

---

# Footer

Contains

Links

Socials

Copyright

No Props

---

# HeroSection

Contains

Heading

Description

CTA

Illustration

Props

title

subtitle

buttonText

buttonAction

---

# InstructorCard

Props

name

avatar

bio

rating

courses

students

---

# CourseBanner

Props

coverImage

title

description

duration

lectures

rating

students

---

# LearningLayout

Contains

Video

Playlist

Resources

Progress

Navigation

Children

Video Section

Sidebar

---

# Loader

Props

size

small

medium

large

---

# EmptyState

Props

title

description

buttonLabel

buttonAction

---

# ErrorState

Props

title

description

retry

---

# Component Ownership

Developer 1

PrimaryButton

VideoPlayer

ProgressBar

ResourceCard

CertificateCard

LearningLayout

Loader

ErrorState

---

Developer 2

Navbar

Footer

HeroSection

CourseCard

CourseBanner

PlaylistItem

InstructorCard

CategoryChip

SearchBar

EmptyState

---

# Component Rules

✓ Single Responsibility

✓ Reusable

✓ Responsive

✓ Accessible

✓ Tailwind Only

✓ No hardcoded colours

✓ No business logic

✓ Props only

✓ Export default component

✓ Keep under ~250 lines

---

# File Example

components/

CourseCard/

├── CourseCard.jsx
├── index.js

VideoPlayer/

├── VideoPlayer.jsx
├── index.js

Navbar/

├── Navbar.jsx
├── index.js

---

# Definition of Done

A component is considered complete when:

✓ Responsive

✓ Matches UI Style Guide

✓ Uses shared colour tokens

✓ Uses shared spacing

✓ Keyboard accessible

✓ No console errors

✓ No duplicated code

✓ Accepts documented props

✓ Works independently

✓ Ready for integration