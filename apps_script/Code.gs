/**
 * Configuration
 */
const CONFIG = {
  // If true, no SMS is sent and the OTP is returned in response for testing.
  // Set to false in production.
  TEST_MODE: false,

  // Choose provider: 'NONE' | 'TWILIO' | 'MSG91' | 'FAST2SMS' | 'MESSAGECENTRAL'
  SMS_PROVIDER: 'MESSAGECENTRAL',
};

/**
 * Handle POST requests
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const jsonString = e.postData.contents;
    const params = JSON.parse(jsonString);
    const action = params.action;
    let result = {};

    if (action === 'placeOrder') {
      result = placeOrder_(params.order, params.sessionId, params.requireOtp);
    } else {
      result = { ok: false, error: 'Unknown action in POST' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error('doPost Error', err);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET requests
 */
function doGet(e) {
  console.log('doGet started', JSON.stringify(e.parameter));
  const action = e.parameter.action;
  const callback = e.parameter.callback;
  let result = {};

  try {
    if (action === 'sendOtp') {
      result = sendOtp_(e.parameter.phone);
    } else if (action === 'verifyOtp') {
      result = verifyOtp_(e.parameter.sessionId, e.parameter.otp);
    } else if (action === 'checkOrder') {
      result = checkOrder_(e.parameter.orderId);
    } else if (action === 'getOrders') {
      result = getOrders_(e.parameter);
    } else {
      result = { ok: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    console.error('doGet execution error', err);
    result = { ok: false, error: err.toString() };
  }

  const json = JSON.stringify(result);

  if (callback) {
    return ContentService.createTextOutput(`${callback}(${json})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Actions
 */

function sendOtp_(phone) {
  const cleanPhone = normalizePhone_(phone);
  if (!cleanPhone) throw new Error('Invalid phone number');
  const sessionId = Utilities.getUuid();
  
  if (CONFIG.SMS_PROVIDER === 'MESSAGECENTRAL' && !CONFIG.TEST_MODE) {
    try {
      const verificationId = sendOtpMessageCentral_(cleanPhone);
      const cache = CacheService.getScriptCache();
      cache.put(sessionId, JSON.stringify({ 
        phone: cleanPhone, 
        provider: 'MESSAGECENTRAL', 
        verificationId: verificationId, 
        verified: false 
      }), 600); 

      return { ok: true, sessionId: sessionId };
    } catch (e) {
      console.error('SendOtp MessageCentral Error', e);
      return { ok: false, error: 'MessageCentral Error: ' + e.message };
    }
  }

  // Fallback flow
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const cache = CacheService.getScriptCache();
  cache.put(sessionId, JSON.stringify({ phone: cleanPhone, otp: otp, verified: false }), 600);

  if (CONFIG.TEST_MODE) {
    return { ok: true, sessionId: sessionId, testOtp: otp };
  } else {
    try {
      sendSms_(cleanPhone, `Your OTP is ${otp}`);
      return { ok: true, sessionId: sessionId };
    } catch (e) {
      return { ok: false, error: 'SMS failed: ' + e.message };
    }
  }
}

function verifyOtp_(sessionId, userOtp) {
  const cache = CacheService.getScriptCache();
  const dataStr = cache.get(sessionId);
  if (!dataStr) throw new Error('Session expired or invalid');

  const data = JSON.parse(dataStr);

  if (data.provider === 'MESSAGECENTRAL') {
    if (!data.verificationId) throw new Error('Missing verification ID');
    try {
      // Pass stored phone number to verify function (required for MessageCentral validation)
      const isValid = verifyOtpMessageCentral_(data.verificationId, userOtp, data.phone);
      if (!isValid) throw new Error('Incorrect OTP');
      
      data.verified = true;
      cache.put(sessionId, JSON.stringify(data), 600);
      return { ok: true };
    } catch (e) {
      console.error('VerifyOtp MessageCentral Error', e);
      throw new Error(e.message || 'Verification failed');
    }
  }

  if (data.otp !== userOtp) throw new Error('Incorrect OTP');
  data.verified = true;
  cache.put(sessionId, JSON.stringify(data), 600); 

  return { ok: true };
}

function placeOrder_(order, sessionId, requireOtp) {
  if (requireOtp) {
    if (!sessionId) throw new Error('Missing session ID for OTP verification');
    const cache = CacheService.getScriptCache();
    const dataStr = cache.get(sessionId);
    if (!dataStr) throw new Error('Session expired. Please verify OTP again.');
    const data = JSON.parse(dataStr);
    if (!data.verified) throw new Error('Phone not verified');
    const orderPhone = normalizePhone_(order.customer?.phone);
    if (orderPhone !== data.phone) throw new Error('Phone number mismatch');
  }

  const sheet = getOrCreateOrdersSheet_();
  const orderId = 'LAD-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  const date = new Date().toISOString();
  
  const row = [
    orderId,
    date,
    order.customer?.name || '',
    order.customer?.phone || '',
    order.customer?.address || '',
    order.customer?.zip || '',
    order.kind === 'cart' ? 'Cart Order' : (order.kind === 'custom' ? 'Custom' : 'Signature'),
    order.product?.name || '',
    order.product?.quantity || '',
    order.product?.ingredients || '', 
    order.product?.totalPrice || '',
    order.paymentRef || '',
    'New',
    JSON.stringify(order.items || []) 
  ];

  sheet.appendRow(row);
  return { ok: true, orderId: orderId };
}

function checkOrder_(orderId) {
  if (!orderId) throw new Error('Missing orderId');
  const sheet = getOrCreateOrdersSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: false, found: false };
  const startRow = Math.max(2, lastRow - 20);
  const data = sheet.getRange(startRow, 1, lastRow - startRow + 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(orderId)) return { ok: true, found: true };
  }
  return { ok: true, found: false };
}

function getOrders_(payload) {
  if (!payload.sessionId) throw new Error('Missing sessionId');
  const cache = CacheService.getScriptCache();
  const dataStr = cache.get(payload.sessionId);
  if (!dataStr) throw new Error('Session expired');
  const data = JSON.parse(dataStr);
  if (!data.verified) throw new Error('Phone not verified');
  const verifiedPhone = data.phone;
  const sheet = getOrCreateOrdersSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true, orders: [] };
  const colCount = Math.max(13, sheet.getLastColumn());
  const values = sheet.getRange(2, 1, lastRow - 1, colCount).getValues();
  const out = [];
  for (var i = values.length - 1; i >= 0; i--) {
    const phone = String(values[i][3] || '');
    if (phone === verifiedPhone) {
      const itemsJson = colCount >= 14 ? String(values[i][13] || '') : '';
      out.push({
        id: String(values[i][0] || ''),
        date: String(values[i][1] || ''),
        productType: String(values[i][6] || ''),
        productName: String(values[i][7] || ''),
        quantity: String(values[i][8] || ''),
        total: String(values[i][10] || ''),
        itemsJson: itemsJson,
      });
      if (out.length >= 10) break;
    }
  }
  return { ok: true, orders: out };
}

/**
 * Helpers
 */

function getOrCreateOrdersSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Orders');
  if (!sheet) {
    sheet = ss.insertSheet('Orders');
    sheet.appendRow([
      'Order ID', 'Date', 'Name', 'Phone', 'Address', 'Zip', 
      'Type', 'Product Name', 'Quantity', 'Ingredients', 'Total Price', 
      'Payment Ref', 'Status', 'Items JSON'
    ]);
  }
  return sheet;
}

function sendSms_(phone, message) { /* Fallback implementation kept */ }

// --- MessageCentral VerifyNow Implementation (v3) ---

function getMessageCentralToken_(forceRefresh = false) {
  const cache = CacheService.getScriptCache();
  
  if (!forceRefresh) {
    const cachedToken = cache.get('MC_AUTH_TOKEN');
    if (cachedToken) return cachedToken;
  }

  const props = PropertiesService.getScriptProperties();
  const customerId = props.getProperty('MESSAGECENTRAL_CUSTOMER_ID');
  const key = props.getProperty('MESSAGECENTRAL_KEY');
  
  if (!customerId || !key) throw new Error('Missing MessageCentral credentials');

  const baseUrl = 'https://cpaas.messagecentral.com/auth/v1/authentication/token';
  const query = `customerId=${encodeURIComponent(customerId)}&key=${encodeURIComponent(key)}&scope=NEW`;
  const url = `${baseUrl}?${query}`;

  const options = {
    method: 'get',
    muteHttpExceptions: true
  };
  
  const resp = UrlFetchApp.fetch(url, options);
  const code = resp.getResponseCode();
  const body = resp.getContentText();
  
  if (code !== 200) {
    throw new Error(`Auth Failed (${code}): ${body}`);
  }
  
  const json = safeJsonParse_(body);
  if (!json || !json.token) throw new Error('Invalid Auth Response: ' + body);
  
  cache.put('MC_AUTH_TOKEN', json.token, 21600);
  return json.token;
}

function sendOtpMessageCentral_(phone) {
  const props = PropertiesService.getScriptProperties();
  const customerId = props.getProperty('MESSAGECENTRAL_CUSTOMER_ID');
  let token = null;

  try {
    token = getMessageCentralToken_(false);
  } catch (e) {
    throw new Error('Auth Init Failed: ' + e.message);
  }

  let countryCode = '91';
  let mobileNumber = phone;
  if (phone.startsWith('91') && phone.length > 10) mobileNumber = phone.slice(2);
  else if (phone.length === 10) {} 

  const baseUrl = 'https://cpaas.messagecentral.com/verification/v3/send';
  const query = `countryCode=${countryCode}&flowType=SMS&mobileNumber=${mobileNumber}&otpLength=6`;
  const url = `${baseUrl}?${query}`;

  const makeRequest = (authToken) => {
    return UrlFetchApp.fetch(url, {
      method: 'post',
      headers: { 'authToken': authToken },
      muteHttpExceptions: true,
      payload: '' 
    });
  };

  let resp = makeRequest(token);
  
  if (resp.getResponseCode() === 401) {
    token = getMessageCentralToken_(true); 
    resp = makeRequest(token);
  }
  
  const code = resp.getResponseCode();
  const body = resp.getContentText();
  
  if (code !== 200) {
    throw new Error(`Send Failed (${code}): ${body}`);
  }
  
  const json = safeJsonParse_(body);
  if (json && json.responseCode === 200 && json.data && json.data.verificationId) {
    return json.data.verificationId;
  }
  
  throw new Error('MessageCentral API Error: ' + (json ? json.message : body));
}

function verifyOtpMessageCentral_(verificationId, codeInput, phone) {
  const props = PropertiesService.getScriptProperties();
  const customerId = props.getProperty('MESSAGECENTRAL_CUSTOMER_ID');
  
  // Try to get token
  let token = null;
  try {
    token = getMessageCentralToken_(false);
  } catch (e) {
    throw new Error('Auth Init Failed (Validate): ' + e.message);
  }
  
  // Validate Params (Based on working curl example)
  // GET request with all params: flowType, type, verificationId, code, countryCode, mobileNumber, customerId
  let countryCode = '91';
  let mobileNumber = phone || '';
  if (mobileNumber.startsWith('91') && mobileNumber.length > 10) mobileNumber = mobileNumber.slice(2);
  
  const baseUrl = 'https://cpaas.messagecentral.com/verification/v3/validateOtp';
  const query = `flowType=SMS&type=OTP&verificationId=${encodeURIComponent(verificationId)}&code=${encodeURIComponent(codeInput)}&countryCode=${countryCode}&mobileNumber=${mobileNumber}&customerId=${encodeURIComponent(customerId)}`;
  const url = `${baseUrl}?${query}`;

  const makeRequest = (authToken) => {
    return UrlFetchApp.fetch(url, {
      method: 'get', // User confirmed GET works
      headers: { 
        'authToken': authToken,
        'Content-Type': 'application/json' // Matches user curl
      },
      muteHttpExceptions: true
    });
  };
  
  let resp = makeRequest(token);
  
  // Auto-retry on 401
  if (resp.getResponseCode() === 401) {
    token = getMessageCentralToken_(true);
    resp = makeRequest(token);
  }

  const code = resp.getResponseCode();
  const body = resp.getContentText();
  const json = safeJsonParse_(body);
  
  if (code === 200 && json && json.responseCode === 200 && json.data && json.data.verificationStatus === 'VERIFICATION_COMPLETED') {
    return true;
  }
  
  if (json && json.responseCode) {
    const rc = json.responseCode;
    const msg = json.message || 'Verification Failed';
    if (rc === 702) throw new Error('Incorrect OTP');
    if (rc === 705) throw new Error('OTP Expired');
    throw new Error(`Validate Failed: ${msg} (${rc})`);
  }
  
  throw new Error(`Validate Error (${code}): ${body}`);
}

function normalizePhone_(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

function safeJsonParse_(str) {
  try { return JSON.parse(str); } catch (e) { return null; }
}

function sendSmsTwilio_(phone, message) { /* ... */ }
function sendSmsMsg91_(phone, message) { /* ... */ }
function sendSmsFast2Sms_(phone, message) { /* ... */ }
