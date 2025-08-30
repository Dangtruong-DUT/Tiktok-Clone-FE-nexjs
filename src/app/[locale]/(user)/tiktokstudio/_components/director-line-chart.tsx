"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useMemo } from "react";
import { useGetUserIndicatorQuery } from "@/services/RTK/user.services";
import { UserIndicatorsData } from "@/types/response/stats.type";
import _ from "lodash";
import { cn } from "@/lib/utils";
import { formatCash } from "@/utils/formatting/formatNumber";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const description = "An interactive line chart";

const chartConfig = {
    users_view: {
        label: "User Views",
        color: "var(--chart-2)",
    },
    guests_view: {
        label: "Guest Views",
        color: "var(--chart-2)",
    },
    likes_count: {
        label: "Likes",
        color: "var(--chart-2)",
    },
    comments_count: {
        label: "Comments",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const getFromAndLastDate = (days: number) => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - days);
    return { from: from.toISOString(), to: to.toISOString() };
};

const daysSelection = [
    { value: "7", label: "Last 7 Days" },
    { value: "28", label: "Last 28 Days" },
    { value: "60", label: "Last 60 Days" },
    { value: "365", label: "Last 365 Days" },
] as const;

type daysSelectionType = (typeof daysSelection)[number]["value"];

export default function DirectorLineChart() {
    const [selectedDays, setSelectedDays] = useState<daysSelectionType>("7");
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("users_view");

    // Memoize rangeDay so query args stay stable unless selectedDays changes
    const rangeDay = useMemo(() => getFromAndLastDate(Number(selectedDays)), [selectedDays]);
    const { data } = useGetUserIndicatorQuery({
        fromDate: rangeDay.from,
        toDate: rangeDay.to,
    });

    const chartData = data?.data.Indicator || [];
    const total: Omit<UserIndicatorsData, "Indicator"> = _.omit(data?.data, ["Indicator"]);
    return (
        <div>
            <div className="text-base font-bold flex justify-between items-center">
                <span>Key Metrics</span>

                <Select value={selectedDays} onValueChange={(value) => setSelectedDays(value as daysSelectionType)}>
                    <SelectTrigger className="w-[180px] font-semibold">
                        <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                        {daysSelection.map((day) => (
                            <SelectItem key={day.value} value={day.value} className="font-semibold">
                                {day.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Card className="py-4 sm:py-0 rounded-lg! overflow-hidden mt-4">
                <div className="flex w-full">
                    {["users_view", "guests_view", "likes_count", "comments_count"].map((key) => {
                        const chart = key as keyof typeof chartConfig;
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className={cn(
                                    "data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1  px-6 py-4 text-left even:border-l border-b  sm:border-l sm:px-8 sm:py-6 ",
                                    {
                                        "border-t-4 border-t-[var(--chart-2)] border-b-0": activeChart === chart,
                                    }
                                )}
                                onClick={() => setActiveChart(chart)}
                            >
                                <span className=" font-semibold text-sm text-center ">{chartConfig[chart].label}</span>
                                <span
                                    className={cn(
                                        "text-lg leading-none font-bold sm:text-2xl text-center text-foreground ",
                                        {
                                            "text-[var(--chart-2)]": activeChart === chart,
                                        }
                                    )}
                                >
                                    {formatCash.format(total[key as keyof typeof total] ?? 0)}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <CardContent className="px-2 sm:p-6">
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    });
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[150px]"
                                        nameKey="views"
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            });
                                        }}
                                    />
                                }
                            />
                            <Line
                                dataKey={activeChart}
                                type="monotone"
                                stroke={`var(--color-${activeChart})`}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
