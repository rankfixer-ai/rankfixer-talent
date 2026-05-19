
var EmployersFeatured = {
  init:function(){
    $('page-employers-featured').innerHTML = `
      <div class="page-hdr">
        <h1>🏢 Top Employers</h1>
        <p>Companies actively hiring now.</p>
      </div>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-badge">Featured Employer</div>
          <h3>RemoteHub PH</h3>
          <p>Hiring remote support agents and VAs.</p>
        </div>
      </div>
    `;
  }
};
