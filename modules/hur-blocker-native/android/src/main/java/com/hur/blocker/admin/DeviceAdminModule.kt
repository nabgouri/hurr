package com.hur.blocker.admin

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DeviceAdminModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val NAME = "DeviceAdminModule"
        private const val DEVICE_ADMIN_REQUEST_CODE = 9001
    }

    private var deviceAdminPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = NAME

    /**
     * Check if device admin is currently active.
     */
    @ReactMethod
    fun isDeviceAdminActive(promise: Promise) {
        try {
            val dpm = reactApplicationContext.getSystemService(Context.DEVICE_POLICY_SERVICE)
                as DevicePolicyManager
            val componentName = ComponentName(reactApplicationContext, HurDeviceAdminReceiver::class.java)
            promise.resolve(dpm.isAdminActive(componentName))
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Open the device admin activation dialog.
     */
    @ReactMethod
    fun requestDeviceAdmin(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("ERROR", "Activity is null")
            return
        }

        try {
            val componentName = ComponentName(reactApplicationContext, HurDeviceAdminReceiver::class.java)
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
        } catch (e: Exception) {
            deviceAdminPromise = null
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Remove device admin (disables uninstall protection).
     */
    @ReactMethod
    fun removeDeviceAdmin(promise: Promise) {
        try {
            val dpm = reactApplicationContext.getSystemService(Context.DEVICE_POLICY_SERVICE)
                as DevicePolicyManager
            val componentName = ComponentName(reactApplicationContext, HurDeviceAdminReceiver::class.java)

            if (dpm.isAdminActive(componentName)) {
                dpm.removeActiveAdmin(componentName)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == DEVICE_ADMIN_REQUEST_CODE) {
            val granted = resultCode == Activity.RESULT_OK
            deviceAdminPromise?.resolve(granted)
            deviceAdminPromise = null
        }
    }

    override fun onNewIntent(intent: Intent) {
        // Not needed
    }
}
