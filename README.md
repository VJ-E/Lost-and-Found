# CampusFind - Lost and Found Management System

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![NextAuth.js](https://img.shields.io/badge/NextAuth.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://next-auth.js.org/)

A web application for managing lost and found items on campus. Built with modern web technologies to provide an efficient and user-friendly platform for reconnecting lost items with their owners.

## Overview

LostAndFound streamlines the lost and found process by providing a centralized platform where users can report lost items, submit found items, search for belongings, and manage claims through an intuitive interface. The system includes role-based access control, allowing both regular users and administrators to manage the lost and found ecosystem effectively.

## Technology Stack

### Frontend
- **Next.js 16** - React framework with server-side rendering
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Comprehensive component library
- **Lucide React** - Modern icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication and session management
- **bcryptjs** - Password hashing and security

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization

## Features

### User Authentication
- Secure user registration and login system
- Role-based access control (User/Admin)
- Session management with NextAuth.js
- Password security with bcrypt hashing

### Item Management
- Report lost or found items with detailed descriptions
- Image upload support for better identification
- Categorization system (Electronics, Clothing, Books, etc.)
- Location and date tracking
- Real-time search and filtering capabilities

### Search and Discovery
- Full-text search across item titles and descriptions
- Filter by category, type (lost/found), status, and location
- Pagination for efficient browsing
- Responsive grid layout for item display

### Claims System
- Submit claims for found items
- Provide proof and detailed descriptions
- Admin review and approval workflow
- Claim status tracking (Pending, Approved, Rejected)
- Notification system for claim updates

### Administrative Features
- Comprehensive admin dashboard
- User management and monitoring
- Item moderation and management
- Claim review and approval system
- Statistics and analytics
- Bulk operations and data management

### User Dashboard
- Personal item management
- Track submitted claims
- View reported items status
- Edit and manage own listings

## Feature Flow

### User Registration & Authentication
1. User visits the application homepage
2. Clicks "Sign Up" to create a new account
3. Provides email, name, and password
4. System validates input and creates user account
5. User receives confirmation and can log in
6. Session is established with secure authentication

### Item Reporting Workflow
1. Authenticated user navigates to "Report an Item"
2. Selects item type (Lost or Found)
3. Fills in required information:
   - Title and detailed description
   - Category selection
   - Location where item was lost/found
   - Date of occurrence
   - Contact information
4. Optionally uploads item image
5. System validates input and creates item record
6. Item is immediately visible in the browse section

### Item Discovery & Search
1. User accesses the main items listing page
2. Can browse all items or apply filters:
   - Type filter (Lost/Found/All)
   - Category filter (Electronics, Clothing, etc.)
   - Status filter (Open/Claimed/Resolved)
   - Location-based filtering
   - Date range selection
3. Full-text search capability for titles and descriptions
4. Results displayed in responsive card layout
5. Pagination for handling large datasets
6. Click on item card to view detailed information

### Claim Submission Process
1. User finds a relevant item in the listings
2. Navigates to item detail page
3. Clicks "Claim This Item" button
4. Fills claim form with:
   - Detailed message explaining ownership
   - Proof description with specific identifying features
   - Additional contact information if needed
5. System creates claim record with "Pending" status
6. Claim is added to user's personal dashboard
7. Administrators receive notification for review

### Administrative Review Workflow
1. Admin accesses dashboard and navigates to claims section
2. Reviews pending claims with associated item details
3. Evaluates claim validity based on:
   - Quality of proof description
   - Match with item characteristics
   - User history and credibility
4. Takes action:
   - Approve claim: Updates item status to "Claimed"
   - Reject claim: Provides reason and maintains item as "Open"
5. System notifies claimant of decision
6. Approved claims allow user contact information exchange

### Item Resolution Process
1. After claim approval, both parties can coordinate item return
2. Once item is successfully returned:
   - Item status changes to "Resolved"
   - Resolution date is recorded
   - Item is archived from active listings
3. Both users can view resolution history in their dashboards
4. System maintains audit trail for accountability

### Admin Dashboard Operations
1. Admin logs in with elevated privileges
2. Dashboard displays comprehensive statistics:
   - Total items by category and status
   - User registration trends
   - Claim success rates
   - Resolution time metrics
3. Administrative capabilities:
   - View and manage all user accounts
   - Edit or remove inappropriate listings
   - Bulk operations on items and claims
   - Generate reports and export data
   - System configuration and settings

## Data Models

### User Schema
- Email (unique, validated)
- Password (hashed, secure storage)
- Name (user display name)
- Role (User/Admin access level)
- Timestamps (creation and updates)

### Item Schema
- Title and description
- Category (predefined options)
- Type (Lost/Found)
- Status (Open/Claimed/Resolved)
- Location and date information
- Image URL (optional)
- Contact information
- Reporter reference
- Claimant reference (when claimed)
- Resolution timestamp

### Claim Schema
- Item reference
- Claimant reference
- Status (Pending/Approved/Rejected)
- Message and proof description
- Admin review notes
- Reviewer reference and timestamp

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js handler

### Items
- `GET /api/items` - Retrieve items with filtering and pagination
- `POST /api/items` - Create new item listing
- `GET /api/items/[id]` - Get specific item details
- `PUT /api/items/[id]` - Update item information
- `DELETE /api/items/[id]` - Remove item listing

### Claims
- `GET /api/claims` - Retrieve claims (filtered by user role)
- `POST /api/claims` - Submit new claim
- `GET /api/claims/[id]` - Get specific claim details
- `PUT /api/claims/[id]` - Update claim status (admin only)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics

## Security Features

- Password hashing with bcryptjs (12 rounds)
- Session-based authentication with NextAuth.js
- Role-based access control
- Input validation and sanitization
- SQL injection prevention through MongoDB
- XSS protection with proper data escaping
- Secure file upload handling
- API rate limiting considerations

## Performance Optimizations

- Server-side rendering with Next.js
- Database indexing for efficient queries
- Image optimization and lazy loading
- Pagination for large datasets
- Caching strategies for static content
- Component-level code splitting
- Optimized bundle sizes

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile responsive design

## Deployment Considerations

- Environment variable configuration
- MongoDB connection string setup
- NextAuth.js configuration
- Image storage and CDN integration
- SSL certificate requirement
- Domain and DNS configuration

This system provides a complete solution for campus lost and found management, combining modern web technologies with user-centric design to create an efficient and reliable platform for reuniting lost items with their owners.
