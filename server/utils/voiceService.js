import twilio from 'twilio';

export const triggerTamilDispatch = async (phone, name, vID) => {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        console.log(`☎️ Initiating Twilio Voice Flow for ${name}...`);
        
        await client.studio.v2.flows(process.env.TWILIO_FLOW_SID)
            .executions
            .create({
                to: phone, // +918148560644
                from: process.env.TWILIO_PHONE_NUMBER, // +19804002746
                parameters: {
                    driverName: name, // This replaces {{flow.data.driverName}} in Twilio
                    vehicleID: vID    // This replaces {{flow.data.vehicleID}} in Twilio
                }
            });

        console.log(`📞 Call successfully queued via Twilio Flow: ${process.env.TWILIO_FLOW_SID}`);
    } catch (err) {
        console.error("❌ Twilio Service Error:", err.message);
        throw err; // Propagate to controller for logging
    }
};