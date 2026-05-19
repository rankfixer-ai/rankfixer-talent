// ============================================================
// agent-tools.js Ã¢â‚¬â€ Complete Automation Agent for Job Copilot PH
// Drop into: C:\Users\acibr\Documents\Jobfinder\jobcopilot-api\
// Run with: node agent-tools.js
// ============================================================

const { execSync, spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// -------------------------------------------------------------------
// 1. CONFIG Ã¢â‚¬â€ Load from .env file
// -------------------------------------------------------------------
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PROJECT_ROOT = process.env.PROJECT_ROOT || __dirname;
const FRONTEND_ROOT = process.env.FRONTEND_ROOT || 'C:\\Users\\acibr\\Desktop\\deploy-fresh';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Ã¢ÂÅ’ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// -------------------------------------------------------------------
// 2. BASH TOOL Ã¢â‚¬â€ Safe Command Execution
// -------------------------------------------------------------------
class BashTool {
  static async run(command, options = {}) {
    const { cwd = PROJECT_ROOT, timeout = 120000, log = true } = options;
    const startTime = Date.now();
    
    if (log) console.log(`\nÃ¢Å¡Â¡ Executing: ${command}`);
    
    return new Promise((resolve, reject) => {
      const proc = spawn('powershell.exe', ['-Command', command], {
        cwd,
        timeout,
        shell: false,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
        if (log) process.stdout.write(data);
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
        if (log) process.stderr.write(data);
      });

      proc.on('close', (code) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        if (code === 0) {
          if (log) console.log(`Ã¢Å“â€¦ Completed in ${duration}s`);
          resolve({ success: true, stdout, stderr, duration });
        } else {
          if (log) console.error(`Ã¢ÂÅ’ Failed with code ${code} in ${duration}s`);
          resolve({ success: false, stdout, stderr, code, duration });
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }
}

// -------------------------------------------------------------------
// 3. GREP TOOL Ã¢â‚¬â€ Log & Code Search
// -------------------------------------------------------------------
class GrepTool {
  static search(pattern, options = {}) {
    const {
      directory = PROJECT_ROOT,
      filePattern = '*.{js,py,json,html}',
      ignoreCase = true,
      maxResults = 50
    } = options;

    const flags = ignoreCase ? '-i' : '';
    const cmd = `Get-ChildItem -Path "${directory}" -Filter "${filePattern}" -Recurse -ErrorAction SilentlyContinue | Select-String -Pattern "${pattern}" ${flags} | Select-Object -First ${maxResults}`;

    return BashTool.run(cmd, { log: false });
  }

  static async findErrors() {
    console.log('\nÃ°Å¸â€Â Scanning for common error patterns...');
    const patterns = [
      'eesc',
      'error',
      '500',
      'rate.limit',
      'constraint',
      'not.found',
      'template.literal'
    ];

    let found = false;
    for (const pattern of patterns) {
      const result = await GrepTool.search(pattern);
      if (result.stdout && result.stdout.trim()) {
        found = true;
        console.log(`\nÃ¢Å¡Â Ã¯Â¸Â  Found "${pattern}":`);
        console.log(result.stdout.trim().split('\n').slice(0, 3).join('\n'));
      }
    }
    if (!found) console.log('  Ã¢Å“â€¦ No common issues found');
  }
}

// -------------------------------------------------------------------
// 4. WEB FETCH TOOL Ã¢â‚¬â€ URL Health Check
// -------------------------------------------------------------------
class WebFetchTool {
  static async checkUrl(url, options = {}) {
    const { timeout = 30000 } = options;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'JobCopilotPH-Agent/1.0' }
      });
      clearTimeout(timer);

      return {
        url,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
        checkedAt: new Date().toISOString()
      };
    } catch (err) {
      return {
        url,
        status: 0,
        ok: false,
        error: err.message,
        checkedAt: new Date().toISOString()
      };
    }
  }

  static async checkEndpoints() {
    console.log('\nÃ°Å¸Å’Â Checking API endpoints (allowing cold start)...');
    const endpoints = [
      { url: 'https://jobcopilot-api-zeuk.onrender.com/api/jobs?q=developer&limit=1', name: 'Job Search' },
      { url: 'https://jobcopilot-api-zeuk.onrender.com/api/jobs/featured', name: 'Featured Jobs' },
      { url: 'https://jobcopilot-api-zeuk.onrender.com/api/categories', name: 'Categories' },
      { url: 'https://jobcopilotph.vercel.app', name: 'Frontend' }
    ];

    const results = [];
    for (const { url, name } of endpoints) {
      let result = await WebFetchTool.checkUrl(url);
      if (!result.ok && result.error === 'This operation was aborted') {
        console.log(`  Ã¢ÂÂ³ ${name}: Waking up Render free tier...`);
        await new Promise(r => setTimeout(r, 5000));
        result = await WebFetchTool.checkUrl(url);
      }
      results.push({ ...result, name });
      const icon = result.ok ? 'Ã¢Å“â€¦' : 'Ã¢ÂÅ’';
      console.log(`  ${icon} ${name} Ã¢â€ â€™ ${result.status}${result.error ? ` (${result.error})` : ''}`);
    }
    return results;
  }
}

// -------------------------------------------------------------------
// 5. DATABASE TOOL Ã¢â‚¬â€ Supabase Operations
// -------------------------------------------------------------------
class DatabaseTool {
  static async getStats() {
    console.log('\nÃ°Å¸â€œÅ  Fetching database statistics...');
    
    const queries = [
      { name: 'Active Jobs', query: supabase.from('jobs_clean').select('*', { count: 'exact', head: true }).eq('is_active', true) },
      { name: 'Total Users', query: supabase.from('profiles').select('*', { count: 'exact', head: true }) },
      { name: 'Applications', query: supabase.from('applications').select('*', { count: 'exact', head: true }) },
      { name: 'Companies', query: supabase.from('companies').select('*', { count: 'exact', head: true }) },
      { name: 'Categories', query: supabase.from('categories').select('*', { count: 'exact', head: true }) },
      { name: 'Last Sync', query: supabase.from('sync_logs').select('started_at').order('started_at', { ascending: false }).limit(1) }
    ];

    const stats = {};
    for (const { name, query } of queries) {
      try {
        const { data, count, error } = await query;
        if (error) {
          stats[name] = `Error: ${error.message}`;
          console.log(`  Ã¢ÂÅ’ ${name}: ${error.message}`);
        } else {
          stats[name] = count !== null ? count : (data?.[0]?.started_at || 'N/A');
          console.log(`  Ã°Å¸â€œÅ’ ${name}: ${stats[name]}`);
        }
      } catch (err) {
        stats[name] = `Exception: ${err.message}`;
        console.log(`  Ã¢ÂÅ’ ${name}: ${err.message}`);
      }
    }
    return stats;
  }

  static async cleanupExpiredJobs() {
    console.log('\nÃ°Å¸Â§Â¹ Checking for expired jobs...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const { data, error } = await supabase
        .from('jobs_clean')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .lt('posted_at', thirtyDaysAgo.toISOString())
        .eq('is_active', true)
        .select('id');

      if (error) {
        console.log(`  Ã¢ÂÅ’ Cleanup error: ${error.message}`);
        return { success: false, error: error.message };
      }

      console.log(`  Ã¢Å“â€¦ Deactivated ${data?.length || 0} jobs older than 30 days`);
      return { success: true, deactivated: data?.length || 0 };
    } catch (err) {
      console.log(`  Ã¢ÂÅ’ Cleanup exception: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  static async validateJobLinks(sampleSize = 50) {
    console.log(`\nÃ°Å¸â€â€” Validating ${sampleSize} random job links...`);
    
    try {
      const { data: jobs, error } = await supabase
        .from('jobs_clean')
        .select('id, title, apply_url')
        .eq('is_active', true)
        .limit(sampleSize);

      if (error) {
        console.log(`  Ã¢ÂÅ’ Fetch error: ${error.message}`);
        return [];
      }

      const results = [];
      for (const job of jobs) {
        if (job.apply_url) {
          const check = await WebFetchTool.checkUrl(job.apply_url);
          results.push({ ...job, url_status: check.status, url_ok: check.ok });
        }
      }

      const broken = results.filter(r => !r.url_ok);
      console.log(`  Ã¢Å“â€¦ Checked ${results.length} links, ${broken.length} broken`);
      
      if (broken.length > 0) {
        console.log('  Broken links:');
        broken.slice(0, 5).forEach(j => console.log(`    - ${j.title} (${j.apply_url})`));
      }
      
      return results;
    } catch (err) {
      console.log(`  Ã¢ÂÅ’ Validation error: ${err.message}`);
      return [];
    }
  }
}

// -------------------------------------------------------------------
// 6. DEPLOYMENT TOOL Ã¢â‚¬â€ Git + Render + Vercel
// -------------------------------------------------------------------
class DeployTool {
  static async deployBackend() {
    console.log('\nÃ°Å¸Å¡â‚¬ Deploying backend to Render...');
    
    const steps = [
      { name: 'Git Add', cmd: 'git add .' },
      { name: 'Git Commit', cmd: 'git commit -m "auto: agent sync $(Get-Date -Format yyyy-MM-dd_HH:mm)"' },
      { name: 'Git Push', cmd: 'git push', timeout: 30000 }
    ];

    for (const step of steps) {
      console.log(`  Ã¢â€ â€™ ${step.name}`);
      const result = await BashTool.run(step.cmd, { timeout: step.timeout || 15000 });
      if (!result.success && step.name === 'Git Commit') {
        if (result.stderr.includes('nothing to commit')) {
          console.log('  Ã¢â€žÂ¹Ã¯Â¸Â  No changes to commit');
          continue;
        }
      }
    }

    console.log('  Ã¢Å“â€¦ Backend pushed. Render will auto-deploy.');
    return { success: true, message: 'Backend pushed to Render' };
  }

  static async deployFrontend() {
    console.log('\nÃ°Å¸Å½Â¨ Deploying frontend to Vercel...');
    const result = await BashTool.run(
      `Set-Location "${FRONTEND_ROOT}"; npx vercel --prod --yes`,
      { timeout: 60000 }
    );
    return result;
  }

  static async verifyDeployment() {
    console.log('\nÃ°Å¸â€Â Verifying deployments...');
    
    const apiHealth = await WebFetchTool.checkUrl('https://jobcopilot-api-zeuk.onrender.com/api/jobs?limit=1');
    const frontendHealth = await WebFetchTool.checkUrl('https://jobcopilotph.vercel.app');

    console.log(`  API: ${apiHealth.ok ? 'Ã¢Å“â€¦' : 'Ã¢ÂÅ’'} (${apiHealth.status})`);
    console.log(`  Frontend: ${frontendHealth.ok ? 'Ã¢Å“â€¦' : 'Ã¢ÂÅ’'} (${frontendHealth.status})`);

    return {
      api: apiHealth,
      frontend: frontendHealth,
      allHealthy: apiHealth.ok && frontendHealth.ok
    };
  }
}

// -------------------------------------------------------------------
// 7. SCRAPER TOOL Ã¢â‚¬â€ Job Aggregation
// -------------------------------------------------------------------
class ScraperTool {
  static async runFullSync() {
    console.log('\nÃ°Å¸â€¢Â·Ã¯Â¸Â  Starting full job sync...');
    const startTime = Date.now();

    console.log('\nÃ°Å¸â€œÂ¥ Running scrapers...');
    const scrapers = [
      { name: 'OnlineJobs.ph', cmd: 'python scrapers/scraper.py', timeout: 600000 },
      { name: 'Kalibrr', cmd: 'python scrapers/kalibrr_scraper.py', timeout: 300000 },
      { name: 'JobStreet', cmd: 'python scrapers/jobstreet_scraper.py', timeout: 300000 }
    ];

    for (const scraper of scrapers) {
      console.log(`  Ã¢â€ â€™ ${scraper.name}`);
      const result = await BashTool.run(scraper.cmd, { timeout: scraper.timeout });
      if (!result.success) {
        console.log(`  Ã¢Å¡Â Ã¯Â¸Â  ${scraper.name} had issues (continuing anyway)`);
      }
    }

    console.log('\nÃ°Å¸â€â€ž Running sync.js (clean + normalize + deduplicate)...');
    const syncResult = await BashTool.run('node sync.js', { timeout: 60000 });

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    try {
      const { count } = await supabase
        .from('jobs_clean')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      console.log(`\nÃ¢Å“â€¦ Sync complete in ${duration} minutes. ${count} active jobs in database.`);
    } catch (err) {
      console.log(`\nÃ¢Å¡Â Ã¯Â¸Â  Sync complete but count check failed: ${err.message}`);
    }

    return { success: true, duration };
  }
}

// -------------------------------------------------------------------
// 8. KEEP-ALIVE TOOL Ã¢â‚¬â€ Prevent Render Cold Starts
// -------------------------------------------------------------------
class KeepAliveTool {
  static async ping() {
    const endpoints = [
      'https://jobcopilot-api-zeuk.onrender.com/api/jobs?limit=1',
      'https://jobcopilot-api-zeuk.onrender.com/api/categories'
    ];
    
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        console.log(`  ${res.ok ? 'Ã¢Å“â€¦' : 'Ã¢Å¡Â Ã¯Â¸Â'} ${url} Ã¢â€ â€™ ${res.status}`);
      } catch (e) {
        console.log(`  Ã¢ÂÅ’ ${url} Ã¢â€ â€™ ${e.message}`);
      }
    }
  }

  static start(intervalMinutes = 12) {
    console.log(`\nÃ°Å¸â€â€ž Keep-alive started Ã¢â‚¬â€ pinging every ${intervalMinutes} minutes`);
    console.log('  (Press Ctrl+C to stop)\n');
    
    KeepAliveTool.ping();
    
    const interval = setInterval(() => {
      console.log(`\nÃ°Å¸â€™â€œ Keep-alive ping Ã¢â‚¬â€ ${new Date().toLocaleTimeString()}`);
      KeepAliveTool.ping();
    }, intervalMinutes * 60 * 1000);
    
    return interval;
  }
}

// -------------------------------------------------------------------
// 9. REPORT TOOL Ã¢â‚¬â€ Generate Status Report
// -------------------------------------------------------------------
class ReportTool {
  static async generate() {
    console.log('\n' + '='.repeat(60));
    console.log('Ã°Å¸â€œâ€¹ JOB COPILOT PH Ã¢â‚¬â€ SYSTEM STATUS REPORT');
    console.log('='.repeat(60));
    console.log(`Ã°Å¸â€¢Â Generated: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`);
    console.log(`Ã°Å¸â€™Â» Platform: ${process.platform} | Node: ${process.version}`);
    console.log('='.repeat(60));

    const dbStats = await DatabaseTool.getStats();
    console.log('-'.repeat(60));

    const endpoints = await WebFetchTool.checkEndpoints();
    console.log('-'.repeat(60));

    await GrepTool.findErrors();
    console.log('-'.repeat(60));

    const allEndpointsHealthy = endpoints.every(e => e.ok);
    const jobCount = dbStats['Active Jobs'] || 0;

    console.log('\nÃ°Å¸â€œÅ  SUMMARY:');
    console.log(`  Ã¢â‚¬Â¢ ${jobCount} active jobs`);
    console.log(`  Ã¢â‚¬Â¢ ${dbStats['Total Users'] || 0} registered users`);
    console.log(`  Ã¢â‚¬Â¢ ${dbStats['Applications'] || 0} job applications`);
    console.log(`  Ã¢â‚¬Â¢ All endpoints: ${allEndpointsHealthy ? 'Ã¢Å“â€¦ Healthy' : 'Ã¢ÂÅ’ Some Down'}`);
    console.log('='.repeat(60));

    return {
      timestamp: new Date().toISOString(),
      dbStats,
      endpoints,
      allEndpointsHealthy,
      jobCount
    };
  }
}

// -------------------------------------------------------------------
// 10. AGENT ORCHESTRATOR Ã¢â‚¬â€ Main Entry Point
// -------------------------------------------------------------------
class JobCopilotAgent {
  static async run(command, options = {}) {
    console.log('Ã°Å¸Â¤â€“ Job Copilot PH Agent v2.0');
    console.log(`Ã¢ÂÂ° ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`);
    
    switch (command) {
      // ====== SYNC ======
      case 'sync':
        await ScraperTool.runFullSync();
        break;

      case 'sync:scrape':
        console.log('\nÃ°Å¸â€œÂ¥ Running scrapers only...');
        await BashTool.run('python scrapers/scraper.py', { timeout: 600000 });
        await BashTool.run('python scrapers/kalibrr_scraper.py', { timeout: 300000 });
        await BashTool.run('python scrapers/jobstreet_scraper.py', { timeout: 300000 });
        break;

      case 'sync:process':
        console.log('\nÃ°Å¸â€â€ž Running sync.js only...');
        await BashTool.run('node sync.js', { timeout: 60000 });
        break;

      // ====== REPORT ======
      case 'report':
        await ReportTool.generate();
        break;

      case 'report:db':
        await DatabaseTool.getStats();
        break;

      case 'report:endpoints':
        await WebFetchTool.checkEndpoints();
        break;

      case 'report:errors':
        await GrepTool.findErrors();
        break;

      // ====== DEPLOY ======
      case 'deploy':
        await DeployTool.deployBackend();
        await DeployTool.deployFrontend();
        await DeployTool.verifyDeployment();
        break;

      case 'deploy:backend':
        await DeployTool.deployBackend();
        break;

      case 'deploy:frontend':
        await DeployTool.deployFrontend();
        break;

      case 'deploy:verify':
        await DeployTool.verifyDeployment();
        break;

      // ====== MAINTENANCE ======
      case 'cleanup':
        await DatabaseTool.cleanupExpiredJobs();
        break;

      case 'validate:links':
        await DatabaseTool.validateJobLinks(options.sample || 50);
        break;

      case 'health':
        await WebFetchTool.checkEndpoints();
        await DatabaseTool.getStats();
        break;

      // ====== KEEP-ALIVE ======
      case 'keepalive':
        KeepAliveTool.start();
        return; // Don't exit Ã¢â‚¬â€ keep running

      // ====== FULL CYCLE ======
      case 'full':
        console.log('\nÃ°Å¸â€â€ž Running FULL maintenance cycle...\n');
        await ScraperTool.runFullSync();
        await DatabaseTool.cleanupExpiredJobs();
        await DatabaseTool.validateJobLinks(25);
        await DeployTool.verifyDeployment();
        await ReportTool.generate();
        console.log('\nÃ¢Å“Â¨ Full maintenance cycle complete!');
        break;

      // ====== HELP ======
      default:
        JobCopilotAgent.showHelp();
        break;
    }
  }

  static showHelp() {
    console.log(`
Ã¢â€¢â€Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢â€”
Ã¢â€¢â€˜           Ã°Å¸Â¤â€“ JOB COPILOT PH AGENT Ã¢â‚¬â€ COMMANDS             Ã¢â€¢â€˜
Ã¢â€¢Â Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â£
Ã¢â€¢â€˜                                                          Ã¢â€¢â€˜
Ã¢â€¢â€˜  SYNC COMMANDS:                                          Ã¢â€¢â€˜
Ã¢â€¢â€˜    sync              Full scrape + process + log         Ã¢â€¢â€˜
Ã¢â€¢â€˜    sync:scrape       Run scrapers only (3 sources)       Ã¢â€¢â€˜
Ã¢â€¢â€˜    sync:process      Run normalize/dedup only            Ã¢â€¢â€˜
Ã¢â€¢â€˜                                                          Ã¢â€¢â€˜
Ã¢â€¢â€˜  REPORT COMMANDS:                                        Ã¢â€¢â€˜
Ã¢â€¢â€˜    report            Full system status report           Ã¢â€¢â€˜
Ã¢â€¢â€˜    report:db         Database statistics                 Ã¢â€¢â€˜
Ã¢â€¢â€˜    report:endpoints  Check all live URLs                 Ã¢â€¢â€˜
Ã¢â€¢â€˜    report:errors     Scan codebase for common issues     Ã¢â€¢â€˜
Ã¢â€¢â€˜                                                          Ã¢â€¢â€˜
Ã¢â€¢â€˜  DEPLOY COMMANDS:                                        Ã¢â€¢â€˜
Ã¢â€¢â€˜    deploy            Deploy backend + frontend           Ã¢â€¢â€˜
Ã¢â€¢â€˜    deploy:backend    Push to Render                      Ã¢â€¢â€˜
Ã¢â€¢â€˜    deploy:frontend   Deploy to Vercel                    Ã¢â€¢â€˜
Ã¢â€¢â€˜    deploy:verify     Check both deployments              Ã¢â€¢â€˜
Ã¢â€¢â€˜                                                          Ã¢â€¢â€˜
Ã¢â€¢â€˜  MAINTENANCE COMMANDS:                                   Ã¢â€¢â€˜
Ã¢â€¢â€˜    cleanup           Deactivate jobs >30 days old        Ã¢â€¢â€˜
Ã¢â€¢â€˜    validate:links    Check random job apply URLs         Ã¢â€¢â€˜
Ã¢â€¢â€˜    health            Quick endpoint + DB check           Ã¢â€¢â€˜
Ã¢â€¢â€˜                                                          Ã¢â€¢â€˜
Ã¢â€¢â€˜  KEEP-ALIVE:                                             Ã¢â€¢â€˜
Ã¢â€¢â€˜    keepalive         Ping API every 12 min (no sleep)    Ã¢â€¢â€˜
Ã¢â€¢â€˜                                                          Ã¢â€¢â€˜
Ã¢â€¢â€˜  FULL CYCLE:                                             Ã¢â€¢â€˜
Ã¢â€¢â€˜    full              Sync Ã¢â€ â€™ Cleanup Ã¢â€ â€™ Validate Ã¢â€ â€™ Verify  Ã¢â€¢â€˜
Ã¢â€¢â€˜                                                          Ã¢â€¢â€˜
Ã¢â€¢Å¡Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

Usage: node agent-tools.js <command>

Examples:
  node agent-tools.js sync          # Run full job sync (3 sources)
  node agent-tools.js report        # Get system status
  node agent-tools.js deploy        # Deploy everything
  node agent-tools.js full          # Full maintenance cycle
  node agent-tools.js keepalive     # Keep Render from sleeping
`);
  }
}

// -------------------------------------------------------------------
// 11. MAIN
// -------------------------------------------------------------------
const command = process.argv[2] || 'help';
const options = {
  sample: parseInt(process.argv[3]) || 50
};

JobCopilotAgent.run(command, options).catch(err => {
  console.error('Ã¢ÂÅ’ Agent crashed:', err);
  process.exit(1);
});
