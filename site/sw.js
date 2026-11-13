self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() || "Inviteora has an update." }; }
  const title = data.title || "Inviteora";
  const options = {
    body: data.body || "You have a new order update.",
    icon: "/retailhub-invitations/icons/icon-192.png",
    badge: "/retailhub-invitations/icons/icon-192.png",
    data: { url: data.url || "/retailhub-invitations/admin.html" },
    tag: data.tag || "inviteora-order",
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/retailhub-invitations/admin.html", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const client of list) if ("focus" in client) { client.navigate(target); return client.focus(); }
    return clients.openWindow(target);
  }));
});
