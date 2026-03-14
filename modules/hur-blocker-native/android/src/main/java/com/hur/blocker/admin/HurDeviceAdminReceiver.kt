package com.hur.blocker.admin

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class HurDeviceAdminReceiver : DeviceAdminReceiver() {

    companion object {
        private const val TAG = "HurDeviceAdmin"
        private const val PREFS_NAME = "hur_blocker"
    }

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Log.d(TAG, "Device admin enabled")
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Log.d(TAG, "Device admin disabled — protection removed")
        // TODO: Notify accountability partner if configured
    }

    override fun onDisableRequested(context: Context, intent: Intent): CharSequence {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val partnerType = prefs.getString("partner_type", null)

        return if (partnerType == "friend" || partnerType == "parent") {
            "\u062A\u062D\u0630\u064A\u0631: \u062A\u062D\u062A\u0627\u062C \u0645\u0648\u0627\u0641\u0642\u0629 \u0634\u0631\u064A\u0643 \u0627\u0644\u0645\u0633\u0627\u0621\u0644\u0629 \u0644\u0625\u0644\u063A\u0627\u0621 \u062D\u0645\u0627\u064A\u0629 \u062A\u0637\u0628\u064A\u0642 \u062D\u064F\u0631. " +
                "\u0633\u064A\u062A\u0645 \u0625\u0628\u0644\u0627\u063A \u0634\u0631\u064A\u0643 \u0627\u0644\u0645\u0633\u0627\u0621\u0644\u0629 \u0628\u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621."
        } else {
            "\u062A\u062D\u0630\u064A\u0631: \u0625\u0644\u063A\u0627\u0621 \u062A\u0641\u0639\u064A\u0644 \u0645\u062F\u064A\u0631 \u0627\u0644\u062C\u0647\u0627\u0632 \u0633\u064A\u0632\u064A\u0644 \u062D\u0645\u0627\u064A\u0629 \u0639\u062F\u0645 \u0627\u0644\u062D\u0630\u0641 \u0645\u0646 \u062A\u0637\u0628\u064A\u0642 \u062D\u064F\u0631. " +
                "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F\u061F"
        }
    }
}
