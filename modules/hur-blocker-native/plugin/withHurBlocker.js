const { withMainActivity } = require('expo/config-plugins');

function withHurBlocker(config) {
  // Inject RTL setup into MainActivity
  config = withMainActivity(config, (config) => {
    let contents = config.modResults.contents;

    // Add imports if not present
    if (!contents.includes('import android.view.View')) {
      contents = contents.replace(
        'import com.facebook.react.ReactActivity',
        'import android.view.View\nimport com.facebook.react.ReactActivity'
      );
    }
    if (!contents.includes('I18nUtil')) {
      contents = contents.replace(
        'import com.facebook.react.ReactActivity',
        'import com.facebook.react.modules.i18nmanager.I18nUtil\nimport com.facebook.react.ReactActivity'
      );
    }

    // Add RTL code before super.onCreate(null)
    if (!contents.includes('I18nUtil.getInstance()')) {
      const rtlCode = [
        '    // Force RTL for Arabic app BEFORE anything else',
        '    val sharedI18nUtilInstance = I18nUtil.getInstance()',
        '    sharedI18nUtilInstance.allowRTL(this, true)',
        '    sharedI18nUtilInstance.forceRTL(this, true)',
        '',
        '    // Force layout direction to RTL',
        '    window.decorView.layoutDirection = View.LAYOUT_DIRECTION_RTL',
        '',
      ].join('\n');

      contents = contents.replace(
        '    super.onCreate(null)',
        rtlCode + '    super.onCreate(null)'
      );
    }

    config.modResults.contents = contents;
    return config;
  });

  return config;
}

module.exports = withHurBlocker;
