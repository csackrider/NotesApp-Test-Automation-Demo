# Notes App - example test automation project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

This is an example project that demonstrates usage of [Playwright](https://playwright.dev/) test automation.  The app uses a json server to create, read, update and delete notes.  The Playwright test suite is built around testing the basic functionality of the app.

The test framework uses a page object model.

## Available Scripts
You will need to start the json server which is configured to run on port 3004.  
Then the app can be started which uses the json server.

In the project directory, you can run:
### `npm run start-json-server`
### `npm run start-app`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

To run the playwright tests:

### `npm run playwright-test`

Note: the playwright-test command will start the json server and app if it's not already running if the user wants to just run the tests.

