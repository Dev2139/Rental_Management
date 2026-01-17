# HomeNest - Rental Property Management Platform

HomeNest is a modern, full-featured rental property management platform built with React, TypeScript, and Vite. It connects property owners and tenants in a seamless, secure environment for listing, browsing, and renting properties.

## 🏠 Features Overview

### **Navbar & Navigation**
- **Logo & Branding**: HomeNest logo with distinctive house icon
- **Main Navigation Links**:
  - Home: Main landing page with featured properties
  - Explore: Property browsing and filtering
  - Map View: Interactive map-based property discovery
- **Authentication Controls**:
  - Sign In / Get Started buttons for unauthenticated users
  - User profile dropdown with dashboard access and logout for authenticated users
  - Role-specific navigation (tenant vs owner)
- **Responsive Design**: Collapsible mobile menu with hamburger icon
- **Dynamic State**: Highlights active page in navigation

### **Hero Section**
- **Visually Appealing Design**: 
  - Gradient background with animated floating elements
  - Large, eye-catching typography with gradient text effect
  - High-quality property image showcase
- **Core Messaging**: "Find Your Perfect Home" with emphasis on verified listings
- **Interactive Search Bar**: Location-based search functionality with map pin icon
- **Statistics Display**: Key metrics showing 2,500+ properties, 1,200+ happy tenants, 98% satisfaction
- **Call-to-Action Buttons**: Primary buttons for browsing properties and listing options

### **Property Exploration Features**
- **Advanced Filtering System**:
  - Location-based search (city/area)
  - Price range filters (min/max rent)
  - Property type selection (1 BHK, 2 BHK, 3 BHK, Studio, PG, Villa, Apartment)
  - Mobile-friendly filter sheet for smaller screens
- **Property Cards**: Visually appealing cards with images, pricing, location, and key details
- **Responsive Grid Layout**: Adapts from 1 column on mobile to 3 columns on desktop
- **Empty State Handling**: Helpful messaging when no properties match filters
- **Active Filters Display**: Shows currently applied filters with easy removal

### **Map View Integration**
- **Interactive Map Interface**:
  - Powered by Mapbox GL with light theme
  - Property markers with price labels
  - Automatic zoom to property locations
  - Navigation controls for map manipulation
- **Dual-Pane Layout**: 
  - Left sidebar with property list
  - Main map view with markers
- **Property Popups**: Detailed information popups when clicking markers
  - Property image, title, address, and price
  - Direct link to property detail page
- **Coordinate Calculation**: Automatically centers map based on available properties
- **Responsive Design**: Sidebar becomes bottom sheet on mobile devices

### **Authentication System**
- **Dual Registration Options**:
  - Tenant registration: For users looking to rent properties
  - Owner registration: For users looking to list properties
- **Secure Login Process**: Email/password authentication
- **Password Visibility Toggle**: Eye icon to show/hide password
- **Social-style Auth Page**: Split-screen design with form on left and promotional content on right
- **Role-Based Redirection**: Automatically redirects to appropriate dashboard after login
- **Session Management**: Maintains user state across application

### **User Dashboards**

#### **Owner Dashboard**
- **Property Management**:
  - List all properties owned by the user
  - Add new property listings with comprehensive form
  - Property details: title, description, type, rent, deposit, address, coordinates
  - Room specifications: bedrooms, bathrooms, area in sq ft
  - Image upload capability with drag-and-drop support
  - Amenities and house rules management
- **Rental Request Management**:
  - View tenant rental requests
  - Approve or reject requests
  - See request details including move-in date and messages
- **Financial Tracking**:
  - View received payments
  - Track total revenue
  - Monitor pending payments
- **Statistics Cards**: Visual indicators for properties, pending requests, revenue, etc.
- **Tabbed Interface**: Organized sections for properties, requests, and payments

#### **Tenant Dashboard**
- **Rental Request Tracking**:
  - View sent rental requests
  - See request status (pending/approved/rejected)
  - Track move-in dates
- **Payment Management**:
  - View payment history
  - Make rent payments for approved properties
  - Transaction history with status tracking
- **Active Rentals**: List of currently rented properties
- **Statistics Cards**: Active rentals, pending requests, total paid, payments made
- **Tabbed Interface**: Organized sections for requests and payment history

### **Property Detail Pages**
- **Rich Media Experience**:
  - High-resolution image gallery with thumbnail navigation
  - Main image display with navigation controls
  - Fallback images for properties without photos
- **Comprehensive Property Information**:
  - Title, address, and location details
  - Pricing: monthly rent and security deposit
  - Specifications: bedrooms, bathrooms, area in sq ft
  - Property type classification
  - Verification badges for trusted listings
- **Detailed Descriptions**: Long-form property descriptions
- **Amenities Section**: Checkmark-listed features and facilities
- **House Rules**: Specific property regulations and restrictions
- **Rental Request Form**:
  - Move-in date selection
  - Message field for owner communication
  - Validation and submission handling
- **Interactive Elements**:
  - Like/favorite functionality
  - Social sharing options
  - Back navigation to search results

### **Technical Features**
- **Modern UI/UX**:
  - Glass-morphism and gradient effects
  - Smooth animations powered by Framer Motion
  - Responsive design for all screen sizes
  - Dark/light mode support
- **Performance Optimizations**:
  - Skeleton loading states for better UX
  - Efficient data fetching with TanStack Query
  - Lazy loading for images and components
- **Security**:
  - Supabase backend integration
  - Secure authentication and authorization
  - Verified listings system
- **Accessibility**:
  - Semantic HTML structure
  - Proper labeling and ARIA attributes
  - Keyboard navigation support
- **Component Architecture**:
  - Reusable UI components using shadcn/ui
  - Custom component library for property cards, layouts, etc.
  - Context API for state management

### **Additional Features**
- **Footer Navigation**: Comprehensive footer with quick links, contact information, and site map
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop
- **Toast Notifications**: User feedback system for actions and events
- **Form Validation**: Client-side validation with user-friendly error messages
- **Image Upload System**: Multi-file upload with preview and management
- **Search Functionality**: Real-time property search and filtering
- **Verification System**: Badges for verified listings and trusted landlords

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **Maps**: Mapbox GL for interactive maps
- **State Management**: React Context API, TanStack Query
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Routing**: React Router DOM
- **Forms**: React Hook Form (with Zod validation)

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables for Supabase
4. Run the development server: `npm run dev`

## 📋 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for improvements.

## 📄 License

This project is licensed under the MIT License.