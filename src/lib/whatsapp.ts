import axios from 'axios';

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  provider: 'META_CLOUD_API' | 'CUSTOM_CRM';
  error?: string;
}

export interface SendMessageOptions {
  recipientPhone: string; // E.164 formatted like +919876543210
  templateName?: string;
  templateLanguage?: string;
  bodyText?: string;
  templateParameters?: string[];
  provider?: 'META_CLOUD_API' | 'CUSTOM_CRM';
  customCrmUrl?: string;
  customCrmKey?: string;
}

export async function sendWhatsAppMessage(options: SendMessageOptions): Promise<WhatsAppSendResult> {
  const provider = options.provider || (process.env.CUSTOM_CRM_API_URL ? 'CUSTOM_CRM' : 'META_CLOUD_API');

  // Strip '+' from phone number for API payloads
  const cleanPhone = options.recipientPhone.replace(/[^\d]/g, '');

  if (provider === 'CUSTOM_CRM') {
    return sendViaCustomCrm(cleanPhone, options);
  } else {
    return sendViaMetaCloudApi(cleanPhone, options);
  }
}

async function sendViaMetaCloudApi(
  cleanPhone: string,
  options: SendMessageOptions
): Promise<WhatsAppSendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const templateName = options.templateName || process.env.WHATSAPP_DEFAULT_TEMPLATE || 'hello_world';
  const languageCode = options.templateLanguage || 'en_US';

  if (!phoneNumberId || !accessToken) {
    return {
      success: false,
      provider: 'META_CLOUD_API',
      error: 'Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN in environment variables.',
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    // Construct Meta Payload
    let payload: Record<string, unknown>;

    if (templateName === 'hello_world') {
      // Standard Meta Test Template
      payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'hello_world',
          language: {
            code: 'en_US',
          },
        },
      };
    } else if (options.templateParameters && options.templateParameters.length > 0) {
      // Dynamic parameters in template body
      payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: [
            {
              type: 'body',
              parameters: options.templateParameters.map((param) => ({
                type: 'text',
                text: param,
              })),
            },
          ],
        },
      };
    } else {
      // Standard template without params or text message fallback
      payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      };
    }

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const msgId = response.data?.messages?.[0]?.id || 'meta_sent_' + Date.now();
    return {
      success: true,
      messageId: msgId,
      provider: 'META_CLOUD_API',
    };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: { message?: string } } }; message: string };
    const errMsg = axiosError.response?.data?.error?.message || axiosError.message || 'Unknown Meta API error';
    console.error('Meta WhatsApp Cloud API send failed:', errMsg);
    return {
      success: false,
      provider: 'META_CLOUD_API',
      error: errMsg,
    };
  }
}

async function sendViaCustomCrm(
  cleanPhone: string,
  options: SendMessageOptions
): Promise<WhatsAppSendResult> {
  const crmUrl = options.customCrmUrl || process.env.CUSTOM_CRM_API_URL;
  const crmKey = options.customCrmKey || process.env.CUSTOM_CRM_API_KEY;

  if (!crmUrl) {
    return {
      success: false,
      provider: 'CUSTOM_CRM',
      error: 'Custom CRM API URL is not configured.',
    };
  }

  try {
    const response = await axios.post(
      crmUrl,
      {
        phoneNumber: cleanPhone,
        message: options.bodyText,
        templateName: options.templateName,
        templateParameters: options.templateParameters,
      },
      {
        headers: {
          Authorization: crmKey ? `Bearer ${crmKey}` : undefined,
          'x-api-key': crmKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      messageId: response.data?.messageId || response.data?.id || 'crm_sent_' + Date.now(),
      provider: 'CUSTOM_CRM',
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Custom CRM WhatsApp API send failed:', err.message);
    return {
      success: false,
      provider: 'CUSTOM_CRM',
      error: err.message,
    };
  }
}
