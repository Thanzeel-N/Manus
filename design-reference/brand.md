# Manu’s Car World identity

Source artwork: `public/images/IMG_3177.JPG.jpeg`, supplied by the owner.

The current transparent master is `public/brand/manus-transparent.png`, created
with the built-in image-generation tool in background-extraction mode. The original
JPEG is retained. `node scripts/export-brand.mjs` builds tightly framed SVG wrappers
from the PNG without changing its pixels. The light-surface logo keeps black
lettering; a presentation filter changes black ink to white on dark surfaces while
retaining red. The favicon frames the car emblem on transparency. These exports
contain raster artwork, not vector recreations of the logo.

- Logo red: `#ee2b20`; accessible white-text action red: `#cf241c`.
- Hover red: `#b51e17`; pale red: `#fff0ee`; near-black: `#121214`.
- Public pages support white and black surfaces, red actions and angular accents.
- The workspace uses a black sidebar with light or dark working panels.
- Status badges retain separate success, pending and inactive colours.

Shared React logo: `components/brand-logo.jsx`.
Public theme: `app/brand-theme.css`.
Workspace theme: `app/dashboard/brand-workspace.css`.
Colour modes: `app/color-modes.css` and `app/dashboard/workspace-modes.css`.
Theme control: `components/theme-toggle.jsx`; preference key: `manus-theme`.
The initial theme follows the device unless a preference is saved. The root layout
sets it before paint, and changes are synchronised between tabs. The Django admin
retains its own built-in light/dark/auto theme control.
Browser icon: `app/icon.svg`.
Django artwork and themes: `backend/showroom/static/showroom/brand/`.

Logo placements include the public header and footers, car-detail navigation,
workspace sign-in/sidebar/loading view, Django admin and legacy dashboard.

Background-removal prompt (built-in tool; transparent background enabled):

> Use case: background-extraction. Edit the supplied Manu’s Car World logo. Remove all white background to actual transparency, including enclosed white spaces in the car emblem and letters. Preserve the EXACT original red and black logo artwork, exact custom angular italic lettering MANU’S CAR WORLD, car emblem, geometry, proportions, colours, arrangement, spelling, and all details. Do not redraw, redesign or add any elements. Produce a tightly framed horizontal transparent PNG containing the entire original emblem above the entire wordmark, minimal transparent padding, high resolution. Black parts remain black and red parts remain the same red.
