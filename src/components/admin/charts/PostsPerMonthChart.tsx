"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"

interface PostsPerMonthData {
  month: string
  posts: number
}

interface PostsPerMonthChartProps {
  data: PostsPerMonthData[]
}

export function PostsPerMonthChart({ data }: PostsPerMonthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px"
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Bar 
          dataKey="posts" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]}
          name="Posts"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
