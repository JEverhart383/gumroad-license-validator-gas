function onOpen() {

  const ui = SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
  const menu =  ui.createMenu('Gumroad License Validator');
      if (!GumroadLicenseValidator.isLicenseValid()){
        menu.addItem('Activate License', 'GumroadLicenseValidator.showLicenseKeyPrompt')
      }
      menu.addItem('Clear Props', 'GumroadLicenseValidator.deleteLicenseFromProps')
      menu.addItem('License Details', 'GumroadLicenseValidator.showProps')
      menu.addItem('Buy Now', 'GumroadLicenseValidator.showBuyModal')
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
  private static URL:string = 'https://api.gumroad.com/v2/licenses/verify';
  /**
   * CONFIGURE THESE VALUES
   * **/
  // private static PRODUCT_PERMALINK: string = 'yyTnc';
  private static PRODUCT_PERMALINK: string = 'AEFYq';
  private static DOCUMENT_CONTAINER = SpreadsheetApp
  private static PROPERTY_STORE = PropertiesService.getScriptProperties()
  private static INCREMENT_USES_COUNT:boolean = true;
  private static MAX_NUMBER_OF_USES:number = 1;
  private static IS_SUBSCRIPTION: boolean = false;

  public static isLicenseValid (): boolean{
    const licenseDetails = GumroadLicenseValidator.getLicenseDetails();
    if (licenseDetails) {
      const gumroadResponse = JSON.parse(licenseDetails);
      if (gumroadResponse.success === true
        && gumroadResponse.refunded === false
        && gumroadResponse.disputed === false
        && gumroadResponse.chargebacked === false ){
        if(GumroadLicenseValidator.INCREMENT_USES_COUNT && gumroadResponse.uses > GumroadLicenseValidator.MAX_NUMBER_OF_USES) {
          return false
        }
        if (GumroadLicenseValidator.IS_SUBSCRIPTION 
          && gumroadResponse.subscription_cancelled_at !== null
          && gumroadResponse.subscription_failed_at !== null) {
            return false
          }
        
        return true

      } else {
        return false
      }
    }
    return false
  }

  public static validateLicense(licenseKey) {
      const response = UrlFetchApp.fetch(`${this.URL}`, {
        method: 'post',
        payload: {
          product_permalink: this.PRODUCT_PERMALINK,
          license_key: licenseKey
        },
        muteHttpExceptions: true
      })
      const license = response.getContentText()
      GumroadLicenseValidator.setLicenseInProps(license)
      return license
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
      var licenseKey = result.getResponseText();
      if (button == ui.Button.OK) {
        //Here we will validate
        const licenseResponse = GumroadLicenseValidator.validateLicense(licenseKey)
        // User clicked "OK".
        ui.alert('Your license details are: ' + licenseResponse + '.');
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
    const license = GumroadLicenseValidator.getLicenseDetails()
    ui.alert(license || 'Props are empty');
  }
  public static showBuyModal() {
    const ui = GumroadLicenseValidator.DOCUMENT_CONTAINER.getUi(); // Same variations.
    var htmlOutput = HtmlService
    .createHtmlOutputFromFile('index')
    .setWidth(450)
    .setHeight(700);
    ui.showModalDialog(htmlOutput, 'Buy Now')
  }

}