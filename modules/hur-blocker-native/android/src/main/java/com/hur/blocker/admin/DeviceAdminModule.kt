package com.hur.blocker.admin

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DeviceAdminModule : Module() {

    companion object {
        private const val DEVICE_ADMIN_REQUEST_CODE = 9001
    }

    private var deviceAdminPromise: Promise? = null

    private val context
        get() = requireNotNull(appContext.reactContext)

    override fun definition() = ModuleDefinition {
        Name("DeviceAdminModule")

        OnActivityResult { _, payload ->
            if (payload.requestCode == DEVICE_ADMIN_REQUEST_CODE) {
                val granted = payload.resultCode == Activity.RESULT_OK
                deviceAdminPromise?.resolve(granted)
                deviceAdminPromise = null
            }
        }

        AsyncFunction("isDeviceAdminActive") {
            val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE)
                as DevicePolicyManager
            val componentName = ComponentName(context, HurDeviceAdminReceiver::class.java)
            return@AsyncFunction dpm.isAdminActive(componentName)
        }

        AsyncFunction("requestDeviceAdmin") { promise: Promise ->
            val activity = appContext.activityProvider?.currentActivity
            if (activity == null) {
                promise.reject("ERROR", "Activity is null", null)
                return@AsyncFunction
            }

            val componentName = ComponentName(context, HurDeviceAdminReceiver::class.java)
            val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
                putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, componentName)
                putExtra(
                    DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                    "\u062A\u0637\u0628\u064A\u0642 \u062D\u064F\u0631 \u064A\u062D\u062A\u0627\u062C \u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u062F\u064A\u0631 \u0627\u0644\u062C\u0647\u0627\u0632 \u0644\u0645\u0646\u0639 \u062D\u0630\u0641 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u062F\u0648\u0646 \u0625\u0630\u0646 \u0634\u0631\u064A\u0643 \u0627\u0644\u0645\u0633\u0627\u0621\u0644\u0629. " +
                        "\u0647\u0630\u0627 \u064A\u0633\u0627\u0639\u062F\u0643 \u0639\u0644\u0649 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0642\u0631\u0627\u0631\u0643."
                )
            }

            deviceAdminPromise = promise
            activity.startActivityForResult(intent, DEVICE_ADMIN_REQUEST_CODE)
        }

        AsyncFunction("removeDeviceAdmin") {
            val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE)
                as DevicePolicyManager
            val componentName = ComponentName(context, HurDeviceAdminReceiver::class.java)

            if (dpm.isAdminActive(componentName)) {
                dpm.removeActiveAdmin(componentName)
                return@AsyncFunction true
            }
            return@AsyncFunction false
        }
    }
}
