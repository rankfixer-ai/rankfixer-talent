// ============================================================
// js/trends.js â€” Job Market Trends (static data)
// ============================================================
var Trends = {
  inited: false,
  init: function(){
    if(Trends.inited) return; Trends.inited=true;
    var con = App.$('trends-content');
    if(!con) return;
    con.innerHTML = `
      <div class="trends-kpi-grid">
        <div class="kpi-card accent-card"><div class="kpi-badge up">â†‘ +18%</div><div class="kpi-num">3,604</div><div class="kpi-label">Active job listings this month</div></div>
        <div class="kpi-card"><div class="kpi-badge up">â†‘ +24%</div><div class="kpi-num">228</div><div class="kpi-label">New remote openings this week</div></div>
        <div class="kpi-card"><div class="kpi-badge up">â†‘ +11%</div><div class="kpi-num">â‚±32K</div><div class="kpi-label">Avg. monthly salary (tech roles)</div></div>
        <div class="kpi-card"><div class="kpi-badge down">â†“ âˆ’5%</div><div class="kpi-num">4.2d</div><div class="kpi-label">Avg. days to first interview</div></div>
      </div>
      <div class="trends-2col">
        <div class="trend-card"><div class="trend-card-title">ðŸ“Š Most In-Demand Jobs</div>
          <div class="trend-row"><div class="trend-rank top">1</div><div class="trend-name">Customer Service Rep (CSR)</div><div class="trend-pct orange">+32%</div></div>
          <div class="trend-row"><div class="trend-rank top">2</div><div class="trend-name">Virtual Assistant (VA)</div><div class="trend-pct orange">+28%</div></div>
          <div class="trend-row"><div class="trend-rank top">3</div><div class="trend-name">Social Media Manager</div><div class="trend-pct green">+21%</div></div>
          <div class="trend-row"><div class="trend-rank">4</div><div class="trend-name">Data Entry Specialist</div><div class="trend-pct green">+15%</div></div>
          <div class="trend-row"><div class="trend-rank">5</div><div class="trend-name">Software Developer</div><div class="trend-pct green">+14%</div></div>
        </div>
        <div class="trend-card"><div class="trend-card-title">ðŸ™ï¸ Top Hiring Cities</div>
          <div class="trend-row"><div class="trend-rank top">1</div><div class="trend-name">Metro Manila / NCR</div><div class="trend-pct orange">1,842 jobs</div></div>
          <div class="trend-row"><div class="trend-rank top">2</div><div class="trend-name">Cebu City</div><div class="trend-pct green">612 jobs</div></div>
          <div class="trend-row"><div class="trend-rank top">3</div><div class="trend-name">Davao City</div><div class="trend-pct green">381 jobs</div></div>
          <div class="trend-row"><div class="trend-rank">4</div><div class="trend-name">Clark / Angeles City</div><div class="trend-pct green">214 jobs</div></div>
          <div class="trend-row"><div class="trend-rank">5</div><div class="trend-name">Iloilo City</div><div class="trend-pct green">188 jobs</div></div>
        </div>
        <div class="trend-card"><div class="trend-card-title">ðŸš€ Fastest Growing Roles</div>
          <div class="trend-row"><div class="trend-rank top">1</div><div class="trend-name">AI Prompt Engineer</div><div class="trend-pct orange">+89%</div></div>
          <div class="trend-row"><div class="trend-rank top">2</div><div class="trend-name">E-Commerce Manager</div><div class="trend-pct orange">+54%</div></div>
          <div class="trend-row"><div class="trend-rank top">3</div><div class="trend-name">Video Editor / Content Creator</div><div class="trend-pct green">+42%</div></div>
          <div class="trend-row"><div class="trend-rank">4</div><div class="trend-name">UX/UI Designer</div><div class="trend-pct green">+31%</div></div>
          <div class="trend-row"><div class="trend-rank">5</div><div class="trend-name">Cybersecurity Analyst</div><div class="trend-pct green">+28%</div></div>
        </div>
        <div class="trend-card"><div class="trend-card-title">ðŸ’° Highest Paying Remote Roles</div>
          <div class="trend-row"><div class="trend-rank top">1</div><div class="trend-name">Software Developer</div><div class="trend-pct orange">â‚±40Kâ€“80K</div></div>
          <div class="trend-row"><div class="trend-rank top">2</div><div class="trend-name">IT Solutions Architect</div><div class="trend-pct orange">â‚±60Kâ€“100K</div></div>
          <div class="trend-row"><div class="trend-rank top">3</div><div class="trend-name">Digital Marketing Manager</div><div class="trend-pct green">â‚±35Kâ€“60K</div></div>
          <div class="trend-row"><div class="trend-rank">4</div><div class="trend-name">Virtual Assistant (Senior)</div><div class="trend-pct green">$800â€“1,500</div></div>
          <div class="trend-row"><div class="trend-rank">5</div><div class="trend-name">Graphic / UI Designer</div><div class="trend-pct green">â‚±25Kâ€“45K</div></div>
        </div>
      </div>
      <div class="ratio-section"><div class="ratio-title">Remote vs. On-site Ratio</div>
        <div class="ratio-bar-wrap"><div class="ratio-remote" style="width:37%">37% Remote</div><div class="ratio-onsite">63% On-site / Hybrid</div></div>
        <div class="ratio-legend"><span><span class="ratio-dot" style="background:var(--accent)"></span>Remote / WFH â€” 1,334 jobs</span><span><span class="ratio-dot" style="background:var(--surface-alt);border:1px solid var(--border)"></span>On-site / Hybrid â€” 2,270 jobs</span></div>
      </div>`;
  }
};

