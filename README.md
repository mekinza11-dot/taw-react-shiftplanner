# ShiftPlanner – Smart Staff Scheduling System

ShiftPlanner is a web-based staff scheduling application designed for restaurants and retail businesses. It helps managers organize employees, create weekly work schedules, manage shift swap requests, and calculate employee working hours.

## Project Overview

**Problem:** Managing employee schedules manually can be time-consuming and lead to scheduling errors.

**Solution:** ShiftPlanner provides a centralized system where managers can manage employees, create weekly rotas, handle shift exchanges, and monitor working hours.

**Target Audience:**
- Restaurant managers
- Retail store managers
- Small business owners
- Staff scheduling administrators

## Features

### 1. Employee Management
- Add new employees.
- Store employee names, email addresses, and positions.
- View the employee list.
- Delete employee records.
- Validate email addresses and prevent duplicate emails.

### 2. Weekly Schedule Builder
- Assign employees to working days.
- Set shift start and end times.
- View the weekly staff rota.
- Add and delete shifts.
- Validate shift timings.

### 3. Shift Swap Management
- Create shift swap requests.
- Select two employees' shifts for an exchange.
- Validate that both shifts are on the same day.
- Approve or reject swap requests.
- Automatically exchange employee assignments when a request is approved.

### 4. Employee Hours Report
- Calculate total shifts for each employee.
- Calculate total working hours.
- Display employee positions.
- Calculate total team working hours.

### 5. Dashboard
- View total employees.
- View scheduled shifts.
- Monitor pending swap requests.
- View total team working hours.

## Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development server |
| CSS | Application styling |
| Node.js | Backend runtime |
| Express.js | REST API |
| PostgreSQL | Database |
| Supabase | Hosted PostgreSQL database |
| Prisma ORM | Database operations |
| JavaScript | Application logic |

## Project Architecture

ShiftPlanner follows a frontend-backend-database architecture.

1. **Frontend:** React provides the dashboard, employee management, weekly schedule, shift swaps, and hours report.
2. **Backend:** Node.js and Express handle API requests, validation, and application logic.
3. **Database:** PostgreSQL stores employees, shifts, and swap requests.
4. **Prisma ORM:** Connects the backend with PostgreSQL and manages database operations.

## Project Structure

```text
shiftplanner/
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── ...
│
├── server/
│   ├── index.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── prisma.config.ts
│   ├── .env
│   └── package.json
│
├── public/
├── package.json
├── README.md
└── .gitignore
```

## Installation and Setup

### Prerequisites
- Node.js and npm
- PostgreSQL database
- VS Code

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd shiftplanner
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` folder.

Add your PostgreSQL connection string:

```env
DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
```

Never upload your actual database password or `.env` file to GitHub.

### 5. Set Up the Database

From the `server` directory, run:

```bash
npx prisma migrate deploy
n