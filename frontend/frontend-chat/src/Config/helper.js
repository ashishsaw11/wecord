export function timeAgo(date) {
  // Get current time and convert to IST (add 5 hours 30 minutes)
  const now = new Date();
  const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Convert input date to IST (add 5 hours 30 minutes)
  const past = new Date(date);
  const istPast = new Date(past.getTime() + (5.5 * 60 * 60 * 1000));
  
  const secondsAgo = Math.floor((istNow - istPast) / 1000);
  
  if (secondsAgo < 60) {
    return "just now";
  }
  
  // Create date objects for comparison (IST dates)
  const today = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
  const pastDate = new Date(istPast.getFullYear(), istPast.getMonth(), istPast.getDate());
  
  if (today.getTime() === pastDate.getTime()) {
    return istPast.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  const yesterday = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate() - 1);
  if (yesterday.getTime() === pastDate.getTime()) {
    return "yesterday";
  }
  
  return istPast.toLocaleDateString('en-IN');
}