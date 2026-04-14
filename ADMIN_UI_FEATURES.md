# Simply Signed Admin UI

## Overview

The Simply Signed Admin UI is a web-based internal dashboard for managing learning content and reviewing high-level platform activity. It is designed for administrators who need a single place to maintain the educational structure, upload media, and monitor usage trends.

The interface connects directly to the Simply Signed backend API and uses authenticated admin access before allowing content changes.

## Core Purpose

The Admin UI supports four main jobs:

1. Review dashboard statistics about users and learning progress.
2. Manage the main learning structure: stages, categories, and learning resources.
3. Manage the Quick Learning area: categories and resources.
4. Browse other resource libraries such as avatars and prebuilt assets.

## Access and Authentication

- Users sign in with an email address and password.
- The UI stores a secure auth token in the browser for the active session.
- The application redirects unauthenticated users back to the sign-in page.
- Content editing actions rely on backend admin authorization.

## Main Feature Areas

### 1. Dashboard

The home dashboard gives a quick operational summary of the platform.

Available insights include:

- Total users
- Average progress per user
- Overall completion rate
- Total unlocked progress items
- Gender distribution chart
- Age distribution chart

This page is intended to give non-technical stakeholders a quick view of platform engagement and content usage.

### 2. Learning Management

The Learning section is the main content management workspace for the core learning experience.

It supports:

- Creating new stages
- Editing existing stages
- Deleting stages
- Creating categories inside a selected stage
- Editing categories
- Deleting categories
- Creating learning resources inside a selected category
- Deleting learning resources

For stages, the UI supports:

- Stage name
- Stage thumbnail upload
- Color configuration
- Path asset uploads for static, dynamic, and pivot assets

For categories, the UI supports:

- Category name
- Category color configuration
- Optional thumbnail update during editing

For learning resources, the UI supports:

- Resource title
- Sort order
- Video upload
- Thumbnail upload
- Category assignment

The Learning area also includes:

- Searchable stage selection
- Searchable category selection
- Tab-based navigation between stages, categories, and resources
- Media preview support for uploaded content
- Delete confirmation flows to reduce accidental removal

### 3. Quick Learning Management

The Quick Learning section is a dedicated management area for short-form or fast-access learning content.

It supports:

- Viewing all Quick Learning categories
- Creating categories for Quick Learning
- Editing category name and thumbnail
- Deleting Quick Learning categories
- Creating Quick Learning resources
- Deleting Quick Learning resources

For Quick Learning resources, the UI supports:

- Resource title
- Sort order
- Video upload
- Thumbnail upload
- Assignment to a Quick Learning category

This area also includes:

- Category search
- Resource listing by selected category
- Upload progress states for media creation
- Media preview support

## Other Resources Section

The Other Resources section is primarily a browsing and review tool.

It allows admins to view:

- Learning resources by category
- Avatar resources
- Prebuild avatar resources

This section is useful for reviewing existing asset libraries and verifying available content, but it is not currently the main editing workflow for content creation.

## Navigation and Usability

The Admin UI includes:

- Top-level navigation for all major sections
- Responsive layout for desktop and mobile use
- Loading states while data is being fetched
- Empty states when no content is available
- Clear action buttons for create, edit, delete, and sign out

The interface is designed to be straightforward for day-to-day operational use by content or admin teams.

## Backend-Connected Behavior

The Admin UI depends on the backend API for all live data and update actions.

This includes:

- Sign-in validation
- Dashboard data
- Stage, category, and resource retrieval
- Media upload endpoints
- Create, update, and delete operations

Because of this, the Admin UI reflects the backend’s data structure and permissions model.

## Current Scope Notes

At the moment, the Admin UI is focused on content operations and visibility rather than full user administration.

Current emphasis:

- Content management
- Resource uploads
- Learning structure maintenance
- Basic analytics and reporting

Not currently presented as a primary feature in this UI:

- Admin account creation from the interface
- Advanced role management
- Detailed user account administration
- Workflow approvals or publishing states

## Intended Audience

This product is best suited for:

- Internal administrators
- Content managers
- Operations staff
- Stakeholders who need a simple reporting view of platform usage

## Summary

The Simply Signed Admin UI provides a practical admin workspace for maintaining the learning platform. Its strongest value is centralized content management across the core Learning and Quick Learning experiences, supported by dashboard reporting and a clear navigation structure.
