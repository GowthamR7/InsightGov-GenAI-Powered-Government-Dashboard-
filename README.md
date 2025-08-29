# InsightGov: GenAI-Powered Government Dashboard 🚀

InsightGov is a modern, full-stack web application designed to showcase the power of Generative AI in public administration. It provides an intelligent dashboard for managing public scheme applications, leveraging the Google Gemini API to offer advanced features that go beyond traditional data management.



## ✨ Key Features

* **Intelligent Search:** Ask the dashboard questions in plain English (e.g., "show me loan schemes in south tamilnadu") and get precisely filtered results.
* **AI-Powered Anomaly Detection:** Automatically scan applications to flag potential duplicates, entries with vague details, or logical outliers (e.g., an applicant from a landlocked state applying for a fishing subsidy).
* **Automated Application Triage:** Every new submission is automatically analyzed for its **sentiment** (Positive, Neutral, Negative) and **urgency** (Low, Medium, High), allowing officials to prioritize critical cases.
* **Dynamic Report Generation:** Generate human-readable summary reports for any date range with a single click, complete with key trends and insights.
* **Modern Data Visualizations:** A clean, responsive dashboard with KPI cards and charts built with Tremor to visualize application data by district and scheme popularity.
* **Full-Stack Architecture:** Built with a modern, decoupled stack featuring a React frontend and an ASP.NET Core Web API backend.

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Tremor
* **Backend:** ASP.NET Core Web API (.NET 8)
* **Database:** MongoDB
* **Generative AI:** Google Gemini API

## ⚙️ Project Architecture

The application uses a decoupled architecture:
1.  The **React** frontend serves as the user interface for both the public and administrative users.
2.  It communicates with the backend via REST API calls.
3.  The **ASP.NET Core Web API** handles all business logic, database interactions, and integrations with the Gemini API.
4.  **MongoDB** is used as a flexible, NoSQL database to store application data.
5.  The **Google Gemini API** is integrated directly into the backend via the official Google AI C# SDK to power all intelligent features.

## 📦 Getting Started & How to Run

Follow these instructions to get the project running on your local machine.

### Prerequisites

* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js and npm](https://nodejs.org/en/)
* A running [MongoDB](https://www.mongodb.com/try/download/community) instance (either local or a free Atlas cluster).

### 🔌 Configuration

Before running the project, you need to configure your database connection string and your Gemini API key.

1.  Navigate to the backend project folder (`GovDashboard.Api`).
2.  Create a file named `appsettings.Development.json` if it doesn't exist.
3.  Add the following configuration. Replace the placeholder values with your actual credentials.

    ```json
    {
      "Logging": {
        "LogLevel": {
          "Default": "Information",
          "Microsoft.AspNetCore": "Warning"
        }
      },
      "MongoDBSettings": {
        "ConnectionString": "mongodb://localhost:27017",
        "DatabaseName": "GovDashboardDB"
      },
      "Gemini": {
        "ApiKey": "YOUR_GOOGLE_GEMINI_API_KEY"
      }
    }
    ```
    > **Note:** For better security, it's recommended to use .NET User Secrets for the `ApiKey`.

### ▶️ Running the Application

You'll need to run two processes in two separate terminals.

**Terminal 1: Run the Backend (ASP.NET Core API)**

```bash
# Navigate to the backend directory
cd GovDashboard.Api

# Restore dependencies
dotnet restore

# Run the application
dotnet run
```

**Terminal 2: Run the Frontend (React Vite)**

# Navigate to the frontend directory
```bash
# Navigate to the frontend directory
cd gov-dashvoard-ui

# Install dependencies
npm install

# Run the development server
npm run dev
```