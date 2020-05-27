function onOpen() {

  const ui = SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
  const menu =  ui.createMenu('Gumroad License Validator');
      if (!GumroadLicenseValidator.isLicenseValid()){
        menu.addItem('Activate License', 'GumroadLicenseValidator.showLicenseKeyPrompt')
      }
      menu.addItem('Clear Props', 'GumroadLicenseValidator.deleteLicenseFromProps')
      menu.addItem('License Details', 'GumroadLicenseValidator.showProps')
      menu.addItem('Standard Function', 'standardFunction')
      menu.addItem('Premium Function', 'premiumFunction')
      menu.addToUi();
}

function standardFunction() {
  SpreadsheetApp.getUi().alert('This is a standard function!')
}

function premiumFunction() {
  if (GumroadLicenseValidator.isLicenseValid()){
    SpreadsheetApp.getUi().alert('You are special')
  } else {
    SpreadsheetApp.getUi().alert('Your need to pay up')
  }
}

export default class GumroadLicenseValidator {
  /**
   * CONFIGURE THESE VALUES
   * 
   * **/
  private static GUMROAD_URL:string = 'https://api.gumroad.com/v2/licenses/verify';
  private static GUMROAD_PRODUCT_PERMALINK: string = 'yyTnc';
  private static DOCUMENT_CONTAINER = SpreadsheetApp
  private static PROPERTY_STORE = PropertiesService.getScriptProperties()
  private GUMROAD_INCREMENT_USES_COUNT:boolean = true;
  private GUMROAD_MAX_NUMBER_OF_USES:number = 1;

  public static isLicenseValid (): boolean{
    const licenseDetails = GumroadLicenseValidator.getLicenseDetails();
    if (licenseDetails) {
      const gumroadResponse = JSON.parse(licenseDetails);
      Logger.log(gumroadResponse)
      if (gumroadResponse.success === true ){
        return true
      } else {
        return false
      }
    }
    return false
  }

  public static validateLicense(licenseKey) {
      const response = UrlFetchApp.fetch(`${this.GUMROAD_URL}`, {
        method: 'post',
        payload: {
          product_permalink: this.GUMROAD_PRODUCT_PERMALINK,
          license_key: licenseKey
        },
        muteHttpExceptions: true
      })
      return response.getContentText()
  }

  public static setLicenseInProps(license) {
    const properties = {'gumroadLicense': license}
    GumroadLicenseValidator.PROPERTY_STORE.setProperties(properties)
  }
  public static getLicenseDetails() {
    return GumroadLicenseValidator.PROPERTY_STORE.getProperty('gumroadLicense')
  }
  public static deleteLicenseFromProps() {
    GumroadLicenseValidator.PROPERTY_STORE.deleteProperty('gumroadLicense')
  }
  public static showLicenseKeyPrompt() {
      var ui = GumroadLicenseValidator.DOCUMENT_CONTAINER.getUi(); // Same variations.
    
      var result = ui.prompt(
          'Activate License',
          'Please enter your the license from your Gumroad transaction:',
          ui.ButtonSet.OK_CANCEL);
    
      // Process the user's response.
      var button = result.getSelectedButton();
      var license = result.getResponseText();
      if (button == ui.Button.OK) {
        //Here we will validate
        const response = GumroadLicenseValidator.validateLicense(license)
        GumroadLicenseValidator.setLicenseInProps(response)
        // User clicked "OK".
        ui.alert('Your license details are: ' + response + '.');
      } else if (button == ui.Button.CANCEL) {
        // User clicked "Cancel".
        ui.alert('Certain features of this product won\'t work until you activate your license.');
      } else if (button == ui.Button.CLOSE) {
        // User clicked X in the title bar.
        ui.alert('Certain features of this product won\'t work until you activate your license.');
      }
  }
  public static showProps() {
    const ui = GumroadLicenseValidator.DOCUMENT_CONTAINER.getUi(); // Same variations.
    const props = GumroadLicenseValidator.getLicenseDetails()
    ui.alert(props || 'Props are empty');
  }

  public getLicenseFromProps(){

  }


}