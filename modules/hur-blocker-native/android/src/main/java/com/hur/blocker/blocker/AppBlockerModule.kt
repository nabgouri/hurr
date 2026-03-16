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
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppBlockerModule : Module() {

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

        fun checkContentBlocked(text: String): String? {
            val lower = text.lowercase()
            for (domain in blockedDomains) {
                if (lower.contains(domain)) return domain
            }
            for (keyword in blockedKeywords) {
                if (lower.contains(keyword)) return keyword
            }
            return null
        }

        fun restoreFromPrefs(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            blockedPackages = prefs.getStringSet(KEY_BLOCKED_PACKAGES, emptySet())?.toMutableSet() ?: mutableSetOf()
            blockedKeywords = prefs.getStringSet(KEY_BLOCKED_KEYWORDS, emptySet())?.toMutableSet() ?: mutableSetOf()
            blockedDomains = prefs.getStringSet(KEY_BLOCKED_DOMAINS, emptySet())?.toMutableSet() ?: mutableSetOf()
        }

        private fun persistToPrefs(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putStringSet(KEY_BLOCKED_PACKAGES, blockedPackages.toSet())
                .putStringSet(KEY_BLOCKED_KEYWORDS, blockedKeywords.toSet())
                .putStringSet(KEY_BLOCKED_DOMAINS, blockedDomains.toSet())
                .apply()
        }
    }

    private val context
        get() = requireNotNull(appContext.reactContext)

    private fun getPrefs(): SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    override fun definition() = ModuleDefinition {
        Name(NAME)

        // --- Permission Checks ---

        AsyncFunction("hasUsageStatsPermission") {
            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    context.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    context.packageName
                )
            }
            return@AsyncFunction mode == AppOpsManager.MODE_ALLOWED
        }

        AsyncFunction("openUsageStatsSettings") {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            return@AsyncFunction true
        }

        AsyncFunction("hasOverlayPermission") {
            return@AsyncFunction Settings.canDrawOverlays(context)
        }

        AsyncFunction("openOverlaySettings") {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${context.packageName}")
            )
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            return@AsyncFunction true
        }

        AsyncFunction("isAccessibilityServiceEnabled") {
            val serviceName = "${context.packageName}/${AppBlockerService::class.java.canonicalName}"
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            return@AsyncFunction enabledServices.contains(serviceName)
        }

        AsyncFunction("openAccessibilitySettings") {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            return@AsyncFunction true
        }

        // --- Uninstall Protection ---

        AsyncFunction("setUninstallProtectionEnd") { endDateMs: Double ->
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putLong("uninstall_protection_end", endDateMs.toLong()).apply()
            return@AsyncFunction true
        }

        // --- App Blocking ---

        AsyncFunction("setBlockedApps") { packageNames: List<String> ->
            blockedPackages.clear()
            blockedPackages.addAll(packageNames)
            persistToPrefs(context)
            return@AsyncFunction true
        }

        AsyncFunction("getBlockedApps") {
            return@AsyncFunction blockedPackages.toList()
        }

        AsyncFunction("blockApp") { packageName: String ->
            blockedPackages.add(packageName)
            persistToPrefs(context)
            return@AsyncFunction true
        }

        AsyncFunction("unblockApp") { packageName: String ->
            blockedPackages.remove(packageName)
            persistToPrefs(context)
            return@AsyncFunction true
        }

        AsyncFunction("isAppBlocked") { packageName: String ->
            return@AsyncFunction blockedPackages.contains(packageName)
        }

        AsyncFunction("getInstalledApps") {
            val pm = context.packageManager
            val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
            return@AsyncFunction packages
                .filter { pm.getLaunchIntentForPackage(it.packageName) != null }
                .map { appInfo ->
                    mapOf(
                        "packageName" to appInfo.packageName,
                        "name" to pm.getApplicationLabel(appInfo).toString(),
                        "isSystem" to ((appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0),
                        "isBlocked" to blockedPackages.contains(appInfo.packageName)
                    )
                }
        }

        // --- Blocked Keywords ---

        AsyncFunction("setBlockedKeywords") { keywords: List<String> ->
            blockedKeywords.clear()
            blockedKeywords.addAll(keywords.map { it.lowercase() })
            persistToPrefs(context)
            return@AsyncFunction true
        }

        AsyncFunction("getBlockedKeywords") {
            return@AsyncFunction blockedKeywords.toList()
        }

        // --- Blocked Domains ---

        AsyncFunction("setBlockedDomains") { domains: List<String> ->
            blockedDomains.clear()
            blockedDomains.addAll(domains.map { it.lowercase() })
            persistToPrefs(context)
            return@AsyncFunction true
        }

        AsyncFunction("getBlockedDomains") {
            return@AsyncFunction blockedDomains.toList()
        }

        // --- Partner Config ---

        AsyncFunction("setPartnerConfig") { type: String, email: String, timeDelay: Int ->
            getPrefs().edit()
                .putString(KEY_PARTNER_TYPE, type)
                .putString(KEY_PARTNER_EMAIL, email)
                .putInt(KEY_PARTNER_TIME_DELAY, timeDelay)
                .apply()
            return@AsyncFunction true
        }

        AsyncFunction("getPartnerConfig") {
            val prefs = getPrefs()
            return@AsyncFunction mapOf(
                "type" to prefs.getString(KEY_PARTNER_TYPE, null),
                "email" to prefs.getString(KEY_PARTNER_EMAIL, null),
                "timeDelay" to prefs.getInt(KEY_PARTNER_TIME_DELAY, 0)
            )
        }

        // --- Battery Optimization ---

        AsyncFunction("requestIgnoreBatteryOptimization") {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
            intent.data = Uri.parse("package:${context.packageName}")
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            return@AsyncFunction true
        }
    }
}
