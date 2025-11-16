# Cross-Browser and Responsive Design Testing Guide

## Overview
This document outlines the testing procedures for verifying cross-browser compatibility and responsive design across different screen sizes for the Inventory Requisition System.

## Test Environment Requirements

### Browsers to Test
- ✅ Google Chrome (latest version)
- ✅ Mozilla Firefox (latest version)
- ✅ Microsoft Edge (latest version)
- ✅ Safari (latest version - macOS/iOS)

### Screen Sizes to Test
- ✅ Mobile: 375px - 767px (iPhone, Android phones)
- ✅ Tablet: 768px - 1023px (iPad, Android tablets)
- ✅ Desktop: 1024px and above (Laptops, Desktops)

## Testing Checklist

### 1. Layout and Navigation
- [ ] Sidebar navigation collapses to hamburger menu on mobile
- [ ] Hamburger menu opens/closes correctly on mobile
- [ ] Navigation items are accessible and clickable on all screen sizes
- [ ] Top navigation bar displays correctly on all devices
- [ ] User info displays appropriately on mobile vs desktop
- [ ] Breadcrumb navigation (if present) wraps correctly on small screens

### 2. Theme Switching
- [ ] Theme toggle button is visible and accessible on all pages
- [ ] Theme toggle button position is consistent (floating action button)
- [ ] Light theme applies correctly across all browsers
- [ ] Dark theme applies correctly across all browsers
- [ ] Theme preference persists after page reload
- [ ] CSS variables update correctly when theme changes
- [ ] All text remains readable in both themes
- [ ] All borders and backgrounds update correctly

### 3. Inventory Page
- [ ] Product images display correctly or show placeholder
- [ ] Table is horizontally scrollable on mobile devices
- [ ] Search input is full-width on mobile
- [ ] Category and status filters stack vertically on mobile
- [ ] Filter dropdowns are accessible on touch devices
- [ ] Stock status badges display correctly
- [ ] Notice banners are readable on all screen sizes
- [ ] Summary statistics grid adapts to screen size (2 cols mobile, 4 cols desktop)

### 4. Requisition Creation Page
- [ ] "Add Product" button is accessible on mobile
- [ ] Product selection modal displays correctly on all screen sizes
- [ ] Modal is scrollable on small screens
- [ ] Quantity input fields are touch-friendly
- [ ] Selected items list is readable on mobile
- [ ] Notes textarea expands appropriately
- [ ] Action buttons (Cancel, Save Draft, Submit) are accessible on mobile
- [ ] Form validation messages display correctly

### 5. Requisition History Page
- [ ] Table is horizontally scrollable on mobile
- [ ] Document numbers are readable on small screens
- [ ] Status badges display correctly
- [ ] Action buttons (View Details, Export) are accessible on mobile
- [ ] Detail modal displays correctly on all screen sizes
- [ ] PDF export works on all browsers
- [ ] Filter dropdown is accessible on touch devices

### 6. Admin Pages

#### Products Management
- [ ] Add/Edit product modal displays correctly on all screen sizes
- [ ] Form inputs are accessible on mobile
- [ ] Image URL input is functional
- [ ] Category datalist works on all browsers
- [ ] Table actions (Edit, Enable/Disable) are accessible on mobile

#### Approval Queue
- [ ] Requisition cards display correctly on mobile
- [ ] Approve/Reject/Issue buttons are accessible on touch devices
- [ ] Comment textarea in reject modal is functional
- [ ] Approval actions complete successfully on all browsers

#### Stock Adjustments
- [ ] Adjustment form displays correctly on mobile
- [ ] Product selection dropdown is accessible
- [ ] Quantity input is touch-friendly
- [ ] Reason dropdown works on all browsers
- [ ] History table is scrollable on mobile

#### Notices Management
- [ ] Notice creation form displays correctly on mobile
- [ ] Title and content inputs are accessible
- [ ] Active/Inactive toggle works on all browsers
- [ ] Notice cards display correctly on all screen sizes

#### Import Data
- [ ] File upload area is accessible on mobile
- [ ] File selection works on all browsers
- [ ] Preview table is scrollable on mobile
- [ ] Import button is accessible on touch devices

#### Reports
- [ ] Filter inputs display correctly on mobile
- [ ] Date range inputs work on all browsers
- [ ] Report table is scrollable on mobile
- [ ] Export functionality works on all browsers

### 7. Authentication Pages
- [ ] Login form displays correctly on all screen sizes
- [ ] Email and password inputs are accessible on mobile
- [ ] Submit button is touch-friendly
- [ ] Forgot password link is accessible
- [ ] Error messages display correctly
- [ ] Form validation works on all browsers

### 8. Date and Number Formatting
- [ ] All dates display in DD/MM/YYYY format
- [ ] Date formatting is consistent across all pages
- [ ] Numbers use Thai locale formatting (commas for thousands)
- [ ] Currency displays correctly (if applicable)
- [ ] Relative time displays correctly in Thai

### 9. Thai Language Display
- [ ] All Thai text renders correctly on all browsers
- [ ] Thai characters display without encoding issues
- [ ] Font rendering is consistent across browsers
- [ ] Text wrapping works correctly for Thai language
- [ ] No text overflow or truncation issues

### 10. Interactive Elements
- [ ] All buttons are clickable/tappable on touch devices
- [ ] Hover states work on desktop browsers
- [ ] Focus states are visible for keyboard navigation
- [ ] Dropdowns open correctly on all browsers
- [ ] Modals open and close correctly
- [ ] Form inputs accept text correctly
- [ ] Checkboxes and radio buttons work on all browsers

### 11. Performance
- [ ] Pages load within acceptable time on all browsers
- [ ] No console errors in any browser
- [ ] Images load correctly or show placeholders
- [ ] Transitions and animations are smooth
- [ ] No layout shifts during page load

## Browser-Specific Issues to Watch For

### Chrome
- CSS Grid and Flexbox support (should work perfectly)
- CSS Variables support (should work perfectly)
- localStorage access (should work perfectly)

### Firefox
- CSS Grid and Flexbox support (should work perfectly)
- CSS Variables support (should work perfectly)
- Font rendering differences (may appear slightly different)

### Safari
- CSS Grid and Flexbox support (should work perfectly)
- CSS Variables support (should work perfectly)
- Date input format differences
- localStorage in private browsing mode

### Edge
- CSS Grid and Flexbox support (should work perfectly)
- CSS Variables support (should work perfectly)
- Similar behavior to Chrome (Chromium-based)

## Responsive Design Breakpoints

The application uses Tailwind CSS breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Key Responsive Behaviors
1. **Navigation**: Sidebar becomes hamburger menu below `lg` (1024px)
2. **Grid Layouts**: Typically 1 column on mobile, 2-4 columns on desktop
3. **Tables**: Horizontal scroll on mobile, full display on desktop
4. **Modals**: Full-width on mobile, max-width on desktop
5. **Forms**: Single column on mobile, multi-column on desktop

## Testing Procedure

### Manual Testing Steps
1. Open the application in each browser
2. Test at each screen size (use browser dev tools)
3. Navigate through all pages
4. Test all interactive elements
5. Verify theme switching
6. Check date and number formatting
7. Verify Thai text display
8. Test form submissions
9. Check for console errors
10. Document any issues found

### Automated Testing (Future Enhancement)
Consider adding:
- Visual regression testing with tools like Percy or Chromatic
- Cross-browser testing with BrowserStack or Sauce Labs
- Responsive design testing with automated screenshot tools
- Accessibility testing with axe-core or Lighthouse

## Known Limitations
- PDF export uses jsPDF which has limited Thai font support
- Some Thai characters may not render perfectly in PDF exports
- Date inputs may display differently across browsers (using text input with DD/MM/YYYY format)

## Test Results Template

### Browser: [Browser Name and Version]
### Screen Size: [Mobile/Tablet/Desktop - Specific Resolution]
### Date Tested: [DD/MM/YYYY]
### Tester: [Name]

#### Issues Found:
1. [Description of issue]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce: [Steps]
   - Expected behavior: [Description]
   - Actual behavior: [Description]

#### Screenshots:
[Attach screenshots if applicable]

## Conclusion

This testing guide ensures that the Inventory Requisition System works correctly across all major browsers and screen sizes, providing a consistent user experience for all users regardless of their device or browser choice.

All Thai localization, date formatting (DD/MM/YYYY), and responsive design features have been implemented and should be verified through this testing process.
