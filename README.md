# Notes App - example test automation project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

This is an example project that demonstrates usage of [Playwright](https://playwright.dev/) test automation.  The app uses a json server to create, read, update and delete notes.  The Playwright test suite is built around testing the functionality of the app.

The test framework uses a page object model...

Api tests using the json server routes....

## Available Scripts
You will need to start the json server which is configured to run on port 3004.  
Then the app can be started which uses the json server.

In the project directory, you can run:
### `npm run start-json-server`
### `npm run start-app`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

To run the playwright tests:

### `npm run playwright-test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
