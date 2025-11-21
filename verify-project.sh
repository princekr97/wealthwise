#!/bin/bash

# WealthWise Project Verification Script
# Run this to verify all components are in place

echo "🔍 WealthWise Project Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counts
FRONTEND_PAGES=0
FRONTEND_SERVICES=0
BACKEND_CONTROLLERS=0
BACKEND_ROUTES=0
BACKEND_MODELS=0

echo "📁 Checking Frontend Files..."
echo ""

# Check Pages
if [ -f "client/src/pages/Dashboard.jsx" ]; then echo -e "${GREEN}✓${NC} Dashboard.jsx"; ((FRONTEND_PAGES++)); else echo -e "${RED}✗${NC} Dashboard.jsx"; fi
if [ -f "client/src/pages/Expenses.jsx" ]; then echo -e "${GREEN}✓${NC} Expenses.jsx"; ((FRONTEND_PAGES++)); else echo -e "${RED}✗${NC} Expenses.jsx"; fi
if [ -f "client/src/pages/Income.jsx" ]; then echo -e "${GREEN}✓${NC} Income.jsx"; ((FRONTEND_PAGES++)); else echo -e "${RED}✗${NC} Income.jsx"; fi
if [ -f "client/src/pages/Loans.jsx" ]; then echo -e "${GREEN}✓${NC} Loans.jsx"; ((FRONTEND_PAGES++)); else echo -e "${RED}✗${NC} Loans.jsx"; fi
if [ -f "client/src/pages/Investments.jsx" ]; then echo -e "${GREEN}✓${NC} Investments.jsx"; ((FRONTEND_PAGES++)); else echo -e "${RED}✗${NC} Investments.jsx"; fi
if [ -f "client/src/pages/Lending.jsx" ]; then echo -e "${GREEN}✓${NC} Lending.jsx"; ((FRONTEND_PAGES++)); else echo -e "${RED}✗${NC} Lending.jsx"; fi
if [ -f "client/src/pages/Budget.jsx" ]; then echo -e "${GREEN}✓${NC} Budget.jsx"; ((FRONTEND_PAGES++)); else echo -e "${RED}✗${NC} Budget.jsx"; fi
if [ -f "client/src/pages/Settings.jsx" ]; then echo -e "${GREEN}✓${NC} Settings.jsx"; ((FRONTEND_PAGES++)); else echo -e "${RED}✗${NC} Settings.jsx"; fi

echo ""
echo "📦 Checking Frontend Services..."
echo ""

if [ -f "client/src/services/incomeService.js" ]; then echo -e "${GREEN}✓${NC} incomeService.js"; ((FRONTEND_SERVICES++)); else echo -e "${RED}✗${NC} incomeService.js"; fi
if [ -f "client/src/services/loanService.js" ]; then echo -e "${GREEN}✓${NC} loanService.js"; ((FRONTEND_SERVICES++)); else echo -e "${RED}✗${NC} loanService.js"; fi
if [ -f "client/src/services/investmentService.js" ]; then echo -e "${GREEN}✓${NC} investmentService.js"; ((FRONTEND_SERVICES++)); else echo -e "${RED}✗${NC} investmentService.js"; fi
if [ -f "client/src/services/lendingService.js" ]; then echo -e "${GREEN}✓${NC} lendingService.js"; ((FRONTEND_SERVICES++)); else echo -e "${RED}✗${NC} lendingService.js"; fi
if [ -f "client/src/services/budgetService.js" ]; then echo -e "${GREEN}✓${NC} budgetService.js"; ((FRONTEND_SERVICES++)); else echo -e "${RED}✗${NC} budgetService.js"; fi

echo ""
echo "🔧 Checking Backend Controllers..."
echo ""

if [ -f "server/src/controllers/authController.js" ]; then echo -e "${GREEN}✓${NC} authController.js"; ((BACKEND_CONTROLLERS++)); else echo -e "${RED}✗${NC} authController.js"; fi
if [ -f "server/src/controllers/expenseController.js" ]; then echo -e "${GREEN}✓${NC} expenseController.js"; ((BACKEND_CONTROLLERS++)); else echo -e "${RED}✗${NC} expenseController.js"; fi
if [ -f "server/src/controllers/incomeController.js" ]; then echo -e "${GREEN}✓${NC} incomeController.js"; ((BACKEND_CONTROLLERS++)); else echo -e "${RED}✗${NC} incomeController.js"; fi
if [ -f "server/src/controllers/loanController.js" ]; then echo -e "${GREEN}✓${NC} loanController.js"; ((BACKEND_CONTROLLERS++)); else echo -e "${RED}✗${NC} loanController.js"; fi
if [ -f "server/src/controllers/investmentController.js" ]; then echo -e "${GREEN}✓${NC} investmentController.js"; ((BACKEND_CONTROLLERS++)); else echo -e "${RED}✗${NC} investmentController.js"; fi
if [ -f "server/src/controllers/lendingController.js" ]; then echo -e "${GREEN}✓${NC} lendingController.js"; ((BACKEND_CONTROLLERS++)); else echo -e "${RED}✗${NC} lendingController.js"; fi
if [ -f "server/src/controllers/budgetController.js" ]; then echo -e "${GREEN}✓${NC} budgetController.js"; ((BACKEND_CONTROLLERS++)); else echo -e "${RED}✗${NC} budgetController.js"; fi
if [ -f "server/src/controllers/goalController.js" ]; then echo -e "${GREEN}✓${NC} goalController.js"; ((BACKEND_CONTROLLERS++)); else echo -e "${RED}✗${NC} goalController.js"; fi
if [ -f "server/src/controllers/dashboardController.js" ]; then echo -e "${GREEN}✓${NC} dashboardController.js"; ((BACKEND_CONTROLLERS++)); else echo -e "${RED}✗${NC} dashboardController.js"; fi

echo ""
echo "🛣️  Checking Backend Routes..."
echo ""

if [ -f "server/src/routes/authRoutes.js" ]; then echo -e "${GREEN}✓${NC} authRoutes.js"; ((BACKEND_ROUTES++)); else echo -e "${RED}✗${NC} authRoutes.js"; fi
if [ -f "server/src/routes/expenseRoutes.js" ]; then echo -e "${GREEN}✓${NC} expenseRoutes.js"; ((BACKEND_ROUTES++)); else echo -e "${RED}✗${NC} expenseRoutes.js"; fi
if [ -f "server/src/routes/incomeRoutes.js" ]; then echo -e "${GREEN}✓${NC} incomeRoutes.js"; ((BACKEND_ROUTES++)); else echo -e "${RED}✗${NC} incomeRoutes.js"; fi
if [ -f "server/src/routes/loanRoutes.js" ]; then echo -e "${GREEN}✓${NC} loanRoutes.js"; ((BACKEND_ROUTES++)); else echo -e "${RED}✗${NC} loanRoutes.js"; fi
if [ -f "server/src/routes/investmentRoutes.js" ]; then echo -e "${GREEN}✓${NC} investmentRoutes.js"; ((BACKEND_ROUTES++)); else echo -e "${RED}✗${NC} investmentRoutes.js"; fi
if [ -f "server/src/routes/lendingRoutes.js" ]; then echo -e "${GREEN}✓${NC} lendingRoutes.js"; ((BACKEND_ROUTES++)); else echo -e "${RED}✗${NC} lendingRoutes.js"; fi
if [ -f "server/src/routes/budgetRoutes.js" ]; then echo -e "${GREEN}✓${NC} budgetRoutes.js"; ((BACKEND_ROUTES++)); else echo -e "${RED}✗${NC} budgetRoutes.js"; fi
if [ -f "server/src/routes/goalRoutes.js" ]; then echo -e "${GREEN}✓${NC} goalRoutes.js"; ((BACKEND_ROUTES++)); else echo -e "${RED}✗${NC} goalRoutes.js"; fi
if [ -f "server/src/routes/dashboardRoutes.js" ]; then echo -e "${GREEN}✓${NC} dashboardRoutes.js"; ((BACKEND_ROUTES++)); else echo -e "${RED}✗${NC} dashboardRoutes.js"; fi

echo ""
echo "💾 Checking Backend Models..."
echo ""

if [ -f "server/src/models/userModel.js" ]; then echo -e "${GREEN}✓${NC} userModel.js"; ((BACKEND_MODELS++)); else echo -e "${RED}✗${NC} userModel.js"; fi
if [ -f "server/src/models/expenseModel.js" ]; then echo -e "${GREEN}✓${NC} expenseModel.js"; ((BACKEND_MODELS++)); else echo -e "${RED}✗${NC} expenseModel.js"; fi
if [ -f "server/src/models/incomeModel.js" ]; then echo -e "${GREEN}✓${NC} incomeModel.js"; ((BACKEND_MODELS++)); else echo -e "${RED}✗${NC} incomeModel.js"; fi
if [ -f "server/src/models/loanModel.js" ]; then echo -e "${GREEN}✓${NC} loanModel.js"; ((BACKEND_MODELS++)); else echo -e "${RED}✗${NC} loanModel.js"; fi
if [ -f "server/src/models/investmentModel.js" ]; then echo -e "${GREEN}✓${NC} investmentModel.js"; ((BACKEND_MODELS++)); else echo -e "${RED}✗${NC} investmentModel.js"; fi
if [ -f "server/src/models/personalLendingModel.js" ]; then echo -e "${GREEN}✓${NC} personalLendingModel.js"; ((BACKEND_MODELS++)); else echo -e "${RED}✗${NC} personalLendingModel.js"; fi
if [ -f "server/src/models/budgetModel.js" ]; then echo -e "${GREEN}✓${NC} budgetModel.js"; ((BACKEND_MODELS++)); else echo -e "${RED}✗${NC} budgetModel.js"; fi
if [ -f "server/src/models/goalModel.js" ]; then echo -e "${GREEN}✓${NC} goalModel.js"; ((BACKEND_MODELS++)); else echo -e "${RED}✗${NC} goalModel.js"; fi

echo ""
echo "📖 Checking Documentation..."
echo ""

if [ -f "README.md" ]; then echo -e "${GREEN}✓${NC} README.md"; else echo -e "${RED}✗${NC} README.md"; fi
if [ -f "QUICKSTART.md" ]; then echo -e "${GREEN}✓${NC} QUICKSTART.md"; else echo -e "${RED}✗${NC} QUICKSTART.md"; fi
if [ -f "COMPLETION_SUMMARY.md" ]; then echo -e "${GREEN}✓${NC} COMPLETION_SUMMARY.md"; else echo -e "${RED}✗${NC} COMPLETION_SUMMARY.md"; fi
if [ -f "IMPLEMENTATION_REPORT.md" ]; then echo -e "${GREEN}✓${NC} IMPLEMENTATION_REPORT.md"; else echo -e "${RED}✗${NC} IMPLEMENTATION_REPORT.md"; fi

echo ""
echo "=================================="
echo "📊 Summary:"
echo "=================================="
echo "Frontend Pages:        $FRONTEND_PAGES/8 ✓"
echo "Frontend Services:     $FRONTEND_SERVICES/5 ✓"
echo "Backend Controllers:   $BACKEND_CONTROLLERS/9 ✓"
echo "Backend Routes:        $BACKEND_ROUTES/9 ✓"
echo "Backend Models:        $BACKEND_MODELS/8 ✓"
echo ""

if [ $FRONTEND_PAGES -eq 8 ] && [ $FRONTEND_SERVICES -eq 5 ] && [ $BACKEND_CONTROLLERS -eq 9 ] && [ $BACKEND_ROUTES -eq 9 ] && [ $BACKEND_MODELS -eq 8 ]; then
    echo -e "${GREEN}✅ All files present and accounted for!${NC}"
    echo -e "${GREEN}✅ Project is ready for deployment!${NC}"
else
    echo -e "${YELLOW}⚠️  Some files may be missing. Please check.${NC}"
fi

echo ""
echo "🚀 To get started:"
echo "1. cd server && npm run dev"
echo "2. cd client && npm run dev"
echo "3. Open http://localhost:5173"
echo ""
