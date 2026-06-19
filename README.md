# 🏥 MediRemind (Health Guardian)

**MediRemind** is a modern, type-safe medical management and emergency SOS platform designed to connect patients and healthcare providers seamlessly. Built with performance and user experience in mind, it provides live routing to nearby hospitals, real-time emergency contact notification, and automated diagnostic reports management.

---

## 🚀 Features

### 👤 Patient Dashboard

- **Upcoming & Past Appointments**: Tracks medical visits, lab tests, and cardiology check-ups.
- **Emergency SOS Card**: One-tap activation to share coordinates with pre-configured emergency contacts.
- **Profile Management**: Syncs name, address, blood group, and emergency contact details with Supabase.

### 🚨 Geolocation & Emergency SOS

- **Real-Time Geolocation**: Requests user coordinates dynamically with loading and denial fallback UI flows.
- **Twilio SMS Alerting**: Sends an instant alert to the patient's emergency contact with their exact location.
- **Hospital Place Finder**: Queries the Google Places API to list the 8 nearest hospitals sorted by distance, with direct call buttons and routing maps.

### 🏥 Hospital Portal

- **Patient Directory**: Displays history and statuses (Normal, Needs Follow-up, Critical).
- **Emergency Control Desk**: Visualizes active critical alarms, logs actions, and shows directions from the patient to the hospital.
- **Interactive Routing**: Embedded Google Maps routing from the patient's location to the center.

---

## 🛠️ Technology Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React + TanStack Router + Vite SSR)
- **Styling**: Tailwind CSS v4 (calm medical theme)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Data Fetching**: TanStack React Query v5
- **APIs**: Twilio SMS Gateway, Google Places & Maps API
- **Package Manager**: [Bun](https://bun.sh/) (or `npm`)

---

## 📦 Getting Started

### 1. Prerequisites

Ensure you have Node.js and npm/Bun installed on your system.

### 2. Install Dependencies

Navigate into the project directory and install:

```bash
cd dev-server
bun install
# or
npm install
```

### 3. Environment Configuration

Create a `.env` file at the root of `dev-server/` and fill in the credentials:

```env
# Google Maps Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Twilio SMS API Configuration
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_purchased_number

# Supabase Credentials (optional, pre-configured in integrations)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Running the Development Server

Run the local dev server:

```bash
bun run dev
# or
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

### 5. Build for Production

To bundle the application:

```bash
bun run build
# or
npm run build
```

---

## 📂 Project Structure

```
dev-server/
├── src/
│   ├── components/       # Reusable components & shadcn UI primitives
│   ├── hooks/            # Screen detection and custom hooks
│   ├── integrations/     # Supabase client instantiation
│   ├── lib/              # Client/Server action logic, SMS handlers, mock seeds
│   └── routes/           # File-based routing pages
├── supabase/             # DB schema migrations and config
└── vite.config.ts        # Vite plugins and compiler rules
```
