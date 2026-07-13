import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import { getAnalytics } from '../lib/api'

const BAND_COLORS = {
  'Strong (75-100%)': '#059669',
  'Moderate (50-74%)': '#F59E0B',
  'Weak (below 50%)': '#EF4444',
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-bg-surface border border-border rounded-card p-4">
      <h2 className="text-[15px] font-medium text-text-primary leading-[1.4]">{title}</h2>
      {subtitle && <p className="text-[12px] text-text-muted mt-0.5 mb-4">{subtitle}</p>}
      {children}
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const hasData = data && data.score_distribution.some((b) => b.count > 0)

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Analytics</h1>
        <p className="text-[13px] text-text-muted mt-1">Insights across your job postings and candidate pool</p>
      </header>

      {loading && <p className="text-[13px] text-text-muted">Loading analytics...</p>}

      {!loading && !hasData && (
        <p className="text-[13px] text-text-muted">
          No data to analyse yet. Create job postings and upload resumes to see insights here.
        </p>
      )}

      {!loading && hasData && (
        <div className="flex flex-col gap-4">
          <ChartCard
            title="Candidate score distribution"
            subtitle="What proportion of your candidate pool falls into each match quality band"
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.score_distribution.filter((b) => b.count > 0)}
                  dataKey="count"
                  nameKey="band"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.score_distribution
                    .filter((b) => b.count > 0)
                    .map((entry) => (
                      <Cell key={entry.band} fill={BAND_COLORS[entry.band] || '#185FA5'} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E4E9' }}
                  formatter={(value, name) => [`${value} candidate${value === 1 ? '' : 's'}`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-2 gap-4">
            <ChartCard
              title="Candidates per job posting"
              subtitle="Which roles are attracting the most applicants"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={data.per_job}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E4E9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="job_title"
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E4E9' }}
                    cursor={{ fill: '#F4F5F7' }}
                  />
                  <Bar dataKey="candidates" name="Candidates" fill="#185FA5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Average match score per job"
              subtitle="Which roles are attracting well-matched candidates"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={data.per_job}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E4E9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="job_title"
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E4E9' }}
                    cursor={{ fill: '#F4F5F7' }}
                    formatter={(v) => `${v}%`}
                  />
                  <Bar dataKey="avg_score" name="Avg score" radius={[0, 4, 4, 0]}>
                    {data.per_job.map((entry) => (
                      <Cell
                        key={entry.job_title}
                        fill={entry.avg_score >= 75 ? '#059669' : entry.avg_score >= 50 ? '#F59E0B' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  )
}
