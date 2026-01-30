import Hoa from "../models/Hoa.js";
import { stripe } from "../config/stripe.js";

const getHoaById = async (req, res) => {
  try {
    const { id } = req.params;
   // console.log("Received request for HOA ID:", id);
    //const hoa = await Hoa.findById(id);
    const qry = { hoaid: id };
     const hoa = await Hoa.findOne(qry);
    if (!hoa) {
      return res.status(404).json({ message: "HOA not found" });
    }
    //console.log("Fetched HOA:", hoa);
    res.json(hoa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHoas = async (req, res) => {
  try {
    const hoas = await Hoa.find();
    res.json(hoas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHoaById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
  //  console.log("Update HOA data received:", id,updateData);
    
    if (updateData.payment_ranges) {
      updateData.payment_ranges = updateData.payment_ranges.map(range => ({
        startDayMo: range.startDayMo,
        endDayMo: range.endDayMo,
        rate: range.rate,
        rate_2nd: range.rate_2nd,
        description: range.description
      }));
    }

    if (updateData.contact_information) {
      updateData.contact_information = updateData.contact_information.map(contact => ({
        contact_id: contact.contact_id,
        phone_number: contact.phone_number,
        phone_description: contact.phone_description,
        email: contact.email,
        display_category: contact.display_category
      }));
    }
    
    const hoa = await Hoa.findOneAndUpdate(
      { hoaid: id },
      updateData,
      { new: true }
    );
    
    if (!hoa) {
      return res.status(404).json({ message: "HOA not found" });
    }
    
    res.json(hoa);
  } catch (error) {
    console.error("Update HOA error:", error);
    res.status(500).json({ message: error.message });
  }
};

const createStripeConnectAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const hoa = await Hoa.findOne({ hoaid: id });

    if (!hoa) {
      return res.status(404).json({ message: "HOA not found" });
    }

    let accountId = hoa.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          hoaid: hoa.hoaid,
          hoaName: hoa.name
        }
      });
      accountId = account.id;
      hoa.stripeAccountId = accountId;
      await hoa.save();
    } else {
      // If account exists, ensure the capabilities are requested
      await stripe.accounts.update(accountId, {
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        }
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.CLIENT_URL}/${hoa.hoaid}/hoa-settings?stripe_onboarding=refresh`,
      return_url: `${process.env.CLIENT_URL}/${hoa.hoaid}/hoa-settings?stripe_onboarding=success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Create Stripe Connect Account error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getStripeAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const hoa = await Hoa.findOne({ hoaid: id });

    if (!hoa || !hoa.stripeAccountId) {
      return res.json({ onboardingComplete: false });
    }

    const account = await stripe.accounts.retrieve(hoa.stripeAccountId);
    
    // Check if transfers capability is active
    const transfersActive = account.capabilities && account.capabilities.transfers === 'active';
    
    // Onboarding is only truly "complete" for our purposes if they've submitted details
    // AND the transfers capability is active (so we can do destination charges)
    const isFullyReady = account.details_submitted && transfersActive;

    if (isFullyReady && !hoa.stripeOnboardingComplete) {
      hoa.stripeOnboardingComplete = true;
      await hoa.save();
    } else if (!isFullyReady && hoa.stripeOnboardingComplete) {
      // If for some reason they become restricted again, update our record
      hoa.stripeOnboardingComplete = false;
      await hoa.save();
    }

    res.json({ 
      onboardingComplete: isFullyReady,
      details_submitted: account.details_submitted,
      transfers_active: transfersActive,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements?.currently_due || []
    });
  } catch (error) {
    console.error("Get Stripe Account Status error:", error);
    res.status(500).json({ message: error.message });
  }
};

export { getHoaById, getHoas, updateHoaById, createStripeConnectAccount, getStripeAccountStatus };
