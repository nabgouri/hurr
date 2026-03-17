package com.hur.blocker.blocker

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.view.View
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.hur.blocker.nativemodule.R

class BlockerActivity : Activity() {

    companion object {
        const val EXTRA_REASON = "reason"
        const val EXTRA_TRIGGER = "trigger"
        const val EXTRA_BROWSER_PACKAGE = "browser_package"
    }

    private var isDetailExpanded = false
    private var countdownTimer: CountDownTimer? = null
    private var isCountdownFinished = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setupImmersiveMode()

        val prefs = getSharedPreferences("hur_blocker", Context.MODE_PRIVATE)
        val countdownSeconds = prefs.getInt("blocked_screen_countdown", 3)
        val customMessage = prefs.getString("blocked_screen_message", null)

        val reason = intent.getStringExtra(EXTRA_REASON) ?: "app"
        val trigger = intent.getStringExtra(EXTRA_TRIGGER)
        val browserPackage = intent.getStringExtra(EXTRA_BROWSER_PACKAGE)

        when (reason) {
            "content" -> {
                setContentView(R.layout.content_blocker_overlay)
                setupContentBlockerDetails(trigger, browserPackage)
                if (!customMessage.isNullOrBlank()) {
                    findViewById<TextView>(R.id.tvContentTitle)?.text = customMessage
                }
                val btn = findViewById<Button>(R.id.btnContentGoBack)
                val isBrowser = browserPackage != null && isBrowserPackage(browserPackage)
                setupCloseButtonCountdown(btn, countdownSeconds) {
                    if (isBrowser) navigateToSafePage() else navigateBackInApp()
                }
                setupWhyBlockedToggle()
            }
            "unsupported_browser" -> {
                setContentView(R.layout.blocker_overlay)
                setupAppBlockerDetails(browserPackage)
                if (!customMessage.isNullOrBlank()) {
                    findViewById<TextView>(R.id.tvTitle)?.text = customMessage
                }
                val btn = findViewById<Button>(R.id.btnGoBack)
                setupCloseButtonCountdown(btn, countdownSeconds) { navigateHome() }
                setupWhyBlockedToggle()
            }
            "uninstall" -> {
                setContentView(R.layout.uninstall_blocker_overlay)
                setupUninstallDetails()
                val btn = findViewById<Button>(R.id.btnUninstallClose)
                setupCloseButtonCountdown(btn, countdownSeconds) { navigateHome() }
            }
            else -> {
                setContentView(R.layout.blocker_overlay)
                setupAppBlockerDetails(trigger)
                if (!customMessage.isNullOrBlank()) {
                    findViewById<TextView>(R.id.tvTitle)?.text = customMessage
                }
                val btn = findViewById<Button>(R.id.btnGoBack)
                setupCloseButtonCountdown(btn, countdownSeconds) { navigateHome() }
                setupWhyBlockedToggle()
            }
        }

        // Entrance animation
        animateEntrance()
    }

    private fun setupCloseButtonCountdown(button: Button?, countdownSeconds: Int, onClose: () -> Unit) {
        button ?: return
        val closeText = button.text.toString()

        // Disable and show countdown
        button.isEnabled = false
        button.alpha = 0.5f
        button.text = "$closeText ($countdownSeconds)"

        countdownTimer = object : CountDownTimer(countdownSeconds * 1000L, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val secondsLeft = (millisUntilFinished / 1000).toInt() + 1
                button.text = "$closeText ($secondsLeft)"
            }

            override fun onFinish() {
                button.text = closeText
                button.isEnabled = true
                button.alpha = 1f
                isCountdownFinished = true
            }
        }.start()

        button.setOnClickListener { onClose() }
    }

    private fun setupContentBlockerDetails(trigger: String?, browserPackage: String?) {
        // Set the trigger keyword
        val tvTrigger = findViewById<TextView>(R.id.tvTriggerKeyword)
        if (trigger != null) {
            tvTrigger?.text = getString(R.string.blocked_keyword, trigger)
        } else {
            tvTrigger?.visibility = View.GONE
        }

        // Set browser info
        if (browserPackage != null) {
            val browserRow = findViewById<LinearLayout>(R.id.browserInfoRow)
            val tvBrowserName = findViewById<TextView>(R.id.tvBrowserName)
            val ivBrowserIcon = findViewById<ImageView>(R.id.ivBrowserIcon)

            try {
                val pm = packageManager
                val appInfo = pm.getApplicationInfo(browserPackage, 0)
                val appName = pm.getApplicationLabel(appInfo).toString()
                val appIcon = pm.getApplicationIcon(appInfo)

                tvBrowserName?.text = getString(R.string.blocked_via_browser, appName)
                ivBrowserIcon?.setImageDrawable(appIcon)
                browserRow?.visibility = View.VISIBLE
            } catch (e: PackageManager.NameNotFoundException) {
                browserRow?.visibility = View.GONE
            }
        }
    }

    private fun setupAppBlockerDetails(trigger: String?) {
        val tvTrigger = findViewById<TextView>(R.id.tvTriggerKeyword)
        if (trigger != null) {
            // Try to get app label from package name
            try {
                val pm = packageManager
                val appInfo = pm.getApplicationInfo(trigger, 0)
                val appName = pm.getApplicationLabel(appInfo).toString()
                tvTrigger?.text = getString(R.string.blocked_app_name, appName)
            } catch (e: PackageManager.NameNotFoundException) {
                tvTrigger?.text = getString(R.string.blocked_app_name, trigger)
            }
        } else {
            tvTrigger?.visibility = View.GONE
        }
    }

    private fun setupUninstallDetails() {
        val tvDays = findViewById<TextView>(R.id.tvDaysRemaining)
        val prefs = getSharedPreferences("hur_blocker", Context.MODE_PRIVATE)
        val endDate = prefs.getLong("uninstall_protection_end", 0L)

        if (endDate > 0) {
            val remaining = Math.max(0, ((endDate - System.currentTimeMillis()) / (1000 * 60 * 60 * 24)).toInt())
            if (remaining > 0) {
                tvDays?.text = getString(R.string.uninstall_days_remaining, remaining)
            } else {
                tvDays?.visibility = View.GONE
            }
        } else {
            tvDays?.visibility = View.GONE
        }
    }

    /**
     * For social media blocks: press BACK via accessibility service to leave
     * the search results page in the app underneath, then finish the overlay.
     */
    private fun navigateBackInApp() {
        AppBlockerService.instance?.let { service ->
            service.performGlobalAction(android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_BACK)
        }
        // Delay finish so the BACK action hits the social media app underneath, not our overlay
        window.decorView.postDelayed({ finish() }, 400)
    }

    private fun isBrowserPackage(packageName: String): Boolean {
        return packageName.contains("browser") ||
            packageName.contains("chrome") ||
            packageName.contains("firefox") ||
            packageName.contains("opera") ||
            packageName.contains("duckduckgo") ||
            packageName.contains("vivaldi") ||
            packageName.contains("sbrowser") ||
            packageName.contains("UCMobile") ||
            packageName.contains("emmx") ||
            packageName.contains("kiwi")
    }

    private fun navigateHome() {
        finish()
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(homeIntent)
    }

    private fun setupWhyBlockedToggle() {
        val btnToggle = findViewById<View>(R.id.btnWhyBlocked) ?: return
        val detailCard = findViewById<LinearLayout>(R.id.detailCard) ?: return
        val chevron = findViewById<ImageView>(R.id.ivChevron)

        btnToggle.setOnClickListener {
            isDetailExpanded = !isDetailExpanded

            if (isDetailExpanded) {
                expandCard(detailCard)
                chevron?.animate()?.rotation(180f)?.setDuration(300)?.start()
            } else {
                collapseCard(detailCard)
                chevron?.animate()?.rotation(0f)?.setDuration(300)?.start()
            }
        }
    }

    private fun expandCard(card: LinearLayout) {
        card.visibility = View.VISIBLE
        card.alpha = 0f
        card.measure(
            View.MeasureSpec.makeMeasureSpec(card.width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
        )
        val targetHeight = card.measuredHeight

        card.layoutParams.height = 0
        card.requestLayout()

        val heightAnim = ValueAnimator.ofInt(0, targetHeight).apply {
            duration = 300
            interpolator = DecelerateInterpolator(1.5f)
            addUpdateListener { animator ->
                card.layoutParams.height = animator.animatedValue as Int
                card.requestLayout()
            }
        }

        val fadeAnim = ObjectAnimator.ofFloat(card, "alpha", 0f, 1f).apply {
            duration = 250
            startDelay = 100
        }

        AnimatorSet().apply {
            playTogether(heightAnim, fadeAnim)
            start()
        }
    }

    private fun collapseCard(card: LinearLayout) {
        val initialHeight = card.measuredHeight

        val heightAnim = ValueAnimator.ofInt(initialHeight, 0).apply {
            duration = 250
            interpolator = DecelerateInterpolator(1.5f)
            addUpdateListener { animator ->
                card.layoutParams.height = animator.animatedValue as Int
                card.requestLayout()
            }
        }

        val fadeAnim = ObjectAnimator.ofFloat(card, "alpha", 1f, 0f).apply {
            duration = 150
        }

        AnimatorSet().apply {
            playTogether(heightAnim, fadeAnim)
            start()
        }
    }

    private fun setupImmersiveMode() {
        window.apply {
            statusBarColor = Color.parseColor("#060D18")
            navigationBarColor = Color.parseColor("#060D18")

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                setDecorFitsSystemWindows(true)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                decorView.systemUiVisibility =
                    decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
            }
        }
    }

    private fun animateEntrance() {
        val content = findViewById<View>(R.id.contentContainer) ?: return
        val branding = findViewById<View>(R.id.bottomBranding)

        val contentFade = ObjectAnimator.ofFloat(content, "alpha", 0f, 1f).apply {
            duration = 600
            interpolator = DecelerateInterpolator(1.5f)
        }
        val contentSlide = ObjectAnimator.ofFloat(content, "translationY", 40f, 0f).apply {
            duration = 700
            interpolator = DecelerateInterpolator(2f)
        }

        val brandingFade = branding?.let {
            ObjectAnimator.ofFloat(it, "alpha", 0f, 1f).apply {
                duration = 500
                startDelay = 400
                interpolator = DecelerateInterpolator()
            }
        }

        AnimatorSet().apply {
            val animators = mutableListOf(contentFade, contentSlide)
            brandingFade?.let { animators.add(it) }
            playTogether(animators.map { it as android.animation.Animator })
            start()
        }
    }

    private fun navigateToSafePage() {
        val browserPackage = intent.getStringExtra(EXTRA_BROWSER_PACKAGE)
        val prefs = getSharedPreferences("hur_blocker", Context.MODE_PRIVATE)
        val customUrl = prefs.getString("redirect_url", null)

        val targetUrl = if (!customUrl.isNullOrBlank()) {
            try {
                Uri.parse(customUrl)
                customUrl
            } catch (_: Exception) {
                "https://www.google.com"
            }
        } else {
            "https://www.google.com"
        }

        val safeUrl = Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl))
        safeUrl.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP

        if (browserPackage != null) {
            safeUrl.setPackage(browserPackage)
        }

        startActivity(safeUrl)
        finish()
    }

    override fun onDestroy() {
        countdownTimer?.cancel()
        super.onDestroy()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (!isCountdownFinished) return

        val reason = intent.getStringExtra(EXTRA_REASON) ?: "app"
        val browserPackage = intent.getStringExtra(EXTRA_BROWSER_PACKAGE)
        if (reason == "content") {
            val isBrowser = browserPackage != null && isBrowserPackage(browserPackage)
            if (isBrowser) navigateToSafePage() else navigateBackInApp()
        } else if (reason == "uninstall") {
            navigateHome()
        } else {
            navigateToSafePage()
        }
    }
}
