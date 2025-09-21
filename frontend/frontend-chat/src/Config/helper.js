export function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const secondsAgo = Math.floor((now - past) / 1000);

  if (secondsAgo < 60) {
    return "just now";
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const pastDate = new Date(past.getFullYear(), past.getMonth(), past.getDate());

  if (today.getTime() === pastDate.getTime()) {
    return past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (yesterday.getTime() === pastDate.getTime()) {
    return "yesterday";
  }

  return past.toLocaleDateString();
}