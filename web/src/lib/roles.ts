export const isStaff = (role?: string) =>
  role === "admin" || role === "instructor";
export const homePath = (role?: string) =>
  isStaff(role) ? "/admin" : "/dashboard";
