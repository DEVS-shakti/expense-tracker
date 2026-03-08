export const getUserDisplayName = (user) => {
  if (!user) return "User";

  const name = user.displayName?.trim();
  if (name) return name;

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "User";
};

export const getUserInitials = (user) => {
  const fullName = getUserDisplayName(user);
  const parts = fullName.split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};
