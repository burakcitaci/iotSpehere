import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';

const generatePastMonthChartData = () => {
  const chartData = [];
  const today = new Date();

  // Helper function to generate realistic IoT hub connection data
  const generateDataPoint = (date: Date) => {
    // Create some variation based on day of week (weekends have different patterns)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Base values with some randomness
    const baseConnectedDevices = isWeekend
      ? 15 + Math.round(Math.random() * 10)
      : 20 + Math.round(Math.random() * 15);
    const baseDataTransferred = isWeekend
      ? 12 + Math.random() * 12
      : 18 + Math.random() * 20;

    // Add some correlation with periodic patterns
    const dayOfMonth = date.getDate();
    const periodicFactor = Math.sin(dayOfMonth / 5) * 5;

    return {
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      connectedDevices: Math.round(baseConnectedDevices + periodicFactor),
      dataTransferred: Number(
        (baseDataTransferred + periodicFactor * 0.8).toFixed(1)
      ),
    };
  };

  // Generate data for past 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    chartData.push(generateDataPoint(date));
  }

  return chartData;
};

const chartData = generatePastMonthChartData();

const chartConfig = {
  connectedDevices: {
    label: 'Connected Devices',
    color: 'var(--chart-1)',
  },
  dataTransferred: {
    label: 'Data Transferred (MB)',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('30d');

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>IoT Hub Performance</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            {timeRange === '90d' && 'Total for the last 3 months'}
            {timeRange === '30d' && 'Total for the last 30 days'}
            {timeRange === '7d' && 'Total for the last 7 days'}
          </span>
          <span className="@[540px]/card:hidden">
            {timeRange === '90d' && 'Last 3 months'}
            {timeRange === '30d' && 'Last 30 days'}
            {timeRange === '7d' && 'Last 7 days'}
          </span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.dataTransferred.color}
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.dataTransferred.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.connectedDevices.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.connectedDevices.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="connectedDevices"
              type="natural"
              fill="url(#fillMobile)"
              stroke={chartConfig.connectedDevices.color}
              stackId="a"
            />
            <Area
              dataKey="dataTransferred"
              type="natural"
              fill="url(#fillDesktop)"
              stroke={chartConfig.dataTransferred.color}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
