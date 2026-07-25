# Learnify Team Rules

Version: 1.0

---

# Purpose

This document defines the development workflow, collaboration rules, Git practices, and daily responsibilities for the Learnify project.

All team members must follow these rules throughout development.

---

# Team Members

Developer 1
- Project Lead
- Learning Dashboard
- Progress Tracking
- Certificate System

Developer 2
- Landing Page
- Course Module
- Backend APIs
- Database

---

# Git Workflow

Repository Branches

main
develop
feature/dev-1
feature/dev-2

---

# Branch Rules

## Main Branch

❌ Never commit directly to `main`.

❌ Never push directly to `main`.

❌ Never force push to `main`.

Only the Project Lead may merge into `main`, and only after testing.

---

## Develop Branch

Use `develop` for integrating completed features.

Workflow:

feature branch
↓
develop
↓
testing
↓
main

---

## Feature Branches

Each developer owns exactly one feature branch.

Developer 1

feature/dev-1

Developer 2

feature/dev-2

Only the assigned developer may commit to their own feature branch.

Do not commit to another developer's branch unless they explicitly ask for help.

---

# Code Ownership

Developer 1 owns

- Learning Dashboard
- Video Player
- Progress Tracking
- Certificate
- Shared Project Setup

Developer 2 owns

- Landing Page
- Browse Courses
- Course Detail
- Backend Course APIs
- MongoDB Models

Respect component ownership.

---

# Collaboration Rules

✅ Help each other.

❌ Do not overwrite another developer's work.

❌ Do not rename another developer's files.

❌ Do not move folders without discussion.

❌ Do not delete code you did not write.

If changes affect another developer's work:

1. Discuss first.
2. Create an issue.
3. Agree on the solution.
4. Then implement.

---

# Daily Workflow

Every coding session begins with:

## 1. Pull Latest Code

git checkout develop

git pull origin develop

---

## 2. Switch to Feature Branch

git checkout feature/dev-1

or

git checkout feature/dev-2

---

## 3. Code

Complete your assigned tasks.

---

## 4. Test

Run locally.

Fix errors.

---

## 5. Commit

Use meaningful commit messages.

Example

feat(course): add playlist component

fix(progress): lecture unlock bug

style(home): improve hero spacing

---

## 6. Push

Push only to your own feature branch.

---

# Merge Rules

Before merging:

✅ Application builds

✅ No console errors

✅ No merge conflicts

✅ Responsive

✅ Matches UI Style Guide

Only then create a Pull Request into `develop`.

---

# Daily Task Log

Every developer must update this section.

Developer 1

## TODO

- [ ] Build Video Player
- [ ] Progress Tracking
- [ ] Certificate

## IN PROGRESS

- [ ]

## DONE

- [ ] Project Setup
- [ ] Routing

---

Developer 2

## TODO

- [ ] Landing Page
- [ ] Course Cards
- [ ] Playlist

## IN PROGRESS

- [ ]

## DONE

- [ ] Navbar
- [ ] Footer

---

# Issue Tracking

Whenever a bug is found:

Bug Title

Description

Priority

Owner

Status

Example

Bug

Progress resets after refresh.

Priority

High

Owner

Developer 1

Status

Open

---

# Communication Rules

Before starting new work:

Inform the team.

Before modifying shared components:

Inform the team.

Before changing APIs:

Inform the team.

Before changing folder structure:

Inform the team.

No silent breaking changes.

---

# Shared Components

These components belong to everyone.

Navbar

Footer

Button

Loader

Theme

Styles

Changes require discussion.

---

# Definition of Done

A task is complete only if:

✅ Feature works

✅ Responsive

✅ No console errors

✅ No lint errors

✅ Matches design

✅ Tested

✅ Committed

✅ Pushed

---

# Emergency Rule

If you accidentally break:

main

develop

another developer's branch

Stop immediately.

Inform the team.

Do not continue pushing commits hoping it will fix itself.

---

# Golden Rules

✅ Commit often.

✅ Push frequently.

✅ Keep commits small.

✅ Write meaningful commit messages.

✅ Test before pushing.

✅ Respect branch ownership.

✅ Respect component ownership.

❌ Never work directly on `main`.

❌ Never push untested code.

❌ Never modify another developer's branch.

❌ Never merge without testing.

❌ Never delete another developer's work.

---

# Project Motto

> Build independently.
>
> Integrate carefully.
>
> Test everything.
>
> Respect each other's work.