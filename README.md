# Weekly Scheduler

This is a little project I put together to practice using Next.js with MySQL, Prisma, and next-auth, among others.

## Setup

### Environment

Create a `.env.local` file and store the following:

1. `NEXTAUTH_SECRET = "replace this text with whatever text you like"`
2. `USERNAME = "some name"` - you will use this with password to access content once the app is running
3. `PASSWORD = "some password"` - you will use this with username to access content once the app is running
4. `DEFAULT_WEEK_START = "Monday"` - Replace Monday with any other day of the week if desired
5. `DATABASE_URL="mysql://database_user_name:database_user_password@localhost:3306/database_name"` - Refer to the Prisma documentation for additional information on how to create the URL

### Database

You will need a MySQL database to connect to the app. Once you have an empty one running that matches the credentials provided using `DATABASE_URL` in `.env.local`, you can use the command `npx prisma db push` to create all needed tables.