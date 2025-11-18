package dev.djara.expounifiedpush

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.core.app.JobIntentService
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.facebook.react.jstasks.HeadlessJsTaskEventListener
import java.util.concurrent.CopyOnWriteArraySet

internal const val HEADLESS_TASK_NAME = "ExpoUnifiedPushHeadlessTask"
internal const val HEADLESS_KEY_ACTION = "headless_action"
internal const val HEADLESS_KEY_DATA = "headless_data"
private const val HEADLESS_JOB_ID = 2001

class ExpoUPHeadlessService : JobIntentService(), HeadlessJsTaskEventListener {
  private val activeTasks = CopyOnWriteArraySet<Int>()

  override fun onHandleWork(intent: Intent) {
    val taskConfig = getTaskConfig(intent) ?: return
    startTask(taskConfig)
  }

  override fun onDestroy() {
    super.onDestroy()
    getReactContext()?.let {
      HeadlessJsTaskContext.getInstance(it).removeTaskEventListener(this)
    }
  }

  override fun onHeadlessJsTaskStart(taskId: Int) = Unit

  override fun onHeadlessJsTaskFinish(taskId: Int) {
    activeTasks.remove(taskId)
  }

  private fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    val extras = intent?.extras ?: return null
    val action = extras.getString(HEADLESS_KEY_ACTION) ?: return null
    val data = extras.getBundle(HEADLESS_KEY_DATA) ?: Bundle()

    val params = Arguments.createMap().apply {
      putString("action", action)
      putMap("data", Arguments.fromBundle(data))
    }

    return HeadlessJsTaskConfig(
      HEADLESS_TASK_NAME,
      params,
      30_000,
      true
    )
  }

  private fun startTask(taskConfig: HeadlessJsTaskConfig) {
    val handler = Handler(Looper.getMainLooper())
    handler.post {
      HeadlessJsTaskService.acquireWakeLockNow(this)
      val reactContext = getReactContext()
      if (reactContext == null) {
        createReactContextAndScheduleTask(taskConfig)
      } else {
        invokeStartTask(reactContext, taskConfig)
      }
    }
  }

  private fun invokeStartTask(reactContext: ReactContext, taskConfig: HeadlessJsTaskConfig) {
    val headlessContext = HeadlessJsTaskContext.getInstance(reactContext)
    headlessContext.addTaskEventListener(this)

    UiThreadUtil.runOnUiThread {
      val taskId = headlessContext.startTask(taskConfig)
      activeTasks.add(taskId)
    }
  }

  private fun createReactContextAndScheduleTask(taskConfig: HeadlessJsTaskConfig) {
    val reactInstanceManager = reactNativeHost.reactInstanceManager
    reactInstanceManager.addReactInstanceEventListener(
      object : ReactInstanceEventListener {
        override fun onReactContextInitialized(context: ReactContext) {
          invokeStartTask(context, taskConfig)
          reactInstanceManager.removeReactInstanceEventListener(this)
        }
      }
    )

    if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
      reactInstanceManager.createReactContextInBackground()
    }
  }

  private fun getReactContext(): ReactContext? {
    return reactNativeHost.reactInstanceManager.currentReactContext
  }

  private val reactNativeHost: ReactNativeHost
    get() = (application as ReactApplication).reactNativeHost

  companion object {
    fun enqueueWork(context: Context, work: Intent) {
      enqueueWork(
        context,
        ExpoUPHeadlessService::class.java,
        HEADLESS_JOB_ID,
        work
      )
    }
  }
}
