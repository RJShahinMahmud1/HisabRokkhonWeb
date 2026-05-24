import React from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function ReportsView() {
  const { transactions, categories, isDark } = useAppStore();

  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  // Expenses grouped by category
  const expenseByCategory = expenseTransactions.reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([catId, amount]) => {
    const cat = categories.find(c => c.id === catId);
    return {
      name: cat ? cat.name : 'Unknown',
      value: amount as number,
    };
  }).sort((a, b) => Number(b.value) - Number(a.value));

  const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#2dd4bf', '#fb923c'];

  // Income vs Expense per month
  const monthlyData: Record<string, { income: number, expense: number, name: string }> = {};
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthYear = `${date.toLocaleString('bn-BD', { month: 'short' })} '${date.getFullYear().toString().substring(2)}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { name: monthYear, income: 0, expense: 0 };
    }
    
    if (t.type === 'income') monthlyData[monthYear].income += t.amount;
    if (t.type === 'expense') monthlyData[monthYear].expense += t.amount;
  });

  const barData = Object.values(monthlyData).slice(-6); // last 6 months
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">রিপোর্ট ও বিশ্লেষণ</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ক্যাটাগরি অনুযায়ী ব্যয়</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `৳ ${value}`} 
                    contentStyle={{ borderRadius: '16px', border: 'none', background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', color: isDark ? '#fff' : '#0f172a' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                পর্যাপ্ত ডাটা নেই
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>আয় বনাম ব্যয় (মাসিক)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" tick={{fill: tickColor}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `৳${val/1000}k`} tick={{fill: tickColor}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} 
                    formatter={(value) => `৳ ${value}`} 
                    contentStyle={{ borderRadius: '16px', border: 'none', background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', color: isDark ? '#fff' : '#0f172a' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="আয়" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="ব্যয়" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                পর্যাপ্ত ডাটা নেই
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
