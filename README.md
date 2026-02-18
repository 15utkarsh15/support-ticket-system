# Support Ticket System

A complete support ticket management platform that helps teams organize, track, and resolve customer issues efficiently. 
Build with Django, React, and PostgreSQL.

## What It Does

This application allows you to:
- **Create tickets** - Quickly log support requests with title, description, and details
- **Organize automatically** - Tickets are automatically categorized and prioritized to help you work smarter
- **Track progress** - Update ticket status as you work through them (Open, In Progress, Resolved, Closed)
- **View statistics** - Get instant insights into ticket distribution, open issues, and team performance
- **Search easily** - Find tickets by keywords in title or description

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your system

### Installation & Running

```bash
# 1. Clone the repository
git clone <repository-url>
cd support-ticket-system

# 2. Set up environment variables (optional)
cp .env.example .env
# Edit .env if you want to customize settings

# 3. Start the application
docker-compose up --build

# 4. Access the application
# Open in your browser: http://localhost:3000
# API endpoints available at: http://localhost:8000/api/tickets/
```

The database is automatically set up on first run. The system works perfectly out of the box—all core features are available without additional configuration.

## How It's Built

```
support-ticket-system/
├── Backend (Django REST Framework)
│   ├── Ticket management and processing
│   ├── Database models and validation
│   └── API endpoints
├── Frontend (React)
│   ├── User interface components
│   ├── Form handling and validation
│   └── Real-time statistics display
└── Database (PostgreSQL)
    └── Persistent data storage
```

## Key Features

- **Data Validation**: All ticket information is validated both in the application and at the database level to ensure data integrity
- **Smart Organization**: Tickets are automatically assigned to appropriate categories and priority levels
- **Advanced Search**: Find tickets quickly by searching across titles and descriptions
- **Performance Optimization**: Statistics are calculated efficiently without unnecessary processing
- **Error Handling**: If anything goes wrong, users can still create and manage tickets—nothing is lost
- **Responsive Design**: Works smoothly on desktop and mobile browsers

## API Endpoints

The application provides a clean API for managing tickets:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/tickets/` | Create a new ticket |
| `GET` | `/api/tickets/` | View all tickets |
| `PATCH` | `/api/tickets/<id>/` | Update a ticket |
| `GET` | `/api/tickets/stats/` | Get overview statistics |
| `POST` | `/api/tickets/classify/` | Get automatic category suggestions |

**Filtering & Search**: Use query parameters to find what you need:
- `?category=bug` - Filter by category
- `?priority=high` - Filter by priority level
- `?status=open` - Filter by status
- `?search=keyword` - Search in title and description

## Project Structure Explained

Here's what each folder does:

### Backend (`backend/`)
- **models.py** - Defines what a ticket looks like (title, description, category, etc.)
- **views.py** - Handles the business logic and API responses
- **serializers.py** - Converts data to and from JSON format
- **admin.py** - Management interface for administrators

### Frontend (`frontend/`)
- **App.js** - Main application component
- **api.js** - Handles communication with the backend
- **components/** - Reusable user interface elements:
  - `TicketForm.js` - New ticket creation form
  - `TicketList.js` - Display and manage tickets
  - `StatsPanel.js` - Shows statistics and insights

## Common Tasks

### Check if the application is running
Visit `http://localhost:3000` in your browser. If you see the ticket interface, everything is working!

### View database contents
The PostgreSQL database is running inside Docker. To interact with it, use the Django management interface at `http://localhost:8000/admin` (default credentials are in `.env`).

### Stop the application
Press `Ctrl+C` in your terminal, or run:
```bash
docker-compose down
```

### Restart and rebuild everything
If something seems broken, you can always start fresh:
```bash
docker-compose down
docker-compose up --build
```

### View application logs
```bash
docker-compose logs -f
```

## Troubleshooting

**Port already in use?**
- Port 3000 (frontend) or 8000 (backend) might be occupied. Stop other applications using these ports or modify the port numbers in `docker-compose.yml`.

**Database connection issues?**
- Make sure Docker is running properly. Try restarting: `docker-compose restart`

**Changes not appearing?**
- The application may be cached. Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) in your browser to do a hard refresh, or clear your browser cache.

**Lost access to the interface?**
- Verify containers are running: `docker-compose ps`
- Check logs for errors: `docker-compose logs`

## File Locations Reference

```
support-ticket-system/
├── README.md                    (This file)
├── docker-compose.yml           (Application configuration)
├── .env.example                 (Example environment settings)
├── backend/                     (Django application)
│   ├── manage.py               (Django management tool)
│   ├── requirements.txt         (Python dependencies)
│   ├── support_project/         (Project settings)
│   └── tickets/                 (Core ticket application)
└── frontend/                    (React application)
    ├── package.json            (JavaScript dependencies)
    ├── public/                  (Static files)
    └── src/                     (React source code)
```

## Support & Questions

- **Issue not listed?** Check that all containers are running with `docker-compose ps`
- **Need to reset?** You can safely delete and recreate everything—no critical data is stored outside Docker
- **Want to customize?** Edit `backend/.env` to change settings, or modify `docker-compose.yml` to adjust ports and services

## Technology Stack

- **Backend**: Django 4.x with Django REST Framework for APIs
- **Frontend**: React 18 for interactive user interfaces
- **Database**: PostgreSQL for reliable data storage
- **Containerization**: Docker and Docker Compose for easy deployment

---
