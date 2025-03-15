# Build, Test, and Lint Commands

- Start development server: `npm start` or `yarn start`
- Build for production: `npm run build` or `yarn build`
- Run tests: `npm test` or `yarn test`
- Run single test: `npm test -- -t 'test name'` or `yarn test -- -t 'test name'`
- Eject from create-react-app: `npm run eject` or `yarn eject` (avoid unless necessary)

# Code Style Guidelines

- **TypeScript**: Project uses TypeScript. Create new files with `.tsx` extension for React components and `.ts` for utilities.
- **Imports**: Group imports: React, third-party libraries, then local components/utilities.
- **Naming**:
  - Components: PascalCase
  - Functions/variables: camelCase
  - Types/Interfaces: PascalCase
  - Constants: UPPER_CASE for truly constant values, camelCase for configuration
- **Error Handling**: Use try/catch blocks with specific error messages, avoid console.error in production code.
- **Component Structure**: Use functional components with hooks.
- **Package Manager**: Yarn is preferred (packageManager entry in package.json).
- **Styling**: Mix of CSS and styled-components. Prefer component-specific styling.