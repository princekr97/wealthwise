
import {
    Restaurant as FoodIcon,
    ShoppingCart as GroceriesIcon,
    Flight as TravelIcon,
    Hotel as StaysIcon,
    Receipt as BillIcon,
    Bolt as UtilitiesIcon,
    ShoppingBag as ShoppingIcon,
    CardGiftcard as GiftsIcon,
    LocalCafe as DrinksIcon,
    LocalGasStation as FuelIcon,
    LocalHospital as HealthIcon,
    SportsEsports as EntertainmentIcon,
    AttachMoney as MoneyIcon,
    Category as CategoryIcon
} from '@mui/icons-material';

/**
 * Standardized Category Definitions
 */
export const CATEGORIES = [
    'Food',
    'Groceries',
    'Travel',
    'Stays',
    'Bills',
    'Subscription',
    'Shopping',
    'Gifts',
    'Drinks',
    'Fuel',
    'Health',
    'Entertainment',
    'Settlement',
    'Misc.'
];

/**
 * Category Styles (Background and Text Colors)
 * Using vibrant pastel backgrounds with darker text for contrast
 */
export const CATEGORY_STYLES = {
    'Food': { bg: '#ffedd5', color: '#ea580c' }, // Orange 100/600
    'Groceries': { bg: '#dcfce7', color: '#16a34a' }, // Green 100/600
    'Travel': { bg: '#e0f2fe', color: '#0284c7' }, // Sky 100/600
    'Stays': { bg: '#e0e7ff', color: '#4f46e5' }, // Indigo 100/600
    'Bills': { bg: '#fee2e2', color: '#dc2626' }, // Red 100/600
    'Subscription': { bg: '#f3e8ff', color: '#9333ea' }, // Purple 100/600
    'Shopping': { bg: '#fce7f3', color: '#db2777' }, // Pink 100/600
    'Gifts': { bg: '#ffe4e6', color: '#e11d48' }, // Rose 100/600
    'Drinks': { bg: '#fef3c7', color: '#d97706' }, // Amber 100/600
    'Fuel': { bg: '#f1f5f9', color: '#475569' }, // Slate 100/600
    'Health': { bg: '#d1fae5', color: '#059669' }, // Emerald 100/600
    'Entertainment': { bg: '#fae8ff', color: '#c026d3' }, // Fuchsia 100/600
    'Settlement': { bg: '#f3f4f6', color: '#4b5563' }, // Gray 100/600
    'Misc.': { bg: '#f3f4f6', color: '#4b5563' }
};

/**
 * Helper to get logic for a category
 */
export const getCategoryStyle = (category) => {
    return CATEGORY_STYLES[category] || { bg: '#f3f4f6', color: '#4b5563' };
};
