// Settings Service for Chrome Extension Storage
export class SettingsService {
  static defaultSettings = {
    trackingEnabled: true,
    autoStart: true,
    idleThreshold: 5,
    notifications: true,
    soundAlerts: false,
    darkMode: false,
    dataRetention: 30,
    excludedSites: [],
    dailyGoal: 8,
    breakReminder: true,
    breakInterval: 60,
    privacyMode: false,
    syncData: true
  };

  // Load settings from Chrome storage
  static async getSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['chronixSettings'], (result) => {
          const settings = result.chronixSettings || this.defaultSettings;
          resolve({ ...this.defaultSettings, ...settings });
        });
      } else {
        // Fallback for development/testing
        const localSettings = localStorage.getItem('chronixSettings');
        if (localSettings) {
          resolve({ ...this.defaultSettings, ...JSON.parse(localSettings) });
        } else {
          resolve(this.defaultSettings);
        }
      }
    });
  }

  // Save settings to Chrome storage
  static async saveSettings(settings) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set({ chronixSettings: settings }, () => {
          resolve(true);
        });
      } else {
        // Fallback for development/testing
        localStorage.setItem('chronixSettings', JSON.stringify(settings));
        resolve(true);
      }
    });
  }

  // Get a specific setting
  static async getSetting(key) {
    const settings = await this.getSettings();
    return settings[key];
  }

  // Update a specific setting
  static async updateSetting(key, value) {
    const settings = await this.getSettings();
    settings[key] = value;
    await this.saveSettings(settings);
    return settings;
  }

  // Reset to default settings
  static async resetToDefaults() {
    await this.saveSettings(this.defaultSettings);
    return this.defaultSettings;
  }

  // Check if a site is excluded
  static async isSiteExcluded(url) {
    const settings = await this.getSettings();
    const domain = new URL(url).hostname;
    return settings.excludedSites.some(site => 
      domain.includes(site) || site.includes(domain)
    );
  }

  // Add excluded site
  static async addExcludedSite(site) {
    const settings = await this.getSettings();
    if (!settings.excludedSites.includes(site)) {
      settings.excludedSites.push(site);
      await this.saveSettings(settings);
    }
    return settings;
  }

  // Remove excluded site
  static async removeExcludedSite(site) {
    const settings = await this.getSettings();
    settings.excludedSites = settings.excludedSites.filter(s => s !== site);
    await this.saveSettings(settings);
    return settings;
  }

  // Check if tracking is enabled and should track current time
  static async shouldTrackTime() {
    const settings = await this.getSettings();
    return settings.trackingEnabled && settings.autoStart;
  }

  // Get notification preferences
  static async getNotificationSettings() {
    const settings = await this.getSettings();
    return {
      enabled: settings.notifications,
      soundAlerts: settings.soundAlerts,
      breakReminder: settings.breakReminder,
      breakInterval: settings.breakInterval
    };
  }

  // Apply dark mode setting
  static async applyTheme() {
    const settings = await this.getSettings();
    if (settings.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    return settings.darkMode;
  }
}

export default SettingsService;
