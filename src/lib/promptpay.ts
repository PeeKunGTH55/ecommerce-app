export interface PromptPayData {
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  countryCode: string;
  referenceLabel: string;
  terminalLabel: string;
  additionalData: string;
}

export function generatePromptPayPayload(data: PromptPayData): string {
  const {
    merchantId,
    merchantName,
    amount,
    currency = "764", // THB
    countryCode = "TH",
    referenceLabel,
    terminalLabel = "***",
    additionalData,
  } = data;

  // EMVCo QR Code format for PromptPay
  // Payload Format Indicator (ID 00) - Fixed "01"
  const payloadFormat = "01";

  // Point of Initiation Method (ID 01) - 11 = Static, 12 = Dynamic
  const pointOfInitiation = "12";

  // Merchant Account Information (ID 29) - PromptPay uses AID A000000677010111
  let formattedMerchantId = merchantId.replace(/\D/g, "");
  let aid = "A000000677010111";
  let tag = "01";

  if (formattedMerchantId.length === 10 && formattedMerchantId.startsWith("0")) {
    // Convert 0812345678 to 0066812345678
    formattedMerchantId = "0066" + formattedMerchantId.slice(1);
  } else if (formattedMerchantId.length === 13) {
    aid = "A000000677010112";
    tag = "02";
  }

  const merchantAccountInfo = `00${aid.length.toString().padStart(2, "0")}${aid}${tag}${formattedMerchantId.length.toString().padStart(2, "0")}${formattedMerchantId}`;

  // Merchant Category Code (ID 52) - 4 digits
  const merchantCategoryCode = "5399"; // Miscellaneous retail

  // Transaction Currency (ID 53) - 764 = THB
  const transactionCurrency = currency;

  // Transaction Amount (ID 54) - Variable length
  const transactionAmount = amount.toFixed(2);

  // Country Code (ID 58) - TH
  const countryCodeField = countryCode;

  // Merchant Name (ID 59) - Display name
  const merchantNameField = merchantName;

  // Merchant City (ID 60) - City name
  const merchantCity = "1002000000000000"; // Bangkok placeholder

  // Additional Data Field Template (ID 62)
  // Reference Label (01) - Bill/Reference number
  // Terminal Label (02) - Terminal ID
  // Additional Data (03) - Free text
  const referenceLabelField = referenceLabel
    ? `01${referenceLabel.length.toString().padStart(2, "0")}${referenceLabel}`
    : "";
  const terminalLabelField = terminalLabel
    ? `02${terminalLabel.length.toString().padStart(2, "0")}${terminalLabel}`
    : "";
  const additionalDataField = additionalData
    ? `03${additionalData.length.toString().padStart(2, "0")}${additionalData}`
    : "";
  const additionalDataTemplate = referenceLabelField + terminalLabelField + additionalDataField;
  const additionalDataFieldTemplate = additionalDataTemplate
    ? `62${additionalDataTemplate.length.toString().padStart(2, "0")}${additionalDataTemplate}`
    : "";

  // CRC (ID 63) - 4 characters, calculated at the end
  const crcPlaceholder = "6304";

  // Build payload without CRC
  const payloadWithoutCrc =
    `00${payloadFormat.length.toString().padStart(2, "0")}${payloadFormat}` +
    `01${pointOfInitiation.length.toString().padStart(2, "0")}${pointOfInitiation}` +
    `29${merchantAccountInfo.length.toString().padStart(2, "0")}${merchantAccountInfo}` +
    `52${merchantCategoryCode.length.toString().padStart(2, "0")}${merchantCategoryCode}` +
    `53${transactionCurrency.length.toString().padStart(2, "0")}${transactionCurrency}` +
    `54${transactionAmount.length.toString().padStart(2, "0")}${transactionAmount}` +
    `58${countryCodeField.length.toString().padStart(2, "0")}${countryCodeField}` +
    `59${merchantNameField.length.toString().padStart(2, "0")}${merchantNameField}` +
    `60${merchantCity.length.toString().padStart(2, "0")}${merchantCity}` +
    additionalDataFieldTemplate +
    crcPlaceholder;

  // Calculate CRC16-CCITT (XModem)
  const crc = calculateCRC16(payloadWithoutCrc);

  return payloadWithoutCrc + crc;
}

function calculateCRC16(data: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function parsePromptPayId(input: string): string {
  // Remove non-digits
  const digits = input.replace(/\D/g, "");
  // Thai PromptPay ID: 13 digits (phone number without leading 0) or 15 digits (tax ID)
  if (digits.length === 13 || digits.length === 15) {
    return digits;
  }
  throw new Error("Invalid PromptPay ID format");
}

export function formatPromptPayId(id: string): string {
  const digits = id.replace(/\D/g, "");
  if (digits.length === 13) {
    // Format as phone: 0XX-XXX-XXXX
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 15) {
    // Format as tax ID: X-XXXX-XXXXX-X-X
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 11)}-${digits.slice(11)}`;
  }
  return id;
}