"use client";
import { useEffect, useState } from "react";
import { fetchData } from "../../utils/api";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  red: {
    label: "Year",
    color: "hsl(var(--chart-1))",
  },
  blue: {
    label: "Blue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function Home() {
  const [indicator, setIndicator] = useState<string | undefined>();
  const [country, setCountry] = useState<string | undefined>();
  const [country1, setCountry1] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<{
    from: string | undefined;
    to: string | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInputs = () => {
    if (!country || !country1 || !indicator || !dateRange.from || !dateRange.to) {
      setError("All fields must be selected.");
      return false;
    }
    if (country === country1) {
      setError("Countries must be different.");
      return false;
    }
    setError(null); // Clear errors if validation passes
    return true;
  };

  const handleIndicatorChange = (value: string) => setIndicator(value);

  const handleCountryChange = (value: string) => setCountry(value);

  const handleCountry1Change = (value: string) => setCountry1(value);

  const handleDateChange = (date: DateRange | undefined) => {
    setDateRange({
      from: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      to: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
    });
  };

  const formatData = (data: any) => {
    const formatted: any = {};
    data.forEach((item: any) => {
      const dateTime = item.DateTime;
      if (!formatted[dateTime]) {
        formatted[dateTime] = { DateTime: dateTime };
      }
      const countryKey = item.Country.toLowerCase().replace(/\s+/g, "_");
      formatted[dateTime][countryKey] = item.Value;
    });
    return Object.values(formatted);
  };

  useEffect(() => {
    const fetchDataForRange = async () => {
      if (!validateInputs()) return;

      setLoading(true);

      const start_date = dateRange.from;
      const end_date = dateRange.to;

      try {
        const fetchedData = await fetchData(
          country!,
          country1!,
          indicator!,
          start_date!,
          end_date!
        );
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataForRange();
  }, [dateRange, country, country1, indicator]);

  return (
    <div className="p-4">
      <div className="text-center">
        <h4 className="text-lg uppercase">
          Comparison of {country || "Country"} & {country1 || "Country"} {indicator || "Indicator"} Data
        </h4>
      </div>

      <div className="flex-col gap-4 my-6">
        {error && <p className="text-red-600">{error}</p>}

        <label className="text-sm">Select Countries</label>
        <div className="flex gap-4">
          <Select onValueChange={handleCountryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Country 1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thailand">Thailand</SelectItem>
              <SelectItem value="mexico">Mexico</SelectItem>
              <SelectItem value="sweden">Sweden</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handleCountry1Change}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Country 2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thailand">Thailand</SelectItem>
              <SelectItem value="mexico">Mexico</SelectItem>
              <SelectItem value="sweden">Sweden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4 my-4">
          <Select onValueChange={handleIndicatorChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Indicator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gdp">GDP</SelectItem>
              <SelectItem value="population">Population</SelectItem>
            </SelectContent>
          </Select>

          <DatePickerWithRange onDateChange={handleDateChange} />
        </div>
      </div>

      <div className="my-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Card className="h-100">
            <CardHeader>
              <CardTitle className="uppercase">{indicator || "Indicator"} Line Chart</CardTitle>
              <CardDescription>
                {dateRange.from} to {dateRange.to}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={formatData(data)}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="DateTime"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 10)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    dataKey={country?.toLowerCase().replace(/\s+/g, "_")}
                    type="natural"
                    stroke="var(--color-red)"
                    strokeWidth={2}
                  />
                  <Line
                    dataKey={country1?.toLowerCase().replace(/\s+/g, "_")}
                    type="monotone"
                    stroke="var(--color-blue)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="leading-none text-muted-foreground">
                Showing data for the last {data.length / 2} years
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}