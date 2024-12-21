import axios from "axios";

const BASE_URL = "https://api.tradingeconomics.com";
const API_KEY =
  process.env.TRADING_ECONOMICS_API_KEY || "4805e1317d014a5:vn265pcdst33uzm";
/**
 * Fetch historical data for a given country and indicator.
 *
 * @param country - The country name (e.g., "USA").
 * @param indicator - The economic indicator (e.g., "GDP").
 * @param start_date - Start date for the data (default: "2011-01-01").
 * @param end_date - End date for the data (default: "2015-01-01").
 * @returns - A promise that resolves to an array of data or an empty array if an error occurs.
 */
export const fetchData = async (
  country: string,
  country1: string,
  indicator: string,
  start_date: string = "2011-01-01",
  end_date: string = "2019-01-01"
): Promise<any[]> => {
    const countries = country1 ? `${country},${country1}` : country;
  const url = `${BASE_URL}/historical/country/${countries}/indicator/${indicator}/${start_date}/${end_date}/?c=${API_KEY}`;

  try {
    console.log("Fetching data from:", url);
    const response = await axios.get<any[]>(url, {});

    if (response.status !== 200) {
      console.error(`Error: HTTP status ${response.status}`);
      return [];
    }

    return response.data.slice(0, -1); // Adjust as needed
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return [];
  }
};
