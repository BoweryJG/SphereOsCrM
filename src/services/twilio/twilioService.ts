import { supabase } from '../supabase/supabase';
import { Contact } from '../../types/models';
import { Device } from '@twilio/voice-sdk';

// Helper function to validate if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Twilio API configuration
const TWILIO_FUNCTION_URL = process.env.REACT_APP_TWILIO_FUNCTION_URL || '';
const TWILIO_API_KEY = process.env.REACT_APP_TWILIO_API_KEY || '';

// Store our Twilio Device instance
let device: Device | null = null;

/**
 * Interface for call parameters
 */
interface CallParams {
  to: string;
  from: string;
  contactId: string;
  practiceId: string;
  userId: string;
  callbackUrl?: string;
  personalNumber?: string;
}

/**
 * Interface for browser call parameters
 */
interface BrowserCallParams {
  to: string;
  contactId: string;
  practiceId: string;
  userId: string;
}

/**
 * Interface for call response
 */
interface CallResponse {
  success: boolean;
  callSid?: string;
  error?: string;
}

/**
 * Interface for call status update
 */
interface CallStatusUpdate {
  callSid: string;
  status: string;
  duration?: number;
}

/**
 * Initiates a call using Twilio
 * @param params Call parameters
 * @returns Call response with success status and call SID if successful
 */
export const initiateCall = async (params: CallParams): Promise<CallResponse> => {
  try {
    // Validate phone number format
    const formattedTo = formatPhoneNumber(params.to);
    if (!formattedTo) {
      return { success: false, error: 'Invalid phone number format' };
    }

    // Make API call to Twilio Function
    // TWILIO_FUNCTION_URL should be the complete URL to the Netlify function
    const response = await fetch(TWILIO_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TWILIO_API_KEY}`
      },
      body: JSON.stringify({
        to: formattedTo,
        from: params.from,
        callbackUrl: params.callbackUrl || `${window.location.origin}/call-callback`,
        personalNumber: params.personalNumber // Pass the personal number to connect to
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to initiate call');
    }

    // Log technical call details in twilio_calls
    await logCallActivity({
      contactId: params.contactId,
      practiceId: params.practiceId,
      userId: params.userId,
      callSid: data.callSid,
      status: 'initiated', // Twilio call status, e.g., 'initiated', 'ringing', 'answered', 'completed'
      fromNumber: params.from, // The number calling from (your Twilio number)
      toNumber: formattedTo,   // The number being called
      direction: 'outbound'    // Since this is an app-initiated call
    });
    
    // Also create a higher-level activity record in sales_activities table
    // This keeps the app's activity tracking system consistent
    await logSalesActivity({
      contactId: params.contactId,
      notes: `Outbound call to ${formattedTo}`,
      callSid: data.callSid  // Store callSid in notes for reference
    });

    return {
      success: true,
      callSid: data.callSid
    };
  } catch (error) {
    console.error('Error initiating call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Updates call status in the twilio_calls table
 * @param update Call status update information
 * @returns Success status
 */
export const updateCallStatus = async (update: CallStatusUpdate): Promise<boolean> => {
  try {
    const { callSid, status, duration } = update;

    // Maps to 'status' and 'duration' columns in 'twilio_calls' table
    const { error } = await supabase
      .from('twilio_calls') // Changed table name
      .update({
        status: status,       // Maps to 'status' column in twilio_calls
        duration: duration || 0, // Maps to 'duration' column in twilio_calls
        updated_at: new Date().toISOString()
      })
      .eq('call_sid', callSid);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating call status:', error);
    return false;
  }
};

/**
 * Logs a call activity in the twilio_calls table (technical Twilio details)
 * @param params Call activity parameters
 * @returns Success status
 */
interface LogCallActivityParams {
  contactId: string;         // Will be stored in metadata
  practiceId: string;        // Will be stored in metadata
  userId: string;            // Maps to user_id
  callSid: string;           // Maps to call_sid
  status: string;            // Maps to status (e.g., 'initiated', 'completed')
  fromNumber: string;        // Maps to from_number
  toNumber: string;          // Maps to to_number
  direction: 'inbound' | 'outbound'; // Maps to direction
  notes?: string;            // Will be stored in metadata
}

export const logCallActivity = async (params: LogCallActivityParams): Promise<boolean> => {
  try {
    const { 
      contactId, 
      practiceId, 
      userId, 
      callSid, 
      status, 
      fromNumber, 
      toNumber, 
      direction, 
      notes 
    } = params;

    // Check if we're using mock/test data
    if (!isValidUUID(userId)) {
      console.warn(`Found non-UUID userId "${userId}", skipping database insert`);
      return true; // Return success but don't attempt to save to the database
    }

    const metadata = {
      contact_id: contactId,
      practice_id: practiceId,
      notes: notes || 'Phone call initiated by application.',
      // any other details from original 'details: { phoneNumber }' can be added if needed
    };

    const { error } = await supabase
      .from('twilio_calls') // Changed table name
      .insert({
        call_sid: callSid,
        from_number: fromNumber,
        to_number: toNumber,
        direction: direction,
        status: status,
        user_id: userId, // Assuming this is the application user who initiated
        metadata: metadata,
        // 'created_at' and 'updated_at' should have default values in DB
        // 'duration' will be updated later by webhook
        // 'phone_number_sid', 'recording_url', 'recording_sid', 'transcription_id' are nullable or set later
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error logging call activity:', error);
    return false;
  }
};

/**
 * Formats a phone number to E.164 format
 * @param phoneNumber Phone number to format
 * @returns Formatted phone number or null if invalid
 */
export const formatPhoneNumber = (phoneNumber: string): string | null => {
  // Remove all non-numeric characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Check if the number is valid
  if (digitsOnly.length < 10) {
    return null;
  }

  // For US numbers
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }

  // For international numbers that already have country code
  if (digitsOnly.length > 10) {
    return `+${digitsOnly}`;
  }

  return null;
};

/**
 * Makes a browser-based call to a contact using Twilio Client
 * @param contact Contact to call
 * @param userId Current user ID
 * @returns Call response
 */
export const callContact = async (contact: Contact, userId: string): Promise<CallResponse> => {
  try {
    // Initialize the Device if not already done
    if (!device) {
      const initialized = await initializeTwilioDevice(userId);
      if (!initialized) {
        return {
          success: false,
          error: 'Failed to initialize Twilio device'
        };
      }
    }

    // Ensure the contact has a phone number
    if (!contact.phone) {
      return {
        success: false,
        error: 'Contact has no phone number'
      };
    }
    
    // Make the call using the browser
    return makeCallFromBrowser({
      to: contact.phone,
      contactId: contact.id,
      practiceId: contact.practice_id || 'unknown',
      userId: userId
    });
  } catch (error) {
    console.error('Error in callContact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Initialize the Twilio Device for browser-based calling
 * @param userId User ID for the token
 * @returns Success flag
 */
export const initializeTwilioDevice = async (userId: string): Promise<boolean> => {
  try {
    let tokenData = null;
    
    // Only try local development server in development mode
    if (process.env.NODE_ENV === 'development') {
      try {
        const localResponse = await fetch(`http://localhost:3000/token?identity=${encodeURIComponent(userId)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (localResponse.ok) {
          tokenData = await localResponse.json();
          console.log('Successfully obtained token from local development server');
        }
      } catch (localError) {
        console.log('Local token server not available, falling back to Netlify function');
      }
    }
    
    // If local server failed, try the Netlify function
    if (!tokenData) {
      const netlifyResponse = await fetch('/.netlify/functions/initiate-twilio-call/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: userId })
      });
      
      if (!netlifyResponse.ok) {
        const error = await netlifyResponse.json();
        throw new Error(error.error || 'Failed to get access token from Netlify function');
      }
      
      tokenData = await netlifyResponse.json();
      console.log('Successfully obtained token from Netlify function');
    }
    
    if (!tokenData || !tokenData.token) {
      throw new Error('No token received from any source');
    }
    
    const token = tokenData.token;
    
    // Initialize the Twilio Device with the token
    device = new Device(token);
    
    // Listen for incoming calls
    device.on('incoming', (call) => {
      // Handle incoming calls - you would show a UI to accept/reject the call
      console.log('Incoming call from:', call.parameters.From);
      
      // You could trigger a notification here or update your UI
      // For now, we'll just auto-accept the call
      call.accept();
    });
    
    // Add additional event listeners
    device.on('error', (error) => {
      console.error('Twilio Device Error:', error);
    });
    
    await device.register();
    return true;
  } catch (error) {
    console.error('Error initializing Twilio device:', error);
    return false;
  }
};

/**
 * Make a call directly from the browser using Twilio Client
 * @param params Call parameters
 * @returns Call response
 */
export const makeCallFromBrowser = async (params: BrowserCallParams): Promise<CallResponse> => {
  try {
    if (!device) {
      return {
        success: false,
        error: 'Twilio device not initialized'
      };
    }
    
    // Format the phone number
    const formattedTo = formatPhoneNumber(params.to);
    if (!formattedTo) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }
    
    // Make the call
    const call = await device.connect({
      params: {
        To: formattedTo,
        ContactId: params.contactId,
        PracticeId: params.practiceId,
        UserId: params.userId
      }
    });
    
    // Log the call in your database
    logCallActivity({
      contactId: params.contactId,
      practiceId: params.practiceId,
      userId: params.userId,
      callSid: call.parameters.CallSid || 'browser-call-' + Date.now(),
      status: 'initiated',
      fromNumber: 'browser',
      toNumber: formattedTo,
      direction: 'outbound'
    });
    
    // Also create a higher-level activity record
    logSalesActivity({
      contactId: params.contactId,
      notes: `Browser-based call to ${formattedTo}`,
      callSid: call.parameters.CallSid
    });
    
    return {
      success: true,
      callSid: call.parameters.CallSid
    };
  } catch (error) {
    console.error('Error making browser call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Fetches call history for a contact
 * @param contactId Contact ID
 * @returns Call history
 */
/**
 * Logs a general sales activity in the sales_activities table (for general activity tracking)
 * @param params Parameters for the sales activity
 * @returns Success status
 */
interface SalesActivityParams {
  contactId: string;
  notes?: string;
  callSid?: string; // Optional, to reference the related twilio_calls record
  outcome?: string;
  duration?: number;
}

export const logSalesActivity = async (params: SalesActivityParams): Promise<boolean> => {
  try {
    const { contactId, notes, callSid, outcome, duration } = params;
    
    // Check if we're using mock/test data
    if (!isValidUUID(contactId)) {
      console.warn(`Found non-UUID contactId "${contactId}", skipping database insert`);
      return true; // Return success but don't attempt to save to the database
    }
    
    // Format notes to include callSid reference if provided
    const formattedNotes = callSid 
      ? `${notes || 'Phone call'} (Call ID: ${callSid})`
      : notes || 'Phone call';
    
    const { error } = await supabase
      .from('sales_activities')
      .insert({
        type: 'call',
        contact_id: contactId,
        date: new Date().toISOString(),
        duration: duration,
        notes: formattedNotes,
        outcome: outcome
        // created_at and updated_at will use DB defaults
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error logging sales activity:', error);
    return false;
  }
};

/**
 * Fetches call history for a contact
 * @param contactId Contact ID
 * @returns Call history
 */
/**
 * Disconnect the active browser call
 */
export const disconnectCall = (): void => {
  if (device) {
    device.disconnectAll();
  }
};

/**
 * The original server-based call initiation (kept for backup/compatibility)
 */
export const initiateServerCall = async (params: CallParams): Promise<CallResponse> => {
  try {
    // Validate phone number format
    const formattedTo = formatPhoneNumber(params.to);
    if (!formattedTo) {
      return { success: false, error: 'Invalid phone number format' };
    }

    // Make API call to Twilio Function
    // TWILIO_FUNCTION_URL should be the complete URL to the Netlify function
    const TWILIO_FUNCTION_URL = process.env.REACT_APP_TWILIO_FUNCTION_URL || '';
    const TWILIO_API_KEY = process.env.REACT_APP_TWILIO_API_KEY || '';
    
    const response = await fetch(TWILIO_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TWILIO_API_KEY}`
      },
      body: JSON.stringify({
        to: formattedTo,
        from: params.from,
        callbackUrl: params.callbackUrl || `${window.location.origin}/call-callback`,
        personalNumber: params.personalNumber
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to initiate call');
    }

    // Log call details
    await logCallActivity({
      contactId: params.contactId,
      practiceId: params.practiceId,
      userId: params.userId,
      callSid: data.callSid,
      status: 'initiated',
      fromNumber: params.from,
      toNumber: formattedTo,
      direction: 'outbound'
    });
    
    await logSalesActivity({
      contactId: params.contactId,
      notes: `Outbound call to ${formattedTo}`,
      callSid: data.callSid
    });

    return {
      success: true,
      callSid: data.callSid
    };
  } catch (error) {
    console.error('Error initiating server call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const fetchCallHistory = async (contactId: string) => {
  try {
    // Query the sales_activities table for call activities
    // This matches the original behavior and works with QuickCallWidget
    const { data, error } = await supabase
      .from('sales_activities')
      .select('*')
      .eq('contact_id', contactId)
      .eq('type', 'call')
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching call history:', error);
    return { data: null, error };
  }
};
