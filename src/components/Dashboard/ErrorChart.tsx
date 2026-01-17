import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ErrorFrequencyPoint } from '../../types';

interface ErrorChartProps {
    data: ErrorFrequencyPoint[];
}

export function ErrorChart({ data }: ErrorChartProps) {
    if (data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                No errors detected
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis
                    dataKey="timeSlot"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                    itemStyle={{ color: '#f87171' }}
                    cursor={{ fill: '#334155', opacity: 0.2 }}
                />
                <Bar dataKey="count" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
