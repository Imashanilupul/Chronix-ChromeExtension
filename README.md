# 🌐 Chronix – Chrome Extension

**Version**: 2.0.0  
A modern Chrome extension that tracks the time you spend browsing, helping you improve focus and productivity.

---

## 🚀 Features

### ⏱️ **Core Tracking**
- **Real-time tab usage tracking** – Monitor time spent on each website automatically
- **Smart idle detection** – Customizable idle threshold (1-60 minutes) to pause tracking when away
- **Auto-start tracking** – Automatically begin tracking when browser opens
- **Session continuity** – Maintains tracking across browser restarts

### 📊 **Analytics & Visualization**
- **Interactive charts** – Beautiful bar charts powered by Chart.js
- **Weekly & monthly views** – Analyze usage patterns over different time periods
- **Per-website analytics** – Detailed breakdowns for individual domains
- **Usage summaries** – Total time, averages, and trend analysis
- **Visual progress tracking** – See your browsing habits at a glance

### 🔔 **Smart Notifications & Alerts**
- **Break reminders** – Customizable notifications every 1-60 minutes of continuous usage
- **Daily goal tracking** – Set and monitor daily browsing time goals (1-24 hours)
- **Sound alerts** – Optional audio notifications for important events
- **System notifications** – Native Chrome notifications with custom messages

### 🚫 **Privacy & Control**
- **Excluded sites management** – Add websites to exclude from tracking
- **Privacy mode** – Enhanced privacy settings for sensitive browsing
- **Data retention control** – Choose how long to keep data (7 days to forever)
- **Sync settings** – Synchronize preferences across devices via Chrome storage

### ⚙️ **Customization & Settings**
- **Comprehensive settings panel** – Fine-tune every aspect of the extension
- **One-click reset** – Restore all settings to defaults instantly
- **Flexible notifications** – Enable/disable specific notification types
- **User-friendly interface** – Clean, intuitive popup with easy navigation

### 🔌 **Technical Features**
- **Manifest V3 compliance** – Modern Chrome extension architecture
- **Background service worker** – Efficient tracking with minimal resource usage
- **Chrome alarms integration** – Reliable scheduling for break reminders
- **Local & sync storage** – Dual storage system for optimal performance
- **Real-time messaging** – Instant communication between popup and background scripts

---

---

## 🛠️ Technologies & Components

### **Frontend Stack**
- **React 18** – Modern component-based UI with hooks and functional components
- **React Router DOM** – Client-side routing for multi-page navigation within popup
- **Tailwind CSS** – Utility-first CSS framework for responsive, beautiful styling
- **Vite** – Fast build tool and development server for optimal performance

### **Data Visualization**
- **Chart.js** – Powerful charting library for interactive analytics
- **React-Chartjs-2** – React wrapper for Chart.js integration

### **Chrome Extension APIs**
- **Manifest V3** – Latest Chrome extension architecture for security and performance
- **Background Service Worker** – Efficient background processing
- **Chrome Storage API** – Persistent data storage (local & sync)
- **Chrome Tabs API** – Tab monitoring and management
- **Chrome Notifications API** – System-level notifications
- **Chrome Alarms API** – Reliable scheduling for reminders
- **Chrome Runtime Messaging** – Real-time communication between components

### **Development Tools**
- **ESLint** – Code linting and quality assurance
- **PostCSS** – CSS processing and optimization
- **npm** – Package management and build scripts

---

---

## 📦 Folder Structure

```
Chronix-ChromeExtension/
├── chronix/                    # Main extension directory
│   ├── public/                 # Build-ready extension files
│   │   ├── src/               # Source code
│   │   │   ├── pages/         # React page components
│   │   │   │   ├── home.jsx   # Main popup interface
│   │   │   │   ├── Settings.jsx # Comprehensive settings panel
│   │   │   │   ├── Graphs.jsx  # Analytics and charts
│   │   │   │   └── popup.jsx   # Popup entry component
│   │   │   ├── services/      # Utility services
│   │   │   ├── components/    # Reusable React components
│   │   │   ├── App.jsx        # Main React application
│   │   │   └── main.jsx       # React application entry point
│   │   ├── icons/             # Extension icons (16px, 48px, 128px)
│   │   ├── manifest.json      # Chrome extension manifest (v3)
│   │   ├── background.js      # Background service worker
│   │   ├── index.html         # Popup HTML template
│   │   ├── package.json       # Dependencies and build scripts
│   │   ├── vite.config.js     # Vite build configuration
│   │   └── tailwind.config.js # Tailwind CSS configuration
│   └── src/                   # Additional source files
├── README.md                  # Project documentation
├── LICENSE                    # License file
├── PRIVACY.MD                 # Privacy policy
└── TESTING_CHECKLIST.md       # Testing guidelines
```

---

## 🧪 Development Setup

### **Prerequisites**
- Node.js (v16 or higher)
- npm (v8 or higher)
- Google Chrome browser

### **Installation & Setup**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Imashanilupul/Chronix-ChromeExtension.git
   cd Chronix-ChromeExtension
   ```

2. **Navigate to the main extension directory**:
   ```bash
   cd chronix/public
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Build the extension**:
   ```bash
   npm run build
   ```

5. **Load extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" and select the `dist` folder
   - The Chronix extension should now appear in your extensions list

### **Development Commands**

- **Build for production**: `npm run build`
- **Development server**: `npm run dev` (for popup development)
- **Lint code**: `npm run lint`

### **Testing the Extension**

1. Click the Chronix icon in Chrome toolbar to open popup
2. Visit different websites to see tracking in action
3. Check the Settings page for configuration options
4. View Analytics page for usage charts and insights
5. Test break reminders and notifications

### **Project Structure Notes**

- Main popup interface is built with React and Vite
- Background service worker handles tab monitoring and data storage
- All settings are synced via Chrome storage API
- Charts are rendered using Chart.js for analytics visualization

---

## 🚀 Quick Start Guide

### **First Time Setup**
1. Install the extension following the development setup instructions
2. Click the Chronix icon in your Chrome toolbar
3. The extension will automatically start tracking your browsing time
4. Visit the Settings page to customize tracking preferences
5. Check the Analytics page to view your usage patterns

### **Key Features to Try**
- Set a daily browsing goal in Settings
- Enable break reminders to maintain healthy browsing habits
- Add frequently visited sites to the excluded list if needed
- Explore weekly and monthly analytics charts
- Customize notification preferences

---

## 🔧 Configuration Options

### **Tracking Settings**
- **Enable time tracking**: Turn tracking on/off globally
- **Auto-start tracking**: Automatically begin tracking on browser startup
- **Idle threshold**: Set inactivity time (1-60 minutes) before pausing tracking
- **Daily goal**: Set target browsing time (1-24 hours)

### **Notification Settings**
- **Enable notifications**: Toggle system notifications
- **Sound alerts**: Enable audio notifications
- **Break reminders**: Get notified to take breaks during extended sessions
- **Break interval**: Customize reminder frequency (1-60 minutes)

### **Privacy & Data**
- **Privacy mode**: Enhanced privacy for sensitive browsing
- **Data retention**: Choose how long to keep tracking data
- **Sync data**: Synchronize settings across Chrome instances
- **Excluded sites**: Manage websites to exclude from tracking

---

## 📊 Understanding Your Data

### **Analytics Dashboard**
- **Weekly View**: See daily usage for the past 7 days
- **Monthly View**: View weekly summaries for the past 4 weeks
- **Per-site Analysis**: Detailed breakdown by individual websites
- **Usage Trends**: Identify patterns in your browsing behavior

### **Data Storage**
- All data is stored locally on your device
- Settings can optionally sync across Chrome instances
- No data is sent to external servers
- Complete control over data retention periods

---
