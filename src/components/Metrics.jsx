import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { headlineStats } from '../data/content';
import { useTheme } from '../theme/ThemeProvider';
import { Counter, Reveal, SectionHeading, Spotlight, fadeUp, stagger } from './motion';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const palettes = {
  light: { strong: '#0f8a7e', mid: '#5b61d6', soft: '#e4e4df', text: '#5b5f68', grid: 'rgba(15,23,42,0.07)', tooltip: '#0c0d10', tooltipText: '#ffffff' },
  dark: { strong: '#3fd1bf', mid: '#9196f6', soft: '#262a31', text: '#a0a4ad', grid: 'rgba(255,255,255,0.06)', tooltip: '#ecedef', tooltipText: '#0a0b0e' },
};

const font = { family: 'Plus Jakarta Sans', size: 11, weight: '700' };

function ChartCard({ title, subtitle, badge, children }) {
  const ref = useRef(null);
  // Mount the chart only once it is visible so Chart.js plays its entry animation on scroll.
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <Spotlight className="bg-surface p-8 md:p-10 rounded-[2rem] border border-line shadow-soft hover:border-line-strong transition-colors">
      <div className="mb-8 flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-fg">{title}</h3>
          <p className="eyebrow text-subtle mt-1.5">{subtitle}</p>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-extrabold tracking-wider">{badge}</span>
      </div>
      <div ref={ref} className="relative w-full max-w-[600px] mx-auto h-[300px] md:h-[340px]">
        {inView && children}
      </div>
    </Spotlight>
  );
}

export default function Metrics() {
  const { theme } = useTheme();
  const c = palettes[theme];

  const tooltip = {
    backgroundColor: c.tooltip,
    titleColor: c.tooltipText,
    bodyColor: c.tooltipText,
    padding: 12,
    cornerRadius: 10,
    titleFont: font,
    bodyFont: font,
    displayColors: false,
  };

  const barData = {
    labels: ['Baseline (Early 2023)', 'Target Achievement'],
    datasets: [{ data: [50, 65], backgroundColor: [c.soft, c.strong], borderRadius: 14, barThickness: 56 }],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1400, easing: 'easeOutQuart', delay: (ctx) => ctx.dataIndex * 250 },
    plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: (i) => `CEI: ${i.raw}%` } } },
    scales: {
      y: { beginAtZero: true, max: 100, border: { display: false }, ticks: { font, color: c.text, callback: (v) => `${v}%` }, grid: { color: c.grid } },
      x: { grid: { display: false }, border: { display: false }, ticks: { font, color: c.text } },
    },
  };

  const doughnutData = {
    labels: ['Slippage Reduction', 'Roll Rate Stability', 'Standard Assets'],
    datasets: [{ data: [1.5, 15, 83.5], backgroundColor: [c.strong, c.mid, c.soft], borderWidth: 0, hoverOffset: 8, spacing: 2 }],
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '78%',
    animation: { animateRotate: true, animateScale: true, duration: 1600, easing: 'easeOutQuart' },
    plugins: {
      tooltip: { ...tooltip, callbacks: { label: (i) => `${i.label}: ${i.raw}%` } },
      legend: { position: 'bottom', labels: { font, color: c.text, usePointStyle: true, pointStyle: 'circle', padding: 22 } },
    },
  };

  return (
    <section id="impact" className="relative py-28 px-6 bg-surface-2/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-10">
          <SectionHeading eyebrow="Impact" title="Executive Performance Metrics">
            Quantifying the impact of collection strategy design and credit risk management on the credit card book at FPL Technologies (OneCard).
          </SectionHeading>

          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-3 w-full md:flex md:w-auto bg-surface p-2 rounded-2xl border border-line shadow-soft self-start md:self-auto"
          >
            {headlineStats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className={`px-2 sm:px-6 py-3 text-center ${i < headlineStats.length - 1 ? 'border-r border-line' : ''}`}
              >
                <div className="text-xl sm:text-2xl font-extrabold text-gradient whitespace-nowrap">
                  <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </div>
                <div className="eyebrow !text-[9px] text-subtle mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal>
            <ChartCard title="Collection Efficiency Index (CEI)" subtitle="Growth tracking at OneCard" badge="HISTORIC TREND">
              <Bar data={barData} options={barOptions} />
            </ChartCard>
          </Reveal>
          <Reveal delay={0.12}>
            <ChartCard title="Risk Distribution & Stability" subtitle="Slippage vs. Forward Roll Controls" badge="REAL-TIME RISK">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </ChartCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
