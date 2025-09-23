# Chronix Extension Testing Checklist

## ✅ Basic Functionality Tests

### Time Tracking
- [ ] Timer counts when on website
- [ ] Time saves when switching tabs
- [ ] Website list updates with usage data
- [ ] Active site is highlighted
- [ ] Tracking can be manually started/stopped

### Settings Persistence
- [ ] Enable time tracking toggle works
- [ ] Auto-start tracking toggle works
- [ ] Idle threshold setting saves and works
- [ ] Daily goal setting saves
- [ ] Notifications toggle works
- [ ] Sound alerts toggle works
- [ ] Break reminders toggle works
- [ ] Break interval setting works
- [ ] Privacy mode toggle works
- [ ] Sync data toggle works
- [ ] Data retention setting works

### Excluded Sites
- [ ] Can add sites to exclusion list
- [ ] Excluded sites don't get tracked
- [ ] Can remove sites from exclusion list
- [ ] Previously excluded sites resume tracking when removed

### Notifications
- [ ] Daily goal notifications appear when enabled
- [ ] Break reminder notifications work
- [ ] Sound alerts respect the setting
- [ ] Notifications can be disabled

### Data Management
- [ ] Data persists after browser restart
- [ ] Settings sync across browser instances
- [ ] Reset to defaults works
- [ ] Data is properly stored in Chrome storage

### Idle Detection
- [ ] Tracking pauses during idle time
- [ ] Tracking resumes after idle period
- [ ] Idle threshold setting is respected

## 🔧 Advanced Tests

### Chrome Storage
- [ ] Check storage data with DevTools
- [ ] Verify settings in sync storage
- [ ] Confirm website data in local storage

### Error Handling
- [ ] Extension works without internet
- [ ] Handles invalid URLs gracefully
- [ ] Settings gracefully handle invalid input

### Performance
- [ ] Extension doesn't slow down browsing
- [ ] Memory usage stays reasonable
- [ ] CPU usage is minimal

## 🚨 Known Issues to Test For
- [ ] Dark mode functionality completely removed
- [ ] No console errors in background script
- [ ] No console errors in popup
- [ ] All buttons and toggles respond correctly
- [ ] Layout fits properly in extension popup window

## DevTools Console Commands for Testing

```javascript
// Check tracking status
chrome.runtime.sendMessage({action: "getTrackingStatus"}, console.log);

// Check settings
chrome.runtime.sendMessage({action: "getSettings"}, console.log);

// View all local storage
chrome.storage.local.get(null, console.log);

// View settings storage
chrome.storage.sync.get(['chronixSettings'], console.log);

// Start tracking manually
chrome.runtime.sendMessage({action: "startTracking"});

// Stop tracking manually
chrome.runtime.sendMessage({action: "stopTracking"});
```