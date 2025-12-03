/**
 * Format number into Lakhs (L) or Thousands (K) with INR currency style
 * @param {number} num - The number to format
 * @returns {string} - Formatted string
 */
export function formatCurrencyShort(num:number): string {
    if (typeof num !== "number" || isNaN(num)) {
        throw new Error("Invalid input: Please provide a valid number.");
    }

    const absNum = Math.abs(num);
    let formatted;

    if (absNum >= 100000) {
        // Convert to Lakhs
        formatted = (num / 100000).toFixed(2).replace(/\.00$/, "") + " L";
    } else if (absNum >= 1000) {
        // Convert to Thousands
        formatted = (num / 1000).toFixed(2).replace(/\.00$/, "") + " K";
    } else {
        // Less than 1000, show as is
        formatted = num.toString();
    }

    return formatted;
}