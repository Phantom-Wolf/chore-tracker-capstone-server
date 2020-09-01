

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone GITHUB-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.


# Capstone Project Title

onTrack: A web application that makes tracking reoccuring tasks easy.

## Working Prototype

You can access a working prototype of the connected client app here: https://chore-tracker-capstone-client.vercel.app/Landing


### ScreenShots from Connected Front-End Client

Landing/Register Page
:-------------------------:
![Landing/Register Page](/github-images/wireframes/onTrack-Landing.png)
Login Page
![Login Page](/github-images/wireframes/onTrack-Login.png)
Dashboard
![Home/Dashboard](/github-images/wireframes/onTrack-Dashboard.png)
Category Page/Weekdays
![Catogory Page/Weekdays](/github-images/wireframes/onTrack-Weekdays.png)
Category Page/Weekly
![Catogory Page/Weekly](/github-images/wireframes/onTrack-Weeks.png)
Category Page/Monthly
![Catogory Page/Monthly](/github-images/wireframes/onTrack-Months.png)
Add Task Form
![Add Task Form](/github-images/wireframes/onTrack-Add-Task.jpg)
Task Details
![Task Details](/github-images/wireframes/onTrack-EventPage.jpg)
Not Found Page
![Not Found Page](/github-images/wireframes/onTrack-NotFoundPage.png)


## Functionality

The app's functionality includes:

- Every User has the ability to create an account

## Technology

- Front-End: HTML5, CSS3, JavaScript ES6, React
- Back-End: Node.js, Express.js, Mocha, Chai, RESTful API Endpoints, Postgres
- Development Environment: Heroku, DBeaver

## Back-end Structure - React Components Map

- **Server.js** 
- **App.js** 
    - **auth-router.js** - API
        - **auth-service.js** - query builder
    - **task-router.js** - API
        - **task-service.js** - query builder        
    - **events-router.js** - API
        - **events-service.js** - query builder
    - **users-router.js** - API
        - **users-service.js** - query builder
- **jwt-auth.js** - middleware
- **config.js** - configurations


## Business Objects

- user (DATABASE table)

  - user id
  - user_email (email validation)
  - user_password (at least 8 chars, 1 alpha, 1 special)

- event (DATABASE table)

  - event id
  - user_id
  - title (varchar)
  - notes (text)
  - recurrence (weekday, weekly, monthly)
  - recurrence_specifics (Monday, 2nd and 4th week of the month, January)
  - date_created (date)
  - date_ended (date)

- tasks (DATABASE table)
  - task id
  - event_id
  - date_of_task (date)
  - task_status (checked / un-checked)
  - task_completion_date (date)

## API Documentation

API Documentation details:

- Users

  - post, /api/users, new user data

- Auth

  - post, /api/auth/login, user credentials for login

- Events

  - get, /api/events, all events by user.id
  - post, /api/events, new event and all future tasks related to event
  - delete, /api/event/:event_id, event by event.id cascade all tasks related to event by id

- Tasks
  - get, /api/tasks/tasker/:event_id, all tasks by event.id
  - patch, /api/tasks/:task_id, update boolean completed status

## How to run it

Use command line to navigate into the project folder and run the following in terminal

### Local Node scripts

- To install the node project ===> npm install
- To migrate the database ===> npm run migrate -- 1
- To run Node server (on port 8000) ===> npm run dev
- To run tests ===> npm run test


