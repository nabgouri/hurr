const { withMainActivity, withMainApplication } = require('expo/config-plugins');

function withHurBlocker(config) {
  // 1. Inject RTL setup into MainActivity
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

  // 2. Register HurBlockerPackage in MainApplication
  config = withMainApplication(config, (config) => {
    let contents = config.modResults.contents;

    // Add import
    if (!contents.includes('import com.hur.blocker.HurBlockerPackage')) {
      contents = contents.replace(
        'import com.facebook.react.ReactApplication',
        'import com.hur.blocker.HurBlockerPackage\nimport com.facebook.react.ReactApplication'
      );
    }

    // Add package to getPackages
    if (!contents.includes('HurBlockerPackage()')) {
      if (contents.includes('PackageList(this).packages.apply')) {
        // If .apply block already exists, add inside it
        contents = contents.replace(
          'PackageList(this).packages.apply {',
          'PackageList(this).packages.apply {\n              add(HurBlockerPackage())'
        );
      } else {
        // If no .apply block, add one
        contents = contents.replace(
          'PackageList(this).packages',
          'PackageList(this).packages.apply {\n              add(HurBlockerPackage())\n            }'
        );
      }
    }

    config.modResults.contents = contents;
    return config;
  });

  return config;
}

module.exports = withHurBlocker;
