function getErrorMessage(result) {
  if (result?.detail) return result.detail;

  const validationMessage = Object.entries(result || {})
    .map(([field, value]) => {
      const message = Array.isArray(value) ? value.join(" ") : value;
      return `${field}: ${message}`;
    })
    .join(" ");

  return validationMessage || "We couldn’t send your enquiry. Please try again.";
}

export async function submitEnquiry(payload) {
  const response = await fetch("/api/enquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("We couldn’t read the showroom response. Please try again.");
  }

  if (!response.ok) throw new Error(getErrorMessage(result));
  return result;
}
