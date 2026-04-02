# RoboHub

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./package.json)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](./LICENSE)

## What this project does

RoboHub is a front-end React web app for robotics learners and builders. It provides an interactive landing page with themed slides (Home, Connect, Consult, Courses, ROS2, and Care), plus user authentication components for login and registration.

## Why RoboHub is useful

- Single-page app built with React 19 and Create React App
- Responsive navigation and content sections via SideNav, Header, and slide components
- Modular UI split in src/components for easy extension and maintenance
- Built-in user flows for login, registration, and modal interactions
- Accessible global styles, animations, and utilities

## Key features

- Component-based architecture (Header, Footer, LoginForm, RegisterForm, PortalModal, SideNav)
- Slide content components in src/components/slides (e.g., HomeSlide, CoursesSlide, ROS2Slide)
- Custom hooks in src/hooks (useModal, useScrollSpy)
- Global styling in src/styles (variables, animations, and theme-ready setup)
- Test-ready setup with React Testing Library (existing App.test.js and setup in src/setupTests.js)

## Getting started

### Prerequisites

- Node.js 18+ (or latest LTS)
- npm 10+ (or yarn v1/v3)

### Install dependencies

`ash
cd robohub
npm install
`

### Run locally (development)

`ash
npm start
`

Open http://localhost:3000.

### Run tests

`ash
npm test
`

### Build for production

`ash
npm run build
`

## Project structure

- public/: static assets and metadata
- src/: source code
  - components/: UI components and slide sections
  - hooks/: reusable hooks (useModal, useScrollSpy)
  - styles/: CSS orchestration
  - utils/: constants and helpers

## How to use

1. Clone repository
2. Install dependencies
3. Launch 
pm start
4. Use navigation to explore slides and open login/register modals

### Example

The app starts with src/index.js rendering src/App.js and uses route-like slide sections in SideNav.

## Where to get help

- Raise issues in GitHub at [issues](https://github.com/<your-org>/robohub/issues)
- Check component files in src/components for self-help and adjustment
- Refer to CRA docs: https://create-react-app.dev/docs/getting-started/

## Who maintains and contributes

- Maintainer: (replace with your name/email)
- Contributing: Please see CONTRIBUTING.md (if present) or open a GitHub issue/pull request

## License

This repository should include a LICENSE file. If not, add one (MIT is typical).

## Additional notes

- This project is private by default (private: true in package.json).
- If you need backend support (authentication, data APIs), connect to your API service and wire LoginForm/RegisterForm handlers.
