package com.hur.blocker.blocker

import android.accessibilityservice.AccessibilityService
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.hur.blocker.admin.HurDeviceAdminReceiver

class AppBlockerService : AccessibilityService() {

    companion object {
        private const val TAG = "HurBlocker"
    }

    private var currentBlockedPackage: String? = null
    private var currentBlockReason: String? = null

    // Debounce state
    private var lastCheckedUrl: String? = null
    private var lastCheckTime: Long = 0
    private val CHECK_INTERVAL_MS = 500L

    // Track current foreground package
    private var currentForegroundPackage: String? = null

    // Browser URL bar resource IDs for major browsers
    private val browserUrlBarIds = mapOf(
        "com.android.chrome" to "com.android.chrome:id/url_bar",
        "com.chrome.beta" to "com.chrome.beta:id/url_bar",
        "com.chrome.dev" to "com.chrome.dev:id/url_bar",
        "com.chrome.canary" to "com.chrome.canary:id/url_bar",
        "org.mozilla.firefox" to "org.mozilla.firefox:id/mozac_browser_toolbar_url_view",
        "org.mozilla.firefox_beta" to "org.mozilla.firefox_beta:id/mozac_browser_toolbar_url_view",
        "org.mozilla.fenix" to "org.mozilla.fenix:id/mozac_browser_toolbar_url_view",
        "com.brave.browser" to "com.brave.browser:id/url_bar",
        "com.opera.browser" to "com.opera.browser:id/url_field",
        "com.opera.mini.native" to "com.opera.mini.native:id/url_field",
        "com.microsoft.emmx" to "com.microsoft.emmx:id/url_bar",
        "com.duckduckgo.mobile.android" to "com.duckduckgo.mobile.android:id/omnibarTextInput",
        "com.sec.android.app.sbrowser" to "com.sec.android.app.sbrowser:id/location_bar_edit_text",
        "com.UCMobile.intl" to "com.UCMobile.intl:id/tv_title",
        "com.vivaldi.browser" to "com.vivaldi.browser:id/url_bar",
        "com.kiwibrowser.browser" to "com.kiwibrowser.browser:id/url_bar",
    )

    // Packages to always skip
    private val skipPackages = setOf(
        "com.android.systemui",
        "com.android.launcher",
        "com.android.launcher3",
        "com.google.android.apps.nexuslauncher",
        "com.sec.android.app.launcher",
        "com.miui.home",
        "com.huawei.android.launcher",
        "com.oppo.launcher",
    )

    override fun onServiceConnected() {
        super.onServiceConnected()
        AppBlockerModule.restoreFromPrefs(applicationContext)
        Log.d(TAG, "Service connected — packages=${AppBlockerModule.getBlockedPackages().size}, " +
            "keywords=${AppBlockerModule.getBlockedKeywords().size}, " +
            "domains=${AppBlockerModule.getBlockedDomains().size}")

        // Navigate user back to the app after enabling accessibility
        try {
            val launchIntent = packageManager.getLaunchIntentForPackage(applicationContext.packageName)
            if (launchIntent != null) {
                launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                startActivity(launchIntent)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to navigate back to app", e)
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return
        val packageName = event.packageName?.toString() ?: return

        // Always check for uninstall attempts (even in settings/our own package context)
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED ||
            event.eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) {
            if (checkForUninstallAttempt(event, packageName)) return
        }

        if (packageName == applicationContext.packageName || shouldSkipPackage(packageName)) {
            return
        }

        val eventType = when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> "WINDOW_STATE"
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> "CONTENT_CHANGED"
            AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED -> "TEXT_CHANGED"
            else -> "OTHER(${event.eventType})"
        }
        Log.d(TAG, "Event: $eventType from $packageName")

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> handleWindowStateChanged(packageName)
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED,
            AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED -> handleContentChanged(event, packageName)
        }
    }

    /**
     * Detects if the user is trying to:
     * 1. View our app's info page (to uninstall)
     * 2. Open Device Admin settings (to deactivate our admin)
     * 3. Interact with the deactivation confirmation dialog
     * If device admin is active and protection hasn't expired, show the blocker.
     */
    private fun checkForUninstallAttempt(event: AccessibilityEvent, packageName: String): Boolean {
        // Only care about settings-related packages
        if (!packageName.contains("settings") && !packageName.contains("packageinstaller")) {
            return false
        }

        // Check if device admin is active
        val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager ?: return false
        val componentName = ComponentName(applicationContext, HurDeviceAdminReceiver::class.java)
        if (!dpm.isAdminActive(componentName)) return false

        // Check if protection period is still active
        val prefs = getSharedPreferences("hur_blocker", Context.MODE_PRIVATE)
        val endDate = prefs.getLong("uninstall_protection_end", 0L)
        if (endDate > 0 && System.currentTimeMillis() > endDate) return false

        val rootNode = try { rootInActiveWindow } catch (e: Exception) { null } ?: return false
        try {
            val appName = applicationContext.packageName
            val className = event.className?.toString() ?: ""

            // --- Detection 1: App Info / Uninstall screens ---
            if (className.contains("AppInfoDashboard") ||
                className.contains("InstalledAppDetails") ||
                className.contains("UninstallUninstalling") ||
                className.contains("UninstallerActivity")) {

                if (containsText(rootNode, "\u062D\u064F\u0631") || containsText(rootNode, appName)) {
                    Log.d(TAG, "Uninstall attempt detected via app info \u2014 showing blocker")
                    showBlockerOverlay(appName, "uninstall")
                    return true
                }
            }

            // --- Detection 2: Device Admin deactivation page only ---
            // DeviceAdminAdd = the specific deactivation/activation page for ONE app
            // We skip DeviceAdminSettings (the general list) so the user can browse freely
            if (className.contains("DeviceAdminAdd") ||
                className.contains("DeviceAdminConfirm") ||
                className.contains("DevicePolicyManagerConfirm")) {

                if (containsText(rootNode, "\u062D\u064F\u0631") || containsText(rootNode, appName)) {
                    Log.d(TAG, "Device admin deactivation attempt \u2014 showing blocker")
                    showBlockerOverlay(appName, "uninstall")
                    return true
                }
            }

            // --- Detection 3: Content-based fallback ---
            // Some manufacturers use generic settings classes, so also check
            // if we're in settings and the screen contains both our app name
            // and deactivation-related keywords
            if (packageName.contains("settings") &&
                event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {

                val hasAppName = containsText(rootNode, "\u062D\u064F\u0631")
                if (hasAppName) {
                    // Check for deactivation / uninstall related text
                    val hasDeactivateText = containsText(rootNode, "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062A\u0641\u0639\u064A\u0644") ||
                        containsText(rootNode, "Deactivate") ||
                        containsText(rootNode, "\u0625\u0644\u063A\u0627\u0621 \u062A\u0646\u0634\u064A\u0637") ||
                        containsText(rootNode, "\u0625\u0632\u0627\u0644\u0629") ||
                        containsText(rootNode, "Uninstall") ||
                        containsText(rootNode, "Remove") ||
                        containsText(rootNode, "device admin")

                    if (hasDeactivateText) {
                        Log.d(TAG, "Deactivation/uninstall keywords detected \u2014 showing blocker")
                        showBlockerOverlay(appName, "uninstall")
                        return true
                    }
                }
            }
        } finally {
            rootNode.recycle()
        }
        return false
    }

    /**
     * Recursively checks if any node in the tree contains the given text.
     */
    private fun containsText(node: AccessibilityNodeInfo, text: String): Boolean {
        val nodeText = node.text?.toString() ?: ""
        if (nodeText.contains(text, ignoreCase = true)) return true

        for (i in 0 until node.childCount) {
            val child = try { node.getChild(i) } catch (e: Exception) { null } ?: continue
            try {
                if (containsText(child, text)) return true
            } finally {
                child.recycle()
            }
        }
        return false
    }

    /**
     * Handles app switch events. Checks if the new foreground app is blocked.
     * Also hides overlay if user navigated to a safe app.
     */
    private fun handleWindowStateChanged(packageName: String) {
        currentForegroundPackage = packageName

        if (AppBlockerModule.isPackageBlocked(packageName)) {
            showBlockerOverlay(packageName, "app")
        } else {
            hideBlockerOverlay()
        }
    }

    /**
     * Handles content/text changes inside apps.
     * Scans browser URL bars for blocked domains/keywords.
     */
    private fun handleContentChanged(event: AccessibilityEvent, packageName: String) {
        if (!isBrowser(packageName)) {
            Log.d(TAG, "Not a browser: $packageName")
            return
        }

        Log.d(TAG, "Scanning browser: $packageName")

        val rootNode = try {
            rootInActiveWindow
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get rootInActiveWindow", e)
            null
        } ?: return

        try {
            val url = extractUrlFromBrowser(rootNode, packageName)
            Log.d(TAG, "Extracted URL: $url (domains=${AppBlockerModule.getBlockedDomains().size}, keywords=${AppBlockerModule.getBlockedKeywords().size})")
            if (url != null && shouldCheck(url)) {
                val blockedMatch = AppBlockerModule.checkContentBlocked(url)
                Log.d(TAG, "Block check result: $blockedMatch")
                if (blockedMatch != null) {
                    Log.d(TAG, "BLOCKING! Trigger: $blockedMatch")
                    showBlockerOverlay(packageName, "content", blockedMatch)
                } else if (currentBlockedPackage != null && currentBlockReason != "app") {
                    hideBlockerOverlay()
                }
            }
        } finally {
            rootNode.recycle()
        }
    }

    /**
     * Checks if a package is a known browser.
     */
    private fun isBrowser(packageName: String): Boolean {
        return browserUrlBarIds.containsKey(packageName) ||
            packageName.contains("browser") ||
            packageName.contains("chrome") ||
            packageName.contains("firefox")
    }

    /**
     * Checks if a package should be skipped entirely.
     */
    private fun shouldSkipPackage(packageName: String): Boolean {
        return skipPackages.contains(packageName) || packageName.contains("launcher")
    }

    /**
     * Debounce check — avoid processing the same URL within CHECK_INTERVAL_MS.
     */
    private fun shouldCheck(url: String): Boolean {
        val now = System.currentTimeMillis()
        if (url == lastCheckedUrl && (now - lastCheckTime) < CHECK_INTERVAL_MS) {
            return false
        }
        lastCheckedUrl = url
        lastCheckTime = now
        return true
    }

    /**
     * Extract URL from a browser's URL bar.
     * First tries known resource IDs, then falls back to scanning EditText nodes.
     */
    private fun extractUrlFromBrowser(rootNode: AccessibilityNodeInfo, packageName: String): String? {
        // Strategy 1: Look for known URL bar by resource ID
        val knownId = browserUrlBarIds[packageName]
        if (knownId != null) {
            val urlNodes = rootNode.findAccessibilityNodeInfosByViewId(knownId)
            if (urlNodes != null && urlNodes.isNotEmpty()) {
                val urlText = urlNodes[0].text?.toString()
                urlNodes.forEach { it.recycle() }
                if (!urlText.isNullOrBlank()) return urlText
            }
        }

        // Strategy 2: Fallback — recursively scan for EditText-like nodes containing URL patterns
        return findUrlInNodeTree(rootNode)
    }

    /**
     * Recursively search the accessibility node tree for URL-like text in EditText nodes.
     */
    private fun findUrlInNodeTree(node: AccessibilityNodeInfo): String? {
        // Check if this node looks like a URL bar
        val text = node.text?.toString()
        if (text != null && looksLikeUrl(text)) {
            val className = node.className?.toString() ?: ""
            if (className.contains("EditText") || className.contains("TextView")) {
                return text
            }
        }

        // Recurse into children
        for (i in 0 until node.childCount) {
            val child = try { node.getChild(i) } catch (e: Exception) { null } ?: continue
            try {
                val result = findUrlInNodeTree(child)
                if (result != null) return result
            } finally {
                child.recycle()
            }
        }
        return null
    }

    /**
     * Simple heuristic: does this text look like a URL?
     */
    private fun looksLikeUrl(text: String): Boolean {
        val trimmed = text.trim()
        return trimmed.contains(".") &&
            !trimmed.contains(" ") &&
            (trimmed.startsWith("http") ||
             trimmed.contains(".com") ||
             trimmed.contains(".org") ||
             trimmed.contains(".net") ||
             trimmed.contains(".io") ||
             trimmed.contains(".xxx") ||
             trimmed.contains(".adult") ||
             trimmed.contains("www."))
    }

    // --- Blocking via Activity (no overlay permission needed) ---

    private var lastBlockTime: Long = 0
    private val BLOCK_COOLDOWN_MS = 2000L // Prevent rapid re-launching

    /**
     * Launches BlockerActivity on top of the blocked content.
     * When user taps close, they're redirected to google.com.
     */
    private fun showBlockerOverlay(packageName: String, reason: String, matchedTrigger: String? = null) {
        // Prevent rapid re-launching of blocker activity
        val now = System.currentTimeMillis()
        if (now - lastBlockTime < BLOCK_COOLDOWN_MS) return
        lastBlockTime = now

        currentBlockedPackage = packageName
        currentBlockReason = reason

        // For uninstall attempts: press Home first to dismiss Settings' task stack,
        // so the user can't press back to return to the deactivation page
        if (reason == "uninstall") {
            performGlobalAction(GLOBAL_ACTION_HOME)
        }

        try {
            val intent = Intent(this, BlockerActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra(BlockerActivity.EXTRA_REASON, reason)
                putExtra(BlockerActivity.EXTRA_TRIGGER, matchedTrigger)
                putExtra(BlockerActivity.EXTRA_BROWSER_PACKAGE, packageName)
            }
            startActivity(intent)
            Log.d(TAG, "Launched BlockerActivity \u2014 reason=$reason, trigger=$matchedTrigger")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch BlockerActivity", e)
        }
    }

    private fun hideBlockerOverlay() {
        currentBlockedPackage = null
        currentBlockReason = null
    }

    override fun onInterrupt() {
        // Nothing to clean up — activity manages itself
    }

    override fun onDestroy() {
        super.onDestroy()
        hideBlockerOverlay()
    }
}
