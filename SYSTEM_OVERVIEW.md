# Academic Resource Platform - System Overview

## Project Description
A university-level Academic Resource Platform that serves as a centralized hub for students to upload, search, and access verified academic study materials while connecting with senior mentors. The platform supports role-based authentication, AI-assisted content verification, plagiarism detection, and a comprehensive payment system.

## Core Features Implemented

### 1. ✅ News Feed Home Page
- **Latest Uploads Feed**: Displays recently uploaded and approved resources
- **Popular Resources**: Trending materials based on download count
- **Announcements Section**: Mentor and system announcements
- **Stats Dashboard**: Real-time statistics (materials, students, mentors)
- **Feature Highlights**: Platform capabilities overview

### 2. ✅ Multi-Role User System
The platform supports 4 distinct user roles:

#### **Student**
- Browse and search study materials
- Upload academic notes (free or paid)
- Purchase resources via NPR payment methods
- Track uploaded resources and earnings
- Receive notifications

#### **Senior Student**
- All student capabilities
- Review submitted materials from other students
- Provide feedback and ratings
- Approve/reject resources for peer review stage

#### **Mentor**
- Review academic materials
- Validate educational quality
- Provide detailed feedback
- Access review queue dashboard

#### **Admin**
- Full system oversight
- Manage users (activate/suspend)
- Final approval authority
- Monitor all transactions
- Run AI analysis and plagiarism checks
- Content moderation

### 3. ✅ Material Submission & Upload System
**Features:**
- Drag-and-drop file upload (PDF, DOCX, PPTX)
- Rich metadata: title, description, subject, semester, course
- Monetization option (free or paid resources)
- Price setting in NPR currency
- Automatic workflow initiation upon upload

### 4. ✅ 5-Step Review & Approval Workflow

**Step 1: AI Content Analysis**
- Relevance score (0-100%)
- Quality assessment (0-100%)
- Completeness check (0-100%)
- Automated suggestions for improvement
- Pass/fail determination

**Step 2: Plagiarism Detection**
- Similarity percentage calculation
- Source identification
- Threshold-based pass/fail (< 20% similarity)
- Visual progress indicators

**Step 3: Peer Review (Senior/Mentor)**
- Detailed feedback forms
- 1-5 rating system
- Comment threads
- Approve/reject with justification

**Step 4: Admin Approval**
- Final verification
- Publishing authority
- Override capabilities

**Step 5: Published**
- Live on platform
- Searchable and downloadable
- Monetization active

### 5. ✅ AI Assistance System
**Mock AI Implementation includes:**
- Content relevance checking (subject alignment)
- Quality scoring algorithms
- Completeness verification
- Automated improvement suggestions
- Real-time analysis simulation
- Visual score displays with progress bars

### 6. ✅ Plagiarism Detection System
**Features:**
- Similarity percentage calculation
- External source detection
- Visual indicators (color-coded warnings)
- Pass/fail status badges
- Detailed reports
- Timestamp tracking

### 7. ✅ Advanced Search System
**Filters:**
- **Subject**: Computer Science, Mathematics, Physics, Chemistry, etc.
- **Semester**: 1st through 8th
- **File Type**: PDF, DOCX, PPT
- **Sorting**: Most Popular, Highest Rated, Most Recent
- **Full-text Search**: Name and description matching

### 8. ✅ Notification System
**Notification Types:**
- **Approval**: Resource approved and published
- **Feedback**: Reviewer comments received
- **Upload**: New resources in your courses
- **Message**: Mentor communications
- **System**: Platform announcements

**Features:**
- Real-time notification bell with unread count
- Popover notification panel
- Mark as read functionality
- Timestamp display
- Notification badges

### 9. ✅ Payment & Monetization System
**Payment Methods (NPR Currency):**
- **eSewa**: Nepal's leading payment gateway
- **Khalti**: Digital wallet integration
- **Bank Transfer**: Traditional bank payments

**Features:**
- Resource pricing (minimum NPR 10)
- Purchase tracking
- Earnings dashboard
- Transaction history
- Seller/buyer records
- Revenue analytics for admins

### 10. ✅ Review Queue Dashboard
**For Seniors, Mentors & Admins:**
- Pending resources view
- AI analysis interface
- Plagiarism check interface
- Review submission forms
- Workflow progress tracking
- Status management
- Batch operations

## Technical Implementation

### Architecture
- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router v7 (Data Mode)
- **State Management**: Context API
  - AuthContext (user authentication)
  - ResourceContext (resource management)
  - NotificationContext (notifications)
  - PaymentContext (transactions)
- **UI Library**: Radix UI + Tailwind CSS v4
- **Form Handling**: React Hook Form
- **Notifications**: Sonner (toast system)

### Context System
1. **AuthContext**: Manages user authentication, login/logout, role-based access
2. **ResourceContext**: Resource CRUD, workflow management, reviews, AI/plagiarism results
3. **NotificationContext**: Notification creation, read/unread tracking
4. **PaymentContext**: Transaction processing, purchase tracking

### Data Persistence
- LocalStorage for demo (user sessions, transactions, uploads)
- Mock data for realistic demonstration
- Ready for backend integration (Supabase recommended)

### Workflow State Machine
```
Upload → AI Analysis → Plagiarism Check → Peer Review → Admin Approval → Published
         ↓              ↓                   ↓              ↓
      Rejected       Rejected           Rejected      Rejected
```

## Key Pages

### Public Pages
- **Home Page** (`/`): News feed, announcements, features
- **Login Page** (`/login`): Multi-role authentication

### Authenticated Pages
- **Dashboard** (`/dashboard`): Role-specific overview
- **Resource Library** (`/resources`): Browse and search
- **Upload Resource** (`/upload`): Submit new materials
- **Mentor Connect** (`/mentors`): Mentorship system
- **Review Queue** (`/review`): For seniors/mentors/admins
- **Admin Panel** (`/admin`): Admin-only controls
- **Earnings** (`/earnings`): Revenue tracking

## User Experience Features

### Visual Feedback
- **Status Badges**: Verified, Pending, Free, Paid, Purchased
- **Progress Bars**: Workflow stages, scores, similarity
- **Color Coding**: Green (approved), Yellow (pending), Red (rejected)
- **Icons**: Lucide React icon library
- **Loading States**: Spinners and skeleton screens

### Responsive Design
- Mobile-first approach
- Collapsible navigation
- Touch-friendly interfaces
- Adaptive layouts (grid/flex)

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

## Mock Data Examples

### Sample Resources
1. "Data Structures Complete Notes.pdf" - Approved, Free
2. "Algorithm Analysis Presentation.pptx" - Pending Review, NPR 200
3. "Database Management System.pdf" - Approved, Free
4. "Operating Systems Lab Manual.docx" - Pending, NPR 100

### Sample Users
- Students: Browse, upload, purchase
- Seniors: Review and approve
- Mentors: Guide and validate
- Admin: Full control

## Workflow Example

**Student uploads "Machine Learning Notes.pdf":**
1. Student fills form (title, subject, semester, price)
2. System creates resource with status: `pending_ai`
3. Admin runs AI analysis → Result: 92% relevance, 88% quality → Pass
4. Status changes to `pending_plagiarism`
5. Admin runs plagiarism check → Result: 8% similarity → Pass
6. Status changes to `pending_review`
7. Mentor reviews, rates 5/5, adds comment "Excellent resource!"
8. Status changes to `pending_admin`
9. Admin does final check and approves
10. Status changes to `approved` → Now live on platform!
11. Student receives notification: "Your resource has been approved!"

## Security Features (Frontend)
- Role-based route protection
- Action authorization checks
- Input validation
- XSS protection (React auto-escaping)
- Mock payment processing (no real credentials)

## Future Enhancements (Backend Integration)
- Real API authentication (JWT/OAuth)
- Database persistence (PostgreSQL/MongoDB)
- File storage (AWS S3/Cloudflare R2)
- Real AI integration (OpenAI/Anthropic)
- Real plagiarism API (Copyscape/Turnitin)
- Email notifications
- Real-time messaging
- Advanced analytics
- Mobile app (React Native)

## Technology Stack
- React 18.3.1
- TypeScript
- React Router 7
- Tailwind CSS 4
- Radix UI components
- Lucide React icons
- Sonner (toasts)
- React Hook Form
- Motion (animations)
- Date-fns

## Platform Benefits
1. **Centralized Knowledge**: All study materials in one place
2. **Quality Assurance**: Multi-stage verification process
3. **Peer Learning**: Senior students helping juniors
4. **Monetization**: Students can earn from their notes
5. **Mentorship**: Direct connection with experts
6. **Academic Integrity**: Plagiarism detection
7. **Transparency**: Clear workflow and feedback
8. **Accessibility**: Easy search and discovery

## Impact
- Creates sustainable academic ecosystem
- Incentivizes quality content creation
- Reduces redundant work
- Improves knowledge retention
- Builds academic community
- Supports student earnings
- Maintains academic standards

---

**Demo Ready**: All features are fully functional with mock data for demonstration purposes.
**Production Ready**: Architecture designed for easy backend integration.
