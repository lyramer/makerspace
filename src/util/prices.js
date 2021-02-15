// Map our custom plan IDs ("basic", "premium", etc) to Stripe price IDs
const stripePriceIds = {
  student: process.env.REACT_APP_STRIPE_PRICE_STUDENT,
  regular: process.env.REACT_APP_STRIPE_PRICE_REGULAR,
  gratis: process.env.REACT_APP_STRIPE_PRICE_GRATIS,
};

// Get Stripe priceId
export function getStripePriceId(planId) {
  console.log("plANS ARE:", stripePriceIds)
  console.log(process.env)
  return stripePriceIds[planId];
}

// Get friendly plan ID ("basic", "premium", etc) by Stripe plan ID
// Used in auth.js to include planId in the user object
export function getFriendlyPlanId(stripePriceId) {
  return Object.keys(stripePriceIds).find(
    (key) => stripePriceIds[key] === stripePriceId
  );
}
