package com.hur.blocker.blocker

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AppBlockerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "AppBlockerModule"
        private const val PREFS_NAME = "hur_blocker"
        private const val KEY_BLOCKED_PACKAGES = "blocked_packages"
        private const val KEY_BLOCKED_KEYWORDS = "blocked_keywords"
        private const val KEY_BLOCKED_DOMAINS = "blocked_domains"
        private const val KEY_PARTNER_TYPE = "partner_type"
        private const val KEY_PARTNER_EMAIL = "partner_email"
        private const val KEY_PARTNER_TIME_DELAY = "partner_time_delay"

        private var blockedPackages: MutableSet<String> = mutableSetOf()
        private var blockedKeywords: MutableSet<String> = mutableSetOf()
        private var blockedDomains: MutableSet<String> = mutableSetOf()

        fun getBlockedPackages(): Set<String> = blockedPackages
        fun getBlockedKeywords(): Set<String> = blockedKeywords
        fun getBlockedDomains(): Set<String> = blockedDomains

        fun isPackageBlocked(packageName: String): Boolean = blockedPackages.contains(packageName)

        /**
         * Check if a URL or text content should be blocked.
         * Returns the matched keyword/domain or null if not blocked.
         */
        fun checkContentBlocked(text: String): String? {
            val lower = text.lowercase()
            // Check domains
            for (domain in blockedDomains) {
                if (lower.contains(domain)) return domain
            }
            // Check keywords
            for (keyword in blockedKeywords) {
                if (lower.contains(keyword)) return keyword
            }
            return null
        }

        /**
         * Restore all blocklists from SharedPreferences.
         * Called by BootReceiver and AppBlockerService on startup.
         */
        fun restoreFromPrefs(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            blockedPackages = prefs.getStringSet(KEY_BLOCKED_PACKAGES, emptySet())?.toMutableSet() ?: mutableSetOf()
            blockedKeywords = prefs.getStringSet(KEY_BLOCKED_KEYWORDS, emptySet())?.toMutableSet() ?: mutableSetOf()
            blockedDomains = prefs.getStringSet(KEY_BLOCKED_DOMAINS, emptySet())?.toMutableSet() ?: mutableSetOf()
        }

        /**
         * Persist all blocklists to SharedPreferences.
         */
        private fun persistToPrefs(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putStringSet(KEY_BLOCKED_PACKAGES, blockedPackages.toSet())
                .putStringSet(KEY_BLOCKED_KEYWORDS, blockedKeywords.toSet())
                .putStringSet(KEY_BLOCKED_DOMAINS, blockedDomains.toSet())
                .apply()
        }
    }

    override fun getName(): String = NAME

    private fun getPrefs(): SharedPreferences =
        reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    // Check if Usage Stats permission is granted
    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        try {
            val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactApplicationContext.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactApplicationContext.packageName
                )
            }
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Open Usage Stats settings
    @ReactMethod
    fun openUsageStatsSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Check if overlay permission is granted
    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        try {
            val hasPermission = Settings.canDrawOverlays(reactApplicationContext)
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Open overlay permission settings
    @ReactMethod
    fun openOverlaySettings(promise: Promise) {
        try {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${reactApplicationContext.packageName}")
            )
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Check if accessibility service is enabled
    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        try {
            val serviceName = "${reactApplicationContext.packageName}/${AppBlockerService::class.java.canonicalName}"
            val enabledServices = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""

            val isEnabled = enabledServices.contains(serviceName)
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Open accessibility settings
    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Set uninstall protection end date (syncs to SharedPreferences for native access)
    @ReactMethod
    fun setUninstallProtectionEnd(endDateMs: Double, promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putLong("uninstall_protection_end", endDateMs.toLong()).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Set blocked apps list
    @ReactMethod
    fun setBlockedApps(packageNames: ReadableArray, promise: Promise) {
        try {
            blockedPackages.clear()
            for (i in 0 until packageNames.size()) {
                packageNames.getString(i)?.let { blockedPackages.add(it) }
            }
            persistToPrefs(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Get blocked apps list
    @ReactMethod
    fun getBlockedApps(promise: Promise) {
        try {
            val array = Arguments.createArray()
            blockedPackages.forEach { array.pushString(it) }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Add app to blocked list
    @ReactMethod
    fun blockApp(packageName: String, promise: Promise) {
        try {
            blockedPackages.add(packageName)
            persistToPrefs(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Remove app from blocked list
    @ReactMethod
    fun unblockApp(packageName: String, promise: Promise) {
        try {
            blockedPackages.remove(packageName)
            persistToPrefs(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Check if app is blocked
    @ReactMethod
    fun isAppBlocked(packageName: String, promise: Promise) {
        try {
            promise.resolve(blockedPackages.contains(packageName))
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Get list of installed apps
    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)

            val result = Arguments.createArray()

            for (appInfo in packages) {
                // Filter out system apps that can't be launched
                val launchIntent = pm.getLaunchIntentForPackage(appInfo.packageName)
                if (launchIntent != null) {
                    val appMap = Arguments.createMap()
                    appMap.putString("packageName", appInfo.packageName)
                    appMap.putString("name", pm.getApplicationLabel(appInfo).toString())
                    appMap.putBoolean("isSystem", (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0)
                    appMap.putBoolean("isBlocked", blockedPackages.contains(appInfo.packageName))
                    result.pushMap(appMap)
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // --- Blocked Keywords ---

    @ReactMethod
    fun setBlockedKeywords(keywords: ReadableArray, promise: Promise) {
        try {
            blockedKeywords.clear()
            for (i in 0 until keywords.size()) {
                keywords.getString(i)?.let { blockedKeywords.add(it.lowercase()) }
            }
            persistToPrefs(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getBlockedKeywords(promise: Promise) {
        try {
            val array = Arguments.createArray()
            blockedKeywords.forEach { array.pushString(it) }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // --- Blocked Domains ---

    @ReactMethod
    fun setBlockedDomains(domains: ReadableArray, promise: Promise) {
        try {
            blockedDomains.clear()
            for (i in 0 until domains.size()) {
                domains.getString(i)?.let { blockedDomains.add(it.lowercase()) }
            }
            persistToPrefs(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getBlockedDomains(promise: Promise) {
        try {
            val array = Arguments.createArray()
            blockedDomains.forEach { array.pushString(it) }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // --- Partner Config ---

    @ReactMethod
    fun setPartnerConfig(type: String, email: String?, timeDelay: Int, promise: Promise) {
        try {
            getPrefs().edit()
                .putString(KEY_PARTNER_TYPE, type)
                .putString(KEY_PARTNER_EMAIL, email ?: "")
                .putInt(KEY_PARTNER_TIME_DELAY, timeDelay)
                .apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getPartnerConfig(promise: Promise) {
        try {
            val prefs = getPrefs()
            val map = Arguments.createMap()
            map.putString("type", prefs.getString(KEY_PARTNER_TYPE, null))
            map.putString("email", prefs.getString(KEY_PARTNER_EMAIL, null))
            map.putInt("timeDelay", prefs.getInt(KEY_PARTNER_TIME_DELAY, 0))
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // --- Battery Optimization ---

    @ReactMethod
    fun requestIgnoreBatteryOptimization(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
            intent.data = Uri.parse("package:${reactApplicationContext.packageName}")
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // Send event to JS
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    // Add listener (required for EventEmitter)
    @ReactMethod
    fun addListener(eventName: String) {
        // Keep track of listeners
    }

    // Remove listener (required for EventEmitter)
    @ReactMethod
    fun removeListeners(count: Int) {
        // Remove listeners
    }
}
