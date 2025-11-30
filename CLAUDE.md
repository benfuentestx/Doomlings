# Doomlings Game - Development Guidelines

## Design Philosophy: Portrait-Mobile-First

This game is designed **exclusively for portrait mobile devices**.

### Key Principles

1. **Portrait Mode Only**: The game is optimized for portrait orientation on mobile devices (320px - 430px width typical)
2. **No Landscape Support**: Do not add landscape or desktop responsive breakpoints
3. **No Media Queries for Desktop**: All CSS should assume a narrow, vertical viewport
4. **Touch-First Interactions**: Design for touch/tap interactions, not hover states

### Layout Strategy

- **Vertical Stacking**: All game elements stack vertically
- **Full-Width Components**: Most components should span the full width
- **Scrollable Areas**: Use vertical scrolling for overflow content
- **Fixed Viewport**: The viewport is locked to portrait orientation

### Code Guidelines

When working on this codebase:

- ✅ Design for 375px width (iPhone standard) as the baseline
- ✅ Use flexbox with `flex-direction: column` for layouts
- ✅ Make trait piles, opponent panels, and cards full-width or appropriately sized for mobile
- ✅ Test on mobile devices or mobile viewport in dev tools
- ❌ Don't add desktop-specific styles or wide-screen layouts
- ❌ Don't create multi-column grids (except for card grids)
- ❌ Don't use large fixed widths (keep everything fluid and responsive within portrait constraints)

### Component Sizing

- **Cards in hand**: Sized to fit ~3-4 cards visible with horizontal scroll
- **Opponent trait piles**: Full width, cards wrap to multiple rows
- **Player trait pile**: Full width with card wrapping
- **Modal overlays**: Full screen on mobile

### Future Development

All new features and components should be designed with portrait mobile as the primary (and only) target. Desktop/landscape support is explicitly not a goal for this project.
