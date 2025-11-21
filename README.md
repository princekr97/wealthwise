# 💰 WealthWise - Personal Finance Management Application

## Project Overview

WealthWise is a comprehensive, full-stack personal finance management application that enables users to track expenses, income, investments, loans, EMIs, and personal lending. The app features a **clean, interactive UI** with **comprehensive visual analytics**, is fully **responsive for web and mobile**, and follows **clean code principles** with proper documentation.

---

## ✨ Features Implemented

### ✅ Core Modules

1. **🔐 Authentication**
   - User registration and login with JWT
   - Password hashing with bcrypt
   - Auto logout on token expiry
   - Protected routes

2. **💸 Expense Tracker**
   - Add/edit/delete expenses
   - 13 predefined categories with icons
   - Priority levels (High/Medium/Low)
   - Payment method tracking
   - Recurring expense support
   - Category-wise analytics

3. **💵 Income Management**
   - Track multiple income sources
   - 8 source types (Salary, Freelance, Business, etc.)
   - Recurring income support
   - Summary and trends

4. **🏦 Loan & EMI Tracker**
   - Create/manage loans
   - Auto EMI calculation
   - Remaining balance tracking
   - Payment history
   - Active/closed status

5. **📈 Investment Portfolio**
   - Track 10 investment types
   - Auto calculate returns and percentages
   - Portfolio value tracking
   - CAGR calculations

6. **🤝 Money Lending/Borrowing**
   - Track money lent to friends/family
   - Track money borrowed
   - Partial payments
   - Status tracking (pending/partial/settled)

7. **🎯 Budget & Goals**
   - Monthly budget planning
   - Category-wise budget limits
   - Financial goals with progress tracking
   - Budget vs actual comparison

8. **⚙️ Settings & Profile**
   - User profile management
   - Notification preferences
   - Appearance settings
   - Logout functionality

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** with Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Recharts** for charts and analytics
- **Lucide React** for icons
- **Axios** for HTTP requests
- **React Hook Form** + **Zod** for form validation

### Backend
- **Node.js 18+** runtime
- **Express.js** framework
- **MongoDB + Mongoose** for database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Joi** for validation

---

## 📁 Project Structure

```
wealthwise/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # UI components
│   │   │   └── layout/          # Navigation & Layout
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Income.jsx
│   │   │   ├── Loans.jsx
│   │   │   ├── Investments.jsx
│   │   │   ├── Lending.jsx
│   │   │   ├── Budget.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API call functions
│   │   ├── store/               # Zustand stores
│   │   ├── utils/               # Helper functions
│   │   └── styles/              # Global styles
│   └── package.json
│
├── server/                      # Node.js Backend
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/         # Route handlers
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API routes
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   └── utils/
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd wealthwise
```

2. **Setup Backend**
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wealthwise?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start server:
```bash
npm run dev
```

3. **Setup Frontend**
```bash
cd ../client
npm install
```

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Start frontend:
```bash
npm run dev
```

---

## 📊 Database Schema

### Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date
}
```

### Expenses
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,
  category: String,
  date: Date,
  description: String,
  priority: String,
  paymentMethod: String,
  bankName: String,
  isRecurring: Boolean,
  createdAt: Date
}
```

### Income
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,
  sourceType: String,
  date: Date,
  description: String,
  isRecurring: Boolean,
  creditTo: String,
  createdAt: Date
}
```

### Loans
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  loanType: String,
  bankName: String,
  principal: Number,
  interestRate: Number,
  tenure: Number,
  emiAmount: Number,
  emiDueDate: Number,
  startDate: Date,
  remainingBalance: Number,
  status: String,
  payments: [{date: Date, amount: Number}],
  createdAt: Date
}
```

### Investments
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,
  platform: String,
  name: String,
  amountInvested: Number,
  currentValue: Number,
  purchaseDate: Date,
  units: Number,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
```

### Expenses
```
GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/summary
GET    /api/expenses/by-category
```

### Income
```
GET    /api/income
POST   /api/income
PUT    /api/income/:id
DELETE /api/income/:id
GET    /api/income/summary
```

### Loans
```
GET    /api/loans
POST   /api/loans
PUT    /api/loans/:id
DELETE /api/loans/:id
POST   /api/loans/:id/payment
```

### Investments
```
GET    /api/investments
POST   /api/investments
PUT    /api/investments/:id
DELETE /api/investments/:id
GET    /api/investments/portfolio
```

### Lending
```
GET    /api/lending
POST   /api/lending
PUT    /api/lending/:id
DELETE /api/lending/:id
POST   /api/lending/:id/payment
```

### Budget & Goals
```
GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/:id
DELETE /api/budgets/:id
GET    /api/goals
POST   /api/goals
PUT    /api/goals/:id
DELETE /api/goals/:id
```

### Dashboard
```
GET    /api/dashboard/summary
GET    /api/dashboard/charts
```

---

## 🎨 UI/UX Features

### Responsive Design
- ✅ Mobile-first approach
- ✅ Touch-friendly buttons (44px+)
- ✅ Responsive breakpoints (sm, md, lg, xl)
- ✅ Optimized for mobile, tablet, and desktop

### Interactive Elements
- ✅ Smooth transitions and hover effects
- ✅ Loading states with skeletons
- ✅ Toast notifications for feedback
- ✅ Real-time form validation
- ✅ Animated charts with tooltips

### Visual Design
- ✅ Consistent color scheme
- ✅ Clear visual hierarchy
- ✅ Gradient backgrounds
- ✅ Icon-based categories
- ✅ Modern card-based layouts

---

## 📝 Code Standards

### File Organization
- One component/service per file
- Files kept under 200 lines
- Clear separation of concerns
- Reusable components and hooks

### Naming Conventions
- Components: `PascalCase` (ExpenseCard.jsx)
- Functions: `camelCase` (calculateTotal)
- Constants: `UPPER_SNAKE` (API_BASE_URL)
- Files: `kebab-case` (expense-service.js)

### Documentation
- File header comments explaining purpose
- JSDoc comments for functions
- Clear inline comments for complex logic
- README files for setup instructions

---

## 🧪 Testing the Application

### Registration & Login Flow
```
1. Go to http://localhost:5173
2. Click "Register"
3. Fill in email, password, confirm password
4. Submit
5. Login with credentials
6. Should redirect to Dashboard
```

### Testing Each Module
```
Dashboard    → View financial overview
Expenses     → Add/view/delete expenses
Income       → Track income sources
Loans        → Manage loans and EMIs
Investments  → Track portfolio
Lending      → Track personal lending
Budget       → Set budgets and goals
Settings     → Update profile
```

---

## ✅ Quality Checklist

- [x] All pages responsive (mobile/tablet/desktop)
- [x] All forms have validation
- [x] All API calls have error handling
- [x] Loading states on all async actions
- [x] Proper comments in code
- [x] No console errors
- [x] Modern UI with gradients and colors
- [x] Full CRUD operations for all modules
- [x] Authentication with JWT
- [x] MongoDB integration

---

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
cd client
npm run build
# Drag and drop dist folder to Vercel
# Or connect GitHub repository
```

### Backend Deployment (Railway/Render)
```bash
# Push repository to GitHub
# Connect to Railway/Render
# Set environment variables
# Deploy!
```

---

## 📱 Features at a Glance

| Feature | Status | Module |
|---------|--------|--------|
| Track Expenses | ✅ | Expenses |
| Track Income | ✅ | Income |
| EMI Management | ✅ | Loans |
| Investment Tracking | ✅ | Investments |
| Personal Lending | ✅ | Lending |
| Budget Planning | ✅ | Budget |
| Financial Analytics | ✅ | Dashboard |
| User Authentication | ✅ | Auth |
| Responsive Design | ✅ | All |
| Beautiful Charts | ✅ | Dashboard |

---

## 💡 Future Enhancements

1. **Dark Mode** - Theme toggle
2. **Export Reports** - PDF/CSV download
3. **Bill Reminders** - Push notifications
4. **Receipt Scan** - OCR auto-fill
5. **Multi-Currency** - For travelers
6. **Offline Mode** - PWA support
7. **AI Insights** - Smart recommendations
8. **Banking Integration** - Auto sync transactions

---

## 📞 Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for better personal finance management**

*Master Your Money, Shape Your Future* 🚀
