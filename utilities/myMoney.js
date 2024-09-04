class myMoney {
    /**
 * Converts a price from x to cents.
 * 
 * @param {number|string} price - The price in x. Can be a number or a string.
 * @returns {number} - The price in cents as an integer.
 * @throws {Error} - Throws an error if the input is not a valid number.
 */
    toCents(price) {
        // Ensure the price is a number or a valid numeric string
        const priceInNumber = parseFloat(price);
        if (isNaN(priceInNumber)) {
            throw new Error("Invalid price input. Please provide a valid number.");
        }
        return Math.round(priceInNumber * 100);
    }



    /**
  * Converts a price from cents to the original currency value.
  * 
  * @param {number} cents - The price in cents as an integer.
  * @param {number} [fractionDigits=2] - The number of decimal places to use in the output (default is 2).
  * @returns {string} - The price in the original currency as a string formatted to the specified decimal places.
  * @throws {Error} - Throws an error if the input is not a valid integer.
  */
    toCurrency(cents, fractionDigits = 2) {
        // Ensure the cents value is a valid integer
        if (!Number.isInteger(cents)) {
            throw new Error("Invalid cents input. Please provide a valid integer.");
        }

        // Convert to the original currency value and format to the specified decimal places
        return (cents / 100).toFixed(fractionDigits);
    }

}
module.exports = new myMoney();