# Surf Shop

A modern full-stack application for listing and viewing surfboards. Built with Node.js, Express, MongoDB, and EJS.

## Features

- User authentication and authorization
- Image upload with Cloudinary
- Geocoding with Mapbox
- Password reset via email (SendGrid)
- Search and filter posts
- Reviews and ratings system
- Responsive design with Bootstrap

## Prerequisites

- Node.js (v22.9.0 or higher)
- MongoDB (v7.0.14 or higher)
- Git

## Environment Variables

Create a `.env` file in the root directory with the following variables (`cp example.env .env`):

```env
CLOUDINARY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_KEY=
MAPBOX_TOKEN=
SENDGRID_API_KEY=
FROM_EMAIL=
```

*Note:* Leave SENDGRID_API_KEY= empty if you don't have a SendGrid account setup. When you trigger the sending of an email (password reset), the application will log the email to the console. 

## Installation

1. Clone the repository and switch to the 2025-update branch:
```bash
git clone https://github.com/nax3t/surf-shop.git
cd surf-shop
git fetch origin 2025-update
git checkout -b 2025-update origin/2025-update
```

2. Install dependencies:
```bash
npm install
```

3. Start MongoDB:
```bash
mongod
```

4. Seed the database:
```bash
node seeds.js
```

5. Start the application: 
```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).