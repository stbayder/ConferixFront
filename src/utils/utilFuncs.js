import dayjs from "dayjs";

export default function formatDate(dateText){
    return dayjs(dateText).format("DD-MM-YY");
}

export function truncateName(name,chars) {
    return name.length > chars ? name.slice(0, chars) + '...' : name;
  }

export async function verifyToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return { valid: false };
  }

  try {
    const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/users/verify-token`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Token verification failed:", error);
    return { valid: false };
  }
}

export function getUsernameFromEmail(email) {
  return email.split("@")[0];
}