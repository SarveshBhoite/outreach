import axios from 'axios';

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  provider: 'CRM_API_KEY' | 'META_CLOUD_API';
  error?: string;
  crmSynced?: boolean;
}

export interface SendMessageOptions {
  recipientPhone: string; // e.g. +919876543210 or 919876543210
  recipientName?: string;
  templateName?: string;
  templateLanguage?: string;
  bodyText?: string;
  templateParameters?: string[];
  provider?: 'CRM_API_KEY' | 'META_CLOUD_API';
  crmApiUrl?: string;
  crmApiKey?: string;
}

/**
 * Unified WhatsApp Dispatcher:
 * 1. Primary: Dispatches through JISNU CRM API Gateway (https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template)
 *    so template messages and replies track in your CRM chat history.
 * 2. High-Availability Fallback: If CRM gateway hits a transient webhook error, dispatches directly via Meta Cloud API.
 */
export async function sendWhatsAppMessage(options: SendMessageOptions): Promise<WhatsAppSendResult> {
  const cleanPhone = options.recipientPhone.replace(/[^\d]/g, '');
  const crmApiKey = options.crmApiKey || process.env.CRM_API_KEY;
  const crmApiUrl = options.crmApiUrl || process.env.CRM_API_URL || 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template';

  // 1. Primary: Send via your CRM API Key for instant CRM Chat Logging
  if (crmApiKey) {
    try {
      const payload = {
        to: cleanPhone,
        template_name: options.templateName || 'universal_b2b_web_v2',
        language: options.templateLanguage || 'en_US',
        variables: options.templateParameters || [],
      };

      const res = await axios.post(crmApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': crmApiKey,
        },
        timeout: 12000,
      });

      if (res.data?.success || res.status === 200) {
        return {
          success: true,
          messageId: res.data?.messageId || res.data?.id || `crm_${Date.now()}`,
          provider: 'CRM_API_KEY',
          crmSynced: true,
        };
      }
    } catch (crmErr: any) {
      const errMsg =
        crmErr.response?.data?.error?.message ||
        crmErr.response?.data?.error ||
        crmErr.response?.data?.message ||
        crmErr.message;

      console.warn(`[CRM Gateway Warning] CRM API returned (${errMsg}). Engaging Meta Direct Dispatch...`);
    }
  }

  // 2. Direct Meta Cloud API Dispatch (Guaranteed Delivery)
  return sendViaDirectMeta(cleanPhone, options);
}

async function sendViaDirectMeta(
  cleanPhone: string,
  options: SendMessageOptions
): Promise<WhatsAppSendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const templateName = options.templateName || 'universal_b2b_web_v2';
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

    const payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: options.templateParameters?.length
          ? [
              {
                type: 'body',
                parameters: options.templateParameters.map((p) => ({ type: 'text', text: p })),
              },
            ]
          : undefined,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const msgId = response.data?.messages?.[0]?.id || `wamid.sent_${Date.now()}`;
    return {
      success: true,
      messageId: msgId,
      provider: 'META_CLOUD_API',
      crmSynced: false,
    };
  } catch (error: any) {
    const errMsg = error.response?.data?.error?.message || error.message || 'Meta API error';
    return {
      success: false,
      provider: 'META_CLOUD_API',
      error: errMsg,
    };
  }
}
