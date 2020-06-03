// Compiled using ts2gas 3.4.4 (TypeScript 3.7.5)
var exports = exports || {};
var module = module || { exports: exports };
function onOpen() {
    var ui = SpreadsheetApp.getUi(); // Or DocumentApp or SlidesApp or FormApp.
    var menu = ui.createMenu('Gumroad License Validator');
    if (!GumroadLicenseValidator.isLicenseValid()) {
        menu.addItem('Activate License', 'GumroadLicenseValidator.showLicenseKeyPrompt');
    }
    menu.addItem('Clear Props', 'GumroadLicenseValidator.deleteLicenseFromProps');
    menu.addItem('License Details', 'GumroadLicenseValidator.showProps');
    menu.addItem('Standard Function', 'standardFunction');
    menu.addItem('Premium Function', 'premiumFunction');
    menu.addToUi();
}
function standardFunction() {
    SpreadsheetApp.getUi().alert('This is a standard function!');
}
function premiumFunction() {
    if (GumroadLicenseValidator.isLicenseValid()) {
        SpreadsheetApp.getUi().alert('You are special');
    }
    else {
        SpreadsheetApp.getUi().alert('Your need to pay up');
    }
}
var GumroadLicenseValidator = /** @class */ (function () {
    function GumroadLicenseValidator() {
        this.GUMROAD_INCREMENT_USES_COUNT = true;
        this.GUMROAD_MAX_NUMBER_OF_USES = 1;
    }
    GumroadLicenseValidator.isLicenseValid = function () {
        var licenseDetails = GumroadLicenseValidator.getLicenseDetails();
        if (licenseDetails) {
            var gumroadResponse = JSON.parse(licenseDetails);
            Logger.log(gumroadResponse);
            if (gumroadResponse.success === true) {
                return true;
            }
            else {
                return false;
            }
        }
        return false;
    };
    GumroadLicenseValidator.validateLicense = function (licenseKey) {
        var response = UrlFetchApp.fetch("" + this.GUMROAD_URL, {
            method: 'post',
            payload: {
                product_permalink: this.GUMROAD_PRODUCT_PERMALINK,
                license_key: licenseKey
            },
            muteHttpExceptions: true
        });
        return response.getContentText();
    };
    GumroadLicenseValidator.setLicenseInProps = function (license) {
        var properties = { 'gumroadLicense': license };
        GumroadLicenseValidator.PROPERTY_STORE.setProperties(properties);
    };
    GumroadLicenseValidator.getLicenseDetails = function () {
        return GumroadLicenseValidator.PROPERTY_STORE.getProperty('gumroadLicense');
    };
    GumroadLicenseValidator.deleteLicenseFromProps = function () {
        GumroadLicenseValidator.PROPERTY_STORE.deleteProperty('gumroadLicense');
    };
    GumroadLicenseValidator.showLicenseKeyPrompt = function () {
        var ui = GumroadLicenseValidator.DOCUMENT_CONTAINER.getUi(); // Same variations.
        var result = ui.prompt('Activate License', 'Please enter your the license from your Gumroad transaction:', ui.ButtonSet.OK_CANCEL);
        // Process the user's response.
        var button = result.getSelectedButton();
        var license = result.getResponseText();
        if (button == ui.Button.OK) {
            //Here we will validate
            var response = GumroadLicenseValidator.validateLicense(license);
            GumroadLicenseValidator.setLicenseInProps(response);
            // User clicked "OK".
            ui.alert('Your license details are: ' + response + '.');
        }
        else if (button == ui.Button.CANCEL) {
            // User clicked "Cancel".
            ui.alert('Certain features of this product won\'t work until you activate your license.');
        }
        else if (button == ui.Button.CLOSE) {
            // User clicked X in the title bar.
            ui.alert('Certain features of this product won\'t work until you activate your license.');
        }
    };
    GumroadLicenseValidator.showProps = function () {
        var ui = GumroadLicenseValidator.DOCUMENT_CONTAINER.getUi(); // Same variations.
        var props = GumroadLicenseValidator.getLicenseDetails();
        ui.alert(props || 'Props are empty');
    };
    GumroadLicenseValidator.prototype.getLicenseFromProps = function () {
    };
    /**
     * CONFIGURE THESE VALUES
     *
     * **/
    GumroadLicenseValidator.GUMROAD_URL = 'https://api.gumroad.com/v2/licenses/verify';
    GumroadLicenseValidator.GUMROAD_PRODUCT_PERMALINK = 'yyTnc';
    GumroadLicenseValidator.DOCUMENT_CONTAINER = SpreadsheetApp;
    GumroadLicenseValidator.PROPERTY_STORE = PropertiesService.getScriptProperties();
    return GumroadLicenseValidator;
}());
