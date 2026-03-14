package com.hur.blocker.blocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == Intent.ACTION_BOOT_COMPLETED ||
            intent?.action == "android.intent.action.QUICKBOOT_POWERON") {

            context ?: return

            // Restore blocklists from SharedPreferences into the companion object.
            // The accessibility service auto-restarts if enabled in settings,
            // but it needs the blocklists loaded into memory to function.
            AppBlockerModule.restoreFromPrefs(context)

            Log.d("HurBootReceiver", "Blocklists restored — " +
                "packages=${AppBlockerModule.getBlockedPackages().size}, " +
                "keywords=${AppBlockerModule.getBlockedKeywords().size}, " +
                "domains=${AppBlockerModule.getBlockedDomains().size}")
        }
    }
}
