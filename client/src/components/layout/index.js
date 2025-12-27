/**
 * Layout Components - Standardized UI Architecture
 *
 * This module provides a consistent, mobile-first UI component library
 * for WealthWise. Import these components to ensure consistent styling
 * across all pages.
 *
 * Architecture Overview:
 * - PageContainer: Wraps page content with consistent spacing/max-width
 * - PageHeader: Standardized page title, subtitle, and action pattern
 * - SummaryCard: Reusable metric card with value
 * - SummaryCardGrid: Grid layout for summary cards
 * - ChartCard: Wrapper for chart visualizations
 * - AuthLayout: Layout for authentication pages
 * - Layout: Main app layout with sidebar navigation
 */

// Main layout
export { Layout } from './Layout.jsx';

// Auth layout
export { default as AuthLayout } from './AuthLayout.jsx';

// Page structure
export { default as PageContainer } from './PageContainer.jsx';
export { default as PageHeader } from './PageHeader.jsx';

// Summary cards
export { default as SummaryCard } from './SummaryCard.jsx';
export { default as SummaryCardGrid } from './SummaryCardGrid.jsx';

// Chart components
export { default as ChartCard, ChartGrid, EmptyChartState } from './ChartCard.jsx';
