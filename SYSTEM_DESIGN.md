# Academic Resource Platform - System Design Document

## Project Overview

**Platform Name:** Academic Resource Platform - Subscription Based Learning System

**Purpose:** A centralized hub where students can upload, search, and access verified academic study materials while connecting with senior mentors, selling/donating books, and earning rewards for quality contributions.

**Target Users:** Students, Senior Students, Mentors, and Administrators

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer (Frontend)                   │
│  React + TypeScript + Tailwind CSS + React Router               │
│  Contexts: Auth, Resource, Notification, Payment                │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS/REST API
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                     API Gateway / Load Balancer                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┬──────────────┐
    │            │            │              │              │
┌───▼───┐  ┌────▼────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
│ Auth  │  │Resource │  │ Payment  │  │   AI     │  │  Book    │
│Service│  │ Service │  │ Service  │  │ Service  │  │ Service  │
└───┬───┘  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
    │           │            │              │              │
    └───────────┴────────────┴──────────────┴──────────────┘
                             │
                ┌────────────▼────────────┐
                │   Database Layer        │
                │   MongoDB / MySQL       │
                └────────────┬────────────┘
                             │
                ┌────────────▼────────────┐
                │   Cloud Storage         │
                │   AWS S3 / Google Cloud │
                └─────────────────────────┘
```

### 1.2 Technology Stack

**Frontend:**
- Framework: React 18+ with TypeScript
- Styling: Tailwind CSS v4
- State Management: Context API (Auth, Resource, Notification, Payment)
- Routing: React Router v7 (Data Mode)
- HTTP Client: Fetch API / Axios
- Form Handling: React Hook Form
- Charts: Recharts
- Icons: Lucide React

**Backend:**
- Runtime: Node.js (v18+)
- Framework: Express.js / NestJS
- Language: TypeScript
- Authentication: JWT (JSON Web Tokens)
- File Upload: Multer
- Validation: Zod / Joi

**Database:**
- Primary: MongoDB (Document-based for flexible schemas)
- Alternative: MySQL (Relational for structured data)
- Cache: Redis (Session management, rate limiting)

**Cloud Storage:**
- AWS S3 / Google Cloud Storage
- File Types: PDFs, Images, Documents

**External Services:**
- AI Analysis: OpenAI API / Custom ML Model
- Plagiarism Detection: Copyscape API / Custom Solution
- Payment Gateways: eSewa, Khalti APIs
- Email: SendGrid / AWS SES
- Notifications: Firebase Cloud Messaging / Socket.io

---

## 2. Database Schema Design

### 2.1 MongoDB Schema (Recommended)

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed - bcrypt),
  fullName: String,
  role: String (enum: ['student', 'senior', 'mentor', 'admin']),
  institution: String,
  classLevel: String,
  profilePicture: String (URL),
  subscription: {
    status: String (enum: ['active', 'expired', 'cancelled']),
    plan: String (enum: ['monthly', 'semester', 'annual']),
    startDate: Date,
    endDate: Date,
    paymentMethod: String
  },
  rewards: {
    points: Number (default: 0),
    totalApprovedResources: Number,
    badges: [String]
  },
  stats: {
    uploadsCount: Number,
    downloadsCount: Number,
    likesReceived: Number,
    commentsReceived: Number
  },
  preferences: {
    notifications: Boolean,
    emailUpdates: Boolean
  },
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

#### Resources Collection
```javascript
{
  _id: ObjectId,
  title: String (indexed, text search),
  description: String,
  type: String (enum: ['notes', 'assignment', 'paper', 'guide']),
  uploadedBy: ObjectId (ref: Users),
  
  // Class-wise organization
  classification: {
    class: String (indexed),
    subject: String (indexed),
    topic: String (indexed),
    subtopic: String
  },
  
  // File information
  files: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String,
    thumbnailUrl: String
  }],
  
  // Workflow status
  workflow: {
    currentStage: String (enum: ['pending', 'ai_analysis', 'plagiarism_check', 
                                  'peer_review', 'admin_review', 'approved', 'rejected']),
    submittedAt: Date,
    aiAnalysis: {
      score: Number,
      feedback: String,
      analyzedAt: Date,
      status: String (enum: ['passed', 'failed', 'flagged'])
    },
    plagiarismCheck: {
      similarityScore: Number,
      sources: [String],
      checkedAt: Date,
      status: String (enum: ['passed', 'failed', 'flagged'])
    },
    peerReview: {
      reviewedBy: ObjectId (ref: Users),
      rating: Number,
      comments: String,
      reviewedAt: Date,
      status: String (enum: ['approved', 'rejected', 'revision_needed'])
    },
    adminReview: {
      reviewedBy: ObjectId (ref: Users),
      decision: String (enum: ['approved', 'rejected']),
      comments: String,
      reviewedAt: Date
    },
    publishedAt: Date
  },
  
  // Engagement metrics
  engagement: {
    views: Number (default: 0),
    downloads: Number (default: 0),
    likes: [ObjectId] (ref: Users),
    comments: [{
      userId: ObjectId (ref: Users),
      content: String,
      createdAt: Date,
      updatedAt: Date
    }],
    shares: Number (default: 0)
  },
  
  // Quality indicators
  quality: {
    rating: Number (1-5),
    totalRatings: Number,
    isTrending: Boolean,
    isPopular: Boolean,
    isFeatured: Boolean
  },
  
  tags: [String] (indexed),
  status: String (enum: ['draft', 'under_review', 'published', 'archived']),
  visibility: String (enum: ['public', 'subscribers_only', 'premium']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Books Collection
```javascript
{
  _id: ObjectId,
  title: String (indexed, text search),
  author: String,
  isbn: String,
  category: String (enum: ['sale', 'donation']),
  
  // Book details
  details: {
    publisher: String,
    edition: String,
    year: Number,
    pages: Number,
    language: String,
    condition: String (enum: ['new', 'like_new', 'good', 'fair', 'poor']),
    description: String
  },
  
  // Classification
  academic: {
    class: String,
    subject: String,
    board: String
  },
  
  // Sale information (if category = 'sale')
  sale: {
    price: Number,
    currency: String (default: 'NPR'),
    negotiable: Boolean,
    status: String (enum: ['available', 'sold', 'reserved'])
  },
  
  // Donation information (if category = 'donation')
  donation: {
    claimed: Boolean,
    claimedBy: ObjectId (ref: Users),
    claimedAt: Date
  },
  
  // Media
  images: [{
    url: String,
    isPrimary: Boolean
  }],
  
  // User information
  listedBy: ObjectId (ref: Users),
  
  // Engagement
  engagement: {
    views: Number,
    interested: [ObjectId] (ref: Users),
    comments: [{
      userId: ObjectId (ref: Users),
      content: String,
      createdAt: Date
    }]
  },
  
  status: String (enum: ['pending', 'approved', 'rejected', 'archived']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users, indexed),
  type: String (enum: ['resource_approved', 'resource_rejected', 'comment', 
                       'like', 'subscription', 'reward', 'book_interest', 'system']),
  title: String,
  message: String,
  
  relatedEntity: {
    entityType: String (enum: ['resource', 'book', 'user', 'subscription']),
    entityId: ObjectId
  },
  
  actionUrl: String,
  isRead: Boolean (default: false, indexed),
  priority: String (enum: ['low', 'medium', 'high']),
  createdAt: Date,
  expiresAt: Date
}
```

#### Payments Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users, indexed),
  type: String (enum: ['subscription', 'reward_payout']),
  
  // Subscription payment
  subscription: {
    plan: String (enum: ['monthly', 'semester', 'annual']),
    duration: Number (months),
    startDate: Date,
    endDate: Date
  },
  
  // Payment details
  amount: Number,
  currency: String (default: 'NPR'),
  method: String (enum: ['esewa', 'khalti', 'bank_transfer']),
  
  // Payment gateway response
  gateway: {
    transactionId: String (indexed),
    paymentId: String,
    status: String (enum: ['pending', 'completed', 'failed', 'refunded']),
    responseData: Object
  },
  
  // Bank transfer details (if method = 'bank_transfer')
  bankTransfer: {
    accountNumber: String,
    bankName: String,
    receiptUrl: String,
    verifiedBy: ObjectId (ref: Users),
    verifiedAt: Date
  },
  
  status: String (enum: ['pending', 'processing', 'completed', 'failed', 'refunded']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Reviews Collection
```javascript
{
  _id: ObjectId,
  resourceId: ObjectId (ref: Resources, indexed),
  reviewerId: ObjectId (ref: Users, indexed),
  reviewerRole: String (enum: ['senior', 'mentor', 'admin']),
  
  stage: String (enum: ['peer_review', 'admin_review']),
  
  review: {
    decision: String (enum: ['approved', 'rejected', 'revision_needed']),
    rating: Number (1-5),
    qualityScore: Number,
    comments: String,
    suggestions: String,
    categories: {
      accuracy: Number (1-5),
      completeness: Number (1-5),
      clarity: Number (1-5),
      formatting: Number (1-5)
    }
  },
  
  timeline: {
    assignedAt: Date,
    startedAt: Date,
    completedAt: Date
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

#### Subscriptions Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  features: [String],
  pricing: {
    monthly: Number,
    semester: Number (6 months),
    annual: Number
  },
  currency: String (default: 'NPR'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 MySQL Alternative Schema

```sql
-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('student', 'senior', 'mentor', 'admin') NOT NULL,
    institution VARCHAR(255),
    class_level VARCHAR(50),
    profile_picture VARCHAR(500),
    subscription_status ENUM('active', 'expired', 'cancelled'),
    subscription_end_date DATE,
    reward_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Resources Table
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type ENUM('notes', 'assignment', 'paper', 'guide'),
    uploaded_by INT NOT NULL,
    class VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    current_stage ENUM('pending', 'ai_analysis', 'plagiarism_check', 
                       'peer_review', 'admin_review', 'approved', 'rejected'),
    status ENUM('draft', 'under_review', 'published', 'archived'),
    views INT DEFAULT 0,
    downloads INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    rating DECIMAL(3,2),
    is_trending BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_class_subject (class, subject),
    INDEX idx_status (status),
    FULLTEXT INDEX idx_title_desc (title, description)
);

-- Books Table
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20),
    category ENUM('sale', 'donation') NOT NULL,
    condition_status ENUM('new', 'like_new', 'good', 'fair', 'poor'),
    price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'NPR',
    class VARCHAR(50),
    subject VARCHAR(100),
    listed_by INT NOT NULL,
    status ENUM('available', 'sold', 'claimed', 'archived'),
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listed_by) REFERENCES users(id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    FULLTEXT INDEX idx_title_author (title, author)
);

-- Resource Files Table
CREATE TABLE resource_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resource_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('resource', 'book') NOT NULL,
    entity_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_entity (entity_type, entity_id)
);

-- Likes Table
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resource_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (resource_id, user_id)
);

-- Notifications Table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
);

-- Payments Table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('subscription', 'reward_payout'),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NPR',
    method ENUM('esewa', 'khalti', 'bank_transfer'),
    transaction_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_transaction (transaction_id),
    INDEX idx_user_status (user_id, status)
);

-- Reviews Table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resource_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    stage ENUM('peer_review', 'admin_review'),
    decision ENUM('approved', 'rejected', 'revision_needed'),
    rating INT,
    comments TEXT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);
```

---

## 3. API Design

### 3.1 API Endpoints

#### Authentication APIs

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/verify-email/:token
GET    /api/auth/me
```

**Example: User Registration**
```javascript
POST /api/auth/register

Request Body:
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "student",
  "institution": "ABC University",
  "classLevel": "10"
}

Response (201 Created):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "student@example.com",
      "fullName": "John Doe",
      "role": "student",
      "subscription": {
        "status": "expired"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### User APIs

```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/:id
GET    /api/users/stats
GET    /api/users/rewards
PUT    /api/users/preferences
```

#### Resource APIs

```
GET    /api/resources                    # List all resources (with pagination, filters)
GET    /api/resources/:id                # Get single resource
POST   /api/resources                    # Create new resource
PUT    /api/resources/:id                # Update resource
DELETE /api/resources/:id                # Delete resource
GET    /api/resources/trending           # Get trending resources
GET    /api/resources/popular            # Get popular resources
GET    /api/resources/my-uploads         # Get user's uploaded resources

# Engagement
POST   /api/resources/:id/like           # Like a resource
DELETE /api/resources/:id/like           # Unlike a resource
POST   /api/resources/:id/comment        # Add comment
DELETE /api/resources/:id/comment/:commentId  # Delete comment
POST   /api/resources/:id/download       # Track download

# Search and Filter
GET    /api/resources/search?q=algebra&class=10&subject=math
GET    /api/resources/filter?class=10&subject=math&topic=algebra
```

**Example: Create Resource**
```javascript
POST /api/resources

Headers:
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request Body (FormData):
{
  "title": "Algebra Complete Notes",
  "description": "Comprehensive algebra notes for class 10",
  "type": "notes",
  "class": "10",
  "subject": "Mathematics",
  "topic": "Algebra",
  "tags": ["algebra", "equations", "polynomials"],
  "files": [File, File, ...]
}

Response (201 Created):
{
  "success": true,
  "message": "Resource uploaded successfully",
  "data": {
    "resource": {
      "id": "507f1f77bcf86cd799439012",
      "title": "Algebra Complete Notes",
      "workflow": {
        "currentStage": "ai_analysis",
        "status": "under_review"
      },
      "createdAt": "2026-03-14T10:30:00Z"
    }
  }
}
```

#### Workflow/Review APIs

```
GET    /api/reviews/queue                # Get review queue (role-based)
GET    /api/reviews/:resourceId          # Get review details
POST   /api/reviews/:resourceId/ai-analysis     # Trigger AI analysis
POST   /api/reviews/:resourceId/plagiarism      # Trigger plagiarism check
POST   /api/reviews/:resourceId/peer-review     # Submit peer review
POST   /api/reviews/:resourceId/admin-review    # Submit admin review
PUT    /api/reviews/:resourceId/status          # Update workflow status
```

**Example: Submit Peer Review**
```javascript
POST /api/reviews/507f1f77bcf86cd799439012/peer-review

Headers:
Authorization: Bearer {token}

Request Body:
{
  "decision": "approved",
  "rating": 4,
  "comments": "Well-structured notes with clear explanations",
  "categories": {
    "accuracy": 5,
    "completeness": 4,
    "clarity": 4,
    "formatting": 5
  }
}

Response (200 OK):
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "resourceId": "507f1f77bcf86cd799439012",
    "workflow": {
      "currentStage": "admin_review",
      "peerReview": {
        "status": "approved",
        "rating": 4
      }
    }
  }
}
```

#### Book APIs

```
GET    /api/books                        # List all books
GET    /api/books/:id                    # Get single book
POST   /api/books                        # List a book
PUT    /api/books/:id                    # Update book listing
DELETE /api/books/:id                    # Delete book listing
GET    /api/books/for-sale               # Books for sale
GET    /api/books/donations              # Donated books
POST   /api/books/:id/claim              # Claim a donated book
POST   /api/books/:id/interest           # Express interest
```

**Example: List Book for Sale**
```javascript
POST /api/books

Headers:
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request Body:
{
  "title": "Advanced Physics Class 12",
  "author": "H.C. Verma",
  "isbn": "9788177091878",
  "category": "sale",
  "condition": "good",
  "price": 450,
  "class": "12",
  "subject": "Physics",
  "description": "Slightly used, all pages intact",
  "negotiable": true,
  "images": [File, File]
}

Response (201 Created):
{
  "success": true,
  "message": "Book listed successfully",
  "data": {
    "book": {
      "id": "507f1f77bcf86cd799439013",
      "title": "Advanced Physics Class 12",
      "category": "sale",
      "price": 450,
      "status": "pending"
    }
  }
}
```

#### Subscription/Payment APIs

```
GET    /api/subscriptions/plans          # Get available plans
POST   /api/subscriptions/subscribe      # Subscribe to a plan
GET    /api/subscriptions/status         # Check subscription status
POST   /api/subscriptions/cancel         # Cancel subscription

POST   /api/payments/initiate            # Initiate payment
POST   /api/payments/verify              # Verify payment
GET    /api/payments/history             # Payment history
POST   /api/payments/esewa/callback      # eSewa callback
POST   /api/payments/khalti/callback     # Khalti callback
```

**Example: Subscribe to Plan**
```javascript
POST /api/subscriptions/subscribe

Headers:
Authorization: Bearer {token}

Request Body:
{
  "plan": "semester",
  "paymentMethod": "esewa"
}

Response (200 OK):
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "paymentUrl": "https://esewa.com.np/epay/main?...",
    "transactionId": "TXN123456789",
    "amount": 1200,
    "expiresAt": "2026-03-14T11:30:00Z"
  }
}
```

#### Notification APIs

```
GET    /api/notifications                # Get user notifications
GET    /api/notifications/unread         # Get unread notifications
PUT    /api/notifications/:id/read       # Mark as read
PUT    /api/notifications/read-all       # Mark all as read
DELETE /api/notifications/:id            # Delete notification
```

#### Feed APIs

```
GET    /api/feed                         # Get personalized feed
GET    /api/feed/trending                # Trending items
GET    /api/feed/announcements           # Mentor announcements
```

**Example: Get Feed**
```javascript
GET /api/feed?page=1&limit=20

Headers:
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": {
    "feed": [
      {
        "type": "resource",
        "id": "507f1f77bcf86cd799439014",
        "title": "Calculus Integration Notes",
        "description": "Complete integration techniques",
        "uploadedBy": {
          "id": "507f1f77bcf86cd799439011",
          "fullName": "John Doe"
        },
        "class": "12",
        "subject": "Mathematics",
        "engagement": {
          "likes": 45,
          "comments": 12,
          "downloads": 89
        },
        "publishedAt": "2026-03-13T15:30:00Z"
      },
      {
        "type": "book",
        "id": "507f1f77bcf86cd799439015",
        "title": "Organic Chemistry",
        "category": "donation",
        "listedBy": {
          "id": "507f1f77bcf86cd799439016",
          "fullName": "Jane Smith"
        },
        "createdAt": "2026-03-13T14:20:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 98,
      "hasMore": true
    }
  }
}
```

#### Admin APIs

```
GET    /api/admin/users                  # Manage users
PUT    /api/admin/users/:id/role         # Update user role
DELETE /api/admin/users/:id              # Delete user
GET    /api/admin/resources/pending      # Pending approvals
GET    /api/admin/books/pending          # Pending book listings
GET    /api/admin/statistics             # Platform statistics
GET    /api/admin/reports                # Generate reports
```

### 3.2 API Response Format

**Success Response:**
```javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2026-03-14T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Error Response:**
```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-03-14T10:30:00Z",
    "requestId": "req_abc124"
  }
}
```

**HTTP Status Codes:**
- 200: OK
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error

---

## 4. Workflow Engine Design

### 4.1 Content Submission Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                    5-STAGE APPROVAL WORKFLOW                      │
└──────────────────────────────────────────────────────────────────┘

Stage 1: STUDENT UPLOAD
├─ Student submits resource with metadata
├─ Files uploaded to cloud storage
├─ Initial validation (file type, size)
└─ Status: "pending" → "ai_analysis"

          ↓

Stage 2: AI ANALYSIS
├─ Content quality check
├─ Topic relevance verification
├─ Format validation
├─ Completeness assessment
└─ Decision: Pass (>70%) / Flag (40-70%) / Fail (<40%)

          ↓

Stage 3: PLAGIARISM CHECK
├─ Compare with existing resources
├─ Check external sources
├─ Calculate similarity percentage
└─ Decision: Pass (<30%) / Flag (30-50%) / Fail (>50%)

          ↓

Stage 4: PEER REVIEW (Senior Student / Mentor)
├─ Manual content verification
├─ Rate on multiple criteria:
│   ├─ Accuracy (1-5)
│   ├─ Completeness (1-5)
│   ├─ Clarity (1-5)
│   └─ Formatting (1-5)
├─ Provide feedback and suggestions
└─ Decision: Approve / Reject / Request Revision

          ↓

Stage 5: ADMIN APPROVAL
├─ Final verification
├─ Policy compliance check
├─ Quality assurance
└─ Decision: Publish / Reject

          ↓

PUBLISHED TO FEED
├─ Resource becomes publicly accessible
├─ Appears in home feed
├─ Indexed for search
├─ Student earns reward points
└─ Notification sent to uploader
```

### 4.2 Workflow State Machine

```javascript
const workflowStates = {
  pending: {
    next: ['ai_analysis'],
    actions: ['submit', 'cancel']
  },
  ai_analysis: {
    next: ['plagiarism_check', 'rejected'],
    actions: ['analyze', 'flag', 'reject']
  },
  plagiarism_check: {
    next: ['peer_review', 'rejected'],
    actions: ['check', 'flag', 'reject']
  },
  peer_review: {
    next: ['admin_review', 'rejected', 'ai_analysis'], // Can go back for revision
    actions: ['approve', 'reject', 'request_revision']
  },
  admin_review: {
    next: ['approved', 'rejected'],
    actions: ['approve', 'reject']
  },
  approved: {
    next: ['archived'],
    actions: ['publish', 'archive']
  },
  rejected: {
    next: [],
    actions: ['delete', 'resubmit']
  }
};
```

### 4.3 Review Queue Assignment Logic

```javascript
// Pseudo-code for assigning reviews
function assignReviewQueue(resource) {
  const { currentStage, classification } = resource;
  
  if (currentStage === 'peer_review') {
    // Assign to senior students or mentors
    const reviewers = getAvailableReviewers({
      roles: ['senior', 'mentor'],
      subject: classification.subject,
      minRating: 4.0,
      maxActiveReviews: 10
    });
    
    // Load balancing - assign to reviewer with least active reviews
    return reviewers.sort((a, b) => 
      a.activeReviewsCount - b.activeReviewsCount
    )[0];
  }
  
  if (currentStage === 'admin_review') {
    // Assign to admin with relevant subject expertise
    return getAvailableAdmins({
      subject: classification.subject
    });
  }
}
```

---

## 5. Component Architecture (Frontend)

### 5.1 Project Structure

```
/src
├── /app
│   ├── App.tsx                      # Main app component with RouterProvider
│   ├── routes.tsx                   # React Router configuration
│   │
│   ├── /components
│   │   ├── /layout
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   ├── /auth
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── /feed
│   │   │   ├── FeedContainer.tsx
│   │   │   ├── FeedItem.tsx
│   │   │   ├── ResourceCard.tsx
│   │   │   ├── BookCard.tsx
│   │   │   └── AnnouncementCard.tsx
│   │   │
│   │   ├── /resources
│   │   │   ├── ResourceList.tsx
│   │   │   ├── ResourceDetail.tsx
│   │   │   ├── ResourceUpload.tsx
│   │   │   ├── ResourceFilters.tsx
│   │   │   └── ResourceSearch.tsx
│   │   │
│   │   ├── /workflow
│   │   │   ├── WorkflowStatus.tsx
│   │   │   ├── ReviewQueue.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   ├── AIAnalysisCard.tsx
│   │   │   └── PlagiarismCard.tsx
│   │   │
│   │   ├── /books
│   │   │   ├── BookList.tsx
│   │   │   ├── BookDetail.tsx
│   │   │   ├── BookUpload.tsx
│   │   │   └── BookFilters.tsx
│   │   │
│   │   ├── /subscription
│   │   │   ├── SubscriptionPlans.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── SubscriptionStatus.tsx
│   │   │
│   │   ├── /notifications
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   └── NotificationItem.tsx
│   │   │
│   │   ├── /admin
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── ApprovalQueue.tsx
│   │   │   └── Statistics.tsx
│   │   │
│   │   └── /common
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Loader.tsx
│   │       ├── SearchBar.tsx
│   │       ├── Pagination.tsx
│   │       └── FileUpload.tsx
│   │
│   └── /pages
│       ├── HomePage.tsx
│       ├── LoginPage.tsx
│       ├── RegisterPage.tsx
│       ├── DashboardPage.tsx
│       ├── ResourcesPage.tsx
│       ├── BooksPage.tsx
│       ├── SubscriptionPage.tsx
│       ├── ProfilePage.tsx
│       ├── ReviewQueuePage.tsx
│       └── NotFoundPage.tsx
│
├── /context
│   ├── AuthContext.tsx              # User authentication state
│   ├── ResourceContext.tsx          # Resources and workflow state
│   ├── NotificationContext.tsx      # Notifications state
│   └── PaymentContext.tsx           # Payment and subscription state
│
├── /hooks
│   ├── useAuth.ts
│   ├── useResources.ts
│   ├── useNotifications.ts
│   ├── useSubscription.ts
│   └── useWorkflow.ts
│
├── /services
│   ├── api.ts                       # Axios instance configuration
│   ├── authService.ts
│   ├── resourceService.ts
│   ├── bookService.ts
│   ├── subscriptionService.ts
│   ├── notificationService.ts
│   └── workflowService.ts
│
├── /utils
│   ├── constants.ts
│   ├── helpers.ts
│   ├── validators.ts
│   └── formatters.ts
│
├── /types
│   ├── user.types.ts
│   ├── resource.types.ts
│   ├── book.types.ts
│   ├── notification.types.ts
│   └── workflow.types.ts
│
└── /styles
    ├── fonts.css
    └── theme.css
```

### 5.2 Context Architecture

**AuthContext:**
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileData) => Promise<void>;
  checkSubscription: () => boolean;
}
```

**ResourceContext:**
```typescript
interface ResourceContextType {
  resources: Resource[];
  currentResource: Resource | null;
  loading: boolean;
  error: string | null;
  fetchResources: (filters?: Filters) => Promise<void>;
  uploadResource: (data: ResourceUploadData) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  likeResource: (id: string) => Promise<void>;
  commentOnResource: (id: string, content: string) => Promise<void>;
  searchResources: (query: string) => Promise<void>;
}
```

**NotificationContext:**
```typescript
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}
```

**PaymentContext:**
```typescript
interface PaymentContextType {
  subscriptionStatus: SubscriptionStatus;
  plans: SubscriptionPlan[];
  loading: boolean;
  initiatePayment: (plan: string, method: PaymentMethod) => Promise<void>;
  verifyPayment: (transactionId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  getPaymentHistory: () => Promise<Payment[]>;
}
```

---

## 6. Security Design

### 6.1 Authentication & Authorization

**JWT Token Structure:**
```javascript
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "student@example.com",
    "role": "student",
    "subscription": "active",
    "iat": 1710412200,
    "exp": 1710498600  // 24 hours
  }
}
```

**Access Control Matrix:**

| Feature | Student | Senior | Mentor | Admin |
|---------|---------|--------|--------|-------|
| Upload Resources | ✓ (if subscribed) | ✓ | ✓ | ✓ |
| Download Resources | ✓ (if subscribed) | ✓ | ✓ | ✓ |
| Like/Comment | ✓ (if subscribed) | ✓ | ✓ | ✓ |
| Peer Review | ✗ | ✓ | ✓ | ✓ |
| Admin Review | ✗ | ✗ | ✗ | ✓ |
| User Management | ✗ | ✗ | ✗ | ✓ |
| Sell/Donate Books | ✓ (if subscribed) | ✓ | ✓ | ✓ |

### 6.2 Security Measures

**Password Security:**
- Bcrypt hashing (salt rounds: 12)
- Minimum 8 characters with complexity requirements
- Password reset via email token (expires in 1 hour)

**API Security:**
- Rate limiting: 100 requests/15 minutes per IP
- CORS configuration for allowed origins
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy headers)

**File Upload Security:**
- Allowed file types: PDF, DOCX, PNG, JPG, JPEG
- Maximum file size: 50MB per file
- Virus scanning before storage
- Sanitize file names
- Store in isolated cloud storage

**Payment Security:**
- PCI DSS compliance (if storing card data)
- HTTPS only for payment pages
- Payment gateway integration (no direct card handling)
- Transaction verification and reconciliation

### 6.3 Data Privacy

- GDPR/Data Protection compliance
- User consent for data collection
- Right to deletion (account and data)
- Encrypted storage for sensitive data
- Audit logs for admin actions
- Anonymous usage analytics

---

## 7. Reward System Design

### 7.1 Point Calculation

```javascript
const rewardRules = {
  resourceApproved: {
    base: 100,
    multipliers: {
      quality: {
        excellent: 1.5,    // Rating >= 4.5
        good: 1.2,         // Rating >= 3.5
        average: 1.0       // Rating < 3.5
      },
      engagement: {
        viral: 2.0,        // >100 downloads in first week
        popular: 1.5,      // >50 downloads in first week
        normal: 1.0
      }
    }
  },
  
  engagement: {
    perDownload: 2,
    perLike: 1,
    perComment: 3
  },
  
  consistency: {
    weeklyUpload: 50,      // Bonus for uploading every week
    monthlyStreak: 200     // Bonus for 30-day streak
  },
  
  peerReview: {
    perReview: 50,
    accuracyBonus: 25      // If review matches admin decision
  }
};

// Example calculation
function calculateRewards(resource) {
  let points = rewardRules.resourceApproved.base;
  
  // Quality multiplier
  if (resource.rating >= 4.5) {
    points *= rewardRules.resourceApproved.multipliers.quality.excellent;
  }
  
  // Engagement multiplier
  if (resource.downloads >= 100) {
    points *= rewardRules.resourceApproved.multipliers.engagement.viral;
  }
  
  // Engagement points
  points += resource.downloads * rewardRules.engagement.perDownload;
  points += resource.likes * rewardRules.engagement.perLike;
  points += resource.comments * rewardRules.engagement.perComment;
  
  return Math.round(points);
}
```

### 7.2 Badge System

```javascript
const badges = {
  contributor: {
    bronze: { threshold: 5, icon: '🥉' },
    silver: { threshold: 20, icon: '🥈' },
    gold: { threshold: 50, icon: '🥇' },
    platinum: { threshold: 100, icon: '💎' }
  },
  
  quality: {
    accuracy_expert: { criteria: 'avg_rating >= 4.5', icon: '🎯' },
    detail_oriented: { criteria: 'completeness_score >= 90', icon: '📝' },
    top_rated: { criteria: 'total_likes >= 500', icon: '⭐' }
  },
  
  engagement: {
    popular: { criteria: 'total_downloads >= 1000', icon: '🔥' },
    helpful: { criteria: 'total_comments >= 100', icon: '💬' },
    trending: { criteria: 'trending_resources >= 5', icon: '📈' }
  },
  
  special: {
    early_adopter: { criteria: 'registration_month == 1', icon: '🚀' },
    generous: { criteria: 'donated_books >= 10', icon: '🎁' },
    mentor: { criteria: 'peer_reviews >= 50', icon: '👨‍🏫' }
  }
};
```

### 7.3 Leaderboard System

```javascript
// Weekly/Monthly/All-time leaderboards
const leaderboardCategories = {
  topContributors: {
    metric: 'totalApprovedResources',
    period: 'week' | 'month' | 'all-time',
    limit: 10
  },
  
  topRated: {
    metric: 'averageRating',
    period: 'month',
    minResources: 5,
    limit: 10
  },
  
  mostPopular: {
    metric: 'totalDownloads',
    period: 'week',
    limit: 10
  },
  
  mostHelpful: {
    metric: 'rewardPoints',
    period: 'month',
    limit: 10
  }
};
```

---

## 8. Search & Discovery

### 8.1 Search Implementation

**Multi-field Search:**
```javascript
// MongoDB Text Search
db.resources.createIndex({
  title: "text",
  description: "text",
  "classification.topic": "text",
  tags: "text"
}, {
  weights: {
    title: 10,
    "classification.topic": 5,
    tags: 3,
    description: 1
  }
});

// Search query
db.resources.find({
  $text: { $search: "algebra equations" },
  status: "published"
}).sort({ score: { $meta: "textScore" } });
```

**Advanced Filters:**
```javascript
const filters = {
  class: ['10', '11', '12'],
  subject: ['Mathematics', 'Physics', 'Chemistry'],
  type: ['notes', 'assignment', 'paper'],
  rating: { min: 3.5, max: 5 },
  uploadDate: { from: '2026-01-01', to: '2026-03-14' },
  tags: ['algebra', 'calculus'],
  trending: true,
  popular: true
};
```

### 8.2 Recommendation Engine

```javascript
// Collaborative filtering
function getRecommendations(userId) {
  // 1. Get user's download/like history
  const userInterests = getUserInterests(userId);
  
  // 2. Find similar users
  const similarUsers = findSimilarUsers(userId, userInterests);
  
  // 3. Get resources liked by similar users
  const recommendations = getResourcesFromSimilarUsers(similarUsers);
  
  // 4. Filter out already seen resources
  // 5. Score and rank recommendations
  
  return recommendations;
}

// Content-based filtering
function getRelatedResources(resourceId) {
  const resource = getResource(resourceId);
  
  return findResources({
    "classification.class": resource.classification.class,
    "classification.subject": resource.classification.subject,
    tags: { $in: resource.tags },
    _id: { $ne: resourceId },
    status: "published"
  }).sort({ rating: -1 }).limit(5);
}
```

---

## 9. Notification System

### 9.1 Notification Types & Triggers

```javascript
const notificationTriggers = {
  // Resource lifecycle
  resource_uploaded: {
    recipient: 'uploader',
    trigger: 'on_upload',
    message: 'Your resource "{title}" has been submitted for review'
  },
  
  resource_approved: {
    recipient: 'uploader',
    trigger: 'workflow.currentStage == approved',
    message: 'Congratulations! Your resource "{title}" has been approved',
    actionUrl: '/resources/{id}'
  },
  
  resource_rejected: {
    recipient: 'uploader',
    trigger: 'workflow.currentStage == rejected',
    message: 'Your resource "{title}" needs revision',
    actionUrl: '/resources/{id}/edit'
  },
  
  // Engagement
  resource_liked: {
    recipient: 'uploader',
    trigger: 'on_like',
    message: '{userName} liked your resource "{title}"',
    batchable: true,  // Group multiple likes
    batchInterval: 3600  // 1 hour
  },
  
  resource_commented: {
    recipient: 'uploader',
    trigger: 'on_comment',
    message: '{userName} commented on "{title}"',
    actionUrl: '/resources/{id}#comments'
  },
  
  // Reviews
  review_assigned: {
    recipient: 'reviewer',
    trigger: 'on_assignment',
    message: 'New resource assigned for review: "{title}"',
    actionUrl: '/review-queue/{id}'
  },
  
  // Subscription
  subscription_expiring: {
    recipient: 'user',
    trigger: 'subscription.endDate - 7 days',
    message: 'Your subscription expires in 7 days',
    actionUrl: '/subscription/renew'
  },
  
  subscription_expired: {
    recipient: 'user',
    trigger: 'subscription.endDate',
    message: 'Your subscription has expired',
    actionUrl: '/subscription/plans'
  },
  
  // Rewards
  reward_earned: {
    recipient: 'user',
    trigger: 'on_reward',
    message: 'You earned {points} points!',
    actionUrl: '/profile/rewards'
  },
  
  badge_unlocked: {
    recipient: 'user',
    trigger: 'on_badge',
    message: 'New badge unlocked: {badgeName}!',
    actionUrl: '/profile/badges'
  },
  
  // Books
  book_interest: {
    recipient: 'book_owner',
    trigger: 'on_interest',
    message: '{userName} is interested in your book "{title}"',
    actionUrl: '/books/{id}'
  },
  
  book_claimed: {
    recipient: 'book_donor',
    trigger: 'on_claim',
    message: '{userName} claimed your donated book "{title}"',
    actionUrl: '/books/{id}'
  }
};
```

### 9.2 Real-time Notifications

**WebSocket Integration:**
```javascript
// Server-side (Socket.io)
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  
  // Join user's personal room
  socket.join(`user:${userId}`);
  
  // Send new notification
  function sendNotification(userId, notification) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
});

// Client-side
const socket = io({
  auth: { token: authToken }
});

socket.on('notification', (notification) => {
  // Update notification state
  addNotification(notification);
  
  // Show toast/popup
  showToast(notification.message);
  
  // Update badge count
  incrementUnreadCount();
});
```

---

## 10. Payment Integration

### 10.1 Payment Flow

```
User selects plan → Initiate payment → Redirect to gateway → 
User completes payment → Gateway callback → Verify transaction → 
Update subscription → Send confirmation
```

### 10.2 eSewa Integration

```javascript
// Initiate eSewa payment
function initiateEsewaPayment(subscriptionData) {
  const {
    amount,
    productId,
    userId,
    successUrl,
    failureUrl
  } = subscriptionData;
  
  const esewaParams = {
    amt: amount,
    psc: 0,  // Service charge
    pdc: 0,  // Delivery charge
    txAmt: 0,  // Tax amount
    tAmt: amount,  // Total amount
    pid: productId,  // Unique product ID
    scd: ESEWA_MERCHANT_CODE,
    su: successUrl,
    fu: failureUrl
  };
  
  // Form submission to eSewa
  const form = createEsewaForm(esewaParams);
  form.submit();
}

// Verify eSewa payment (callback)
async function verifyEsewaPayment(queryParams) {
  const { oid, amt, refId } = queryParams;
  
  const verificationUrl = `${ESEWA_VERIFY_URL}?amt=${amt}&rid=${refId}&pid=${oid}&scd=${ESEWA_MERCHANT_CODE}`;
  
  const response = await fetch(verificationUrl);
  const result = await response.text();
  
  if (result.includes('Success')) {
    // Update subscription
    await activateSubscription(oid, refId);
    return { success: true };
  }
  
  return { success: false };
}
```

### 10.3 Khalti Integration

```javascript
// Initiate Khalti payment
function initiateKhaltiPayment(subscriptionData) {
  const { amount, productId, userId } = subscriptionData;
  
  const config = {
    publicKey: KHALTI_PUBLIC_KEY,
    productIdentity: productId,
    productName: 'Academic Platform Subscription',
    productUrl: `${BASE_URL}/subscription`,
    eventHandler: {
      onSuccess(payload) {
        // Verify payment on backend
        verifyKhaltiPayment(payload);
      },
      onError(error) {
        console.error(error);
      },
      onClose() {
        console.log('Payment widget closed');
      }
    },
    paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING']
  };
  
  const checkout = new KhaltiCheckout(config);
  checkout.show({ amount: amount * 100 });  // Amount in paisa
}

// Verify Khalti payment
async function verifyKhaltiPayment(payload) {
  const { token, amount } = payload;
  
  const response = await fetch(`${KHALTI_VERIFY_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token, amount })
  });
  
  const result = await response.json();
  
  if (result.state.name === 'Completed') {
    await activateSubscription(result.product_identity, result.idx);
    return { success: true };
  }
  
  return { success: false };
}
```

### 10.4 Subscription Plans

```javascript
const subscriptionPlans = {
  monthly: {
    name: 'Monthly Plan',
    duration: 1,  // months
    price: 499,  // NPR
    currency: 'NPR',
    features: [
      'Unlimited resource access',
      'Upload up to 10 resources/month',
      'Download unlimited resources',
      'Like and comment',
      'Sell/donate books',
      'Earn rewards'
    ]
  },
  
  semester: {
    name: 'Semester Plan (6 months)',
    duration: 6,
    price: 1999,  // NPR (save 1000)
    currency: 'NPR',
    discount: 1000,
    popular: true,
    features: [
      'All Monthly Plan features',
      'Upload up to 20 resources/month',
      'Priority support',
      'Featured uploads',
      'Advanced analytics'
    ]
  },
  
  annual: {
    name: 'Annual Plan',
    duration: 12,
    price: 3499,  // NPR (save 2500)
    currency: 'NPR',
    discount: 2500,
    features: [
      'All Semester Plan features',
      'Unlimited uploads',
      'Premium badge',
      'Early access to new features',
      'Dedicated support'
    ]
  }
};
```

---

## 11. Performance Optimization

### 11.1 Database Optimization

**Indexing Strategy:**
```javascript
// MongoDB indexes
db.resources.createIndex({ "classification.class": 1, "classification.subject": 1 });
db.resources.createIndex({ status: 1, publishedAt: -1 });
db.resources.createIndex({ uploadedBy: 1, createdAt: -1 });
db.resources.createIndex({ "engagement.likes": 1 });
db.resources.createIndex({ "quality.isTrending": 1, "engagement.views": -1 });
db.users.createIndex({ email: 1 }, { unique: true });
db.notifications.createIndex({ userId: 1, isRead: 1 });
db.payments.createIndex({ transactionId: 1 }, { unique: true });
```

**Query Optimization:**
- Use projection to fetch only required fields
- Implement pagination for large datasets
- Use aggregation pipeline for complex queries
- Cache frequently accessed data (Redis)

### 11.2 Caching Strategy

```javascript
const cacheStrategy = {
  // User session
  'user:session:{userId}': {
    ttl: 86400,  // 24 hours
    data: 'user profile, permissions, subscription'
  },
  
  // Feed cache
  'feed:{userId}:page:{page}': {
    ttl: 300,  // 5 minutes
    data: 'personalized feed items'
  },
  
  // Trending resources
  'trending:resources': {
    ttl: 1800,  // 30 minutes
    data: 'top 20 trending resources'
  },
  
  // Search results
  'search:{query}:{filters}': {
    ttl: 600,  // 10 minutes
    data: 'search results'
  },
  
  // Subscription plans
  'subscription:plans': {
    ttl: 3600,  // 1 hour
    data: 'available plans'
  }
};
```

### 11.3 Frontend Optimization

- Code splitting with React.lazy()
- Image optimization (WebP, lazy loading)
- Debounced search inputs
- Virtual scrolling for long lists
- Service Worker for offline support
- Bundle size optimization
- CDN for static assets

---

## 12. Deployment Architecture

### 12.1 Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (CloudFlare)                      │
│                  Static Assets, Images, Files                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Load Balancer (nginx)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌──────▼───────┐ ┌────────▼───────┐
│  Web Server 1  │ │ Web Server 2 │ │  Web Server 3  │
│   (Node.js)    │ │  (Node.js)   │ │   (Node.js)    │
└───────┬────────┘ └──────┬───────┘ └────────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌──────▼───────┐ ┌────────▼───────┐
│   MongoDB      │ │    Redis     │ │  Cloud Storage │
│   (Primary +   │ │   (Cache)    │ │   (AWS S3 /    │
│   Replicas)    │ │              │ │  Google Cloud) │
└────────────────┘ └──────────────┘ └────────────────┘
```

### 12.2 Environment Configuration

**Development:**
- Local MongoDB
- Local Redis
- Mock payment gateways
- Debug logging enabled

**Staging:**
- Cloud MongoDB (test cluster)
- Cloud Redis
- Sandbox payment gateways
- Performance monitoring

**Production:**
- MongoDB Atlas (production cluster with replicas)
- Redis Cloud
- Live payment gateways
- Full monitoring and alerting
- Auto-scaling enabled
- Backup strategy

### 12.3 CI/CD Pipeline

```yaml
# GitHub Actions / GitLab CI example
pipeline:
  - stage: test
    - npm run lint
    - npm run type-check
    - npm run test
  
  - stage: build
    - npm run build
    - docker build -t app:${VERSION}
  
  - stage: deploy_staging
    - deploy to staging environment
    - run smoke tests
  
  - stage: deploy_production
    - requires manual approval
    - deploy to production
    - health check
    - rollback on failure
```

---

## 13. Monitoring & Analytics

### 13.1 Key Metrics

**System Metrics:**
- Server response time
- Database query performance
- API endpoint latency
- Error rates (4xx, 5xx)
- Server resource utilization (CPU, memory, disk)

**Business Metrics:**
- Active users (DAU, MAU)
- Subscription conversion rate
- Resource upload rate
- Resource approval rate
- Average time in workflow stages
- User engagement (likes, comments, downloads)
- Revenue (subscription, book sales)

**User Experience Metrics:**
- Page load time
- Time to interactive (TTI)
- First contentful paint (FCP)
- Core Web Vitals

### 13.2 Monitoring Tools

- Application Performance: New Relic / DataDog
- Error Tracking: Sentry
- Analytics: Google Analytics / Mixpanel
- Uptime Monitoring: Pingdom / UptimeRobot
- Log Management: ELK Stack / Splunk

---

## 14. Scalability Considerations

### 14.1 Horizontal Scaling

- Stateless application servers (can add more instances)
- Load balancer distributes traffic
- Database read replicas for read-heavy operations
- Microservices architecture for independent scaling
- Message queues (RabbitMQ/SQS) for async tasks

### 14.2 Vertical Scaling

- Upgrade server resources (CPU, RAM)
- Database optimization (indexes, query tuning)
- Caching layer (Redis)
- CDN for static content

### 14.3 Database Sharding

```javascript
// Shard by user ID
function getShardKey(userId) {
  return userId % NUMBER_OF_SHARDS;
}

// Shard by class level
function getShardByClass(classLevel) {
  const shardMap = {
    '1-5': 'shard1',
    '6-10': 'shard2',
    '11-12': 'shard3'
  };
  return shardMap[classLevel];
}
```

---

## 15. Testing Strategy

### 15.1 Testing Pyramid

**Unit Tests (70%):**
- Individual functions and components
- Business logic validation
- Utility functions
- Context providers

**Integration Tests (20%):**
- API endpoint testing
- Database operations
- Payment gateway integration
- Workflow engine

**End-to-End Tests (10%):**
- Complete user journeys
- Authentication flow
- Resource upload and approval
- Subscription purchase

### 15.2 Test Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: Key user flows
- E2E tests: Critical paths (login, upload, payment)

---

## 16. Future Enhancements

### 16.1 Phase 2 Features

1. **Mobile Application**
   - Native iOS/Android apps
   - Offline resource access
   - Push notifications

2. **Advanced AI Features**
   - Auto-tagging resources
   - Content summarization
   - Question generation from notes
   - Personalized learning paths

3. **Collaboration Features**
   - Study groups
   - Real-time collaborative editing
   - Video tutorials
   - Live mentoring sessions

4. **Gamification**
   - Achievement system
   - Challenges and competitions
   - Leaderboards
   - Virtual rewards marketplace

5. **Internationalization**
   - Multi-language support
   - Currency conversion
   - Regional content

### 16.2 Technical Improvements

- GraphQL API (alongside REST)
- Microservices architecture
- Event-driven architecture
- Machine learning recommendations
- Blockchain for content verification
- AR/VR study materials

---

## 17. Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data breach | High | Medium | Encryption, security audits, access controls |
| Payment fraud | High | Medium | Multi-factor verification, transaction limits |
| System downtime | High | Low | Redundancy, backups, monitoring |
| Poor content quality | Medium | High | Strict review process, AI filtering |
| Low user adoption | High | Medium | Marketing, referral program, free trial |
| Plagiarism issues | Medium | Medium | Advanced plagiarism detection, penalties |
| Server overload | Medium | Medium | Auto-scaling, caching, CDN |

---

## 18. Compliance & Legal

### 18.1 Terms of Service

- User responsibilities
- Content ownership
- Platform usage rules
- Prohibited activities
- Termination policies

### 18.2 Privacy Policy

- Data collection practices
- Data usage and sharing
- User rights (access, deletion, portability)
- Cookie policy
- Third-party services

### 18.3 Copyright Policy

- User-uploaded content ownership
- License grants
- DMCA takedown process
- Fair use guidelines

### 18.4 Academic Integrity

- Anti-plagiarism policies
- Proper citation requirements
- Original work verification
- Consequences for violations

---

## 19. Success Metrics

### 19.1 Launch Goals (First 3 Months)

- 1,000+ registered users
- 500+ subscribed users
- 2,000+ resources uploaded
- 1,500+ resources approved
- 50+ books listed
- 90%+ uptime
- <2s average page load time

### 19.2 Long-term Goals (1 Year)

- 10,000+ active users
- 5,000+ subscribers
- 20,000+ resources
- 500+ mentors
- 99.9% uptime
- 4.5+ app store rating
- Breakeven or profitable

---

## Conclusion

This system design document provides a comprehensive blueprint for building the Academic Resource Platform. The architecture is designed to be:

- **Scalable**: Handle growth in users and content
- **Secure**: Protect user data and prevent fraud
- **Performant**: Fast response times and smooth UX
- **Maintainable**: Clean code structure and documentation
- **Extensible**: Easy to add new features

The implementation should follow Agile methodology with iterative development, regular testing, and continuous deployment. Start with an MVP (Minimum Viable Product) containing core features, then gradually add advanced functionality based on user feedback and metrics.

---

## Appendix

### A. Glossary

- **Resource**: Academic content uploaded by users (notes, assignments, papers)
- **Workflow**: Multi-stage approval process for content verification
- **Subscription**: Paid membership for platform access
- **Reward Points**: Virtual currency earned for contributions
- **Feed**: Personalized content stream on home page
- **Review Queue**: List of pending resources awaiting review
- **Plagiarism Score**: Similarity percentage with existing content

### B. References

- React Documentation: https://react.dev/
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
- MongoDB Schema Design: https://www.mongodb.com/docs/manual/data-modeling/
- JWT Authentication: https://jwt.io/
- eSewa API Docs: https://developer.esewa.com.np/
- Khalti API Docs: https://docs.khalti.com/

---

**Document Version:** 1.0  
**Last Updated:** March 14, 2026  
**Prepared For:** University Project Submission  
**Authors:** Academic Resource Platform Team
