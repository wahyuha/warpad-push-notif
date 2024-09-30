let subscriptions = [];

export function saveSubscription(subscription) {
  subscriptions.push(subscription);
}

export function getSubscriptions() {
  return subscriptions;
}
